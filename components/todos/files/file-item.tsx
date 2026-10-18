"use client";

import { useState } from "react";
import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { fetchApi } from "@/lib/api";
import type { TodoFile, TodoList, Todo } from "@/lib/db";
import { CardMenu } from "@/components/todos/card-menu";
import { Button } from "@/components/ui/button";

export function FileItem({ 
  file, 
  fileLists, 
  fileTasks 
}: { 
  file: TodoFile;
  fileLists: TodoList[];
  fileTasks: Todo[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate } = useSWRConfig();

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editName.trim() && editName.trim() !== file.name) {
      await fetchApi('/api/todos/files.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: file.id,
          name: editName.trim()
        })
      });
      mutate('/api/todos/files.php');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await fetchApi('/api/todos/files.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: file.id })
    });
    
    mutate('/api/todos/files.php');
    mutate('/api/todos/lists.php');
    mutate('/api/todos/tasks.php');
    
    setIsDeleting(false);
  };

  if (isDeleting) {
    return (
      <div className="bg-[#FDFAF4] rounded-[6px] p-5 border-2 border-[#FF4D00] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px]">
        <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">Delete {file.name}?</h4>
        <p className="text-xs text-[#8A7F72] font-sans">
          This will delete {fileLists.length} lists and {fileTasks.length} tasks.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>Delete</Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col gap-3 h-full min-h-[160px]">
        <div className="w-9 h-9 rounded-[3px] bg-[#FFE14D] border border-[#1A1A1A] flex items-center justify-center">
          <Folder className="w-5 h-5 text-[#1A1A1A]" />
        </div>
        <input
          value={editName}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditName(file.name);
              setIsEditing(false);
            }
          }}
          className="w-full bg-[#F5F0E8] text-[#1A1A1A] placeholder:text-[#8A7F72] focus:outline-none p-2 rounded-[4px] border border-[#1A1A1A] text-sm font-sans"
          autoFocus
        />
        <div className="flex gap-2 justify-end mt-auto">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditName(file.name); setIsEditing(false); }}>Cancel</Button>
          <Button size="sm" variant="cta" onClick={handleSave}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => router.push(`/todos/view?fileId=${file.id}`)}
      className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all group cursor-pointer relative h-full min-h-[160px] flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center shrink-0">
          <Folder className="w-5 h-5 text-[#1A1A1A]" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <CardMenu 
            onEdit={(e) => { e?.stopPropagation(); setIsEditing(true); }} 
            onDelete={(e) => {
              e?.stopPropagation();
              if (fileLists.length > 0 || fileTasks.length > 0) {
                setIsDeleting(true);
              } else {
                handleDelete();
              }
            }} 
          />
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-normal text-[#1A1A1A] mb-1">{file.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="badge-sendlinks text-[10px]">{fileLists.length} LISTS</span>
          <span className="text-xs font-mono text-[#8A7F72]">{fileTasks.length} tasks</span>
        </div>
      </div>
    </div>
  );
}
