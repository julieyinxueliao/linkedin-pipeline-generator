import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { generateMockPost } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Mic, PenSquare, Loader2, RotateCcw, Check, Copy, ArrowRight, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'source' | 'recording' | 'generating' | 'editing' | 'preview';

const DraftPost = () => {
  const addDraft = useAppStore((s) => s.addDraft);
  const location = useLocation();
  const suggestion = (location.state as any)?.suggestion;

  const [step, setStep] = useState<Step>(suggestion ? 'generating' : 'source');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');

  // When arriving with a suggestion, auto-generate a draft from it
  useEffect(() => {
    if (suggestion) {
      const timer = setTimeout(() => {
        setContent(generateMockPost(suggestion.tag || 'Content idea', suggestion.excerpt || ''));
        setStep('editing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [suggestion]);

  const handleSourceSelect = (source: string) => {
    if (source === 'scratch') {
      setStep('editing');
      return;
    }
    if (source === 'voice') {
      setStep('recording');
      return;
    }
    setStep('generating');
    setTimeout(() => {
      setContent(generateMockPost('Industry insight', 'Story arc'));
      setStep('editing');
    }, 2000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    const interval = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      setTranscript('I was thinking about how most founders approach hiring wrong. They wait too long, then rush to fill seats. What worked for us was building a hiring pipeline before we even needed people.');
    }, 5000);
  };

  const handleGenerateFromTranscript = () => {
    setStep('generating');
    setTimeout(() => {
      setContent(generateMockPost('Hiring', 'Personal insight'));
      setStep('editing');
    }, 2000);
  };

  const handleRegenerate = () => {
    setStep('generating');
    setTimeout(() => {
      setContent(generateMockPost('Leadership', 'Contrarian take'));
      setStep('editing');
    }, 2000);
  };

  const handleSaveDraft = () => {
    addDraft({
      id: `draft-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      status: 'draft',
    });
    toast.success('Draft saved!');
    setStep('preview');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">Draft a Post</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {suggestion ? `Building on: "${suggestion.excerpt?.slice(0, 60)}…"` : 'Create a LinkedIn post from your ideas.'}
      </p>

      {step === 'source' && (
        <div className="grid sm:grid-cols-3 gap-4 animate-fade-in">
          {[
            { id: 'document', icon: FileText, title: 'Use a document', desc: 'Upload or pick a doc' },
            { id: 'voice', icon: Mic, title: 'Record a voice note', desc: 'Speak your ideas' },
            { id: 'scratch', icon: PenSquare, title: 'Write from scratch', desc: 'Start with a blank page' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSourceSelect(opt.id)}
              className="p-6 rounded-xl border-2 border-border hover:border-linkedin/40 hover:shadow-md transition-all text-center space-y-3 bg-card"
            >
              <opt.icon className="h-8 w-8 text-linkedin mx-auto" />
              <div className="font-semibold text-foreground text-sm">{opt.title}</div>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {step === 'recording' && (
        <div className="text-center space-y-6 animate-fade-in">
          {!transcript ? (
            <>
              <div className={cn('h-24 w-24 rounded-full mx-auto flex items-center justify-center transition-all', isRecording ? 'bg-destructive/20 animate-pulse-soft' : 'bg-muted')}>
                <Mic className={cn('h-10 w-10', isRecording ? 'text-destructive' : 'text-muted-foreground')} />
              </div>
              {isRecording && <p className="text-lg font-mono text-foreground">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</p>}
              <Button variant={isRecording ? 'destructive' : 'linkedin'} size="lg" onClick={handleStartRecording} disabled={isRecording}>
                {isRecording ? <><Square className="h-4 w-4 mr-2" /> Recording...</> : 'Start recording'}
              </Button>
            </>
          ) : (
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-foreground">Transcription</h3>
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} className="resize-none" />
              <Button variant="linkedin" size="lg" className="w-full" onClick={handleGenerateFromTranscript}>
                Generate post from this <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'generating' && (
        <div className="text-center space-y-4 py-16 animate-fade-in">
          <Loader2 className="h-10 w-10 text-linkedin animate-spin mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Generating your draft…</h2>
          <p className="text-sm text-muted-foreground">Matching your voice and tone.</p>
        </div>
      )}

      {step === 'editing' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" />
              Matches your voice ✓
            </div>
            <span className="text-xs text-muted-foreground">{wordCount} words</span>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="resize-none text-sm leading-relaxed"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRegenerate}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button variant="linkedin" className="flex-1" onClick={handleSaveDraft}>
              This looks good <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground">Post Preview</h2>
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-linkedin/20 flex items-center justify-center text-linkedin font-bold text-sm">JD</div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Jane Doe</p>
                  <p className="text-xs text-muted-foreground">CEO at Acme Inc • 1st</p>
                </div>
              </div>
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{content}</div>
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to clipboard
            </Button>
            <Button variant="linkedin" disabled className="relative">
              Publish to LinkedIn
              <span className="absolute -top-2 -right-2 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Coming soon</span>
            </Button>
          </div>
          <div className="text-center">
            <Button variant="ghost" onClick={() => { setStep('source'); setContent(''); }}>
              Draft another post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPost;
