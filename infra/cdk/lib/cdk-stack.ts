import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// Path to repository root (three levels up from this file: lib -> cdk -> infra -> team-sigma root)
const REPO_ROOT = path.resolve(__dirname, "../../../");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // 1. Networking
    const vpc = new ec2.Vpc(this, "TeamSigmaVpc", {
      maxAzs: 2, // need at least two AZs for ALB subnets
      natGateways: 0, // still avoid NAT costs
      subnetConfiguration: [
        {
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
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

    // 2. ECS Cluster with Cloud Map service discovery so that the microservices can reach each other via DNS (e.g. http://eureka:8761)
    const cluster = new ecs.Cluster(this, "TeamSigmaCluster", {
      vpc,
      defaultCloudMapNamespace: {
        name: "team-sigma.local",
      },
    });

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
        capacityProviderStrategies: [
          { capacityProvider: "FARGATE_SPOT", weight: 1 }, // use spot pricing
        ],
        minHealthyPercent: 0, // don't spin up extra tasks during deploys
        cloudMapOptions: {
          name: id.toLowerCase(),
        },
      });
    };

    // 3. Eureka service (internal)
    createInternalService(
      "Eureka",
      ecs.ContainerImage.fromAsset(path.join(REPO_ROOT, "server", "eureka"), {
        platform: ecr_assets.Platform.LINUX_AMD64,
      }),
      8761,
      {
        SPRING_APPLICATION_NAME: "eureka",
        SERVER_PORT: "8761",
        EUREKA_CLIENT_REGISTER_WITH_EUREKA: "false",
        EUREKA_CLIENT_FETCH_REGISTRY: "false",
      }
    );

    // 4. API Gateway (public, behind ALB)
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
              EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:
                "http://eureka.team-sigma.local:8761/eureka/",
            },
          },
        }
      );

    // 5. Client (React SPA served via nginx, public)
    const clientImage = ecs.ContainerImage.fromAsset(
      path.join(REPO_ROOT, "client"),
      {
        platform: ecr_assets.Platform.LINUX_AMD64,
      }
    );

    const clientService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "ClientService",
        {
          cluster,
          desiredCount: 1,
          publicLoadBalancer: true,
          capacityProviderStrategies: [
            { capacityProvider: "FARGATE_SPOT", weight: 1 },
          ],
          minHealthyPercent: 0,
          memoryLimitMiB: 512,
          cpu: 256,
          taskImageOptions: {
            image: clientImage,
            containerPort: 80,
          },
        }
      );

    // 6. Remaining internal microservices (document, chat, lecture, weaviate, minio, postgres)
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
        EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:
          "http://eureka.team-sigma.local:8761/eureka/",
        WEAVIATE_URL: "http://weaviate.team-sigma.local:8080",
        MINIO_URL: "http://minio.team-sigma.local:9000",
        MINIO_ACCESS_KEY: "minioadmin",
        MINIO_SECRET_KEY: "minioadmin",
        POSTGRES_HOST: "postgres.team-sigma.local",
        POSTGRES_PORT: "5432",
        POSTGRES_DB: "document_db",
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "postgres",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
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
        EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:
          "http://eureka.team-sigma.local:8761/eureka/",
        ENVIRONMENT: "docker",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
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
        EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:
          "http://eureka.team-sigma.local:8761/eureka/",
        POSTGRES_HOST: "postgres.team-sigma.local",
        POSTGRES_PORT: "5432",
        POSTGRES_DB: "lecture_db",
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "postgres",
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

    createInternalService(
      "Minio",
      ecs.ContainerImage.fromRegistry(
        "minio/minio:RELEASE.2025-05-24T17-08-30Z"
      ),
      9000,
      {
        MINIO_ROOT_USER: "minioadmin",
        MINIO_ROOT_PASSWORD: "minioadmin",
      }
    );

    createInternalService(
      "Postgres",
      ecs.ContainerImage.fromRegistry("postgres:15-alpine"),
      5432,
      {
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "postgres",
        POSTGRES_DB: "postgres",
      }
    );

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
