import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, FileUp, PenSquare, FileText, Clock, Sparkles, ArrowRight, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const schedule = useAppStore((s) => s.schedule);
  const drafts = useAppStore((s) => s.drafts);
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  const upcoming = schedule.filter((s) => s.status === 'not_started').slice(0, 3);
  const publishedCount = drafts.filter((d) => d.status === 'published').length;
  const draftCount = drafts.filter((d) => d.status === 'draft').length;
  const suggestions = profile.contentSuggestions || [];

  const handleUseSuggestion = (suggestion: typeof suggestions[0]) => {
    navigate('/draft', { state: { suggestion } });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          {profile.name ? `Hey, ${profile.name}` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's on deck.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Drafted', value: draftCount, icon: FileText },
          { label: 'Published', value: publishedCount, icon: PenSquare },
          { label: 'Days active', value: 1, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick actions */}
          <div className="flex gap-3">
            <Button variant="linkedin" className="h-12 flex-1" onClick={() => navigate('/draft')}>
              <PenSquare className="h-4 w-4 mr-2" />
              Draft a Post
            </Button>
            <Button variant="outline" className="h-12" onClick={() => navigate('/draft')}>
              <Mic className="h-4 w-4 mr-2" />
              Voice Note
            </Button>
            <Button variant="outline" className="h-12" onClick={() => navigate('/draft')}>
              <FileUp className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* This Week's Posts */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                This week
              </h2>
              <div className="space-y-2">
                {upcoming.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => navigate('/draft')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-linkedin/30 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="text-center min-w-[2.5rem]">
                      <div className="text-[10px] text-muted-foreground uppercase">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-lg font-black text-foreground">{new Date(slot.date).getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{slot.theme}</p>
                      <p className="text-xs text-muted-foreground">{slot.format}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-linkedin transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Content Suggestions */}
          {suggestions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your content ideas
              </h2>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-linkedin/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed font-medium">{s.excerpt}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-wider font-semibold">{s.tag}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 text-linkedin hover:text-linkedin hover:bg-linkedin/5" onClick={() => handleUseSuggestion(s)}>
                      Use this
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No schedule yet</p>
            <p className="text-xs text-muted-foreground mb-4">Upload your documents first — we'll build a personalized 30-day plan from your content.</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/draft')}>
              <FileUp className="h-3.5 w-3.5 mr-1.5" />
              Upload documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
