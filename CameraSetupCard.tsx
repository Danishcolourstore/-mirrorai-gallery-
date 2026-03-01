import { useState, useEffect, useCallback } from 'react';
import { Camera, Copy, Check, Wifi, WifiOff, Image, Clock, Smartphone, Radio, ChevronRight, Zap, CheckCircle2, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface CameraSetupCardProps {
  eventId: string;
  userId: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function generateFtpPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => chars[b % chars.length])
    .join('');
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between bg-muted/30 border border-border px-3 py-2">
      <div className="min-w-0 flex-1 mr-2">
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 block">{label}</span>
        <span className="text-[11px] font-mono text-foreground break-all">{text}</span>
      </div>
      <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0">
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
      {n}
    </div>
  );
}

function BrandPill({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] font-medium border transition-all duration-200 ${
        active
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground/60 hover:border-primary/40 hover:text-foreground/80'
      }`}
    >
      {name}
    </button>
  );
}

const BRANDS = ['Sony', 'Canon', 'Nikon', 'OM System'] as const;
type Brand = typeof BRANDS[number];

const BRAND_GUIDES: Record<Brand, { wifi: string; ftp: string; auto: string; format: string }> = {
  Sony: {
    wifi: 'Menu → Network → WiFi → Connect to your phone hotspot',
    ftp: 'Menu → Network → Transfer & Remote → FTP Transfer → Server Settings (enter HTTP endpoint as server)',
    auto: 'FTP Transfer → Auto Transfer → ON (camera sends via HTTP POST)',
    format: 'Set image format to JPEG for fastest transfer',
  },
  Canon: {
    wifi: 'Menu → Network Settings → WiFi → Connect to hotspot',
    ftp: 'Menu → Network → FTP Transfer → Enter ingest endpoint as server',
    auto: 'Auto Transfer → Enable (uploads via HTTP POST)',
    format: 'Set to JPEG. RAW files are too large for live delivery.',
  },
  Nikon: {
    wifi: 'Menu → Network → WiFi → Select your phone hotspot',
    ftp: 'Menu → Network → Connect to FTP Server → Enter ingest endpoint credentials',
    auto: 'Auto Send → ON (camera uploads via HTTP POST)',
    format: 'Use JPEG Fine for best speed/quality balance.',
  },
  'OM System': {
    wifi: 'Menu → WiFi → Connect to your hotspot',
    ftp: 'Menu → Connection → FTP → Enter ingest endpoint credentials',
    auto: 'Auto Send → ON (uploads via HTTP POST)',
    format: 'Set to JPEG for live transfer.',
  },
};

export function CameraSetupCard({ eventId, userId }: CameraSetupCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ftpPassword, setFtpPassword] = useState<string | null>(null);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [cameraModel, setCameraModel] = useState<string | null>(null);
  const [lastPhotoAt, setLastPhotoAt] = useState<string | null>(null);
  const [livePhotoCount, setLivePhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<Brand>('Sony');
  const [showGuide, setShowGuide] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const fetchEventData = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('ftp_password, camera_connected, camera_model, last_photo_at, live_photo_count')
      .eq('id', eventId)
      .single();
    if (data) {
      setFtpPassword((data as any).ftp_password);
      setCameraConnected((data as any).camera_connected ?? false);
      setCameraModel((data as any).camera_model);
      setLastPhotoAt((data as any).last_photo_at);
      setLivePhotoCount((data as any).live_photo_count ?? 0);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchEventData(); }, [fetchEventData]);
  useEffect(() => {
    const interval = setInterval(fetchEventData, 10000);
    return () => clearInterval(interval);
  }, [fetchEventData]);

  const generateCredentials = async () => {
    const password = generateFtpPassword();
    const { error } = await supabase
      .from('events')
      .update({ ftp_password: password } as any)
      .eq('id', eventId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to generate credentials', variant: 'destructive' });
      return;
    }
    setFtpPassword(password);
    setShowGuide(true);
    toast({ title: 'Credentials Generated', description: 'Your live camera credentials are ready' });
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const formData = new FormData();
      formData.append('event_id', eventId);
      formData.append('test', 'true');
      if (ftpPassword) formData.append('ftp_password', ftpPassword);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/camera-ftp-ingest`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setTestResult('success');
        toast({ title: '✅ Connection Verified', description: 'Your MirrorLive endpoint is reachable and credentials are valid.' });
      } else {
        setTestResult('fail');
        toast({ title: '❌ Connection Failed', description: json.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err: any) {
      setTestResult('fail');
      toast({ title: '❌ Connection Failed', description: err.message, variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return null;

  const httpEndpoint = `${SUPABASE_URL}/functions/v1/camera-ftp-ingest`;
  const guide = BRAND_GUIDES[selectedBrand];

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-medium flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            MirrorLive Setup
          </CardTitle>
          {cameraConnected ? (
            <Badge className="bg-destructive text-destructive-foreground text-[9px] uppercase tracking-[0.1em] border-0 animate-pulse">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground" />
              </span>
              LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-[9px] uppercase tracking-[0.1em]">
              <WifiOff className="h-3 w-3 mr-1" /> Waiting…
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Live stats ── */}
        {(cameraConnected || livePhotoCount > 0) && (
          <div className="grid grid-cols-3 gap-2">
            {cameraModel && (
              <div className="bg-muted/20 border border-border px-3 py-2 text-center">
                <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 block">Camera</span>
                <span className="text-[11px] font-medium text-foreground">{cameraModel}</span>
              </div>
            )}
            <div className="bg-muted/20 border border-border px-3 py-2 text-center">
              <Image className="h-3 w-3 mx-auto mb-0.5 text-primary" />
              <span className="text-[11px] font-medium text-foreground">{livePhotoCount}</span>
              <span className="text-[9px] text-muted-foreground/60 block">Photos</span>
            </div>
            {lastPhotoAt && (
              <div className="bg-muted/20 border border-border px-3 py-2 text-center">
                <Clock className="h-3 w-3 mx-auto mb-0.5 text-primary" />
                <span className="text-[10px] font-medium text-foreground">
                  {formatDistanceToNowStrict(new Date(lastPhotoAt), { addSuffix: true })}
                </span>
                <span className="text-[9px] text-muted-foreground/60 block">Last Photo</span>
              </div>
            )}
          </div>
        )}

        {/* ── Generate credentials ── */}
        {!ftpPassword ? (
          <div className="space-y-3">
            <div className="bg-primary/5 border border-primary/20 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[12px] font-medium text-foreground">Zero Extra Apps Needed</span>
              </div>
              <p className="text-[10px] text-foreground/60 leading-relaxed">
                Your camera uploads photos directly to MirrorAI via your phone's hotspot.
                No laptop, no tethering software, no cloud sync apps. Just camera → phone hotspot → guests.
              </p>
            </div>
            <Button
              onClick={generateCredentials}
              className="w-full bg-primary hover:bg-primary/85 text-primary-foreground text-[11px] uppercase tracking-[0.08em] h-10"
            >
              <Radio className="mr-1.5 h-3.5 w-3.5" />
              Enable MirrorLive
            </Button>
          </div>
        ) : (
          <>
            {/* ── Credentials ── */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 font-medium">Your Credentials</p>
              <CopyButton label="Ingest Endpoint (HTTP POST)" text={httpEndpoint} />
              <CopyButton label="Port" text="443 (HTTPS)" />
              <CopyButton label="Event ID (Username)" text={eventId} />
              <CopyButton label="Ingest Password" text={ftpPassword} />
            </div>

            {/* ── Test Connection + QR ── */}
            <div className="flex gap-2">
              <Button
                onClick={testConnection}
                disabled={testing}
                variant="outline"
                className="flex-1 h-9 text-[10px] uppercase tracking-[0.08em]"
              >
                {testing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : testResult === 'success' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                ) : testResult === 'fail' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive mr-1.5" />
                ) : (
                  <Wifi className="h-3.5 w-3.5 mr-1.5" />
                )}
                {testing ? 'Testing…' : testResult === 'success' ? 'Connected ✓' : testResult === 'fail' ? 'Failed ✗' : 'Test Connection'}
              </Button>
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>

            {/* ── QR Code ── */}
            {showQR && (
              <div className="flex flex-col items-center gap-2 py-3 bg-background border border-border p-4 animate-fade-in">
                <QRCodeSVG
                  value={`${window.location.origin}/dashboard/mirrorlive?eventId=${eventId}`}
                  size={160}
                  level="M"
                />
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.1em]">Scan to open MirrorLive setup</span>
              </div>
            )}

            {/* ── Toggle guide ── */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-border hover:bg-muted/20 transition-colors"
            >
              <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-primary" />
                Camera Setup Guide
              </span>
              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showGuide ? 'rotate-90' : ''}`} />
            </button>
          </>
        )}

        {/* ════ SETUP GUIDE ════ */}
        {showGuide && ftpPassword && (
          <div className="space-y-5 animate-fade-in">
            {/* Brand selector */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 font-medium">Select Your Camera</p>
              <div className="flex gap-1.5 flex-wrap">
                {BRANDS.map((b) => (
                  <BrandPill key={b} name={b} active={selectedBrand === b} onClick={() => setSelectedBrand(b)} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 font-medium">One-Time Setup</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* STEP 1: Phone Hotspot */}
            <div className="flex gap-3">
              <StepNumber n={1} />
              <div className="flex-1 space-y-2">
                <p className="text-[12px] font-medium text-foreground">Turn On Phone Hotspot</p>
                <div className="bg-muted/20 border border-border p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-medium text-foreground block">iPhone</span>
                      <span className="text-[10px] text-foreground/60">Settings → Personal Hotspot → ON</span>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-medium text-foreground block">Android</span>
                      <span className="text-[10px] text-foreground/60">Settings → Hotspot → ON</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Camera WiFi */}
            <div className="flex gap-3">
              <StepNumber n={2} />
              <div className="flex-1 space-y-2">
                <p className="text-[12px] font-medium text-foreground">Connect Camera to Hotspot</p>
                <div className="bg-muted/20 border border-border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wifi className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-medium text-foreground">{selectedBrand}</span>
                  </div>
                  <p className="text-[10px] text-foreground/60">{guide.wifi}</p>
                </div>
              </div>
            </div>

            {/* STEP 3: Camera Ingest Config */}
            <div className="flex gap-3">
              <StepNumber n={3} />
              <div className="flex-1 space-y-2">
                <p className="text-[12px] font-medium text-foreground">Enter MirrorAI Ingest Details</p>
                <div className="bg-muted/20 border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-medium text-foreground">{selectedBrand}</span>
                  </div>
                  <p className="text-[10px] text-foreground/60 leading-relaxed">{guide.ftp}</p>
                  <div className="h-px bg-border" />
                  <div className="space-y-1">
                    <CopyButton label="Server URL" text={httpEndpoint} />
                    <CopyButton label="Event ID" text={eventId} />
                    <CopyButton label="Password" text={ftpPassword} />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Auto Transfer */}
            <div className="flex gap-3">
              <StepNumber n={4} />
              <div className="flex-1 space-y-2">
                <p className="text-[12px] font-medium text-foreground">Enable Auto Transfer</p>
                <div className="bg-muted/20 border border-border p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-medium text-foreground">{selectedBrand}</span>
                  </div>
                  <p className="text-[10px] text-foreground/60">{guide.auto}</p>
                  <p className="text-[9px] text-primary/70 italic mt-1">{guide.format}</p>
                </div>
              </div>
            </div>

            {/* Event day checklist */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 font-medium">At Every Event</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 space-y-3">
              <p className="text-[11px] font-medium text-foreground uppercase tracking-[0.06em]">On the day of the event:</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[11px] text-foreground/80">Turn on phone hotspot</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[11px] text-foreground/80">Camera auto-connects and starts uploading</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[11px] text-foreground/80">Photos appear in guests' gallery in real time</span>
                </div>
              </div>
              <div className="pt-2 border-t border-primary/15">
                <p className="text-[9px] text-primary/70 uppercase tracking-[0.1em] font-medium text-center">
                  No laptop · No extra apps · No tethering · Just shoot
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
