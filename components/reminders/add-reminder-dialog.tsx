"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { mutate } from "swr";
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

export function AddReminderDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!title || !time || !date) {
      setError("Please fill out all fields.");
      return;
    }
    
    try {
      // Combine date and time to ISO string
      const fireAt = new Date(`${date}T${time}`).toISOString();

      await fetchApi('/api/reminders/reminders.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title,
          fireAt,
          createdAt: new Date().toISOString(),
        })
      });
      mutate('/api/reminders/reminders.php');
      
      // Request notification permission if not granted
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
      
      setOpen(false);
      setTitle("");
      setTime("");
      setDate("");
    } catch (err) {
      console.error(err);
      setError("Unable to save reminder. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="rounded-full bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
          <Plus className="w-5 h-5 mr-1" />
          Add Reminder
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">New Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          {error && <div className="text-sm text-accent-coral bg-accent-coral/10 p-3 rounded-lg">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-ink-muted">Reminder</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drink water"
              className="bg-canvas border-border text-ink"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-ink-muted">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-canvas border-border text-ink"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time" className="text-ink-muted">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-canvas border-border text-ink"
                required
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
              Save Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
