"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Target,
  Trophy,
  Timer,
  NotebookPen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Check,
  Zap,
  Brain,
  Dumbbell,
  Hammer,
  Coins,
  Heart,
  ChevronRight,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Send,
  Heart as HeartIcon,
  MessageCircle,
  Calendar,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Layers,
  X,
} from "lucide-react";
import { cn, formatRelativeTime, getPillarAccent, getPillarColor } from "@/lib/utils";
import { Pillar, SafeUser, Habit, Goal, JournalEntry, FocusSession, ChallengeProtocol, CommunityPost } from "@/lib/types";

type Tab = "overview" | "habits" | "goals" | "focus" | "journal" | "protocols" | "arena" | "leaderboard" | "settings";

const pillarIcons: Record<Pillar, any> = {
  Mind: Brain,
  Body: Dumbbell,
  Craft: Hammer,
  Wealth: Coins,
  Spirit: Heart,
};

const tabs: { id: Tab; label: string; icon: any; desc: string }[] = [
  { id: "overview", label: "Command", icon: BarChart3, desc: "Overview" },
  { id: "habits", label: "Habit Matrix", icon: Target, desc: "Daily execution" },
  { id: "goals", label: "Goals", icon: Layers, desc: "Roadmaps" },
  { id: "focus", label: "Deep Work", icon: Timer, desc: "Focus studio" },
  { id: "journal", label: "Journal", icon: NotebookPen, desc: "Reflections" },
  { id: "protocols", label: "Protocols", icon: Zap, desc: "25-Day sprints" },
  { id: "arena", label: "The Arena", icon: Users, desc: "Community" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, desc: "Rankings" },
  { id: "settings", label: "Settings", icon: Settings, desc: "Profile" },
];

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<SafeUser | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [challenges, setChallenges] = useState<ChallengeProtocol[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pillarScores, setPillarScores] = useState<Record<Pillar, number>>({
    Mind: 50, Body: 50, Craft: 50, Wealth: 50, Spirit: 50
  });

  // Forms
  const [newHabit, setNewHabit] = useState({ title: "", description: "", pillar: "Craft" as Pillar, xpReward: 40, targetDaysPerWeek: 6 });
  const [newGoal, setNewGoal] = useState({ title: "", description: "", pillar: "Craft" as Pillar, priority: "High" as any, targetDate: "", milestones: "" });
  const [newJournal, setNewJournal] = useState({ title: "", winOfTheDay: "", lessonLearned: "", gratitude: "", content: "", pillar: "Mind" as Pillar, mood: 4, energy: 4 });
  const [newPost, setNewPost] = useState({ content: "", tag: "Win" as any });
  const [newChallenge, setNewChallenge] = useState({ title: "", subtitle: "", description: "", pillar: "Mind" as Pillar, difficulty: "Vanguard" as any, durationDays: 25, rules: "" });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Focus Timer
  const [focusTask, setFocusTask] = useState("Deep Work: Ship Flagship Feature");
  const [focusPillar, setFocusPillar] = useState<Pillar>("Craft");
  const [focusDuration, setFocusDuration] = useState(25);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [settingsForm, setSettingsForm] = useState({ name: "", handle: "", bio: "", primaryPillar: "Craft" as Pillar, dailyFocusTarget: 90, avatarColor: "", newPassword: "" });

  // Initial fetch
  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const data = await res.json();
      if (!data.authenticated) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setHabits(data.habits || []);
      setGoals(data.goals || []);
      setJournals(data.journals || []);
      setFocusSessions(data.focusSessions || []);
      setChallenges(data.challenges || []);
      setPosts(data.posts || []);
      setLeaderboard(data.leaderboard || []);
      setPillarScores(data.pillarScores || pillarScores);
      setSettingsForm({
        name: data.user.name,
        handle: data.user.handle,
        bio: data.user.bio,
        primaryPillar: data.user.primaryPillar,
        dailyFocusTarget: data.user.dailyFocusTarget,
        avatarColor: data.user.avatarColor,
        newPassword: "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Complete
            setTimerRunning(false);
            handleFocusComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    setTimerSeconds(focusDuration * 60);
  }, [focusDuration]);

  async function handleFocusComplete() {
    if (!focusTask.trim()) return;
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: focusTask, pillar: focusPillar, durationMinutes: focusDuration }),
      });
      const data = await res.json();
      if (res.ok) {
        setFocusSessions((prev) => [data.focusSession, ...prev]);
        setUser(data.user);
        // refresh dashboard to update scores
        const dash = await fetch("/api/dashboard").then(r => r.json());
        if (dash.pillarScores) setPillarScores(dash.pillarScores);
        if (dash.leaderboard) setLeaderboard(dash.leaderboard);
      }
    } catch {}
  }

  // Actions
  async function toggleHabit(habitId: string, date: string) {
    const res = await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date }),
    });
    const data = await res.json();
    if (res.ok) {
      setHabits((prev) => prev.map((h) => h.id === habitId ? data.habit : h));
      if (data.user) setUser(data.user);
      const dash = await fetch("/api/dashboard").then(r => r.json());
      if (dash.pillarScores) setPillarScores(dash.pillarScores);
      if (dash.leaderboard) setLeaderboard(dash.leaderboard);
    }
  }

  async function createHabit() {
    if (!newHabit.title.trim()) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHabit),
    });
    const data = await res.json();
    if (res.ok) {
      setHabits((prev) => [data.habit, ...prev]);
      setNewHabit({ title: "", description: "", pillar: "Craft", xpReward: 40, targetDaysPerWeek: 6 });
    }
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  async function createGoal() {
    if (!newGoal.title.trim()) return;
    const milestones = newGoal.milestones.split("\n").filter((m) => m.trim());
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newGoal, milestones, targetDate: newGoal.targetDate || new Date(Date.now() + 30*86400000).toISOString().split("T")[0] }),
    });
    const data = await res.json();
    if (res.ok) {
      setGoals((prev) => [data.goal, ...prev]);
      setNewGoal({ title: "", description: "", pillar: "Craft", priority: "High", targetDate: "", milestones: "" });
    }
  }

  async function toggleMilestone(goalId: string, milestoneId: string) {
    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, milestoneId }),
    });
    const data = await res.json();
    if (res.ok) {
      setGoals((prev) => prev.map((g) => g.id === goalId ? data.goal : g));
      if (data.user) setUser(data.user);
    }
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function createJournal() {
    if (!newJournal.winOfTheDay.trim() && !newJournal.content.trim() && !newJournal.lessonLearned.trim()) return;
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newJournal, tags: [newJournal.pillar, "Reflection"] }),
    });
    const data = await res.json();
    if (res.ok) {
      setJournals((prev) => [data.entry, ...prev]);
      if (data.user) setUser(data.user);
      setNewJournal({ title: "", winOfTheDay: "", lessonLearned: "", gratitude: "", content: "", pillar: "Mind", mood: 4, energy: 4 });
      const dash = await fetch("/api/dashboard").then(r => r.json());
      if (dash.pillarScores) setPillarScores(dash.pillarScores);
    }
  }

  async function createPost() {
    if (!newPost.content.trim()) return;
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "post", ...newPost }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts(data.posts);
      if (data.user) setUser(data.user);
      setNewPost({ content: "", tag: "Win" });
    }
  }

  async function likePost(postId: string) {
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", postId }),
    });
    const data = await res.json();
    if (res.ok) setPosts(data.posts);
  }

  async function commentPost(postId: string) {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts(data.posts);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  async function handleChallengeAction(challengeId: string, action: "join" | "toggleDay", dayNumber?: number) {
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, action, dayNumber }),
    });
    const data = await res.json();
    if (res.ok) {
      setChallenges(data.challenges);
      if (data.user) setUser(data.user);
    }
  }

  async function createCustomChallenge() {
    if (!newChallenge.title.trim()) return;
    const rules = newChallenge.rules.split("\n").filter((r) => r.trim());
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newChallenge, rules }),
    });
    const data = await res.json();
    if (res.ok) {
      setChallenges(data.challenges);
      if (data.user) setUser(data.user);
      setNewChallenge({ title: "", subtitle: "", description: "", pillar: "Mind", difficulty: "Vanguard", durationDays: 25, rules: "" });
    }
  }

  async function saveSettings() {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      alert("Profile updated successfully!");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center animate-pulse">
            <Flame className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="text-sm text-zinc-400">Loading your Command Center...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const todayISO = getTodayISO();
  const todayHabitsCompleted = habits.filter((h) => h.completedDates.includes(todayISO)).length;
  const totalFocusToday = focusSessions.filter((f) => new Date(f.completedAt).toISOString().split("T")[0] === todayISO).reduce((acc, f) => acc + f.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex">
      {/* Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-[280px] bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform duration-300 lg:translate-x-0", mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-zinc-900">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <div className="font-bold text-[13px] tracking-tight">PROJECT<span className="text-amber-400">ALEX25</span></div>
              <div className="text-[10px] tracking-widest text-zinc-500">EVOLUTION OS</div>
            </div>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-zinc-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-black font-bold text-sm", user.avatarColor)}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-xs text-zinc-500 truncate">@{user.handle} • Lvl {user.level}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400">{user.xp} XP</div>
                <div className="text-[10px] text-zinc-500">{user.streak}🔥 streak</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(user.xp % 500) / 5}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
              <span>Lvl {user.level}</span><span>{user.xp % 500}/500 XP to Lvl {user.level + 1}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition", active ? "bg-zinc-900 border border-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50")}
                >
                  <t.icon className={cn("w-4 h-4", active ? "text-amber-400" : "text-zinc-500")} />
                  <span className="font-medium">{t.label}</span>
                  <span className="ml-auto text-[10px] text-zinc-600">{t.desc}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-900 space-y-2">
          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-3">
            <div className="text-xs font-semibold flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Protocol 25 Progress</div>
            <div className="mt-2 flex items-center justify-between text-xs"><span className="text-zinc-400">18/25 days</span><span className="text-amber-300">72%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full w-[72%] bg-gradient-to-r from-amber-400 to-orange-500" /></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <div className="lg:hidden h-[64px] px-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800"><BarChart3 className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"><Flame className="w-4 h-4 text-black fill-black" /></div><span className="font-bold text-sm">PROJECT<span className="text-amber-400">ALEX25</span></span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-bold text-xs">{user.name.charAt(0)}</div>
        </div>

        <main className="flex-1 p-4 md:p-8 bg-[#07080c] bg-grid-pattern">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">COMMAND CENTER</h1>
                  <p className="text-sm text-zinc-400 mt-1">Welcome back, {user.name.split(" ")[0]}. {todayHabitsCompleted}/{habits.length} habits completed today • {totalFocusToday}m deep work logged.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live • {user.streak} day streak</div>
                  <button onClick={() => setActiveTab("focus")} className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 flex items-center gap-2"><Timer className="w-4 h-4" /> Start Focus</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5"><div className="text-[11px] uppercase tracking-wider text-zinc-500">Today&apos;s Completion</div><div className="text-2xl font-bold mt-2">{habits.length ? Math.round((todayHabitsCompleted / habits.length) * 100) : 0}%</div><div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${habits.length ? (todayHabitsCompleted / habits.length) * 100 : 0}%` }} /></div></div>
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5"><div className="text-[11px] uppercase tracking-wider text-zinc-500">Deep Work Today</div><div className="text-2xl font-bold mt-2">{totalFocusToday}m <span className="text-sm font-normal text-zinc-500">/ {user.dailyFocusTarget}m</span></div><div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, (totalFocusToday / user.dailyFocusTarget) * 100)}%` }} /></div></div>
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5"><div className="text-[11px] uppercase tracking-wider text-zinc-500">Total XP</div><div className="text-2xl font-bold mt-2">{user.xp.toLocaleString()} <span className="text-sm text-amber-400">Lvl {user.level}</span></div><div className="text-xs text-zinc-500 mt-1">{user.badges.length} badges earned</div></div>
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5"><div className="text-[11px] uppercase tracking-wider text-zinc-500">Active Goals</div><div className="text-2xl font-bold mt-2">{goals.filter((g) => g.status === "active").length}</div><div className="text-xs text-zinc-500 mt-1">{goals.filter((g) => g.status === "completed").length} completed • {goals.length} total</div></div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-5"><Target className="w-4 h-4 text-amber-400" /> 5-Pillar Mastery Scores</h3>
                  <div className="space-y-4">
                    {(Object.keys(pillarScores) as Pillar[]).map((pillar) => {
                      const Icon = pillarIcons[pillar];
                      const score = pillarScores[pillar];
                      return (
                        <div key={pillar} className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", getPillarColor(pillar))}><Icon className="w-5 h-5 text-black" /></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{pillar}</span><span className="text-xs text-zinc-400">{score}%</span></div>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className={cn("h-full bg-gradient-to-r transition-all", getPillarColor(pillar))} style={{ width: `${score}%` }} /></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Today&apos;s Habit Matrix</h3>
                    <div className="space-y-2">
                      {habits.slice(0, 5).map((h) => {
                        const done = h.completedDates.includes(todayISO);
                        return (
                          <button key={h.id} onClick={() => toggleHabit(h.id, todayISO)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl border text-left transition", done ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")}>
                            <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center", done ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-700")}><Check className="w-3.5 h-3.5" /></div>
                            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{h.title}</div><div className="text-[11px] text-zinc-500">{h.pillar} • {h.streak}🔥 • +{h.xpReward} XP</div></div>
                          </button>
                        );
                      })}
                      {habits.length === 0 && <div className="text-xs text-zinc-500 py-4 text-center">No habits yet. Create your first in Habit Matrix.</div>}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-5">
                    <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-sm flex items-center gap-2"><Timer className="w-4 h-4 text-amber-400" /> Deep Work Studio</h3><span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">LIVE</span></div>
                    <div className="text-3xl font-mono font-bold tracking-widest">{String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}</div>
                    <div className="text-xs text-zinc-400 mt-1 truncate">{focusTask} • {focusPillar}</div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setTimerRunning(!timerRunning)} className="flex-1 py-2 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2">{timerRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}</button>
                      <button onClick={() => { setTimerRunning(false); setTimerSeconds(focusDuration * 60); }} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400"><RotateCcw className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6"><h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-violet-400" /> Active Goals</h3><div className="space-y-3">{goals.slice(0, 3).map((g) => (<div key={g.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="flex items-center justify-between"><span className="text-sm font-medium truncate">{g.title}</span><span className={cn("text-[10px] px-2 py-0.5 rounded-full border", getPillarAccent(g.pillar))}>{g.pillar}</span></div><div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${g.progress}%` }} /></div><div className="mt-1 text-[11px] text-zinc-500">{g.progress}% • {g.milestones.filter((m) => m.completed).length}/{g.milestones.length} milestones</div></div>))}</div></div>
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6"><h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><NotebookPen className="w-4 h-4 text-sky-400" /> Recent Reflections</h3><div className="space-y-3">{journals.slice(0, 3).map((j) => (<div key={j.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-sm font-medium truncate">{j.title}</div><div className="text-xs text-zinc-400 mt-1 line-clamp-2">{j.winOfTheDay || j.content}</div><div className="mt-2 text-[10px] text-zinc-500">{formatRelativeTime(j.createdAt)} • {j.pillar}</div></div>))}{journals.length === 0 && <div className="text-xs text-zinc-500">No journal entries yet.</div>}</div></div>
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6"><h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Arena Feed</h3><div className="space-y-3">{posts.slice(0, 3).map((p) => (<div key={p.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="flex items-center gap-2"><div className={cn("w-6 h-6 rounded-full bg-gradient-to-br", p.authorAvatarColor)} /><span className="text-xs font-medium">{p.authorName}</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{p.tag}</span></div><div className="text-xs text-zinc-300 mt-2 line-clamp-2">{p.content}</div></div>))}</div></div>
              </div>
            </div>
          )}

          {/* Habits Tab */}
          {activeTab === "habits" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold tracking-tight">Habit Matrix</h1><p className="text-sm text-zinc-400">Daily execution across 5 pillars. Tap to toggle today&apos;s completion.</p></div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">{todayHabitsCompleted}/{habits.length} completed today • {Math.round(habits.length ? (todayHabitsCompleted / habits.length) * 100 : 0)}%</div>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                <h3 className="font-semibold text-sm mb-4">Create New Habit</h3>
                <div className="grid md:grid-cols-12 gap-3">
                  <input value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })} placeholder="Habit title (e.g. 90-Min Deep Work Block)" className="md:col-span-5 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500" />
                  <input value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} placeholder="Description / protocol" className="md:col-span-4 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500" />
                  <select value={newHabit.pillar} onChange={(e) => setNewHabit({ ...newHabit, pillar: e.target.value as Pillar })} className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">
                    {(["Mind", "Body", "Craft", "Wealth", "Spirit"] as Pillar[]).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={createHabit} className="md:col-span-1 py-2.5 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {habits.map((h) => {
                  const doneToday = h.completedDates.includes(todayISO);
                  const weeklyCount = h.completedDates.filter((d) => { const diff = (Date.now() - new Date(d).getTime()) / 86400000; return diff <= 7; }).length;
                  return (
                    <div key={h.id} className={cn("rounded-2xl border p-5 transition", doneToday ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/70 border-zinc-800")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <button onClick={() => toggleHabit(h.id, todayISO)} className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition", doneToday ? "bg-emerald-500 border-emerald-500 text-black" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700")}><Check className="w-5 h-5" /></button>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm flex items-center gap-2"><span className="truncate">{h.title}</span><span className={cn("text-[10px] px-2 py-0.5 rounded-full border shrink-0", getPillarAccent(h.pillar))}>{h.pillar}</span></div>
                            <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{h.description}</div>
                            <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-500"><span>{h.streak}🔥 streak</span><span>{weeklyCount}/{h.targetDaysPerWeek} this week</span><span>+{h.xpReward} XP</span></div>
                          </div>
                        </div>
                        <button onClick={() => deleteHabit(h.id)} className="p-2 text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-4 flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const date = new Date(); date.setDate(date.getDate() - (6 - i));
                          const iso = date.toISOString().split("T")[0];
                          const completed = h.completedDates.includes(iso);
                          return <div key={i} className={cn("flex-1 h-8 rounded-lg border flex flex-col items-center justify-center text-[10px]", completed ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-zinc-950 border-zinc-800 text-zinc-600")}><span>{date.toLocaleDateString("en-US", { weekday: "narrow" })}</span><div className={cn("w-1.5 h-1.5 rounded-full mt-1", completed ? "bg-emerald-400" : "bg-zinc-700")} /></div>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goals */}
          {activeTab === "goals" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Goals & Roadmaps</h1><div className="text-xs text-zinc-500">{goals.filter((g) => g.status === "active").length} active • {goals.filter((g) => g.status === "completed").length} completed</div></div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                <h3 className="font-semibold text-sm mb-4">Create New Goal</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Goal title" className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500" />
                  <select value={newGoal.pillar} onChange={(e) => setNewGoal({ ...newGoal, pillar: e.target.value as Pillar })} className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">
                    {(["Mind", "Body", "Craft", "Wealth", "Spirit"] as Pillar[]).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} placeholder="Description" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <select value={newGoal.priority} onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })} className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">
                    <option value="Core">Core • 1000 XP</option><option value="High">High • 750 XP</option><option value="Medium">Medium • 500 XP</option>
                  </select>
                  <textarea value={newGoal.milestones} onChange={(e) => setNewGoal({ ...newGoal, milestones: e.target.value })} placeholder="Milestones (one per line)" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[70px]" />
                  <button onClick={createGoal} className="md:col-span-2 py-2.5 rounded-xl bg-white text-black font-semibold text-sm">Create Goal Roadmap</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <div key={g.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="font-semibold text-sm flex items-center gap-2">{g.title}<span className={cn("text-[10px] px-2 py-0.5 rounded-full border", getPillarAccent(g.pillar))}>{g.pillar}</span><span className={cn("text-[10px] px-2 py-0.5 rounded-full", g.priority === "Core" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : g.priority === "High" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700")}>{g.priority}</span></div><div className="text-xs text-zinc-400 mt-1">{g.description}</div></div>
                      <button onClick={() => deleteGoal(g.id)} className="p-1.5 text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-4"><div className="flex justify-between text-[11px] text-zinc-500 mb-1"><span>{g.progress}% complete</span><span>{g.milestones.filter((m) => m.completed).length}/{g.milestones.length} milestones</span></div><div className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${g.progress}%` }} /></div></div>
                    <div className="mt-4 space-y-2">{g.milestones.map((m) => (<button key={m.id} onClick={() => toggleMilestone(g.id, m.id)} className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl border text-left text-sm transition", m.completed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-100" : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700")}><div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", m.completed ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-700")}><Check className="w-3 h-3" /></div><span className={cn(m.completed && "line-through opacity-70")}>{m.title}</span></button>))}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus */}
          {activeTab === "focus" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Deep Work Studio</h1>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-[24px] bg-zinc-900 border border-zinc-800 p-8">
                  <div className="flex items-center justify-between mb-8"><h3 className="font-semibold flex items-center gap-2"><Timer className="w-5 h-5 text-amber-400" /> Focus Timer</h3><div className="flex items-center gap-2"><select value={focusDuration} onChange={(e) => setFocusDuration(Number(e.target.value))} className="px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-xs"><option value={25}>25m • Pomodoro</option><option value={50}>50m • Deep Work</option><option value={90}>90m • Flow State</option></select><span className={cn("text-[10px] px-2 py-1 rounded-full border", getPillarAccent(focusPillar))}>{focusPillar}</span></div></div>
                  <div className="text-center py-8">
                    <div className="text-[72px] md:text-[96px] font-mono font-black tracking-tighter leading-none">{String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}</div>
                    <div className="mt-6 max-w-md mx-auto"><input value={focusTask} onChange={(e) => setFocusTask(e.target.value)} placeholder="What are you shipping?" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-center focus:outline-none focus:border-amber-500" /><div className="mt-3 grid grid-cols-5 gap-2">{( ["Mind","Body","Craft","Wealth","Spirit"] as Pillar[]).map((p) => (<button key={p} onClick={() => setFocusPillar(p)} className={cn("py-2 rounded-xl border text-xs font-medium transition", focusPillar === p ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700")}>{p}</button>))}</div></div>
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <button onClick={() => setTimerRunning(!timerRunning)} className="px-10 py-4 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition">{timerRunning ? <><Pause className="w-5 h-5" /> Pause Session</> : <><Play className="w-5 h-5" /> Start Deep Work</>}</button>
                      <button onClick={() => { setTimerRunning(false); setTimerSeconds(focusDuration * 60); }} className="p-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"><RotateCcw className="w-5 h-5" /></button>
                    </div>
                    <div className="mt-8 h-2 rounded-full bg-zinc-800 overflow-hidden max-w-md mx-auto"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${((focusDuration * 60 - timerSeconds) / (focusDuration * 60)) * 100}%` }} /></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6"><h3 className="font-semibold text-sm mb-4">Today&apos;s Stats</h3><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-zinc-400">Sessions</span><span className="font-bold">{focusSessions.filter((f) => new Date(f.completedAt).toISOString().split("T")[0] === todayISO).length}</span></div><div className="flex justify-between text-sm"><span className="text-zinc-400">Minutes</span><span className="font-bold">{totalFocusToday}m</span></div><div className="flex justify-between text-sm"><span className="text-zinc-400">Target</span><span className="font-bold">{user.dailyFocusTarget}m</span></div><div className="h-2 rounded-full bg-zinc-800 overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, (totalFocusToday / user.dailyFocusTarget) * 100)}%` }} /></div></div></div>
                  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6"><h3 className="font-semibold text-sm mb-4">Recent Sessions</h3><div className="space-y-2 max-h-[320px] overflow-y-auto">{focusSessions.slice(0, 8).map((f) => (<div key={f.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"><div><div className="text-sm font-medium truncate max-w-[160px]">{f.taskTitle}</div><div className="text-[11px] text-zinc-500">{f.pillar} • {f.durationMinutes}m • +{f.xpEarned} XP</div></div><div className="text-[10px] text-zinc-600">{formatRelativeTime(f.completedAt)}</div></div>))}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* Journal */}
          {activeTab === "journal" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Stoic Journal</h1>
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                <h3 className="font-semibold text-sm mb-4">New Daily Reflection</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newJournal.title} onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })} placeholder="Title (e.g. Velocity Through Simplification)" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <input value={newJournal.winOfTheDay} onChange={(e) => setNewJournal({ ...newJournal, winOfTheDay: e.target.value })} placeholder="Win of the Day" className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <input value={newJournal.lessonLearned} onChange={(e) => setNewJournal({ ...newJournal, lessonLearned: e.target.value })} placeholder="Lesson Learned" className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <input value={newJournal.gratitude} onChange={(e) => setNewJournal({ ...newJournal, gratitude: e.target.value })} placeholder="Gratitude" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <textarea value={newJournal.content} onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })} placeholder="Full reflection / stream of consciousness..." className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[90px]" />
                  <div className="flex gap-2"><select value={newJournal.pillar} onChange={(e) => setNewJournal({ ...newJournal, pillar: e.target.value as Pillar })} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">{(["Mind","Body","Craft","Wealth","Spirit"] as Pillar[]).map((p)=><option key={p} value={p}>{p}</option>)}</select><select value={newJournal.mood} onChange={(e) => setNewJournal({ ...newJournal, mood: Number(e.target.value) })} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm"><option value={1}>Mood 1 • Low</option><option value={2}>Mood 2</option><option value={3}>Mood 3</option><option value={4}>Mood 4</option><option value={5}>Mood 5 • Peak</option></select><select value={newJournal.energy} onChange={(e) => setNewJournal({ ...newJournal, energy: Number(e.target.value) })} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm"><option value={1}>Energy 1</option><option value={2}>Energy 2</option><option value={3}>Energy 3</option><option value={4}>Energy 4</option><option value={5}>Energy 5 • Peak</option></select></div>
                  <button onClick={createJournal} className="md:col-span-2 py-2.5 rounded-xl bg-white text-black font-semibold text-sm">Save Reflection • +40 XP</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {journals.map((j) => (
                  <div key={j.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
                    <div className="flex items-start justify-between"><div className="font-semibold text-sm">{j.title}</div><span className={cn("text-[10px] px-2 py-0.5 rounded-full border", getPillarAccent(j.pillar))}>{j.pillar}</span></div>
                    <div className="mt-3 space-y-2 text-xs"><div><span className="text-zinc-500">Win:</span> <span className="text-zinc-200">{j.winOfTheDay}</span></div><div><span className="text-zinc-500">Lesson:</span> <span className="text-zinc-200">{j.lessonLearned}</span></div><div><span className="text-zinc-500">Gratitude:</span> <span className="text-zinc-200">{j.gratitude}</span></div><div className="pt-2 text-zinc-400 leading-relaxed">{j.content}</div></div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500"><span>{formatRelativeTime(j.createdAt)} • Mood {j.mood}/5 • Energy {j.energy}/5</span><span>{j.tags.join(" • ")}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Protocols */}
          {activeTab === "protocols" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Protocol Challenges</h1><div className="text-xs text-zinc-500">{challenges.length} active protocols • Community built</div></div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                <h3 className="font-semibold text-sm mb-4">Create Custom Protocol</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} placeholder="Protocol title" className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <input value={newChallenge.subtitle} onChange={(e) => setNewChallenge({ ...newChallenge, subtitle: e.target.value })} placeholder="Subtitle" className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" />
                  <textarea value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} placeholder="Description" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[60px]" />
                  <select value={newChallenge.pillar} onChange={(e) => setNewChallenge({ ...newChallenge, pillar: e.target.value as Pillar })} className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">{(["Mind","Body","Craft","Wealth","Spirit"] as Pillar[]).map((p)=><option key={p} value={p}>{p}</option>)}</select>
                  <div className="flex gap-2"><input type="number" value={newChallenge.durationDays} onChange={(e) => setNewChallenge({ ...newChallenge, durationDays: Number(e.target.value) })} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" min={7} max={90} /><select value={newChallenge.difficulty} onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value })} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm"><option>Initiate</option><option>Vanguard</option><option>Apex</option></select></div>
                  <textarea value={newChallenge.rules} onChange={(e) => setNewChallenge({ ...newChallenge, rules: e.target.value })} placeholder="Rules (one per line)" className="md:col-span-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[70px]" />
                  <button onClick={createCustomChallenge} className="md:col-span-2 py-2.5 rounded-xl bg-white text-black font-semibold text-sm">Launch Protocol • +100 XP</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map((c) => {
                  const myProgress = c.userProgress.find((p) => p.userId === user.id);
                  const joined = !!myProgress;
                  const completedCount = myProgress?.completedDays.length || 0;
                  const pct = Math.round((completedCount / c.durationDays) * 100);
                  return (
                    <div key={c.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3"><div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", getPillarColor(c.pillar))}>{React.createElement(pillarIcons[c.pillar], { className: "w-5 h-5 text-black" })}</div><div><div className="font-bold text-sm">{c.title}</div><div className="text-xs text-zinc-500">{c.subtitle} • {c.participantsCount} architects</div></div></div>
                        <span className={cn("text-[10px] px-2 py-1 rounded-full border", c.difficulty === "Apex" ? "bg-red-500/10 text-red-300 border-red-500/20" : c.difficulty === "Vanguard" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20")}>{c.difficulty}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{c.description}</p>
                      <div className="mt-4 space-y-1">{c.rules.map((r, i) => (<div key={i} className="text-[11px] text-zinc-400 flex gap-2"><span className="text-zinc-600">•</span><span>{r}</span></div>))}</div>
                      <div className="mt-5">
                        <div className="flex justify-between text-[11px] text-zinc-500 mb-1"><span>{completedCount}/{c.durationDays} days • {pct}%</span><span>+{c.xpReward} XP reward</span></div>
                        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${pct}%` }} /></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5 max-h-[84px] overflow-y-auto">
                        {Array.from({ length: c.durationDays }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const completed = myProgress?.completedDays.includes(dayNum);
                          return <button key={dayNum} onClick={() => handleChallengeAction(c.id, joined ? "toggleDay" : "join", dayNum)} className={cn("w-8 h-8 rounded-lg border text-[11px] font-medium flex items-center justify-center transition", completed ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700")}>{dayNum}</button>;
                        })}
                      </div>
                      {!joined && <button onClick={() => handleChallengeAction(c.id, "join")} className="mt-4 w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm">Join Protocol • +50 XP</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Arena */}
          {activeTab === "arena" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">The Arena</h1>
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                <div className="flex gap-3">
                  <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-black font-bold shrink-0", user.avatarColor)}>{user.name.charAt(0)}</div>
                  <div className="flex-1">
                    <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="Share a win, protocol insight, or breakthrough..." className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[80px] focus:outline-none focus:border-amber-500" />
                    <div className="mt-3 flex items-center justify-between"><select value={newPost.tag} onChange={(e) => setNewPost({ ...newPost, tag: e.target.value })} className="px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-xs"><option>Win</option><option>Streak</option><option>Protocol</option><option>Insight</option><option>Milestone</option></select><button onClick={createPost} className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm flex items-center gap-2"><Send className="w-4 h-4" /> Post to Arena • +30 XP</button></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((p) => {
                  const liked = p.likes.includes(user.id);
                  return (
                    <div key={p.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6">
                      <div className="flex items-center gap-3"><div className={cn("w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-black font-bold text-xs", p.authorAvatarColor)}>{p.authorName.charAt(0)}</div><div><div className="text-sm font-semibold flex items-center gap-2">{p.authorName}<span className="text-xs text-zinc-500">@{p.authorHandle}</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">Lvl {p.authorLevel}</span></div><div className="text-[11px] text-zinc-500">{formatRelativeTime(p.createdAt)} • {p.authorPillar}</div></div><span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{p.tag}</span></div>
                      <p className="mt-4 text-sm leading-relaxed text-zinc-200">{p.content}</p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500"><button onClick={() => likePost(p.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition", liked ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")}><HeartIcon className={cn("w-4 h-4", liked && "fill-red-400")} /> {p.likes.length} Likes</button><span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {p.comments.length} Comments</span></div>
                      <div className="mt-4 space-y-2">{p.comments.map((c) => (<div key={c.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-xs font-medium">{c.authorName} <span className="text-zinc-500">@{c.authorHandle}</span></div><div className="text-xs text-zinc-300 mt-1">{c.content}</div><div className="text-[10px] text-zinc-600 mt-1">{formatRelativeTime(c.createdAt)}</div></div>))}</div>
                      <div className="mt-3 flex gap-2"><input value={commentInputs[p.id] || ""} onChange={(e) => setCommentInputs({ ...commentInputs, [p.id]: e.target.value })} placeholder="Write a comment..." className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" /><button onClick={() => commentPost(p.id)} className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm">Reply</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === "leaderboard" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-400" /> Global Leaderboard</h1>
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-3 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500"><div className="col-span-1">Rank</div><div className="col-span-6">Architect</div><div className="col-span-2">Pillar</div><div className="col-span-1">Streak</div><div className="col-span-2 text-right">XP • Level</div></div>
                {leaderboard.map((u: any) => (
                  <div key={u.id} className={cn("grid grid-cols-12 px-6 py-4 items-center border-b border-zinc-800/50 text-sm", u.id === user.id && "bg-amber-500/5")}>
                    <div className="col-span-1"><span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", u.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-black" : u.rank === 2 ? "bg-zinc-700 text-white" : u.rank === 3 ? "bg-amber-900 text-amber-200" : "bg-zinc-800 text-zinc-400")}>{u.rank}</span></div>
                    <div className="col-span-6 flex items-center gap-3"><div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-black font-bold text-xs", u.avatarColor)}>{u.name.charAt(0)}</div><div><div className="font-medium">{u.name} {u.id === user.id && <span className="text-amber-400">(You)</span>}</div><div className="text-xs text-zinc-500">@{u.handle} • {u.badges?.length || 0} badges</div></div></div>
                    <div className="col-span-2"><span className={cn("text-[10px] px-2 py-1 rounded-full border", getPillarAccent(u.primaryPillar))}>{u.primaryPillar}</span></div>
                    <div className="col-span-1 text-xs">{u.streak}🔥</div>
                    <div className="col-span-2 text-right"><div className="font-bold text-amber-400">{u.xp} XP</div><div className="text-xs text-zinc-500">Lvl {u.level}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-zinc-400">Display Name</label><input value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" /></div>
                  <div><label className="text-xs text-zinc-400">Handle</label><input value={settingsForm.handle} onChange={(e) => setSettingsForm({ ...settingsForm, handle: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" /></div>
                  <div className="md:col-span-2"><label className="text-xs text-zinc-400">Bio</label><textarea value={settingsForm.bio} onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm min-h-[80px]" /></div>
                  <div><label className="text-xs text-zinc-400">Primary Pillar</label><select value={settingsForm.primaryPillar} onChange={(e) => setSettingsForm({ ...settingsForm, primaryPillar: e.target.value as Pillar })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">{(["Mind","Body","Craft","Wealth","Spirit"] as Pillar[]).map((p)=><option key={p} value={p}>{p}</option>)}</select></div>
                  <div><label className="text-xs text-zinc-400">Daily Focus Target (minutes)</label><input type="number" value={settingsForm.dailyFocusTarget} onChange={(e) => setSettingsForm({ ...settingsForm, dailyFocusTarget: Number(e.target.value) })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" min={15} max={480} /></div>
                  <div><label className="text-xs text-zinc-400">Avatar Gradient</label><select value={settingsForm.avatarColor} onChange={(e) => setSettingsForm({ ...settingsForm, avatarColor: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm"><option value="from-amber-400 to-orange-600">Amber • Orange</option><option value="from-emerald-400 to-teal-600">Emerald • Teal</option><option value="from-sky-400 to-indigo-600">Sky • Indigo</option><option value="from-purple-400 to-fuchsia-600">Purple • Fuchsia</option><option value="from-rose-400 to-pink-600">Rose • Pink</option></select></div>
                  <div><label className="text-xs text-zinc-400">New Password (leave blank to keep)</label><input type="password" value={settingsForm.newPassword} onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })} placeholder="••••••••" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm" /></div>
                </div>
                <button onClick={saveSettings} className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm">Save Profile Changes</button>

                <div className="pt-6 border-t border-zinc-800">
                  <h3 className="font-semibold text-sm mb-3">Account Overview</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs"><div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-zinc-500">Email</div><div className="font-medium mt-1">{user.email}</div></div><div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-zinc-500">Joined</div><div className="font-medium mt-1">{new Date(user.joinedAt).toLocaleDateString()}</div></div><div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-zinc-500">Total Focus</div><div className="font-medium mt-1">{user.focusMinutesTotal}m logged</div></div><div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-zinc-500">Badges</div><div className="font-medium mt-1">{user.badges.join(", ") || "None yet"}</div></div></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />}
    </div>
  );
}
