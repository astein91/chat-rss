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
        <div>
          <p className="text-xl text-newspaper-muted mb-2">No articles yet</p>
          <p className="text-newspaper-muted">
            Start a conversation to discover content tailored to your interests.
          </p>
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
