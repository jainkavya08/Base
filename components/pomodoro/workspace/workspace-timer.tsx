"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings, SkipForward, Maximize, Minimize } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import { mutate } from "swr";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimerSettings } from "./timer-settings";

export function WorkspaceTimer() {
  const { pomodoro, setPomodoroState } = useAppStore();
  const { isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings } = pomodoro;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: taskData } = useSWR('/api/todos/tasks.php', fetcher);
  const currentTask = taskData?.tasks?.find((t: any) => t.id === currentTodoId);
  
  // Use a ref to hold the latest state for the interval closure
  const stateRef = useRef({ isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings });
  useEffect(() => {
    stateRef.current = { isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings };
  }, [isRunning, timeLeft, mode, targetEndTime, currentTodoId, sessionCount, settings]);

  const { updatePomodoroSettings } = useAppStore();
  
  useEffect(() => {
    fetchApi('/api/pomodoro/settings.php')
      .then(data => {
        if (data.success && data.settings) {
          updatePomodoroSettings(data.settings);
        }
      })
      .catch(console.error);
  }, [updatePomodoroSettings]);

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
      await fetchApi('/api/pomodoro/session.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          duration_minutes: s.settings.focusDuration,
          completed_at: new Date().toISOString(),
          task_id: s.currentTodoId,
          type: 'focus',
          status: 'completed'
        })
      });
      // Revalidate all pomodoro stats
      mutate('/api/pomodoro/stats.php');

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

  const handleSkip = async () => {
    if (isRunning) {
      // If we skip while running a focus session, it's interrupted
      if (mode === 'focus') {
        const id = crypto.randomUUID();
        const durationMinutes = settings.focusDuration - Math.ceil(timeLeft / 60);
        
        // Don't record sessions that were barely started (< 1 min)
        if (durationMinutes > 0) {
          await fetchApi('/api/pomodoro/session.php', {
            method: 'POST',
            body: JSON.stringify({
              id,
              duration_minutes: durationMinutes,
              completed_at: new Date().toISOString(),
              task_id: currentTodoId,
              type: 'focus',
              status: 'interrupted'
            })
          });
          mutate('/api/pomodoro/stats.php');
        }
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
    focus: { stroke: 'text-[#FFE14D]', btn: 'bg-[#FF4D00] text-white hover:bg-[#FF4D00]/90 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFE14D]' },
    short_break: { stroke: 'text-[#FFE14D]', btn: 'bg-[#FFE14D] text-[#1A1A1A] hover:bg-[#FFE14D]/90 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FF4D00]' },
    long_break: { stroke: 'text-[#FF4D00]', btn: 'bg-[#FF4D00] text-white hover:bg-[#FF4D00]/90 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFE14D]' }
  };
  
  const currentModeStyle = modeColors[mode];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-[#1A1A1A] p-6 sm:p-8 flex flex-col items-center justify-center relative w-full border-2 border-[#1A1A1A] shadow-[6px_6px_0px_0px_#FFE14D] transition-all duration-300",
        isFullscreen ? "h-screen w-screen rounded-none fixed inset-0 z-50 overflow-auto" : "rounded-[6px]"
      )}
    >
      
      {/* Top Mode Selector */}
      <div className="flex gap-1.5 mb-8 relative z-10 bg-[#2A2A2A] p-1 rounded-[4px] border border-white/20">
        <button 
          onClick={() => setMode('focus')}
          className={cn("px-4 py-1.5 rounded-[3px] text-xs font-sans font-medium transition-all", mode === 'focus' ? 'bg-[#FFE14D] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00] font-bold' : 'text-white/70 hover:text-white')}
        >
          Focus Session
        </button>
        <button 
          onClick={() => setMode('short_break')}
          className={cn("px-4 py-1.5 rounded-[3px] text-xs font-sans font-medium transition-all", mode === 'short_break' ? 'bg-[#FFE14D] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00] font-bold' : 'text-white/70 hover:text-white')}
        >
          Short Break
        </button>
        <button 
          onClick={() => setMode('long_break')}
          className={cn("px-4 py-1.5 rounded-[3px] text-xs font-sans font-medium transition-all", mode === 'long_break' ? 'bg-[#FFE14D] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00] font-bold' : 'text-white/70 hover:text-white')}
        >
          Long Break
        </button>
      </div>

      {/* Large Circular Timer */}
      <div className="relative flex items-center justify-center mb-8 md:mb-10 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[300px] md:h-[300px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-white/10"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="butt"
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear'
            }}
            className={currentModeStyle.stroke}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white font-mono tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-[#FFE14D] text-[11px] md:text-xs mt-2 uppercase tracking-widest font-mono font-medium">
            Session {sessionCount % settings.sessionsBeforeLongBreak + 1} of {settings.sessionsBeforeLongBreak}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 relative z-10 w-full justify-center">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset}
          className="w-11 h-11 rounded-[4px] bg-[#2A2A2A] text-white border-white/20 hover:bg-white/10"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <button 
          onClick={handleStartPause}
          className={cn(
            "w-[180px] h-12 rounded-[4px] border border-[#1A1A1A] font-sans text-sm font-medium tracking-wide transition-all duration-120 active:translate-x-[2px] active:translate-y-[2px]",
            isRunning 
              ? "bg-[#2A2A2A] text-white border-white/20 shadow-[3px_3px_0px_0px_#FFE14D]" 
              : currentModeStyle.btn
          )}
        >
          {isRunning ? "Pause Session" : "Start Session"}
        </button>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleSkip}
          className="w-11 h-11 rounded-[4px] bg-[#2A2A2A] text-white border-white/20 hover:bg-white/10"
          title="Skip Session"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Current Task Display */}
      {currentTask && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm text-white/50 mb-1">Focusing on</p>
          <p className="text-lg font-medium text-white max-w-sm truncate px-4">{currentTask.title}</p>
        </div>
      )}

      {/* Settings Gear and Fullscreen */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen}
          className="text-white/40 hover:text-white hover:bg-surface-card/10 rounded-full"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
        <TimerSettings open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-surface-card/10 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </TimerSettings>
      </div>
    </div>
  );
}
