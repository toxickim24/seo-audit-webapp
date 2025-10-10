import OpenAI from "openai";

// Lazy-load OpenAI client so dotenv variables are ready
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ Missing OPENAI_API_KEY environment variable");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
