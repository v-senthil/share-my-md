
-- Table for markdown documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  share_id TEXT UNIQUE,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Public read access for shared documents (via share_id)
CREATE POLICY "Anyone can view shared documents"
ON public.documents
FOR SELECT
USING (is_shared = true AND share_id IS NOT NULL);

-- Allow anonymous inserts (no auth required for v1)
CREATE POLICY "Anyone can create documents"
ON public.documents
FOR INSERT
WITH CHECK (true);

-- Allow updates on own documents (by id)
CREATE POLICY "Anyone can update documents"
ON public.documents
FOR UPDATE
USING (true);

-- Allow deletes
CREATE POLICY "Anyone can delete documents"
ON public.documents
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
