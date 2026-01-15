"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessageUI, FollowUpOption } from "./types";

interface MessageListProps {
  messages: ChatMessageUI[];
  isLoading: boolean;
  onOptionSelect?: (option: FollowUpOption) => void;
}

export function MessageList({ messages, isLoading, onOptionSelect }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-newspaper-text mb-3">
            What interests you?
          </h2>
          <p className="text-newspaper-muted">
            Tell me about the topics, industries, or themes you want to stay updated on.
            I&apos;ll help curate relevant articles just for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["AI & Machine Learning", "Climate Tech", "Startups", "Science"].map(
              (topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full text-sm bg-white border border-newspaper-border text-newspaper-muted"
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
