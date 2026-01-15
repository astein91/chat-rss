import { searchExa, transformToArticle, filterAndEnhanceResults } from "@/lib/exa/client";
import { validateRequest, unauthorizedResponse } from "@/lib/auth";
import type { Topic, Article, ExaCategory } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!validateRequest(req)) {
    return unauthorizedResponse();
  }

  const { topics } = await req.json() as { topics: Topic[] };

  if (!topics || topics.length === 0) {
    return Response.json({ success: false, articles: [], message: "No topics provided" });
  }

  const activeTopics = topics.filter((t) => t.isActive && t.searchQueries[0]);

  // Step 1: Fire ALL Exa searches in parallel
  const searchPromises = activeTopics.map((topic) =>
    searchExa(topic.searchQueries[0], {
      category: topic.category as ExaCategory,
      numResults: 5,
      dateRange: topic.dateRange || "2days",
    }).catch((error) => {
      console.error(`Search failed for "${topic.searchQueries[0]}":`, error);
      return [];
    })
  );

  const searchResults = await Promise.all(searchPromises);

  // Step 2: Fire ALL AI filters in parallel
  const filterPromises = searchResults.map((results, idx) => {
    if (results.length === 0) return Promise.resolve([]);
    const topic = activeTopics[idx];
    return filterAndEnhanceResults(results, `${topic.name}: ${topic.description}`).catch((error) => {
      console.error(`Filter failed for "${topic.name}":`, error);
      return results; // Fall back to unfiltered results
    });
  });

  const filteredResults = await Promise.all(filterPromises);

  // Step 3: Transform to articles
  const allArticles: Article[] = [];
  for (let i = 0; i < filteredResults.length; i++) {
    const topic = activeTopics[i];
    const articles = filteredResults[i].slice(0, 3).map((r) => transformToArticle(r, [topic.id]));
    allArticles.push(...articles);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const uniqueArticles = allArticles.filter((article) => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });

  return Response.json({
    success: true,
    articles: uniqueArticles,
    message: `Found ${uniqueArticles.length} articles`,
  });
}
