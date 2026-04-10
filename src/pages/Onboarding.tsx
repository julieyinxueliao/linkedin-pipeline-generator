import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type ConnectedSource } from '@/lib/store';
import { mockVoiceProfile, generateNicheSuggestion, generateTrendingSuggestion, generateDocumentSuggestions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, User, FileText, Check, ArrowRight, Sparkles, FolderOpen, Link2, FileUp, Cloud, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const goals = [
  { id: 'sell', label: 'Sell my product or company', desc: 'Generate leads and close deals through content', icon: Target },
  { id: 'brand', label: 'Build thought leadership', desc: 'Become the go-to voice in your space', icon: User },
  { id: 'other', label: 'Something else', desc: 'Tell us your unique goal', icon: FileText },
];

const nicheExamples = [
  'B2B SaaS for mid-market companies',
  'AI/ML infrastructure & tooling',
  'FinTech payments & banking',
  'HealthTech & digital therapeutics',
  'Climate tech & clean energy',
  'Developer tools & DevOps',
  'E-commerce & DTC brands',
  'Cybersecurity & compliance',
  'EdTech & workforce development',
  'Real estate technology',
];

const documentSources = [
  { id: 'google-drive', name: 'Google Drive', icon: '📁', desc: 'Docs, slides, and spreadsheets' },
  { id: 'notion', name: 'Notion', icon: '📝', desc: 'Pages, databases, and wikis' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', desc: 'Files and paper documents' },
  { id: 'confluence', name: 'Confluence', icon: '📄', desc: 'Team knowledge base' },
  { id: 'upload', name: 'Upload files', icon: '⬆️', desc: 'PDF, DOCX, or TXT files' },
];

function getTopicPrompts(industry: string): [string, string] {
  const lower = industry.toLowerCase();

  if (lower.includes('saas') || lower.includes('software')) {
    return [
      "What's one product decision you made that seemed wrong at first but paid off?",
      "What do most SaaS founders get wrong about their first 100 customers?",
    ];
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return [
      "What's one AI trend everyone's excited about that you think is overhyped?",
      "How do you think about building AI products that actually solve real problems?",
    ];
  }
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('banking')) {
    return [
      "What's one thing traditional finance still gets right that fintech ignores?",
      "What was the hardest regulatory lesson you learned building in fintech?",
    ];
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('biotech')) {
    return [
      "What's one misconception about building technology for healthcare?",
      "How do you balance innovation speed with patient safety in your work?",
    ];
  }
  if (lower.includes('climate') || lower.includes('energy') || lower.includes('clean')) {
    return [
      "What's the biggest gap between climate tech hype and reality that you've seen?",
      "What made you decide to build in climate — and what keeps you going?",
    ];
  }
  if (lower.includes('developer') || lower.includes('devops') || lower.includes('infra')) {
    return [
      "What's one developer workflow problem that still hasn't been properly solved?",
      "How do you think about developer experience vs. enterprise requirements?",
    ];
  }
  if (lower.includes('ecommerce') || lower.includes('commerce') || lower.includes('dtc') || lower.includes('retail')) {
    return [
      "What's one thing you've learned about customer behavior that surprised you?",
      "What's the most underrated growth lever in e-commerce right now?",
    ];
  }
  if (lower.includes('cyber') || lower.includes('security')) {
    return [
      "What's one security risk that most companies still dramatically underestimate?",
      "How do you make cybersecurity feel urgent without resorting to fear?",
    ];
  }
  if (lower.includes('ed') || lower.includes('learning') || lower.includes('education')) {
    return [
      "What's one thing the traditional education system does that technology can't replace?",
      "What's your boldest prediction for how people will learn in 5 years?",
    ];
  }
  return [
    `What's one unconventional insight from ${industry || 'your field'} that most people miss?`,
    `What's the hardest lesson you've learned building in ${industry || 'your industry'}?`,
  ];
}

const sourceIconMap: Record<string, typeof Target> = {
  niche: BookOpen,
  trending: TrendingUp,
  document: FileText,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentOnboardingStep, setOnboardingStep, updateProfile, setOnboardingComplete } = useAppStore();
  const profile = useAppStore((s) => s.profile);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [showNicheSuggestions, setShowNicheSuggestions] = useState(false);
  const [samplePost1, setSamplePost1] = useState('');
  const [samplePost2, setSamplePost2] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [pastedPosts, setPastedPosts] = useState('');
  const [voiceOption, setVoiceOption] = useState<'write' | 'upload' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceProfileReady, setVoiceProfileReady] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  const step = currentOnboardingStep;
  const topicPrompts = useMemo(() => getTopicPrompts(industry), [industry]);

  const finalRole = profile.role || role;
  const finalIndustry = profile.industry || industry;

  // Generate exactly 4 suggestions: 1 niche + 1 trending + 2 document-based
  const allSuggestions = useMemo(() => {
    const niche = generateNicheSuggestion(finalRole, finalIndustry);
    const trending = generateTrendingSuggestion(finalIndustry);
    const sourceNames = connectedSources.map((s) => s.name);
    const docs = generateDocumentSuggestions(finalRole, finalIndustry, sourceNames);
    return [niche, trending, ...docs];
  }, [finalRole, finalIndustry, connectedSources]);

  const handleGoalContinue = () => {
    updateProfile({ goal: selectedGoal === 'other' ? customGoal : selectedGoal });
    setOnboardingStep(1);
  };

  const handleRoleContinue = () => {
    updateProfile({ role, industry });
    setOnboardingStep(2);
  };

  const handleAnalyzeVoice = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setVoiceProfileReady(true);
      updateProfile({
        voiceStyle: mockVoiceProfile,
        samplePosts: voiceOption === 'write' ? [samplePost1, samplePost2] : [pastedPosts],
      });
    }, 2500);
  };

  const handleVoiceDone = () => {
    setOnboardingStep(3);
  };

  const handleConnectSource = (source: typeof documentSources[0]) => {
    setConnectingSourceId(source.id);
    // Simulate connecting to a document source
    setTimeout(() => {
      const newSource: ConnectedSource = {
        id: source.id,
        name: source.name,
        icon: source.icon,
        connectedAt: new Date().toISOString(),
        documentCount: Math.floor(Math.random() * 20) + 5,
      };
      setConnectedSources((prev) => [...prev, newSource]);
      setConnectingSourceId(null);
    }, 1500);
  };

  const handleDisconnectSource = (sourceId: string) => {
    setConnectedSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  const handleDocsContinue = () => {
    updateProfile({ connectedSources });
    setOnboardingStep(4);
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinish = () => {
    const selected = allSuggestions.filter((s) => selectedSuggestions.has(s.id));
    updateProfile({ contentSuggestions: selected.length > 0 ? selected : allSuggestions });
    setOnboardingComplete(true);
    navigate('/dashboard');
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-linkedin/4 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-700',
                i <= step ? 'bg-linkedin w-14' : 'bg-primary-foreground/10 w-8'
              )}
            />
          ))}
        </div>

        {/* Step 0: Goals */}
        {step === 0 && (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-3">
              <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step 1 of {totalSteps}</p>
              <h2 className="text-3xl font-black text-primary-foreground tracking-tight">What's your goal?</h2>
              <p className="text-primary-foreground/40 text-sm">Pick what matters most. We'll tailor everything to this.</p>
            </div>
            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={cn(
                    'w-full p-5 rounded-xl border text-left transition-all flex items-start gap-4 group',
                    selectedGoal === g.id
                      ? 'border-linkedin bg-linkedin/8 shadow-glow'
                      : 'border-primary-foreground/8 hover:border-primary-foreground/15 bg-primary-foreground/[0.02]'
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    selectedGoal === g.id ? 'bg-linkedin/20 text-linkedin' : 'bg-primary-foreground/5 text-primary-foreground/30'
                  )}>
                    <g.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-primary-foreground block">{g.label}</span>
                    <span className="text-xs text-primary-foreground/40 mt-0.5 block">{g.desc}</span>
                  </div>
                </button>
              ))}
              {selectedGoal === 'other' && (
                <Input
                  placeholder="What are you trying to achieve?"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12"
                />
              )}
            </div>
            <Button variant="linkedin" size="lg" className="w-full h-12 text-base font-semibold" disabled={!selectedGoal || (selectedGoal === 'other' && !customGoal)} onClick={handleGoalContinue}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 1: Role & Industry */}
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-3">
              <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step 2 of {totalSteps}</p>
              <h2 className="text-3xl font-black text-primary-foreground tracking-tight">About you</h2>
              <p className="text-primary-foreground/40 text-sm">This shapes your content strategy and tone.</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider mb-2 block">Your role</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., CEO, VP of Engineering, Founder"
                  className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12"
                />
              </div>
              <div className="relative">
                <label className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider mb-2 block">Your niche / area of expertise</label>
                <Input
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    setShowNicheSuggestions(true);
                  }}
                  onFocus={() => setShowNicheSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowNicheSuggestions(false), 200)}
                  placeholder="Be specific — e.g., 'AI infrastructure for enterprise'"
                  className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12"
                />
                {showNicheSuggestions && !industry && (
                  <div className="absolute z-20 top-full mt-2 w-full bg-sidebar-accent border border-sidebar-border rounded-xl p-2 shadow-lg max-h-48 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/30 font-semibold px-2 py-1">Examples — be specific</p>
                    {nicheExamples.map((niche) => (
                      <button
                        key={niche}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIndustry(niche);
                          setShowNicheSuggestions(false);
                        }}
                        className="w-full text-left text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="linkedin" size="lg" className="w-full h-12 text-base font-semibold" disabled={!role || !industry} onClick={handleRoleContinue}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Voice Calibration */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            {isAnalyzing ? (
              <div className="text-center space-y-5 py-16">
                <div className="h-12 w-12 rounded-full border-2 border-linkedin border-t-transparent animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-primary-foreground">Analyzing your voice…</h2>
                <p className="text-primary-foreground/40 text-sm">Building your unique writing profile.</p>
              </div>
            ) : voiceProfileReady ? (
              <div className="text-center space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-primary-foreground tracking-tight">Voice captured</h2>
                  <p className="text-primary-foreground/40 text-sm">Every post will sound like you.</p>
                </div>
                <div className="bg-primary-foreground/[0.03] border border-primary-foreground/8 rounded-xl p-5 space-y-3 text-left">
                  {mockVoiceProfile.map((trait, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-linkedin shrink-0" />
                      <span className="text-sm text-primary-foreground/70">{trait}</span>
                    </div>
                  ))}
                </div>
                <Button variant="linkedin" size="lg" className="w-full h-12 text-base font-semibold" onClick={handleVoiceDone}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : !voiceOption ? (
              <>
                <div className="space-y-3">
                  <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step 3 of {totalSteps}</p>
                  <h2 className="text-3xl font-black text-primary-foreground tracking-tight">Capture your voice</h2>
                  <p className="text-primary-foreground/40 text-sm">So every post sounds like you — not a chatbot.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setVoiceOption('write')}
                    className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto group-hover:bg-linkedin/15 transition-colors">
                      <FileText className="h-6 w-6 text-linkedin" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-foreground text-sm">Write 2 posts</div>
                      <p className="text-xs text-primary-foreground/30 mt-1">On topics from your niche</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setVoiceOption('upload')}
                    className="p-6 rounded-xl border border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03] transition-all text-center space-y-4 group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-linkedin/10 flex items-center justify-center mx-auto group-hover:bg-linkedin/15 transition-colors">
                      <FileUp className="h-6 w-6 text-linkedin" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-foreground text-sm">Paste past posts</div>
                      <p className="text-xs text-primary-foreground/30 mt-1">We'll extract your style</p>
                    </div>
                  </button>
                </div>
              </>
            ) : voiceOption === 'write' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">
                    Prompt {currentPrompt + 1} of 2
                  </p>
                  <h2 className="text-xl font-bold text-primary-foreground leading-snug">
                    {topicPrompts[currentPrompt]}
                  </h2>
                  <p className="text-primary-foreground/30 text-xs">Write naturally — this trains your voice profile.</p>
                </div>
                <Textarea
                  value={currentPrompt === 0 ? samplePost1 : samplePost2}
                  onChange={(e) => currentPrompt === 0 ? setSamplePost1(e.target.value) : setSamplePost2(e.target.value)}
                  placeholder="Write in your own voice…"
                  rows={7}
                  className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/15 resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-primary-foreground/20">{(currentPrompt === 0 ? samplePost1 : samplePost2).length} chars</p>
                  {currentPrompt === 0 ? (
                    <Button variant="linkedin" disabled={!samplePost1} onClick={() => setCurrentPrompt(1)}>
                      Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  ) : (
                    <Button variant="linkedin" disabled={!samplePost2} onClick={handleAnalyzeVoice}>
                      Analyze my voice
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-primary-foreground">Paste your LinkedIn posts</h2>
                  <p className="text-primary-foreground/30 text-xs">3–5 posts separated by a blank line work best.</p>
                </div>
                <Textarea
                  value={pastedPosts}
                  onChange={(e) => setPastedPosts(e.target.value)}
                  placeholder="Paste your posts here…"
                  rows={8}
                  className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/15 resize-none text-sm leading-relaxed"
                />
                <Button variant="linkedin" className="w-full" disabled={!pastedPosts} onClick={handleAnalyzeVoice}>
                  Analyze my writing style
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Connect Document Sources */}
        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-3">
              <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step 4 of {totalSteps}</p>
              <h2 className="text-3xl font-black text-primary-foreground tracking-tight">Connect your content</h2>
              <p className="text-primary-foreground/40 text-sm">
                We'll mine your existing documents for content gold — ideas only <span className="text-primary-foreground/70 font-medium">you</span> can write about.
              </p>
            </div>

            {/* Connected sources */}
            {connectedSources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Connected</p>
                {connectedSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-success/20 bg-success/5"
                  >
                    <span className="text-xl">{source.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-foreground">{source.name}</p>
                      <p className="text-xs text-primary-foreground/40">{source.documentCount} documents found</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <button
                        onClick={() => handleDisconnectSource(source.id)}
                        className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available sources */}
            <div className="space-y-2">
              {connectedSources.length > 0 && (
                <p className="text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider">Add more</p>
              )}
              {documentSources
                .filter((s) => !connectedSources.some((c) => c.id === s.id))
                .map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleConnectSource(source)}
                    disabled={connectingSourceId === source.id}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left group',
                      connectingSourceId === source.id
                        ? 'border-linkedin/30 bg-linkedin/5'
                        : 'border-primary-foreground/8 hover:border-linkedin/30 hover:bg-linkedin/[0.03]'
                    )}
                  >
                    <span className="text-xl">{source.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-foreground">{source.name}</p>
                      <p className="text-xs text-primary-foreground/30">{source.desc}</p>
                    </div>
                    {connectingSourceId === source.id ? (
                      <div className="h-5 w-5 rounded-full border-2 border-linkedin border-t-transparent animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4 text-primary-foreground/20 group-hover:text-linkedin transition-colors" />
                    )}
                  </button>
                ))}
            </div>

            <div className="space-y-3">
              <Button
                variant="linkedin"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={connectedSources.length === 0}
                onClick={handleDocsContinue}
              >
                Continue with {connectedSources.length} source{connectedSources.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <button
                onClick={handleDocsContinue}
                className="w-full text-center text-xs text-primary-foreground/30 hover:text-primary-foreground/50 transition-colors py-1"
              >
                Skip for now — I'll add sources later
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Tailored Content Suggestions (exactly 4) */}
        {step === 4 && (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-3">
              <p className="text-linkedin text-xs font-semibold tracking-widest uppercase">Step 5 of {totalSteps}</p>
              <h2 className="text-3xl font-black text-primary-foreground tracking-tight">Your first content ideas</h2>
              <p className="text-primary-foreground/40 text-sm">
                4 ideas crafted from your niche, trending topics, and {connectedSources.length > 0 ? 'your documents' : 'your expertise'}. Pick the ones that spark something.
              </p>
            </div>
            <div className="space-y-3">
              {allSuggestions.map((s) => {
                const SourceIcon = sourceIconMap[s.source] || Sparkles;
                const sourceLabel =
                  s.source === 'niche' ? 'Your niche' :
                  s.source === 'trending' ? 'Trending on LinkedIn' :
                  'Your documents';

                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSuggestion(s.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 group',
                      selectedSuggestions.has(s.id)
                        ? 'border-linkedin bg-linkedin/8 shadow-glow'
                        : 'border-primary-foreground/8 hover:border-primary-foreground/15 bg-primary-foreground/[0.02]'
                    )}
                  >
                    <div className={cn(
                      'h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      selectedSuggestions.has(s.id)
                        ? 'border-linkedin bg-linkedin'
                        : 'border-primary-foreground/20'
                    )}>
                      {selectedSuggestions.has(s.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <SourceIcon className="h-3 w-3 text-primary-foreground/30" />
                        <span className="text-[10px] uppercase tracking-wider text-primary-foreground/30 font-semibold">{sourceLabel}</span>
                      </div>
                      <p className="text-sm text-primary-foreground leading-relaxed font-medium">{s.excerpt}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-wider font-semibold bg-primary-foreground/5 text-primary-foreground/40">{s.tag}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <Button variant="linkedin" size="lg" className="w-full h-12 text-base font-semibold" onClick={handleFinish}>
                {selectedSuggestions.size > 0 ? `Start with ${selectedSuggestions.size} idea${selectedSuggestions.size > 1 ? 's' : ''}` : 'Skip & start building'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <p className="text-center text-xs text-primary-foreground/25">You can always generate more ideas later</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;