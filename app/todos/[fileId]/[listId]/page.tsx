import { TasksDashboard } from "@/components/todos/tasks/tasks-dashboard";

export default async function ListPage({ params }: { params: Promise<{ fileId: string; listId: string }> }) {
  const { fileId, listId } = await params;
  return <TasksDashboard fileId={fileId} listId={listId} />;
}
