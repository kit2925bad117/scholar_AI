export type UserRole = 'student' | 'teacher' | 'admin';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type SubmissionStatus = 'submitted' | 'graded' | 'late' | 'returned';

export type AILogType =
  | 'performance'
  | 'risk'
  | 'recommendation'
  | 'report'
  | 'feedback';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export type AnnouncementCategory = 'general' | 'event' | 'urgent' | 'academic';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  bio: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  teacher_id: string;
  thumbnail_url: string | null;
  schedule: string;
  capacity: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolled_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  ai_feedback_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_url: string | null;
  submitted_at: string;
  score: number | null;
  status: SubmissionStatus;
  ai_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  course_id: string;
  student_id: string;
  session_date: string;
  status: AttendanceStatus;
  notes: string;
  created_at: string;
}

export interface Exam {
  id: string;
  course_id: string;
  title: string;
  description: string;
  exam_date: string;
  max_score: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  letter: string;
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  category: AnnouncementCategory;
  pinned: boolean;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface AILog {
  id: string;
  user_id: string | null;
  type: AILogType;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  risk_level: RiskLevel;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course>;
        Update: Partial<Course>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment>;
        Update: Partial<Enrollment>;
      };
      assignments: {
        Row: Assignment;
        Insert: Partial<Assignment>;
        Update: Partial<Assignment>;
      };
      submissions: {
        Row: Submission;
        Insert: Partial<Submission>;
        Update: Partial<Submission>;
      };
      attendance: {
        Row: Attendance;
        Insert: Partial<Attendance>;
        Update: Partial<Attendance>;
      };
      exams: {
        Row: Exam;
        Insert: Partial<Exam>;
        Update: Partial<Exam>;
      };
      grades: {
        Row: Grade;
        Insert: Partial<Grade>;
        Update: Partial<Grade>;
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Announcement>;
        Update: Partial<Announcement>;
      };
      ai_logs: {
        Row: AILog;
        Insert: Partial<AILog>;
        Update: Partial<AILog>;
      };
    };
  };
}
