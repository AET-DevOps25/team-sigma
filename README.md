# Nemo - an AI-Powered Study Assistant

This project is a study companion designed to make exam preparation more interactive and efficient. It combines generative AI with a clean document structure to help break down complex topics and support deeper understanding.

Students can organize their materials into lectures (essentially folders), upload slides or documents for each lecture, and receive an AI-generated summary, quiz questions, and a personalized chat interface per document.

## What It Does

The application helps students study smarter by turning their lecture content into something more interactive. It gives students a focused way to prepare without having to dig through long PDFs or take extensive notes on their own. Here’s what it offers:

**Lecture-Based Organization** \
Students can create lectures (which act like folders) and upload multiple documents or slide decks to each one.

**AI Support** \
Each uploaded file gets its own set of tools:

- A concise summary that covers the main points.
- Quiz questions generated from the content, so the students can test themselves.
- A chat interface that lets the students ask questions about that document and get relevant answers from the AI.

## Integration of Generative AI

Behind the scenes, the application uses three separate Python microservices to process and work with the uploaded documents:

1. Chat Service
   This service powers the interactive Q&A feature. When a student asks a question about a specific document, the system looks through that document’s content (broken into smaller chunks and stored in a vector database) to find the most relevant parts. It also keeps track of previous messages to respond in a way that fits the ongoing conversation.
2. Summary Service
   When a document is uploaded, this service creates a short summary that captures the main ideas. It’s helpful for quick reviews or getting an overview before diving into the details.
3. Quiz Service
   This one reads through the content of a slide deck or document and creates quiz questions from it. The questions are meant to help students actively test what they’ve understood so far.

## Functional Scenarios

**AI Summary Generation**:
A student uploads slides from a lecture on “Network Security”. The summary service processes the slides and provides a concise overview of the key topics, including cryptographic protocols, threats, and countermeasures.

**Slide-Specific Questioning**:
After reviewing the slides, a student feels uncertain about one topic and asks, “Can you explain the difference between symmetric and asymmetric encryption?” The chat service responds with a detailed answer based on the relevant slide content, maintaining context from earlier questions in the conversation.

**Knowledge Assessment through Quizzing**:
To check their understanding, the student switches over to the quiz feature. The quiz service generates multiple questions about the uploaded slides.

## Components and Responsibilities (System Design)

### 1. Client (React, Vite, TypeScript, ShadCN, TailwindCSS)

### Responsible Students:

Maria Pospelova, Alexander Steinhauer, Simon Huang

### Core Functionality

**Clerk-based Authentication** \
Users log in securely using Clerk.

**Lecture Management** \
Users can view, create, update, and delete their own lectures.

**Document Upload and Editing** \
For each lecture, users can upload documents (e.g., slide decks) and optionally set a display name and description during the upload process. Each document can later be downloaded, renamed, or removed.

**Interactive Study Interface** \
Once a document is uploaded, users can switch between three tabs:
• _Summary_ – View an AI-generated summary of the content
• _Quiz_ – Practice with automatically generated questions
• _Chat_ – Ask questions directly to the LLM about the content for clarification

### 2. API Gateway (nginx)

### Responsible Students:

Alexander Steinhauer

### Core Functionality

**Service Routing** \
Routes API requests to appropriate internal services (chat, documents, lectures, quiz, summary).

### 3. Document Microservice (Spring Boot)

### Responsible Students:

Simon Huang

### Core Functionality

**Chunking & Embedding** \
Uploaded documents are split into smaller, manageable chunks. These chunks are then embedded and stored in a Weaviate vector database.

**Metadata Management** \
Supports full CRUD operations (create, read, update, delete) for document metadata using a PostgreSQL database.

**Similarity Search** \
Provides an endpoint for retrieving document chunks most relevant to a given user query. Used primarily by the chat microservice to generate context-aware responses.

### 4. Lecture Microservice (Spring Boot)

### Responsible Students:

Maria Pospelova

### Core Functionality

**Lecture Management** \
Provides full CRUD operations for lectures, allowing users to create, update, delete, and view their own lecture folders.

**Document Association** \
Each uploaded document is linked to a specific lecture. This ensures that documents are organized and can be retrieved or displayed in the correct lecture context.

### 5. Chat Microservice (Python with FastAPI + LangChain)

### Responsible Students:

Maria Pospelova

### Core Functionality

