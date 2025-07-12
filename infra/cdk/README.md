# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## 🚀 Deployment guide

These steps assume you already have:

1. An AWS account and an IAM user/role with permissions to deploy CDK stacks (CloudFormation, ECS, ECR, VPC, ELB, IAM, etc.).
2. `aws` CLI configured (`aws configure` or an SSO profile).
3. Docker running (the CDK builds your local micro-service images before pushing them to ECR).
4. An OpenAI API key – the same value will be passed to both `OPENAI_API_KEY` (Java services, Python / Weaviate).

### 1. Install dependencies & compile

```bash
cd infra/cdk
npm install      # installs aws-cdk libraries & dev deps
npm run build    # tsc compile
```

### 2. Bootstrap the account (first time **per account/region**)

```bash
# Pick your profile & region (or use AWS default profile)
AWS_PROFILE=myprofile AWS_REGION=eu-central-1 \
  npx aws-cdk@latest bootstrap
```

### 3. Review the changes

```bash
npx aws-cdk@latest diff
```

### 4. Deploy 🚢

```bash
# Provide the OpenAI key for every container that needs it
export OPENAI_API_KEY=<your-openai-key>
export OPENAI_API_KEY=$OPENAI_API_KEY

# Optionally choose profile/region
AWS_PROFILE=myprofile AWS_REGION=eu-central-1 \
  npx aws-cdk@latest deploy
```

### 5. Cleaning up

To avoid ongoing charges when you're finished:

```bash
npx aws-cdk@latest destroy
```

### Cost-saving defaults

The stack is configured to be **as cheap as possible** by default:

- Single-AZ VPC with **no NAT Gateways**.
- All ECS tasks run on **`FARGATE_SPOT`** (up to ~70 % cheaper).
- 0.25 vCPU / 512 MiB per task.
- `minHealthyPercent` set to 0 so deployments don't double capacity.

Feel free to adjust those settings in `lib/cdk-stack.ts` before deploying to production.
