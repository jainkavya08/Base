"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ListsDashboard } from "@/components/todos/lists/lists-dashboard";
import { TasksDashboard } from "@/components/todos/tasks/tasks-dashboard";

function TodoViewContent() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const listId = searchParams.get("listId");
  const router = useRouter();

  if (!fileId) {
    // If no fileId is provided, fallback to the main todos page
    router.replace("/todos");
    return null;
  }

  if (listId) {
    return <TasksDashboard fileId={fileId} listId={listId} />;
  }

  return <ListsDashboard fileId={fileId} />;
}

export default function TodoViewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 text-ink-muted">
        Loading...
      </div>
    }>
      <TodoViewContent />
    </Suspense>
  );
}
