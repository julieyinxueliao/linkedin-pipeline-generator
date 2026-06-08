import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { PRESET_MIX, CTA_LABEL, ARCHETYPES, FUNNEL_STAGE_LABELS, type FunnelStage, type CtaType } from '@/lib/principles';
import { generateCalendar, computeMixCheck } from '@/lib/calendar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PenSquare, AlertCircle, CheckCircle2, RotateCcw, Sparkles, Globe, CalendarDays, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';


const funnelColor: Record<FunnelStage, string> = {
  TOFU: 'bg-linkedin/20 text-linkedin',
  MOFU: 'bg-warning/20 text-warning',
  BOFU: 'bg-success/20 text-success',
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const setCalendar = useAppStore((s) => s.setCalendar);
  const extendCalendar = useAppStore((s) => s.extendCalendar);
  const updateSlot = useAppStore((s) => s.updateSlot);
  const updateDraft = useAppStore((s) => s.updateDraft);
  const updateBrief = useAppStore((s) => s.updateBrief);

  useEffect(() => {
    if (brief && !calendar) setCalendar(generateCalendar(brief));
  }, [brief, calendar, setCalendar]);


  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Build your Strategy Brief first</h2>
        <Button variant="linkedin" onClick={() => navigate('/onboarding')}>Open onboarding</Button>
      </div>
    );
  }

  if (!calendar) {
    return <div className="p-8 text-center text-muted-foreground">Generating calendar…</div>;
  }

  const presetMeta = PRESET_MIX[brief.preset];
  

  const weeks = Array.from({ length: calendar.weeks }, (_, i) => i + 1).map((w) => ({
    week: w,
    slots: calendar.slots.filter((s) => s.week === w),
  }));

  const handleRegenerate = () => {
    setCalendar(generateCalendar(brief, { funnelMix: brief.customMix }));
    toast.success('Calendar regenerated');
  };

  const handleSaveMix = (next: Record<FunnelStage, number>) => {
    updateBrief({ customMix: next });
    setCalendar(generateCalendar(brief, { funnelMix: next }));
    toast.success('Content balance updated — calendar regenerated');
  };

  const handleResetMix = () => {
    updateBrief({ customMix: undefined });
    setCalendar(generateCalendar(brief));
    toast.success('Reset to preset');
  };


  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <SEO
        title="Calendar — your LinkedIn content plan | Brand Builder"
        description="Review your 4-week LinkedIn content calendar, draft posts, and track post purpose balance across reach, credibility, and conversions."
        path="/calendar"
        noindex
      />
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">{calendar.slots.length} slots · {calendar.weeks} weeks · {presetMeta.label} · skips weekends, Mon AM, Fri PM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Regenerate</Button>
        </div>
      </div>

      {/* Content Balance editor */}
      <Card className="mb-6">
        <CardContent className="p-5">
          {(() => {
            const mix = computeMixCheck(calendar, brief.preset);
            const target = brief.customMix || mix.funnel.target;
            return (
              <InlineMixEditor
                current={target}
                actual={mix.funnel.actual}
                preset={mix.funnel.target}
                onSave={handleSaveMix}
                onReset={handleResetMix}
                isCustom={!!brief.customMix}
              />
            );
          })()}
        </CardContent>
      </Card>


      {/* Metrics */}
      {(() => {
        const draftedCount = drafts.filter((d) => d.status === 'draft').length;
        const publishedCount = drafts.filter((d) => d.status === 'published').length;
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <StatCard label="Slots planned" value={calendar.slots.length} icon={CalendarDays} />
              <StatCard label="In draft" value={draftedCount} icon={FileText} />
              <StatCard label="Published" value={publishedCount} icon={PenSquare} />
            </div>
            <p className="text-[11px] text-muted-foreground mb-8">"Published" updates when you mark a draft as published — we don't connect to your LinkedIn account.</p>
          </>
        );
      })()}




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
                          <Badge className={cn('text-[10px]', funnelColor[slot.funnelStage])}>{FUNNEL_STAGE_LABELS[slot.funnelStage]}</Badge>
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
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant={slot.status === 'drafted' || slot.status === 'approved' || slot.status === 'published' ? 'outline' : 'linkedin'}
                          onClick={() => navigate(`/draft?slot=${slot.id}`)}
                        >
                          <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                          {slot.status === 'planned' ? 'Draft' : 'Edit draft'}
                        </Button>

                        {slot.status === 'drafted' && (
                          <Button
                            size="sm"
                            variant="linkedin"
                            onClick={() => {
                              updateSlot(slot.id, { status: 'published' });
                              if (slot.draftId) updateDraft(slot.draftId, { status: 'published' });
                              toast.success('Marked as published');
                            }}
                          >
                            <Globe className="h-3.5 w-3.5 mr-1.5" />Mark as published
                          </Button>
                        )}
                        {(slot.status === 'approved' || slot.status === 'published') && (
                          <Badge className="bg-success/15 text-success border-success/30 justify-center h-7 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />Published
                          </Badge>
                        )}
                      </div>
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
    </div>
  );
};


