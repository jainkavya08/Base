import { BentoGrid } from "@/components/home/bento-grid";
import { format } from "date-fns";

export default function Home() {
  const today = new Date();

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Dashboard</h1>
          <p className="text-ink-muted mt-1">{format(today, "EEEE, MMMM do")}</p>
        </div>
      </div>

      <BentoGrid />
    </div>
  );
}
