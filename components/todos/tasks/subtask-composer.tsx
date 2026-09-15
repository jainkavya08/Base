"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";
import { cn } from "cn";
import { parseMultiLineTasks } from "@/lib/utils/tasks";

export function SubtaskComposer({ 
  listId, 
  parentTaskId,
  forceOpen 
}: { 
  listId: string; 
  parentTaskId: string;
  forceOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate } = useSWRConfig();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [forceOpen]);

  const tasksToCreate = parseMultiLineTasks(text);

  const handleSubmit = async () => {
    if (tasksToCreate.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        tasksToCreate.map((title) =>
          fetchApi("/api/todos/tasks.php", {
            method: "POST",
            body: JSON.stringify({
              listId,
              parentTaskId,
              title,
              completed: false,
              priority: "medium",
            }),
          })
        )
      );

      mutate('/api/todos/tasks.php');
      
      setText("");
      // Keep it open for quickly adding another subtask
    } catch (error) {
      console.error("Failed to create subtasks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleCancel = () => {
    if (text.trim() && !window.confirm("Discard unsaved subtask?")) {
      return;
    }
    setIsOpen(false);
    setText("");
  };

  return (
    <div className="flex flex-col mt-3">
      <div 
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-canvas border border-border/50 rounded-xl p-3 shadow-sm mb-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a subtask or paste multiple subtasks..."
              className="w-full bg-transparent text-ink placeholder:text-ink-muted resize-none focus:outline-none min-h-[24px] text-sm"
              rows={1}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-ink-muted">
                {tasksToCreate.length > 1 ? `${tasksToCreate.length} subtasks will be created` : ""}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  className="border-border text-ink hover:bg-canvas h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmit}
                  disabled={tasksToCreate.length === 0 || isSubmitting}
                  className="bg-accent-blue text-surface-dark-foreground hover:bg-accent-blue/90 h-7 text-xs"
                >
                  {tasksToCreate.length > 1 ? `Add ${tasksToCreate.length} Subtasks` : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center text-sm text-ink-muted hover:text-ink transition-colors w-fit pl-7"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add subtask
        </button>
      )}
    </div>
  );
}
