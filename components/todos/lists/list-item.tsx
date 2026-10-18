"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useSWRConfig } from "swr";
import type { TodoList, Todo } from "@/lib/db";
import { CardMenu } from "@/components/todos/card-menu";
import { Button } from "@/components/ui/button";

export function ListItem({ 
  list, 
  fileId,
  listTasks 
}: { 
  list: TodoList;
  fileId: string;
  listTasks: Todo[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();

  const completed = listTasks.filter(t => !t.parentTaskId && t.completed).length;
  const topLevelTasks = listTasks.filter(t => !t.parentTaskId).length;

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editName.trim() && editName.trim() !== list.name) {
      await fetchApi('/api/todos/lists.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: list.id,
          name: editName.trim()
        })
      });
      mutate('/api/todos/lists.php');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Delete the list, tasks will cascade in DB
    await fetchApi('/api/todos/lists.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: list.id })
    });
    
    mutate('/api/todos/lists.php');
    mutate('/api/todos/tasks.php');
    
    setIsDeleting(false);
  };

  if (isDeleting) {
    return (
      <div className="bg-[#FDFAF4] rounded-[6px] p-5 shadow-[4px_4px_0px_0px_#FF4D00] border-2 border-[#FF4D00] flex flex-col items-center justify-center text-center gap-3 h-full min-h-[120px]">
        <h4 className="text-sm font-medium text-[#1A1A1A]">Delete {list.name}?</h4>
        <p className="text-xs font-mono text-[#8A7F72]">
          This will delete {listTasks.length} tasks and subtasks.
        </p>
        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>Delete</Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-[#FDFAF4] rounded-[6px] p-5 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A] flex flex-col gap-3 h-full min-h-[120px]">
        <input
          value={editName}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditName(list.name);
              setIsEditing(false);
            }
          }}
          className="w-full bg-[#FDFAF4] text-[#1A1A1A] placeholder:text-[#8A7F72] focus:outline-none p-2 rounded-[4px] border border-[#1A1A1A] text-sm font-sans"
          autoFocus
        />
        <div className="flex gap-2 justify-end mt-auto">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditName(list.name); setIsEditing(false); }}>Cancel</Button>
          <Button variant="cta" size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => router.push(`/todos/view?fileId=${fileId}&listId=${list.id}`)}
      className="bg-[#FDFAF4] rounded-[6px] p-5 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A] hover:translate-x-0.5 transition-transform group cursor-pointer relative h-full min-h-[120px] flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-serif italic font-normal text-2xl text-[#1A1A1A] flex-1 pr-4">{list.name}</h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
          <CardMenu 
            onEdit={(e) => { e?.stopPropagation(); setIsEditing(true); }} 
            onDelete={(e) => {
              e?.stopPropagation();
              if (listTasks.length > 0) {
                setIsDeleting(true);
              } else {
                handleDelete();
              }
            }} 
          />
        </div>
      </div>
      <div className="flex justify-between items-center text-xs font-mono text-[#8A7F72] mt-auto pt-2 border-t border-[#1A1A1A]/10">
        <span>{topLevelTasks} tasks · {completed} completed</span>
      </div>
    </div>
  );
}