**RAG-based AI Chat** \
Combines OpenAI’s GPT model with a Retrieval-Augmented Generation (RAG) approach. Relevant document chunks are retrieved based on user queries and paired with recent conversation history to generate context-aware responses.

**Document Integration** \
Performs similarity search on document chunks by connecting to document microservice.

### 6. Summary Microservice (Python with FastAPI + LangChain)

### Responsible Students:

Maria Pospelova

### Core Functionality

**AI-Powered Document Summarization** \
Generates structured summaries using OpenAI’s GPT model, targeting 10–20% of the original length. Uses markdown for formatting.

**Document Integration** \
Combines all document chunks into a single text while preserving context and structure to ensure accurate summarization.

### 7. Quiz Microservice (Python with FastAPI + LangChain)

### Responsible Students:

Alexander Steinhauer

### Core Functionality

**AI-Powered Quiz Generation** \
Generates interactive quiz questions from uploaded documents using GenAI service. Each quiz question includes:
- Multiple choice format (4 options)
- Correct answer identification
- Detailed explanation for the answer
- Focus on exam-relevant content

**Document Integration**
- Downloads document content via document service
- Processes entire document to ensure comprehensive coverage
- Maintains context while generating questions

### 8. GenAI Microservicex
### Responsible Students:
Alexander Steinhauer

### Core Functionality

**Google Gemini Integration** \
Provides a unified interface to Google's Gemini AI models. Used by chat microservice, quiz microservice, summary microservice.

### 9. Database (PostgreSQL)

### Responsible Students:

Simon Huang

`lecture_db`: Stores lecture objects. \
`document_db`: Stores document metadata. Has reference to corresponding lecture. Chat conversation is stored here as well.

### 10. Vector Database (Weaviate)

### Responsible Students:

Simon Huang

### Core Functionality

Stores embedded chunks created from uploaded PDF documents. The chunks are used by chat microservice, summary microservice, and quiz microservice.

### 11. Document File Storage (Minio)

### Responsible Students:

Simon Huang

### Core Functionality

Stores PDF files belonging to uploaded documents. The documents can be downloaded from here.

### 12. DevOps

### Responsible Students:

Alexander Steinhauer, Simon Huang

### Core Functionality

- **Container Orchestration & Deployment**
  - Kubernetes deployment using Helm charts for all microservices
  - AWS ECS (Fargate) deployment option with CDK
  - Docker containerization for all services
  - Infrastructure-as-Code using AWS CDK and Helm

- **CI/CD Pipeline (GitHub Actions)**
  - Automated PR validation with Conventional Commits enforcement
  - Automated testing for all services
  - Container image building and publishing to GHCR
  - Automated Kubernetes deployments
  - Zero-downtime rolling updates

- **Infrastructure Management**
  - AWS cloud infrastructure with VPC, ECS, RDS, S3, CloudFront
  - Kubernetes cluster management with Helm
  - Secrets management using AWS Secrets Manager and Kubernetes secrets
  - Load balancing and service discovery

### 13. Authentication (Clerk)

### Responsible Students:

Alexander Steinhauer

### Core Functionality

Manages secure user login via email and code.

### 14. Monitoring & Observability (Prometheus & Grafana)

### Responsible Students:

Maria Pospelova

### Core Functionality

Tracks system metrics, displays them in Grafana dashboards, alerts on exceptions.

## Technologies

| Component                  | Technology                       |
| -------------------------- | -------------------------------- |
| Client                     | React, Vite, ShadCN, TailwindCSS |
| API Gateway                | nginx                            |
| Document Microservice      | Spring Boot, Java                |
| Lecture Microservice       | Spring Boot, Java                |
| Chat Microservice          | Python, FastAPI, LangChain       |
| Summary Microservice       | Python, FastAPI, LangChain       |
| Quiz Microservice          | Python, FastAPI, LangChain       |
| Database                   | PostgreSQL                       |
| Vector Database            | Weaviate                         |
| Document File Storage      | Minio, s3                        |
| DevOps                     | Docker, Kubernetes, CI/CD, AWS   |
| Authentication             | Clerk                            |
| Monitoring & Observability | Prometheus, Grafana              |
| GenAI Microservice         | Python, Langchain                |

## API Documentation

## Document Service (`/api/documents`)

