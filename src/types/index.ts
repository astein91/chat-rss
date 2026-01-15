export interface Topic {
  id: string;
  name: string;
  description: string;
  searchQueries: string[];
  category: "news" | "research paper" | "company" | "github" | "tweet" | "personal site" | "pdf";
  dateRange: "day" | "2days" | "week" | "month";
  isActive: boolean;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate: string | null;
  author: string | null;
  summary: string;
  highlights: string[];
  imageUrl: string | null;
  topicIds: string[];
  relevanceScore: number;
  fetchedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export type ExaCategory =
  | "news"
  | "research paper"
  | "company"
  | "github"
  | "tweet"
  | "personal site"
  | "pdf";
