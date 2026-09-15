"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { HabitType } from "@/lib/db";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HabitIcon, LUCIDE_ICONS } from "@/components/ui/habit-icon";

const AVAILABLE_ICONS = Object.keys(LUCIDE_ICONS).map(name => `lucide:${name}`);
const DAYS = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 0, label: "S" },
];

export function AddHabitDialog() {
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HabitType>("daily");
  const [icon, setIcon] = useState("lucide:Target");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  
  const [activeDays, setActiveDays] = useState<number[]>([0,1,2,3,4,5,6]);
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("");
  
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    await fetchApi('/api/habits/habits.php', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || undefined,
        type,
        icon,
        activeDays: type !== 'weekly' ? activeDays : undefined,
        target: (type === 'weekly' || type === 'numeric' || type === 'duration') ? (parseFloat(target) || 1) : undefined,
        unit: (type === 'numeric' || type === 'duration') ? unit : undefined,
        reminderTime: reminderEnabled && reminderTime ? reminderTime : undefined,
        paused: false
      })
    });
    
    mutate('/api/habits/habits.php');
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("daily");
    setIcon("lucide:Target");
    setActiveDays([0,1,2,3,4,5,6]);
    setTarget("1");
    setUnit("");
    setReminderEnabled(false);
    setReminderTime("");
  };

  const toggleDay = (dayId: number) => {
    setActiveDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
      <DialogTrigger render={
        <div className="inline-flex">
          {/* Desktop Button */}
          <Button className="hidden md:flex rounded-full bg-accent-yellow text-surface-dark-foreground hover:bg-accent-yellow/90 transition-transform active:scale-95">
            <Plus className="w-5 h-5 mr-1" />
            Add New
          </Button>
          {/* Mobile FAB */}
          <Button className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent-yellow text-surface-dark-foreground hover:bg-accent-yellow/90 shadow-lg flex items-center justify-center z-50">
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      } />
      <DialogContent className="sm:max-w-[450px] bg-surface-card border-none shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
          
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs">Icon</Label>
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger render={
                  <Button variant="outline" className="w-16 bg-canvas border-border text-lg justify-center h-10 px-0 hover:bg-border/50">
                    <HabitIcon icon={icon} className="w-5 h-5 text-ink" />
                  </Button>
                } />
                <PopoverContent align="start" className="w-[320px] bg-surface-card border-border/50 shadow-xl rounded-2xl p-3">
                  <div className="grid grid-cols-7 gap-2">
                    {AVAILABLE_ICONS.map(i => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setIcon(i);
                          setIconPickerOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                          icon === i ? "bg-accent-blue text-surface-dark-foreground shadow-sm" : "hover:bg-canvas text-ink hover:text-accent-blue"
                        )}
                      >
                        <HabitIcon icon={i} className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="title" className="text-ink-muted text-xs">Habit Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exercise"
                className="bg-canvas border-border text-ink h-10"
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-ink-muted text-xs">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 30 minutes of jogging"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="type" className="text-ink-muted text-xs">Habit Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v as HabitType)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily (e.g., Read every day)</SelectItem>
                <SelectItem value="weekly">Weekly (e.g., Gym 3x a week)</SelectItem>
                <SelectItem value="numeric">Numeric (e.g., Drink 2L water)</SelectItem>
                <SelectItem value="duration">Duration (e.g., Meditate 15m)</SelectItem>
                <SelectItem value="avoid">Avoid (e.g., No social media)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type !== 'weekly' && (
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs">Active Days</Label>
              <div className="flex justify-between gap-1">
                {DAYS.map(day => {
                  const isActive = activeDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-accent-blue text-surface-dark-foreground" 
                          : "bg-canvas text-ink-muted hover:text-ink hover:bg-border/50"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {type === "weekly" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="target" className="text-ink-muted text-xs">Times per week</Label>
              <Input
                id="target"
                type="number"
                min="1"
                max="7"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-canvas border-border text-ink"
              />
            </div>
          )}

          {(type === "numeric" || type === "duration") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="target" className="text-ink-muted text-xs">Target</Label>
                <Input
                  id="target"
                  type="number"
                  step="any"
                  min="0"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-canvas border-border text-ink"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="unit" className="text-ink-muted text-xs">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={type === 'duration' ? 'minutes' : 'glasses'}
                  className="bg-canvas border-border text-ink"
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3 p-4 bg-canvas rounded-xl">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder" className="text-ink text-sm">Daily Reminder</Label>
              <Switch 
                id="reminder" 
                checked={reminderEnabled} 
                onCheckedChange={(c) => {
                  setReminderEnabled(c);
                  if (c && !reminderTime) setReminderTime("09:00");
                }}
              />
            </div>
            {reminderEnabled && (
              <div className="flex gap-2 items-center mt-1">
                <Select 
                  value={(parseInt(reminderTime.split(":")[0] || "9") % 12 || 12).toString()} 
                  onValueChange={(h) => {
                    if (!h) return;
                    const m = reminderTime.split(":")[1] || "00";
                    const isPM = parseInt(reminderTime.split(":")[0] || "9") >= 12;
                    let newH = parseInt(h);
                    if (isPM && newH !== 12) newH += 12;
                    if (!isPM && newH === 12) newH = 0;
                    setReminderTime(`${newH.toString().padStart(2, "0")}:${m}`);
                  }}
                >
                  <SelectTrigger className="w-[75px] bg-surface-card border-border/50 text-ink h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[75px] max-h-[200px]">
                    {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                      <SelectItem key={h} value={h.toString()}>
                        {h.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-ink-muted font-bold">:</span>
                <Select 
                  value={reminderTime.split(":")[1] || "00"} 
                  onValueChange={(m) => {
                    if (!m) return;
                    const h = reminderTime.split(":")[0] || "09";
                    setReminderTime(`${h}:${m}`);
                  }}
                >
                  <SelectTrigger className="w-[75px] bg-surface-card border-border/50 text-ink h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[75px] max-h-[200px]">
                    {Array.from({length: 60}, (_, i) => i).map(m => {
                      // Only show every 5 mins to keep list small, or all 60? 
                      // Let's do every 5 mins for simplicity, or 60. Let's do 60.
                      const val = m.toString().padStart(2, '0');
                      return <SelectItem key={m} value={val}>{val}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Select 
                  value={parseInt(reminderTime.split(":")[0] || "9") >= 12 ? "PM" : "AM"} 
                  onValueChange={(ampm) => {
                    if (!ampm) return;
                    const isCurrentlyPM = parseInt(reminderTime.split(":")[0] || "9") >= 12;
                    let h = parseInt(reminderTime.split(":")[0] || "9");
                    const m = reminderTime.split(":")[1] || "00";
                    if (ampm === "PM" && !isCurrentlyPM) h += 12;
                    if (ampm === "AM" && isCurrentlyPM) h -= 12;
                    setReminderTime(`${h.toString().padStart(2, "0")}:${m}`);
                  }}
                >
                  <SelectTrigger className="w-[80px] bg-surface-card border-border/50 text-ink h-10 ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[80px]">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="order-2 sm:order-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-full h-12 sm:h-10">
              Cancel
            </Button>
            <Button type="submit" className="order-1 sm:order-2 flex-1 rounded-full bg-accent-yellow text-surface-dark-foreground hover:bg-accent-yellow/90 font-medium h-12 sm:h-10">
              Save Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
