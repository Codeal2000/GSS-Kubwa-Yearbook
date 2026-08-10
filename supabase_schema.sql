-- GSS KUBWA CLASS OF 2026 YEARBOOK - SUPABASE SCHEMA & RLS POLICIES

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

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR STUDENTS
DROP POLICY IF EXISTS "Public read students" ON public.students;
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow student update" ON public.students;
CREATE POLICY "Allow student update" ON public.students FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert student" ON public.students;
CREATE POLICY "Allow insert student" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete student" ON public.students;
CREATE POLICY "Allow delete student" ON public.students FOR DELETE USING (true);

-- POLICIES FOR COMMENTS
DROP POLICY IF EXISTS "Public read approved comments" ON public.comments;
CREATE POLICY "Public read approved comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert comments as pending" ON public.comments;
CREATE POLICY "Insert comments as pending" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Moderate comments" ON public.comments;
CREATE POLICY "Moderate comments" ON public.comments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete comments" ON public.comments;
CREATE POLICY "Delete comments" ON public.comments FOR DELETE USING (true);

-- POLICIES FOR USER_VOTES
DROP POLICY IF EXISTS "Public read votes" ON public.user_votes;
CREATE POLICY "Public read votes" ON public.user_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert votes" ON public.user_votes;
CREATE POLICY "Insert votes" ON public.user_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Delete votes" ON public.user_votes;
CREATE POLICY "Delete votes" ON public.user_votes FOR DELETE USING (true);

-- ATOMIC POSTGRES RPC FUNCTION FOR VOTING (PREVENTS RACE CONDITIONS)
CREATE OR REPLACE FUNCTION public.vote_for_student(
  p_student_id TEXT,
  p_category_id TEXT,
  p_delta INT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.students
  SET votes = jsonb_set(
    COALESCE(votes, '{}'::jsonb),
    ARRAY[p_category_id],
    to_jsonb(GREATEST(0, COALESCE((votes->>p_category_id)::int, 0) + p_delta))
  )
  WHERE id = p_student_id OR exam_number = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
