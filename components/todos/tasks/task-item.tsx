"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SubtaskComposer } from "./subtask-composer";
import { SubtaskItem } from "./subtask-item";
import { TaskMenu } from "./task-menu";
import { MoveTaskDialog } from "./move-task-dialog";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";
import type { Todo } from "@/lib/db";

export function TaskItem({ 
  task, 
  allTasks, 
  onToggle 
}: { 
  task: Todo; 
  allTasks: Todo[];
  onToggle: (taskId: string, currentStatus: boolean, isParent?: boolean, subtasks?: Todo[], parentTask?: Todo) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const { mutate } = useSWRConfig();
  
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const subtasks = allTasks.filter(t => t.parentTaskId === task.id);
  const completedSubtasks = subtasks.filter(t => t.completed).length;

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      await fetchApi('/api/todos/tasks.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: task.id,
          title: editTitle.trim()
        })
      });
      mutate('/api/todos/tasks.php');
    }
    setIsEditing(false);
  };

  const handleDuplicate = async () => {
    const newParentId = crypto.randomUUID();
    
    // Create new parent
    await fetchApi('/api/todos/tasks.php', {
      method: 'POST',
      body: JSON.stringify({
        ...task,
        id: newParentId,
        title: `${task.title} (Copy)`,
        completed: false
      })
    });
    
    // Create new subtasks
    if (subtasks.length > 0) {
      // Loop over subtasks (we can run promises in parallel)
      await Promise.all(subtasks.map(st => 
        fetchApi('/api/todos/tasks.php', {
          method: 'POST',
          body: JSON.stringify({
            ...st,
            id: crypto.randomUUID(),
            parentTaskId: newParentId,
            completed: false
          })
        })
      ));
    }

    mutate('/api/todos/tasks.php');
  };

  const handleDelete = async () => {
    if (subtasks.length > 0 && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // Delete parent (subtasks cascade in MySQL)
    await fetchApi('/api/todos/tasks.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: task.id })
    });
    
    mutate('/api/todos/tasks.php');
    setShowDeleteConfirm(false);
  };

  const handleAddSubtaskMenu = () => {
    setIsExpanded(true);
    setIsAddingSubtask(true);
    // setTimeout to reset the trigger so SubtaskComposer handles its own internal state
    setTimeout(() => setIsAddingSubtask(false), 50);
  };

  return (
    <div className="bg-surface-card border border-border/50 rounded-2xl p-4 flex flex-col transition-all group/task relative">
      <div className="flex items-start gap-4">
        {subtasks.length > 0 ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-ink-muted hover:text-ink transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4 h-4 mt-1" /> // spacer
        )}
        
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, task.completed, true, subtasks)}
          className="w-5 h-5 accent-accent-blue rounded cursor-pointer mt-0.5"
        />
        
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start gap-4">
            
            {isEditing ? (
              <div className="flex-1 flex flex-col gap-2 mb-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") {
                      setEditTitle(task.title);
                      setIsEditing(false);
                    }
                  }}
                  className="w-full bg-canvas text-ink placeholder:text-ink-muted focus:outline-none p-2 rounded-lg border border-border/50"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditTitle(task.title);
                      setIsEditing(false);
                    }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveEdit}
                    className="h-8 bg-accent-blue text-surface-dark-foreground"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <span className={`text-lg flex-1 ${task.completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                {task.title}
              </span>
            )}
            
            {!isEditing && (
              <div className="flex items-center gap-2">
                {subtasks.length > 0 && (
                  <span className="text-xs font-medium text-ink-muted bg-canvas px-2 py-1 rounded-md">
                    {completedSubtasks} / {subtasks.length}
                  </span>
                )}
                <div className="opacity-0 group-hover/task:opacity-100 transition-opacity">
                  <TaskMenu 
                    onEdit={() => setIsEditing(true)}
                    onAddSubtask={handleAddSubtaskMenu}
                    onDuplicate={handleDuplicate}
                    onMove={() => setShowMoveDialog(true)}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}
          </div>
          
          {task.description && !isEditing && (
            <span className="text-sm text-ink-muted mt-1">{task.description}</span>
          )}

          {isExpanded && subtasks.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 pl-2 border-l-2 border-border/50">
              {subtasks.map(subtask => (
                <SubtaskItem 
                  key={subtask.id} 
                  subtask={subtask} 
                  allSubtasks={subtasks}
                  parentTask={task}
                  onToggle={onToggle}
                />
              ))}
            </div>
          )}

          {(!subtasks.length || isExpanded) && (
            <SubtaskComposer 
              listId={task.listId} 
              parentTaskId={task.id} 
              forceOpen={isAddingSubtask} 
            />
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-surface-card/95 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center p-6 text-center border border-border/50">
          <h4 className="text-lg font-medium text-ink mb-2">Delete this task?</h4>
          <p className="text-sm text-ink-muted mb-4">
            This task has {subtasks.length} subtasks. Deleting it will also delete its subtasks.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </Button>
          </div>
        </div>
      )}

      {showMoveDialog && (
        <MoveTaskDialog 
          isOpen={showMoveDialog} 
          onClose={() => setShowMoveDialog(false)} 
          taskId={task.id} 
          currentListId={task.listId} 
        />
      )}
    </div>
  );
}
