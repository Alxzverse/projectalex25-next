"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Flame,
  ArrowRight,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
  Brain,
  Dumbbell,
  Hammer,
  Coins,
  Heart,
  Check,
  Sparkles,
  Play,
  BarChart3,
  NotebookPen,
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";

const pillars = [
  { id: "Mind", icon: Brain, label: "Mind", desc: "Cognitive endurance, mental models, and ruthless focus architecture.", color: "from-violet-500 to-indigo-600" },
  { id: "Body", icon: Dumbbell, label: "Body", desc: "Hybrid strength, VO2 max, and daily physical sovereignty.", color: "from-emerald-400 to-teal-600" },
  { id: "Craft", icon: Hammer, label: "Craft", desc: "Deep work, shipping, and compounding technical mastery.", color: "from-amber-400 to-orange-600" },
  { id: "Wealth", icon: Coins, label: "Wealth", desc: "Capital allocation, leverage, and freedom engineering.", color: "from-yellow-300 to-amber-500" },
  { id: "Spirit", icon: Heart, label: "Spirit", desc: "Stoic stillness, gratitude, and intentional presence.", color: "from-sky-400 to-blue-600" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-amber-500/30 overflow-x-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-amber-500/[0.07] rounded-full blur-[180px]" />
        <div className="absolute top-[40%] -right-[20%] w-[800px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[150px]" />
        <div className="absolute top-[80%] -left-[20%] w-[800px] h-[600px] bg-emerald-600/[0.05] rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      </div>

      {/* Nav */}
      <header className={`fixed top-0 w-full z-50 transition-all ${scrolled ? "bg-[#07080c]/80 backdrop-blur-xl border-b border-zinc-800/80" : "bg-transparent border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-[15px]">PROJECT<span className="text-amber-400">ALEX25</span></span>
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 -mt-1">EVOLUTION OS v2.0</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#pillars" className="hover:text-white transition">5 Pillars</a>
            <a href="#protocols" className="hover:text-white transition">Protocols</a>
            <a href="#arena" className="hover:text-white transition">The Arena</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm text-zinc-300 hover:text-white px-4 py-2 transition">
              Sign In
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300">342 architects currently in Protocol 25 • Live on Vercel</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[10px]">NEW</span>
            </div>
            <h1 className="text-[42px] sm:text-[64px] md:text-[84px] font-black tracking-[-0.04em] leading-[0.9] mb-6">
              ARCHITECT <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">YOUR NEXT</span><br />
              EVOLUTION
            </h1>
            <p className="text-[18px] sm:text-[20px] leading-relaxed text-zinc-400 max-w-2xl mb-8">
              The high-performance operating system for sovereign individuals. Track 5 pillars, execute 25-day protocols, log deep work, journal stoic reflections, and compound daily wins with a global arena.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-[15px] shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition">
                <Zap className="w-5 h-5" /> Enter Protocol 25 Free
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-white font-semibold text-[15px] hover:bg-zinc-800 transition">
                <Play className="w-4 h-4" /> Watch Demo • 1-Click Login
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> No credit card • Full access</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-400" /> Built for Vercel • Global edge</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-zinc-400" /> For everyone, not just elite</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="rounded-[24px] border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="h-12 border-b border-zinc-800 flex items-center px-6 gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
                <div className="ml-6 text-xs text-zinc-500 font-mono">projectalex25.app/dashboard • Lvl 12 • 5,840 XP • 18 Day Streak</div>
                <div className="ml-auto flex items-center gap-3 text-[11px] text-zinc-500"><BarChart3 className="w-4 h-4" /> Command Center</div>
              </div>
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-12 lg:col-span-8 p-6 border-r border-zinc-800">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4"><div className="text-[11px] text-zinc-500 uppercase tracking-wider">Deep Work Today</div><div className="text-2xl font-bold mt-1">2h 34m <span className="text-sm text-emerald-400">+42%</span></div></div>
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4"><div className="text-[11px] text-zinc-500 uppercase tracking-wider">Habit Completion</div><div className="text-2xl font-bold mt-1">86% <span className="text-sm text-amber-400">7/8 habits</span></div></div>
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4"><div className="text-[11px] text-zinc-500 uppercase tracking-wider">Protocol 25 Progress</div><div className="text-2xl font-bold mt-1">18/25 <span className="text-sm text-zinc-400">days</span></div></div>
                  </div>
                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5">
                    <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-amber-400" /> Habit Matrix — Today</h3><span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live Tracking</span></div>
                    <div className="space-y-2">
                      {[
                        { name: "90-Min Deep Work Block", pillar: "Craft", done: true },
                        { name: "Heavy Hypertrophy / Zone-2", pillar: "Body", done: true },
                        { name: "30 Pages High-Signal Reading", pillar: "Mind", done: false },
                        { name: "Stoic Evening Audit", pillar: "Spirit", done: true },
                      ].map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                          <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.done ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>{h.done ? <Check className="w-4 h-4" /> : <Timer className="w-4 h-4" />}</div><div><div className="text-sm font-medium">{h.name}</div><div className="text-[11px] text-zinc-500">{h.pillar} • +50 XP</div></div></div>
                          <div className={`w-2 h-2 rounded-full ${h.done ? "bg-emerald-400" : "bg-zinc-700"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 p-6 space-y-4 bg-zinc-950/50">
                  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4"><div className="text-xs text-zinc-400 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Leaderboard • Top Architects</div><div className="space-y-2">{[{n:"Elena Vance", lvl:13, xp:6450},{n:"Alex Mercer", lvl:12, xp:5840},{n:"Marcus Thorne", lvl:10, xp:4920}].map((u,i)=>(<div key={i} className="flex items-center gap-3 text-sm"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-[10px] font-bold text-black">{i+1}</div><div className="flex-1"><div className="font-medium">{u.n}</div><div className="text-[11px] text-zinc-500">Lvl {u.lvl} • {u.xp} XP</div></div></div>))}</div></div>
                  <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-4"><div className="text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Deep Work Studio</div><div className="mt-3 text-3xl font-mono font-bold tracking-widest">25:00</div><div className="text-[11px] text-zinc-400 mt-1">Focus Block • Craft Pillar • +100 XP</div><div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full w-[68%] bg-gradient-to-r from-amber-400 to-orange-500" /></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="relative py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><div className="text-xs tracking-[0.2em] text-amber-400 mb-3">THE 5 PILLARS ARCHITECTURE</div><h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95]">BALANCED GROWTH<br />IS SOVEREIGN GROWTH</h2></div>
            <p className="text-zinc-400 max-w-md text-[15px] leading-relaxed">Most apps track one dimension. ProjectAlex25 tracks the whole human: Mind, Body, Craft, Wealth, and Spirit — so progress in one compounds into all.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {pillars.map((p) => (
              <div key={p.id} className="group rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 hover:border-zinc-700 transition backdrop-blur">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg`}><p.icon className="w-6 h-6 text-black" /></div>
                <div className="font-bold text-sm tracking-wide mb-2">{p.label}</div>
                <div className="text-xs text-zinc-400 leading-relaxed">{p.desc}</div>
                <div className="mt-4 h-1 rounded-full bg-zinc-800 overflow-hidden"><div className={`h-full w-[70%] bg-gradient-to-r ${p.color}`} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols */}
      <section id="protocols" className="relative py-24 px-6 bg-zinc-950/50 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4"><Zap className="w-3.5 h-3.5" /> SIGNATURE PROTOCOLS</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">25-DAY SPRINTS THAT REWIRE YOUR BASELINE</h2>
            <p className="text-zinc-400 leading-relaxed mb-8">Protocol 25, Monk Mode, Kinetic Temple, and Sovereign Reset. Each protocol has daily rules, XP rewards, community accountability, and a completion badge that compounds your identity.</p>
            <div className="space-y-4">
              {[
                { title: "Protocol 25: Core Evolution", days: "25 Days • 342 architects", xp: "+1,250 XP" },
                { title: "Monk Mode: Deep Craft Sprint", days: "30 Days • 218 architects", xp: "+1,800 XP" },
                { title: "Kinetic Temple: Hybrid Conditioning", days: "25 Days • 189 architects", xp: "+1,100 XP" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800"><div><div className="font-semibold text-sm">{c.title}</div><div className="text-xs text-zinc-500">{c.days}</div></div><div className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">{c.xp}</div></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6"><h3 className="font-semibold flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-amber-400" /> What you get inside</h3><div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><Timer className="w-5 h-5 text-amber-400 mb-2" /> Deep Work Timer with XP & Pillar tracking</div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><Target className="w-5 h-5 text-emerald-400 mb-2" /> Habit Matrix with streaks & weekly targets</div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><NotebookPen className="w-5 h-5 text-violet-400 mb-2" /> Stoic Journal with mood & energy analytics</div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><Trophy className="w-5 h-5 text-yellow-400 mb-2" /> Leaderboard & The Arena community feed</div>
            </div></div>
            <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-black" /></div><div><div className="font-bold">Average +2.4h daily deep work after 14 days</div><div className="text-xs text-zinc-500 mt-1">Measured across 560+ logged focus sessions inside the platform.</div></div></div>
          </div>
        </div>
      </section>

      {/* Arena */}
      <section id="arena" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16"><h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">JOIN THE ARENA. BUILD IN PUBLIC.</h2><p className="text-zinc-400">Your wins fuel others. Your streaks keep you accountable. Share protocols, ship logs, and breakthroughs with architects worldwide.</p></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Elena Vance", handle: "elena_vanguard", content: "Day 24 of Protocol 25 locked. 2.5h quant modeling before sunrise + 10K tempo. Remove negotiation, double output.", tag: "Protocol" },
              { name: "Marcus Thorne", handle: "marcus_stoic", content: "15-day unbroken streak on Heavy Conditioning + Stoic Audit. Small daily disciplines compound into unrecognizable transformation.", tag: "Streak" },
              { name: "Alex Mercer", handle: "alex25", content: "Welcome to ProjectAlex25 v2.0 — built for everyone. Track 5 Pillars, lock 25-day protocols, and compound daily wins together.", tag: "Milestone" },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6"><div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600" /><div><div className="text-sm font-semibold">{p.name}</div><div className="text-xs text-zinc-500">@{p.handle}</div></div><span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{p.tag}</span></div><p className="text-sm text-zinc-300 leading-relaxed">{p.content}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-[1px]">
          <div className="rounded-[31px] bg-[#0c0c0f] px-8 md:px-14 py-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6"><Sparkles className="w-3.5 h-3.5" /> BUILT FOR VERCEL • READY TO DEPLOY</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">READY TO ENTER<br />PROTOCOL 25?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-10">Create your free account in 20 seconds. Get starter habits, goals, journaling, deep work studio, and instant Arena access. No credit card required. 1-click demo available.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-[15px] hover:bg-zinc-200 transition"><Zap className="w-5 h-5" /> Create Free Account • +150 XP</Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-white font-semibold hover:bg-zinc-800 transition">Sign In with Demo Account</Link>
            </div>
            <div className="mt-8 text-xs text-zinc-500">Deployed on Vercel • Next.js 15 • Full-stack with JWT auth, habit engine, and community arena</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"><Flame className="w-4 h-4 text-black fill-black" /></div><span>PROJECTALEX25 © {new Date().getFullYear()} • High-Performance Personal Growth OS</span></div>
          <div className="flex items-center gap-6"><Link href="/login" className="hover:text-zinc-300">Login</Link><Link href="/register" className="hover:text-zinc-300">Register</Link><a href="https://vercel.com" target="_blank" className="hover:text-zinc-300">Deploy on Vercel ▲</a></div>
        </div>
      </footer>
    </div>
  );
}