[Swagger UI](http://localhost:8080/api/documents/swagger-ui/index.html)

- `GET /api/documents/` - Get all documents (optional `lectureId` query param)
- `POST /api/documents/upload` - Upload a new document (multipart form data)
- `GET /api/documents/{id}` - Get document by ID
- `PUT /api/documents/{id}` - Update document metadata
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/download` - Download document file
- `GET /api/documents/search/similar` - Find similar documents using vector similarity
- `GET /api/documents/{id}/chunks` - Get all chunks for a document
- `POST /api/documents/{id}/conversation` - Add message to document conversation
- `DELETE /api/documents/{id}/conversation` - Clear document conversation
- `DELETE /api/documents/lecture/{lectureId}` - Delete all documents for a lecture

## Lecture Service (`/api/lectures`)

[Swagger UI](http://localhost:8080/api/lectures/swagger-ui.html)

- `GET /api/lectures/health` - Health check endpoint
- `POST /api/lectures` - Create a new lecture
- `GET /api/lectures/user/{userId}` - Get lectures by user ID
- `GET /api/lectures/{id}` - Get lecture by ID
- `PUT /api/lectures/{id}` - Update lecture
- `DELETE /api/lectures/{id}` - Delete lecture
- `GET /api/lectures` - Get all lectures

## GenAI Service (`/api/genai`)

[Swagger UI](http://localhost:8080/api/genai/swagger-ui.html)

- `POST /api/genai/generate-content` - Generate content using Google Gemini models
  - Request body: `GenerateContentRequest`
  - Returns generated content in `GenerateContentResponse`

## Chat Service (`/api/chat`)

[Swagger UI](http://localhost:8080/api/chat/swagger-ui.html)

- `GET /api/chat/health` - Health check endpoint
- `POST /api/chat` - Send a message and get AI response
  - Request body: `{ "message": string, "document_id"?: string }`
- `GET /api/documents/{document_id}` - Get document information

## Summary Service (`/api/summary`)

[Swagger UI](http://localhost:8080/api/summary/swagger-ui.html)

- `GET /api/summary/health` - Health check endpoint
- `POST /api/summary` - Generate document summary
  - Request body: `{ "document_id": string }`
  - Returns AI-generated summary of document content

## Quiz Service (`/api/quiz`)

[Swagger UI](http://localhost:8080/api/quiz/swagger-ui.html)

- `POST /api/quiz/{document_id}` - Generate quiz questions for a document
  - Path parameter: `document_id` (string)
  - Returns a list of `QuizQuestion` objects generated from the document

All endpoints are accessed through the API Gateway running on port 8080. Authentication is handled via Clerk, and appropriate authentication headers must be included with requests.

## Requirements

### Functional Requirements

#### User Management

- Users can sign up and log in securely using Clerk authentication

#### Lecture Management

- Users can create, view, update, and delete lectures
- Users can organize multiple documents within each lecture

#### Document Management

- Users can upload PDF documents and slide decks
- Users can view, rename, and delete uploaded documents
- Users can download original documents
- Users can edit document metadata (name, description)

#### AI-Powered Features

- System generates concise summaries of uploaded documents (10-20% of original length)
- System creates interactive quiz questions from document content
- Users can engage in context-aware chat about specific documents
- Chat system maintains conversation history per document
- System provides relevant answers based on document content using RAG

#### Navigation

- Users can navigate between lectures and their contained documents

### Non-Functional Requirements

#### Performance

- API Gateway handles routing with minimal latency
- Vector similarity search returns results in under 2 seconds
- Document upload and processing completes within reasonable time

#### Scalability

- Microservices architecture enables independent scaling
- Docker containerization supports easy deployment
- Kubernetes-ready for cloud deployment
- Separate databases per service for independent data storage

#### Security

- Clerk-based authentication for all endpoints
- Secure document storage in MinIO
- Cross-Origin Resource Sharing (CORS) configured
- Environment variables for sensitive configuration

#### Reliability

- Health check endpoints for all services
- Prometheus metrics for monitoring
- Grafana dashboards for visualization
- Error handling and logging across services

#### Maintainability

- Clear separation of concerns via microservices
- Consistent code style and organization
- Comprehensive API documentation
- Docker Compose for local development
- Makefile for common operations

#### Data Management

- Vector embeddings for semantic search (Weaviate)
- Efficient document chunking for RAG
- Persistent conversation history
- Secure file storage (MinIO)
- Relational data in PostgreSQL

## Monitoring and Observability

Nemo implements comprehensive monitoring using Prometheus and Grafana, providing real-time observability across all microservices.
The Grafana dashboards can be accessed at `localhost:3001` when developing locally, or at https://nemo.student.k8s.aet.cit.tum.de/grafana.

### Prometheus Configuration

Prometheus is configured to scrape metrics from all services every 15 seconds, with a 10-second timeout. The configuration is defined in `build/config/prometheus/prometheus.yml`.

#### Exception Rules

Exception monitoring is configured in `build/config/prometheus/exception_rules.yml` with two main alert types:

1. **High5xxErrorRate**:

   - Triggers immediately when 5xx errors are detected

2. **High4xxErrorRate**:
   - Triggers immediately when 4xx errors are detected

### Grafana Dashboards

Grafana provides visualization of metrics through several specialized dashboards:

#### AI Usage Dashboard (`ai_usage.json`)

Monitors AI service performance and usage:

- Token usage rate by type (prompt, completion, total)
- Total AI requests counter
- AI request success rate with thresholds
- Total tokens used across all services

#### Service Exceptions Dashboard (`exceptions.json`)

Tracks error rates and exceptions:

- HTTP 5xx error rates by service
- HTTP 4xx error rates by service
- Error log rates including AI failures
- Real-time error tracking with service breakdown

#### Health Check Dashboard (`health.json`)

Basic service health monitoring:

- Service uptime tracking
- Service availability status
- Health check endpoint monitoring

#### HTTP Requests Dashboard (`http_requests.json`)

General HTTP traffic monitoring:

- Request count by service
- Request duration metrics
- Request rate tracking

## Architecture Overview

### Use Case Diagram

![Use Case Diagram](docs/diagrams/use-case-diagram.png)

### UML Class Diagram

This class diagram shows the relationships between objects in the application
![Class Diagram](docs/diagrams/class-diagram.png)

### Top-Level Architecture

This diagram shows the top level architecture
![Top Level Architecture](docs/diagrams/top-level-architecture.svg)

### Analysis Object Model

This diagram shows the analysis object model
![Top Level Architecture](docs/diagrams/aom.png)

## Kubernetes Deployment with Helm

This repository ships with a production-ready Helm chart located in `infra/helm/team-sigma`. \
It allows you to deploy **all** micro-services, infrastructure add-ons (PostgreSQL, MinIO, Weaviate, Prometheus, Grafana) as well as the React SPA to any Kubernetes cluster in one command.

### Helm Chart Structure

| File/Folder                 | Purpose                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Chart.yaml`                | Chart metadata (name, version, description).                                                                            |
| `values.yaml`               | Central place to configure the image tags, environment variables, exposed ports, ingress host, persistent volumes, etc. |
| `templates/deployment.yaml` | Generates a `Deployment` per service defined in `values.yaml`.                                                          |
| `templates/service.yaml`    | Exposes each deployment internally through a `ClusterIP` service.                                                       |
| `templates/ingress.yaml`    | Creates ingress rules (TLS-terminated via cert-manager) for components that should be reachable from the internet.      |
| `templates/configmap.yaml`  | Provides init-scripts and other static configuration bundled as ConfigMaps.                                             |
| `Makefile`                  | Convenience commands for installing, upgrading and troubleshooting the release.                                         |

### Prerequisites

1. A Kubernetes cluster (tested with k8s ≥ 1.28).
2. `helm` ≥ 3.x installed locally.
3. Your kube-context pointing to the cluster and **namespace `nemo`** either existing or created by Helm automatically.
4. The container images published in GHCR (see CI/CD section) – or change `values.yaml` to reference your own registry.
5. TLS certificates are automatically issued via [cert-manager](https://cert-manager.io/) using the `letsencrypt-prod` ClusterIssuer referenced in the ingress template. \
   Create/adjust this ClusterIssuer in your cluster if it does not exist yet.

### Deploying

```bash
# Navigate to the chart
cd infra/helm/team-sigma

# First-time install (creates namespace, waits for resources to become healthy)
make install-prod   # equivalent to: helm install team-sigma . --namespace nemo --kube-context <ctx> --wait --timeout 5m
```

### Upgrading

Whenever you push a new version of your images (or change chart templates/values):

```bash
# Pull the latest manifests & roll deployments
make upgrade-prod   # helm upgrade team-sigma . --namespace nemo --kube-context <ctx> --wait --timeout 5m
```

### Rolling Pods

```bash
# Trigger a rolling restart of all deployments (e.g., after secret change)
make reload-prod
```

### Cleaning Up

```bash
# DANGER: removes the entire namespace including PVCs
make delete-prod
```

### Creating Secrets

Sensitive credentials (e.g., `OPENAI_API_KEY`, `GEMINI_API_KEY`) are **not** stored in the chart. \
Instead, pass them as key=value pairs to the `create-secrets` target which wraps `kubectl create secret generic`:

```bash
# Example – store both OpenAI & Gemini keys
make create-secrets SECRETS="OPENAI_API_KEY=sk-xxx,GEMINI_API_KEY=gk-yyy"
```

These secrets can then be referenced inside `values.yaml` via `valueFrom.secretKeyRef`.

### Customising the Deployment

Most deployments can be tailored through `values.yaml` without touching the templates:

- Change `host:` at the top to match your own domain or nip.io wildcard.
- Override container image tags or entire `image:` fields.
- Adjust resource limits, add new environment variables or mount volumes.
- Add / remove services: simply append or delete entries in the `services:` array.

After making changes, run `make upgrade-prod` to apply them.

> 📘 **Tip**: For quick experiments use the `--set KEY=VALUE` flag with Helm instead of editing `values.yaml`.

---

## AWS Deployment Architecture

This project is deployed to AWS using the AWS Cloud Development Kit (CDK). The following services make up the production infrastructure:

- **Amazon VPC** – Provides networking with public, private-with-egress, and isolated subnets. Interface and gateway VPC endpoints enable private access to AWS services without traversing the public internet.
- **Amazon ECS (Fargate)** – Hosts all micro-services (Document, Lecture, Chat, Summary, and Weaviate) as serverless containers inside a dedicated cluster. Each service registers in AWS Cloud Map for internal DNS-based discovery.
- **Amazon API Gateway (HTTP API)** – Acts as the single public entry point for all service APIs. A VPC Link forwards traffic securely into the private subnets where the ECS services run.
- **Amazon RDS for PostgreSQL** – Stores relational data for the Spring Boot services. The instance lives in isolated subnets and is only reachable from the ECS task security group.
- **Amazon S3**
  - _Client Bucket_ – Hosts the pre-built React single-page application (SPA).
  - _Document Bucket_ – Stores original PDF/slide uploads and any derived artefacts.
- **Amazon CloudFront** – Serves the SPA globally from edge locations and proxies any request matching `/api/*` to API Gateway, ensuring a single domain for both static assets and APIs.
- **AWS Secrets Manager** – Keeps database credentials used by the services at runtime.
- **Amazon CloudWatch Logs** – Collects application logs from all ECS tasks and API Gateway access logs for observability.

Below is a high-level diagram of the deployed architecture:

![AWS Deployment Architecture](docs/diagrams/aws_deployment.png)

### Deployment to AWS with CDK

Follow these steps to deploy the full stack to your AWS account using the CDK project located in `infra/cdk`.

1. **Set required environment variables** (replace the values with your own keys):

   ```bash
   export OPENAI_API_KEY="sk-..."      # Used by Weaviate for embeddings
   export OPENAI_APIKEY="sk-..."       # Legacy var for services that expect this name
   export GEMINI_API_KEY="gk-..."      # Used by GenAI Microservice
   ```

2. **Bootstrap & deploy the infrastructure** (first pass). From the project root:

   ```bash
   cd infra/cdk
   # Install dependencies if you have not yet
   npm ci

   # Synthesize & deploy the stack – this builds and pushes Docker images, so it can take a while
   npm run cdk deploy
   # or equivalently: npx cdk deploy
   ```

   When the deployment finishes, note the `HttpApiUrl` output in the console. Export it so that the client build knows where to reach your APIs:

   ```bash
   export API_GATEWAY_URL="https://xxxxxxxx.execute-api.<region>.amazonaws.com"
   ```

3. **Build the client for production** – the build embeds the API URL at compile-time:

   ```bash
   cd ../../../client
   bun run build        # produces static assets in client/dist
   ```

4. **Redeploy to publish the client** – this second deploy uploads the freshly built assets to the S3 bucket and issues a CloudFront invalidation:

   ```bash
   cd ../infra/cdk
   npm run cdk deploy
   ```

   After completion, the console will output `ClientSiteUrl`. Open it in a browser to verify everything is working.

> **Tip:** Subsequent UI changes only require repeating steps 3–4. Infrastructure changes (e.g., adding a new service) require running the full deploy again.

### CI/CD Pipeline (GitHub Actions)

The repository ships with an automated pipeline built on **GitHub Actions**. The workflows live under `.github/workflows` and cover pull-request validation, container builds, and production deployment.

| Workflow        | Trigger                      | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pr-title.yaml` | `pull_request` (open / edit) | Enforces [Conventional Commits](https://www.conventionalcommits.org/) in PR titles. Keeps commit history clean and automatable.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pr-tests.yaml` | `pull_request` to `main`     | Runs unit tests and build checks before code can be merged. • Client: installs dependencies with **Bun**, executes `bun run test`, and performs a production build.<br/>• Services (matrix): compiles **Document Service** & **Quiz Service** with Gradle 8 + Temurin 21.                                                                                                                                                                                                                                                                                     |
| `cd.yaml`       | `push` to `main`             | Performs continuous delivery: <br/>1. **Build & Push** job (matrix) – Builds Docker images for every service (`client`, `api-gateway`, `document-service`, `quiz-service`, `chat-service`, `summary-service`, `lecture-service`, `genai-service`) using Buildx and pushes `latest` tags to **GHCR**.<br/>2. **Deploy** job – Uses Helm to `upgrade` the `team-sigma` chart in the `nemo` namespace of the target Kubernetes cluster (kubeconfig provided via encrypted secret). Afterwards rolls all deployments and verifies pod / service / ingress status. |

#### Key Implementation Details

- **Docker Buildx caching** is enabled (`cache-from/to: gha`) for faster subsequent builds.
- Images are multi-arch ready (`linux/amd64`). You can extend the matrix to `arm64` if needed.
- Deployment relies on these GitHub secrets:
  - `KUBECONFIG` – base64-encoded kubeconfig of the target cluster.
  - `GITHUB_TOKEN` – automatically provided for pushing images to GHCR.
- Helm chart resides in `infra/helm/team-sigma`; `helm upgrade` is executed with `--wait` and `--timeout=5m` to ensure zero-downtime rollout.

> **How it fits together:** For every merge to `main`, containers are rebuilt and published, then the latest chart is deployed to the cluster. During development, every PR must pass tests and adhere to Conventional Commit linting before it can be merged, guaranteeing a stable main branch.

## Setup Instructions for Local Development

### Prerequisites

- [Docker](https://www.docker.com/get-started) for running the server
- [Bun](https://bun.sh/) for running the client

### Clone Repository

```
https://github.com/AET-DevOps25/team-sigma.git
cd team-sigma
```

### Running the Project

#### Setup

Add an OpenAI key for Weaviate, chat microservice, quiz microservice, and summary microservice to the `.env` file:

```
OPENAI_API_KEY=xxx
GEMINI_API_KEY=xxx
```

#### Client

Navigate to the client directory and start the development server:

```bash
cd client
bun i
bun dev
```

The client application should now be accessible at http://localhost:5713.

#### Server

Start the server services using our Makefile in root directory:

```bash
make run
```

This command uses Docker Compose to start all the necessary services:

- **Core Services**:

  - API Gateway (nginx) - Routes requests on port 8080
  - Document Service (Spring Boot) - Handles document management and processing
  - Lecture Service (Spring Boot) - Manages lecture organization
  - Chat Service (Python/FastAPI) - Provides AI chat functionality
  - Summary Service (Python/FastAPI) - Generates document summaries
  - Quiz Service (Spring Boot) - Creates quiz questions
  - Client (React) - Serves the client on port 3000

- **Infrastructure Services**:
  - Weaviate - Vector database for document embeddings (port 8090)
  - MinIO - Object storage for PDF files (ports 9000, 9001)
  - PostgreSQL - Relational database (port 5432)
  - Prometheus - Metrics collection (port 9090)
  - Grafana - Metrics visualization (port 3001)

# Tests

To run specific microservice tests, you can execute one of the following commands:

```
make test-summary-service
make test-chat-service
make test-lecture-service
make test-document-service
make test-genai-service
```

To run all microservices tests, tyou can execute one of the following commands:

```
make test-servers
```

To run client tests, execute this command:

```
make test-client
```

To run both client and microservices tests, execute this command:

```
test
```

More information can be found inside the `Makefile`.

# Application Screenshots

### Lectures

![Lectures](docs/readme/application-screenshots/lectures.png)

### Documents

![Documents](docs/readme/application-screenshots/documents.png)

### Summary Tab

![Documents](docs/readme/application-screenshots/summary.png)

### Chat Tab

![Documents](docs/readme/application-screenshots/chat.png)

### Quiz Tab

![Quiz](docs/readme/application-screenshots/quiz.jpeg)
