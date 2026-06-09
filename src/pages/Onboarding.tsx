import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type ConnectedSource } from '@/lib/store';
import { generateStrategyBrief, type BriefInputs, type PovItem, type StrategyBrief } from '@/lib/strategy';
import { goalToPreset, FUNNEL_STAGE_LABELS } from '@/lib/principles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Target, User, FileText, Check, ArrowRight, Link2, FileUp, X, Sparkles, Loader2,
  Globe, AlertTriangle, FolderOpen, BookOpen, Database, Library, ChevronDown, UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';

const goals = [
  { id: 'sell', label: 'Get leads for my product', desc: 'Use posts to bring in customers and close deals', icon: Target },
  { id: 'brand', label: 'Get known in my space', desc: 'Become a recognized voice in your industry', icon: User },
  { id: 'other', label: 'Something else', desc: 'Tell us what you want to get out of posting', icon: FileText },
];

const documentSources = [
  { id: 'google-drive', name: 'Google Drive', Icon: FolderOpen, desc: 'Docs, slides, and spreadsheets' },
  { id: 'notion', name: 'Notion', Icon: BookOpen, desc: 'Pages, databases, and wikis' },
  { id: 'dropbox', name: 'Dropbox', Icon: Database, desc: 'Files and paper documents' },
  { id: 'confluence', name: 'Confluence', Icon: Library, desc: 'Team knowledge base' },
];

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentOnboardingStep, setOnboardingStep, updateProfile, setOnboardingComplete, setBrief } = useAppStore();
  const step = currentOnboardingStep;

  // Step 0 — Goal
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  // Step 1 — Company website + source documents/text
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyOneLiner, setCompanyOneLiner] = useState('');
  const [wedge, setWedge] = useState('');
  const [icpTitles, setIcpTitles] = useState('');
  const [icpCompanyType, setIcpCompanyType] = useState('');
  const [proofPointsRaw, setProofPointsRaw] = useState('');
  const [pullWarning, setPullWarning] = useState<string | null>(null);

  // Step 2 — Knowledge base (separate from step 1 company docs)
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [kbFileNames, setKbFileNames] = useState<string[]>([]);
  const [kbContext, setKbContext] = useState('');
  const [kbLinks, setKbLinks] = useState('');
  const [kbDragging, setKbDragging] = useState(false);

  // Step 3 — Voice
  const [voiceOption, setVoiceOption] = useState<'write' | 'upload' | null>(null);
  const [samplePost1, setSamplePost1] = useState('');
  const [samplePost2, setSamplePost2] = useState('');
  const [pastedPosts, setPastedPosts] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [voiceSkipped, setVoiceSkipped] = useState(false);
  const [voiceTraits, setVoiceTraits] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  // Step 4 — Strategy Brief
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState<StrategyBrief | null>(null);
  const [editablePovBank, setEditablePovBank] = useState<PovItem[] | null>(null);

  const briefInputs: BriefInputs = useMemo(() => ({
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
  }), [selectedGoal, companyName, companyOneLiner, websiteUrl, wedge, icpTitles, icpCompanyType, proofPointsRaw, samplePost1, samplePost2, pastedPosts, voiceOption, connectedSources]);

  const promptForWedge = wedge ? `What's one thing most ${icpTitles || 'people in your space'} get wrong about ${wedge}?` : `What's one thing most people in your space get wrong?`;

  const handleAutoPull = async () => {
    setIsPulling(true);
    setPullWarning(null);

    try {
      let normalizedUrl = websiteUrl.trim();
      if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      const { data, error } = await supabase.functions.invoke('pull-company-profile', {
        body: { websiteUrl: normalizedUrl, additionalContext },
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const accepted = ['text/plain', 'text/markdown'];
    const additions: string[] = [];
    const names: string[] = [];
    for (const f of Array.from(files)) {
      const ok = accepted.includes(f.type) || /\.(txt|md|markdown)$/i.test(f.name);
      if (!ok) {
        toast.error(`${f.name}: only .txt and .md files can be parsed in-browser. Paste content for PDFs / decks.`);
        continue;
      }
      try {
        const text = await f.text();
        additions.push(`--- ${f.name} ---\n${text}`);
        names.push(f.name);
      } catch {
        toast.error(`Could not read ${f.name}`);
      }
    }
    if (additions.length) {
      setAdditionalContext((prev) => (prev ? prev + '\n\n' : '') + additions.join('\n\n'));
      setUploadedFileNames((prev) => [...prev, ...names]);
    }
  };

  const handleKbFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const accepted = ['text/plain', 'text/markdown'];
    const additions: string[] = [];
    const names: string[] = [];
    for (const f of Array.from(files)) {
      const ok = accepted.includes(f.type) || /\.(txt|md|markdown)$/i.test(f.name);
      if (!ok) {
        toast.error(`${f.name}: only .txt and .md files can be parsed in-browser. Paste a link instead for PDFs / decks.`);
        continue;
      }
      try {
        const text = await f.text();
        additions.push(`--- ${f.name} ---\n${text}`);
        names.push(f.name);
      } catch {
        toast.error(`Could not read ${f.name}`);
      }
    }
    if (additions.length) {
      setKbContext((prev) => (prev ? prev + '\n\n' : '') + additions.join('\n\n'));
      setKbFileNames((prev) => [...prev, ...names]);
    }
  };

  const handleConnectSource = (s: typeof documentSources[0]) => {
    setConnectingSourceId(s.id);
    setTimeout(() => {
      setConnectedSources((prev) => [...prev, {
        id: s.id, name: s.name, icon: s.name,
        connectedAt: new Date().toISOString(),
        documentCount: Math.floor(Math.random() * 20) + 5,
      }]);
      setConnectingSourceId(null);
    }, 1200);
  };

  const handleAnalyzeVoice = async () => {
    const samples = voiceOption === 'write'
      ? [samplePost1, samplePost2].filter(Boolean)
      : pastedPosts ? [pastedPosts] : [];
    if (!samples.length) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-voice', { body: { samples } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const traits = Array.isArray(data?.traits) ? data.traits : [];
      if (!traits.length) throw new Error('No voice traits returned');
      setVoiceTraits(traits);
      setVoiceReady(true);
    } catch (e) {
      toast.error((e as Error).message || 'Could not analyze voice');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkipVoice = () => {
    setVoiceTraits([]);
    setVoiceSkipped(true);
    setVoiceReady(true);
    setOnboardingStep(4);
  };


  // Generate the strategy brief when entering step 4
  useEffect(() => {
    if (step !== 4 || aiBrief || briefLoading || briefError) return;
    if (!briefInputs.companyName?.trim() && !briefInputs.wedge?.trim()) {
      setBriefError('Please complete step 1 (company name and wedge) before generating your brief.');
      return;
    }
    let cancelled = false;
    const timeoutCtrl = new AbortController();
    const timer = setTimeout(() => timeoutCtrl.abort(), 45_000);
    (async () => {
      setBriefLoading(true);
      setBriefError(null);
      try {
        const kbBlock = [
          kbLinks.trim() ? `--- Knowledge base links ---\n${kbLinks.trim()}` : '',
          kbContext.trim() ? `--- Knowledge base files ---\n${kbContext.trim()}` : '',
        ].filter(Boolean).join('\n\n');
        const mergedContext = [additionalContext, kbBlock].filter(Boolean).join('\n\n');
        const payload = { ...briefInputs, voiceTraits: voiceTraits ?? [], additionalContext: mergedContext };
        const invokePromise = supabase.functions.invoke('generate-strategy-brief', { body: payload });
        const abortPromise = new Promise<never>((_, reject) => {
          timeoutCtrl.signal.addEventListener('abort', () =>
            reject(new Error('Request timed out after 45s. Please try again.'))
          );
        });
        const { data, error } = await Promise.race([invokePromise, abortPromise]) as any;
        if (cancelled) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const ai = data?.brief;
        if (!ai) throw new Error('No brief returned');
        // Compose final StrategyBrief by combining inputs with AI output (structural fields)
        const fallback = generateStrategyBrief(briefInputs);
        const final: StrategyBrief = {
          ...fallback,
          positioning: ai.positioning || fallback.positioning,
          categoryPov: ai.categoryPov || fallback.categoryPov,
          povBank: ai.povBank?.length ? ai.povBank : fallback.povBank,
          pillars: ai.pillars?.length ? ai.pillars : fallback.pillars,
          assetInventory: ai.assetInventory?.length ? ai.assetInventory : fallback.assetInventory,
        };
        setAiBrief(final);
      } catch (e) {
        if (!cancelled) setBriefError((e as Error).message || 'Could not generate brief');
      } finally {
        clearTimeout(timer);
        if (!cancelled) setBriefLoading(false);
      }
    })();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, briefInputs, voiceTraits, additionalContext, aiBrief, briefError]);

  const brief = aiBrief;
  const povBank = editablePovBank ?? brief?.povBank ?? [];

  const handleFinish = () => {
    if (!brief) return;
    const finalBrief = { ...brief, povBank };
    setBrief(finalBrief);
    updateProfile({
      goal: selectedGoal === 'other' ? customGoal : selectedGoal,
      role: selectedGoal,
      industry: wedge,
      voiceStyle: voiceTraits,
      samplePosts: voiceOption === 'write' ? [samplePost1, samplePost2].filter(Boolean) : pastedPosts ? [pastedPosts] : [],
      connectedSources,
      websiteUrl,
    });
    setOnboardingComplete(true);
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <SEO
        title="Onboarding — set up your LinkedIn strategy | Brand Builder"
        description="Tell us your goal, voice, and company context. Brand Builder generates a customized LinkedIn content strategy in minutes."
        path="/onboarding"
        noindex
      />
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
            <div className="rounded-xl border border-linkedin/20 bg-linkedin/[0.04] p-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-linkedin mb-1.5">The playbook</p>
              <p className="text-sm text-primary-foreground/70 leading-[1.6]">
                You're a founder with real expertise. We turn it into posts people actually read — using the same approach that's worked for teams like Clay, Unify, and AirOps.
              </p>
            </div>
            <Header step={1} title="What's your goal?" subtitle="Pick what matters most — this shapes what we'll help you post." />
            <div className="space-y-3">
              {goals.map((g) => (
                <button key={g.id} onClick={() => setSelectedGoal(g.id)} className={cardCls(selectedGoal === g.id)}>
                  <div className={iconBoxCls(selectedGoal === g.id)}><g.icon className="h-5 w-5" /></div>
                  <div className="text-left">
                    <span className="font-semibold text-primary-foreground block">{g.label}</span>
                    <span className="text-xs text-primary-foreground/80 mt-0.5 block">{g.desc}</span>
                  </div>
                </button>
              ))}
              {selectedGoal === 'other' && (
                <Input value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="What are you trying to achieve?" className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground h-12" />
              )}
            </div>
            <Button variant="linkedin" size="lg" className="w-full h-12 font-semibold" disabled={!selectedGoal || (selectedGoal === 'other' && !customGoal)} onClick={() => setOnboardingStep(1)}>Continue<ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}

        {/* Step 1 — Website + sources */}
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <Header step={2} title="About your products" subtitle="Paste your website and drop in any docs — pitch deck, business plan, one-pager. We'll pull out the essentials." />
            <div className="space-y-4">
              <Field label="Company website">
                <div className="relative">
                  <Globe className="h-4 w-4 text-primary-foreground/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" className={cn(inputCls, 'pl-9')} />
                </div>
              </Field>

              <Field label="Upload company docs (pitch deck, business plan, one-pager)">
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center',
                    isDragging
                      ? 'border-linkedin bg-linkedin/[0.06]'
                      : 'border-primary-foreground/15 hover:border-linkedin/40 hover:bg-linkedin/[0.03]'
                  )}
                >
                  <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-linkedin" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary-foreground text-sm">Drop files here or click to upload</div>
                    <p className="text-xs text-primary-foreground/80 mt-1">.txt or .md files · For PDFs/decks, use paste option below</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.markdown,text/plain,text/markdown"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
                {uploadedFileNames.length > 0 && (
                  <p className="mt-2 text-[11px] text-primary-foreground/50">
                    {uploadedFileNames.length} file{uploadedFileNames.length === 1 ? '' : 's'} attached: {uploadedFileNames.join(', ')}
                  </p>
                )}
              </Field>

              <div className="rounded-xl border border-primary-foreground/10">
                <button
                  type="button"
                  onClick={() => setPasteOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-primary-foreground/[0.02] transition-colors rounded-xl"
                >
                  <span className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <FileText className="h-3.5 w-3.5 text-primary-foreground/40" />
                    Or paste text directly
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-primary-foreground/40 transition-transform', pasteOpen && 'rotate-180')} />
                </button>
                {pasteOpen && (
                  <div className="px-4 pb-4">
                    <Textarea
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      placeholder="Paste anything that explains what you do, who you sell to, and your customer wins — pitch deck text, business plan, one-pager, internal doc."
                      rows={6}
                      className={cn(inputCls, 'resize-none leading-relaxed')}
                    />
                  </div>
                )}
              </div>

              {!pulled ? (
                <Button
                  variant="linkedin"
                  size="lg"
                  className="w-full h-12 font-semibold"
                  disabled={(!websiteUrl && !additionalContext.trim()) || isPulling}
                  onClick={handleAutoPull}
                >
                  {isPulling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reading your docs…</> : <>Pull company info<Sparkles className="h-4 w-4 ml-1" /></>}
                </Button>
              ) : (
                <div className="space-y-4 p-4 rounded-xl border border-success/20 bg-success/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-success text-xs font-semibold">
                      <Check className="h-3.5 w-3.5" /> Done — fix anything that looks off
                    </div>
                    <Button
                      variant="heroOutline"
                      size="sm"
                      onClick={handleAutoPull}
                      disabled={isPulling}
                    >
                      {isPulling ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Regenerate
                    </Button>
                  </div>
                  {pullWarning && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-warning/20 bg-warning/5 text-xs text-primary-foreground/70">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <span>{pullWarning}</span>
                    </div>
                  )}
                  <Field label="Company name"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} /></Field>
                  
                  <Field label="YOUR PRODUCT"><Input value={wedge} onChange={(e) => setWedge(e.target.value)} className={inputCls} /></Field>
                  <Field label="YOUR TARGET USER (JOB TITLES)"><Input value={icpTitles} onChange={(e) => setIcpTitles(e.target.value)} className={inputCls} /></Field>
                  <Field label="YOUR TARGET COMPANY (SIZE, INDUSTRY, ETC.)"><Input value={icpCompanyType} onChange={(e) => setIcpCompanyType(e.target.value)} className={inputCls} /></Field>
                </div>
              )}
            </div>
            <Nav back={() => setOnboardingStep(0)} next={() => setOnboardingStep(2)} disabled={!pulled || !companyName || !wedge} />
          </div>
        )}

        {/* Step 2 — Knowledge base for tailored content */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            <Header
              step={3}
              title="Add your knowledge base"
              subtitle="Whitepapers, meeting notes, business plans, pitch decks — anything you want us to mine for tailored content. Separate from the company docs you uploaded earlier."
            />

            <Field label="Paste links to docs, articles, or shared files">
              <Textarea
                value={kbLinks}
                onChange={(e) => setKbLinks(e.target.value)}
                placeholder={"One link per line — Google Doc, Notion page, blog post, PDF URL…"}
                rows={4}
                className={cn(inputCls, 'resize-none leading-relaxed')}
              />
            </Field>

            <Field label="Upload knowledge base files">
              <label
                onDragOver={(e) => { e.preventDefault(); setKbDragging(true); }}
                onDragLeave={() => setKbDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setKbDragging(false);
                  handleKbFiles(e.dataTransfer.files);
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center',
                  kbDragging
                    ? 'border-linkedin bg-linkedin/[0.06]'
                    : 'border-primary-foreground/15 hover:border-linkedin/40 hover:bg-linkedin/[0.03]'
                )}
              >
                <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center">
                  <UploadCloud className="h-6 w-6 text-linkedin" />
                </div>
                <div>
                  <div className="font-semibold text-primary-foreground text-sm">Drop files here or click to upload</div>
                  <p className="text-xs text-primary-foreground/80 mt-1">.txt or .md files · For PDFs/decks, paste a shareable link above</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.markdown,text/plain,text/markdown"
                  className="hidden"
                  onChange={(e) => handleKbFiles(e.target.files)}
                />
              </label>
              {kbFileNames.length > 0 && (
                <p className="mt-2 text-[11px] text-primary-foreground/50">
                  {kbFileNames.length} file{kbFileNames.length === 1 ? '' : 's'} attached: {kbFileNames.join(', ')}
                </p>
              )}
            </Field>

            <Nav
              back={() => setOnboardingStep(1)}
              next={() => setOnboardingStep(3)}
              nextLabel={(kbFileNames.length || kbLinks.trim()) ? 'Continue' : 'Skip for now'}
            />
          </div>
        )}



        {/* Step 3 — Voice */}
        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            {isAnalyzing ? (
              <div className="text-center space-y-5 py-16">
                <div className="h-12 w-12 rounded-full border-2 border-linkedin border-t-transparent animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-primary-foreground">Learning your voice…</h2>
              </div>
            ) : voiceReady && !voiceSkipped ? (
              <div className="text-center space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto"><Check className="h-8 w-8 text-success" /></div>
                <Header step={4} title="Voice captured" subtitle="Every draft will sound like you." center />
                <div className="bg-primary-foreground/[0.03] border border-primary-foreground/8 rounded-xl p-5 space-y-3 text-left">
                  {voiceTraits.map((trait, i) => (<div key={i} className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-linkedin shrink-0" /><span className="text-sm text-primary-foreground/70">{trait}</span></div>))}
                </div>
                <Nav back={() => { setVoiceReady(false); setVoiceOption(null); setVoiceTraits([]); }} next={() => setOnboardingStep(4)} nextLabel="Build my plan" />
              </div>
            ) : !voiceOption ? (

              <>
                <Header step={4} title="Teach us your voice" subtitle="So every post sounds like you wrote it — not a chatbot." />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setVoiceOption('write')} className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group">
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto"><FileText className="h-6 w-6 text-linkedin" /></div>
                    <div><div className="font-semibold text-primary-foreground text-sm">Answer 2 prompts</div><p className="text-xs text-primary-foreground/80 mt-1">Quick written replies</p></div>
                  </button>
                  <button onClick={() => setVoiceOption('upload')} className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group">
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto"><FileUp className="h-6 w-6 text-linkedin" /></div>
                    <div><div className="font-semibold text-primary-foreground text-sm">Paste old posts</div><p className="text-xs text-primary-foreground/80 mt-1">We learn your style</p></div>
                  </button>
                </div>
                <Nav back={() => setOnboardingStep(2)} next={handleSkipVoice} nextLabel="Skip — set up later" />
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
                    <Button variant="linkedin" disabled={!samplePost2} onClick={handleAnalyzeVoice}>Learn my voice</Button>
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
            <Header step={5} title="Your content plan" subtitle="Check it over and tweak anything. Every post we draft starts here." />

            {briefLoading && <BriefProgress />}

            {briefError && !briefLoading && (
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                {briefError}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setAiBrief(null); setBriefError(null); setOnboardingStep(0); }}>Back to start</Button>
                  <Button variant="outline" size="sm" onClick={() => { setAiBrief(null); setBriefError(null); }}>Retry</Button>
                </div>
              </div>
            )}

            {!briefLoading && brief && (
              <>
                <BriefBlock label="Your main point of view" value={brief.categoryPov} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Hot takes you can post ({povBank.length})</p>
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
                        <button onClick={() => setEditablePovBank(povBank.filter((_, i) => i !== idx))} className="text-primary-foreground/20 hover:text-primary-foreground/85"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Topics you'll post about</p>
                  <div className="space-y-2">
                    {brief.pillars.map((p) => (
                      <div key={p.id} className="p-3 rounded-lg border border-primary-foreground/8 bg-primary-foreground/[0.02]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-primary-foreground">{p.name}</span>
                          <Badge variant="secondary" className="text-[10px] bg-primary-foreground/5 text-primary-foreground/40">{FUNNEL_STAGE_LABELS[p.funnelTilt]}</Badge>
                        </div>
                        <p className="text-xs text-primary-foreground/80">{p.exampleAngles.join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Stories & proof to pull from</p>
                  <div className="space-y-1.5">
                    {brief.assetInventory.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-xs">
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.hasProof ? 'bg-success' : 'bg-warning')} />
                        <span className="text-primary-foreground/85">{a.text}</span>
                        {!a.hasProof && <span className="text-warning/80 text-[10px] uppercase">add details</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" className="text-primary-foreground/40" onClick={() => setOnboardingStep(3)}>Back</Button>
                  <Button variant="heroOutline" onClick={() => { setAiBrief(null); setEditablePovBank(null); }}>Regenerate</Button>
                  <Button variant="linkedin" size="lg" className="flex-1 h-12 font-semibold" onClick={handleFinish}>Looks good — build my calendar<ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}
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
      <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-primary-foreground/85 uppercase tracking-wider mb-2 block">{label}</label>
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

const BRIEF_STEPS = [
  'Figuring out what you stand for and who you sell to',
  'Writing your main point of view',
  'Brainstorming hot takes you can post',
  'Picking the topics you should post about',
  'Listing your stories and customer proof',
];

function BriefProgress() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((v) => Math.min(v + 1, BRIEF_STEPS.length - 1)), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-linkedin border-t-transparent animate-spin" />
        <div>
          <p className="text-sm font-semibold text-primary-foreground">Building your content plan</p>
          <p className="text-xs text-primary-foreground/80">AI is working through what you shared — usually 15–25s.</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {BRIEF_STEPS.map((label, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'pending';
          return (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className={cn(
                'h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
                state === 'done' && 'bg-linkedin text-linkedin-foreground',
                state === 'active' && 'border-2 border-linkedin',
                state === 'pending' && 'border border-primary-foreground/15',
              )}>
                {state === 'done' && <Check className="h-3 w-3" />}
                {state === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-linkedin animate-pulse" />}
              </span>
              <span className={cn(
                state === 'done' && 'text-primary-foreground/85',
                state === 'active' && 'text-primary-foreground font-medium',
                state === 'pending' && 'text-primary-foreground/30',
              )}>{label}</span>
            </div>
          );
        })}
      </div>
      <div className="h-1 w-full rounded-full bg-primary-foreground/5 overflow-hidden">
        <div className="h-full bg-linkedin transition-all duration-700" style={{ width: `${((active + 1) / BRIEF_STEPS.length) * 100}%` }} />
      </div>
    </div>
  );
}


export default Onboarding;
