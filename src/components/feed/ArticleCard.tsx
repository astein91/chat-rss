"use client";

import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  size?: "small" | "medium" | "large";
}

export function ArticleCard({ article, size = "medium" }: ArticleCardProps) {
  const formattedDate = article.publishedDate
    ? format(new Date(article.publishedDate), "MMM d, yyyy")
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block bg-white rounded-lg border border-newspaper-border",
        "hover:shadow-lg transition-shadow overflow-hidden"
      )}
    >
      {/* Article image */}
      {size !== "small" && article.imageUrl && (
        <div
          className={cn(
            "relative bg-gray-50",
            size === "large" ? "h-56" : "h-40"
          )}
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-contain"
            sizes={size === "large" ? "600px" : "400px"}
          />
        </div>
      )}

      <div className={cn("p-4", size === "small" && "py-3")}>
        {/* Source and date */}
        <div className="flex items-center gap-2 text-xs text-newspaper-muted mb-2">
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
        <h3
          className={cn(
            "font-serif font-bold text-newspaper-text group-hover:text-newspaper-accent transition-colors",
            size === "large" && "text-xl",
            size === "medium" && "text-lg",
            size === "small" && "text-base",
            size !== "large" && "line-clamp-2"
          )}
        >
          {article.title}
        </h3>

        {/* Summary */}
        {size !== "small" && article.summary && (
          <p
            className={cn(
              "mt-2 text-sm text-newspaper-muted",
              size === "large" ? "line-clamp-4" : "line-clamp-2"
            )}
          >
            {article.summary}
          </p>
        )}

        {/* Highlights */}
        {size === "large" && article.highlights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-newspaper-border">
            <p className="text-sm text-newspaper-muted italic line-clamp-2">
              &ldquo;{article.highlights[0]}&rdquo;
            </p>
          </div>
        )}
      </div>
    </a>
  );
}
