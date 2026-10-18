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
      <Button variant="cta" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        New Todo List
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] shadow-[8px_8px_0px_0px_#1A1A1A] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">LIST CREATION</span>
          </div>
          <DialogTitle className="font-serif italic font-normal text-2xl text-[#1A1A1A]">Create Todo List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Exam Preparation"
              className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A]"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Final exam topics"
              className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Default View</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={view === "list" ? "cta" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                type="button"
                variant={view === "board" ? "cta" : "outline"}
                size="sm"
                onClick={() => setView("board")}
              >
                Board
              </Button>
              <Button
                type="button"
                variant={view === "compact" ? "cta" : "outline"}
                size="sm"
                onClick={() => setView("compact")}
              >
                Compact
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              variant="cta"
            >
              Create List
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
