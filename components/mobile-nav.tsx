'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Settings,
} from 'lucide-react';

const allNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
  { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen, roles: ['student', 'teacher'] },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList, roles: ['student', 'teacher'] },
  { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['student', 'teacher'] },
  { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap, roles: ['student', 'teacher'] },
  { href: '/dashboard/progress', label: 'My Progress', icon: TrendingUp, roles: ['student'] },
  { href: '/dashboard/ai-insights', label: 'AI Insights', icon: Sparkles, roles: ['student', 'teacher', 'admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['student', 'teacher', 'admin'] },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useAuth();

  const items = allNav.filter((i) =>
    profile ? i.roles.includes(profile.role) : false
  );

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium',
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
