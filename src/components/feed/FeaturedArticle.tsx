"use client";

import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/types";

interface FeaturedArticleProps {
  article: Article;
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const formattedDate = article.publishedDate
    ? format(new Date(article.publishedDate), "MMMM d, yyyy")
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-lg border border-newspaper-border hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Hero image area */}
      <div className="h-64 md:h-80 bg-gray-50 relative">
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-contain"
            sizes="800px"
            priority
          />
        )}
      </div>

      <div className="p-6">
        {/* Source and date */}
        <div className="flex items-center gap-3 text-sm text-newspaper-muted mb-3">
          <span className="font-semibold text-newspaper-accent uppercase tracking-wide text-xs">
            {article.source}
          </span>
          {formattedDate && (
            <>
              <span>•</span>
              <time>{formattedDate}</time>
            </>
          )}
          {article.author && (
            <>
              <span>•</span>
              <span>By {article.author}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-newspaper-text group-hover:text-newspaper-accent transition-colors mb-4">
          {article.title}
        </h2>

        {/* Summary */}
        {article.summary && (
          <p className="text-newspaper-muted leading-relaxed">
            {article.summary}
          </p>
        )}

        {/* Highlights */}
        {article.highlights.length > 0 && (
          <blockquote className="mt-4 pl-4 border-l-4 border-newspaper-accent text-newspaper-muted italic">
            {article.highlights[0]}
          </blockquote>
        )}
      </div>
    </a>
  );
}
