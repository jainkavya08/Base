import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetLayout {
  id: string; // 'habits', 'pomodoro', 'todos', 'reminders', 'finance'
  size: 'small' | 'large';
  order: number;
}

interface AppState {
  // Widget Layout
  widgets: WidgetLayout[];
  updateWidgetOrder: (widgets: WidgetLayout[]) => void;
  toggleWidgetSize: (id: string) => void;
  
  // Pomodoro Transient State
  pomodoro: {
    isRunning: boolean;
    timeLeft: number; // in seconds
    mode: 'focus' | 'short_break' | 'long_break';
    targetEndTime?: number; // timestamp
    currentTodoId?: string;
    sessionCount: number; // how many focus sessions completed in this cycle
    settings: {
      focusDuration: number; // minutes
      shortBreakDuration: number;
      longBreakDuration: number;
      sessionsBeforeLongBreak: number;
      autoStartBreaks: boolean;
      autoStartFocus: boolean;
      soundNotification: boolean;
    };
  };
  setPomodoroState: (state: Partial<AppState['pomodoro']>) => void;
  updatePomodoroSettings: (settings: Partial<AppState['pomodoro']['settings']>) => void;

  // Settings
  settings: {
    theme: 'light' | 'dark';
    accentColor: string;
    notifications: {
      master: boolean;
      pomodoro: boolean;
      reminders: boolean;
      habits: boolean;
    };
    profile: {
      name: string;
    };
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetWidgetLayout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const defaultWidgets: WidgetLayout[] = [
  { id: 'habits', size: 'large', order: 0 },
  { id: 'pomodoro', size: 'small', order: 1 },
  { id: 'todos', size: 'small', order: 2 },
  { id: 'finance', size: 'small', order: 3 },
  { id: 'reminders', size: 'small', order: 4 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      updateWidgetOrder: (widgets) => set({ widgets }),
      toggleWidgetSize: (id) => set((state) => ({
        widgets: state.widgets.map(w => 
          w.id === id ? { ...w, size: w.size === 'small' ? 'large' : 'small' } : w
        )
      })),
      
      pomodoro: {
        isRunning: false,
        timeLeft: 25 * 60,
        mode: 'focus',
        sessionCount: 0,
        settings: {
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4,
          autoStartBreaks: false,
          autoStartFocus: false,
          soundNotification: true,
        }
      },
      setPomodoroState: (newState) => set((state) => ({
        pomodoro: { ...state.pomodoro, ...newState }
      })),
      updatePomodoroSettings: (newSettings) => set((state) => ({
        pomodoro: {
          ...state.pomodoro,
          settings: { ...state.pomodoro.settings, ...newSettings }
        }
      })),

      settings: {
        theme: 'light',
        accentColor: 'default',
        notifications: {
          master: true,
          pomodoro: true,
          reminders: true,
          habits: false,
        },
        profile: {
          name: 'Amanda', // Default based on reference image
        },
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      resetWidgetLayout: () => set({ widgets: defaultWidgets }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'personal-dashboard-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({ 
        widgets: state.widgets,
        settings: state.settings,
        pomodoro: {
          ...state.pomodoro,
          // Do not persist transient timer state, only settings and sessionCount
          isRunning: false,
          targetEndTime: undefined,
          // We can optionally persist timeLeft/mode if we want them to survive a refresh while paused
          // Let's persist them so if they reload they don't lose the exact mode
        }
      }), // Persist widgets, settings, and pomodoro settings
    }
  )
);
