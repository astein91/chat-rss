"use client";

import { cn } from "@/lib/utils";
import type { ChatMessageUI, ToolInvocation, FollowUpOption } from "./types";

interface MessageBubbleProps {
  message: ChatMessageUI;
  onOptionSelect?: (option: FollowUpOption) => void;
  isLatest?: boolean;
}

export function MessageBubble({ message, onOptionSelect, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const textContent = message.content;

  // Extract tool invocations from parts
  const toolParts = message.parts?.filter(
    (part) => part.type === "tool-invocation"
  ) || [];

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-newspaper-accent text-white"
            : "bg-white border border-newspaper-border text-newspaper-text"
        )}
      >
        {textContent && (
          <div className="whitespace-pre-wrap">{textContent}</div>
        )}

        {/* Show tool invocations */}
        {toolParts.map((part, i) => (
          <ToolResult
            key={i}
            invocation={part.toolInvocation}
            onOptionSelect={onOptionSelect}
            isLatest={isLatest}
          />
        ))}
      </div>
    </div>
  );
}

interface ToolResultProps {
  invocation: ToolInvocation;
  onOptionSelect?: (option: FollowUpOption) => void;
  isLatest?: boolean;
}

function ToolResult({ invocation, onOptionSelect, isLatest }: ToolResultProps) {
  if (invocation.state !== "result" || !invocation.result) {
    return (
      <div className="mt-2 text-sm text-newspaper-muted italic">
        {invocation.toolName === "extractTopics" && "Extracting topics..."}
        {invocation.toolName === "searchContent" && "Searching for content..."}
        {invocation.toolName === "askFollowUp" && "Loading options..."}
      </div>
    );
  }

  const result = invocation.result;

  if (invocation.toolName === "askFollowUp" && result.options) {
    return (
      <div className="mt-3 pt-3 border-t border-newspaper-border/30">
        {result.question && (
          <div className="text-sm mb-3">{result.question}</div>
        )}
        <div className="flex flex-wrap gap-2">
          {result.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionSelect?.(option)}
              disabled={!isLatest}
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors",
                isLatest
                  ? "bg-newspaper-accent/10 text-newspaper-accent hover:bg-newspaper-accent/20 cursor-pointer"
                  : "bg-gray-100 text-gray-500 cursor-default"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (invocation.toolName === "extractTopics" && result.topics) {
    return (
      <div className="mt-3 pt-3 border-t border-newspaper-border/30">
        <div className="text-sm font-medium mb-2">Topics identified:</div>
        <div className="flex flex-wrap gap-2">
          {result.topics.map((topic) => (
            <span
              key={topic.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {topic.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (invocation.toolName === "searchContent" && result.articles) {
    return (
      <div className="mt-3 pt-3 border-t border-newspaper-border/30">
        <div className="text-sm font-medium mb-2">
          Found {result.articles.length} articles:
        </div>
        <div className="space-y-2">
          {result.articles.slice(0, 3).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-sm line-clamp-1">
                {article.title}
              </div>
              <div className="text-xs text-newspaper-muted">
                {article.source}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
