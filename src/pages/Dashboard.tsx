import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PRESET_MIX } from '@/lib/principles';
import { computeMixCheck } from '@/lib/calendar';
import { PenSquare, CalendarDays, Sparkles, ArrowRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const brief = useAppStore((s) => s.brief);
  const calendar = useAppStore((s) => s.calendar);
  const drafts = useAppStore((s) => s.drafts);
  const profile = useAppStore((s) => s.profile);

  if (!brief) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Build your Strategy Brief</h2>
        <p className="text-muted-foreground text-sm">Everything starts from your brief.</p>
        <Button variant="linkedin" onClick={() => navigate('/onboarding')}>Open onboarding</Button>
      </div>
    );
  }

  const presetMeta = PRESET_MIX[brief.preset];
  const draftedCount = drafts.length;
  const publishedCount = drafts.filter((d) => d.status === 'published').length;

  const upcomingSlots = calendar
    ? [...calendar.slots].filter((s) => s.status === 'planned').slice(0, 4)
    : [];
  const mix = calendar ? computeMixCheck(calendar, brief.preset) : null;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">{brief.companyName || 'Strategy'} · {presetMeta.label}</h1>
        <p className="text-muted-foreground text-sm mt-1">{brief.positioning}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard label="Slots planned" value={calendar?.slots.length ?? 0} icon={CalendarDays} />
        <StatCard label="Drafted" value={draftedCount} icon={FileText} />
        <StatCard label="Published" value={publishedCount} icon={PenSquare} />
        <StatCard label="Calendar" value={calendar?.approvedAt ? 'Approved' : 'Pending'} icon={CheckCircle2} small />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Category POV */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Category POV to own</p>
              <p className="text-base font-semibold text-foreground leading-snug">{brief.categoryPov}</p>
            </CardContent>
          </Card>

          {/* This week's slots */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><CalendarDays className="h-3 w-3" />From your calendar</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/schedule')}>Open calendar<ArrowRight className="h-3 w-3 ml-1" /></Button>
            </div>
            {upcomingSlots.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                {calendar ? 'All slots drafted. Nice.' : 'No calendar yet — generate one.'}
                {!calendar && <div className="mt-3"><Button variant="linkedin" size="sm" onClick={() => navigate('/schedule')}>Generate calendar</Button></div>}
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {upcomingSlots.map((slot) => (
                  <button key={slot.id} onClick={() => navigate(`/draft?slot=${slot.id}`)} disabled={!calendar?.approvedAt} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-linkedin/30 hover:shadow-sm transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed">
                    <div className="text-center min-w-[2.5rem]">
                      <div className="text-[10px] text-muted-foreground uppercase">{new Date(slot.scheduledFor).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-lg font-black text-foreground">{new Date(slot.scheduledFor).getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-snug">{slot.workingAngle}</p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{slot.archetypeName}</Badge>
                        <Badge variant="outline" className="text-[10px]">{slot.funnelStage}</Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-linkedin" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Top POVs */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Top POVs to repeat</h2>
            <div className="space-y-2">
              {brief.povBank.slice(0, 3).map((p, i) => (
                <div key={p.id} className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[10px] text-linkedin font-bold mb-1">POV #{i + 1}</p>
                  <p className="text-sm text-foreground leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right panel — mini mix */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Preset</p>
              <p className="font-bold text-foreground">{presetMeta.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{presetMeta.description}</p>
            </CardContent>
          </Card>
          {mix && (
            <Card>
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Mix Check</p>
                <div className="space-y-1.5 text-xs">
                  {(['TOFU', 'MOFU', 'BOFU'] as const).map((k) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono text-foreground">{mix.funnel.actual[k]}% / {mix.funnel.target[k]}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

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
