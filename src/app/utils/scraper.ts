
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core"

export const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

export async function scrapeUrl(url: string) {
  // Check if the URL is valid
  if (!url.match(urlPattern)) {
    throw new Error("Invalid URL provided.");
  }

  try {
    console.log(`Starting scrape for: ${url}`);
    let html: string;

    // Try to fetch static content with axios
    try {
      const response = await axios.get(url, { timeout: 5000 });
      html = response.data; // Static HTML content
      console.log("Static content fetched via axios.");
    } catch (axiosError) {
      console.warn(
        "Static content fetching failed. Switching to Puppeteer for dynamic rendering."
      );

      // Fallback to Puppeteer for dynamic websites
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      html = await page.content(); // Fully rendered HTML
      console.log("Dynamic content fetched via Puppeteer.");
      await browser.close();
    }

    // Parse the HTML with Cheerio
    const $ = cheerio.load(html);

    // Extracting key data
    const title = $("title").text().trim(); // Page title
    const h1 = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(", "); // All h1 tags
    const h2 = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(", "); // All h2 tags

    // Attempt to extract main content
    let mainContent = $("main").text().trim(); // <main> tag content
    if (!mainContent) {
      mainContent = $("article").text().trim(); // Fallback to <article>
    }
    if (!mainContent) {
      mainContent = $("body").text().trim(); // Fallback to <body>
    }

    // Clean up text content
    mainContent = mainContent.replace(/\s+/g, " "); // Normalize whitespace

    // Summarize the content
    const summary = {
      url,
      title: title || "No title found",
      headings: {
        h1: h1 || "No h1 found",
        h2: h2 || "No h2 found",
      },
      summary: mainContent.slice(0, 1000), // Truncate the content to 1000 characters
    };

    console.log("Scrape Summary:", summary);
    return summary;
  } catch (error) {
    console.error("Scraping failed:", error);
    return {
      url,
      error: "An error occurred during scraping.",
    };
  }
}
