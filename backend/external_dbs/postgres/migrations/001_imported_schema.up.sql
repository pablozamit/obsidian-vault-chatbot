CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;
CREATE SCHEMA supabase_migrations;
CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE FUNCTION public.match_notes(query_embedding public.vector, match_threshold double precision, match_count integer) RETURNS TABLE(id bigint, title text, path text, content text, similarity double precision)
    LANGUAGE sql STABLE
    AS $$
    SELECT
        n.id,
        n.title,
        n.path,
        n.content,
        1 - (n.embedding <=> query_embedding) AS similarity
    FROM public.notes n
    WHERE 1 - (n.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
CREATE TABLE public.notes (
    id bigint NOT NULL,
    title text,
    path text,
    content text,
    embedding public.vector(1536),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE SEQUENCE public.notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;
CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);
CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);
ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);