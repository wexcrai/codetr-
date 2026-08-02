"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  Terminal, Code2, Cpu, Trophy, Smartphone, Globe2, 
  ArrowRight, CheckCircle2, Play, Users, BookOpen, Star,
  Award, Target, Zap, Check, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="max-w-2xl"
              >
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping absolute"></span>
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 relative"></span>
                  🚀 Türkiye'nin #1 Kodlama Platformu
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                  Kodu Öğren,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                    Geleceği Şekillendir
                  </span>
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                  Python'dan JavaScript'e, interaktif dersler ve zorluklar ile kodlamayı eğlenceli öğrenin. 50,000+ öğrenci zaten başladı.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4 mb-12">
                  <Link href="/kayit" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1">
                    Ücretsiz Başla
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="#nasil-calisir" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all backdrop-blur-sm">
                    <Play className="w-5 h-5" />
                    Nasıl Çalışır?
                  </Link>
                </motion.div>
                
                <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">50,000+</div>
                    <div className="text-sm text-slate-400">Öğrenci</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">500+</div>
                    <div className="text-sm text-slate-400">Ders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">12</div>
                    <div className="text-sm text-slate-400">Dil</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">%98</div>
                    <div className="text-sm text-slate-400">Memnuniyet</div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block perspective-1000"
              >
                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/50 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <div className="ml-4 text-xs text-slate-400 font-mono flex-1 text-center pr-10">main.py</div>
                  </div>
                  <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                    <div className="flex"><span className="text-slate-600 select-none mr-4">1</span><span className="text-purple-400">def</span> <span className="text-blue-400">ogrenmeye_basla</span><span className="text-slate-300">(kullanici):</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">2</span><span className="text-slate-300 ml-4">if kullanici.is_hazir():</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">3</span><span className="text-slate-300 ml-8">kullanici.hedef_belirle(<span className="text-green-400">"Full Stack"</span>)</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">4</span><span className="text-slate-300 ml-8">platform = CodeTR()</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">5</span><span className="text-slate-300 ml-8">platform.kayit_ol(kullanici)</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">6</span><span className="text-slate-300 ml-8"><span className="text-purple-400">return</span> platform.basari_garantisi()</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">7</span><span className="text-slate-300"></span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">8</span><span className="text-slate-500"># Kodlamayı CodeTR ile öğrenin</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">9</span><span className="text-blue-400">print</span><span className="text-slate-300">(</span><span className="text-green-400">"Gelecek parmaklarının ucunda!"</span><span className="text-slate-300">)</span></div>
                    <div className="flex"><span className="text-slate-600 select-none mr-4">10</span><span className="text-slate-300">ogrenmeye_basla(sen)</span></div>
                  </div>
                  <div className="bg-slate-950/80 px-4 py-2 border-t border-white/5 font-mono text-xs text-green-400 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    <span>Gelecek parmaklarının ucunda!</span>
                    <span className="w-2 h-4 bg-green-400 animate-pulse inline-block"></span>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 top-10 bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Trophy className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">+50 XP Kazanıldı</div>
                    <div className="text-sm font-bold text-white">Günlük Hedef!</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 15, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-12 bottom-20 bg-slate-800/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3"
                >
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/30">
                    Seviye 5
                  </div>
                  <div className="text-sm font-bold text-white">Python Ustası</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-950 relative z-10" id="ozellikler">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">CodeTR?</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Öğrenme sürecinizi hızlandırmak ve kodlamayı bir tutku haline getirmek için tasarlandı.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Oyunlaştırılmış Öğrenme", desc: "XP kazanın, seviye atlayın ve rozetler toplayın. Sıkıcı teoriler yerine interaktif görevlerle öğrenin.", color: "from-blue-500 to-cyan-400" },
                { icon: Zap, title: "Yapay Zeka Destekli", desc: "Takıldığınız yerde size ipuçları veren ve kodunuzu açıklayan yapay zeka asistanımız her an yanınızda.", color: "from-purple-500 to-pink-500" },
                { icon: Terminal, title: "Tarayıcıda Kod Yaz", desc: "Hiçbir şey kurmanıza gerek yok. Gelişmiş IDE'miz doğrudan tarayıcınızda çalışır, anında sonuç alırsınız.", color: "from-green-500 to-emerald-400" },
                { icon: Award, title: "Sertifika Kazan", desc: "Kursları tamamladığınızda LinkedIn'de paylaşabileceğiniz ve CV'nize ekleyebileceğiniz doğrulanmış sertifikalar alın.", color: "from-yellow-400 to-orange-500" },
                { icon: Smartphone, title: "Her Cihazda", desc: "Metroda, otobüste veya yatakta. Mobil uyumlu arayüzümüz sayesinde her yerde kodlamaya devam edin.", color: "from-indigo-500 to-blue-500" },
                { icon: Globe2, title: "Tamamen Türkçe", desc: "İngilizce bariyerine takılmadan, en karmaşık yazılım konseptlerini bile kendi ana dilinizde anlayın.", color: "from-red-500 to-rose-400" }
              ].map((feature, idx) => (
                <FeatureCard key={idx} {...feature} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-24 bg-slate-900/50 border-y border-white/5 relative" id="kurslar">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Popüler <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Kurslarımız</span></h2>
                <p className="text-slate-400 max-w-xl text-lg">Hangi alanda uzmanlaşmak istersiniz? Hedefinize uygun dili seçin ve hemen başlayın.</p>
              </div>
              <Link href="/kurslar" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Tüm Kursları Gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar gap-6">
              {[
                { name: "Python", icon: "🐍", lessons: 85, diff: "Başlangıç", color: "bg-blue-500" },
                { name: "JavaScript", icon: "⚡", lessons: 120, diff: "Başlangıç", color: "bg-yellow-500" },
                { name: "TypeScript", icon: "📘", lessons: 65, diff: "Orta", color: "bg-blue-600" },
                { name: "HTML/CSS", icon: "🎨", lessons: 45, diff: "Başlangıç", color: "bg-orange-500" },
                { name: "Java", icon: "☕", lessons: 90, diff: "Orta", color: "bg-red-500" },
                { name: "C#", icon: "💜", lessons: 80, diff: "Orta", color: "bg-purple-600" },
                { name: "Go", icon: "🐹", lessons: 55, diff: "İleri", color: "bg-cyan-500" },
                { name: "Rust", icon: "🦀", lessons: 70, diff: "İleri", color: "bg-orange-600" },
              ].map((course, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[280px] snap-center glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 group"
                >
                  <div className="text-5xl mb-6">{course.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons} Ders</span>
                    <span className="flex items-center gap-1">
                      <div className={cn("w-2 h-2 rounded-full", course.color)}></div>
                      {course.diff}
                    </span>
                  </div>
                  <Link href={`/kurslar/${course.name.toLowerCase().replace('/', '-')}`} className="w-full block text-center py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500">
                    Kursa Başla
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-slate-950" id="nasil-calisir">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Nasıl <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Çalışır?</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Sıfırdan ileri seviyeye uzanan yapılandırılmış öğrenme yolculuğunuz.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block z-0">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                {[
                  { num: "1", title: "Kayıt Ol", desc: "Ücretsiz hesabınızı oluşturun ve hedeflerinizi belirleyin.", icon: Users },
                  { num: "2", title: "Kurs Seç", desc: "İhtiyacınıza ve seviyenize uygun programlama dilini seçin.", icon: Target },
                  { num: "3", title: "Ders Al", desc: "İnteraktif görevleri çözerek pratik yapmaya başlayın.", icon: Code2 },
                  { num: "4", title: "Sertifika Kazan", desc: "Bitirdiğiniz kursların başarı sertifikasını profilinize ekleyin.", icon: Award },
                ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform shadow-[0_0_0_2px_rgba(59,130,246,0.3)]">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                      <step.icon className="w-6 h-6 text-slate-300 relative z-10 group-hover:text-white transition-colors" />
                      <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center border-2 border-slate-950">
                        {step.num}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-900/50 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Öğrencilerimiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Ne Diyor?</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Ayşe K.", role: "Öğrenci", initials: "AK", text: "Python öğrenmek hiç bu kadar kolay olmamıştı! Teorik bilgiye boğulmadan doğrudan kod yazarak öğrenmek harika.", color: "bg-pink-500" },
                { name: "Mehmet T.", role: "Yazılım Geliştirici", initials: "MT", text: "Günlük hedefler ve XP sistemi beni inanılmaz motive ediyor. Serimi bozmamak için her gün 15 dakika bile olsa girip kod yazıyorum.", color: "bg-blue-500" },
                { name: "Zeynep A.", role: "Junior Frontend", initials: "ZA", text: "Buradan aldığım eğitimler ve kazandığım sertifika sayesinde ilk işimi buldum. React kursu mükemmeldi!", color: "bg-purple-500" }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card p-8 rounded-2xl border border-white/10"
                >
                  <div className="flex gap-1 text-yellow-500 mb-6">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-slate-300 mb-8 italic">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg", t.color)}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-sm text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className="py-20 bg-blue-950 border-y border-blue-900/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StatCounter end={50000} label="Kayıtlı Öğrenci" suffix="+" />
              <StatCounter end={500} label="İnteraktif Ders" suffix="+" />
              <StatCounter end={12} label="Programlama Dili" />
              <StatCounter end={98} label="Memnuniyet Oranı" suffix="%" />
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 z-0"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
            >
              Hemen Başla - <span className="text-blue-200">Ücretsiz!</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-10"
            >
              Kodlama serüvenine bugün katılın. Kayıt olmak sadece 30 saniyenizi alır. Kredi kartı gerekmez.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/kayit" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-lg transition-all shadow-xl hover:-translate-y-1">
                Kayıt Ol ve Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, index }: { icon: any, title: string, desc: string, color: string, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-2 group"
    >
      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br", color)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StatCounter({ end, label, suffix = "" }: { end: number, label: string, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // A simple way to do counting without heavy libraries
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref}>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 font-medium">{label}</div>
    </div>
  );
}
