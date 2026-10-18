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
    <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
      <div className="flex items-center gap-4">
        
        {/* Cover Art */}
        <div className="w-14 h-14 rounded-[4px] bg-[#FFE14D] flex items-center justify-center shrink-0 border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] relative">
          <Music className={cn("w-6 h-6 text-[#1A1A1A]", isPlaying && "animate-pulse")} />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <span className="badge-sendlinks text-[9px] mb-1">AMBIENT AUDIO</span>
          <h4 className="font-serif text-lg font-normal text-[#1A1A1A] truncate">{TRACKS[trackIndex]}</h4>
          <p className="text-xs text-[#8A7F72] truncate font-sans">Mechanical background atmosphere</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-[#F5F0E8] rounded-[4px] p-1 border border-[#1A1A1A]">
          <button onClick={handlePrev} className="w-7 h-7 flex items-center justify-center rounded-[2px] text-[#1A1A1A] hover:bg-[#FFE14D] transition-colors" title="Previous Track">
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 flex items-center justify-center rounded-[3px] bg-[#1A1A1A] text-white hover:bg-[#FF4D00] transition-colors border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#FF4D00]"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          
          <button onClick={handleNext} className="w-7 h-7 flex items-center justify-center rounded-[2px] text-[#1A1A1A] hover:bg-[#FFE14D] transition-colors" title="Next Track">
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
