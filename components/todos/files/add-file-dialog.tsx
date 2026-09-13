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
import { db } from "@/lib/db";

export function AddFileDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    await db.todoFiles.add({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      createdAt: now,
      updatedAt: now,
    });

    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-accent-blue text-surface-card hover:bg-accent-blue/90 rounded-full px-6" />}>
        <Plus className="w-4 h-4 mr-2" />
        New File
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-ink">Create File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-ink-muted">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, College, Personal"
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
              placeholder="e.g. Tasks related to university"
              className="bg-canvas border-border text-ink"
            />
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
