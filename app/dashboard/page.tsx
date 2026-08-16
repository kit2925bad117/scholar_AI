'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ClipboardList, GraduationCap, Sparkles, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Enrollment, Course, Assignment, Submission, Grade, Exam, AILog } from '@/lib/types';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<(Enrollment & { courses: Course })[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { courses: Course })[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<(Grade & { exams: Exam })[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const enrIds = (await supabase.from('enrollments').select('course_id').eq('student_id', user.id)).data?.map((e: { course_id: string }) => e.course_id) ?? [];
      const [{ data: enrs }, { data: asgns }, { data: subs }, { data: grds }, { data: ai }] = await Promise.all([
        supabase.from('enrollments').select('*, courses(*)').eq('student_id', user.id).order('enrolled_at', { ascending: false }),
        enrIds.length > 0 ? supabase.from('assignments').select('*, courses(*)').in('course_id', enrIds).order('due_date', { ascending: true }).limit(5) : Promise.resolve({ data: [] }),
        supabase.from('submissions').select('*').eq('student_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('grades').select('*, exams(*)').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ai_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);
      setEnrollments(enrs as (Enrollment & { courses: Course })[] ?? []);
      setAssignments(asgns as (Assignment & { courses: Course })[] ?? []);
      setSubmissions(subs as Submission[] ?? []);
      setGrades(grds as (Grade & { exams: Exam })[] ?? []);
      setAiLogs(ai as AILog[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  const avgGrade = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) : 0;
  const pendingAssignments = assignments.filter((a) => !submissions.some((s) => s.assignment_id === a.id)).length;

  const stats = [
    { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Assignments', value: pendingAssignments, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
    { label: 'Average Grade', value: `${avgGrade}%`, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'AI Insights', value: aiLogs.length, icon: Sparkles, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h1>
        <p className="mt-1 text-sm text-slate-500">Here's your academic overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Courses</CardTitle>
            <Link href="/dashboard/courses"><Button variant="ghost" size="sm" className="gap-1 text-blue-600">View All <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments.length > 0 ? enrollments.slice(0, 4).map((e) => (
              <Link key={e.id} href={`/courses/${e.course_id}`}>
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400"><BookOpen className="h-5 w-5 text-white" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{e.courses?.title}</p>
                    <p className="text-xs text-slate-500">{e.courses?.category}</p>
                    <Progress value={e.progress} className="mt-2 h-1.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{e.progress}%</span>
                </div>
              </Link>
            )) : (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Not enrolled in any courses yet.</p>
                <Link href="/courses"><Button size="sm" className="mt-3">Browse Courses</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-violet-600" />AI Insights</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {aiLogs.length > 0 ? aiLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className={log.risk_level === 'high' ? 'bg-red-100 text-red-700' : log.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{log.risk_level}</Badge>
                  <span className="text-xs text-slate-400">{log.type}</span>
                </div>
                <p className="text-sm font-medium text-slate-900">{log.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">{log.summary}</p>
              </div>
            )) : (
              <div className="py-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No AI insights yet. They appear after you have grades and attendance data.</p>
              </div>
            )}
            <Link href="/dashboard/ai-insights"><Button variant="outline" size="sm" className="w-full gap-1">View All Insights <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
            <Link href="/dashboard/assignments"><Button variant="ghost" size="sm" className="gap-1 text-blue-600">View All <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length > 0 ? assignments.slice(0, 4).map((a) => {
              const submitted = submissions.some((s) => s.assignment_id === a.id);
              const overdue = new Date(a.due_date) < new Date() && !submitted;
              return (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{a.title}</p><p className="text-xs text-slate-500">{a.courses?.title}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : 'text-slate-400'}`}><Clock className="h-3 w-3" />{new Date(a.due_date).toLocaleDateString()}</span>
                    {submitted ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Submitted</Badge> : overdue ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="secondary">Pending</Badge>}
                  </div>
                </div>
              );
            }) : <p className="py-6 text-center text-sm text-slate-500">No assignments due.</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-emerald-600" />Recent Grades</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {grades.length > 0 ? grades.slice(0, 4).map((g) => (
              <div key={g.id} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-900">{g.exams?.title || 'Exam'}</p><p className="text-xs text-slate-500">{g.letter || `${g.score}/${g.exams?.max_score ?? 100}`}</p></div>
                <span className={`text-lg font-bold ${g.score >= 80 ? 'text-emerald-600' : g.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{g.score}</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-slate-500">No grades yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
