# Team σ Project

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Docker](https://www.docker.com/get-started) for running the server
- [Bun](https://bun.sh/) for running the client

### Running the Project

#### Server

Start the server services using Docker:

```bash
docker compose up
```

The server API will be available at its gateway at http://localhost:8080/api.
The production client will also be available at http://localhost:3000 — don't use it for development.

#### Client

Navigate to the client directory and start the development server:

```bash
cd client
bun i
bun dev
```

The client application should now be accessible at http://localhost:5713.
