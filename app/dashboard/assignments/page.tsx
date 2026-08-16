'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Assignment, Submission, Course } from '@/lib/types';

export default function AssignmentsPage() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<(Assignment & { courses: Course })[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitContent, setSubmitContent] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (profile?.role === 'teacher') {
        const courseIds = (await supabase.from('courses').select('id').eq('teacher_id', user.id)).data?.map((c: { id: string }) => c.id) ?? [];
        const { data } = await supabase.from('assignments').select('*, courses(*)').in('course_id', courseIds).order('due_date', { ascending: true });
        setAssignments(data as (Assignment & { courses: Course })[] ?? []);
      } else {
        const enrIds = (await supabase.from('enrollments').select('course_id').eq('student_id', user.id)).data?.map((e: { course_id: string }) => e.course_id) ?? [];
        const { data } = enrIds.length > 0 ? await supabase.from('assignments').select('*, courses(*)').in('course_id', enrIds).order('due_date', { ascending: true }) : { data: [] };
        setAssignments(data as (Assignment & { courses: Course })[] ?? []);
      }
      const { data: subs } = await supabase.from('submissions').select('*').eq('student_id', user.id);
      setSubmissions(subs as Submission[] ?? []);
      setLoading(false);
    })();
  }, [user, profile]);

  const handleSubmit = async () => {
    if (!user || !activeId) return;
    const { data } = await supabase.from('submissions').insert({ assignment_id: activeId, student_id: user.id, content: submitContent }).select('*').maybeSingle();
    if (data) setSubmissions([...submissions, data as Submission]);
    setSubmitContent('');
    setActiveId(null);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Assignments</h1><p className="mt-1 text-sm text-slate-500">{profile?.role === 'teacher' ? 'Manage your course assignments' : 'View and submit your assignments'}</p></div>
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((a) => {
            const submission = submissions.find((s) => s.assignment_id === a.id);
            const overdue = new Date(a.due_date) < new Date() && !submission;
            return (
              <Card key={a.id} className="border-slate-200">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{a.title}</h3>{a.ai_feedback_enabled && <Badge className="bg-violet-50 text-violet-600 hover:bg-violet-50"><Sparkles className="mr-1 h-3 w-3" />AI Feedback</Badge>}</div>
                      <p className="text-sm text-slate-500">{a.description || 'No description provided.'}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" />{a.courses?.title}</span><span className={`flex items-center gap-1 ${overdue ? 'text-red-500' : ''}`}><Clock className="h-3.5 w-3.5" />Due {new Date(a.due_date).toLocaleDateString()}</span><span>Max score: {a.max_score}</span></div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {submission ? (
                        <div className="flex items-center gap-2"><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="mr-1 h-3 w-3" />Submitted</Badge>{submission.score !== null && <span className="text-sm font-bold text-slate-900">{submission.score}/{a.max_score}</span>}</div>
                      ) : overdue ? <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Overdue</Badge> : profile?.role === 'student' ? (
                        <Dialog><DialogTrigger asChild><Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveId(a.id)}>Submit</Button></DialogTrigger>
                          <DialogContent><DialogHeader><DialogTitle>Submit: {a.title}</DialogTitle></DialogHeader>
                            <div className="space-y-4"><Textarea rows={6} placeholder="Enter your submission..." value={submitContent} onChange={(e) => setSubmitContent(e.target.value)} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setActiveId(null)}>Cancel</Button><Button onClick={handleSubmit} disabled={!submitContent}>Submit Assignment</Button></div></div>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                      {submission?.ai_feedback && <div className="mt-2 max-w-sm rounded-lg bg-violet-50 p-3"><p className="mb-1 flex items-center gap-1 text-xs font-semibold text-violet-700"><Sparkles className="h-3 w-3" />AI Feedback</p><p className="text-xs text-slate-600">{submission.ai_feedback}</p></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><ClipboardList className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No assignments yet.</p></div>}
    </div>
  );
}
