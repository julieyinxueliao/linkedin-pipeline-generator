import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pencil, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  fieldLabel: string;
  context?: string;
  multiline?: boolean;
  onSave: (next: string) => void;
  className?: string;
  displayClassName?: string;
  placeholder?: string;
  showActions?: boolean;
}

export function EditableField({
  value,
  fieldLabel,
  context,
  multiline = true,
  onSave,
  className,
  displayClassName,
  placeholder,
  showActions = true,
}: EditableFieldProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'refine'>('view');
  const [draft, setDraft] = useState(value);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);

  const openEdit = () => { setDraft(value); setMode('edit'); };
  const openRefine = () => { setDraft(value); setInstruction(''); setMode('refine'); };
  const cancel = () => { setMode('view'); setInstruction(''); };

  const save = () => {
    onSave(draft.trim());
    setMode('view');
  };

  const refine = async () => {
    if (!instruction.trim()) {
      toast.error('Tell the AI how to refine it');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-field', {
        body: {
          fieldLabel,
          currentValue: draft,
          instruction: instruction.trim(),
          context,
          multiline,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const next = String(data?.value ?? '').trim();
      if (!next) throw new Error('No content returned');
      setDraft(next);
      setInstruction('');
      toast.success('Refined — review and save');
    } catch (e: any) {
      toast.error(e?.message || 'Refine failed');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <div className={cn('group relative', className)}>
        <div className={cn('whitespace-pre-wrap', displayClassName)}>{value || <span className="text-muted-foreground italic">{placeholder || 'Empty'}</span>}</div>
        {showActions && (
          <div className="flex gap-1.5 mt-2 opacity-60 group-hover:opacity-100 transition">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={openEdit}>
              <Pencil className="h-3 w-3 mr-1" />Edit
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-linkedin hover:text-linkedin" onClick={openRefine}>
              <Sparkles className="h-3 w-3 mr-1" />Refine with AI
            </Button>
          </div>
        )}
      </div>
    );
  }

  const Field = multiline ? Textarea : Input;

  return (
    <div className={cn('space-y-2 rounded-lg border border-linkedin/30 bg-linkedin/5 p-3', className)}>
      <Field
        value={draft}
        onChange={(e: any) => setDraft(e.target.value)}
        rows={multiline ? Math.min(6, Math.max(2, draft.split('\n').length + 1)) : undefined}
        className="text-sm"
        placeholder={placeholder}
      />
      {mode === 'refine' && (
        <div className="space-y-2">
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="How should AI refine this? e.g. 'make it sharper', 'add a number', 'less jargon'"
            rows={2}
            className="text-xs"
          />
          <Button size="sm" variant="linkedin" onClick={refine} disabled={loading} className="h-8">
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {loading ? 'Refining…' : 'Refine'}
          </Button>
        </div>
      )}
      <div className="flex gap-1.5 justify-end">
        <Button size="sm" variant="ghost" className="h-8" onClick={cancel}>
          <X className="h-3.5 w-3.5 mr-1" />Cancel
        </Button>
        <Button size="sm" variant="default" className="h-8" onClick={save}>
          <Check className="h-3.5 w-3.5 mr-1" />Save
        </Button>
      </div>
    </div>
  );
}
