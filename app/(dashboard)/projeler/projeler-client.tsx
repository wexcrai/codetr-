'use client';

import { useState } from 'react';
import { FolderGit2, Plus, Star, ExternalLink, Code2, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjelerClientProps {
  initialProjects: any[];
}

export function ProjelerClient({ initialProjects }: ProjelerClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Python');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({});

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setProjects((prev) => [
      {
        id: `proj-${Date.now()}`,
        title: title.trim(),
        category,
        author: 'Sen',
        userTag: 'SANA ÖZEL',
        description: description.trim(),
        stars: 1,
        language: category,
        githubUrl: githubUrl.trim() || 'https://github.com',
      },
      ...prev,
    ]);

    setTitle('');
    setDescription('');
    setGithubUrl('');
    setIsFormOpen(false);
  };

  const handleStar = (id: string) => {
    setStarredMap((prev) => {
      const isStarred = prev[id];
      const next = !isStarred;

      setProjects((list) =>
        list.map((p) => (p.id === id ? { ...p, stars: p.stars + (next ? 1 : -1) } : p))
      );

      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Project CTA */}
      <div className="flex justify-between items-center p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-400" /> Kendi Projeni Ekle
          </h2>
          <p className="text-xs text-slate-300">Geliştirdiğin projeleri portfolyonda sergile ve geribildirim al.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Proje Paylaş
        </button>
      </div>

      {/* Add Form Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddProject}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-2xl"
          >
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">Proje Paylaşım Formu</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Proje Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Python Kripto Fiyat Takip Botu"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Programlama Dili / Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript / Node.js</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="HTML/CSS">HTML / CSS Web</option>
                  <option value="SQL">SQL &amp; Veritabanı</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Proje Açıklaması</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Projenizin ne işe yaradığını ve özelliklerini açıklayın..."
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">GitHub / Demo Linki (Opsiyonel)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/kullanici/proje"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 text-white text-xs flex items-center gap-2 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Yayınla</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p) => {
          const isStarred = starredMap[p.id];

          return (
            <div key={p.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md flex flex-col justify-between shadow-xl hover:border-purple-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                    {p.language}
                  </span>
                  <button
                    onClick={() => handleStar(p.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold transition-colors ${
                      isStarred
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
                    <span>{p.stars}</span>
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-white leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[10px]">@{p.author}</span>
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
