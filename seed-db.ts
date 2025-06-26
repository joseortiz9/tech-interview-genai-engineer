import { promises as fs } from "fs";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import pdf from "pdf-parse";

// Load env vars from .env file
config();

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMBEDDING_MODEL =
  process.env.NEXT_PUBLIC_EMBEDDING_MODEL || "text-embedding-3-small"; // This model outputs 1536 dimensions
const SAMPLE_DATA_FOLDER = "./samples";

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in .env");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE SECRETS are not set in .env");
  process.exit(1);
}

const embeddings = new OpenAIEmbeddings({
  model: EMBEDDING_MODEL,
  configuration: {
    apiKey: OPENAI_API_KEY,
  },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Reads a PDF file and extracts its text content.
 * @param filePath The full path to the PDF file.
 * @returns A promise that resolves with the extracted text.
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  console.log(`Extracting text from: ${filePath}`);
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  console.log(`Successfully extracted text from: ${filePath}`);
  return data.text;
}

/**
 * Chunks the given text into smaller pieces.
 * @param text The full text content to chunk.
 * @returns A promise that resolves with an array of text chunks.
 */
async function chunkText(text: string): Promise<string[]> {
  console.log("Chunking text...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400, // Max characters per chunk
    chunkOverlap: 50, // Overlap between chunks to maintain context
  });
  const docs = await splitter.createDocuments([text]);
  const chunks = docs.map((doc) => doc.pageContent);
  console.log(`Created ${chunks.length} chunks.`);
  return chunks;
}

/**
 * Generates embeddings for an array of text chunks.
 * @param chunks An array of text strings.
 * @returns A promise that resolves with an array of embedding vectors.
 */
async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  console.log(`Generating embeddings for ${chunks.length} chunks...`);
  const chunkEmbeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await embeddings.embedQuery(chunks[i]);
      chunkEmbeddings.push(embedding);
      console.log(`Generated embedding for chunk ${i + 1}/${chunks.length}`);
    } catch (error) {
      console.error(`Error generating embedding for chunk ${i + 1}:`, error);
      throw new Error(`Failed to generate embedding for chunk ${i + 1}`);
    }
  }
  console.log("Finished generating embeddings.");
  return chunkEmbeddings;
}

/**
 * Inserts document chunks and their embeddings into the PostgreSQL database using Supabase.
 * @param fileName The name of the original PDF file.
 * @param chunks An array of text chunks.
 * @param embeddings An array of embedding vectors corresponding to the chunks.
 */
async function insertIntoDatabase(
  fileName: string,
  chunks: string[],
  embeddings: number[][],
): Promise<void> {
  console.log(
    `Inserting ${chunks.length} chunks for ${fileName} into database using Supabase...`,
  );

  const dataToInsert = chunks.map((chunk, i) => ({
    file_name: fileName,
    page_number: 1, // pdf-parse doesn't easily provide per-chunk page numbers
    content: chunk,
    embedding: embeddings[i],
  }));

  const { data, error } = await supabase.from("documents").insert(dataToInsert);

  if (error) {
    console.error(`Error inserting data for ${fileName}:`, error);
    throw new Error(`Failed to insert data into Supabase: ${error.message}`);
  } else {
    console.log(
      `Successfully inserted all chunks for ${fileName} into Supabase.`,
    );
  }
}

async function main() {
  try {
    console.log(`Starting PDF processing from folder: ${SAMPLE_DATA_FOLDER}`);
    const files = await fs.readdir(SAMPLE_DATA_FOLDER);
    const pdfFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".pdf"),
    );

    if (pdfFiles.length === 0) {
      console.warn(`No PDF files found in ${SAMPLE_DATA_FOLDER}. Exiting.`);
      return;
    }

    for (const pdfFile of pdfFiles) {
      const filePath = path.join(SAMPLE_DATA_FOLDER, pdfFile);
      console.log(`--- Processing file: ${pdfFile} ---`);

      try {
        const text = await extractTextFromPdf(filePath);
        const chunks = await chunkText(text);
        const chunkEmbeddings = await generateEmbeddings(chunks);
        await insertIntoDatabase(pdfFile, chunks, chunkEmbeddings);
        console.log(`--- Finished processing ${pdfFile} ---`);
      } catch (fileError) {
        console.error(`Failed to process ${pdfFile}:`, fileError);
      }
    }
    console.log("All PDF files processed (or attempted).");
  } catch (dirError) {
    console.error(`Error reading PDF folder ${SAMPLE_DATA_FOLDER}:`, dirError);
  }
}

main().catch((error) => {
  console.error("An unhandled error occurred during script execution:", error);
  process.exit(1);
});
