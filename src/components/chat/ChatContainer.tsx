"use client";

import { useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useFeedStore } from "@/store";
import type { Topic, Article } from "@/types";
import type { FollowUpOption } from "./types";

interface ToolResult {
  type: string;
  toolName: string;
  toolResult: {
    success: boolean;
    topics?: Topic[];
    articles?: Article[];
    message: string;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
}

export function ChatContainer() {
  const { addTopic, addArticles, setArticles } = useFeedStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingArticles, setIsFetchingArticles] = useState(false);

  // Fetch articles for newly added topics
  const fetchArticlesForTopics = async (topics: Topic[]) => {
    setIsFetchingArticles(true);
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });
      const data = await response.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsFetchingArticles(false);
    }
  };

  const handleSend = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        toolResults: data.toolResults,
      };

      setMessages([...newMessages, assistantMessage]);

      // Process tool results
      if (data.toolResults) {
        const newTopics: Topic[] = [];

        for (const result of data.toolResults) {
          if (result.toolName === "extractTopics" && result.toolResult?.topics) {
            for (const topic of result.toolResult.topics) {
              addTopic(topic);
              newTopics.push(topic);
            }
          }
          if (result.toolName === "searchContent" && result.toolResult?.articles) {
            addArticles(result.toolResult.articles);
          }
        }

        // Auto-fetch articles for ALL active topics after new topics are added
        if (newTopics.length > 0) {
          // Get all topics from the store (including the ones we just added)
          const allTopics = useFeedStore.getState().topics;
          fetchArticlesForTopics(allTopics.filter(t => t.isActive));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Add error message
      setMessages([
        ...newMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, something went wrong: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, addTopic, addArticles]);

  const handleOptionSelect = useCallback((options: FollowUpOption[]) => {
    // Combine selected options into a single message
    const message = options.map((o) => o.value).join(". ");
    handleSend(message);
  }, [handleSend]);

  // Convert to format expected by MessageList
  const uiMessages = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    parts: m.toolResults?.map((tr) => ({
      type: "tool-invocation" as const,
      toolInvocation: {
        toolName: tr.toolName,
        state: "result" as const,
        result: tr.toolResult,
      },
    })),
  }));

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={uiMessages}
        isLoading={isLoading}
        onOptionSelect={handleOptionSelect}
      />
      {isFetchingArticles && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 text-center">
          <span className="text-sm text-blue-600">
            Finding articles for you...
          </span>
        </div>
      )}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
