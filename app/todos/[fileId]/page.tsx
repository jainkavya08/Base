import { ListsDashboard } from "@/components/todos/lists/lists-dashboard";

export default async function FilePage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  return <ListsDashboard fileId={fileId} />;
}
