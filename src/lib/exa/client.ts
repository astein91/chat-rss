import Exa from "exa-js";
import Anthropic from "@anthropic-ai/sdk";
import type { ExaCategory, Article } from "@/types";

const anthropic = new Anthropic();

const exa = new Exa(process.env.EXA_API_KEY!);

function getStartDate(dateRange: "day" | "2days" | "week" | "month"): string {
  const now = new Date();
  switch (dateRange) {
    case "day":
      now.setDate(now.getDate() - 1);
      break;
    case "2days":
      now.setDate(now.getDate() - 2);
      break;
    case "week":
      now.setDate(now.getDate() - 7);
      break;
    case "month":
      now.setMonth(now.getMonth() - 1);
      break;
  }
  return now.toISOString().split("T")[0];
}

export interface SearchOptions {
  category?: ExaCategory;
  dateRange?: "day" | "2days" | "week" | "month";
  numResults?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  source: string;
  publishedDate: string | null;
  author: string | null;
  summary: string;
  highlights: string[];
  imageUrl: string | null;
}

// Check if URL looks like a homepage (no meaningful path)
function isHomepage(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "");
    return path === "" || path === "/index" || path === "/home";
  } catch {
    return false;
  }
}

export async function searchExa(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { category, dateRange = "2days", numResults = 5 } = options;

  try {
    // Request extra results since we'll filter out non-articles
    const searchOptions: Parameters<typeof exa.searchAndContents>[1] = {
      type: "auto",
      numResults: numResults + 5,
      startPublishedDate: getStartDate(dateRange),
      text: { maxCharacters: 500 },
      highlights: { numSentences: 2 },
      summary: { query: `Key points about: ${query}` },
    };

    if (category) {
      searchOptions.category = category;
    }

    const results = await exa.searchAndContents(query, searchOptions);

    // Cast to include summary and highlights which are returned when those options are specified
    type ExaResultWithExtras = (typeof results.results)[number] & {
      summary?: string;
      highlights?: string[];
    };

    // Filter to only include actual articles (must have publishedDate and not be a homepage)
    const articles = (results.results as ExaResultWithExtras[])
      .filter((r) => r.publishedDate && !isHomepage(r.url))
      .slice(0, numResults)
      .map((r) => ({
        title: r.title || "Untitled",
        url: r.url,
        source: new URL(r.url).hostname.replace("www.", ""),
        publishedDate: r.publishedDate || null,
        author: r.author || null,
        summary: r.summary || "",
        highlights: r.highlights || [],
        imageUrl: r.image || null,
      }));

    return articles;
  } catch (error) {
    console.error("Exa search error:", error);
    throw new Error(`Failed to search: ${error}`);
  }
}

interface EnhancedArticle {
  url: string;
  title: string;
  whyInteresting: string;
}

interface FilterResponse {
  articles: EnhancedArticle[];
}

export async function filterAndEnhanceResults(
  results: SearchResult[],
  userInterest: string
): Promise<SearchResult[]> {
  if (results.length === 0) return [];

  const prompt = `You are strictly filtering search results for a user interested in: "${userInterest}"

Here are the URLs found:
${results.map((r, i) => `
[${i}]
URL: ${r.url}
Title: ${r.title}
Summary: ${r.summary}
Source: ${r.source}
`).join("\n")}

STRICT FILTERING RULES - EXCLUDE if ANY of these apply:
1. NOT a written article, blog post, or research paper (EXCLUDE scores, standings, schedules, live feeds, forums, product pages, documentation, landing pages)
2. Paywalled content (Wall Street Journal, NYT, The Athletic, Bloomberg, Financial Times, etc. - EXCLUDE unless clearly free)
3. Category pages, tag pages, search results, or index pages (EXCLUDE)
4. Video-only content, podcasts, or image galleries (EXCLUDE)
5. Social media posts, tweets, or Reddit threads (EXCLUDE)
6. Press releases or sponsored content (EXCLUDE)
7. Not genuinely relevant to "${userInterest}" (EXCLUDE)

ONLY INCLUDE: News articles, blog posts, research papers, analysis pieces, opinion/editorial pieces with substantial written content.

For each article that passes ALL filters, provide:
- url: The exact original URL
- title: A clear title (max 100 chars)
- whyInteresting: One sentence on why this matters for someone interested in ${userInterest}

Respond with valid JSON only:
{
  "articles": [
    {"url": "...", "title": "...", "whyInteresting": "..."}
  ]
}

If NO articles pass the strict filter, return {"articles": []}. Be aggressive in filtering - quality over quantity.`;

  try {
    // Use Haiku for fast filtering
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return results;

    const parsed: FilterResponse = JSON.parse(jsonMatch[0]);

    // Map enhanced articles back to SearchResults with updated title/summary
    return parsed.articles
      .map((enhanced) => {
        const original = results.find((r) => r.url === enhanced.url);
        if (!original) return null;
        return {
          ...original,
          title: enhanced.title,
          summary: enhanced.whyInteresting,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  } catch (error) {
    console.error("Filter/enhance error:", error);
    // On error, return original results unfiltered
    return results;
  }
}

// Generate a short unique ID from URL
function generateArticleId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
}

export function transformToArticle(
  result: SearchResult,
  topicIds: string[]
): Article {
  return {
    id: generateArticleId(result.url),
    title: result.title,
    url: result.url,
    source: result.source,
    publishedDate: result.publishedDate,
    author: result.author,
    summary: result.summary,
    highlights: result.highlights,
    imageUrl: result.imageUrl,
    topicIds,
    relevanceScore: 1,
    fetchedAt: new Date(),
  };
}
