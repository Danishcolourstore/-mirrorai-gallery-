export interface LivePhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
  ai_score?: number;
  ai_tags?: string[];
  is_culled?: boolean;
}

export interface AiCullingStats {
  total: number;
  kept: number;
  culled: number;
  avgScore: number;
}

export function useLiveSync(_eventId: string) {
  return {
    photos: [] as LivePhoto[],
    isConnected: false,
    cullingStats: { total: 0, kept: 0, culled: 0, avgScore: 0 } as AiCullingStats,
  };
}
