"use client";

import { useRef } from "react";
import { db } from "@/lib/db";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Upload, Trash2, Moon, Sun, LayoutGrid } from "lucide-react";
// Dynamic import of dexie-export-import used inside handlers

export default function SettingsPage() {
  const { settings, updateSettings, resetWidgetLayout } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const { exportDB } = await import("dexie-export-import");
      const blob = await exportDB(db);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("Importing data will merge with your current data. Do you want to proceed?")) {
      try {
        const { importInto } = await import("dexie-export-import");
        await importInto(db, file);
        alert("Data imported successfully! The page will now reload.");
        window.location.reload();
      } catch (error) {
        console.error("Import failed", error);
        alert("Failed to import data.");
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you ABSOLUTELY sure? This will delete all your local data across all modules. This action cannot be undone.")) {
      try {
        await Promise.all([
          db.habits.clear(),
          db.habitCompletions.clear(),
          db.pomodoroSessions.clear(),
          db.todos.clear(),
          db.reminders.clear(),
          db.financeTransactions.clear(),
        ]);
        alert("All data has been cleared.");
      } catch (error) {
        console.error("Failed to clear data", error);
        alert("Failed to clear data.");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-medium text-ink">Settings</h1>
        <p className="text-ink-muted mt-1">Manage your dashboard preferences and data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Column */}
        <div className="flex flex-col gap-10">
          
          {/* Account & Data */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Account & Data</h2>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="name" className="text-ink">Display Name</Label>
              <Input 
                id="name"
                value={settings?.profile?.name || ''} 
                onChange={(e) => updateSettings({ profile: { ...settings.profile, name: e.target.value } })}
                className="bg-canvas border-border text-ink max-w-sm"
              />
              <p className="text-sm text-ink-muted">Mainly used for personalized greetings.</p>
            </div>

            <div className="flex flex-col gap-4 bg-surface-card p-5 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-ink">Export Data</h3>
                  <p className="text-sm text-ink-muted">Download a backup of all your local data.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} className="border-border hover:bg-canvas">
                  <Download className="w-4 h-4 mr-2" /> Export JSON
                </Button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <h3 className="font-medium text-ink">Import Data</h3>
                  <p className="text-sm text-ink-muted">Restore data from a backup file.</p>
                </div>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-border hover:bg-canvas">
                  <Upload className="w-4 h-4 mr-2" /> Import JSON
                </Button>
              </div>
            </div>

            <div>
              <Button 
                variant="outline" 
                onClick={handleClearData} 
                className="w-full text-accent-coral border-accent-coral/20 hover:bg-accent-coral/10 hover:text-accent-coral"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear All App Data
              </Button>
            </div>
          </section>

          {/* About */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">About</h2>
            <div className="bg-surface-card p-5 rounded-2xl border border-border/50">
              <h3 className="font-medium text-ink">Personal Productivity Dashboard</h3>
              <p className="text-sm text-ink-muted mt-1">Version 1.0.0</p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-ink font-medium mb-2">Recent Changes:</p>
                <ul className="list-disc list-inside text-sm text-ink-muted space-y-1">
                  <li>Added local-first Dexie DB persistence.</li>
                  <li>Implemented drag-and-drop Bento Grid.</li>
                  <li>Introduced Pomodoro, Finance, and Habit tracking.</li>
                  <li>Added floating sidebar navigation.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-10">
          
          {/* Appearance */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Appearance</h2>
            
            <div className="flex items-center justify-between bg-surface-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink">
                  {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-ink">Dark Mode</h3>
                  <p className="text-sm text-ink-muted">Toggle application theme</p>
                </div>
              </div>
              <Switch 
                checked={settings.theme === 'dark'} 
                onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })} 
              />
            </div>

            <div className="flex items-center justify-between bg-surface-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-ink">Reset Dashboard Layout</h3>
                  <p className="text-sm text-ink-muted">Restore default widget order & sizes</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { resetWidgetLayout(); alert('Layout reset!'); }} className="border-border hover:bg-canvas">
                Reset
              </Button>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Notifications</h2>
            
            <div className="flex flex-col gap-3 bg-surface-card p-5 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="font-medium text-ink">Master Notifications</h3>
                  <p className="text-sm text-ink-muted">Enable browser notifications</p>
                </div>
                <Switch 
                  checked={settings.notifications.master} 
                  onCheckedChange={async (checked) => {
                    if (checked && Notification.permission !== "granted") {
                      const permission = await Notification.requestPermission();
                      if (permission === "granted") {
                        updateSettings({ notifications: { ...settings.notifications, master: true } });
                      }
                    } else {
                      updateSettings({ notifications: { ...settings.notifications, master: checked } });
                    }
                  }} 
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-pomodoro" className="text-sm font-normal text-ink">Pomodoro session alerts</Label>
                  <Switch 
                    id="notif-pomodoro"
                    disabled={!settings.notifications.master}
                    checked={settings.notifications.pomodoro} 
                    onCheckedChange={(c) => updateSettings({ notifications: { ...settings.notifications, pomodoro: c } })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-reminders" className="text-sm font-normal text-ink">Time-based reminders</Label>
                  <Switch 
                    id="notif-reminders"
                    disabled={!settings.notifications.master}
                    checked={settings.notifications.reminders} 
                    onCheckedChange={(c) => updateSettings({ notifications: { ...settings.notifications, reminders: c } })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-habits" className="text-sm font-normal text-ink">Habit nudges</Label>
                  <Switch 
                    id="notif-habits"
                    disabled={!settings.notifications.master}
                    checked={settings.notifications.habits} 
                    onCheckedChange={(c) => updateSettings({ notifications: { ...settings.notifications, habits: c } })} 
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
