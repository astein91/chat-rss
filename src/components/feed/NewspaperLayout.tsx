"use client";

import { FeaturedArticle } from "./FeaturedArticle";
import { ArticleCard } from "./ArticleCard";
import { ArticleListItem } from "./ArticleListItem";
import type { Topic, Article } from "@/types";

function isValidUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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

  // Group articles by topic
  const articlesByTopic = new Map<string, Article[]>();

  for (const article of articles) {
    const topicId = article.topicIds[0];
    if (!topicId) continue;

    if (!articlesByTopic.has(topicId)) {
      articlesByTopic.set(topicId, []);
    }
    articlesByTopic.get(topicId)!.push(article);
  }

  // Sort articles within each topic by date
  for (const [, topicArticles] of articlesByTopic) {
    topicArticles.sort((a, b) => {
      if (a.publishedDate && b.publishedDate) {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      }
      return b.relevanceScore - a.relevanceScore;
    });
  }

  // Get active topics that have articles
  const activeTopicsWithArticles = topics.filter(
    t => t.isActive && articlesByTopic.has(t.id) && articlesByTopic.get(t.id)!.length > 0
  );

  return (
    <div className="space-y-10">
      {activeTopicsWithArticles.map((topic, index) => {
        const topicArticles = articlesByTopic.get(topic.id) || [];
        const articlesWithImages = topicArticles.filter(a => isValidUrl(a.imageUrl));
        const articlesWithoutImages = topicArticles.filter(a => !isValidUrl(a.imageUrl));

        // First topic gets hero treatment
        const isFirstTopic = index === 0;
        const heroArticle = isFirstTopic && articlesWithImages[0];
        const remainingArticles = isFirstTopic
          ? [...articlesWithImages.slice(1), ...articlesWithoutImages]
          : topicArticles;

        return (
          <section key={topic.id}>
            {/* Topic header */}
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-newspaper-text">
                {topic.name}
              </h2>
              <div className="flex-1 h-px bg-newspaper-border" />
              <span className="text-sm text-newspaper-muted">
                {topicArticles.length} articles
              </span>
            </div>

            {/* Hero for first topic */}
            {heroArticle && (
              <div className="mb-6">
                <FeaturedArticle article={heroArticle} />
              </div>
            )}

            {/* Article list */}
            <div className="space-y-3">
              {remainingArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
