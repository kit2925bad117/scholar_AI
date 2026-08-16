'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Star, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Course, Enrollment } from '@/lib/types';

export default function MyCoursesPage() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<(Enrollment & { courses: Course })[]>([]);
  const [taughtCourses, setTaughtCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (profile?.role === 'teacher') {
        const { data } = await supabase.from('courses').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false });
        setTaughtCourses((data as Course[]) ?? []);
      } else {
        const { data } = await supabase.from('enrollments').select('*, courses(*)').eq('student_id', user.id).order('enrolled_at', { ascending: false });
        setCourses(data as (Enrollment & { courses: Course })[] ?? []);
      }
      setLoading(false);
    })();
  }, [user, profile]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  if (profile?.role === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">My Courses</h1><p className="mt-1 text-sm text-slate-500">Courses you teach</p></div>
          <Link href="/courses"><Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" />Create Course</Button></Link>
        </div>
        {taughtCourses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {taughtCourses.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`}>
                <Card className="group h-full border-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-cyan-400"><div className="flex h-full items-center justify-center"><BookOpen className="h-8 w-8 text-white/80" /></div><Badge className="absolute right-3 top-3 bg-white/90 text-slate-700">{c.level}</Badge></div>
                  <CardContent className="p-4"><p className="mb-1 text-xs font-medium text-blue-600">{c.category}</p><h3 className="mb-1 font-semibold text-slate-900 line-clamp-1">{c.title}</h3><p className="text-sm text-slate-500 line-clamp-2">{c.description}</p><div className="mt-3 flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="text-sm text-slate-600">{Number(c.rating).toFixed(1)}</span></div></CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">You haven't created any courses yet.</p></div>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">My Courses</h1><p className="mt-1 text-sm text-slate-500">Courses you're enrolled in</p></div>
      {courses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((e) => (
            <Link key={e.id} href={`/courses/${e.course_id}`}>
              <Card className="group h-full border-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-cyan-400"><div className="flex h-full items-center justify-center"><BookOpen className="h-8 w-8 text-white/80" /></div><Badge className="absolute right-3 top-3 bg-white/90 text-slate-700">{e.courses?.level}</Badge></div>
                <CardContent className="p-4"><p className="mb-1 text-xs font-medium text-blue-600">{e.courses?.category}</p><h3 className="mb-2 font-semibold text-slate-900 line-clamp-1">{e.courses?.title}</h3><div className="mt-3"><div className="mb-1 flex items-center justify-between text-xs"><span className="text-slate-500">Progress</span><span className="font-medium text-slate-700">{e.progress}%</span></div><Progress value={e.progress} className="h-1.5" /></div></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">You're not enrolled in any courses yet.</p><Link href="/courses"><Button className="mt-4 gap-2 bg-blue-600 hover:bg-blue-700">Browse Courses <ArrowRight className="h-4 w-4" /></Button></Link></div>
      )}
    </div>
  );
}
