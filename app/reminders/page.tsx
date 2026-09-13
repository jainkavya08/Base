import { ReminderList } from "@/components/reminders/reminder-list";
import { AddReminderDialog } from "@/components/reminders/add-reminder-dialog";

export default function RemindersPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Reminders</h1>
          <p className="text-ink-muted mt-1">Get notified for important events.</p>
        </div>
        <AddReminderDialog />
      </div>

      <ReminderList />
    </div>
  );
}
