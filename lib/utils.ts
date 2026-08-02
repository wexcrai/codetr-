import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with Turkish locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("tr-TR").format(num);
}

/**
 * Formats XP with K/M suffix
 */
export function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M XP`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K XP`;
  return `${xp} XP`;
}

/**
 * Formats coins
 */
export function formatCoins(coins: number): string {
  if (coins >= 1_000) return `${(coins / 1_000).toFixed(1)}K`;
  return coins.toString();
}

/**
 * Returns the XP required to reach the next level
 */
export function getXPForLevel(level: number): number {
  // Formula: XP = 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Returns the total XP required to reach a level from level 1
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Calculates the user's level from total XP
 */
export function getLevelFromXP(xp: number): { level: number; currentXP: number; requiredXP: number; progress: number } {
  let level = 1;
  let remainingXP = xp;

  while (remainingXP >= getXPForLevel(level)) {
    remainingXP -= getXPForLevel(level);
    level++;
    if (level >= 100) break; // Cap at level 100
  }

  const requiredXP = getXPForLevel(level);
  const progress = Math.min((remainingXP / requiredXP) * 100, 100);

  return { level, currentXP: remainingXP, requiredXP, progress };
}

/**
 * Returns the color for a level (for badges)
 */
export function getLevelColor(level: number): string {
  if (level >= 80) return "from-yellow-400 to-orange-500"; // Legendary
  if (level >= 50) return "from-purple-400 to-pink-500";  // Epic
  if (level >= 25) return "from-blue-400 to-cyan-500";    // Rare
  if (level >= 10) return "from-green-400 to-emerald-500"; // Common+
  return "from-gray-400 to-gray-500";                      // Beginner
}

/**
 * Returns the rank title for a level
 */
export function getLevelTitle(level: number): string {
  if (level >= 80) return "Efsane";
  if (level >= 50) return "Uzman";
  if (level >= 25) return "İleri";
  if (level >= 10) return "Orta";
  if (level >= 5) return "Başlangıç";
  return "Acemi";
}

/**
 * Formats a date in Turkish
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Returns relative time in Turkish (e.g., "3 gün önce")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDate(date);
}

/**
 * Generates a unique username from a name/email
 */
export function generateUsername(nameOrEmail: string): string {
  const base = nameOrEmail
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 20);
  return `${base}_${Math.floor(Math.random() * 9999)}`;
}

/**
 * Truncates text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Calculates the percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}

/**
 * Converts seconds to mm:ss format
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Returns the achievement rarity label in Turkish
 */
export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    COMMON: "Yaygın",
    RARE: "Nadir",
    EPIC: "Epik",
    LEGENDARY: "Efsanevi",
  };
  return labels[rarity] ?? rarity;
}

/**
 * Returns the rarity gradient class
 */
export function getRarityGradient(rarity: string): string {
  const gradients: Record<string, string> = {
    COMMON: "from-gray-400 to-gray-600",
    RARE: "from-blue-400 to-blue-600",
    EPIC: "from-purple-400 to-purple-600",
    LEGENDARY: "from-yellow-400 to-orange-500",
  };
  return gradients[rarity] ?? "from-gray-400 to-gray-600";
}

/**
 * Sleeps for a given duration (for animations)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
