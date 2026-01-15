"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessageUI, ToolInvocation, FollowUpOption } from "./types";

interface MessageBubbleProps {
  message: ChatMessageUI;
  onOptionSelect?: (options: FollowUpOption[]) => void;
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
  onOptionSelect?: (options: FollowUpOption[]) => void;
  isLatest?: boolean;
}

function ToolResult({ invocation, onOptionSelect, isLatest }: ToolResultProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());

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
    const allowMultiple = result.allowMultiple || false;

    const handleChipClick = (idx: number) => {
      if (!isLatest) return;

      if (allowMultiple) {
        // Toggle selection
        const newSelected = new Set(selectedOptions);
        if (newSelected.has(idx)) {
          newSelected.delete(idx);
        } else {
          newSelected.add(idx);
        }
        setSelectedOptions(newSelected);
      } else {
        // Single select - send immediately
        onOptionSelect?.([result.options![idx]]);
      }
    };

    const handleSubmit = () => {
      if (selectedOptions.size === 0) return;
      const selected = Array.from(selectedOptions).map((idx) => result.options![idx]);
      onOptionSelect?.(selected);
    };

    return (
      <div className="mt-3 pt-3 border-t border-newspaper-border/30">
        {result.question && (
          <div className="text-sm mb-3">{result.question}</div>
        )}
        {allowMultiple && isLatest && (
          <div className="text-xs text-newspaper-muted mb-2">Select all that apply:</div>
        )}
        <div className="flex flex-wrap gap-2">
          {result.options.map((option, idx) => {
            const isSelected = selectedOptions.has(idx);
            return (
              <button
                key={idx}
                onClick={() => handleChipClick(idx)}
                disabled={!isLatest}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors",
                  !isLatest && "bg-gray-100 text-gray-500 cursor-default",
                  isLatest && !isSelected && "bg-newspaper-accent/10 text-newspaper-accent hover:bg-newspaper-accent/20 cursor-pointer",
                  isLatest && isSelected && "bg-newspaper-accent text-white cursor-pointer"
                )}
              >
                {allowMultiple && isSelected && <span className="mr-1">✓</span>}
                {option.label}
              </button>
            );
          })}
        </div>
        {allowMultiple && isLatest && selectedOptions.size > 0 && (
          <button
            onClick={handleSubmit}
            className="mt-3 px-4 py-2 bg-newspaper-accent text-white rounded-lg text-sm font-medium hover:bg-newspaper-accent/90 transition-colors"
          >
            Continue with {selectedOptions.size} selected
          </button>
        )}
      </div>
    );
  }

  // Don't show extractTopics results - topics appear in sidebar
  if (invocation.toolName === "extractTopics") {
    return null;
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
