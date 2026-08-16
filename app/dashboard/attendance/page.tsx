'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Attendance, Course } from '@/lib/types';

const statusConfig = {
  present: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Present' },
  absent: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Absent' },
  late: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Late' },
  excused: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50', label: 'Excused' },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<(Attendance & { courses: Course })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('attendance').select('*, courses(*)').eq('student_id', user.id).order('session_date', { ascending: false });
      setRecords(data as (Attendance & { courses: Course })[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  const summary = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const total = records.length;
  const present = summary.present ?? 0;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Attendance</h1><p className="mt-1 text-sm text-slate-500">Track your attendance across all courses</p></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card key={key} className="border-slate-200"><CardContent className="flex items-center gap-3 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}`}><cfg.icon className="h-5 w-5" /></div><div><p className="text-xl font-bold text-slate-900">{summary[key] ?? 0}</p><p className="text-xs text-slate-500">{cfg.label}</p></div></CardContent></Card>
        ))}
        <Card className="border-slate-200"><CardContent className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><CalendarCheck className="h-5 w-5" /></div><div><p className="text-xl font-bold text-slate-900">{rate}%</p><p className="text-xs text-slate-500">Attendance Rate</p></div></CardContent></Card>
      </div>
      <Card className="border-slate-200"><CardHeader><CardTitle className="text-lg">Attendance History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {records.length > 0 ? records.map((r) => {
            const cfg = statusConfig[r.status as keyof typeof statusConfig];
            return (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.color}`}><cfg.icon className="h-4 w-4" /></div><div><p className="text-sm font-medium text-slate-900">{r.courses?.title}</p><p className="text-xs text-slate-500">{new Date(r.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p></div></div>
                <Badge className={`${cfg.color} border-transparent`}>{cfg.label}</Badge>
              </div>
            );
          }) : <p className="py-8 text-center text-sm text-slate-500">No attendance records yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
