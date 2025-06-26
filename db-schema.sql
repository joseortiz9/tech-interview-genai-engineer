CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name   TEXT NOT NULL,                  -- Original PDF file name
    page_number INTEGER,                        -- Page number if applicable
    content     TEXT NOT NULL,                  -- The text content of the chunk
    embedding   VECTOR(1536),                   -- The OpenAI embedding (text-embedding-3-small model outputs 1536 dimensions)
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create an index for faster similarity searches (optional, but recommended for large datasets)
-- Using HNSW for better performance with vector searches
-- Replace 'lists' and 'dimensions' with appropriate values for your dataset size and embedding dimensions
-- For text-embedding-3-small, dimensions is 1536.
-- The 'lists' parameter for IVFFlat index should be roughly `num_rows / 1000` for good performance.
-- For HNSW, the 'm' (max connections per node) and 'ef_construction' (search scope during construction)
-- parameters can be tuned. Default values are often a good starting point.
CREATE INDEX ON documents USING HNSW (embedding vector_cosine_ops);

-- 2. Chats Table
CREATE TABLE IF NOT EXISTS chats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT,
    title       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster chat retrieval by user
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats (user_id);


-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id     UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,                          -- Role of the sender: 'user', 'assistant', 'system'
    content     TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Optional: Fields specific to RAG (Retrieval-Augmented Generation)
    embedding_query         VECTOR(1536),            -- The embedding of the user's query (if applicable)
    retrieved_document_ids  UUID[]                   -- Array of UUIDs of document chunks retrieved for this message/response
);

-- Create indexes for faster message retrieval within a chat
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id, created_at);


-- Create a function to search for similar documents
-- This function takes a query embedding (as a string representation of a vector)
-- and returns the most similar document chunks.
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.1,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    file_name TEXT,
    page_number INTEGER,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT
    d.id,
    d.file_name,
    d.page_number,
    d.content,
    d.created_at,
    1 - (d.embedding <=> query_embedding) AS similarity -- Cosine similarity calculation
FROM
    documents d
WHERE
    1 - (d.embedding <=> query_embedding) > match_threshold -- Filter by similarity threshold
ORDER BY
    d.embedding <=> query_embedding -- Order by distance (closest first)
    LIMIT match_count;
END;
$$;
