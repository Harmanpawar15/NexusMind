#  NEXUS MIND : AI-Powered Web Content Summarizer & Q&A



---

## 🚀 Project Overview

This project is a **Next.js** app that crawls and scrapes web pages from provided URLs, extracts relevant content, and generates concise, easy-to-read answers to user questions using AI (powered by GROQ API). It’s designed for improving content readability and delivering quick, clear responses based on actual web content.

Key features:

- 🔍 Scrapes multiple pages recursively with Puppeteer fallback  
- 🧠 Extracts page titles, headings, and main content intelligently  
- 💬 Uses AI to generate summarized, simplified answers from scraped data  
- ❓ Supports question answering based on live web content  
- 🔗 Share your conversation via link and let others continue the same thread
- 🌐 Deployable on Vercel with environment variable configuration  


---

## 🛠️ Tech Stack

- Next.js 15
- TypeScript
- Puppeteer (for dynamic content scraping fallback)
- Axios & Cheerio (for static scraping and parsing)
- GROQ API (for AI-powered response generation)
- Vercel (deployment platform)

---

## 🔧 Setup & Installation

1. **Clone the repo**

```bash
git clone https://github.com/Harmanpawar15/NexusMind.git
cd NexusMind
```


 2.Install dependencies
```bash
npm install
```
3.Configure environment variables
- Create a .env.local file at the project root with:
```bash
CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
GROQ_API_KEY="your_groq_api_key_here"
```

Note:
On Vercel, set these environment variables in your project dashboard (Settings > Environment Variables).
CHROME_EXECUTABLE_PATH may differ based on your OS; ensure Puppeteer can launch Chrome correctly.

4.Run the development server
```bash
npm run dev
```
- Open http://localhost:3000 in your browser to see the app.

---
## 🚀 Deployment on Vercel

- Push your code to GitHub (main branch).
- Import your repo on Vercel.
- Add environment variables (CHROME_EXECUTABLE_PATH and GROQ_API_KEY) in Vercel project settings.
- Vercel will automatically build and deploy your Next.js app.
- Access your live app via the generated Vercel URL.

---

## 📋 Usage

- Enter one or more URLs to crawl.
- Ask a question related to the content on those URLs.
- The app will scrape the sites, extract content, and generate a simple, readable answer using AI.



## Here’s a live deployed instance you can try:

https://nexus-mind-7hpdgiiu6-harmans-projects-5c411508.vercel.app

---

## 🧪 Example Question to Try
- Question: What is JavaScript and how does it relate to web browsers?
- Sample URLs:
https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## 🧩 Project Structure Highlights

- src/app/api/save_chat/route.ts - API route handling question & scraping requests.
- src/app/utils/scraper.ts - Core scraping logic with Axios, Puppeteer, Cheerio.
- src/app/page.tsx - Main frontend UI.
- .env.local - Environment variables for sensitive config.
- next.config.js - Next.js config (optional ESLint relaxations for deployment).

---

## ⚙️ Important Notes

- The app scrapes live websites, so responses depend on the current content.
- Puppeteer fallback enables dynamic content scraping but requires a correct Chrome executable path.
- ESLint is configured strictly; adjust if you get errors during Vercel build.
- Make sure to keep your API keys secure.
