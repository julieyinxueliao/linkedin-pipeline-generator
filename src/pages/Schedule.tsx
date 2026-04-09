import { useAppStore, type ScheduleSlot } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PenSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  draft: 'bg-warning/20 text-warning',
  published: 'bg-success/20 text-success',
};

const Schedule = () => {
  const schedule = useAppStore((s) => s.schedule);
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  // Group by week
  const weeks: ScheduleSlot[][] = [];
  let current: ScheduleSlot[] = [];
  schedule.forEach((slot, i) => {
    current.push(slot);
    const next = schedule[i + 1]?.date;
    if (!next || new Date(next).getDay() <= new Date(slot.date).getDay()) {
      weeks.push(current);
      current = [];
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Your 30-day posting plan</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add a post
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {weeks.map((week, wi) => (
            <div key={wi}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Week {wi + 1}</h3>
              <div className="space-y-2">
                {week.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'w-full text-left flex items-center gap-4 p-4 rounded-lg border transition-all',
                      selectedSlot?.id === slot.id ? 'border-linkedin bg-linkedin/5' : 'border-border bg-card hover:border-linkedin/30'
                    )}
                  >
                    <div className="text-center min-w-[3rem]">
                      <div className="text-xs text-muted-foreground">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-lg font-bold text-foreground">{new Date(slot.date).getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{slot.theme}</p>
                      <p className="text-xs text-muted-foreground">{slot.format}</p>
                    </div>
                    <Badge className={cn('text-xs', statusColors[slot.status])}>
                      {slot.status === 'not_started' ? 'Not started' : slot.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Side panel */}
        <div>
          {selectedSlot ? (
            <Card className="sticky top-6">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Theme</p>
                  <p className="font-medium text-foreground">{selectedSlot.theme}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">{selectedSlot.format}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn('text-xs', statusColors[selectedSlot.status])}>
                    {selectedSlot.status === 'not_started' ? 'Not started' : selectedSlot.status}
                  </Badge>
                </div>
                <Button variant="linkedin" className="w-full" onClick={() => navigate('/draft')}>
                  <PenSquare className="h-4 w-4 mr-2" />
                  Draft this post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground text-sm p-8">
              Select a slot to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
