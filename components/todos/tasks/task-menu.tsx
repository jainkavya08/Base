"use client";

import { useState } from "react";
import { MoreVertical, Edit2, Plus, Copy, FolderInput, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TaskMenu({
  isSubtask,
  onEdit,
  onAddSubtask,
  onDuplicate,
  onMove,
  onDelete
}: {
  isSubtask?: boolean;
  onEdit: () => void;
  onAddSubtask?: () => void;
  onDuplicate: () => void;
  onMove?: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-md transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      } />
      <PopoverContent align="end" className="w-48 p-1 bg-surface-card border-border/50 shadow-xl rounded-xl flex flex-col gap-1">
        <button 
          onClick={() => handleAction(onEdit)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        
        {!isSubtask && onAddSubtask && (
          <button 
            onClick={() => handleAction(onAddSubtask)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
          >
            <Plus className="w-4 h-4" />
            Add Subtask
          </button>
        )}

        <button 
          onClick={() => handleAction(onDuplicate)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>

        {!isSubtask && onMove && (
          <button 
            onClick={() => handleAction(onMove)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
          >
            <FolderInput className="w-4 h-4" />
            Move to...
          </button>
        )}

        <div className="h-px bg-border/50 my-1 mx-2" />

        <button 
          onClick={() => handleAction(onDelete)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
