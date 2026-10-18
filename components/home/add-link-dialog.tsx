"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Globe, Bookmark, Briefcase, Camera, Cloud, Code, FileText, Gift, Heart, Image as ImageIcon, Music, Play, ShoppingCart, Star, Video, MessageSquare, Monitor, Smartphone, PenTool, Terminal } from "lucide-react";
import { useDockStore, QuickLink } from "@/lib/dock-store";
import { cn } from "@/lib/utils";

export const AVAILABLE_ICONS = {
  Globe, Bookmark, Briefcase, Camera, Cloud, Code, FileText, Gift, Heart, ImageIcon, 
  Music, Play, ShoppingCart, Star, Video, MessageSquare, Monitor, Smartphone, PenTool, Terminal
};

export type IconName = keyof typeof AVAILABLE_ICONS;

export function AddLinkDialog({ className, linkToEdit }: { className?: string; linkToEdit?: QuickLink }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<IconName | undefined>(undefined);
  
  const addQuickLink = useDockStore((state) => state.addQuickLink);
  const editQuickLink = useDockStore((state) => state.editQuickLink);

  useEffect(() => {
    if (open) {
      if (linkToEdit) {
        setName(linkToEdit.name);
        setUrl(linkToEdit.url);
        setIcon((linkToEdit.icon as IconName) || undefined);
      } else {
        setName("");
        setUrl("");
        setIcon(undefined);
      }
    }
  }, [open, linkToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    
    // Ensure URL has protocol
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (linkToEdit) {
      editQuickLink(linkToEdit.id, {
        name,
        url: formattedUrl,
        icon
      });
    } else {
      addQuickLink({
        name,
        url: formattedUrl,
        icon
      });
    }
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        linkToEdit ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
            className={cn(
              "absolute -top-2 -right-8 w-5 h-5 bg-surface-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover/dock-item:opacity-100 transition-opacity hover:bg-accent-blue z-10",
              className
            )}
          >
            <Edit2 className="w-3 h-3" />
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
            className={cn(
              "w-12 h-12 rounded-2xl bg-surface-card/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-card transition-all group shrink-0",
              className
            )}
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )
      } />
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            {linkToEdit ? "Edit Quick Link" : "Add Quick Link"}
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
              className="bg-canvas border-border/50 text-ink focus:border-accent-blue/50 focus:ring-accent-blue/50"
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
              className="bg-canvas border-border/50 text-ink focus:border-accent-blue/50 focus:ring-accent-blue/50"
              required
            />
          </div>
          
          <div className="flex flex-col gap-3 mt-2">
            <Label className="text-ink-muted flex items-center justify-between">
              Icon (Optional)
              {icon && (
                <button 
                  type="button" 
                  onClick={() => setIcon(undefined)}
                  className="text-[10px] text-accent-coral hover:underline"
                >
                  Clear
                </button>
              )}
            </Label>
            <div className="grid grid-cols-5 gap-2 bg-canvas p-3 rounded-xl border border-border/50">
              {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName as IconName)}
                  title={iconName}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg transition-all",
                    icon === iconName 
                      ? "bg-accent-blue text-white shadow-md ring-2 ring-accent-blue/30" 
                      : "text-ink-muted hover:text-ink hover:bg-surface-card"
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              ))}
            </div>
            {!icon && (
              <p className="text-xs text-ink-muted px-1">
                If no icon is selected, the website's favicon will be used automatically.
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-blue text-white hover:opacity-90 font-medium">
              {linkToEdit ? "Save Changes" : "Add Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
