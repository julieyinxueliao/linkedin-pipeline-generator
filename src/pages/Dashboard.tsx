import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PRESET_MIX } from '@/lib/principles';
import { generateCalendar } from '@/lib/calendar';
import { PenSquare, CalendarDays, FileText, CheckCircle2, AlertCircle, Sparkles, Target, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';

const Dashboard = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const setCalendar = useAppStore((s) => s.setCalendar);

  useEffect(() => {
    if (brief && !calendar) setCalendar(generateCalendar(brief));
  }, [brief, calendar, setCalendar]);

  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-black tracking-tight">Turn your expertise into pipeline.</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          A proven content strategy, built around your company. Tell us about your product, voice, and goals — we'll generate your strategy brief, 4-week calendar, and drafts in your voice.
        </p>
        <Button variant="linkedin" onClick={() => navigate('/onboarding')}>Start onboarding</Button>
      </div>
    );
  }

  if (!calendar) {
    return <div className="p-8 text-center text-muted-foreground">Generating calendar…</div>;
  }

  const presetMeta = PRESET_MIX[brief.preset];
  const draftedCount = drafts.filter((d) => d.status === 'draft').length;
  const approvedCount = drafts.filter((d) => d.status === 'approved' || d.status === 'published').length;
  const publishedCount = drafts.filter((d) => d.status === 'published').length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <SEO
        title="Dashboard — your LinkedIn strategy brief | Brand Builder"
        description="Your tailored LinkedIn strategy brief, key metrics, content pillars, and POV bank — all in one place."
        path="/dashboard"
        noindex
      />
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">{brief.companyName || 'Strategy'} · {presetMeta.label}</h1>
          <p className="text-muted-foreground text-sm mt-1">Your source of truth for every post.</p>
        </div>
        <Button variant="linkedin" size="sm" onClick={() => navigate('/calendar')}>
          <CalendarDays className="h-4 w-4 mr-1.5" />Open calendar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <StatCard label="Slots planned" value={calendar.slots.length} icon={CalendarDays} />
        <StatCard label="In draft" value={draftedCount} icon={FileText} />
        <StatCard label="Approved" value={approvedCount} icon={ThumbsUp} />
        <StatCard label="Published" value={publishedCount} icon={PenSquare} />
        <StatCard label="Calendar" value={calendar.approvedAt ? 'Approved' : 'Pending'} icon={CheckCircle2} small />
      </div>
      <p className="text-[11px] text-muted-foreground mb-8">Published is tracked manually — mark a draft as published once you post it on LinkedIn. We don't read your LinkedIn account.</p>

      {/* STRATEGY BRIEF */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-linkedin" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Strategy Brief</h2>
        </div>

        <Card>
          <CardContent className="p-5 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category POV to own</p>
            <p className="text-base font-semibold text-foreground leading-snug">{brief.categoryPov}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Wedge</p>
              <p className="text-sm text-foreground leading-relaxed">{brief.wedge || '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ideal customer</p>
              <p className="text-sm text-foreground leading-relaxed">
                {brief.icpTitles || '—'}{brief.icpCompanyType ? ` · ${brief.icpCompanyType}` : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {brief.povBank && brief.povBank.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-linkedin" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">POV Bank ({brief.povBank.length})</p>
              </div>
              <div className="space-y-2">
                {brief.povBank.map((p, idx) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-linkedin font-bold mt-0.5 w-5 shrink-0">#{idx + 1}</span>
                    <p className="text-sm text-foreground/85 leading-snug flex-1">{p.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {brief.pillars && brief.pillars.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Content Pillars</p>
              <div className="grid md:grid-cols-2 gap-2">
                {brief.pillars.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{p.funnelTilt}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.exampleAngles.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {brief.assetInventory && brief.assetInventory.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Asset Inventory</p>
              <div className="space-y-1.5">
                {brief.assetInventory.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-xs">
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.hasProof ? 'bg-success' : 'bg-warning')} />
                    <span className="text-foreground/70">{a.text}</span>
                    {!a.hasProof && <span className="text-warning/80 text-[10px] uppercase">to source</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

function StatCard({ label, value, icon: Icon, small }: { label: string; value: string | number; icon: any; small?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <div className="min-w-0">
        <p className={small ? 'text-sm font-bold text-foreground truncate' : 'text-2xl font-black text-foreground'}>{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default Dashboard;
