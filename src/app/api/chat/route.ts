import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { searchExa, transformToArticle, filterAndEnhanceResults } from "@/lib/exa/client";
import { validateRequest, unauthorizedResponse } from "@/lib/auth";
import type { Topic, Article, ExaCategory } from "@/types";

export const maxDuration = 60;

// Lazy initialization to avoid build-time errors
let anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!anthropic) {
    anthropic = new Anthropic();
  }
  return anthropic;
}

const tools: Anthropic.Tool[] = [
  {
    name: "askFollowUp",
    description: "Ask the user a follow-up question with multiple choice options. Set allowMultiple=true to let users select multiple options.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string", description: "The follow-up question to ask" },
        options: {
          type: "array",
          description: "2-5 options for the user to choose from",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: "Short label for the option" },
              value: { type: "string", description: "Value to use if selected" },
            },
            required: ["label", "value"],
          },
        },
        allowMultiple: {
          type: "boolean",
          description: "If true, user can select multiple options. Default false."
        },
      },
      required: ["question", "options"],
    },
  },
  {
    name: "extractTopics",
    description: "Extract topics of interest from the conversation when the user has expressed clear interests.",
    input_schema: {
      type: "object" as const,
      properties: {
        topics: {
          type: "array",
          description: "Array of topics to extract",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Short name for the topic" },
              description: { type: "string", description: "Brief description" },
              searchQueries: {
                type: "array",
                items: { type: "string" },
                description: "2-3 search queries"
              },
              category: {
                type: "string",
                enum: ["news", "research paper", "company", "github", "tweet", "personal site", "pdf"],
                description: "Content category"
              },
              dateRange: {
                type: "string",
                enum: ["day", "2days", "week", "month"],
                description: "How recent (default: 2days for last 48 hours)"
              },
            },
            required: ["name", "description", "searchQueries", "category", "dateRange"],
          },
        },
      },
      required: ["topics"],
    },
  },
  {
    name: "searchContent",
    description: "Search for articles on a topic using Exa. Use this when the user wants to see articles.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        category: {
          type: "string",
          enum: ["news", "research paper", "company", "github", "tweet", "personal site", "pdf"],
          description: "Category"
        },
        numResults: { type: "number", description: "Number of results" },
        dateRange: {
          type: "string",
          enum: ["day", "2days", "week", "month"],
          description: "Recency (default: 2days for last 48 hours)"
        },
      },
      required: ["query"],
    },
  },
];

async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  if (toolName === "askFollowUp") {
    const { question, options, allowMultiple } = toolInput as {
      question: string;
      options: Array<{ label: string; value: string }>;
      allowMultiple?: boolean;
    };
    return {
      success: true,
      question,
      options,
      allowMultiple: allowMultiple || false,
      message: "Follow-up question presented to user",
    };
  }

  if (toolName === "extractTopics") {
    const { topics } = toolInput as { topics: Array<{ name: string; description: string; searchQueries: string[]; category: string; dateRange: string }> };
    const extractedTopics: Topic[] = topics.map((t) => ({
      id: crypto.randomUUID(),
      name: t.name,
      description: t.description,
      searchQueries: t.searchQueries,
      category: t.category as ExaCategory,
      dateRange: t.dateRange as "day" | "week" | "month",
      isActive: true,
      createdAt: new Date(),
    }));
    return {
      success: true,
      topics: extractedTopics,
      message: `Extracted ${extractedTopics.length} topic(s)`,
    };
  }

  if (toolName === "searchContent") {
    const { query, category, numResults, dateRange } = toolInput as {
      query: string;
      category?: string;
      numResults?: number;
      dateRange?: string;
    };
    try {
      // Fetch more results since filtering may remove some
      const rawResults = await searchExa(query, {
        category: category as ExaCategory | undefined,
        numResults: (numResults || 5) + 3,
        dateRange: (dateRange as "day" | "2days" | "week" | "month") || "2days",
      });

      // Filter and enhance with AI - validates quality and adds personalized summaries
      const enhancedResults = await filterAndEnhanceResults(rawResults, query);

      // Take only the requested number after filtering
      const finalResults = enhancedResults.slice(0, numResults || 5);
      const articles: Article[] = finalResults.map((r) => transformToArticle(r, []));
      return {
        success: true,
        articles,
        message: `Found ${articles.length} article(s)`,
      };
    } catch (error) {
      return { success: false, articles: [], message: `Search failed: ${error}` };
    }
  }

  return { error: "Unknown tool" };
}

export async function POST(req: Request) {
  console.log("Chat API called");
  try {
    console.log("Checking rate limit...");
    if (!validateRequest(req)) {
      return unauthorizedResponse();
    }

    console.log("Checking API key...");
    // Check for API key before attempting to use the API
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    console.log("Parsing request body...");
    const { messages } = await req.json();

    // Convert messages to Anthropic format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    console.log("Calling Anthropic API...");
    // Create initial response - using Haiku for speed (Vercel Hobby has 10s limit)
    let response = await getAnthropic().messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: anthropicMessages,
  });

  // Handle tool use loop
  const allContent: Array<{ type: string; text?: string; toolName?: string; toolResult?: unknown }> = [];

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    // Add any text content first
    for (const block of response.content) {
      if (block.type === "text") {
        allContent.push({ type: "text", text: block.text });
      }
    }

    // Execute tools and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      const result = await executeToolCall(toolUse.name, toolUse.input as Record<string, unknown>);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
      allContent.push({ type: "tool_result", toolName: toolUse.name, toolResult: result });
    }

    // Continue conversation with tool results
    response = await getAnthropic().messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: [
        ...anthropicMessages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ],
    });
  }

  // Add final text content
  for (const block of response.content) {
    if (block.type === "text") {
      allContent.push({ type: "text", text: block.text });
    }
  }

  // Build response for client
  const textContent = allContent
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const toolResults = allContent.filter((c) => c.type === "tool_result");

    return Response.json({
      role: "assistant",
      content: textContent,
      toolResults,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    );
  }
}
