"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings, SkipForward, Maximize, Minimize } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimerSettings } from "./timer-settings";

export function WorkspaceTimer() {
  const { pomodoro, setPomodoroState } = useAppStore();
  const { isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings } = pomodoro;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to hold the latest state for the interval closure
  const stateRef = useRef({ isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings });
  useEffect(() => {
    stateRef.current = { isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings };
  }, [isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings]);

  const getDurationForMode = (m: string, s: any) => {
    if (m === 'focus') return s.focusDuration * 60;
    if (m === 'short_break') return s.shortBreakDuration * 60;
    return s.longBreakDuration * 60;
  };

  const handleSessionComplete = async () => {
    const s = stateRef.current;
    
    // Play sound or notification (browser notification API can be used here)
    if (s.settings.soundNotification && Notification.permission === "granted") {
      new Notification(s.mode === 'focus' ? "Focus time over!" : "Break time over!", {
        body: s.mode === 'focus' ? "Time for a break." : "Ready to focus?",
      });
    }

    if (s.mode === 'focus') {
      // Record completed session
      await db.pomodoroSessions.add({
        id: crypto.randomUUID(),
        durationMinutes: s.settings.focusDuration,
        completedAt: new Date().toISOString(),
        todoId: s.currentTodoId,
        type: 'focus',
        status: 'completed'
      });

      const newCount = s.sessionCount + 1;
      const needsLongBreak = newCount % s.settings.sessionsBeforeLongBreak === 0;
      const nextMode = needsLongBreak ? 'long_break' : 'short_break';
      const nextDuration = getDurationForMode(nextMode, s.settings);

      setPomodoroState({ 
        isRunning: s.settings.autoStartBreaks, 
        timeLeft: nextDuration,
        mode: nextMode,
        targetEndTime: s.settings.autoStartBreaks ? Date.now() + nextDuration * 1000 : undefined,
        sessionCount: newCount
      });
    } else {
      // Break over, back to focus
      const nextDuration = getDurationForMode('focus', s.settings);
      setPomodoroState({
        isRunning: s.settings.autoStartFocus,
        timeLeft: nextDuration,
        mode: 'focus',
        targetEndTime: s.settings.autoStartFocus ? Date.now() + nextDuration * 1000 : undefined
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const { targetEndTime } = stateRef.current;
        if (!targetEndTime) return;

        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));

        if (remaining === 0) {
          handleSessionComplete();
        } else {
          setPomodoroState({ timeLeft: remaining });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, setPomodoroState]);

  useEffect(() => {
    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${mode === 'focus' ? 'Focus' : 'Break'}`;
    } else {
      document.title = "Personal Dashboard";
    }
    return () => { document.title = "Personal Dashboard"; };
  }, [timeLeft, isRunning, mode]);

  const handleStartPause = () => {
    if (isRunning) {
      setPomodoroState({ isRunning: false, targetEndTime: undefined });
    } else {
      const target = Date.now() + timeLeft * 1000;
      setPomodoroState({ isRunning: true, targetEndTime: target });
      if (settings.soundNotification && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleReset = () => {
    setPomodoroState({ 
      isRunning: false, 
      timeLeft: getDurationForMode(mode, settings),
      targetEndTime: undefined
    });
  };

  const handleSkip = () => {
    if (isRunning) {
      // If we skip while running a focus session, it's interrupted
      if (mode === 'focus') {
        db.pomodoroSessions.add({
          id: crypto.randomUUID(),
          durationMinutes: settings.focusDuration - Math.ceil(timeLeft / 60), // partial time
          completedAt: new Date().toISOString(),
          todoId: currentTodoId,
          type: 'focus',
          status: 'interrupted'
        });
      }
    }
    handleSessionComplete(); // This naturally moves to the next phase
  };
  
  const setMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    if (mode === newMode) return;
    setPomodoroState({
      isRunning: false,
      mode: newMode,
      timeLeft: getDurationForMode(newMode, settings),
      targetEndTime: undefined
    });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const totalTime = getDurationForMode(mode, settings);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColors = {
    focus: { stroke: 'text-accent-blue', btn: 'bg-accent-blue text-surface-card hover:bg-accent-blue/90' },
    short_break: { stroke: 'text-accent-blue', btn: 'bg-accent-blue text-surface-card hover:bg-accent-blue/90' },
    long_break: { stroke: 'text-accent-coral', btn: 'bg-accent-coral text-surface-card hover:bg-accent-coral/90' }
  };
  
  const currentModeStyle = modeColors[mode];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-surface-dark p-8 flex flex-col items-center justify-center relative shadow-xl w-full transition-all duration-300",
        isFullscreen ? "h-screen w-screen rounded-none fixed inset-0 z-50 overflow-auto" : "rounded-[32px]"
      )}
    >
      
      {/* Top Mode Selector */}
      <div className="flex gap-2 mb-10 relative z-10 bg-canvas p-1.5 rounded-full border border-border/10">
        <button 
          onClick={() => setMode('focus')}
          className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all", mode === 'focus' ? 'bg-surface-dark text-surface-card shadow-sm' : 'text-surface-dark/60 hover:text-surface-dark')}
        >
          Focus
        </button>
        <button 
          onClick={() => setMode('short_break')}
          className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all", mode === 'short_break' ? 'bg-surface-dark text-surface-card shadow-sm' : 'text-surface-dark/60 hover:text-surface-dark')}
        >
          Short Break
        </button>
        <button 
          onClick={() => setMode('long_break')}
          className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all", mode === 'long_break' ? 'bg-surface-dark text-surface-card shadow-sm' : 'text-surface-dark/60 hover:text-surface-dark')}
        >
          Long Break
        </button>
      </div>

      {/* Large Circular Timer */}
      <div className="relative flex items-center justify-center mb-12 w-[320px] h-[320px]">
        <svg className="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-surface-card/10"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear'
            }}
            className={currentModeStyle.stroke}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-7xl font-light tracking-tighter text-surface-card font-mono tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-surface-card/50 text-sm mt-2 uppercase tracking-widest font-medium">
            Session {sessionCount % settings.sessionsBeforeLongBreak + 1} of {settings.sessionsBeforeLongBreak}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 relative z-10 w-full justify-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleReset}
          className="w-12 h-12 rounded-full text-surface-card/60 hover:text-surface-card hover:bg-surface-card/10"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        
        <Button 
          onClick={handleStartPause}
          className={cn(
            "w-[200px] h-16 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg font-medium tracking-wide",
            isRunning ? "bg-surface-card/10 text-surface-card hover:bg-surface-card/20" : currentModeStyle.btn
          )}
        >
          {isRunning ? "Pause" : "Start Focus"}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSkip}
          className="w-12 h-12 rounded-full text-surface-card/60 hover:text-surface-card hover:bg-surface-card/10"
          title="Skip Session"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Gear and Fullscreen */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen}
          className="text-surface-card/40 hover:text-surface-card hover:bg-surface-card/10 rounded-full"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
        <TimerSettings open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Button variant="ghost" size="icon" className="text-surface-card/40 hover:text-surface-card hover:bg-surface-card/10 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </TimerSettings>
      </div>
    </div>
  );
}
