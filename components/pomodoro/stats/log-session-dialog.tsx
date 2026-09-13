"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";

export function LogSessionDialog() {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("25");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(duration);
    if (!mins || mins <= 0) return;

    await db.pomodoroSessions.add({
      id: crypto.randomUUID(),
      durationMinutes: mins,
      completedAt: new Date().toISOString(),
      type: 'focus' as const,
      status: 'completed' as const
    });

    setOpen(false);
    setDuration("25");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="bg-surface-card border-border/50 text-ink hover:bg-canvas rounded-xl shadow-sm h-10 px-4">
          <Plus className="w-4 h-4 mr-2" />
          Log Session
        </Button>
      } />
      <DialogContent className="sm:max-w-[400px] bg-surface-card border-none shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">Log Focus Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label className="text-ink-muted text-sm font-medium">Duration (minutes)</Label>
            <Input 
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="bg-canvas border-transparent h-12 text-lg px-4"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-ink-muted hover:text-ink hover:bg-canvas"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-accent-blue text-surface-card hover:bg-accent-blue/90"
            >
              Save Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
