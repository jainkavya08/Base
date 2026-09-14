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
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md bg-surface-dark rounded-3xl p-8 sm:p-10 shadow-2xl shadow-ink/10 relative overflow-hidden">
        
        {/* Subtle gold accent decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-yellow"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-canvas tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-canvas/60 mt-2 text-sm">
            {isLogin ? "Enter your details to access your dashboard." : "Set up your workspace and get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-xl text-sm font-medium border border-accent-coral/20">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-canvas/80 text-sm font-medium pl-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-ink border-2 border-ink focus:border-accent-yellow rounded-xl px-4 py-3 text-canvas outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-canvas/80 text-sm font-medium pl-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-ink border-2 border-ink focus:border-accent-yellow rounded-xl px-4 py-3 text-canvas outline-none transition-colors"
              placeholder="jane@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-canvas/80 text-sm font-medium pl-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-ink border-2 border-ink focus:border-accent-yellow rounded-xl px-4 py-3 text-canvas outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-canvas/80 text-sm font-medium pl-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-ink border-2 border-ink focus:border-accent-yellow rounded-xl px-4 py-3 text-canvas outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 bg-accent-yellow text-ink font-semibold rounded-xl py-3.5 px-4 hover:bg-accent-yellow/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin"></span>
            ) : (
              isLogin ? "Login" : "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            disabled={loading}
            className="text-canvas/60 hover:text-accent-yellow text-sm font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Create account" : "Already have an account? Login"}
          </button>
        </div>

      </div>
    </div>
  );
}
