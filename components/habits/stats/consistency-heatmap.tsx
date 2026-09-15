"use client";

import { cn } from "@/lib/utils";

export function ConsistencyHeatmap({ data }: { data: any[] }) {
  // data contains objects with { date, percentage }
  // We want to render a grid of squares.
  // Standard GitHub heatmap displays columns of weeks, top to bottom is Sun-Sat.

  // Let's create a simplified heatmap that just renders boxes left to right, wrapping normally.
  
  return (
    <div className="flex flex-wrap gap-2">
      {data.map((day, i) => {
        const intensity = day.percentage;
        
        let bgClass = "bg-canvas border-border/50";
        if (intensity > 0 && intensity < 40) bgClass = "bg-accent-blue/30 border-accent-blue/10";
        else if (intensity >= 40 && intensity < 70) bgClass = "bg-accent-blue/60 border-accent-blue/20";
        else if (intensity >= 70 && intensity < 100) bgClass = "bg-accent-blue/80 border-accent-blue/30";
        else if (intensity === 100) bgClass = "bg-accent-blue border-accent-blue shadow-sm";

        return (
          <div 
            key={day.dateStr} 
            className="group relative"
          >
            <div 
              className={cn(
                "w-4 h-4 rounded-[4px] border transition-colors",
                bgClass
              )}
            />
            {/* Simple CSS tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-surface-dark text-surface-dark-foreground text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
              <p className="font-medium mb-0.5">{day.formattedDate}</p>
              <p className="text-surface-dark-foreground/80">{day.completed} of {day.total} habits ({day.percentage}%)</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
