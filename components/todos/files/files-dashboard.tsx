"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Folder } from "lucide-react";
import { AddFileDialog } from "./add-file-dialog";
import { FileItem } from "./file-item";
import { TaskItem } from "../tasks/task-item";
import { useTaskActions } from "@/hooks/use-task-actions";
import { Calendar } from "lucide-react";

export function FilesDashboard() {
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData } = useSWR('/api/todos/tasks.php', fetcher);

  if (filesLoading) return <div className="text-center p-8 text-ink-muted">Loading files...</div>;
  
  const files = filesData?.files || [];
  const lists = listsData?.lists || [];
  const tasks = tasksData?.tasks || [];

  const { handleToggle, handleStatusChange } = useTaskActions();

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const dueTodayTasks = tasks.filter((t: any) => t.dueDate === todayStr && !t.completed && !t.parentTaskId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-ink">Files</h2>
        <AddFileDialog />
      </div>

      {dueTodayTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent-blue" />
            <h3 className="text-lg font-medium text-ink">Due Today</h3>
          </div>
          <div className="flex flex-col gap-3">
            {dueTodayTasks.map((task: any) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                allTasks={tasks} 
                onToggle={handleToggle} 
                onStatusChange={(taskId, newStatus) => handleStatusChange(taskId, newStatus, task.listId)} 
              />
            ))}
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="bg-surface-card rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm border border-border/50">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No files yet</h3>
          <p className="text-ink-muted mb-6">Create a file to start organizing your lists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file: any) => {
            const fileLists = lists?.filter((l: any) => l.fileId === file.id) || [];
            const listIds = fileLists.map((l: any) => l.id);
            const fileTasks = tasks?.filter((t: any) => listIds.includes(t.listId)) || [];
            
            return (
              <FileItem 
                key={file.id} 
                file={file} 
                fileLists={fileLists} 
                fileTasks={fileTasks} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
