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
      <Button variant="cta" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        Add Reminder
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] shadow-[8px_8px_0px_0px_#1A1A1A] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">NEW REMINDER</span>
          </div>
          <DialogTitle className="font-serif italic font-normal text-2xl text-[#1A1A1A]">Schedule Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {error && <div className="text-sm font-mono text-[#FF4D00] bg-[#FF4D00]/10 p-2.5 rounded-[4px] border border-[#FF4D00]/30">{error}</div>}
          
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Reminder</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drink water"
              className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A]"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A]"
                required
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              Save Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
