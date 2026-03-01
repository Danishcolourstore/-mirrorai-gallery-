import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface DualStoryHeroProps {
  person1Name: string;
  person2Name: string;
  person1PhotoUrl?: string;
  person2PhotoUrl?: string;
  person1Count: number;
  person2Count: number;
  activeFilter: 'all' | 'person1' | 'person2';
  onFilterChange: (filter: 'all' | 'person1' | 'person2') => void;
}

export function DualStoryHero({
  person1Name,
  person2Name,
  person1PhotoUrl,
  person2PhotoUrl,
  person1Count,
  person2Count,
  activeFilter,
  onFilterChange,
}: DualStoryHeroProps) {
  return (
    <div className="mb-10">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary/60" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/70 font-semibold">Dual Story Mode</p>
          <Sparkles className="h-4 w-4 text-primary/60" />
        </div>
        <h2 className="font-serif italic text-[28px] sm:text-[36px] text-foreground/80 leading-tight">
          See your day through their eyes
        </h2>
      </div>

      {/* Two portrait cards */}
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {/* Person 1 card */}
        <button
          onClick={() => onFilterChange(activeFilter === 'person1' ? 'all' : 'person1')}
          className={`group relative flex flex-col items-center gap-3 transition-all duration-500 ${
            activeFilter === 'person1' ? 'scale-105' : activeFilter === 'person2' ? 'opacity-40 scale-95' : ''
          }`}
        >
          <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[3px] transition-all duration-500 ${
            activeFilter === 'person1' ? 'border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]' : 'border-border/40 group-hover:border-primary/40'
          }`}>
            {person1PhotoUrl ? (
              <img src={person1PhotoUrl} alt={person1Name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-[32px] font-serif italic text-foreground/20">{person1Name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="font-serif italic text-[18px] sm:text-[22px] text-foreground font-medium">{person1Name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">{person1Count} moments</p>
          </div>
          {activeFilter === 'person1' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary animate-fade-in" />
          )}
        </button>

        {/* Divider */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-px h-12 bg-border/30" />
          <span className="text-[10px] italic text-muted-foreground/30 font-serif">&</span>
          <div className="w-px h-12 bg-border/30" />
        </div>

        {/* Person 2 card */}
        <button
          onClick={() => onFilterChange(activeFilter === 'person2' ? 'all' : 'person2')}
          className={`group relative flex flex-col items-center gap-3 transition-all duration-500 ${
            activeFilter === 'person2' ? 'scale-105' : activeFilter === 'person1' ? 'opacity-40 scale-95' : ''
          }`}
        >
          <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[3px] transition-all duration-500 ${
            activeFilter === 'person2' ? 'border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]' : 'border-border/40 group-hover:border-primary/40'
          }`}>
            {person2PhotoUrl ? (
              <img src={person2PhotoUrl} alt={person2Name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-[32px] font-serif italic text-foreground/20">{person2Name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="font-serif italic text-[18px] sm:text-[22px] text-foreground font-medium">{person2Name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">{person2Count} moments</p>
          </div>
          {activeFilter === 'person2' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary animate-fade-in" />
          )}
        </button>
      </div>

      {/* "Both" / "All" toggle */}
      {activeFilter !== 'all' && (
        <div className="text-center mt-6 animate-fade-in">
          <button
            onClick={() => onFilterChange('all')}
            className="text-[11px] uppercase tracking-[0.2em] text-primary/60 hover:text-primary font-medium transition-colors"
          >
            ← View All Together
          </button>
        </div>
      )}

      {/* Story subtitle when filtered */}
      {activeFilter !== 'all' && (
        <div className="text-center mt-6 animate-fade-in">
          <p className="font-serif italic text-[24px] text-foreground/60">
            {activeFilter === 'person1' ? `${person1Name}'s Day` : `${person2Name}'s Day`}
          </p>
        </div>
      )}
    </div>
  );
}
