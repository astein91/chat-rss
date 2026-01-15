"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-newspaper-border p-4">
      <div className="flex gap-3 items-end max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what topics interest you..."
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-lg border border-newspaper-border",
            "bg-white px-4 py-3 text-newspaper-text",
            "placeholder:text-newspaper-muted",
            "focus:outline-none focus:ring-2 focus:ring-newspaper-accent focus:border-transparent",
            "max-h-32"
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            "px-6 py-3 rounded-lg font-medium transition-colors",
            "bg-newspaper-accent text-white",
            "hover:bg-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}
