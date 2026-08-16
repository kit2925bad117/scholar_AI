'use client';

import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, bio, department }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage your profile and preferences</p></div>
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-blue-600" />Profile Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white">{profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}</div>
            <div><Badge variant="secondary" className="capitalize">{profile?.role}</Badge><p className="mt-1 text-sm text-slate-500">{user?.email}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" /></div>
            <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." /></div>
          {saved && <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">Profile saved successfully!</div>}
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
