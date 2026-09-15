"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";

import { fetchApi } from "@/lib/api";

export function TimerSettings({ 
  children,
  open,
  onOpenChange
}: { 
  children: React.ReactNode,
  open: boolean,
  onOpenChange: (open: boolean) => void 
}) {
  const { pomodoro, updatePomodoroSettings } = useAppStore();
  const { settings } = pomodoro;

  const handleChange = async (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    updatePomodoroSettings({ [key]: value });
    
    // Sync to backend
    try {
      await fetchApi('/api/pomodoro/settings.php', {
        method: 'POST',
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error("Failed to sync settings", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent align="end" className="w-80 bg-surface-card border-none shadow-2xl p-6 rounded-2xl z-50 text-ink">
        <h3 className="font-medium text-lg mb-4">Timer Settings</h3>
        
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-ink-muted font-medium">Focus (min)</Label>
              <Input 
                type="number" 
                value={settings.focusDuration} 
                onChange={(e) => handleChange('focusDuration', parseInt(e.target.value) || 25)}
                className="bg-canvas border-transparent h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-ink-muted font-medium">Short Break</Label>
              <Input 
                type="number" 
                value={settings.shortBreakDuration} 
                onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value) || 5)}
                className="bg-canvas border-transparent h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-ink-muted font-medium">Long Break</Label>
              <Input 
                type="number" 
                value={settings.longBreakDuration} 
                onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 15)}
                className="bg-canvas border-transparent h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-ink-muted font-medium">Cycles</Label>
              <Input 
                type="number" 
                value={settings.sessionsBeforeLongBreak} 
                onChange={(e) => handleChange('sessionsBeforeLongBreak', parseInt(e.target.value) || 4)}
                className="bg-canvas border-transparent h-10"
              />
            </div>
          </div>

          <div className="h-px bg-border/50 my-1" />

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium">Auto-start Breaks</span>
              <input 
                type="checkbox" 
                checked={settings.autoStartBreaks}
                onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                className="w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-border" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium">Auto-start Focus</span>
              <input 
                type="checkbox" 
                checked={settings.autoStartFocus}
                onChange={(e) => handleChange('autoStartFocus', e.target.checked)}
                className="w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-border" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium">Sound Notifications</span>
              <input 
                type="checkbox" 
                checked={settings.soundNotification}
                onChange={(e) => handleChange('soundNotification', e.target.checked)}
                className="w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-border" 
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
