/*
# Academic Management Platform — Core Schema

## Overview
Creates the full data model for an AI-powered learning & academic management platform:
users (students/teachers/admins), courses, enrollments, assignments, submissions,
attendance, exams, grades, announcements, and AI logs/insights.

## New Tables
1. `profiles` — extends Supabase auth.users with role (student | teacher | admin), full_name, avatar_url, bio, department.
2. `courses` — catalog of courses; each owned by a teacher; has category, level, description, thumbnail, schedule, capacity.
3. `enrollments` — student ↔ course membership with status (active | completed | dropped) and progress percent.
4. `assignments` — assignments per course with title, description, due_date, max_score, ai_feedback_enabled.
5. `submissions` — a student's submission for an assignment: content, submitted_at, score, ai_feedback, status.
6. `attendance` — per-session attendance records (course_id, student_id, date, status: present | absent | late | excused).
7. `exams` — exams per course with title, date, max_score.
8. `grades` — a student's grade for an exam: score, letter, feedback.
9. `announcements` — global/platform announcements for the home page.
10. `ai_logs` — AI-generated insights: target user, type, payload JSON, risk_level, created_at.

## Security (RLS)
- RLS enabled on every table.
- `profiles`: owner can read/update own; admins read all; teachers read their students (via enrollments); students read teachers of their courses.
- `courses`: public read (anon + authenticated) for catalog browsing; only teacher-owner or admin can insert/update/delete.
- `enrollments`: student can read/update own; teacher of the course can read + insert; admin full.
- `assignments`: teacher of the course or admin can write; enrolled students can read.
- `submissions`: student reads/writes own; teacher of the course can read + update (grade); admin full.
- `attendance`: student reads own; teacher of course reads + writes; admin full.
- `exams`: teacher of course or admin writes; enrolled students read.
- `grades`: student reads own; teacher of course reads + writes; admin full.
- `announcements`: public read; admin writes.
- `ai_logs`: owner reads own; admin reads all; insert allowed for authenticated.

## Notes
1. Owner columns default to `auth.uid()` where the row is created by the authenticated user.
2. Helper SECURITY DEFINER functions used in policies: `is_admin()`, `is_teacher()`, `is_teacher_of_course(course_id)`, `is_enrolled(course_id)`, `is_teacher_of_student(student_id)`.
3. All policies are idempotent (DROP POLICY IF EXISTS before CREATE).
4. A trigger auto-creates a profile row when a new auth user signs up.
5. Tables created first, then helper functions, then policies (to satisfy dependency order).
*/

