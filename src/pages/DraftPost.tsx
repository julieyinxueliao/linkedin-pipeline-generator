import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { METRIC_PLACEHOLDER } from '@/lib/drafting';
import { ARCHETYPE_BY_ID, CTA_LABEL } from '@/lib/principles';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Check, Copy, ArrowRight, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

type Step = 'loading' | 'editing' | 'preview';


const DraftPost = () => {
  const [params] = useSearchParams();
  const slotId = params.get('slot');
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const addDraft = useAppStore((s) => s.addDraft);
  const updateSlot = useAppStore((s) => s.updateSlot);

  const slot = slotId && calendar ? calendar.slots.find((s) => s.id === slotId) : null;
  const [step, setStep] = useState<Step>('loading');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!slot || !brief) return;
    setStep('loading');
    const t = setTimeout(() => {
      setContent(generateDraftForSlot(slot, brief));
      setStep('editing');
    }, 1200);
    return () => clearTimeout(t);
  }, [slotId, slot, brief]);

  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Build your Strategy Brief first</h2>
        <Button variant="linkedin" onClick={() => navigate('/onboarding')}>Open onboarding</Button>
      </div>
    );
  }

  if (!calendar || !calendar.approvedAt) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Approve a calendar before drafting</h2>
        <p className="text-muted-foreground text-sm">Drafts are anchored to calendar slots — that keeps every post on-strategy.</p>
        <Button variant="linkedin" onClick={() => navigate('/dashboard')}>Open calendar</Button>
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

  const handleRegenerate = () => {
    setStep('loading');
    setTimeout(() => {
      setContent(generateDraftForSlot(slot, brief));
      setStep('editing');
    }, 1000);
  };

  const handleSaveDraft = () => {
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
          <div>Voice unconfirmed — drafted in a clean operator tone. Add sample posts in onboarding to calibrate.</div>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center space-y-4 py-16 animate-fade-in">
          <Loader2 className="h-10 w-10 text-linkedin animate-spin mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Drafting from {arch.name}…</h2>
          <p className="text-sm text-muted-foreground">Using your proof points and voice.</p>
        </div>
      )}

      {step === 'editing' && (
        <div className="space-y-4 animate-fade-in">
          {hasMetricGap && (
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Contains <code className="font-mono">[INSERT METRIC]</code> — never publish until you replace with a real number.</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" /> On-strategy
            </div>
            <span className="text-xs text-muted-foreground">{wordCount} words</span>
          </div>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={18} className="resize-none text-sm leading-relaxed font-mono" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRegenerate}><RotateCcw className="h-4 w-4 mr-2" />Regenerate</Button>
            <Button variant="linkedin" className="flex-1" onClick={handleSaveDraft}>Save draft<ArrowRight className="h-4 w-4 ml-2" /></Button>
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
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" />Copy</Button>
            <Button variant="linkedin" onClick={() => navigate('/dashboard')}>Back to calendar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPost;
