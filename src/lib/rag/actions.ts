"use server";

import { openaiClient } from "@/lib/openai/client";
import { createClient } from "@/lib/supabase/server";
import { type CoreMessage, embed, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

const EMBEDDING_MODEL =
  process.env.NEXT_PUBLIC_EMBEDDING_MODEL || "text-embedding-3-small";

const generateEmbedding = async (message: string) => {
  return embed({
    model: openaiClient.embedding(EMBEDDING_MODEL),
    value: message,
  });
};

const transformSupabaseDocuments = (data: any) => {
  return JSON.stringify(
    data.map(
      (item: any) => `
        Source: ${item.file_name}
        Date Updated: ${item.created_at}
        Content: ${item.content}
        `,
    ),
  );
};

const createPrompt = (context: string, userQuestion: string): CoreMessage => {
  return {
    role: "system" as const,
    content: `
      You are an AI-powered economic research chatbot for AlbertaPerspectives.ca.
      Your primary purpose is to provide valuable economic insights to the Alberta business community.
      
      **Instructions for answering:**
      1.  **Rely Solely on Context:** Use ONLY the following provided context to answer the user's question.
      2.  **Scope Adherence:** Only answer questions directly related to economic data and business insights for Alberta.
      3.  **Format:** Return your answer in markdown format.
      4.  **Attribution (if applicable):** If the context includes specific dates or source links, integrate them naturally into your answer.

      ----------------
      START CONTEXT
      ${context}
      END CONTEXT
      ----------------

      **Handling specific scenarios:**
      * **Insufficient Context:** If the provided context does not contain enough information to fully answer the question, state clearly that the information is not available in the current research documents. DO NOT invent information or use external knowledge.
      * **Out-of-Scope Questions:** If the user asks a question that is not related to Alberta's economic data or business insights, politely inform them that you can only answer questions within your defined scope.

      ----------------
      QUESTION: ${userQuestion}
      ----------------
      `,
  };
};

export const submitQuery = async (query: string) => {
  const stream = createStreamableValue("");

  // in order to avoid blocking the return
  (async () => {
    try {
      const supabase = await createClient();
      const { embedding } = await generateEmbedding(query);

      const { data, error: rpcError } = await supabase.rpc("search_documents", {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10,
      });
      if (rpcError) {
        throw new Error(`Supabase RPC Error: ${rpcError.message}`);
      }

      const context = transformSupabaseDocuments(data);

      console.log("RPC data query:", data);
      console.log("Context for query:", context);

      const prompt = createPrompt(context, query);

      const { textStream } = streamText({
        model: openaiClient("gpt-3.5-turbo"),
        messages: [prompt],
      });

      // Pipe the LLM stream into our streamable value
      for await (const delta of textStream) {
        stream.update(delta);
      }
    } catch (e: any) {
      stream.update(`An error occurred: ${e.message}`);
    } finally {
      stream.done();
    }
  })();

  return { stream: stream.value };
};
