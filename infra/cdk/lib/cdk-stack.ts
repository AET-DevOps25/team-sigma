import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// Path to repository root (three levels up from this file: lib -> cdk -> infra -> team-sigma root)
const REPO_ROOT = path.resolve(__dirname, "../../../");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // 1. Networking
    // Update VPC to include private subnets for RDS
    const vpc = new ec2.Vpc(this, 'TeamSigmaVpc', {
      maxAzs: 2,
      natGateways: 1, // Add 1 NAT Gateway for service discovery to work
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'private-isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Add VPC endpoints so tasks can reach AWS services without NAT Gateway
    vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    vpc.addInterfaceEndpoint('EcrEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    vpc.addInterfaceEndpoint('SsmEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
    });

    // Create S3 bucket for document storage
    const documentBucket = new s3.Bucket(this, 'DocumentBucket', {
      bucketName: `team-sigma-documents-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev/test
      autoDeleteObjects: true, // for dev/test
    });

    // Create RDS database
    const dbCredentials = rds.Credentials.fromGeneratedSecret('postgres', {
      secretName: 'team-sigma-db-credentials',
    });

    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // cheapest
      credentials: dbCredentials,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      databaseName: 'teamsgima',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev/test
      deleteAutomatedBackups: true, // for dev/test
      backupRetention: cdk.Duration.days(0), // no backups for cost savings
    });

    // 2. ECS Cluster with Cloud Map service discovery so that the microservices can reach each other via DNS (e.g. http://eureka:8761)
    const cluster = new ecs.Cluster(this, "TeamSigmaCluster", {
      vpc,
      defaultCloudMapNamespace: {
        name: "team-sigma.local",
        type: cdk.aws_servicediscovery.NamespaceType.DNS_PRIVATE,
      },
    });

    // Create a security group for internal service communication
    const internalServicesSecurityGroup = new ec2.SecurityGroup(this, 'InternalServicesSecurityGroup', {
      vpc,
      description: 'Security group for internal ECS services communication',
      allowAllOutbound: true,
    });

    // Allow all internal services to communicate with each other
    internalServicesSecurityGroup.addIngressRule(
      internalServicesSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow communication between internal services'
    );

    // Helper function to create a simple FargateService for internal services (no public load balancer)
    const createInternalService = (
      id: string,
      containerImage: ecs.ContainerImage,
      containerPort: number,
      environment?: { [key: string]: string },
    ) => {
      const taskDef = new ecs.FargateTaskDefinition(this, `${id}TaskDef`, {
        memoryLimitMiB: 512, // lowest allowed for 0.25 vCPU
        cpu: 256, // 0.25 vCPU (cheapest)
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        },
      });

      taskDef.addContainer(`${id}Container`, {
        image: containerImage,
        containerName: id.toLowerCase(),
        portMappings: [{ containerPort }],
        environment,
        logging: ecs.LogDrivers.awsLogs({ streamPrefix: id.toLowerCase() }),
      });

      new ecs.FargateService(this, `${id}Service`, {
        cluster,
        taskDefinition: taskDef,
        desiredCount: 1,
        serviceName: id.toLowerCase(),
        securityGroups: [internalServicesSecurityGroup],
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, // Move to private subnets for DNS resolution
        capacityProviderStrategies: [
          { capacityProvider: "FARGATE_SPOT", weight: 1 }, // use spot pricing
        ],
        minHealthyPercent: 0, // don't spin up extra tasks during deploys
        cloudMapOptions: {
          name: id.toLowerCase(),
        },
      });

      // Grant S3 access to task role
      documentBucket.grantReadWrite(taskDef.taskRole);
      
      // Grant access to database secret
      if (database.secret) {
        database.secret.grantRead(taskDef.taskRole);
      }
    };

    // 3. API Gateway (public, behind ALB)
    const apiGatewayImage = ecs.ContainerImage.fromAsset(
      path.join(REPO_ROOT, "server", "api-gateway"),
      {
        platform: ecr_assets.Platform.LINUX_AMD64,
      }
    );

    const apiGatewayService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "ApiGatewayService",
        {
          cluster,
          desiredCount: 1,
          publicLoadBalancer: true,
          securityGroups: [internalServicesSecurityGroup],
          capacityProviderStrategies: [
            { capacityProvider: "FARGATE_SPOT", weight: 1 },
          ],
          minHealthyPercent: 0,
          memoryLimitMiB: 512,
          cpu: 256,
          taskImageOptions: {
            image: apiGatewayImage,
            containerPort: 8080,
            environment: {
              SPRING_APPLICATION_NAME: "api-gateway",
              SERVER_PORT: "8080",
              // Eureka configuration
              EUREKA_CLIENT_ENABLED: "true",
              EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: "http://eureka:8761/eureka",
            },
          },
        }
      );

    // Configure health check for the API Gateway
    apiGatewayService.targetGroup.configureHealthCheck({
      path: '/actuator/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // Register API Gateway with service discovery manually
    apiGatewayService.service.enableCloudMap({
      name: 'api-gateway',
      cloudMapNamespace: cluster.defaultCloudMapNamespace,
    });

    // // 5. Client (React SPA served via nginx, public)
    // const clientImage = ecs.ContainerImage.fromAsset(
    //   path.join(REPO_ROOT, "client"),
    //   {
    //     platform: ecr_assets.Platform.LINUX_AMD64,
    //   }
    // );

    // const clientService =
    //   new ecs_patterns.ApplicationLoadBalancedFargateService(
    //     this,
    //     "ClientService",
    //     {
    //       cluster,
    //       desiredCount: 1,
    //       publicLoadBalancer: true,
    //       securityGroups: [internalServicesSecurityGroup],
    //       capacityProviderStrategies: [
    //         { capacityProvider: "FARGATE_SPOT", weight: 1 },
    //       ],
    //       minHealthyPercent: 0,
    //       memoryLimitMiB: 512,
    //       cpu: 256,
    //       taskImageOptions: {
    //         image: clientImage,
    //         containerPort: 80,
    //         environment: {
    //           API_GATEWAY_URL: `http://${apiGatewayService.loadBalancer.loadBalancerDnsName}`,
    //         },
    //       },
    //     }
    //   );

    // 4. Eureka Service Registry
    createInternalService(
      "Eureka",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "eureka"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      8761,
      {
        SPRING_APPLICATION_NAME: "eureka",
        SERVER_PORT: "8761",
        EUREKA_CLIENT_REGISTER_WITH_EUREKA: "false",
        EUREKA_CLIENT_FETCH_REGISTRY: "false",
        EUREKA_SERVER_ENABLE_SELF_PRESERVATION: "false",
      }
    );

    // 5. Remaining internal microservices (document, chat, lecture, weaviate)
    createInternalService(
      "DocumentService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "document-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      8080,
      {
        SPRING_APPLICATION_NAME: "document-service",
        SERVER_PORT: "8080",
        WEAVIATE_URL: "http://weaviate:8080",
        // S3 configuration
        AWS_REGION: this.region,
        S3_BUCKET_NAME: documentBucket.bucketName,
        // RDS configuration
        DB_HOST: database.instanceEndpoint.hostname,
        DB_PORT: database.instanceEndpoint.port.toString(),
        DB_NAME: 'teamsgima',
        DB_SECRET_ARN: database.secret?.secretArn ?? '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        // Eureka configuration
        EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: "http://eureka:8761/eureka",
      }
    );

    createInternalService(
      "ChatService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "chat-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      8082,
      {
        SPRING_APPLICATION_NAME: "chat-service",
        SERVER_PORT: "8082",
        ENVIRONMENT: "docker",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        // Eureka configuration
        EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: "http://eureka:8761/eureka",
      }
    );

    createInternalService(
      "SummaryService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "summary-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      8084,
      {
        SPRING_APPLICATION_NAME: "summary-service",
        SERVER_PORT: "8084",
        ENVIRONMENT: "docker",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        // Eureka configuration
        EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: "http://eureka:8761/eureka",
      }
    );

    createInternalService(
      "LectureService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "lecture-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      8083,
      {
        SPRING_APPLICATION_NAME: "lecture-service",
        SERVER_PORT: "8083",
        // RDS configuration
        DB_HOST: database.instanceEndpoint.hostname,
        DB_PORT: database.instanceEndpoint.port.toString(),
        DB_NAME: 'teamsgima',
        DB_SECRET_ARN: database.secret?.secretArn ?? '',
        // Eureka configuration
        EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: "http://eureka:8761/eureka",
      }
    );

    createInternalService(
      "Weaviate",
      ecs.ContainerImage.fromRegistry(
        "cr.weaviate.io/semitechnologies/weaviate:stable-v1.31-9900730"
      ),
      8080,
      {
        QUERY_DEFAULTS_LIMIT: "25",
        AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: "true",
        PERSISTENCE_DATA_PATH: "/var/lib/weaviate",
        DEFAULT_VECTORIZER_MODULE: "text2vec-openai",
        ENABLE_MODULES: "text2vec-openai,generative-openai",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        CLUSTER_HOSTNAME: "node1",
      }
    );

    // Output the database endpoint and S3 bucket for reference
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS Database endpoint',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: documentBucket.bucketName,
      description: 'S3 bucket for document storage',
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: apiGatewayService.loadBalancer.loadBalancerDnsName,
      description: 'API Gateway Load Balancer URL',
    });

    // new cdk.CfnOutput(this, 'ClientUrl', {
    //   value: clientService.loadBalancer.loadBalancerDnsName,
    //   description: 'Client Load Balancer URL',
    // });

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
