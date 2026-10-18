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
              "absolute -top-2 -right-8 w-5 h-5 bg-[#1A1A1A] text-[#FFE14D] border border-[#1A1A1A] rounded-[2px] flex items-center justify-center opacity-0 group-hover/dock-item:opacity-100 transition-opacity hover:bg-[#FFE14D] hover:text-[#1A1A1A] z-10 shadow-[1px_1px_0px_0px_#1A1A1A]",
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
              "w-11 h-11 rounded-[4px] bg-[#FFE14D] text-[#1A1A1A] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center hover:bg-[#FF4D00] hover:text-white hover:shadow-[3px_3px_0px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] transition-colors group shrink-0",
              className
            )}
            title="Add Quick Link"
          >
            <Plus className="w-5 h-5" />
          </button>
        )
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {linkToEdit ? "Edit Quick Link" : "Add Quick Link"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs uppercase font-medium text-[#8A7F72]">Name</Label>
            <Input 
              id="name"
              placeholder="e.g. GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url" className="text-xs uppercase font-medium text-[#8A7F72]">URL</Label>
            <Input 
              id="url"
              placeholder="e.g. github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2 mt-1">
            <Label className="text-xs uppercase font-medium text-[#8A7F72] flex items-center justify-between">
              Icon (Optional)
              {icon && (
                <button 
                  type="button" 
                  onClick={() => setIcon(undefined)}
                  className="text-[11px] text-[#FF4D00] hover:underline"
                >
                  Clear
                </button>
              )}
            </Label>
            <div className="grid grid-cols-5 gap-2 bg-[#F5F0E8] p-2.5 rounded-[4px] border border-[#1A1A1A]">
              {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName as IconName)}
                  title={iconName}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-[3px] border transition-transform",
                    icon === iconName 
                      ? "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]" 
                      : "border-transparent text-[#8A7F72] hover:text-[#1A1A1A] hover:bg-[#FDFAF4]"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              ))}
            </div>
            {!icon && (
              <p className="text-xs text-[#8A7F72]">
                If no icon is selected, the website's favicon will be used automatically.
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[#1A1A1A]/10">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              {linkToEdit ? "Save Changes" : "Add Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