-- ============================================================
-- Step 1: Create ALL tables first (no policies, no functions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin')),
  bio text DEFAULT '',
  department text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  level text NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner','Intermediate','Advanced')),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  thumbnail_url text,
  schedule text DEFAULT '',
  capacity int DEFAULT 30,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','dropped')),
  progress int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  due_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  max_score int NOT NULL DEFAULT 100,
  ai_feedback_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  file_url text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  score int,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','graded','late','returned')),
  ai_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id, session_date)
);

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  exam_date timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  max_score int NOT NULL DEFAULT 100,
  duration_minutes int DEFAULT 90,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  letter text DEFAULT '',
  feedback text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general','event','urgent','academic')),
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('performance','risk','recommendation','report','feedback')),
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_level text DEFAULT 'none' CHECK (risk_level IN ('none','low','medium','high')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Step 2: Helper functions (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = p_course_id AND c.teacher_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = p_course_id AND e.student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE e.student_id = p_student_id AND c.teacher_id = auth.uid()
  );
$$;

-- ============================================================
-- Step 3: Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 4: profiles policies
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated USING (
    auth.uid() = id OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE c.teacher_id = auth.uid() AND e.student_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE c.teacher_id = profiles.id AND e.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- Step 5: courses policies
-- ============================================================
DROP POLICY IF EXISTS "courses_select_public" ON public.courses;
CREATE POLICY "courses_select_public" ON public.courses
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "courses_insert_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_insert_teacher_or_admin" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (
    public.is_teacher() OR public.is_admin()
  );

DROP POLICY IF EXISTS "courses_update_owner_or_admin" ON public.courses;
CREATE POLICY "courses_update_owner_or_admin" ON public.courses
  FOR UPDATE TO authenticated USING (
    teacher_id = auth.uid() OR public.is_admin()
  ) WITH CHECK (
    teacher_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "courses_delete_owner_or_admin" ON public.courses;
CREATE POLICY "courses_delete_owner_or_admin" ON public.courses
  FOR DELETE TO authenticated USING (
    teacher_id = auth.uid() OR public.is_admin()
  );

-- ============================================================
-- Step 6: enrollments policies
-- ============================================================
DROP POLICY IF EXISTS "enrollments_select_own_or_teacher_or_admin" ON public.enrollments;
CREATE POLICY "enrollments_select_own_or_teacher_or_admin" ON public.enrollments
  FOR SELECT TO authenticated USING (
    student_id = auth.uid()
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "enrollments_insert_student_self" ON public.enrollments;
CREATE POLICY "enrollments_insert_student_self" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (
    student_id = auth.uid()
  );

DROP POLICY IF EXISTS "enrollments_update_own_or_teacher_or_admin" ON public.enrollments;
CREATE POLICY "enrollments_update_own_or_teacher_or_admin" ON public.enrollments
  FOR UPDATE TO authenticated USING (
    student_id = auth.uid()
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  ) WITH CHECK (
    student_id = auth.uid()
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "enrollments_delete_own_or_admin" ON public.enrollments;
CREATE POLICY "enrollments_delete_own_or_admin" ON public.enrollments
  FOR DELETE TO authenticated USING (
    student_id = auth.uid() OR public.is_admin()
  );

-- ============================================================
-- Step 7: assignments policies
-- ============================================================
DROP POLICY IF EXISTS "assignments_select_enrolled_or_teacher_or_admin" ON public.assignments;
CREATE POLICY "assignments_select_enrolled_or_teacher_or_admin" ON public.assignments
  FOR SELECT TO authenticated USING (
    public.is_enrolled(course_id)
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "assignments_insert_teacher_or_admin" ON public.assignments;
CREATE POLICY "assignments_insert_teacher_or_admin" ON public.assignments
  FOR INSERT TO authenticated WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "assignments_update_teacher_or_admin" ON public.assignments;
CREATE POLICY "assignments_update_teacher_or_admin" ON public.assignments
  FOR UPDATE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  ) WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "assignments_delete_teacher_or_admin" ON public.assignments;
CREATE POLICY "assignments_delete_teacher_or_admin" ON public.assignments
  FOR DELETE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

-- ============================================================
-- Step 8: submissions policies
-- ============================================================
DROP POLICY IF EXISTS "submissions_select_own_or_teacher_or_admin" ON public.submissions;
CREATE POLICY "submissions_select_own_or_teacher_or_admin" ON public.submissions
  FOR SELECT TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND public.is_teacher_of_course(a.course_id)
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
CREATE POLICY "submissions_insert_own" ON public.submissions
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "submissions_update_own_or_teacher_or_admin" ON public.submissions;
CREATE POLICY "submissions_update_own_or_teacher_or_admin" ON public.submissions
  FOR UPDATE TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND public.is_teacher_of_course(a.course_id)
    )
    OR public.is_admin()
  ) WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND public.is_teacher_of_course(a.course_id)
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "submissions_delete_own_or_admin" ON public.submissions;
CREATE POLICY "submissions_delete_own_or_admin" ON public.submissions
  FOR DELETE TO authenticated USING (
    student_id = auth.uid() OR public.is_admin()
  );

-- ============================================================
-- Step 9: attendance policies
-- ============================================================
DROP POLICY IF EXISTS "attendance_select_own_or_teacher_or_admin" ON public.attendance;
CREATE POLICY "attendance_select_own_or_teacher_or_admin" ON public.attendance
  FOR SELECT TO authenticated USING (
    student_id = auth.uid()
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "attendance_insert_teacher_or_admin" ON public.attendance;
CREATE POLICY "attendance_insert_teacher_or_admin" ON public.attendance
  FOR INSERT TO authenticated WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "attendance_update_teacher_or_admin" ON public.attendance;
CREATE POLICY "attendance_update_teacher_or_admin" ON public.attendance
  FOR UPDATE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  ) WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "attendance_delete_teacher_or_admin" ON public.attendance;
CREATE POLICY "attendance_delete_teacher_or_admin" ON public.attendance
  FOR DELETE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

-- ============================================================
-- Step 10: exams policies
-- ============================================================
DROP POLICY IF EXISTS "exams_select_enrolled_or_teacher_or_admin" ON public.exams;
CREATE POLICY "exams_select_enrolled_or_teacher_or_admin" ON public.exams
  FOR SELECT TO authenticated USING (
    public.is_enrolled(course_id)
    OR public.is_teacher_of_course(course_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "exams_insert_teacher_or_admin" ON public.exams;
CREATE POLICY "exams_insert_teacher_or_admin" ON public.exams
  FOR INSERT TO authenticated WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "exams_update_teacher_or_admin" ON public.exams;
CREATE POLICY "exams_update_teacher_or_admin" ON public.exams
  FOR UPDATE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  ) WITH CHECK (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

DROP POLICY IF EXISTS "exams_delete_teacher_or_admin" ON public.exams;
CREATE POLICY "exams_delete_teacher_or_admin" ON public.exams
  FOR DELETE TO authenticated USING (
    public.is_teacher_of_course(course_id) OR public.is_admin()
  );

-- ============================================================
-- Step 11: grades policies
-- ============================================================
DROP POLICY IF EXISTS "grades_select_own_or_teacher_or_admin" ON public.grades;
CREATE POLICY "grades_select_own_or_teacher_or_admin" ON public.grades
  FOR SELECT TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = grades.exam_id AND public.is_teacher_of_course(e.course_id)
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "grades_insert_teacher_or_admin" ON public.grades;
CREATE POLICY "grades_insert_teacher_or_admin" ON public.grades
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = grades.exam_id AND public.is_teacher_of_course(e.course_id)
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "grades_update_teacher_or_admin" ON public.grades;
CREATE POLICY "grades_update_teacher_or_admin" ON public.grades
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = grades.exam_id AND public.is_teacher_of_course(e.course_id)
    )
    OR public.is_admin()
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = grades.exam_id AND public.is_teacher_of_course(e.course_id)
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "grades_delete_teacher_or_admin" ON public.grades;
CREATE POLICY "grades_delete_teacher_or_admin" ON public.grades
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = grades.exam_id AND public.is_teacher_of_course(e.course_id)
    )
    OR public.is_admin()
  );

-- ============================================================
-- Step 12: announcements policies
-- ============================================================
DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
CREATE POLICY "announcements_select_public" ON public.announcements
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "announcements_insert_admin" ON public.announcements;
CREATE POLICY "announcements_insert_admin" ON public.announcements
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "announcements_update_admin" ON public.announcements;
CREATE POLICY "announcements_update_admin" ON public.announcements
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "announcements_delete_admin" ON public.announcements;
CREATE POLICY "announcements_delete_admin" ON public.announcements
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- Step 13: ai_logs policies
-- ============================================================
DROP POLICY IF EXISTS "ai_logs_select_own_or_admin" ON public.ai_logs;
CREATE POLICY "ai_logs_select_own_or_admin" ON public.ai_logs
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "ai_logs_insert_authenticated" ON public.ai_logs;
CREATE POLICY "ai_logs_insert_authenticated" ON public.ai_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "ai_logs_delete_admin" ON public.ai_logs;
CREATE POLICY "ai_logs_delete_admin" ON public.ai_logs
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- Step 14: Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_course ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_exam ON public.grades(exam_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published, published_at);

-- ============================================================
-- Step 15: updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated ON public.courses;
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_enrollments_updated ON public.enrollments;
CREATE TRIGGER trg_enrollments_updated BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_assignments_updated ON public.assignments;
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_updated ON public.submissions;
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_exams_updated ON public.exams;
CREATE TRIGGER trg_exams_updated BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_grades_updated ON public.grades;
CREATE TRIGGER trg_grades_updated BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated ON public.announcements;
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- Step 16: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
