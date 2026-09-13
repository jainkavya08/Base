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
    mode: 'focus' | 'break';
    targetEndTime?: number; // timestamp
    currentTodoId?: string;
  };
  setPomodoroState: (state: Partial<AppState['pomodoro']>) => void;

  // Settings
  settings: {
    theme: 'light' | 'dark';
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
      },
      setPomodoroState: (newState) => set((state) => ({
        pomodoro: { ...state.pomodoro, ...newState }
      })),

      settings: {
        theme: 'light',
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
    }),
    {
      name: 'personal-dashboard-storage',
      partialize: (state) => ({ 
        widgets: state.widgets,
        settings: state.settings 
      }), // Persist widgets and settings
    }
  )
);
