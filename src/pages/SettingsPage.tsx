import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const SettingsPage = () => {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetAll = useAppStore((s) => s.resetAll);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voiceTraits, setVoiceTraits] = useState<string[]>(profile.voiceStyle);
  const [newTrait, setNewTrait] = useState('');

  useEffect(() => {
    setVoiceTraits(profile.voiceStyle);
  }, [profile.voiceStyle]);

  const handleSave = () => {
    updateProfile({ voiceStyle: voiceTraits });
    toast.success('Settings saved');
  };

  const handleAddTrait = () => {
    const v = newTrait.trim();
    if (!v) return;
    setVoiceTraits((p) => [...p, v]);
    setNewTrait('');
  };

  const handleRedoOnboarding = () => {
    resetAll();
    navigate('/onboarding');
  };

  const connections = [
    { name: 'Google Drive', connected: profile.connectedSources.some((c) => c.id === 'google-drive') },
    { name: 'Notion', connected: profile.connectedSources.some((c) => c.id === 'notion') },
    { name: 'LinkedIn', connected: !!profile.linkedinUrl },
  ];

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <SEO
        title="Settings — profile, writing style, and company | Brand Builder"
        description="Manage your profile, writing style traits, and company context. Update anything captured during onboarding."
        path="/settings"
        noindex
      />
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name"><Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="Your name" /></Field>
          <Field label="Email"><Input value={user?.email || ''} readOnly className="bg-muted" /></Field>
          <Field label="Role"><Input value={profile.role} onChange={(e) => updateProfile({ role: e.target.value })} /></Field>
          <Field label="Industry / wedge"><Input value={profile.industry} onChange={(e) => updateProfile({ industry: e.target.value })} /></Field>
          <Field label="Company website"><Input value={profile.websiteUrl || ''} onChange={(e) => updateProfile({ websiteUrl: e.target.value })} placeholder="https://…" /></Field>
          <Field label="LinkedIn company page"><Input value={profile.linkedinUrl || ''} onChange={(e) => updateProfile({ linkedinUrl: e.target.value })} placeholder="https://linkedin.com/company/…" /></Field>
          <Field label="LinkedIn Goal"><Input value={profile.goal} readOnly className="bg-muted" /></Field>
          <Button variant="linkedin" onClick={handleSave}>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Writing Style Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Edit how your posts should sound. Add or remove traits anytime.</p>
          <div className="space-y-2">
            {voiceTraits.map((trait, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-linkedin shrink-0" />
                <Input
                  value={trait}
                  onChange={(e) => setVoiceTraits((p) => p.map((t, idx) => (idx === i ? e.target.value : t)))}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => setVoiceTraits((p) => p.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
              placeholder="Add a writing style trait — e.g. Punchy, no jargon"
            />
            <Button variant="outline" size="icon" onClick={handleAddTrait}><Plus className="h-4 w-4" /></Button>
          </div>
          <Button variant="linkedin" size="sm" onClick={handleSave}>Save writing style profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Connections</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {connections.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{c.name}</span>
              {c.connected ? (
                <Badge className="bg-success/20 text-success text-xs"><Check className="h-3 w-3 mr-1" /> Connected</Badge>
              ) : (
                <Button variant="outline" size="sm">Connect</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Onboarding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Your onboarding info lives here. Re-run it any time to rebuild your strategy from scratch.</p>
          <Button variant="outline" size="sm" onClick={handleRedoOnboarding}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Redo onboarding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

export default SettingsPage;
