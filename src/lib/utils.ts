import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateISO(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateISO(iso);
}

export function getPillarColor(pillar: string): string {
  switch (pillar) {
    case "Mind": return "from-violet-500 to-indigo-500";
    case "Body": return "from-emerald-400 to-teal-600";
    case "Craft": return "from-amber-400 to-orange-600";
    case "Wealth": return "from-yellow-300 to-amber-600";
    case "Spirit": return "from-sky-400 to-blue-600";
    default: return "from-zinc-600 to-zinc-800";
  }
}

export function getPillarAccent(pillar: string): string {
  switch (pillar) {
    case "Mind": return "text-violet-400 border-violet-500/30 bg-violet-500/10";
    case "Body": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    case "Craft": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    case "Wealth": return "text-yellow-300 border-yellow-500/30 bg-yellow-500/10";
    case "Spirit": return "text-sky-400 border-sky-500/30 bg-sky-500/10";
    default: return "text-zinc-400 border-zinc-700 bg-zinc-800/50";
  }
}
