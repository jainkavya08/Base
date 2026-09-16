"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AddLinkDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const addQuickLink = useAppStore((state) => state.addQuickLink);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    
    // Ensure URL has protocol
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    addQuickLink({
      name,
      url: formattedUrl,
    });
    
    setName("");
    setUrl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button 
          className={cn(
            "w-12 h-12 rounded-2xl bg-surface-card/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-card transition-all group shrink-0",
            className
          )}
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            Add Quick Link
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-ink-muted">Name</Label>
            <Input 
              id="name"
              placeholder="e.g. GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-canvas border-border/50 text-ink focus:border-accent"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="url" className="text-ink-muted">URL</Label>
            <Input 
              id="url"
              placeholder="e.g. github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-canvas border-border/50 text-ink focus:border-accent"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--accent)] text-white hover:opacity-90 font-medium">
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
