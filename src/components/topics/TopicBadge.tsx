"use client";

import { cn } from "@/lib/utils";
import type { Topic } from "@/types";

interface TopicBadgeProps {
  topic: Topic;
  onClick?: () => void;
}

export function TopicBadge({ topic, onClick }: TopicBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors",
        topic.isActive
          ? "bg-newspaper-accent text-white"
          : "bg-gray-100 text-newspaper-muted hover:bg-gray-200"
      )}
    >
      {topic.name}
    </button>
  );
}
