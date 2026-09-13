"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
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

export function AddHabitDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [targetCount, setTargetCount] = useState("1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    await db.habits.add({
      id: crypto.randomUUID(),
      title,
      frequency,
      targetCount: parseInt(targetCount) || 1,
      createdAt: new Date().toISOString(),
    });
    
    setOpen(false);
    setTitle("");
    setFrequency("daily");
    setTargetCount("1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
          <Plus className="w-5 h-5 mr-1" />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-ink-muted">Habit Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Yoga"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency" className="text-ink-muted">Frequency</Label>
            <Select value={frequency} onValueChange={(v: "daily" | "weekly") => setFrequency(v)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="targetCount" className="text-ink-muted">Times per week</Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                max="7"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="bg-canvas border-border text-ink"
              />
            </div>
          )}
          
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
              Save Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
