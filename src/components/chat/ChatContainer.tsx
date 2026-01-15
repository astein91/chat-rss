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
  const { addTopic, addArticles } = useFeedStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

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
        for (const result of data.toolResults) {
          if (result.toolName === "extractTopics" && result.toolResult?.topics) {
            for (const topic of result.toolResult.topics) {
              addTopic(topic);
            }
          }
          if (result.toolName === "searchContent" && result.toolResult?.articles) {
            addArticles(result.toolResult.articles);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      setMessages([
        ...newMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, addTopic, addArticles]);

  const handleOptionSelect = useCallback((option: FollowUpOption) => {
    // Send the selected option as a user message
    handleSend(option.value);
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
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
