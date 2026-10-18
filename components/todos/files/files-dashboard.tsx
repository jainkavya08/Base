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

  const { handleToggle, handleStatusChange } = useTaskActions();

  if (filesLoading) return <div className="text-center p-8 text-ink-muted">Loading files...</div>;
  
  const files = filesData?.files || [];
  const lists = listsData?.lists || [];
  const tasks = tasksData?.tasks || [];

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const dueTodayTasks = tasks.filter((t: any) => t.dueDate === todayStr && !t.completed && !t.parentTaskId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] tracking-tight">Project Files</h2>
          <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{files.length} active workspace{files.length === 1 ? '' : 's'}</p>
        </div>
        <AddFileDialog />
      </div>

      {dueTodayTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-sendlinks">ACTION REQUIRED</span>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">Due Today</h3>
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
        <div className="bg-[#FDFAF4] rounded-[6px] p-12 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="w-16 h-16 bg-[#F5F0E8] border border-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-[#8A7F72]" />
          </div>
          <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">No files yet</h3>
          <p className="text-[#8A7F72] text-sm mb-6">Create a file to start organizing your lists.</p>
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
