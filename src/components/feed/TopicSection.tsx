"use client";

import { ArticleCard } from "./ArticleCard";
import type { Topic, Article } from "@/types";

interface TopicSectionProps {
  topic: Topic;
  articles: Article[];
}

export function TopicSection({ topic, articles }: TopicSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="col-span-full">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-serif text-xl font-bold text-newspaper-text">
          {topic.name}
        </h2>
        <div className="flex-1 h-px bg-newspaper-border" />
        <span className="text-sm text-newspaper-muted">
          {articles.length} article{articles.length !== 1 && "s"}
        </span>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            size={index === 0 ? "medium" : "small"}
          />
        ))}
      </div>
    </section>
  );
}
