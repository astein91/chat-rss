"use client";

import { format } from "date-fns";
import type { Article } from "@/types";

interface ArticleListItemProps {
  article: Article;
}

export function ArticleListItem({ article }: ArticleListItemProps) {
  const formattedDate = article.publishedDate
    ? format(new Date(article.publishedDate), "MMM d, yyyy")
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-3 bg-white rounded-lg border border-newspaper-border hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        {/* Source and date */}
        <div className="flex items-center gap-2 text-xs text-newspaper-muted mb-1">
          <span className="font-medium text-newspaper-accent">
            {article.source}
          </span>
          {formattedDate && (
            <>
              <span>•</span>
              <time>{formattedDate}</time>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-newspaper-text group-hover:text-newspaper-accent transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="mt-1 text-sm text-newspaper-muted line-clamp-2">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}
