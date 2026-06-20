import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Key, Sliders, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function UserSettingsPage() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [density, setDensity] = useState("comfortable");
  const [theme, setTheme] = useState("dark");
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile settings updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || !confirmPass) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>User Settings</h1>
        <p className="text-text-secondary text-sm">Configure your personal preferences, profile settings, and API authentication parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation / Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-primary border border-border rounded-lg p-5 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-3xl text-accent capitalize shrink-0 overflow-hidden mb-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <h2 className="text-lg font-bold text-text-primary capitalize">{user.name}</h2>
            <p className="text-xs text-text-muted capitalize mb-1">{user.role}</p>
            <p className="text-xs text-text-secondary font-mono">{user.email || "No Email"}</p>
          </div>
        </div>

        {/* Configurations Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Spacing & Themes */}
          <div className="bg-surface-primary border border-border rounded-lg p-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" /> Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">Layout Density</Label>
                <Select value={density} onValueChange={setDensity}>
                  <SelectTrigger className="bg-surface-secondary border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-primary border-border">
                    <SelectItem value="compact">Compact (Dense margins)</SelectItem>
                    <SelectItem value="comfortable">Comfortable (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">Visual Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-surface-secondary border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-primary border-border">
                    <SelectItem value="dark">Dark Theme (Site Manager Default)</SelectItem>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="system">System Settings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-surface-primary border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> Profile Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">Display Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-surface-secondary border-border text-text-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">Email Address</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-surface-secondary border-border text-text-primary" />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent-hover text-white">Save Profile</Button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-surface-primary border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-accent" /> Security & Password
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">New Password</Label>
                <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" className="bg-surface-secondary border-border text-text-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-xs">Confirm New Password</Label>
                <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" className="bg-surface-secondary border-border text-text-primary" />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent-hover text-white">Update Password</Button>
          </form>

          {/* API Access Tokens */}
          <div className="bg-surface-primary border border-border rounded-lg p-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" /> API Tokens
            </h3>
            <p className="text-xs text-text-secondary mb-4">You can use your active session token for scripting or executing commands via curl.</p>
            <div className="bg-surface-secondary border border-border p-3 rounded-md flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted select-none">Active Session Token:</span>
              <span className="text-xs font-mono text-accent select-all">sitemanager-session-active-token</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
