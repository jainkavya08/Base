import { useSWRConfig } from "swr";
import { fetchApi } from "@/lib/api";
import type { Todo } from "@/lib/db";

export function useTaskActions() {
  const { mutate } = useSWRConfig();

  const handleToggle = async (taskId: string, currentStatus: boolean, isParent?: boolean, subtasks?: Todo[], parentTask?: Todo) => {
    const newStatus = !currentStatus;

    // Optimistic update
    mutate('/api/todos/tasks.php', (currentData: any) => {
      if (!currentData?.tasks) return currentData;
      let newTasks = [...currentData.tasks];
      
      const updateTaskState = (id: string, status: boolean) => {
        newTasks = newTasks.map((t: any) => t.id === id ? { ...t, completed: status, status: status ? 'completed' : 'todo' } : t);
      };
      
      if (isParent && subtasks) {
        subtasks.forEach(st => updateTaskState(st.id, newStatus));
        updateTaskState(taskId, newStatus);
      } else if (!isParent && parentTask && subtasks) {
        updateTaskState(taskId, newStatus);
        const otherSubtasks = subtasks.filter(t => t.id !== taskId);
        const allOthersCompleted = otherSubtasks.every(t => t.completed);
        if (newStatus && allOthersCompleted) updateTaskState(parentTask.id, true);
        else if (!newStatus && parentTask.completed) updateTaskState(parentTask.id, false);
      } else {
        updateTaskState(taskId, newStatus);
      }
      return { ...currentData, tasks: newTasks };
    }, { revalidate: false });

    try {
      if (isParent && subtasks) {
        const promises = subtasks.map(st => 
          fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: st.id, completed: newStatus }) })
        );
        promises.push(
          fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) })
        );
        await Promise.all(promises);
      } else if (!isParent && parentTask && subtasks) {
        await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) });
        const otherSubtasks = subtasks.filter(t => t.id !== taskId);
        const allOthersCompleted = otherSubtasks.every(t => t.completed);
        if (newStatus && allOthersCompleted) {
          await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: parentTask.id, completed: true }) });
        } else if (!newStatus && parentTask.completed) {
          await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: parentTask.id, completed: false }) });
        }
      } else {
        await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) });
      }
      mutate('/api/todos/tasks.php');
    } catch (e) {
      mutate('/api/todos/tasks.php');
      console.error(e);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string, listId?: string) => {
    // Optimistic update
    mutate('/api/todos/tasks.php', (currentData: any) => {
      if (!currentData?.tasks) return currentData;
      const newTasks = currentData.tasks.map((t: any) => 
        t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'completed' } : t
      );
      return { ...currentData, tasks: newTasks };
    }, { revalidate: false });

    try {
      await fetchApi('/api/todos/tasks.php', { 
        method: 'PUT', 
        body: JSON.stringify({ 
          id: taskId, 
          listId, 
          status: newStatus,
          completed: newStatus === 'completed'
        }) 
      });
      mutate('/api/todos/tasks.php');
    } catch (e) {
      mutate('/api/todos/tasks.php');
      console.error(e);
    }
  };

  return { handleToggle, handleStatusChange };
}
