

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core";
import { URL } from "url";


export const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

/** Scrapes a single URL */
export async function scrapeUrl(url: string): Promise<any> {
  if (!url.match(urlPattern)) throw new Error("Invalid URL provided.");

  try {
    console.log(`Starting scrape for: ${url}`);
    let html: string;

    try {
      const response = await axios.get(url, { timeout: 5000 });
      html = response.data;
      console.log("Static content fetched via axios.");
    } catch (axiosError) {
      console.warn("Axios failed. Using Puppeteer instead.");
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      html = await page.content();
      await browser.close();
    }

    const $ = cheerio.load(html);
    const title = $("title").text().trim();
    const h1 = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(", ");
    const h2 = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(", ");

    let mainContent = $("main").text().trim();
    if (!mainContent) mainContent = $("article").text().trim();
    if (!mainContent) mainContent = $("body").text().trim();
    mainContent = mainContent.replace(/\s+/g, " ");

    return {
      url,
      html, // keep html for crawling links
      title: title || "No title found",
      headings: {
        h1: h1 || "No h1 found",
        h2: h2 || "No h2 found",
      },
      summary: mainContent.slice(0, 1000),
    };
  } catch (error) {
    console.error("Scraping failed:", error);
    return {
      url,
      error: "An error occurred during scraping.",
    };
  }
}

/** Extracts all internal links from a page */
export function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("mailto:") && !href.startsWith("javascript:")) {
      try {
        const fullUrl = new URL(href, baseUrl).toString();
        const baseDomain = new URL(baseUrl).hostname;
        if (new URL(fullUrl).hostname === baseDomain) {
          links.push(fullUrl);
        }
      } catch (_) {
        // Skip invalid URLs
      }
    }
  });

  return [...new Set(links)]; // unique links only
}

/** Crawls a website recursively */
export async function crawlWebsite(
  startUrl: string,
  maxDepth = 2,
  maxPages = 10
): Promise<any[]> {
  const visited = new Set<string>();
  const results: any[] = [];
  let pagesCrawled = 0;

  async function crawl(url: string, depth: number) {
    if (
      depth > maxDepth ||
      visited.has(url) ||
      pagesCrawled >= maxPages
    ) {
      return;
    }

    visited.add(url);
    pagesCrawled++;

    console.log(`Crawling [${depth}]: ${url}`);
    const page = await scrapeUrl(url);
    results.push({
      url: page.url,
      title: page.title,
      headings: page.headings,
      summary: page.summary,
    });

    const internalLinks = extractInternalLinks(page.html, url);
    for (const link of internalLinks) {
      if (pagesCrawled >= maxPages) break;
      await crawl(link, depth + 1);
    }
  }

  await crawl(startUrl, 0);
  return results;
}
