import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { METRIC_PLACEHOLDER } from '@/lib/drafting';
import { ARCHETYPE_BY_ID, CTA_LABEL } from '@/lib/principles';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Check, Copy, ArrowRight, AlertCircle, AlertTriangle, Sparkles, Pencil, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

type Step = 'loading' | 'editing' | 'preview';


const DRAFT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/draft-post`;

const DraftPost = () => {
  const [params] = useSearchParams();
  const slotId = params.get('slot');
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const profile = useAppStore((s) => s.profile);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const addDraft = useAppStore((s) => s.addDraft);
  const updateDraft = useAppStore((s) => s.updateDraft);
  const updateSlot = useAppStore((s) => s.updateSlot);

  const slot = slotId && calendar ? calendar.slots.find((s) => s.id === slotId) : null;
  const existingDraft = slot?.draftId ? drafts.find((d) => d.id === slot.draftId) : null;
  const [step, setStep] = useState<Step>('loading');
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isDictating, setIsDictating] = useState(false);
  const dictationBaseRef = useRef('');

  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      return;
    }
    if (!speechSupported) {
      toast.error('Dictation not supported in this browser. Try Chrome.');
      return;
    }
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    dictationBaseRef.current = content ? content.replace(/\s+$/, '') + ' ' : '';
    rec.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) {
        dictationBaseRef.current += finalText;
      }
      setContent(dictationBaseRef.current + interimText);
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        toast.error(`Dictation error: ${e.error}`);
      }
      setIsDictating(false);
    };
    rec.onend = () => setIsDictating(false);
    recognitionRef.current = rec;
    rec.start();
    setIsDictating(true);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const runStream = async () => {
    if (!slot || !brief) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStep('loading');
    setContent('');
    setIsStreaming(true);
    const arch = ARCHETYPE_BY_ID[slot.archetypeId];
    try {
      const resp = await fetch(DRAFT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: ctrl.signal,
        body: JSON.stringify({
          archetypeId: slot.archetypeId,
          archetypeName: arch.name,
          archetypeDescription: arch.description,
          skeleton: arch.skeleton,
          funnelStage: slot.funnelStage,
          ctaType: slot.ctaType,
          pillarName: slot.pillarName,
          workingAngle: slot.workingAngle,
          brief: {
            companyName: brief.companyName,
            companyOneLiner: brief.companyOneLiner,
            wedge: brief.wedge,
            icpTitles: brief.icpTitles,
            icpCompanyType: brief.icpCompanyType,
            proofPoints: brief.proofPoints,
            categoryPov: brief.categoryPov,
            positioning: brief.positioning,
          },
          voiceTraits: profile.voiceStyle || [],
          samplePosts: brief.samplePosts || [],
        }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error('Rate limit hit. Try again shortly.');
        if (resp.status === 402) throw new Error('AI credits exhausted. Add credits in workspace settings.');
        throw new Error('Draft generation failed');
      }
      setStep('editing');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const j = line.slice(6).trim();
          if (j === '[DONE]') { done = true; break; }
          try {
            const p = JSON.parse(j);
            const delta = p.choices?.[0]?.delta?.content as string | undefined;
            if (delta) { acc += delta; setContent(acc); }
          } catch { buf = line + '\n' + buf; break; }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast.error(e.message || 'Could not draft post');
        setStep('editing');
      }
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (!slot || !brief) return;
    if (existingDraft) {
      setContent(existingDraft.content);
      setStep('preview');
      return;
    }
    runStream();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

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
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Generate a calendar before drafting</h2>
        <p className="text-muted-foreground text-sm">Drafts are anchored to calendar slots — that keeps every post on-strategy.</p>
        <Button variant="linkedin" onClick={() => navigate('/calendar')}>Open calendar</Button>
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Pick a slot from your calendar</h2>
        <Button variant="linkedin" onClick={() => navigate('/dashboard')}>Open calendar</Button>
      </div>
    );
  }

  const arch = ARCHETYPE_BY_ID[slot.archetypeId];
  const hasMetricGap = content.includes(METRIC_PLACEHOLDER);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const hasVoice = brief.samplePosts.length > 0;

  const handleRegenerate = () => runStream();

  const handleSaveDraft = () => {
    if (existingDraft) {
      updateDraft(existingDraft.id, { content });
      toast.success('Draft updated');
      setStep('preview');
      return;
    }
    const draftId = `draft-${Date.now()}`;
    addDraft({
      id: draftId,
      content,
      createdAt: new Date().toISOString(),
      status: 'draft',
      slotId: slot.id,
      archetypeId: slot.archetypeId,
    });
    updateSlot(slot.id, { status: 'drafted', draftId });
    toast.success('Draft saved');
    setStep('preview');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };


  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <SEO
        title="Draft post — write and refine your LinkedIn post | Brand Builder"
        description="Edit your AI-drafted LinkedIn post, preview it in the LinkedIn layout, and copy it ready to publish."
        path="/draft"
        noindex
      />
      <div className="mb-6">
        <p className="text-xs text-linkedin font-semibold uppercase tracking-wider mb-1">Week {slot.week} · {new Date(slot.scheduledFor).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        <h1 className="text-2xl font-black text-foreground leading-tight">{slot.workingAngle}</h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="text-[10px]">{arch.name}</Badge>
          <Badge variant="outline" className="text-[10px]">{slot.funnelStage}</Badge>
          <Badge variant="outline" className="text-[10px]">{slot.pillarName}</Badge>
          <Badge variant="outline" className="text-[10px]">CTA: {CTA_LABEL[slot.ctaType]}</Badge>
        </div>
      </div>

      {/* Skeleton hint */}
      <Card className="mb-4 bg-muted/30 border-dashed">
        <CardContent className="p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Archetype structure</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{arch.skeleton.join(' → ')}</p>
        </CardContent>
      </Card>

      {!hasVoice && (
        <div className="mb-4 p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>Writing style unconfirmed — drafted in a clean operator tone. Add sample posts in onboarding to calibrate.</div>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center space-y-4 py-16 animate-fade-in">
          <Sparkles className="h-10 w-10 text-linkedin mx-auto animate-pulse" />
          <h2 className="text-lg font-semibold text-foreground">Drafting from {arch.name}…</h2>
          <p className="text-sm text-muted-foreground">GPT-5 is writing in your style. First tokens in a few seconds.</p>
        </div>
      )}

      {step === 'editing' && (
        <div className="space-y-4 animate-fade-in">
          {hasMetricGap && !isStreaming && (
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Contains <code className="font-mono">[INSERT METRIC]</code> — never publish until you replace with a real number.</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-success">
              {isStreaming ? (
                <><Loader2 className="h-4 w-4 animate-spin text-linkedin" /> <span className="text-linkedin">Streaming…</span></>
              ) : (
                <><Check className="h-4 w-4" /> On-strategy</>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{wordCount} words</span>
          </div>
          <div className="relative">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={18} className="resize-none text-sm leading-relaxed font-mono pr-12" readOnly={isStreaming} />
            <Button
              type="button"
              size="icon"
              variant={isDictating ? 'destructive' : 'heroOutline'}
              onClick={toggleDictation}
              disabled={isStreaming}
              className="absolute top-2 right-2 h-9 w-9"
              title={isDictating ? 'Stop dictation' : 'Dictate'}
            >
              {isDictating ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          {isDictating && (
            <p className="text-xs text-linkedin flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-linkedin animate-pulse" /> Listening… speak naturally.</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRegenerate} disabled={isStreaming}><RotateCcw className="h-4 w-4 mr-2" />Regenerate</Button>
            <Button variant="linkedin" className="flex-1" onClick={handleSaveDraft} disabled={isStreaming || !content.trim()}>Save draft<ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}


      {step === 'preview' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground">Preview</h2>
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-5">
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{content}</div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep('editing')}><Pencil className="h-4 w-4 mr-2" />Edit draft</Button>
            <Button variant="outline" onClick={handleRegenerate}><RotateCcw className="h-4 w-4 mr-2" />Regenerate</Button>
            <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" />Copy</Button>
            <Button variant="linkedin" onClick={() => navigate('/calendar')}>Back to calendar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPost;
