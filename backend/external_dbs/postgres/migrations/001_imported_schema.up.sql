-- Create the notes table with basic structure
CREATE TABLE public.notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    path TEXT UNIQUE,
    content TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create index on path for faster lookups
CREATE INDEX idx_notes_path ON public.notes(path);

-- Create index on updated_at for ordering
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
