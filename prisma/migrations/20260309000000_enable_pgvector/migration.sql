-- Enable pgvector extension for the whole project (shared Postgres).
-- Required for legal_ai embeddings and vector search.
CREATE EXTENSION IF NOT EXISTS vector;
