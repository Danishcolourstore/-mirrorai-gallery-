import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DualStorySetupProps {
  eventId: string;
  dualStoryEnabled: boolean;
  person1Name: string;
  person2Name: string;
  person1FaceToken: string | null;
  person2FaceToken: string | null;
  onUpdate: (fields: Record<string, any>) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function DualStorySetup({
  eventId,
  dualStoryEnabled,
  person1Name,
  person2Name,
  person1FaceToken,
  person2FaceToken,
  onUpdate,
}: DualStorySetupProps) {
  const { toast } = useToast();
  const [registering, setRegistering] = useState<'person1' | 'person2' | null>(null);

  const registerFace = async (person: 'person1' | 'person2', file: File) => {
    setRegistering(person);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/detect-face`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Face detection failed');
      const { face_token } = await res.json();
      if (!face_token) throw new Error('No face detected');

      const field = person === 'person1' ? 'person1_face_token' : 'person2_face_token';
      await supabase.from('events').update({ [field]: face_token } as any).eq('id', eventId);
      onUpdate({ [field]: face_token });
      toast({ title: `${person === 'person1' ? person1Name : person2Name}'s face registered` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setRegistering(null);
  };

  return (
    <div className="pt-2 border-t border-border space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Dual Story Mode</p>
        <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 uppercase tracking-wider">World First</span>
      </div>
      <p className="text-[10px] text-muted-foreground/50">Split the gallery into two parallel stories — one for each person's journey through the day.</p>

      <div className="flex items-center justify-between">
        <Label className="text-[12px] text-foreground/80 font-normal">Enable Dual Story</Label>
        <Switch checked={dualStoryEnabled} onCheckedChange={(v) => onUpdate({ dual_story_enabled: v })} />
      </div>

      {dualStoryEnabled && (
        <div className="space-y-3 pl-1 animate-fade-in">
          {/* Person 1 */}
          <div className="space-y-2 bg-secondary/30 p-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Person 1 Name</Label>
              <Input value={person1Name} onChange={(e) => onUpdate({ person1_name: e.target.value })} placeholder="Bride" className="h-8 text-[12px] bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <div className={`flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed transition-colors cursor-pointer text-[11px] ${
                  person1FaceToken ? 'border-primary/40 text-primary bg-primary/5' : 'border-border text-muted-foreground/50 hover:border-primary/30'
                }`}>
                  {registering === 'person1' ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...</>
                  ) : person1FaceToken ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Face Registered</>
                  ) : (
                    <><Camera className="h-3.5 w-3.5" /> Upload Photo</>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) registerFace('person1', e.target.files[0]); }} />
              </label>
            </div>
          </div>

          {/* Person 2 */}
          <div className="space-y-2 bg-secondary/30 p-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Person 2 Name</Label>
              <Input value={person2Name} onChange={(e) => onUpdate({ person2_name: e.target.value })} placeholder="Groom" className="h-8 text-[12px] bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <div className={`flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed transition-colors cursor-pointer text-[11px] ${
                  person2FaceToken ? 'border-primary/40 text-primary bg-primary/5' : 'border-border text-muted-foreground/50 hover:border-primary/30'
                }`}>
                  {registering === 'person2' ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...</>
                  ) : person2FaceToken ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Face Registered</>
                  ) : (
                    <><Camera className="h-3.5 w-3.5" /> Upload Photo</>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) registerFace('person2', e.target.files[0]); }} />
              </label>
            </div>
          </div>

          {person1FaceToken && person2FaceToken && (
            <div className="bg-primary/5 border border-primary/15 p-2.5 text-center animate-fade-in">
              <p className="text-[11px] text-primary font-medium">✦ Both faces registered — Dual Story is ready</p>
              <p className="text-[9px] text-primary/50 mt-0.5">Photos will be auto-tagged when guests view the gallery</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
