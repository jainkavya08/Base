"use client";

import { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AddTodoDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date>();
  const [project, setProject] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    await db.todos.add({
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      projectId: project || undefined,
      createdAt: new Date().toISOString(),
    });
    
    setOpen(false);
    setTitle("");
    setPriority("medium");
    setDueDate(undefined);
    setProject("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
          <Plus className="w-5 h-5 mr-1" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-ink-muted">Task Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish quarterly report"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="priority" className="text-ink-muted">Priority</Label>
            <Select value={priority} onValueChange={(v: "low" | "medium" | "high") => setPriority(v)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-ink-muted">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-canvas border-border text-ink hover:bg-canvas/80 hover:text-ink",
                    !dueDate && "text-ink-muted"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-surface-card border-border">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project" className="text-ink-muted">Project / Tag (Optional)</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Work"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
              Save Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
