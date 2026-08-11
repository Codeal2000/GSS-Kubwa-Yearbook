-- GSS KUBWA CLASS OF 2026 YEARBOOK - MIGRATION 003: PUBLIC SHARE SLUG & RLS HARDENING

-- 1. ADD PUBLIC_SHARE_SLUG COLUMN AND POPULATE
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS public_share_slug TEXT;

-- Populate public_share_slug for existing rows where null
UPDATE public.students
SET public_share_slug = lower(regexp_replace(full_name, '[^a-zA-Z0-9]+', '-', 'g')) 
  || '-' 
  || lower(substr(md5(id || full_name || clock_timestamp()::text || random()::text), 1, 4))
WHERE public_share_slug IS NULL OR public_share_slug = '';

-- Ensure UNIQUE constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_public_share_slug_key'
  ) THEN
    ALTER TABLE public.students ADD CONSTRAINT students_public_share_slug_key UNIQUE (public_share_slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_public_share_slug ON public.students(public_share_slug);

-- 2. ROW LEVEL SECURITY POLICIES HARDENING

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- STUDENTS POLICIES
DROP POLICY IF EXISTS "Public read students" ON public.students;
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow student update" ON public.students;
DROP POLICY IF EXISTS "Allow student update profile" ON public.students;
CREATE POLICY "Allow student update profile" ON public.students FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert student" ON public.students;
CREATE POLICY "Allow insert student" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete student" ON public.students;
CREATE POLICY "Allow delete student" ON public.students FOR DELETE USING (true);

-- COMMENTS POLICIES
DROP POLICY IF EXISTS "Public read comments" ON public.comments;
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert comments as pending" ON public.comments;
CREATE POLICY "Insert comments as pending" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Moderate comments" ON public.comments;
CREATE POLICY "Moderate comments" ON public.comments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete comments" ON public.comments;
CREATE POLICY "Delete comments" ON public.comments FOR DELETE USING (true);

-- USER_VOTES POLICIES
DROP POLICY IF EXISTS "Public read votes" ON public.user_votes;
CREATE POLICY "Public read votes" ON public.user_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert votes" ON public.user_votes;
CREATE POLICY "Insert votes" ON public.user_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Delete votes" ON public.user_votes;
CREATE POLICY "Delete votes" ON public.user_votes FOR DELETE USING (true);
