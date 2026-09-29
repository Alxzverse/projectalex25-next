"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Pillar } from "@/lib/types";

const PILLARS: { id: Pillar; label: string; desc: string }[] = [
  { id: "Mind", label: "Mind", desc: "Cognition, Mental Models & Focus" },
  { id: "Body", label: "Body", desc: "Strength, VO2 Max & Vitality" },
  { id: "Craft", label: "Craft", desc: "Deep Work, Building & Mastery" },
  { id: "Wealth", label: "Wealth", desc: "Capital, Leverage & Autonomy" },
  { id: "Spirit", label: "Spirit", desc: "Stoicism, Stillness & Purpose" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primaryPillar, setPrimaryPillar] = useState<Pillar>("Craft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, primaryPillar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError("");
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Failed to start demo session.");
        setDemoLoading(false);
      }
    } catch {
      setError("Network error.");
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] bg-grid-pattern flex flex-col justify-between relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[130px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white">
              PROJECT<span className="text-amber-400">ALEX25</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">
              Evolution OS
            </span>
          </div>
        </Link>
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-white transition"
        >
          Already a member?{" "}
          <span className="text-amber-400 font-medium">Sign In →</span>
        </Link>
      </header>

      {/* Main Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Free Global Membership •
              +150 Starter XP
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Initialize Your Evolution
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create your personal ProjectAlex25 account. Includes starter
              habits, 25-day roadmap, and full Arena access.
            </p>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="w-full mb-5 py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-amber-300 font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
            <span>Want to explore first? Launch 1-Click Demo Account</span>
          </button>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name or Alias
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Select Your Primary Growth Pillar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PILLARS.map((p) => {
                  const selected = primaryPillar === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrimaryPillar(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selected
                          ? "bg-amber-500/15 border-amber-500/60 text-white"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{p.label}</span>
                        {selected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Enter Protocol 25</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-zinc-600">
        ProjectAlex25 • Built for Sovereign Personal Growth
      </footer>
    </div>
  );
}
