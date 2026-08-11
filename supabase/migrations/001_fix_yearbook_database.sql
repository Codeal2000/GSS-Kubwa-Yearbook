-- GSS KUBWA CLASS OF 2026 YEARBOOK - PRODUCTION SUPABASE MIGRATION 001

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  exam_number TEXT UNIQUE,
  photo_filename TEXT,
  birth_date TEXT,
  votes JSONB DEFAULT '{}'::jsonb,
  quote TEXT,
  hobbies TEXT,
  career_path TEXT,
  email TEXT,
  phone TEXT,
  featured_on_home BOOLEAN DEFAULT false,
  pending_profile_update JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS exam_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_filename TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS votes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hobbies TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS career_path TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS featured_on_home BOOLEAN DEFAULT false;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pending_profile_update JSONB DEFAULT NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'student',
  text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER VOTES TABLE
CREATE TABLE IF NOT EXISTS public.user_votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  student_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_students_pending_profile_update ON public.students USING GIN (pending_profile_update);
CREATE INDEX IF NOT EXISTS idx_students_exam_number ON public.students (exam_number);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments (status);
CREATE INDEX IF NOT EXISTS idx_comments_student_id ON public.comments (student_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments (author_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON public.user_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_category_id ON public.user_votes (category_id);

-- RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read students" ON public.students;
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow student update" ON public.students;
CREATE POLICY "Allow student update" ON public.students FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert student" ON public.students;
CREATE POLICY "Allow insert student" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete student" ON public.students;
CREATE POLICY "Allow delete student" ON public.students FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read comments" ON public.comments;
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert comments as pending" ON public.comments;
CREATE POLICY "Insert comments as pending" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Moderate comments" ON public.comments;
CREATE POLICY "Moderate comments" ON public.comments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete comments" ON public.comments;
CREATE POLICY "Delete comments" ON public.comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read votes" ON public.user_votes;
CREATE POLICY "Public read votes" ON public.user_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert votes" ON public.user_votes;
CREATE POLICY "Insert votes" ON public.user_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Delete votes" ON public.user_votes;
CREATE POLICY "Delete votes" ON public.user_votes FOR DELETE USING (true);

-- REALTIME
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'students'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;
