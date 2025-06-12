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
    organizationId: "org_1"
  },
  {
    id: "slide_2",
    title: "Continuous Integration Best Practices",
    file: "ci_best_practices.pptx",
    uploadedAt: "2023-09-18T14:45:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=CI+Practices",
    slideCount: 32,
    organizationId: "org_1"
  },
  {
    id: "slide_3",
    title: "Docker and Containerization",
    file: "docker_containers.pdf",
    uploadedAt: "2023-09-22T09:15:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Docker",
    slideCount: 41,
    organizationId: "org_1"
  },
  {
    id: "slide_4",
    title: "Kubernetes Fundamentals",
    file: "k8s_fundamentals.pptx",
    uploadedAt: "2023-10-05T11:20:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Kubernetes",
    slideCount: 38,
    organizationId: "org_2"
  },
  {
    id: "slide_5",
    title: "Cloud Infrastructure and Scaling",
    file: "cloud_scaling.pdf",
    uploadedAt: "2023-10-12T13:10:00Z",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Cloud+Scaling",
    slideCount: 29,
    organizationId: "org_2"
  }
];
