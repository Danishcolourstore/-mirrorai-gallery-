import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Heart, Image, FileDown, Share2 } from 'lucide-react';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, getDay } from 'date-fns';

interface Props {
  eventId: string;
  eventName: string;
}

type DateRange = '7' | '30' | '90' | 'all';

const GOLD = 'hsl(var(--primary))';
const DARK = 'hsl(var(--foreground))';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EventAnalyticsTab({ eventId, eventName }: Props) {
  const [range, setRange] = useState<DateRange>('30');
  const [views, setViews] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = range === 'all' ? undefined : subDays(new Date(), parseInt(range)).toISOString();

      let viewQ = (supabase.from('event_views' as any).select('*') as any).eq('event_id', eventId);
      if (since) viewQ = viewQ.gte('created_at', since);
      const { data: v } = await viewQ;

      let intQ = (supabase.from('photo_interactions' as any).select('*') as any).eq('event_id', eventId);
      if (since) intQ = intQ.gte('created_at', since);
      const { data: i } = await intQ;

      setViews(v || []);
      setInteractions(i || []);
      setLoading(false);
    };
    load();
  }, [eventId, range]);

  const stats = useMemo(() => {
    const uniqueSessions = new Set(views.map((v: any) => v.session_id)).size;
    const downloads = interactions.filter((i: any) => i.interaction_type === 'download').length;
    const favorites = interactions.filter((i: any) => i.interaction_type === 'favorite').length;
    return { views: uniqueSessions, totalViews: views.length, downloads, favorites };
  }, [views, interactions]);

  const viewsByDay = useMemo(() => {
    const days = range === 'all' ? 30 : parseInt(range);
    const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    const counts: Record<string, number> = {};
    interval.forEach(d => counts[format(d, 'MMM dd')] = 0);
    views.forEach((v: any) => {
      const key = format(new Date(v.created_at), 'MMM dd');
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [views, range]);

  const downloadsByDay = useMemo(() => {
    const days = range === 'all' ? 30 : parseInt(range);
    const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    const counts: Record<string, number> = {};
    interval.forEach(d => counts[format(d, 'MMM dd')] = 0);
    interactions.filter((i: any) => i.interaction_type === 'download').forEach((i: any) => {
      const key = format(new Date(i.created_at), 'MMM dd');
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [interactions, range]);

  const viewsByDayOfWeek = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    views.forEach((v: any) => { counts[getDay(new Date(v.created_at))]++; });
    return DAY_NAMES.map((name, i) => ({ name, count: counts[i] }));
  }, [views]);

  const deviceBreakdown = useMemo(() => {
    let mobile = 0, desktop = 0;
    views.forEach((v: any) => { if (v.device_type === 'mobile') mobile++; else desktop++; });
    const total = mobile + desktop || 1;
    return [
      { name: 'Mobile', value: mobile, pct: Math.round((mobile / total) * 100) },
      { name: 'Desktop', value: desktop, pct: Math.round((desktop / total) * 100) },
    ];
  }, [views]);

  const summary = useMemo(() => {
    if (views.length === 0) return null;
    const sorted = [...views].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const firstView = sorted[0]?.created_at;
    const lastView = sorted[sorted.length - 1]?.created_at;
    const uniqueSessions = new Set(views.map((v: any) => v.session_id));
    const sessionCounts: Record<string, number> = {};
    views.forEach((v: any) => { sessionCounts[v.session_id] = (sessionCounts[v.session_id] || 0) + 1; });
    const returnVisitors = Object.values(sessionCounts).filter(c => c > 1).length;
    const topDevice = deviceBreakdown[0].value >= deviceBreakdown[1].value ? 'Mobile' : 'Desktop';
    return { firstView, lastView, uniqueVisitors: uniqueSessions.size, returnVisitors, topDevice };
  }, [views, deviceBreakdown]);

  const photoPerformance = useMemo(() => {
    const photoMap: Record<string, { views: number; downloads: number; favorites: number }> = {};
    interactions.forEach((i: any) => {
      if (!photoMap[i.photo_id]) photoMap[i.photo_id] = { views: 0, downloads: 0, favorites: 0 };
      if (i.interaction_type === 'view') photoMap[i.photo_id].views++;
      if (i.interaction_type === 'download') photoMap[i.photo_id].downloads++;
      if (i.interaction_type === 'favorite') photoMap[i.photo_id].favorites++;
    });
    return Object.entries(photoMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  }, [interactions]);

  const exportCSV = () => {
    const rows = viewsByDay.map(d => `${d.date},${d.count}`);
    const csv = `Date,Views\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName}_Analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (views.length === 0 && interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center mt-6">
        <Eye className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="font-serif text-xl text-muted-foreground">No views yet</p>
        <p className="mt-2 text-sm text-muted-foreground/60 max-w-sm">
          Share your gallery link to start tracking analytics
        </p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/event/${eventName}`);
        }}>
          <Share2 className="mr-2 h-4 w-4" /> Copy Gallery Link
        </Button>
      </div>
    );
  }

  const chartConfig = {
    count: { label: 'Count', color: GOLD },
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Date filter + export */}
      <div className="flex items-center justify-between">
        <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
          <SelectTrigger className="w-[160px] h-8 text-[11px] uppercase tracking-wider rounded-full border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV} className="text-[10px] uppercase tracking-wider rounded-full h-8">
          <FileDown className="mr-1.5 h-3 w-3" /> Export CSV
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Unique Views" value={stats.views} icon={<Eye className="h-5 w-5" />} />
        <StatCard label="Downloads" value={stats.downloads} icon={<Download className="h-5 w-5" />} />
        <StatCard label="Favorites" value={stats.favorites} icon={<Heart className="h-5 w-5" />} />
        <StatCard label="Total Page Views" value={stats.totalViews} icon={<Image className="h-5 w-5" />} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Views over time */}
        <div className="bg-card border border-border/50 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Views Over Time</p>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Downloads over time */}
        <div className="bg-card border border-border/50 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Downloads Over Time</p>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={downloadsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Views by day of week */}
        <div className="bg-card border border-border/50 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Views by Day of Week</p>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={viewsByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Device breakdown */}
        <div className="bg-card border border-border/50 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Device Breakdown</p>
          <div className="flex items-center justify-center h-[220px]">
            <PieChart width={200} height={200}>
              <Pie data={deviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={50} outerRadius={80} paddingAngle={4}>
                <Cell fill={GOLD} />
                <Cell fill={DARK} />
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} views`, name]} />
            </PieChart>
            <div className="flex flex-col gap-2 ml-4">
              {deviceBreakdown.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-[11px]">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? GOLD : DARK }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary + Photo Performance side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Summary */}
        {summary && (
          <div className="bg-card border border-border/50 p-5 lg:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Gallery Summary</p>
            <div className="space-y-3 text-[12px]">
              <div className="flex justify-between"><span className="text-muted-foreground">First viewed</span><span className="font-medium">{format(new Date(summary.firstView), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last viewed</span><span className="font-medium">{format(new Date(summary.lastView), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Top device</span><span className="font-medium">{summary.topDevice}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unique visitors</span><span className="font-medium">{summary.uniqueVisitors}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Return visitors</span><span className="font-medium">{summary.returnVisitors}</span></div>
            </div>
          </div>
        )}

        {/* Photo performance */}
        {photoPerformance.length > 0 && (
          <div className="bg-card border border-border/50 p-5 lg:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">Photo Performance</p>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Photo</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Views</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Downloads</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Favorites</th>
                  </tr>
                </thead>
                <tbody>
                  {photoPerformance.map((p, i) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 font-mono text-[10px] text-muted-foreground/70">{p.id.slice(0, 8)}…</td>
                      <td className="py-2 text-right font-medium">{p.views}</td>
                      <td className="py-2 text-right font-medium">{p.downloads}</td>
                      <td className="py-2 text-right font-medium">{p.favorites}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
