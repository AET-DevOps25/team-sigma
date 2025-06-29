export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  slideDeckId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    slideDeckId: "slide_1",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2023-09-15T10:35:00Z"),
      },
    ],
    createdAt: new Date("2023-09-15T10:35:00Z"),
    updatedAt: new Date("2023-09-15T10:35:00Z"),
  },
  {
    id: "conv_2",
    slideDeckId: "slide_2",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2023-09-18T14:50:00Z"),
      },
    ],
    createdAt: new Date("2023-09-18T14:50:00Z"),
    updatedAt: new Date("2023-09-18T14:50:00Z"),
  },
  {
    id: "conv_3",
    slideDeckId: "slide_3",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2023-09-22T09:20:00Z"),
      },
    ],
    createdAt: new Date("2023-09-22T09:20:00Z"),
    updatedAt: new Date("2023-09-22T09:20:00Z"),
  },
  {
    id: "conv_4",
    slideDeckId: "slide_4",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2023-10-05T11:25:00Z"),
      },
    ],
    createdAt: new Date("2023-10-05T11:25:00Z"),
    updatedAt: new Date("2023-10-05T11:25:00Z"),
  },
  {
    id: "conv_5",
    slideDeckId: "slide_5",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2023-10-12T13:15:00Z"),
      },
    ],
    createdAt: new Date("2023-10-12T13:15:00Z"),
    updatedAt: new Date("2023-10-12T13:15:00Z"),
  },
  {
    id: "conv_11",
    slideDeckId: "slide_11",
    messages: [
      {
        text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
        isUser: false,
        timestamp: new Date("2024-01-08T11:35:00Z"),
      },
    ],
    createdAt: new Date("2024-01-08T11:35:00Z"),
    updatedAt: new Date("2024-01-08T11:35:00Z"),
  },
];
