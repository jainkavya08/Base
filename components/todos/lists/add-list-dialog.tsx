"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";

export function AddListDialog({ fileId }: { fileId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState<"list" | "board" | "compact">("list");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetchApi('/api/todos/lists.php', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          name: name.trim(),
          description: description.trim() || undefined,
          defaultView: view
        })
      });

      mutate('/api/todos/lists.php');

      setName("");
      setDescription("");
      setView("list");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-accent-blue text-surface-card hover:bg-accent-blue/90 rounded-full px-6" />}>
        <Plus className="w-4 h-4 mr-2" />
        New Todo List
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-ink">Create Todo List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-ink-muted">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Exam Preparation"
              className="bg-canvas border-border text-ink"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="description" className="text-ink-muted">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Final exam topics"
              className="bg-canvas border-border text-ink"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-ink-muted">Default View</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={view === "list" ? "default" : "outline"}
                className={view === "list" ? "bg-accent-blue text-surface-card" : "border-border text-ink bg-transparent hover:bg-canvas"}
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                type="button"
                variant={view === "board" ? "default" : "outline"}
                className={view === "board" ? "bg-accent-blue text-surface-card" : "border-border text-ink bg-transparent hover:bg-canvas"}
                onClick={() => setView("board")}
              >
                Board
              </Button>
              <Button
                type="button"
                variant={view === "compact" ? "default" : "outline"}
                className={view === "compact" ? "bg-accent-blue text-surface-card" : "border-border text-ink bg-transparent hover:bg-canvas"}
                onClick={() => setView("compact")}
              >
                Compact
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-ink hover:bg-canvas"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-accent-blue text-surface-card hover:bg-accent-blue/90"
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
