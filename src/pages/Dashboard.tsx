import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PRESET_MIX, FUNNEL_STAGE_LABELS, type FunnelStage } from '@/lib/principles';
import { generateCalendar, computeMixCheck } from '@/lib/calendar';
import { CalendarDays, AlertCircle, Sparkles, Target, Upload, Link2, Plus, Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { EditableField } from '@/components/EditableField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

const Dashboard = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
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
        title="Strategy & Plans — your LinkedIn strategy brief | Brand Builder"
        description="Your tailored LinkedIn strategy, content pillars, mix check, and sources — all in one place."
        path="/dashboard"
        noindex
      />
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Strategy & Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">{brief.companyName || 'Strategy'} · {presetMeta.label} — everything that shapes your posts.</p>
        </div>
        <Button variant="linkedin" size="sm" onClick={() => navigate('/calendar')}>
          <CalendarDays className="h-4 w-4 mr-1.5" />Open calendar
        </Button>
      </div>


      {/* STRATEGY BRIEF */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-linkedin" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Content Plan</h2>
        </div>

        <div>
          {/* Content Balance — inline draggable sliders */}
          <Card>
            <CardContent className="p-5">
              {(() => {
                const mix = computeMixCheck(calendar, brief.preset);
                const target = brief.customMix || mix.funnel.target;
                return (
                  <InlineMixEditor
                    current={target}
                    actual={mix.funnel.actual}
                    preset={mix.funnel.target}
                    onSave={(next) => updateBrief({ customMix: next })}
                    onReset={() => updateBrief({ customMix: undefined })}
                    isCustom={!!brief.customMix}
                  />
                );
              })()}
            </CardContent>
          </Card>
        </div>


        {brief.pillars && brief.pillars.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Topics you'll post about</p>
              <div className="space-y-3">
                {brief.pillars.map((p, idx) => {
                  const pillarCount = brief.pillars.length;
                  const pillarPovs = (brief.povBank || []).filter((_, i) => i % pillarCount === idx);
                  return (
                    <div key={p.id} className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="text-[10px] mt-0.5 shrink-0">{FUNNEL_STAGE_LABELS[p.funnelTilt]}</Badge>
                          <div className="flex-1 min-w-0">
                            <EditableField
                              fieldLabel={`Topic name (${FUNNEL_STAGE_LABELS[p.funnelTilt]})`}
                              value={p.name}
                              context={briefContext}
                              multiline={false}
                              onSave={(v) => updateBrief({ pillars: brief.pillars.map((x) => x.id === p.id ? { ...x, name: v } : x) })}
                              displayClassName="text-sm font-semibold text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border bg-background/40 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Angles</p>
                          <span className="text-[10px] text-muted-foreground">{pillarPovs.length} sharp takes</span>
                        </div>
                        {pillarPovs.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No POVs yet for this topic.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {pillarPovs.map((pov) => (
                              <li key={pov.id} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                                <span className="text-linkedin mt-1 shrink-0">›</span>
                                <EditableField
                                  fieldLabel="POV"
                                  value={pov.text}
                                  context={briefContext}
                                  multiline
                                  onSave={(v) => updateBrief({ povBank: (brief.povBank || []).map((x) => x.id === pov.id ? { ...x, text: v, edited: true } : x) })}
                                  displayClassName="text-xs text-foreground/80 leading-relaxed"
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <SourcesUploader />
      </div>
    </div>
  );
};

function SourcesUploader() {
  const brief = useAppStore((s) => s.brief);
  const updateBrief = useAppStore((s) => s.updateBrief);
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  if (!brief) return null;

  const addAsset = (text: string, hasProof = false) => {
    const pillarId = brief.pillars?.[0]?.id || '';
    const next = [...(brief.assetInventory || []), { id: `as-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, pillarId, text, hasProof }];
    updateBrief({ assetInventory: next });
  };

  const handleUrl = () => {
    if (!url.trim()) return;
    addAsset(`Source: ${url.trim()}`, false);
    setUrl('');
    toast.success('Source added — we\'ll pull stories & proof from it');
  };
  const handleNote = () => {
    if (!note.trim()) return;
    addAsset(note.trim(), true);
    setNote('');
    toast.success('Story added to your inventory');
  };
  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    Array.from(files).forEach((f) => addAsset(`File: ${f.name}`, false));
    toast.success(`${files.length} file(s) added`);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-3.5 w-3.5 text-linkedin" />
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Upload sources to mine for stories & proof</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Drop case studies, customer call notes, decks, or any doc that contains real wins and numbers. We'll use them when drafting posts.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-[10px] uppercase text-muted-foreground">Upload a file</p>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-linkedin/40 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            >
              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-foreground">Click or drop files</p>
              <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, TXT, MD</p>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.doc,.docx,.txt,.md" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase text-muted-foreground">Paste a URL</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com/case-study" className="pl-8 h-9 text-sm" />
              </div>
              <Button size="sm" variant="linkedin" onClick={handleUrl}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <p className="text-[10px] uppercase text-muted-foreground pt-2">Or type a story / number</p>
            <div className="flex gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Cut onboarding from 14 days to 2" className="h-9 text-sm" />
              <Button size="sm" variant="linkedin" onClick={handleNote}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>

        {brief.assetInventory && brief.assetInventory.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-[10px] uppercase text-muted-foreground">Your sources ({brief.assetInventory.length})</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {brief.assetInventory.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 mt-1.5', a.hasProof ? 'bg-success' : 'bg-warning')} />
                  <span className="flex-1 text-foreground/70">{a.text}</span>
                  <button
                    className="text-[10px] text-muted-foreground hover:text-destructive"
                    onClick={() => updateBrief({ assetInventory: (brief.assetInventory || []).filter((x) => x.id !== a.id) })}
                  >Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

function MixEditor({
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<FunnelStage, number>>(current);

  useEffect(() => {
    if (open) setDraft(current);
  }, [open, current]);

  const total = draft.TOFU + draft.MOFU + draft.BOFU;
  const valid = total === 100;

  // Drag one slider, redistribute the delta proportionally to the other two.
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
    setOpen(false);
    toast.success('Content balance updated');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <SettingsIcon className="h-3 w-3 mr-1" />Edit / adjust
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust content balance</DialogTitle>
          <DialogDescription>
            Drag each slider to set how much of your plan goes to each purpose. They always add up to 100%.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {(['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).map((k) => {
            const delta = draft[k] - current[k];
            return (
              <div key={k} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{FUNNEL_STAGE_LABELS[k]}</span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-foreground">{draft[k]}%</span>
                    {delta !== 0 && (
                      <span className={cn('text-[10px]', delta > 0 ? 'text-success' : 'text-destructive')}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  value={[draft[k]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => handleChange(k, v[0])}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Now: {current[k]}%</span>
                  <span>Actual posts: {actual[k]}%</span>
                </div>
              </div>
            );
          })}

          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="bg-linkedin" style={{ width: `${draft.TOFU}%` }} />
              <div className="bg-linkedin/70" style={{ width: `${draft.MOFU}%` }} />
              <div className="bg-linkedin/40" style={{ width: `${draft.BOFU}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Total: <span className={cn('font-mono', !valid && 'text-destructive')}>{total}%</span></span>
              <span>Preset: {preset.TOFU}/{preset.MOFU}/{preset.BOFU}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {isCustom && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { onReset(); setOpen(false); toast.success('Reset to preset'); }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />Reset to preset
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" variant="linkedin" size="sm" onClick={save} disabled={!valid}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Dashboard;
