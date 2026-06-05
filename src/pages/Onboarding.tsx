import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type ConnectedSource } from '@/lib/store';
import { mockVoiceProfile } from '@/lib/mock-data';
import { generateStrategyBrief, type BriefInputs, type PovItem } from '@/lib/strategy';
import { goalToPreset, PRESET_MIX } from '@/lib/principles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, User, FileText, Check, ArrowRight, Link2, FileUp, X, Sparkles, Loader2, Linkedin, Globe, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const goals = [
  { id: 'sell', label: 'Sell my product or company', desc: 'Generate leads and close deals through content', icon: Target },
  { id: 'brand', label: 'Build thought leadership', desc: 'Become the go-to voice in your space', icon: User },
  { id: 'other', label: 'Something else', desc: 'Tell us your unique goal', icon: FileText },
];

const documentSources = [
  { id: 'google-drive', name: 'Google Drive', icon: '📁', desc: 'Docs, slides, and spreadsheets' },
  { id: 'notion', name: 'Notion', icon: '📝', desc: 'Pages, databases, and wikis' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', desc: 'Files and paper documents' },
  { id: 'confluence', name: 'Confluence', icon: '📄', desc: 'Team knowledge base' },
];

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentOnboardingStep, setOnboardingStep, updateProfile, setOnboardingComplete, setBrief } = useAppStore();
  const step = currentOnboardingStep;

  // Step 0 — Goal
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  // Step 1 — Company URLs + auto-pull
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinCompanyUrl, setLinkedinCompanyUrl] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyOneLiner, setCompanyOneLiner] = useState('');
  const [wedge, setWedge] = useState('');
  const [icpTitles, setIcpTitles] = useState('');
  const [icpCompanyType, setIcpCompanyType] = useState('');
  const [proofPointsRaw, setProofPointsRaw] = useState('');

  // Step 2 — Connect document sources
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Step 3 — Voice
  const [voiceOption, setVoiceOption] = useState<'write' | 'upload' | null>(null);
  const [samplePost1, setSamplePost1] = useState('');
  const [samplePost2, setSamplePost2] = useState('');
  const [pastedPosts, setPastedPosts] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  // Step 4 — Brief preview
  const briefDraft = useMemo(() => {
    const inputs: BriefInputs = {
      preset: goalToPreset(selectedGoal),
      companyName,
      companyOneLiner,
      websiteUrl,
      wedge,
      icpTitles,
      icpCompanyType,
      proofPoints: proofPointsRaw.split('\n').map((s) => s.trim()).filter(Boolean),
      samplePosts: voiceOption === 'write' ? [samplePost1, samplePost2].filter(Boolean) : pastedPosts ? [pastedPosts] : [],
      connectedSourceNames: connectedSources.map((c) => c.name),
    };
    return generateStrategyBrief(inputs);
  }, [selectedGoal, companyName, companyOneLiner, websiteUrl, wedge, icpTitles, icpCompanyType, proofPointsRaw, samplePost1, samplePost2, pastedPosts, voiceOption, connectedSources]);

  const [editablePovBank, setEditablePovBank] = useState<PovItem[] | null>(null);
  const povBank = editablePovBank ?? briefDraft.povBank;

  const promptForWedge = wedge ? `What's one thing most ${icpTitles || 'people in your space'} get wrong about ${wedge}?` : `What's one thing most people in your space get wrong?`;

  const [pullWarning, setPullWarning] = useState<string | null>(null);

  const handleAutoPull = async () => {
    setIsPulling(true);
    setPullWarning(null);
    try {
      const { data, error } = await supabase.functions.invoke('pull-company-profile', {
        body: { websiteUrl, linkedinCompanyUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const d = data?.data ?? {};
      setCompanyName(d.companyName || '');
      setCompanyOneLiner(d.oneLiner || '');
      setWedge(d.wedge || '');
      setIcpTitles(d.icpTitles || '');
      setIcpCompanyType(d.icpCompanyType || '');
      setProofPointsRaw(Array.isArray(d.proofPoints) ? d.proofPoints.join('\n') : '');
      if (data?.warnings?.length) setPullWarning(data.warnings.join(' '));
      setPulled(true);
    } catch (e) {
      const msg = (e as Error).message || 'Failed to pull company data';
      toast.error(msg);
    } finally {
      setIsPulling(false);
    }
  };


  const handleConnectSource = (s: typeof documentSources[0]) => {
    setConnectingSourceId(s.id);
    setTimeout(() => {
      setConnectedSources((prev) => [...prev, {
        id: s.id, name: s.name, icon: s.icon,
        connectedAt: new Date().toISOString(),
        documentCount: Math.floor(Math.random() * 20) + 5,
      }]);
      setConnectingSourceId(null);
    }, 1200);
  };

  const handleAnalyzeVoice = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setVoiceReady(true);
    }, 2000);
  };

  const handleFinish = () => {
    const finalBrief = { ...briefDraft, povBank };
    setBrief(finalBrief);
    updateProfile({
      goal: selectedGoal === 'other' ? customGoal : selectedGoal,
      role: selectedGoal,
      industry: wedge,
      voiceStyle: mockVoiceProfile,
      samplePosts: voiceOption === 'write' ? [samplePost1, samplePost2].filter(Boolean) : pastedPosts ? [pastedPosts] : [],
      connectedSources,
      websiteUrl,
      linkedinUrl: linkedinCompanyUrl,
    });
    setOnboardingComplete(true);
    navigate('/dashboard');
  };

  const preset = goalToPreset(selectedGoal);

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-linkedin/4 blur-[100px] pointer-events-none" />
      <div className="w-full max-w-xl relative z-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={cn('h-1 rounded-full transition-all duration-500', i <= step ? 'bg-linkedin w-12' : 'bg-primary-foreground/10 w-6')} />
          ))}
        </div>

        {/* Step 0 — Goal */}
        {step === 0 && (
          <div className="animate-fade-in space-y-8">
            <Header step={1} title="What's your goal?" subtitle="Pick what matters most — this sets your entire content mix." />
            <div className="space-y-3">
              {goals.map((g) => (
                <button key={g.id} onClick={() => setSelectedGoal(g.id)} className={cardCls(selectedGoal === g.id)}>
                  <div className={iconBoxCls(selectedGoal === g.id)}><g.icon className="h-5 w-5" /></div>
                  <div className="text-left">
                    <span className="font-semibold text-primary-foreground block">{g.label}</span>
                    <span className="text-xs text-primary-foreground/40 mt-0.5 block">{g.desc}</span>
                  </div>
                </button>
              ))}
              {selectedGoal === 'other' && (
                <Input value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="What are you trying to achieve?" className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground h-12" />
              )}
              {selectedGoal && (
                <div className="text-xs text-primary-foreground/40 px-1">
                  Preset: <span className="text-linkedin font-semibold">{PRESET_MIX[preset].label}</span> — {PRESET_MIX[preset].description}
                </div>
              )}
            </div>
            <Button variant="linkedin" size="lg" className="w-full h-12 font-semibold" disabled={!selectedGoal || (selectedGoal === 'other' && !customGoal)} onClick={() => setOnboardingStep(1)}>Continue<ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}

        {/* Step 1 — Company URLs + auto-pull */}
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <Header step={2} title="About your company" subtitle="Paste your website and LinkedIn company page — we'll pull the rest." />
            <div className="space-y-4">
              <Field label="Company website">
                <div className="relative">
                  <Globe className="h-4 w-4 text-primary-foreground/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" className={cn(inputCls, 'pl-9')} />
                </div>
              </Field>
              <Field label="LinkedIn company page">
                <div className="relative">
                  <Linkedin className="h-4 w-4 text-primary-foreground/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={linkedinCompanyUrl} onChange={(e) => setLinkedinCompanyUrl(e.target.value)} placeholder="https://linkedin.com/company/…" className={cn(inputCls, 'pl-9')} />
                </div>
              </Field>

              {!pulled ? (
                <Button
                  variant="linkedin"
                  size="lg"
                  className="w-full h-12 font-semibold"
                  disabled={!websiteUrl || !linkedinCompanyUrl || isPulling}
                  onClick={handleAutoPull}
                >
                  {isPulling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Pulling company data…</> : <>Auto-pull company data<Sparkles className="h-4 w-4 ml-1" /></>}
                </Button>
              ) : (
                <div className="space-y-4 p-4 rounded-xl border border-success/20 bg-success/5">
                  <div className="flex items-center gap-2 text-success text-xs font-semibold">
                    <Check className="h-3.5 w-3.5" /> Pulled — edit anything that's off
                  </div>
                  {pullWarning && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-warning/20 bg-warning/5 text-xs text-primary-foreground/70">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <span>{pullWarning}</span>
                    </div>
                  )}
                  <Field label="Company name"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} /></Field>
                  <Field label="One-line description"><Input value={companyOneLiner} onChange={(e) => setCompanyOneLiner(e.target.value)} className={inputCls} /></Field>
                  <Field label="Category / wedge you want to own"><Input value={wedge} onChange={(e) => setWedge(e.target.value)} className={inputCls} /></Field>
                  <Field label="Buyer titles"><Input value={icpTitles} onChange={(e) => setIcpTitles(e.target.value)} className={inputCls} /></Field>
                  <Field label="Company type (ICP)"><Input value={icpCompanyType} onChange={(e) => setIcpCompanyType(e.target.value)} className={inputCls} /></Field>
                  <Field label="Proof points (one per line)">
                    <Textarea value={proofPointsRaw} onChange={(e) => setProofPointsRaw(e.target.value)} rows={4} className={cn(inputCls, 'resize-none leading-relaxed')} />
                    <p className="text-[11px] text-primary-foreground/30 mt-1">We never invent metrics. Anything missing becomes [INSERT METRIC].</p>
                  </Field>
                </div>
              )}
            </div>
            <Nav back={() => setOnboardingStep(0)} next={() => setOnboardingStep(2)} disabled={!pulled || !companyName || !wedge} />
          </div>
        )}

        {/* Step 2 — Connect document sources */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            <Header step={3} title="Connect your content" subtitle="We mine your real materials so suggestions are not generic." />
            {connectedSources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Connected</p>
                {connectedSources.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl border border-success/20 bg-success/5">
                    <span className="text-xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-foreground">{s.name}</p>
                      <p className="text-xs text-primary-foreground/40">{s.documentCount} documents found</p>
                    </div>
                    <Check className="h-4 w-4 text-success" />
                    <button onClick={() => setConnectedSources((prev) => prev.filter((x) => x.id !== s.id))} className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {documentSources.filter((s) => !connectedSources.some((c) => c.id === s.id)).map((s) => (
                <button key={s.id} onClick={() => handleConnectSource(s)} disabled={connectingSourceId === s.id} className={cn('w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left group', connectingSourceId === s.id ? 'border-linkedin/30 bg-linkedin/5' : 'border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03]')}>
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-foreground">{s.name}</p>
                    <p className="text-xs text-primary-foreground/30">{s.desc}</p>
                  </div>
                  {connectingSourceId === s.id ? <div className="h-5 w-5 rounded-full border-2 border-linkedin border-t-transparent animate-spin" /> : <Link2 className="h-4 w-4 text-primary-foreground/20 group-hover:text-linkedin" />}
                </button>
              ))}
            </div>
            <Nav back={() => setOnboardingStep(1)} next={() => setOnboardingStep(3)} nextLabel={connectedSources.length ? `Continue with ${connectedSources.length}` : 'Skip for now'} />
          </div>
        )}

        {/* Step 3 — Voice */}
        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            {isAnalyzing ? (
              <div className="text-center space-y-5 py-16">
                <div className="h-12 w-12 rounded-full border-2 border-linkedin border-t-transparent animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-primary-foreground">Analyzing your voice…</h2>
              </div>
            ) : voiceReady ? (
              <div className="text-center space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto"><Check className="h-8 w-8 text-success" /></div>
                <Header step={4} title="Voice captured" subtitle="Every draft will sound like you." center />
                <div className="bg-primary-foreground/[0.03] border border-primary-foreground/8 rounded-xl p-5 space-y-3 text-left">
                  {mockVoiceProfile.map((trait, i) => (<div key={i} className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-linkedin shrink-0" /><span className="text-sm text-primary-foreground/70">{trait}</span></div>))}
                </div>
                <Nav back={() => { setVoiceReady(false); setVoiceOption(null); }} next={() => setOnboardingStep(4)} nextLabel="Build my brief" />
              </div>
            ) : !voiceOption ? (
              <>
                <Header step={4} title="Capture your voice" subtitle="So every post sounds like you — not a chatbot." />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setVoiceOption('write')} className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group">
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto"><FileText className="h-6 w-6 text-linkedin" /></div>
                    <div><div className="font-semibold text-primary-foreground text-sm">Write 2 posts</div><p className="text-xs text-primary-foreground/30 mt-1">On a wedge-relevant prompt</p></div>
                  </button>
                  <button onClick={() => setVoiceOption('upload')} className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group">
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto"><FileUp className="h-6 w-6 text-linkedin" /></div>
                    <div><div className="font-semibold text-primary-foreground text-sm">Paste past posts</div><p className="text-xs text-primary-foreground/30 mt-1">We extract your style</p></div>
                  </button>
                </div>
                <Nav back={() => setOnboardingStep(2)} next={() => { setVoiceReady(true); setVoiceOption('upload'); }} nextLabel="Skip — calibrate later" />
              </>
            ) : voiceOption === 'write' ? (
              <div className="space-y-6">
                <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Prompt {currentPrompt + 1} of 2</p>
                <h2 className="text-xl font-bold text-primary-foreground leading-snug">{promptForWedge}</h2>
                <Textarea value={currentPrompt === 0 ? samplePost1 : samplePost2} onChange={(e) => currentPrompt === 0 ? setSamplePost1(e.target.value) : setSamplePost2(e.target.value)} placeholder="Write naturally…" rows={7} className={cn(inputCls, 'resize-none leading-relaxed')} />
                <div className="flex justify-between">
                  <Button variant="ghost" className="text-primary-foreground/40" onClick={() => setVoiceOption(null)}>Back</Button>
                  {currentPrompt === 0 ? (
                    <Button variant="linkedin" disabled={!samplePost1} onClick={() => setCurrentPrompt(1)}>Next<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
                  ) : (
                    <Button variant="linkedin" disabled={!samplePost2} onClick={handleAnalyzeVoice}>Analyze my voice</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary-foreground">Paste your LinkedIn posts</h2>
                <Textarea value={pastedPosts} onChange={(e) => setPastedPosts(e.target.value)} placeholder="Paste 3–5 posts here…" rows={8} className={cn(inputCls, 'resize-none leading-relaxed')} />
                <div className="flex justify-between">
                  <Button variant="ghost" className="text-primary-foreground/40" onClick={() => setVoiceOption(null)}>Back</Button>
                  <Button variant="linkedin" disabled={!pastedPosts} onClick={handleAnalyzeVoice}>Analyze</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Strategy Brief review */}
        {step === 4 && (
          <div className="animate-fade-in space-y-8">
            <Header step={5} title="Your Strategy Brief" subtitle="Confirm or edit. This becomes the source of every post." />

            <BriefBlock label="Preset" value={`${PRESET_MIX[preset].label} — ${PRESET_MIX[preset].description}`} />
            <BriefBlock label="Positioning" value={briefDraft.positioning} />
            <BriefBlock label="Category POV to own" value={briefDraft.categoryPov} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> POV Bank ({povBank.length})</p>
              </div>
              <div className="space-y-2">
                {povBank.map((p, idx) => (
                  <div key={p.id} className="flex items-start gap-2 p-3 rounded-lg border border-primary-foreground/8 bg-primary-foreground/[0.02]">
                    <span className="text-[10px] text-linkedin font-bold mt-1 w-5 shrink-0">#{idx + 1}</span>
                    <Textarea
                      value={p.text}
                      onChange={(e) => {
                        const next = [...povBank];
                        next[idx] = { ...p, text: e.target.value, edited: true };
                        setEditablePovBank(next);
                      }}
                      rows={2}
                      className="bg-transparent border-none focus-visible:ring-0 text-sm text-primary-foreground/80 resize-none p-0 min-h-0 leading-snug"
                    />
                    <button onClick={() => setEditablePovBank(povBank.filter((_, i) => i !== idx))} className="text-primary-foreground/20 hover:text-primary-foreground/60"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Content Pillars</p>
              <div className="space-y-2">
                {briefDraft.pillars.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-primary-foreground/8 bg-primary-foreground/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-primary-foreground">{p.name}</span>
                      <Badge variant="secondary" className="text-[10px] bg-primary-foreground/5 text-primary-foreground/40">{p.funnelTilt}</Badge>
                    </div>
                    <p className="text-xs text-primary-foreground/40">{p.exampleAngles.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Asset Inventory</p>
              <div className="space-y-1.5">
                {briefDraft.assetInventory.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-xs">
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.hasProof ? 'bg-success' : 'bg-warning')} />
                    <span className="text-primary-foreground/60">{a.text}</span>
                    {!a.hasProof && <span className="text-warning/80 text-[10px] uppercase">to source</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="text-primary-foreground/40" onClick={() => setOnboardingStep(3)}>Back</Button>
              <Button variant="linkedin" size="lg" className="flex-1 h-12 font-semibold" onClick={handleFinish}>Approve & generate calendar<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls = 'bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12';
const cardCls = (active: boolean) => cn(
  'w-full p-5 rounded-xl border text-left transition-all flex items-start gap-4 group',
  active ? 'border-linkedin bg-linkedin/8 shadow-glow' : 'border-primary-foreground/8 hover:border-primary-foreground/15 bg-primary-foreground/[0.02]'
);
const iconBoxCls = (active: boolean) => cn(
  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
  active ? 'bg-linkedin/20 text-linkedin' : 'bg-primary-foreground/5 text-primary-foreground/30'
);

function Header({ step, title, subtitle, center }: { step: number; title: string; subtitle: string; center?: boolean }) {
  return (
    <div className={cn('space-y-3', center && 'text-center')}>
      <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step {step} of {TOTAL_STEPS}</p>
      <h2 className="text-3xl font-black text-primary-foreground tracking-tight">{title}</h2>
      <p className="text-primary-foreground/40 text-sm">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function Nav({ back, next, disabled, nextLabel }: { back: () => void; next: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="flex gap-3">
      <Button variant="ghost" className="text-primary-foreground/40" onClick={back}>Back</Button>
      <Button variant="linkedin" size="lg" className="flex-1 h-12 font-semibold" disabled={disabled} onClick={next}>{nextLabel || 'Continue'}<ArrowRight className="h-4 w-4 ml-1" /></Button>
    </div>
  );
}

function BriefBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-primary-foreground/85 leading-relaxed p-3 rounded-lg border border-primary-foreground/8 bg-primary-foreground/[0.02]">{value}</p>
    </div>
  );
}

export default Onboarding;
