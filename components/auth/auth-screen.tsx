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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F0E8] p-4">
      <div className="w-full max-w-md bg-[#FDFAF4] rounded-[6px] p-8 sm:p-10 border border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] relative">
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="badge-sendlinks">SECURE ACCESS</span>
            <span className="text-xs font-mono text-[#8A7F72]">BASE OS</span>
          </div>
          <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[#8A7F72] mt-1.5 text-xs font-sans">
            {isLogin ? "Enter your details to access your dashboard." : "Set up your workspace and get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-[#FF4D00]/10 text-[#FF4D00] p-3 rounded-[4px] text-xs font-mono border border-[#FF4D00]/30">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[4px] px-3.5 py-2.5 text-[#1A1A1A] text-sm font-sans outline-none focus:ring-2 focus:ring-[#FFE14D] transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[4px] px-3.5 py-2.5 text-[#1A1A1A] text-sm font-sans outline-none focus:ring-2 focus:ring-[#FFE14D] transition-all"
              placeholder="jane@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[4px] px-3.5 py-2.5 text-[#1A1A1A] text-sm font-sans outline-none focus:ring-2 focus:ring-[#FFE14D] transition-all"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[4px] px-3.5 py-2.5 text-[#1A1A1A] text-sm font-sans outline-none focus:ring-2 focus:ring-[#FFE14D] transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-[#FF4D00] text-white font-medium rounded-[4px] py-3 px-4 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:bg-[#E04400] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              isLogin ? "Sign In →" : "Create Account →"
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-[#1A1A1A]/10">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            disabled={loading}
            className="text-xs font-mono uppercase tracking-wider text-[#8A7F72] hover:text-[#1A1A1A] transition-colors"
          >
            {isLogin ? "Don't have an account? Create account" : "Already have an account? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}
