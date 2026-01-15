import type { Topic, Article } from "@/types";

export interface FollowUpOption {
  label: string;
  value: string;
}

export interface ToolInvocation {
  toolName: string;
  state: "result" | "pending";
  result?: {
    success: boolean;
    topics?: Topic[];
    articles?: Article[];
    question?: string;
    options?: FollowUpOption[];
    allowMultiple?: boolean;
    message: string;
  };
}

export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: Array<{
    type: "tool-invocation";
    toolInvocation: ToolInvocation;
  }>;
}
