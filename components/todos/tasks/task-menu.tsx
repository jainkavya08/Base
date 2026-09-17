"use client";

import { useState } from "react";
import { MoreVertical, Edit2, Plus, Copy, FolderInput, Trash2, ChevronRight, Circle, Clock, PauseCircle, CheckCircle2, Calendar } from "lucide-react";
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
  onDelete,
  onStatusChange,
  currentStatus,
  onDueDateChange,
  currentDueDate
}: {
  isSubtask?: boolean;
  onEdit: () => void;
  onAddSubtask?: () => void;
  onDuplicate: () => void;
  onMove?: () => void;
  onDelete: () => void;
  onStatusChange?: (status: string) => void;
  currentStatus?: string;
  onDueDateChange?: (date: string | null) => void;
  currentDueDate?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleAction = (action: () => void) => {
    setOpen(false);
    setShowStatusMenu(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setShowStatusMenu(false);
    }}>
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

        {onStatusChange && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
            className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4" />
              Set Status
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {onDueDateChange && (
          <div className="relative flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors cursor-pointer overflow-hidden">
            <Calendar className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">{currentDueDate ? new Date(currentDueDate).toLocaleDateString() : 'Set Due Date'}</span>
            <input 
              type="date"
              value={currentDueDate ? currentDueDate.split('T')[0] : ''}
              onChange={(e) => {
                onDueDateChange(e.target.value ? e.target.value : null);
                setOpen(false);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}

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
      
      {showStatusMenu && onStatusChange && (
        <div className="absolute right-[calc(100%+4px)] top-0 w-40 p-1 bg-surface-card border border-border/50 shadow-xl rounded-xl flex flex-col gap-1 z-50">
          <button onClick={() => handleAction(() => onStatusChange('todo'))} className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left">
            <div className="flex items-center gap-2"><Circle className="w-3.5 h-3.5 text-ink-muted" /> To Do</div>
            {currentStatus === 'todo' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />}
          </button>
          <button onClick={() => handleAction(() => onStatusChange('in_progress'))} className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left">
            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-accent-blue" /> In Progress</div>
            {currentStatus === 'in_progress' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />}
          </button>
          <button onClick={() => handleAction(() => onStatusChange('on_hold'))} className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left">
            <div className="flex items-center gap-2"><PauseCircle className="w-3.5 h-3.5 text-orange-500" /> On Hold</div>
            {currentStatus === 'on_hold' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />}
          </button>
          <button onClick={() => handleAction(() => onStatusChange('completed'))} className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors text-left">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed</div>
            {currentStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />}
          </button>
        </div>
      )}
    </Popover>
  );
}
