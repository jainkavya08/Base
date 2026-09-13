"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const { pomodoro, setPomodoroState } = useAppStore();
  const { isRunning, timeLeft, mode, targetEndTime, currentTodoId } = pomodoro;
  
  // Use a ref to hold the latest state for the interval closure
  const stateRef = useRef({ isRunning, timeLeft, mode, targetEndTime });
  useEffect(() => {
    stateRef.current = { isRunning, timeLeft, mode, targetEndTime };
  }, [isRunning, timeLeft, mode, targetEndTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const { targetEndTime, mode } = stateRef.current;
        if (!targetEndTime) return;

        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));

        if (remaining === 0) {
          // Timer finished
          setPomodoroState({ 
            isRunning: false, 
            timeLeft: mode === 'focus' ? BREAK_TIME : FOCUS_TIME,
            mode: mode === 'focus' ? 'break' : 'focus',
            targetEndTime: undefined
          });
          
          // Play sound or notification (browser notification API can be used here)
          if (Notification.permission === "granted") {
            new Notification(mode === 'focus' ? "Focus time over!" : "Break time over!", {
              body: mode === 'focus' ? "Time for a break." : "Ready to focus?",
            });
          }

          if (mode === 'focus') {
            db.pomodoroSessions.add({
              id: crypto.randomUUID(),
              durationMinutes: 25,
              completedAt: new Date().toISOString(),
              todoId: currentTodoId
            });
          }
        } else {
          setPomodoroState({ timeLeft: remaining });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, setPomodoroState, currentTodoId]);

  useEffect(() => {
    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Focus`;
    } else {
      document.title = "Personal Dashboard";
    }
    
    return () => { document.title = "Personal Dashboard"; };
  }, [timeLeft, isRunning]);

  const handleStartPause = () => {
    if (isRunning) {
      // Pause
      setPomodoroState({ isRunning: false, targetEndTime: undefined });
    } else {
      // Start
      const target = Date.now() + timeLeft * 1000;
      setPomodoroState({ isRunning: true, targetEndTime: target });
      
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleReset = () => {
    setPomodoroState({ 
      isRunning: false, 
      timeLeft: mode === 'focus' ? FOCUS_TIME : BREAK_TIME,
      targetEndTime: undefined
    });
  };
  
  const toggleMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setPomodoroState({
      isRunning: false,
      mode: newMode,
      timeLeft: newMode === 'focus' ? FOCUS_TIME : BREAK_TIME,
      targetEndTime: undefined
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Progress ring calculation (SVG)
  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-surface-dark rounded-[32px] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl max-w-md mx-auto w-full">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${mode === 'focus' ? 'bg-accent-yellow/20' : 'bg-accent-coral/20'}`} />
      
      <div className="flex gap-4 mb-8 relative z-10 bg-surface-card/10 p-1 rounded-full">
        <button 
          onClick={() => mode !== 'focus' && toggleMode()}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'focus' ? 'bg-surface-card text-surface-dark shadow-sm' : 'text-surface-card/60 hover:text-surface-card'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => mode !== 'break' && toggleMode()}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-surface-card text-surface-dark shadow-sm' : 'text-surface-card/60 hover:text-surface-card'}`}
        >
          Break
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-10 w-72 h-72">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-surface-card/10"
          />
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear'
            }}
            className={mode === 'focus' ? 'text-accent-yellow' : 'text-accent-coral'}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-medium tracking-tight text-surface-card font-mono">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleReset}
          className="w-12 h-12 rounded-full text-surface-card/60 hover:text-surface-card hover:bg-surface-card/10"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button 
          onClick={handleStartPause}
          className={`w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform ${mode === 'focus' ? 'bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90' : 'bg-accent-coral text-surface-dark hover:bg-accent-coral/90'}`}
        >
          {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </Button>
        <div className="w-12 h-12" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
