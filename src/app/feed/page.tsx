"use client";

import { useState } from "react";
import Link from "next/link";
import { useFeedStore } from "@/store";
import { NewspaperLayout } from "@/components/feed/NewspaperLayout";
import { TopicList } from "@/components/topics/TopicList";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function FeedPage() {
  const { articles, topics, clearArticles, addArticles } = useFeedStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleRefresh = async (clear = false) => {
    const activeTopics = topics.filter((t) => t.isActive);
    if (activeTopics.length === 0) return;

    setIsRefreshing(true);

    // Clear existing articles first if requested
    if (clear) {
      clearArticles();
    }

    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: activeTopics }),
      });
      const data = await response.json();
      if (data.success && data.articles) {
        if (clear) {
          // Replace all articles when clearing
          useFeedStore.getState().setArticles(data.articles);
        } else {
          addArticles(data.articles);
        }
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-newspaper-border bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-newspaper-text font-serif"
            >
              AI Feed
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-newspaper-muted">
                {articles.length} articles • {topics.filter(t => t.isActive).length} topics
              </span>
              <button
                onClick={() => handleRefresh(false)}
                disabled={isRefreshing || topics.filter(t => t.isActive).length === 0}
                className="px-3 py-1.5 text-sm bg-newspaper-accent text-white rounded-l-lg hover:bg-newspaper-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? "Refreshing..." : "↻ Add More"}
              </button>
              <button
                onClick={() => handleRefresh(true)}
                disabled={isRefreshing || topics.filter(t => t.isActive).length === 0}
                className="px-3 py-1.5 text-sm bg-newspaper-accent/80 text-white rounded-r-lg border-l border-white/20 hover:bg-newspaper-accent/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Clear all articles and fetch fresh ones"
              >
                ⟳ Fresh
              </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-3 py-1.5 text-sm border border-newspaper-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isChatOpen ? "Hide Chat" : "Show Chat"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar - Topics */}
        <aside className="w-56 border-r border-newspaper-border bg-white p-4 hidden lg:block flex-shrink-0">
          <div className="sticky top-20">
            <h2 className="font-serif font-bold text-lg text-newspaper-text mb-4">
              Your Topics
            </h2>
            <TopicList />

            {articles.length > 0 && (
              <button
                onClick={clearArticles}
                className="mt-6 w-full py-2 text-sm text-newspaper-muted hover:text-red-500 transition-colors"
              >
                Clear all articles
              </button>
            )}
          </div>
        </aside>

        {/* Feed */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Date header */}
            <div className="text-center mb-8">
              <p className="text-sm text-newspaper-muted uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-serif text-4xl font-bold text-newspaper-text mt-2">
                Your Daily Brief
              </h1>
            </div>

            <NewspaperLayout articles={articles} topics={topics} />
          </div>
        </main>

        {/* Chat Panel - Right Side */}
        {isChatOpen && (
          <aside className="w-96 border-l border-newspaper-border bg-gray-50 flex-shrink-0 flex flex-col">
            <div className="p-4 border-b border-newspaper-border bg-white">
              <h2 className="font-serif font-bold text-lg text-newspaper-text">
                Chat Assistant
              </h2>
              <p className="text-xs text-newspaper-muted mt-1">
                Tell me what you want to follow
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatContainer />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
