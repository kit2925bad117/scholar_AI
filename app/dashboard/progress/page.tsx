'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Sparkles, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Grade, Exam, Course, Attendance, AILog } from '@/lib/types';

export default function ProgressPage() {
  const { user, profile } = useAuth();
  const [grades, setGrades] = useState<(Grade & { exams: Exam & { courses: Course } })[]>([]);
  const [attendance, setAttendance] = useState<(Attendance & { courses: Course })[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: grds }, { data: att }, { data: ai }] = await Promise.all([
        supabase.from('grades').select('*, exams(*, courses(*))').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('attendance').select('*, courses(*)').eq('student_id', user.id).order('session_date', { ascending: false }),
        supabase.from('ai_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setGrades(grds as (Grade & { exams: Exam & { courses: Course } })[] ?? []);
      setAttendance(att as (Attendance & { courses: Course })[] ?? []);
      setAiLogs(ai as AILog[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  const handlePrint = () => window.print();

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  const coursePerf = grades.reduce((acc, g) => { const name = g.exams?.courses?.title ?? 'Unknown'; if (!acc[name]) acc[name] = []; acc[name].push(g.score); return acc; }, {} as Record<string, number[]>);
  const courseAvgs = Object.entries(coursePerf).map(([course, scores]) => ({ course, avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length), count: scores.length }));
  const weak = courseAvgs.filter((c) => c.avg < 70).sort((a, b) => a.avg - b.avg);
  const strong = courseAvgs.filter((c) => c.avg >= 70).sort((a, b) => b.avg - a.avg);
  const overallAvg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) : 0;
  const attRate = attendance.length > 0 ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100) : 0;
  const riskLevel = overallAvg < 50 || attRate < 60 ? 'high' : overallAvg < 65 || attRate < 75 ? 'medium' : 'low';
  const riskCfg = { high: { color: 'bg-red-100 text-red-700', label: 'High Risk' }, medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium Risk' }, low: { color: 'bg-emerald-100 text-emerald-700', label: 'Low Risk' } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div><h1 className="text-2xl font-bold text-slate-900">My Progress</h1><p className="mt-1 text-sm text-slate-500">Performance overview and AI-powered insights</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}><Printer className="h-4 w-4" />Print</Button><Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handlePrint}><Download className="h-4 w-4" />Export PDF</Button></div>
      </div>

      <Card className="border-slate-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-blue-600" />Performance Summary</CardTitle></CardHeader>
        <CardContent><div className="grid gap-6 sm:grid-cols-3">
          <div><p className="mb-2 text-sm text-slate-500">Overall Average</p><p className={`text-3xl font-bold ${overallAvg >= 70 ? 'text-emerald-600' : overallAvg >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{overallAvg}%</p><Progress value={overallAvg} className="mt-2 h-2" /></div>
          <div><p className="mb-2 text-sm text-slate-500">Attendance Rate</p><p className={`text-3xl font-bold ${attRate >= 75 ? 'text-emerald-600' : attRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{attRate}%</p><Progress value={attRate} className="mt-2 h-2" /></div>
          <div><p className="mb-2 text-sm text-slate-500">Risk Assessment</p><Badge className={`${riskCfg[riskLevel as keyof typeof riskCfg].color} text-sm`}><AlertTriangle className="mr-1.5 h-3.5 w-3.5" />{riskCfg[riskLevel as keyof typeof riskCfg].label}</Badge></div>
        </div></CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-emerald-600" />Strong Subjects</CardTitle></CardHeader>
          <CardContent className="space-y-3">{strong.length > 0 ? strong.map((s) => (<div key={s.course}><div className="mb-1 flex items-center justify-between"><span className="text-sm font-medium text-slate-700">{s.course}</span><span className="text-sm font-bold text-emerald-600">{s.avg}%</span></div><Progress value={s.avg} className="h-2" /></div>)) : <p className="text-sm text-slate-400">No strong subjects identified yet.</p>}</CardContent>
        </Card>
        <Card className="border-slate-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingDown className="h-5 w-5 text-red-600" />Weak Subjects</CardTitle></CardHeader>
          <CardContent className="space-y-3">{weak.length > 0 ? weak.map((s) => (<div key={s.course}><div className="mb-1 flex items-center justify-between"><span className="text-sm font-medium text-slate-700">{s.course}</span><span className="text-sm font-bold text-red-600">{s.avg}%</span></div><Progress value={s.avg} className="h-2" /></div>)) : <p className="text-sm text-slate-400">No weak subjects identified. Keep it up!</p>}</CardContent>
        </Card>
      </div>

      <Card className="border-violet-200 bg-violet-50/30"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-violet-600" />AI Insights & Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {aiLogs.length > 0 ? aiLogs.map((log) => (
            <div key={log.id} className="rounded-lg border border-violet-100 bg-white p-4">
              <div className="mb-2 flex items-center gap-2"><Badge className={log.risk_level === 'high' ? 'bg-red-100 text-red-700' : log.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{log.risk_level}</Badge><span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span></div>
              <p className="text-sm font-semibold text-slate-900">{log.title}</p><p className="mt-1 text-sm leading-relaxed text-slate-600">{log.summary}</p>
            </div>
          )) : (
            <div className="py-6 text-center"><Lightbulb className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-500">AI insights will appear here once you have enough academic data (grades, attendance, assignments).</p></div>
          )}
        </CardContent>
      </Card>

      <div className="hidden print:block">
        <Separator className="my-6" />
        <h2 className="text-xl font-bold">Academic Performance Report</h2>
        <p className="text-sm text-slate-500">Student: {profile?.full_name} · Generated: {new Date().toLocaleDateString()}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>Overall Average: {overallAvg}%</p><p>Attendance Rate: {attRate}%</p><p>Risk Level: {riskCfg[riskLevel as keyof typeof riskCfg].label}</p>
          {weak.length > 0 && <p>Weak Areas: {weak.map((s) => s.course).join(', ')}</p>}
        </div>
      </div>
    </div>
  );
}
