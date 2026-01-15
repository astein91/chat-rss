"use client";

import { FeaturedArticle } from "./FeaturedArticle";
import { ArticleCard } from "./ArticleCard";
import { ArticleListItem } from "./ArticleListItem";
import type { Topic, Article } from "@/types";

interface NewspaperLayoutProps {
  articles: Article[];
  topics: Topic[];
}

export function NewspaperLayout({ articles, topics }: NewspaperLayoutProps) {
  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-newspaper-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-newspaper-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-bold text-newspaper-text mb-2">
            Set Up Your Feed
          </h3>
          <p className="text-newspaper-muted mb-4">
            Use the chat panel to tell me what topics interest you. I&apos;ll help you build a personalized news feed.
          </p>
          <div className="text-sm text-newspaper-muted/80">
            <p className="mb-2">Try saying something like:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["AI research", "Climate tech", "Startup news"].map((example) => (
                <span
                  key={example}
                  className="px-3 py-1 rounded-full bg-newspaper-accent/5 text-newspaper-accent text-sm"
                >
                  &ldquo;{example}&rdquo;
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort by date/relevance
  const sortedArticles = [...articles].sort((a, b) => {
    if (a.publishedDate && b.publishedDate) {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Separate articles with and without images
  const articlesWithImages = sortedArticles.filter((a) => a.imageUrl);
  const articlesWithoutImages = sortedArticles.filter((a) => !a.imageUrl);

  // Hero articles (with images) - up to 3
  const heroArticles = articlesWithImages.slice(0, 3);
  const remainingWithImages = articlesWithImages.slice(3);

  // All non-hero articles go to list view
  const listArticles = [...remainingWithImages, ...articlesWithoutImages];

  return (
    <div className="space-y-8">
      {/* Hero Section - only articles with images */}
      {heroArticles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main featured */}
          {heroArticles[0] && (
            <div className="lg:col-span-8">
              <FeaturedArticle article={heroArticles[0]} />
            </div>
          )}

          {/* Secondary hero articles */}
          {heroArticles.length > 1 && (
            <div className="lg:col-span-4 space-y-4">
              {heroArticles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} size="medium" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View - all other articles */}
      {listArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-serif text-xl font-bold text-newspaper-text">
              All Stories
            </h2>
            <div className="flex-1 h-px bg-newspaper-border" />
          </div>
          <div className="space-y-3">
            {listArticles.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
