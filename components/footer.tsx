import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Scholar<span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              AI-powered learning and academic management platform for students,
              teachers, and institutions.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link></li>
              <li><Link href="/courses" className="text-slate-500 hover:text-blue-600">Courses</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-blue-600">Contact</Link></li>
              <li><Link href="/login" className="text-slate-500 hover:text-blue-600">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/dashboard" className="text-slate-500 hover:text-blue-600">Dashboard</Link></li>
              <li><Link href="/dashboard/progress" className="text-slate-500 hover:text-blue-600">My Progress</Link></li>
              <li><Link href="/register" className="text-slate-500 hover:text-blue-600">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" /> support@scholarai.edu
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" /> (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" /> 100 Campus Drive
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
