'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Grade, Exam, Course } from '@/lib/types';

export default function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<(Grade & { exams: Exam & { courses: Course } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('grades').select('*, exams(*, courses(*))').eq('student_id', user.id).order('created_at', { ascending: false });
      setGrades(data as (Grade & { exams: Exam & { courses: Course } })[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  const avg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) : 0;
  const getGradeColor = (score: number) => score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Exams & Grades</h1><p className="mt-1 text-sm text-slate-500">Your exam results and grade history</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200"><CardContent className="flex items-center gap-3 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Award className="h-6 w-6" /></div><div><p className={`text-2xl font-bold ${getGradeColor(avg)}`}>{avg}%</p><p className="text-xs text-slate-500">Average Score</p></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="flex items-center gap-3 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><GraduationCap className="h-6 w-6" /></div><div><p className="text-2xl font-bold text-slate-900">{grades.length}</p><p className="text-xs text-slate-500">Exams Taken</p></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="flex items-center gap-3 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><TrendingUp className="h-6 w-6" /></div><div><p className="text-2xl font-bold text-slate-900">{grades.length > 0 ? Math.max(...grades.map((g) => g.score)) : 0}%</p><p className="text-xs text-slate-500">Best Score</p></div></CardContent></Card>
      </div>
      <Card className="border-slate-200"><CardHeader><CardTitle className="text-lg">Grade History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {grades.length > 0 ? grades.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
              <div><p className="text-sm font-semibold text-slate-900">{g.exams?.title || 'Exam'}</p><p className="text-xs text-slate-500">{g.exams?.courses?.title} · {new Date(g.exams?.exam_date ?? g.created_at).toLocaleDateString()}</p>{g.feedback && <p className="mt-1 text-xs text-slate-400">{g.feedback}</p>}</div>
              <div className="flex items-center gap-3">{g.letter && <Badge variant="secondary">{g.letter}</Badge>}<span className={`text-2xl font-bold ${getGradeColor(g.score)}`}>{g.score}<span className="text-sm text-slate-400">/{g.exams?.max_score ?? 100}</span></span></div>
            </div>
          )) : <p className="py-8 text-center text-sm text-slate-500">No grades recorded yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
