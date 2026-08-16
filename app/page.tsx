'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Brain,
  TrendingUp,
  CalendarCheck,
  Users,
  Award,
  Lightbulb,
  Clock,
  Star,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import type { Announcement, Course, Profile } from '@/lib/types';

const aiTips = [
  {
    title: 'Use Active Recall',
    description:
      'Test yourself on material instead of re-reading. Active recall strengthens memory retention by up to 50%.',
    icon: Brain,
  },
  {
    title: 'Space Your Study Sessions',
    description:
      'Distribute learning over time rather than cramming. Spaced repetition improves long-term retention.',
    icon: Clock,
  },
  {
    title: 'Track Your Weak Areas',
    description:
      'Identify subjects where your scores are lowest and allocate extra review time to those topics.',
    icon: TrendingUp,
  },
  {
    title: 'Connect Concepts',
    description:
      'Build mental maps linking new information to what you already know for deeper understanding.',
    icon: Lightbulb,
  },
];

const features = [
  { icon: BookOpen, label: 'Courses', color: 'text-blue-600 bg-blue-50' },
  { icon: CalendarCheck, label: 'Attendance', color: 'text-cyan-600 bg-cyan-50' },
  { icon: Award, label: 'Grades', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Brain, label: 'AI Insights', color: 'text-violet-600 bg-violet-50' },
];

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ann }, { data: crs }, { data: tch }] = await Promise.all([
        supabase
          .from('announcements')
          .select('*')
          .eq('published', true)
          .order('pinned', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(3),
        supabase
          .from('courses')
          .select('*')
          .order('rating', { ascending: false })
          .limit(6),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'teacher')
          .limit(4),
      ]);
      setAnnouncements((ann as Announcement[]) ?? []);
      setCourses((crs as Course[]) ?? []);
      setTeachers((tch as Profile[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <Badge className="mb-5 gap-1.5 border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Learning Platform
              </Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Learn smarter with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  AI-driven
                </span>{' '}
                academic management
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Track attendance, manage assignments, monitor grades, and get
                personalized AI recommendations to improve your academic
                performance — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/courses">
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                    Explore Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-slate-300">
                    Get Started Free
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${f.color}`}>
                      <f.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-blue-500/10">
                <img
                  src="https://images.pexels.com/photos/8199762/pexels-photo-8199762.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Students studying together"
                  className="rounded-xl object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">+24%</p>
                    <p className="text-xs text-slate-500">Avg. improvement</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">AI Insights</p>
                    <p className="text-xs text-slate-500">Real-time analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Megaphone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
            <p className="text-sm text-slate-500">Stay up to date with the latest news</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a) => (
              <Card key={a.id} className="border-slate-200 transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge
                      variant={
                        a.category === 'urgent'
                          ? 'destructive'
                          : a.category === 'event'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="capitalize"
                    >
                      {a.category}
                    </Badge>
                    {a.pinned && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{a.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
                    {a.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No announcements yet.</p>
        )}
      </section>

      {/* Featured Courses */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Courses</h2>
              <p className="text-sm text-slate-500">Explore our top-rated courses</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`}>
                  <Card className="group h-full border-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                      {c.thumbnail_url ? (
                        <img
                          src={c.thumbnail_url}
                          alt={c.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-white/80" />
                        </div>
                      )}
                      <Badge className="absolute right-3 top-3 bg-white/90 text-slate-700">
                        {c.level}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <p className="mb-1 text-xs font-medium text-blue-600">{c.category}</p>
                      <h3 className="mb-2 font-semibold text-slate-900 line-clamp-1">{c.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {Number(c.rating).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{c.schedule || 'Flexible schedule'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Courses will appear here once teachers publish them.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Top Teachers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
            <Users className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Top Teachers</h2>
            <p className="text-sm text-slate-500">Learn from the best educators</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((t) => (
              <Card key={t.id} className="border-slate-200 text-center transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-bold text-white">
                    {t.full_name?.charAt(0)?.toUpperCase() ?? 'T'}
                  </div>
                  <h3 className="font-semibold text-slate-900">{t.full_name || 'Teacher'}</h3>
                  <p className="text-sm text-slate-500">{t.department || 'Faculty Member'}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {t.bio || 'Dedicated educator committed to student success.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Teachers will appear here once they join the platform.
            </p>
          </div>
        )}
      </section>

      {/* AI Study Tips */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <Badge className="mb-4 border-white/20 bg-white/10 text-cyan-300 hover:bg-white/10">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Study Tips
            </Badge>
            <h2 className="text-3xl font-bold text-white">Study smarter, not harder</h2>
            <p className="mt-3 text-slate-300">
              Evidence-based strategies powered by AI analysis
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiTips.map((tip) => (
              <div
                key={tip.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20">
                  <tip.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{tip.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 px-6 py-16 text-center shadow-2xl shadow-blue-500/20 sm:px-12">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to transform your learning?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50">
              Join ScholarAI today and get personalized AI insights, track your
              progress, and achieve your academic goals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  Browse Courses
                </Button>
              </Link>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
