'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Sparkles, TrendingUp, AlertTriangle, UserCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import type { Profile, Course, Enrollment, AILog } from '@/lib/types';

export default function AdminDashboard() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: stds }, { data: tchrs }, { data: crs }, { data: enrs }, { data: ai }] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student'),
        supabase.from('profiles').select('*').eq('role', 'teacher'),
        supabase.from('courses').select('*'),
        supabase.from('enrollments').select('*'),
        supabase.from('ai_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      setStudents(stds as Profile[] ?? []);
      setTeachers(tchrs as Profile[] ?? []);
      setCourses(crs as Course[] ?? []);
      setEnrollments(enrs as Enrollment[] ?? []);
      setAiLogs(ai as AILog[] ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  const atRiskCount = aiLogs.filter((l) => l.risk_level === 'high' || l.risk_level === 'medium').length;
  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Teachers', value: teachers.length, icon: GraduationCap, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Enrollments', value: enrollments.length, icon: UserCheck, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1><p className="mt-1 text-sm text-slate-500">System overview and management</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></div><div><p className="text-2xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-blue-600" />Students</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {students.length > 0 ? students.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">{s.full_name?.charAt(0)?.toUpperCase() ?? 'S'}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{s.full_name || 'Unknown'}</p><p className="text-xs text-slate-500">{s.department || 'No department'}</p></div>
                <Badge variant="secondary">Active</Badge>
              </div>
            )) : <p className="py-6 text-center text-sm text-slate-500">No students registered yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50/30"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-violet-600" />AI Monitoring</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-violet-100 bg-white p-3"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /><p className="text-sm font-medium text-slate-900">At-Risk Students</p></div><p className="mt-1 text-2xl font-bold text-red-600">{atRiskCount}</p></div>
            <div className="rounded-lg border border-violet-100 bg-white p-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /><p className="text-sm font-medium text-slate-900">Total AI Reports</p></div><p className="mt-1 text-2xl font-bold text-blue-600">{aiLogs.length}</p></div>
            <Separator />
            <div><p className="mb-2 text-xs font-medium text-slate-500">Recent AI Activity</p>
              {aiLogs.length > 0 ? aiLogs.slice(0, 3).map((log) => (<div key={log.id} className="mb-2 rounded-md bg-white p-2 text-xs"><p className="font-medium text-slate-700">{log.title}</p><p className="text-slate-400">{log.risk_level} · {log.type}</p></div>)) : <p className="text-xs text-slate-400">No AI activity yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-cyan-600" />Teachers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {teachers.length > 0 ? teachers.map((t) => {
              const courseCount = courses.filter((c) => c.teacher_id === t.id).length;
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-sm font-bold text-white">{t.full_name?.charAt(0)?.toUpperCase() ?? 'T'}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{t.full_name || 'Unknown'}</p><p className="text-xs text-slate-500">{t.department || 'No department'}</p></div>
                  <Badge variant="outline">{courseCount} courses</Badge>
                </div>
              );
            }) : <p className="py-6 text-center text-sm text-slate-500">No teachers registered yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-emerald-600" />Course Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {courses.length > 0 ? courses.slice(0, 5).map((c) => {
              const enrolled = enrollments.filter((e) => e.course_id === c.id).length;
              return (<div key={c.id}><div className="mb-1 flex items-center justify-between"><span className="truncate text-sm font-medium text-slate-700">{c.title}</span><span className="text-xs text-slate-500">{enrolled}/{c.capacity}</span></div><Progress value={(enrolled / c.capacity) * 100} className="h-1.5" /></div>);
            }) : <p className="py-6 text-center text-sm text-slate-500">No courses created yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
