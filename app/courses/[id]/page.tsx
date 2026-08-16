'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, Users, Calendar, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Course, Profile, Enrollment, Assignment } from '@/lib/types';

const syllabusModules = [
  { title: 'Introduction & Fundamentals', duration: '2 hours' },
  { title: 'Core Concepts & Theory', duration: '4 hours' },
  { title: 'Practical Applications', duration: '6 hours' },
  { title: 'Advanced Topics', duration: '4 hours' },
  { title: 'Final Project & Review', duration: '4 hours' },
];

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [teacher, setTeacher] = useState<Profile | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const courseId = params.id as string;

  useEffect(() => {
    (async () => {
      const { data: crs } = await supabase.from('courses').select('*').eq('id', courseId).maybeSingle();
      if (!crs) { setLoading(false); return; }
      setCourse(crs as Course);
      const { data: tch } = await supabase.from('profiles').select('*').eq('id', (crs as Course).teacher_id).maybeSingle();
      setTeacher(tch as Profile);
      const { data: asgns } = await supabase.from('assignments').select('*').eq('course_id', courseId).order('due_date', { ascending: true });
      setAssignments((asgns as Assignment[]) ?? []);
      if (user) {
        const { data: enr } = await supabase.from('enrollments').select('*').eq('course_id', courseId).eq('student_id', user.id).maybeSingle();
        setEnrollment(enr as Enrollment | null);
      }
      setLoading(false);
    })();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) { router.push('/login'); return; }
    setEnrolling(true);
    const { data } = await supabase.from('enrollments').insert({ course_id: courseId, student_id: user.id }).select('*').maybeSingle();
    if (data) setEnrollment(data as Enrollment);
    setEnrolling(false);
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-12"><div className="h-64 animate-pulse rounded-xl bg-slate-100" /></div>;

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Course not found</h1>
        <Link href="/courses"><Button className="mt-6">Back to Courses</Button></Link>
      </div>
    );
  }

  const isTeacher = profile?.id === course.teacher_id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/courses" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white sm:p-10">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/20">{course.category}</Badge>
            <Badge className="bg-white/20 text-white hover:bg-white/20">{course.level}</Badge>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-blue-50">{course.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /><span className="font-medium">{Number(course.rating).toFixed(1)} Rating</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{course.schedule || 'Flexible'}</span></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Capacity: {course.capacity}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Course Syllabus</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {syllabusModules.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">{i + 1}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{m.title}</p><p className="text-xs text-slate-500">{m.duration}</p></div>
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Assignments</CardTitle></CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                      <div><p className="text-sm font-medium text-slate-900">{a.title}</p><p className="text-xs text-slate-500">Due {new Date(a.due_date).toLocaleDateString()} · {a.max_score} pts</p></div>
                      {a.ai_feedback_enabled && <Badge className="bg-violet-50 text-violet-600 hover:bg-violet-50"><Sparkles className="mr-1 h-3 w-3" />AI</Badge>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400">No assignments published yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              {enrollment ? (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-5 w-5" /><span className="font-semibold">Enrolled</span></div>
                  <p className="mb-3 text-sm text-slate-500">Your progress</p>
                  <Progress value={enrollment.progress} className="mb-2" />
                  <p className="text-sm font-medium text-slate-700">{enrollment.progress}% complete</p>
                  <Link href="/dashboard"><Button className="mt-4 w-full">Go to Dashboard</Button></Link>
                </div>
              ) : isTeacher ? (
                <div><p className="mb-3 text-sm text-slate-500">You teach this course</p><Link href="/dashboard"><Button className="w-full">Manage Course</Button></Link></div>
              ) : (
                <div>
                  <p className="mb-4 text-sm text-slate-500">Enroll to access course materials, assignments, and AI insights.</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleEnroll} disabled={enrolling}>{enrolling ? 'Enrolling...' : 'Enroll Now'}</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {teacher && (
            <Card className="border-slate-200">
              <CardHeader><CardTitle className="text-lg">Instructor</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white">{teacher.full_name?.charAt(0)?.toUpperCase() ?? 'T'}</div>
                  <div><p className="font-semibold text-slate-900">{teacher.full_name}</p><p className="text-sm text-slate-500">{teacher.department || 'Faculty Member'}</p></div>
                </div>
                {teacher.bio && (<><Separator className="my-4" /><p className="text-sm leading-relaxed text-slate-500">{teacher.bio}</p></>)}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-blue-600" />Schedule</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-600">{course.schedule || 'Flexible schedule — learn at your own pace.'}</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
