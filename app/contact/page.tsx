'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How do I enroll in a course?', a: 'Browse the Courses page, click on any course to view details, and use the "Enroll Now" button. You must be signed in to enroll.' },
  { q: 'How does the AI performance analysis work?', a: 'Our AI engine analyzes your attendance, assignment submissions, and exam grades to identify weak areas, detect academic risk, and generate personalized study recommendations.' },
  { q: 'Can I switch between Student and Teacher roles?', a: 'Your role is set during registration. Contact an administrator if you need your role changed after signing up.' },
  { q: 'How do I view my grades and progress?', a: 'Sign in and navigate to your Dashboard. You can view grades, attendance, progress overview, and AI insights from the sidebar.' },
  { q: 'Is there a mobile app available?', a: 'The platform is fully responsive and works on all devices. A dedicated mobile app is on our roadmap.' },
];

const supportChannels = [
  { icon: Mail, label: 'Email', value: 'support@scholarai.edu', color: 'text-blue-600 bg-blue-50' },
  { icon: Phone, label: 'Phone', value: '(555) 123-4567', color: 'text-cyan-600 bg-cyan-50' },
  { icon: MapPin, label: 'Office', value: '100 Campus Drive, Education City', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri 8:00 AM - 6:00 PM', color: 'text-amber-600 bg-amber-50' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Get in Touch</h1>
        <p className="mt-2 text-slate-500">Have questions? We're here to help. Reach out and we'll respond within 24 hours.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-blue-600" />Send us a message</CardTitle></CardHeader>
            <CardContent>
              {submitted && <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-700">Thank you! Your message has been sent. We'll get back to you shortly.</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" /></div>
                <div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more about your inquiry..." /></div>
                <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4" />Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Support Channels</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {supportChannels.map((ch) => (
                <div key={ch.label} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ch.color}`}><ch.icon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium text-slate-400">{ch.label}</p><p className="text-sm font-medium text-slate-700">{ch.value}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><HelpCircle className="h-5 w-5 text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium text-slate-900">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-500">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
