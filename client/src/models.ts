export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export interface SlideDeck {
  id: string;
  title: string;
  file: string;
  uploadedAt: string;
  thumbnailUrl?: string;
  slideCount?: number;
  organizationId: string;
  summary: string;
}

// Mock data for slide decks
export const mockSlideDecks: SlideDeck[] = [
  {
    id: "slide_1",
    title: "Introduction to DevOps",
    file: "intro_devops.pdf",
    uploadedAt: "2023-09-15T10:30:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=DevOps+Intro",
    slideCount: 24,
    organizationId: "org_1",
    summary: "This presentation covers the fundamental concepts of DevOps, including its core principles, benefits for organizations, and how it bridges the gap between development and operations teams. Topics include continuous integration, continuous deployment, infrastructure as code, and cultural transformation."
  },
  {
    id: "slide_2",
    title: "Continuous Integration Best Practices",
    file: "ci_best_practices.pptx",
    uploadedAt: "2023-09-18T14:45:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=CI+Practices",
    slideCount: 32,
    organizationId: "org_1",
    summary: "An in-depth exploration of continuous integration practices, covering automated testing strategies, build pipeline design, version control workflows, and integration with popular CI/CD tools like Jenkins, GitLab CI, and GitHub Actions."
  },
  {
    id: "slide_3",
    title: "Docker and Containerization",
    file: "docker_containers.pdf",
    uploadedAt: "2023-09-22T09:15:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Docker",
    slideCount: 41,
    organizationId: "org_1",
    summary: "Comprehensive guide to containerization with Docker, including container concepts, Dockerfile best practices, image optimization, multi-stage builds, container networking, and volume management for production environments."
  },
  {
    id: "slide_4",
    title: "Kubernetes Fundamentals",
    file: "k8s_fundamentals.pptx",
    uploadedAt: "2023-10-05T11:20:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Kubernetes",
    slideCount: 38,
    organizationId: "org_2",
    summary: "Introduction to Kubernetes orchestration platform, covering pods, services, deployments, configmaps, secrets, ingress controllers, and basic cluster management for container orchestration at scale."
  },
  {
    id: "slide_5",
    title: "Cloud Infrastructure and Scaling",
    file: "cloud_scaling.pdf",
    uploadedAt: "2023-10-12T13:10:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Cloud+Scaling",
    slideCount: 29,
    organizationId: "org_2",
    summary: "Strategies for designing scalable cloud infrastructure, including auto-scaling groups, load balancing, database scaling, caching strategies, and cost optimization techniques for AWS, Azure, and Google Cloud platforms."
  },
  {
    id: "slide_11",
    title: "Service Mesh with Istio",
    file: "service_mesh_istio.pptx",
    uploadedAt: "2024-01-08T11:30:00Z",
    slideCount: 39,
    organizationId: "org_1",
    summary: "Advanced service mesh concepts using Istio, covering traffic management, security policies, observability, circuit breakers, and how to implement microservices communication patterns in Kubernetes environments."
  },
];
