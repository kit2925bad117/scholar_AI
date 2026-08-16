'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, User, ArrowRight, AlertCircle, BookOpen, Presentation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (err) setError(err);
    else router.push('/dashboard');
  };

  const roles: { value: UserRole; label: string; desc: string; icon: typeof BookOpen }[] = [
    { value: 'student', label: 'Student', desc: 'Enroll in courses, track progress, get AI insights', icon: BookOpen },
    { value: 'teacher', label: 'Teacher', desc: 'Create courses, manage assignments, grade students', icon: Presentation },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20"><GraduationCap className="h-7 w-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-1 text-sm text-slate-500">Join ScholarAI and start learning smarter</p>
        </div>
        <Card className="border-slate-200 shadow-xl">
          <CardHeader><CardTitle className="text-xl">Sign Up</CardTitle><CardDescription>Choose your role and get started</CardDescription></CardHeader>
          <CardContent>
            {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <div className="mb-5 space-y-2">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={cn('flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all', role === r.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300')}>
                    <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', role === r.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500')}><r.icon className="h-4 w-4" /></div>
                    <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Full Name</Label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="name" required className="pl-10" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" required className="pl-10" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" type="password" required minLength={6} className="pl-10" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div>
              <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight className="h-4 w-4" />}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
