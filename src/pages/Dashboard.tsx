import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PRESET_MIX, CTA_LABEL, ARCHETYPES, type FunnelStage, type CtaType } from '@/lib/principles';
import { generateCalendar, computeMixCheck } from '@/lib/calendar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PenSquare, CalendarDays, FileText, CheckCircle2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const funnelColor: Record<FunnelStage, string> = {
  TOFU: 'bg-linkedin/20 text-linkedin',
  MOFU: 'bg-warning/20 text-warning',
  BOFU: 'bg-success/20 text-success',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const setCalendar = useAppStore((s) => s.setCalendar);
  const extendCalendar = useAppStore((s) => s.extendCalendar);
  const updateSlot = useAppStore((s) => s.updateSlot);
  const approveCalendar = useAppStore((s) => s.approveCalendar);

  useEffect(() => {
    if (brief && !calendar) setCalendar(generateCalendar(brief));
  }, [brief, calendar, setCalendar]);

  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Build your Strategy Brief</h2>
        <p className="text-muted-foreground text-sm">Everything starts from your brief.</p>
        <Button variant="linkedin" onClick={() => navigate('/onboarding')}>Open onboarding</Button>
      </div>
    );
  }

  if (!calendar) {
    return <div className="p-8 text-center text-muted-foreground">Generating calendar…</div>;
  }

  const presetMeta = PRESET_MIX[brief.preset];
  const draftedCount = drafts.length;
  const publishedCount = drafts.filter((d) => d.status === 'published').length;
  const mix = computeMixCheck(calendar, brief.preset);

  const weeks = Array.from({ length: calendar.weeks }, (_, i) => i + 1).map((w) => ({
    week: w,
    slots: calendar.slots.filter((s) => s.week === w),
  }));

  const handleRegenerate = () => {
    setCalendar(generateCalendar(brief));
    toast.success('Calendar regenerated');
  };

  const handleApprove = () => {
    approveCalendar();
    toast.success('Calendar approved — you can draft slots now');
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">{brief.companyName || 'Strategy'} · {presetMeta.label}</h1>
          <p className="text-muted-foreground text-sm mt-1">{calendar.slots.length} slots · {calendar.weeks} weeks · posts Mon morning + Fri afternoon</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Regenerate</Button>
          {calendar.approvedAt ? (
            <Badge className="bg-success/15 text-success border-success/30 h-9 px-3"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approved</Badge>
          ) : (
            <Button variant="linkedin" size="sm" onClick={handleApprove}><CheckCircle2 className="h-4 w-4 mr-1.5" />Approve calendar</Button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Slots planned" value={calendar.slots.length} icon={CalendarDays} />
        <StatCard label="Drafted" value={draftedCount} icon={FileText} />
        <StatCard label="Published" value={publishedCount} icon={PenSquare} />
        <StatCard label="Calendar" value={calendar.approvedAt ? 'Approved' : 'Pending'} icon={CheckCircle2} small />
      </div>

      {/* Mix Check */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-linkedin" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Mix Check</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">Funnel stage</p>
              <div className="space-y-2">
                {(['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).map((k) => (
                  <MixRow key={k} label={k} target={mix.funnel.target[k]} actual={mix.funnel.actual[k]} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">CTA cadence</p>
              <div className="space-y-2">
                {(['none', 'soft', 'comment-gated', 'hard'] as CtaType[]).map((k) => (
                  <MixRow key={k} label={CTA_LABEL[k]} target={mix.cta.target[k]} actual={mix.cta.actual[k]} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weeks */}
      <div className="space-y-8">
        {weeks.map(({ week, slots }) => (
          <div key={week}>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Week {week}</h3>
            <div className="space-y-2">
              {slots.map((slot) => {
                const d = new Date(slot.scheduledFor);
                return (
                  <Card key={slot.id} className="hover:border-linkedin/40 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="text-center min-w-[3.25rem]">
                        <div className="text-[10px] text-muted-foreground uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-black text-foreground">{d.getDate()}</div>
                        <div className="text-[10px] text-muted-foreground">{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground leading-snug">{slot.workingAngle}</p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Badge className={cn('text-[10px]', funnelColor[slot.funnelStage])}>{slot.funnelStage}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{slot.pillarName}</Badge>
                          <Select value={slot.archetypeId} onValueChange={(v) => updateSlot(slot.id, { archetypeId: v, archetypeName: ARCHETYPES.find((a) => a.id === v)?.name || '' })}>
                            <SelectTrigger className="h-6 w-auto text-[10px] gap-1 px-2 py-0 bg-muted border-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ARCHETYPES.map((a) => <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Select value={slot.ctaType} onValueChange={(v) => updateSlot(slot.id, { ctaType: v as CtaType })}>
                            <SelectTrigger className="h-6 w-auto text-[10px] gap-1 px-2 py-0 bg-muted border-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(CTA_LABEL) as CtaType[]).map((c) => <SelectItem key={c} value={c} className="text-xs">{CTA_LABEL[c]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Asset: {slot.assetNeeded}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={slot.status === 'drafted' ? 'outline' : 'linkedin'}
                        disabled={!calendar.approvedAt}
                        onClick={() => navigate(`/draft?slot=${slot.id}`)}
                        className="shrink-0"
                      >
                        <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                        {slot.status === 'drafted' ? 'Edit draft' : 'Draft'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {(() => {
        const allDone = calendar.slots.length > 0 && calendar.slots.every((s) => s.status === 'drafted' || s.status === 'published');
        if (!allDone) return null;
        return (
          <div className="mt-10 flex flex-col items-center gap-3 p-6 rounded-xl border border-linkedin/30 bg-linkedin/5 text-center">
            <p className="text-sm font-semibold text-foreground">You've drafted every slot in this 4-week plan.</p>
            <p className="text-xs text-muted-foreground">Generate the next 4 weeks so you don't run out of runway.</p>
            <Button variant="linkedin" size="sm" onClick={() => { extendCalendar(); toast.success('Added 4 more weeks to your calendar'); }}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Generate next 4 weeks
            </Button>
          </div>
        );
      })()}
      {!calendar.approvedAt && (
        <p className="text-xs text-muted-foreground text-center mt-8">Approve the calendar to unlock drafting.</p>
      )}
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

function MixRow({ label, target, actual }: { label: string; target: number; actual: number }) {
  const diff = actual - target;
  const ok = Math.abs(diff) <= 10;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-linkedin/40" style={{ width: `${target}%` }} />
        <div className={cn('absolute inset-y-0 left-0 border-r-2', ok ? 'border-success' : 'border-destructive')} style={{ width: `${actual}%` }} />
      </div>
      <span className={cn('text-[11px] font-mono w-16 text-right', ok ? 'text-muted-foreground' : 'text-destructive')}>{actual}% / {target}%</span>
    </div>
  );
}

export default Dashboard;
