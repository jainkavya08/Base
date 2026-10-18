"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch("/api/auth/login.php", {
          method: "POST",
          credentials: 'same-origin',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          onAuthenticated();
        } else {
          setError(data.error || "Login failed");
        }
      } else {
        const res = await fetch("/api/auth/register.php", {
          method: "POST",
          credentials: 'same-origin',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          onAuthenticated();
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-canvas text-ink">
      {/* Left: Atmospheric Architectural Desk Visual with Curated Artwork */}
      <div className="lg:w-1/2 relative bg-surface-dark flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[420px] lg:min-h-screen">
        {/* Curated real artwork background from Met / AIC collections */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/design-for-a-bookcase-with-writing-desk.jpg"
          alt="16th-century architectural drawing of a classical writing desk and bookcase"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity filter contrast-125"
        />
        
        {/* Top Wordmark & Orientation */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 bg-accent-yellow rounded-full inline-block" />
            <span className="text-xl font-medium tracking-tight text-canvas">Base</span>
          </div>
          <span className="text-xs text-canvas/70 font-medium">Stationery № 01</span>
        </div>

        {/* Center / Bottom Atmospheric Statement */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-canvas leading-[1.05] tracking-tight">
            Order for the day.<br />
            Peace for the mind.
          </h2>
          <p className="text-canvas/70 mt-4 text-base sm:text-lg max-w-md leading-relaxed">
            A quiet tactile desktop for your habits, focus sessions, daily ledger, and tasks. Local-first, private by craft.
          </p>

          <div className="mt-8 flex items-center gap-4 text-xs text-canvas/60">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow inline-block" />
              Local IndexedDB
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow inline-block" />
              Zero telemetry
            </span>
          </div>
        </div>

        {/* Footer Credit & Status */}
        <div className="relative z-10 pt-6">
          <p className="text-[13px] text-canvas/50 leading-relaxed">
            Desk drawing ca. 1550–70 via The Metropolitan Museum of Art (Open Access).
          </p>
        </div>
      </div>

      {/* Right: The Stationery Card (The Page is the Object) */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-canvas">
        <div 
          className="w-full max-w-md bg-surface-card rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-medium text-ink tracking-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-ink-muted text-sm leading-normal">
              {isLogin ? "Access your personal workspace and daily ledger." : "Initialize your local environment."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-ink text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-canvas rounded-xl px-4 py-3 text-ink outline-none transition-colors focus:ring-2 focus:ring-accent-yellow"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-ink text-sm font-medium">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-canvas rounded-xl px-4 py-3 text-ink outline-none transition-colors focus:ring-2 focus:ring-accent-yellow"
                placeholder="jane@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink text-sm font-medium">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-canvas rounded-xl px-4 py-3 text-ink outline-none transition-colors focus:ring-2 focus:ring-accent-yellow"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-ink text-sm font-medium">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-canvas rounded-xl px-4 py-3 text-ink outline-none transition-colors focus:ring-2 focus:ring-accent-yellow"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="mt-3 bg-accent-yellow text-ink font-medium rounded-xl py-3.5 px-4 hover:opacity-95 active:scale-[0.99] transition-transform disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              ) : (
                isLogin ? "Sign in to workspace" : "Create local account"
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={loading}
              className="text-ink-muted hover:text-ink text-sm font-medium transition-colors cursor-pointer"
            >
              {isLogin ? "Need a new workspace? Create account" : "Already configured? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
