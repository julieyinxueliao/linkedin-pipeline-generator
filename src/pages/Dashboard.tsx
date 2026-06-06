import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PRESET_MIX, type FunnelStage } from '@/lib/principles';
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
          {/* Combined: What you are building + Who you sell to */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">WHAT YOU ARE BUILDING</p>
                <EditableField
                  fieldLabel="WHAT YOU ARE BUILDING"
                  value={brief.wedge}
                  context={briefContext}
                  multiline={false}
                  onSave={(v) => updateBrief({ wedge: v })}
                  displayClassName="text-sm text-foreground leading-relaxed"
                  placeholder="—"
                />
              </div>
              <div className="pt-3 border-t border-border space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Who you sell to</p>
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

          {/* Mix Check */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-linkedin" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mix check — how balanced your plan is</p>
              </div>
              {(() => {
                const mix = computeMixCheck(calendar, brief.preset);
                const funnelLabel: Record<FunnelStage, string> = { TOFU: 'Maximize reach', MOFU: 'Build credibility', BOFU: 'Drive conversions' };
                return (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Post purpose</p>
                    <div className="space-y-2">
                      {(['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).map((k) => (
                        <MixRow key={k} label={funnelLabel[k]} target={mix.funnel.target[k]} actual={mix.funnel.actual[k]} />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>


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
