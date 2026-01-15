"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Topic, Article } from "@/types";

interface FeedStore {
  // Topics
  topics: Topic[];
  addTopic: (topic: Topic) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  removeTopic: (id: string) => void;
  toggleTopic: (id: string) => void;
  setTopics: (topics: Topic[]) => void;

  // Articles
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  addArticles: (articles: Article[]) => void;
  clearArticles: () => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set) => ({
      // Topics
      topics: [],
      addTopic: (topic) =>
        set((state) => ({
          topics: [...state.topics, topic],
        })),
      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      removeTopic: (id) =>
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
        })),
      toggleTopic: (id) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === id ? { ...t, isActive: !t.isActive } : t
          ),
        })),
      setTopics: (topics) => set({ topics }),

      // Articles
      articles: [],
      setArticles: (articles) => set({ articles }),
      addArticles: (newArticles) =>
        set((state) => {
          const existingIds = new Set(state.articles.map((a) => a.id));
          const uniqueNew = newArticles.filter((a) => !existingIds.has(a.id));
          return { articles: [...state.articles, ...uniqueNew] };
        }),
      clearArticles: () => set({ articles: [] }),

      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "ai-feed-storage",
      partialize: (state) => ({
        topics: state.topics,
        articles: state.articles,
      }),
    }
  )
);
