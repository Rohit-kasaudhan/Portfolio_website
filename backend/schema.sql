-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create table to store portfolio text chunks and their embeddings
create table if not exists public.portfolio_embeddings (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(768) -- Gemini text-embedding-004 generates 768-dimensional vectors
);

-- Enable Row Level Security (RLS) on public schema
alter table public.portfolio_embeddings enable row level security;

-- Create policy to allow public select reads
create policy "Allow public read access" 
  on public.portfolio_embeddings 
  for select 
  using (true);

-- Create policy to allow all actions for service keys / authenticated imports
create policy "Allow all authenticated access" 
  on public.portfolio_embeddings 
  for all 
  using (true);

-- Create policy to allow all actions for public access (anon ingestion and read)
create policy "Allow all public access" 
  on public.portfolio_embeddings 
  for all 
  using (true)
  with check (true);

-- Create HNSW index for similarity calculations (cosine distance)
create index if not exists portfolio_embeddings_hnsw_idx 
  on public.portfolio_embeddings 
  using hnsw (embedding vector_cosine_ops);

-- Create similarity search matching function
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql stats safe
as $$
begin
  return query
  select
    portfolio_embeddings.id,
    portfolio_embeddings.content,
    portfolio_embeddings.metadata,
    1 - (portfolio_embeddings.embedding <=> query_embedding) as similarity
  from portfolio_embeddings
  where 1 - (portfolio_embeddings.embedding <=> query_embedding) > match_threshold
  order by portfolio_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
