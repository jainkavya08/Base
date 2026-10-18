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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto h-full flex flex-col gap-8 pb-24 md:pb-8">
      <div className="pb-2 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-sendlinks">SYSTEM</span>
          <span className="text-xs font-mono text-[#8A7F72]">PREFERENCES</span>
        </div>
        <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">Settings</h1>
        <p className="text-sm font-sans text-[#8A7F72] mt-0.5">Manage your dashboard preferences and data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          
          {/* Account Profile */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">Account</h2>
            <div className="flex flex-col gap-4 bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
              {user ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider">Logged in as</span>
                    <span className="text-base font-medium text-[#1A1A1A]">{user.name}</span>
                    <span className="text-xs font-mono text-[#8A7F72]">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={logout} 
                    className="w-full text-[#FF4D00] border-[#1A1A1A] hover:bg-[#FF4D00]/10 hover:text-[#FF4D00] mt-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <div className="text-xs font-mono text-[#8A7F72]">Not logged in.</div>
              )}
            </div>
          </section>

          {/* Account & Data */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">Account Profile</h2>
            
            <div className="flex flex-col gap-3 bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
              <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[#8A7F72]">Display Name</Label>
              <div className="flex gap-2">
                <Input 
                  id="name"
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A] text-sm"
                />
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving || profileName === user?.name}
                  variant="cta"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs font-sans text-[#8A7F72]">Mainly used for personalized greetings.</p>
            </div>
          </section>

          {/* About */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">About</h2>
            <div className="bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-sendlinks">SYSTEM</span>
              </div>
              <h3 className="font-serif italic font-normal text-lg text-[#1A1A1A]">Personal Productivity Dashboard</h3>
              <p className="text-xs font-mono text-[#8A7F72] mt-0.5">Version 1.0.0 • Sendlinks Aesthetic Engine</p>
              
              <div className="mt-3.5 pt-3.5 border-t border-[#1A1A1A]/10">
                <p className="text-xs font-mono text-[#1A1A1A] font-medium mb-1.5 uppercase tracking-wider">Recent Changes:</p>
                <ul className="list-disc list-inside text-xs font-sans text-[#8A7F72] space-y-1">
                  <li>Migrated to full sendlinks tactile design system.</li>
                  <li>Hard-offset color-blocked shadows and ink borders.</li>
                  <li>Instrument Serif and DM Sans high-contrast typography.</li>
                  <li>Integrated personal hub with instant reactivity.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Hosting & Storage */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">Hosting & Storage</h2>
              <p className="text-xs font-sans text-[#8A7F72] mt-1">Monitor your Base application storage and hosting resources.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Application Storage Card */}
              <div className="bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#1A1A1A]">Application Storage</h3>
                    <p className="text-xs font-mono text-[#8A7F72]">Data owned by you</p>
                  </div>
                </div>

                {hostingLoading ? (
                  <div className="animate-pulse space-y-3 font-mono text-xs">
                    <div className="h-4 bg-[#F5F0E8] rounded w-1/2"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded w-2/3"></div>
                  </div>
                ) : hostingError ? (
                  <div className="text-xs font-mono text-[#FF4D00]">
                    Unable to load storage information.
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-2 h-6 text-xs text-[#FF4D00]">Retry</Button>
                  </div>
                ) : hostingStats ? (
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Files</span>
                      <span className="text-base font-medium text-[#1A1A1A]">{hostingStats.files?.count || 0} files</span>
                      <span className="text-[10px] text-[#8A7F72]">File storage: Not available</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Database</span>
                      <span className="text-base font-medium text-[#1A1A1A]">{hostingStats.database?.tables || 0} tables</span>
                      <span className="text-[10px] text-[#8A7F72]">{hostingStats.database?.size_mb ? `${hostingStats.database.size_mb} MB` : 'Size unavailable'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-[#1A1A1A]/10">
                      <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Records</span>
                      <span className="text-base font-medium text-[#1A1A1A]">{hostingStats.database?.user_records?.toLocaleString() || 0} records</span>
                      <span className="text-[10px] text-[#8A7F72]">Data points stored for your account</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* InfinityFree Hosting Card */}
              <div className="bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#1A1A1A]">Production Hosting</h3>
                    <p className="text-xs font-mono text-[#8A7F72]">base.rf.gd</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Status</span>
                    <span className="text-xs font-medium text-[#1A1A1A] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1A1A1A]"></span> Online
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Daily Hits</span>
                    <span className="text-xs text-[#1A1A1A]">Available in InfinityFree</span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[10px] text-[#8A7F72] uppercase tracking-wider">Hosting Storage</span>
                    <span className="text-xs text-[#1A1A1A]">Available in InfinityFree</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-[#8A7F72]">Base statistics: Updated live</span>
                  <a 
                    href="https://app.infinityfree.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[4px] text-xs font-mono font-medium transition-transform active:translate-x-[1px] active:translate-y-[1px] border border-[#1A1A1A] bg-[#FDFAF4] hover:bg-[#FFE14D] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] h-8 px-3"
                  >
                    View Hosting Statistics <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          
          {/* Appearance */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">Appearance</h2>
            
            <div className="flex items-center justify-between bg-[#FDFAF4] p-4 rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]">
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#1A1A1A]">Dark Mode</h3>
                  <p className="text-xs text-[#8A7F72]">Toggle application theme</p>
                </div>
              </div>
              <Switch 
                checked={settings.theme === 'dark'} 
                onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })} 
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FDFAF4] p-4 rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#1A1A1A]">Accent Color</h3>
                  <p className="text-xs text-[#8A7F72]">Customize the primary color theme</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['default', 'Gold', 'Amber', 'Blue', 'Green', 'Purple', 'Red', 'Ocean'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className={`w-6 h-6 rounded-[3px] border border-[#1A1A1A] transition-transform ${settings.accentColor === color || (!settings.accentColor && color === 'default') ? 'scale-125 shadow-[2px_2px_0px_0px_#1A1A1A]' : 'hover:scale-110'}`}
                    style={{
                      backgroundColor: color === 'default' ? '#FFE14D' : 
                        color === 'Gold' ? '#FFE14D' :
                        color === 'Amber' ? '#FF4D00' :
                        color === 'Blue' ? '#3b82f6' :
                        color === 'Green' ? '#10b981' :
                        color === 'Purple' ? '#8b5cf6' :
                        color === 'Ocean' ? '#33648b' :
                        '#ef4444'
                    }}
                    title={color === 'default' ? 'Default' : color}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#FDFAF4] p-4 rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#1A1A1A]">Reset Dashboard Layout</h3>
                  <p className="text-xs text-[#8A7F72]">Restore default widget order & sizes</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { resetWidgetLayout(); alert('Layout reset!'); }}>
                Reset
              </Button>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif italic font-normal text-xl text-[#1A1A1A] pb-1 border-b border-[#1A1A1A]/10">Notifications</h2>
            
            <div className="flex flex-col gap-3 bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10">
                <div>
                  <h3 className="font-medium text-sm text-[#1A1A1A]">Master Notifications</h3>
                  <p className="text-xs text-[#8A7F72]">Enable browser notifications</p>
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

              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-pomodoro" className="text-xs font-mono text-[#1A1A1A]">Pomodoro session alerts</Label>
                  <Switch 
                    id="notif-pomodoro"
                    disabled={!settings.notifications.master}
                    checked={settings.notifications.pomodoro} 
                    onCheckedChange={(c) => updateSettings({ notifications: { ...settings.notifications, pomodoro: c } })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-reminders" className="text-xs font-mono text-[#1A1A1A]">Time-based reminders</Label>
                  <Switch 
                    id="notif-reminders"
                    disabled={!settings.notifications.master}
                    checked={settings.notifications.reminders} 
                    onCheckedChange={(c) => updateSettings({ notifications: { ...settings.notifications, reminders: c } })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-habits" className="text-xs font-mono text-[#1A1A1A]">Habit nudges</Label>
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
