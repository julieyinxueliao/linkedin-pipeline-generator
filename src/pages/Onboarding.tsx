import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { generateSchedule, mockVoiceProfile } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Linkedin, Target, User, Mic, FileText, Check, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const goals = [
  { id: 'sell', label: 'Sell my product or company', icon: Target },
  { id: 'brand', label: 'Build my personal brand as a thought leader', icon: User },
  { id: 'other', label: 'Something else', icon: FileText },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentOnboardingStep, setOnboardingStep, updateProfile, setSchedule, setOnboardingComplete } = useAppStore();
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [voiceOption, setVoiceOption] = useState<'write' | 'upload' | null>(null);
  const [samplePost1, setSamplePost1] = useState('');
  const [samplePost2, setSamplePost2] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [pastedPosts, setPastedPosts] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceProfileReady, setVoiceProfileReady] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  const step = currentOnboardingStep;

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
      updateProfile({ voiceStyle: mockVoiceProfile, samplePosts: voiceOption === 'write' ? [samplePost1, samplePost2] : [pastedPosts] });
    }, 2500);
  };

  const handleVoiceComplete = () => {
    setOnboardingStep(3);
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setSchedule(generateSchedule());
      setIsGeneratingPlan(false);
      setPlanReady(true);
    }, 3000);
  };

  const handleFinish = () => {
    setOnboardingComplete(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i <= step ? 'bg-linkedin w-12' : 'bg-sidebar-accent w-8')} />
          ))}
        </div>

        {/* Step 0: Goals */}
        {step === 0 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <Linkedin className="h-8 w-8 text-linkedin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-foreground">What's your main goal on LinkedIn?</h2>
            </div>
            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={cn(
                    'w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                    selectedGoal === g.id
                      ? 'border-linkedin bg-linkedin/10 text-primary-foreground'
                      : 'border-sidebar-border text-sidebar-foreground hover:border-linkedin/40'
                  )}
                >
                  <g.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
              {selectedGoal === 'other' && (
                <Input
                  placeholder="Tell us more..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border text-primary-foreground placeholder:text-muted-foreground"
                />
              )}
            </div>
            <Button variant="linkedin" size="lg" className="w-full" disabled={!selectedGoal || (selectedGoal === 'other' && !customGoal)} onClick={handleGoalContinue}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 1: Role & Industry */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-primary-foreground">Tell us about yourself</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-sidebar-foreground mb-1.5 block">Your role / title</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., CEO, VP of Engineering" className="bg-sidebar-accent border-sidebar-border text-primary-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-sm text-sidebar-foreground mb-1.5 block">Your industry or niche</label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., B2B SaaS, FinTech" className="bg-sidebar-accent border-sidebar-border text-primary-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <Button variant="linkedin" size="lg" className="w-full" disabled={!role || !industry} onClick={handleRoleContinue}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Voice Calibration */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            {isAnalyzing ? (
              <div className="text-center space-y-4 py-12">
                <Loader2 className="h-10 w-10 text-linkedin animate-spin mx-auto" />
                <h2 className="text-xl font-semibold text-primary-foreground">Analyzing your writing style…</h2>
                <p className="text-sidebar-foreground text-sm">This takes just a moment.</p>
              </div>
            ) : voiceProfileReady ? (
              <div className="text-center space-y-6">
                <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">Your voice profile is ready ✓</h2>
                <ul className="text-left space-y-2 bg-sidebar-accent rounded-xl p-5">
                  {mockVoiceProfile.map((trait, i) => (
                    <li key={i} className="flex items-center gap-2 text-sidebar-foreground">
                      <Check className="h-4 w-4 text-linkedin shrink-0" />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="linkedin" size="lg" className="w-full" onClick={handleVoiceComplete}>
                  Looks good <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : !voiceOption ? (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-primary-foreground">Let's learn how you write</h2>
                  <p className="text-sidebar-foreground text-sm">This helps us make every post sound like you, not a robot.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setVoiceOption('write')} className="p-6 rounded-xl border-2 border-sidebar-border hover:border-linkedin/40 transition-all text-center space-y-3">
                    <Mic className="h-8 w-8 text-linkedin mx-auto" />
                    <div className="font-semibold text-primary-foreground text-sm">Write 2 sample posts</div>
                    <p className="text-xs text-muted-foreground">Answer 2 quick prompts in your own words</p>
                  </button>
                  <button onClick={() => setVoiceOption('upload')} className="p-6 rounded-xl border-2 border-sidebar-border hover:border-linkedin/40 transition-all text-center space-y-3">
                    <FileText className="h-8 w-8 text-linkedin mx-auto" />
                    <div className="font-semibold text-primary-foreground text-sm">Upload past posts</div>
                    <p className="text-xs text-muted-foreground">Paste 3–5 of your previous LinkedIn posts</p>
                  </button>
                </div>
              </>
            ) : voiceOption === 'write' ? (
              <>
                <h2 className="text-xl font-bold text-primary-foreground text-center">
                  {currentPrompt === 0 ? 'Share one lesson you learned this year' : "What's one thing you wish you knew earlier in your career?"}
                </h2>
                <Textarea
                  value={currentPrompt === 0 ? samplePost1 : samplePost2}
                  onChange={(e) => currentPrompt === 0 ? setSamplePost1(e.target.value) : setSamplePost2(e.target.value)}
                  placeholder="Write in your own voice…"
                  rows={6}
                  className="bg-sidebar-accent border-sidebar-border text-primary-foreground placeholder:text-muted-foreground resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{(currentPrompt === 0 ? samplePost1 : samplePost2).length} characters</p>
                {currentPrompt === 0 ? (
                  <Button variant="linkedin" size="lg" className="w-full" disabled={!samplePost1} onClick={() => setCurrentPrompt(1)}>
                    Next prompt <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="linkedin" size="lg" className="w-full" disabled={!samplePost2} onClick={handleAnalyzeVoice}>
                    Done — Analyze my style
                  </Button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-primary-foreground text-center">Paste your previous LinkedIn posts</h2>
                <Textarea
                  value={pastedPosts}
                  onChange={(e) => setPastedPosts(e.target.value)}
                  placeholder="Paste 3–5 posts here, separated by a blank line…"
                  rows={8}
                  className="bg-sidebar-accent border-sidebar-border text-primary-foreground placeholder:text-muted-foreground resize-none"
                />
                <Button variant="linkedin" size="lg" className="w-full" disabled={!pastedPosts} onClick={handleAnalyzeVoice}>
                  Analyze my writing style
                </Button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Generate Plan */}
        {step === 3 && (
          <div className="animate-fade-in">
            {isGeneratingPlan ? (
              <div className="text-center space-y-6 py-12">
                <h2 className="text-2xl font-bold text-primary-foreground">Your 30-day LinkedIn plan is being created…</h2>
                <div className="w-full bg-sidebar-accent rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-linkedin rounded-full animate-pulse-soft" style={{ width: '70%' }} />
                </div>
                <p className="text-sidebar-foreground text-sm">Crafting themes, formats, and a schedule tailored to you.</p>
              </div>
            ) : planReady ? (
              <PlanPreview onStart={handleFinish} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const formatColors: Record<string, string> = {
  'Personal insight': 'bg-linkedin/20 text-linkedin',
  'Listicle': 'bg-success/20 text-success',
  'Story arc': 'bg-warning/20 text-warning',
  'Question hook': 'bg-destructive/20 text-destructive',
  'Data-driven': 'bg-accent/20 text-accent',
  'Contrarian take': 'bg-linkedin/20 text-linkedin',
  'Framework share': 'bg-success/20 text-success',
  'Mini thread': 'bg-warning/20 text-warning',
};

const PlanPreview = ({ onStart }: { onStart: () => void }) => {
  const schedule = useAppStore((s) => s.schedule);
  const weeks: ScheduleSlot[][] = [];
  let currentWeek: ScheduleSlot[] = [];

  schedule.forEach((slot, i) => {
    currentWeek.push(slot);
    const nextDate = schedule[i + 1]?.date;
    if (!nextDate || new Date(nextDate).getDay() <= new Date(slot.date).getDay()) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary-foreground">Your 30-Day Plan</h2>
        <p className="text-sidebar-foreground text-sm">Here's your personalized posting schedule</p>
      </div>
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {weeks.map((week, wi) => (
          <div key={wi}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Week {wi + 1}</h3>
            <div className="space-y-2">
              {week.map((slot) => (
                <div key={slot.id} className="flex items-center gap-3 bg-sidebar-accent rounded-lg p-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-sm text-primary-foreground font-medium flex-1">{slot.theme}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', formatColors[slot.format] || 'bg-muted text-muted-foreground')}>{slot.format}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button variant="linkedin" size="lg" className="w-full" onClick={onStart}>
        Looks great, let's start <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

import type { ScheduleSlot } from '@/lib/store';

export default Onboarding;
