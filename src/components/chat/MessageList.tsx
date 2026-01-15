"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessageUI, FollowUpOption } from "./types";

interface MessageListProps {
  messages: ChatMessageUI[];
  isLoading: boolean;
  onOptionSelect?: (options: FollowUpOption[]) => void;
}

export function MessageList({ messages, isLoading, onOptionSelect }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-newspaper-text mb-2">
            What interests you?
          </h2>
          <p className="text-sm text-newspaper-muted mb-4">
            Tell me what you want to follow and I&apos;ll curate your feed.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["AI", "Climate", "Startups", "Science"].map(
              (topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 rounded-full text-xs bg-white border border-newspaper-border text-newspaper-muted"
                >
                  {topic}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            onOptionSelect={onOptionSelect}
            isLatest={index === messages.length - 1 && !isLoading}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-newspaper-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-newspaper-muted rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-newspaper-muted rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-newspaper-muted rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
