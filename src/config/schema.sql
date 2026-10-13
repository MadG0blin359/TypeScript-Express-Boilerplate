-- ==============================================================================
-- Supabase Database Schema & Setup for TypeScript-Express-Supabase Boilerplate
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Items Table (Example Resource)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_items_updated_at ON public.items;
CREATE TRIGGER set_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Allow anyone (public/anon) to read items
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT 
USING (true);

-- Allow authenticated users to create items
CREATE POLICY "Authenticated users can create items" 
ON public.items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own items
CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own items
CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_completed ON public.items(completed);

-- 7. Supabase Storage Setup (Run if bucket doesn't already exist)
-- Creates 'uploads' bucket in Supabase Storage with 10MB file limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies:
-- Anyone can view files from the uploads bucket
CREATE POLICY "Public uploads access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Authenticated users can upload to the bucket
CREATE POLICY "Authenticated user upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
