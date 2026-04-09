import { useAppStore } from '@/lib/store';
import { mockAISuggestions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Mic, FileUp, PenSquare, FileText, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const schedule = useAppStore((s) => s.schedule);
  const drafts = useAppStore((s) => s.drafts);
  const navigate = useNavigate();

  const upcoming = schedule.filter((s) => s.status === 'not_started').slice(0, 3);
  const publishedCount = drafts.filter((d) => d.status === 'published').length;
  const draftCount = drafts.filter((d) => d.status === 'draft').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's what's on deck.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* This Week's Posts */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-linkedin" />
              This week's posts
            </h2>
            <div className="space-y-3">
              {upcoming.length > 0 ? upcoming.map((slot) => (
                <Card key={slot.id} className="gradient-card border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[3rem]">
                        <div className="text-xs text-muted-foreground">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-bold text-foreground">{new Date(slot.date).getDate()}</div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{slot.theme}</p>
                        <p className="text-xs text-muted-foreground">{slot.format}</p>
                      </div>
                    </div>
                    <Button variant="linkedin" size="sm" onClick={() => navigate('/draft')}>
                      <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                      Draft this post
                    </Button>
                  </CardContent>
                </Card>
              )) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No upcoming posts. Check your schedule!
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* AI Suggestions */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-linkedin" />
              AI-suggested content
            </h2>
            <div className="space-y-3">
              {mockAISuggestions.map((s) => (
                <Card key={s.id} className="gradient-card border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">{s.excerpt}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">{s.tag}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => navigate('/draft')}>
                      Use this
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Quick Draft */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/draft')}>
                <Mic className="h-4 w-4 mr-2 text-linkedin" />
                Record voice note
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/draft')}>
                <FileUp className="h-4 w-4 mr-2 text-linkedin" />
                Upload a document
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Posts drafted</span>
                <span className="font-bold text-foreground">{draftCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><PenSquare className="h-4 w-4" /> Posts published</span>
                <span className="font-bold text-foreground">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Days active</span>
                <span className="font-bold text-foreground">1</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
