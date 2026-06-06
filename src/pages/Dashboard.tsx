import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PRESET_MIX, CTA_LABEL, type FunnelStage, type CtaType } from '@/lib/principles';
import { generateCalendar, computeMixCheck } from '@/lib/calendar';
import { PenSquare, CalendarDays, FileText, AlertCircle, Sparkles, Target, Upload, Link2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { EditableField } from '@/components/EditableField';

const Dashboard = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const setCalendar = useAppStore((s) => s.setCalendar);
  const updateBrief = useAppStore((s) => s.updateBrief);


  useEffect(() => {
    if (brief && !calendar) setCalendar(generateCalendar(brief));
  }, [brief, calendar, setCalendar]);

  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-black tracking-tight">Turn what you know into LinkedIn posts.</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          A simple content plan, built around your company. Tell us about your product, voice, and goals — we'll generate a 4-week calendar and post drafts that sound like you.
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
  const publishedCount = drafts.filter((d) => d.status === 'published').length;

  const briefContext = useMemo(() => {
    if (!brief) return '';
    return [
      `Company: ${brief.companyName} — ${brief.companyOneLiner}`,
      `Wedge: ${brief.wedge}`,
      `ICP: ${brief.icpTitles} at ${brief.icpCompanyType}`,
      `Category POV: ${brief.categoryPov}`,
      brief.proofPoints?.length ? `Proof points: ${brief.proofPoints.join('; ')}` : '',
    ].filter(Boolean).join('\n');
  }, [brief]);

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
          <p className="text-muted-foreground text-sm mt-1">Everything that shapes your posts, in one place.</p>
        </div>
        <Button variant="linkedin" size="sm" onClick={() => navigate('/calendar')}>
          <CalendarDays className="h-4 w-4 mr-1.5" />Open calendar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <StatCard label="Slots planned" value={calendar.slots.length} icon={CalendarDays} />
        <StatCard label="In draft" value={draftedCount} icon={FileText} />
        <StatCard label="Published" value={publishedCount} icon={PenSquare} />
      </div>
      <p className="text-[11px] text-muted-foreground mb-8">"Published" updates when you mark a draft as published — we don't connect to your LinkedIn account.</p>

      {/* STRATEGY BRIEF */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-linkedin" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Content Plan</h2>
        </div>

        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Your main point of view</p>
            <EditableField
              fieldLabel="Main point of view"
              value={brief.categoryPov}
              context={briefContext}
              multiline={false}
              onSave={(v) => updateBrief({ categoryPov: v })}
              displayClassName="text-base font-semibold text-foreground leading-snug"
            />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">What you want to be known for</p>
              <EditableField
                fieldLabel="What you want to be known for"
                value={brief.wedge}
                context={briefContext}
                multiline={false}
                onSave={(v) => updateBrief({ wedge: v })}
                displayClassName="text-sm text-foreground leading-relaxed"
                placeholder="—"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Who you sell to</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Job titles</p>
                  <EditableField
                    fieldLabel="Job titles you sell to"
                    value={brief.icpTitles}
                    context={briefContext}
                    multiline={false}
                    onSave={(v) => updateBrief({ icpTitles: v })}
                    displayClassName="text-sm text-foreground leading-relaxed"
                    placeholder="—"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Type of company they work at</p>
                  <EditableField
                    fieldLabel="Type of company they work at"
                    value={brief.icpCompanyType}
                    context={briefContext}
                    multiline={false}
                    onSave={(v) => updateBrief({ icpCompanyType: v })}
                    displayClassName="text-sm text-foreground leading-relaxed"
                    placeholder="—"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mix Check (moved from Calendar) */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-linkedin" />
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mix check — how balanced your plan is</p>
            </div>
            {(() => {
              const mix = computeMixCheck(calendar, brief.preset);
              return (
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
              );
            })()}
          </CardContent>
        </Card>

        {brief.pillars && brief.pillars.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Topics you'll post about</p>
              <div className="grid md:grid-cols-2 gap-2">
                {brief.pillars.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{p.funnelTilt}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">Topic name</p>
                      <EditableField
                        fieldLabel={`Topic name (${p.funnelTilt})`}
                        value={p.name}
                        context={briefContext}
                        multiline={false}
                        onSave={(v) => updateBrief({ pillars: brief.pillars.map((x) => x.id === p.id ? { ...x, name: v } : x) })}
                        displayClassName="text-sm font-semibold text-foreground"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">Example angles</p>
                      <EditableField
                        fieldLabel={`Example angles for topic "${p.name}" (separate with " · ")`}
                        value={p.exampleAngles.join(' · ')}
                        context={briefContext}
                        multiline
                        onSave={(v) => updateBrief({ pillars: brief.pillars.map((x) => x.id === p.id ? { ...x, exampleAngles: v.split(/\s*·\s*|\n+/).map((s) => s.trim()).filter(Boolean) } : x) })}
                        displayClassName="text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {brief.assetInventory && brief.assetInventory.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stories & proof to pull from</p>
              <div className="space-y-3">
                {brief.assetInventory.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 mt-2', a.hasProof ? 'bg-success' : 'bg-warning')} />
                    <div className="flex-1 min-w-0">
                      <EditableField
                        fieldLabel="Story or proof point"
                        value={a.text}
                        context={briefContext}
                        multiline={false}
                        onSave={(v) => updateBrief({ assetInventory: brief.assetInventory.map((x) => x.id === a.id ? { ...x, text: v } : x) })}
                        displayClassName="text-xs text-foreground/70"
                      />
                      {!a.hasProof && <span className="text-warning/80 text-[10px] uppercase">add details</span>}
                    </div>
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
