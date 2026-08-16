'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Brain, AlertTriangle, Lightbulb, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { AILog } from '@/lib/types';

const typeConfig = {
  performance: { icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  risk: { icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  recommendation: { icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
  report: { icon: FileText, color: 'text-cyan-600 bg-cyan-50' },
  feedback: { icon: Brain, color: 'text-violet-600 bg-violet-50' },
};

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('ai_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLogs(data as AILog[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  const runAnalysis = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`;
      await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }, body: JSON.stringify({ userId: user.id }) });
      const { data } = await supabase.from('ai_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLogs(data as AILog[] ?? []);
    } catch { /* edge function may not be deployed yet */ }
    setAnalyzing(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Sparkles className="h-6 w-6 text-violet-600" />AI Insights</h1><p className="mt-1 text-sm text-slate-500">AI-powered analysis of your academic performance</p></div>
        <Button onClick={runAnalysis} disabled={analyzing} className="gap-2 bg-violet-600 hover:bg-violet-700"><Brain className="h-4 w-4" />{analyzing ? 'Analyzing...' : 'Run Analysis'}</Button>
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100"><Brain className="h-5 w-5 text-violet-600" /></div>
          <div><p className="text-sm font-medium text-slate-900">How AI Analysis Works</p><p className="mt-1 text-sm text-slate-600">Our AI engine analyzes your attendance patterns, assignment performance, and exam grades to detect at-risk areas, identify weak subjects, and generate personalized study recommendations.</p></div>
        </div>
      </div>

      {logs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {logs.map((log) => {
            const cfg = typeConfig[log.type as keyof typeof typeConfig] ?? typeConfig.performance;
            return (
              <Card key={log.id} className="border-slate-200 transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}`}><cfg.icon className="h-5 w-5" /></div>
                    <div className="flex-1"><Badge className={log.risk_level === 'high' ? 'bg-red-100 text-red-700' : log.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : log.risk_level === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>{log.risk_level}</Badge></div>
                    <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mb-1 font-semibold text-slate-900">{log.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{log.summary}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-slate-300"><CardContent className="p-12 text-center"><Sparkles className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No AI insights yet. Click "Run Analysis" to generate personalized recommendations based on your academic data.</p></CardContent></Card>
      )}
    </div>
  );
}
