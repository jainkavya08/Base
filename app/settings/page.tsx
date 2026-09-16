"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/components/auth/auth-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, LayoutGrid, LogOut, Database, HardDrive, Server, ExternalLink, Palette } from "lucide-react";
import { fetchApi, fetcher } from "@/lib/api";
import useSWR from "swr";

export default function SettingsPage() {
  const { settings, updateSettings, resetWidgetLayout } = useAppStore();
  const { user, logout, refreshSession } = useAuth();
  
  const [profileName, setProfileName] = useState(settings?.profile?.name || user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!profileName || profileName === user?.name) return;
    setIsSaving(true);
    try {
      await fetchApi('/api/auth/profile.php', {
        method: 'POST',
        body: JSON.stringify({ name: profileName })
      });
      updateSettings({ profile: { ...settings.profile, name: profileName } });
      await refreshSession(); // Revalidate auth session
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to update profile name.");
    } finally {
      setIsSaving(false);
    }
  };

  const { data: hostingStats, error: hostingError, isLoading: hostingLoading } = useSWR(
    user ? '/api/settings/hosting-stats.php' : null, 
    fetcher
  );

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-medium text-ink">Settings</h1>
        <p className="text-ink-muted mt-1">Manage your dashboard preferences and data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Column */}
        <div className="flex flex-col gap-10">
          
          {/* Account Profile */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Account</h2>
            <div className="flex flex-col gap-4 bg-surface-card p-5 rounded-2xl border border-border/50">
              {user ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-ink-muted">Logged in as</span>
                    <span className="text-lg font-medium text-ink">{user.name}</span>
                    <span className="text-sm text-ink-muted">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={logout} 
                    className="w-full text-accent-coral border-accent-coral/20 hover:bg-accent-coral/10 hover:text-accent-coral mt-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <div className="text-sm text-ink-muted">Not logged in.</div>
              )}
            </div>
          </section>

          {/* Account & Data */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Account Profile</h2>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="name" className="text-ink">Display Name</Label>
              <div className="flex gap-2 max-w-sm">
                <Input 
                  id="name"
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-canvas border-border text-ink"
                />
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving || profileName === user?.name}
                  className="bg-accent-blue text-white hover:bg-accent-blue/90"
                >
                  Save
                </Button>
              </div>
              <p className="text-sm text-ink-muted">Mainly used for personalized greetings.</p>
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
                  <li>Migrated completely to MySQL single-source of truth.</li>
                  <li>Removed old local browser storage.</li>
                  <li>Improved multi-device synchronization.</li>
                  <li>Enhanced Pomodoro and Finance sections.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Hosting & Storage */}
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-medium text-ink pb-2 border-b border-border">Hosting & Storage</h2>
              <p className="text-sm text-ink-muted mt-2">Monitor your Base application storage and hosting resources.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Application Storage Card */}
              <div className="bg-surface-card p-5 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Application Storage</h3>
                    <p className="text-sm text-ink-muted">Data owned by you</p>
                  </div>
                </div>

                {hostingLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-canvas rounded w-1/2"></div>
                    <div className="h-4 bg-canvas rounded w-2/3"></div>
                    <div className="h-4 bg-canvas rounded w-1/3"></div>
                  </div>
                ) : hostingError ? (
                  <div className="text-sm text-accent-coral">
                    Unable to load storage information.
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-2 h-6 text-xs text-accent-coral">Retry</Button>
                  </div>
                ) : hostingStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Files</span>
                      <span className="text-lg font-medium text-ink">{hostingStats.files?.count || 0} files</span>
                      <span className="text-xs text-ink-muted">File storage: Not available</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Database</span>
                      <span className="text-lg font-medium text-ink">{hostingStats.database?.tables || 0} tables</span>
                      <span className="text-xs text-ink-muted">{hostingStats.database?.size_mb ? `${hostingStats.database.size_mb} MB` : 'Size unavailable'}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 mt-2 pt-2 border-t border-border">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Records</span>
                      <span className="text-lg font-medium text-ink">{hostingStats.database?.user_records?.toLocaleString() || 0} records</span>
                      <span className="text-xs text-ink-muted">Data points stored for your account</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* InfinityFree Hosting Card */}
              <div className="bg-surface-card p-5 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">InfinityFree Hosting</h3>
                    <p className="text-sm text-ink-muted">base.rf.gd</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status</span>
                    <span className="text-sm font-medium text-ink flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Daily Hits</span>
                    <span className="text-sm font-medium text-ink">Available in InfinityFree</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Hosting Storage</span>
                    <span className="text-sm font-medium text-ink">Available in InfinityFree</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Base statistics: Updated just now</span>
                  <a 
                    href="https://app.infinityfree.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2"
                  >
                    View Hosting Statistics <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-ink">Accent Color</h3>
                  <p className="text-sm text-ink-muted">Customize the primary color theme</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['default', 'Gold', 'Amber', 'Blue', 'Green', 'Purple', 'Red', 'Ocean'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${settings.accentColor === color || (!settings.accentColor && color === 'default') ? 'border-ink scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{
                      backgroundColor: color === 'default' ? '#F4C94C' : // Base's default
                        color === 'Gold' ? '#F4C94C' :
                        color === 'Amber' ? '#f59e0b' :
                        color === 'Blue' ? '#3b82f6' :
                        color === 'Green' ? '#10b981' :
                        color === 'Purple' ? '#8b5cf6' :
                        color === 'Ocean' ? '#33648b' :
                        '#ef4444' // Red
                    }}
                    title={color === 'default' ? 'Default' : color}
                  />
                ))}
              </div>
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
