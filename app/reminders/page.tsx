import { ReminderList } from "@/components/reminders/reminder-list";
import { AddReminderDialog } from "@/components/reminders/add-reminder-dialog";

export default function RemindersPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1A1A1A]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">SCHEDULE</span>
            <span className="text-xs font-mono text-[#8A7F72]">NOTIFICATIONS</span>
          </div>
          <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">Reminders</h1>
          <p className="text-sm font-sans text-[#8A7F72] mt-0.5">Get notified for important events.</p>
        </div>
        <AddReminderDialog />
      </div>

      <ReminderList />
    </div>
  );
}
