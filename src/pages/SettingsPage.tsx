import { useAppStore } from '@/lib/store';
import { mockVoiceProfile } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const handleSave = () => toast.success('Settings saved!');

  const connections = [
    { name: 'Google Drive', connected: false },
    { name: 'Notion', connected: false },
    { name: 'LinkedIn', connected: false },
  ];

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Name</label>
            <Input value={profile.name || 'Jane Doe'} onChange={(e) => updateProfile({ name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Role</label>
            <Input value={profile.role} onChange={(e) => updateProfile({ role: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Industry</label>
            <Input value={profile.industry} onChange={(e) => updateProfile({ industry: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">LinkedIn Goal</label>
            <Input value={profile.goal} readOnly className="bg-muted" />
          </div>
          <Button variant="linkedin" onClick={handleSave}>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {(profile.voiceStyle.length > 0 ? profile.voiceStyle : mockVoiceProfile).map((trait, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-linkedin shrink-0" />
                {trait}
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Re-run calibration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connections</CardTitle>
        </CardHeader>
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
    </div>
  );
};

export default SettingsPage;
