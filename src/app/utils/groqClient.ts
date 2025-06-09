
    
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function getGroqResponse(context: string): Promise<string> {
  const prompt = `
You are a helpful assistant with expert-level reasoning and summarization abilities.

I will provide you with multiple sources of information scraped from the web. Each source includes its URL, page title, headings, and a summary of the main content extracted from the page.

Your task is to:
1. Analyze and understand the key ideas from all the sources.
2. Identify the most relevant information that answers the user’s question.
3. Cross-reference between sources to avoid redundancy and ensure completeness.
4. Present your response in a clear and well-structured format using bullet points, paragraphs, or headings.

Avoid copying text directly from the sources. Rephrase content in your own words and focus on clarity, relevance, and readability.

--- 

${context} 
`;

  const chatCompletion = await groq.chat.completions.create({
    model:"llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 800,
  });

  return chatCompletion.choices[0]?.message?.content || "No answer found.";
}
