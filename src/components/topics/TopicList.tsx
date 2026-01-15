"use client";

import { cn } from "@/lib/utils";
import { useFeedStore } from "@/store";

export function TopicList() {
  const { topics, toggleTopic, removeTopic } = useFeedStore();

  if (topics.length === 0) {
    return (
      <div className="text-sm text-newspaper-muted">
        No topics yet. Start a conversation to add topics.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            topic.isActive ? "bg-blue-50" : "bg-gray-50"
          )}
        >
          <button
            onClick={() => toggleTopic(topic.id)}
            className={cn(
              "w-4 h-4 rounded border-2 flex-shrink-0 transition-colors",
              topic.isActive
                ? "bg-newspaper-accent border-newspaper-accent"
                : "border-gray-300"
            )}
          >
            {topic.isActive && (
              <svg
                className="w-full h-full text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-newspaper-text truncate">
              {topic.name}
            </div>
            <div className="text-xs text-newspaper-muted truncate">
              {topic.category} • {topic.dateRange}
            </div>
          </div>

          <button
            onClick={() => removeTopic(topic.id)}
            className="text-newspaper-muted hover:text-red-500 transition-colors"
            title="Remove topic"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
