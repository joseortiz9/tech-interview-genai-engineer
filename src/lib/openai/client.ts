import { createOpenAI } from "@ai-sdk/openai";

export const openaiClient = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
