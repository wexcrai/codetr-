export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const AVAILABLE_BADGES: BadgeItem[] = [
  { id: "b-1", title: "🐍 Python Kurdu", description: "Python kursunda ustalaşan yazılımcılara verilir.", icon: "🐍", color: "from-blue-500 to-emerald-500" },
  { id: "b-2", title: "⚡ Algoritma Şampiyonu", description: "10+ algoritma problemi çözenlere verilir.", icon: "⚡", color: "from-yellow-400 to-amber-500" },
  { id: "b-3", title: "🚀 Fullstack Master", description: "JS & HTML/CSS derslerini başarıyla bitirenlere verilir.", icon: "🚀", color: "from-purple-500 to-pink-500" },
  { id: "b-4", title: "💎 Elmas Ligi Efsanesi", description: "3,500+ XP kazanıp Elmas Ligi'ne ulaşanlara verilir.", icon: "💎", color: "from-cyan-400 to-blue-600" },
  { id: "b-5", title: "🛡️ Seri Korumacısı", description: "7 gün üst üste kesintisiz kodlama yapanlara verilir.", icon: "🛡️", color: "from-orange-500 to-red-500" },
  { id: "b-6", title: "👑 VIP Yazılımcı", description: "Market'ten VIP Çerçeve alanlara özel unvan.", icon: "👑", color: "from-amber-400 to-yellow-300" },
];
