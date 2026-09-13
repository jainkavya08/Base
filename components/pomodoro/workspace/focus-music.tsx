"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACKS = [
  "Lo-fi Focus",
  "Rain in the Forest",
  "Brown Noise",
  "Café Ambience",
  "Deep Space"
];

export function FocusMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <div className="flex items-center gap-4">
        
        {/* Cover Art Placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center shrink-0 border border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-accent-blue/10 mix-blend-multiply" />
          <Music className={cn("w-6 h-6 text-accent-blue", isPlaying && "animate-pulse")} />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-ink truncate">{TRACKS[trackIndex]}</h4>
          <p className="text-xs text-ink-muted truncate">Focus Audio</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-canvas rounded-full p-1 border border-border/50">
          <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-card transition-colors">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-dark text-surface-card hover:bg-surface-dark/90 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          
          <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-card transition-colors">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
