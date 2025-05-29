import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeUrl } from "@/app/utils/scraper";

// Define expected types
type ScrapeSuccess = {
  url: string;
  title: string;
  summary: string;
};

type ScrapeFailure = {
  url: string;
  error: string;
};

type ScrapeResult = ScrapeSuccess | ScrapeFailure;

// Type guard to check if a result is a successful scrape
function isScrapeSuccess(result: ScrapeResult): result is ScrapeSuccess {
  return !("error" in result);
}

export async function POST(req: Request) {
  try {
    const { urls, question } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0 || !question) {
      return NextResponse.json({ error: "Missing URLs or question." }, { status: 400 });
    }

    // Scrape all URLs in parallel
    const results: ScrapeResult[] = await Promise.all(
      urls.map((url: string) => scrapeUrl(url))
    );

    // Filter only successful scrapes
    const successfulScrapes = results.filter(isScrapeSuccess);

    if (successfulScrapes.length === 0) {
      return NextResponse.json({ error: "Failed to scrape all URLs." }, { status: 500 });
    }

    // Build context from scraped data
    const context = successfulScrapes
      .map(
        (page, i) =>
          `Source [${i + 1}]: ${page.url}\nTitle: ${page.title}\nContent: ${page.summary}`
      )
      .join("\n\n");

    const fullPrompt = `${context}\n\nQuestion: ${question}`;

    // Ask Groq for the response
    const answer = await getGroqResponse(fullPrompt);

    // Return the response along with sources
    return NextResponse.json({
      answer,
      sources: successfulScrapes.map((page, i) => ({
        index: i + 1,
        url: page.url,
        title: page.title,
        snippet: page.summary.slice(0, 200), // Optional for frontend preview
      })),
    });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
