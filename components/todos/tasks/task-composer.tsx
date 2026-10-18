"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";
import { cn } from "cn";
import { parseMultiLineTasks } from "@/lib/utils/tasks";

export function TaskComposer({ listId, currentTaskCount = 0 }: { listId: string; currentTaskCount?: number }) {
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

  const tasksToCreate = parseMultiLineTasks(text);

  const handleSubmit = async () => {
    if (tasksToCreate.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        tasksToCreate.map((title, index) =>
          fetchApi("/api/todos/tasks.php", {
            method: "PUT",
            body: JSON.stringify({
              listId,
              title,
              completed: false,
              priority: "medium",
              status: "todo",
              position: currentTaskCount + index,
            }),
          })
        )
      );

      mutate('/api/todos/tasks.php');
      
      setText("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create tasks:", error);
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
    if (text.trim() && !window.confirm("Discard unsaved tasks?")) {
      return;
    }
    setIsOpen(false);
    setText("");
  };

  return (
    <div className="flex flex-col mb-4">
      <div 
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-4 mb-6" : "grid-rows-[0fr] opacity-0 mt-0 mb-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task or paste multiple tasks..."
              className="w-full bg-transparent text-[#1A1A1A] placeholder:text-[#8A7F72] resize-none focus:outline-none min-h-[40px] text-base font-sans"
              rows={1}
            />
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A1A1A]/10">
              <div className="text-xs font-mono text-[#8A7F72]">
                {tasksToCreate.length > 1 ? `${tasksToCreate.length} tasks will be created` : ""}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  variant="cta"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={tasksToCreate.length === 0 || isSubmitting}
                >
                  {tasksToCreate.length > 1 ? `Add ${tasksToCreate.length} Tasks` : "Add Task"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          variant="cta"
          size="sm"
          className="self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Task
        </Button>
      )}
    </div>
  );
}
