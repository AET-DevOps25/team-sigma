import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
// Static client will be hosted on S3 + CloudFront instead of Fargate; remove ecs_patterns.
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
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

    // Security group for RDS instance – will allow traffic from internal services (rule added later)
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Allow Postgres access from ECS services',
      allowAllOutbound: true,
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
      securityGroups: [databaseSecurityGroup],
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

    // Allow ECS tasks to connect to the database
    databaseSecurityGroup.addIngressRule(
      internalServicesSecurityGroup,
      ec2.Port.tcp(5432),
      'PostgreSQL access from ECS services'
    );

    // Helper function to create a simple FargateService for internal services (no public load balancer)
    const createInternalService = (
      id: string,
      containerImage: ecs.ContainerImage,
      containerPort: number,
      environment?: { [key: string]: string },
      secrets?: { [key: string]: ecs.Secret },
    ): ecs.FargateService => {
      const taskDef = new ecs.FargateTaskDefinition(this, `${id}TaskDef`, {
        memoryLimitMiB: 512,
        cpu: 256,
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        },
      });

      const container = taskDef.addContainer(`${id}Container`, {
        image: containerImage,
        containerName: id.toLowerCase(),
        portMappings: [{ containerPort }],
        environment,
        secrets,
        logging: ecs.LogDrivers.awsLogs({ streamPrefix: id.toLowerCase() }),
      });

      const service = new ecs.FargateService(this, `${id}Service`, {
        cluster,
        taskDefinition: taskDef,
        desiredCount: 1,
        serviceName: id.toLowerCase(),
        securityGroups: [internalServicesSecurityGroup],
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        capacityProviderStrategies: [
          { capacityProvider: "FARGATE_SPOT", weight: 1 },
        ],
        minHealthyPercent: 0,
        cloudMapOptions: {
          name: id.toLowerCase(),
          dnsRecordType: cdk.aws_servicediscovery.DnsRecordType.SRV,
          container,
          containerPort,
        },
      });

      // Grant S3 access to task role
      documentBucket.grantReadWrite(taskDef.taskRole);

      // Grant access to database secret
      if (database.secret) {
        database.secret.grantRead(taskDef.taskRole);
      }

      return service;
    };

    // 3. Internal microservices (document, chat, summary, lecture, weaviate)
    const documentService = createInternalService(
      "DocumentService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "document-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      80,
      {
        SPRING_APPLICATION_NAME: "document-service",
        SERVER_PORT: "80",
        WEAVIATE_URL: "http://weaviate",
        AWS_REGION: this.region,
        S3_BUCKET_NAME: documentBucket.bucketName,
        POSTGRES_HOST: database.instanceEndpoint.hostname,
        POSTGRES_PORT: database.instanceEndpoint.port.toString(),
        POSTGRES_DB: 'teamsgima',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      },
      {
        POSTGRES_USER: ecs.Secret.fromSecretsManager(database.secret!, 'username'),
        POSTGRES_PASSWORD: ecs.Secret.fromSecretsManager(database.secret!, 'password'),
      }
    );

    const chatService = createInternalService(
      "ChatService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "chat-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      80,
      {
        SPRING_APPLICATION_NAME: "chat-service",
        SERVER_PORT: "80",
        ENVIRONMENT: "docker",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      }
    );

    const summaryService = createInternalService(
      "SummaryService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "summary-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      80,
      {
        SPRING_APPLICATION_NAME: "summary-service",
        SERVER_PORT: "80",
        ENVIRONMENT: "docker",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      }
    );

    const lectureService = createInternalService(
      "LectureService",
      ecs.ContainerImage.fromAsset(
        path.join(REPO_ROOT, "server", "lecture-service"),
        {
          platform: ecr_assets.Platform.LINUX_AMD64,
        }
      ),
      80,
      {
        SPRING_APPLICATION_NAME: "lecture-service",
        SERVER_PORT: "80",
        POSTGRES_HOST: database.instanceEndpoint.hostname,
        POSTGRES_PORT: database.instanceEndpoint.port.toString(),
        POSTGRES_DB: 'teamsgima',
      },
      {
        POSTGRES_USER: ecs.Secret.fromSecretsManager(database.secret!, 'username'),
        POSTGRES_PASSWORD: ecs.Secret.fromSecretsManager(database.secret!, 'password'),
      }
    );

    const weaviateService = createInternalService(
      "Weaviate",
      ecs.ContainerImage.fromRegistry(
        "cr.weaviate.io/semitechnologies/weaviate:stable-v1.31-9900730"
      ),
      80,
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

    // 4. Managed AWS HTTP API Gateway replacing the nginx-based gateway
    const httpApi = new apigwv2.HttpApi(this, 'TeamSigmaHttpApi', {
      apiName: 'team-sigma-http-api',
      description: 'HTTP API Gateway for Team Sigma services',
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
      },
      createDefaultStage: false,
    });

    // Access logging setup
    const accessLogGroup = new logs.LogGroup(this, 'HttpApiAccessLogs');

    const defaultStage = new apigwv2.HttpStage(this, 'DefaultStage', {
      httpApi,
      stageName: '$default',
      autoDeploy: true,
      accessLogSettings: {
        destination: new apigwv2.LogGroupLogDestination(accessLogGroup),
        format: apigw.AccessLogFormat.jsonWithStandardFields({
          ip: true,
          caller: true,
          user: true,
          requestTime: true,
          httpMethod: true,
          resourcePath: true,
          status: true,
          protocol: true,
          responseLength: true,
        }),
      },
    });

    // VPC Link that allows the HTTP API to reach private ECS services
    const vpcLink = new apigwv2.VpcLink(this, 'InternalServicesVpcLink', {
      vpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [internalServicesSecurityGroup],
    });

    httpApi.addRoutes({
      path: '/api/documents/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2Integrations.HttpServiceDiscoveryIntegration(
        'DocumentIntegration',
        documentService.cloudMapService!,
        { vpcLink },
      ),
    });

    httpApi.addRoutes({
      path: '/api/chat/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2Integrations.HttpServiceDiscoveryIntegration(
        'ChatIntegration',
        chatService.cloudMapService!,
        { vpcLink },
      ),
    });

    httpApi.addRoutes({
      path: '/api/summary/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2Integrations.HttpServiceDiscoveryIntegration(
        'SummaryIntegration',
        summaryService.cloudMapService!,
        { vpcLink },
      ),
    });

    httpApi.addRoutes({
      path: '/api/lectures/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2Integrations.HttpServiceDiscoveryIntegration(
        'LectureIntegration',
        lectureService.cloudMapService!,
        { vpcLink },
      ),
    });

    httpApi.addRoutes({
      path: '/api/weaviate/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2Integrations.HttpServiceDiscoveryIntegration(
        'WeaviateIntegration',
        weaviateService.cloudMapService!,
        { vpcLink },
      ),
    });

    // 5. Client static website hosted on S3 and served through CloudFront
    const clientBucket = new s3.Bucket(this, 'ClientBucket', {
      bucketName: `team-sigma-client-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev/test
      autoDeleteObjects: true, // for dev/test
    });

    // Allow CloudFront to access the bucket
    const oai = new cloudfront.OriginAccessIdentity(this, 'ClientOAI');
    clientBucket.grantRead(oai);

    // Extract the API Gateway domain (strip protocol and path)
    const apiDomain = cdk.Fn.select(2, cdk.Fn.split('/', httpApi.apiEndpoint));

    const distribution = new cloudfront.Distribution(this, 'ClientDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(clientBucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      additionalBehaviors: {
        'api/*': {
          origin: new cloudfrontOrigins.HttpOrigin(apiDomain),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
    });

    // Build the React app during CDK bundling using Bun and deploy
    const clientBuildSource = s3deploy.Source.asset(path.join(REPO_ROOT, 'client'), {
      bundling: {
        image: cdk.DockerImage.fromRegistry('oven/bun:1.2-alpine'),
        // The bundler runs inside the container; output must be in /asset-output
        command: [
          'sh', '-c', [
            'bun i --frozen-lockfile',
            // Provide the API gateway URL at build time; if token not resolved it will default to empty string.
            `export VITE_API_GATEWAY_URL=${defaultStage.url}`,
            'bun run build',
            'cp -r dist/* /asset-output/'
          ].join(' && ')
        ],
        environment: {
          // Provide any additional vars expected by env.ts at build time
          VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY ?? '',
        },
      },
    });

    new s3deploy.BucketDeployment(this, 'DeployClient', {
      sources: [clientBuildSource],
      destinationBucket: clientBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the database endpoint and S3 bucket for reference
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS Database endpoint',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: documentBucket.bucketName,
      description: 'S3 bucket for document storage',
    });

    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: defaultStage.url,
      description: 'HTTP API Gateway URL',
    });

    new cdk.CfnOutput(this, 'ClientSiteUrl', {
      value: `https://${distribution.domainName}`,
      description: 'Client CloudFront URL',
    });

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
