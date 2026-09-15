"use client";

import { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CardMenu({
  onEdit,
  onDelete
}: {
  onEdit: (e?: React.MouseEvent) => void;
  onDelete: (e?: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleAction = (e: React.MouseEvent, action: (e?: React.MouseEvent) => void) => {
    e.stopPropagation();
    setOpen(false);
    action(e);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-md transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      } />
      <PopoverContent 
        align="end" 
        className="w-32 p-1 bg-surface-card border-border/50 shadow-xl rounded-xl flex flex-col gap-1"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={(e) => handleAction(e, onEdit)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        
        <div className="h-px bg-border/50 my-0 mx-2" />

        <button 
          onClick={(e) => handleAction(e, onDelete)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
