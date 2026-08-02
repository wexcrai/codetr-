import { db } from "@/lib/db";
import { Plus, Trophy, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminAchievementsPage() {
  // Using a mock structure for achievements since there may not be a schema for it yet
  // If there is an achievement table, it would be fetched like: await db.achievement.findMany()
  const achievements = [
    { id: "1", title: "İlk Adım", description: "İlk dersi tamamla", icon: "🌱", rarity: "COMMON", xpReward: 50, condition: "lessons_completed", conditionValue: 1 },
    { id: "2", title: "Ateşli", description: "7 günlük seriye ulaş", icon: "🔥", rarity: "RARE", xpReward: 200, condition: "streak_days", conditionValue: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Başarımlar</h1>
          <p className="text-slate-400 mt-1">Kullanıcıları motive edecek ödüller ve rozetler oluşturun.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg transition-colors font-medium shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Başarım
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div key={ach.id} className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-red-900/30 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-slate-700">
              {ach.icon}
            </div>
            
            <h3 className="text-xl font-bold text-white">{ach.title}</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4 flex-1">{ach.description}</p>
            
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nadirilik:</span>
                <span className={cn(
                  "font-medium",
                  ach.rarity === 'COMMON' ? "text-slate-300" :
                  ach.rarity === 'RARE' ? "text-blue-400" :
                  ach.rarity === 'EPIC' ? "text-purple-400" : "text-orange-400"
                )}>
                  {ach.rarity === 'COMMON' ? 'Yaygın' : ach.rarity === 'RARE' ? 'Nadir' : 'Epik'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ödül:</span>
                <span className="font-medium text-yellow-500">+{ach.xpReward} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Koşul:</span>
                <span className="font-mono text-xs text-slate-400">{ach.condition} &gt;= {ach.conditionValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