function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function InlineMixEditor({
  current,
  actual,
  preset,
  onSave,
  onReset,
  isCustom,
}: {
  current: Record<FunnelStage, number>;
  actual: Record<FunnelStage, number>;
  preset: Record<FunnelStage, number>;
  onSave: (next: Record<FunnelStage, number>) => void;
  onReset: () => void;
  isCustom: boolean;
}) {
  const [draft, setDraft] = useState<Record<FunnelStage, number>>(current);

  useEffect(() => {
    setDraft(current);
  }, [current.TOFU, current.MOFU, current.BOFU]);

  const total = draft.TOFU + draft.MOFU + draft.BOFU;
  const valid = total === 100;
  const dirty =
    draft.TOFU !== current.TOFU || draft.MOFU !== current.MOFU || draft.BOFU !== current.BOFU;

  const handleChange = (key: FunnelStage, value: number) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    const others = (['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).filter((k) => k !== key);
    const remaining = 100 - v;
    const othersTotal = draft[others[0]] + draft[others[1]];
    let a: number, b: number;
    if (othersTotal === 0) {
      a = Math.round(remaining / 2);
      b = remaining - a;
    } else {
      a = Math.round((draft[others[0]] / othersTotal) * remaining);
      b = remaining - a;
    }
    setDraft({ ...draft, [key]: v, [others[0]]: a, [others[1]]: b } as Record<FunnelStage, number>);
  };

  const save = () => {
    if (!valid) {
      toast.error('Must total 100%');
      return;
    }
    onSave(draft);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-linkedin" />
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Content balance — drag to adjust how your posts are split
          </p>
        </div>
        {isCustom && !dirty && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" />Reset to preset
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {(['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).map((k) => {
          const delta = draft[k] - current[k];
          const diff = actual[k] - draft[k];
          const ok = Math.abs(diff) <= 10;
          return (
            <div key={k} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{FUNNEL_STAGE_LABELS[k]}</span>
                <div className="flex items-center gap-2">
                  {delta !== 0 && (
                    <span className={cn('text-[10px] font-mono', delta > 0 ? 'text-success' : 'text-destructive')}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <span className="text-xs font-mono text-foreground w-10 text-right">{draft[k]}%</span>
                </div>
              </div>
              <Slider value={[draft[k]]} min={0} max={100} step={1} onValueChange={(v) => handleChange(k, v[0])} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Preset {preset[k]}%</span>
                <span className={cn(ok ? 'text-muted-foreground' : 'text-destructive')}>
                  Actual posts: {actual[k]}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-md border border-border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {dirty ? 'Preview of new split' : 'Current split'}
          </p>
          <span className={cn('text-[10px] font-mono', valid ? 'text-muted-foreground' : 'text-destructive')}>
            Total {total}%
          </span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="bg-linkedin" style={{ width: `${draft.TOFU}%` }} />
          <div className="bg-linkedin/70" style={{ width: `${draft.MOFU}%` }} />
          <div className="bg-linkedin/40" style={{ width: `${draft.BOFU}%` }} />
        </div>
      </div>

      {dirty && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDraft(current)}>Cancel</Button>
          <Button variant="linkedin" size="sm" onClick={save} disabled={!valid}>Save & regenerate</Button>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;


