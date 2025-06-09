
import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { crawlWebsite } from "@/app/utils/scraper";

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

function isScrapeSuccess(result: ScrapeResult): result is ScrapeSuccess {
  return !("error" in result);
}

export async function POST(req: Request) {
  try {
    const { urls, question } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0 || !question) {
      return NextResponse.json({ error: "Missing URLs or question." }, { status: 400 });
    }

    // Crawl each URL (depth = 2, max 5 pages per domain)
    const crawlResults = await Promise.all(
      urls.map((url: string) => crawlWebsite(url, 2, 5))
    );

    const results: ScrapeResult[] = crawlResults.flat().map((page) => ({
      url: page.url,
      title: page.title,
      summary: page.summary,
    }));

    const successfulScrapes = results.filter(isScrapeSuccess);

    if (successfulScrapes.length === 0) {
      return NextResponse.json({ error: "Failed to scrape any content." }, { status: 500 });
    }

    const context = successfulScrapes
      .map(
        (page, i) =>
          `Source [${i + 1}]: ${page.url}\nTitle: ${page.title}\nContent: ${page.summary}`
      )
      .join("\n\n");

    const fullPrompt = `You are a helpful assistant. Based on the content below, answer the user's question in a clean, paragraph-style summary that is clear and easy to read. Do not just list bullet points. Write in natural, human-like English.
    
    ${context}\n\nQuestion: ${question}
    Answer (clear and concise):
    `;
    const answer = await getGroqResponse(fullPrompt);

    return NextResponse.json({
      answer,
      sources: successfulScrapes.map((page, i) => ({
        index: i + 1,
        url: page.url,
        title: page.title,
        snippet: page.summary.slice(0, 200),
      })),
    });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
