'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import type { Course } from '@/lib/types';

const categories = ['All','Computer Science','Mathematics','Science','Business','Arts','Languages','General'];
const levels = ['All','Beginner','Intermediate','Advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('courses').select('*').order('rating', { ascending: false });
      setCourses((data as Course[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = courses.filter((c) => {
    const ms = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || c.category === category;
    const ml = level === 'All' || c.level === level;
    return ms && mc && ml;
  });

  const topRated = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
        <p className="mt-2 text-slate-500">Browse our catalog and find the right course for you</p>
      </div>

      {topRated.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-900">Top Rated Courses</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`}>
                <Card className="group border-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{c.title}</h3>
                      <p className="text-sm text-slate-500">{c.category}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-700">{Number(c.rating).toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]"><SlidersHorizontal className="mr-2 h-4 w-4 text-slate-400" /><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>{levels.map((lvl) => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/courses/${c.id}`}>
              <Card className="group h-full border-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                  {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-10 w-10 text-white/80" /></div>}
                  <Badge className="absolute right-3 top-3 bg-white/90 text-slate-700">{c.level}</Badge>
                </div>
                <CardContent className="p-5">
                  <p className="mb-1 text-xs font-medium text-blue-600">{c.category}</p>
                  <h3 className="mb-2 font-semibold text-slate-900 line-clamp-1">{c.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="text-sm font-medium text-slate-700">{Number(c.rating).toFixed(1)}</span></div>
                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600">View <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No courses match your filters. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}
