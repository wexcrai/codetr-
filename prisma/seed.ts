import { PrismaClient, UserRole, LessonType, LessonStepType, CourseLevel, AchievementRarity } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.userActivity.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.lessonStep.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.courseCategory.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userDailyReward.deleteMany();
  await prisma.dailyReward.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating daily rewards...');
  const dailyRewards = [];
  for (let i = 1; i <= 30; i++) {
    let coins = 10;
    let xp = 5;
    
    if (i === 1) { coins = 10; xp = 5; }
    else if (i === 2) { coins = 15; xp = 10; }
    else if (i === 3) { coins = 20; xp = 15; }
    else if (i === 7) { coins = 50; xp = 50; }
    else if (i === 14) { coins = 100; xp = 100; }
    else if (i === 30) { coins = 500; xp = 500; }
    else {
      // Linear scaling approximation
      coins = Math.floor(10 + (i / 30) * 490);
      xp = Math.floor(5 + (i / 30) * 495);
    }
    
    dailyRewards.push({
      day: i,
      coinReward: coins,
      xpReward: xp,
      specialReward: i % 7 === 0 ? `week_${i/7}_badge` : null
    });
  }
  await prisma.dailyReward.createMany({ data: dailyRewards });

  console.log('Creating achievements...');
  const achievements = [
    { key: 'first_lesson', title: 'İlk Adım', description: 'İlk dersini tamamla', icon: '🎯', condition: { type: 'lessons_completed', value: 1 } },
    { key: '10_lessons', title: 'Öğrenci', description: '10 ders tamamla', icon: '📚', condition: { type: 'lessons_completed', value: 10 } },
    { key: '50_lessons', title: 'Çalışkan', description: '50 ders tamamla', icon: '🤓', condition: { type: 'lessons_completed', value: 50 }, rarity: AchievementRarity.RARE },
    { key: '100_lessons', title: 'Bilge', description: '100 ders tamamla', icon: '🦉', condition: { type: 'lessons_completed', value: 100 }, rarity: AchievementRarity.EPIC },
    { key: 'xp_100', title: 'Acemi', description: '100 XP kazan', icon: '⭐', condition: { type: 'xp_earned', value: 100 } },
    { key: 'xp_500', title: 'Gelişen', description: '500 XP kazan', icon: '🌟', condition: { type: 'xp_earned', value: 500 } },
    { key: 'xp_1000', title: 'Deneyimli', description: '1000 XP kazan', icon: '💫', condition: { type: 'xp_earned', value: 1000 }, rarity: AchievementRarity.RARE },
    { key: 'xp_5000', title: 'Uzman', description: '5000 XP kazan', icon: '✨', condition: { type: 'xp_earned', value: 5000 }, rarity: AchievementRarity.EPIC },
    { key: 'xp_10000', title: 'Usta', description: '10000 XP kazan', icon: '👑', condition: { type: 'xp_earned', value: 10000 }, rarity: AchievementRarity.LEGENDARY },
    { key: 'streak_3', title: 'Isınma Turu', description: '3 gün üst üste giriş yap', icon: '🔥', condition: { type: 'streak_days', value: 3 } },
    { key: 'streak_7', title: 'İstikrarlı', description: '7 gün üst üste giriş yap', icon: '📅', condition: { type: 'streak_days', value: 7 }, rarity: AchievementRarity.RARE },
    { key: 'streak_14', title: 'Vazgeçilmez', description: '14 gün üst üste giriş yap', icon: '💪', condition: { type: 'streak_days', value: 14 }, rarity: AchievementRarity.RARE },
    { key: 'streak_30', title: 'Alışkanlık', description: '30 gün üst üste giriş yap', icon: '🏆', condition: { type: 'streak_days', value: 30 }, rarity: AchievementRarity.EPIC },
    { key: 'streak_100', title: 'Efsane', description: '100 gün üst üste giriş yap', icon: '🐉', condition: { type: 'streak_days', value: 100 }, rarity: AchievementRarity.LEGENDARY },
    { key: 'course_1', title: 'Mezun', description: 'İlk kursunu tamamla', icon: '🎓', condition: { type: 'courses_completed', value: 1 }, rarity: AchievementRarity.RARE },
    { key: 'level_5', title: 'Seviye 5', description: '5. seviyeye ulaş', icon: '5️⃣', condition: { type: 'level_reached', value: 5 } },
    { key: 'level_10', title: 'Seviye 10', description: '10. seviyeye ulaş', icon: '🔟', condition: { type: 'level_reached', value: 10 }, rarity: AchievementRarity.RARE },
    { key: 'level_25', title: 'Seviye 25', description: '25. seviyeye ulaş', icon: '🥈', condition: { type: 'level_reached', value: 25 }, rarity: AchievementRarity.EPIC },
    { key: 'level_50', title: 'Seviye 50', description: '50. seviyeye ulaş', icon: '🥇', condition: { type: 'level_reached', value: 50 }, rarity: AchievementRarity.LEGENDARY },
    { key: 'coins_100', title: 'Para Kazanma', description: '100 Altın kazan', icon: '💰', condition: { type: 'coins_earned', value: 100 } },
    { key: 'coins_500', title: 'Tüccar', description: '500 Altın kazan', icon: '🛍️', condition: { type: 'coins_earned', value: 500 } },
    { key: 'coins_1000', title: 'Zengin', description: '1000 Altın kazan', icon: '💎', condition: { type: 'coins_earned', value: 1000 }, rarity: AchievementRarity.RARE },
    { key: 'quiz_100', title: 'Mükemmeliyetçi', description: 'Bir quizden 100 puan al', icon: '💯', condition: { type: 'quiz_perfect', value: 1 } },
    { key: 'quiz_10', title: 'Testkolik', description: '10 quiz tamamla', icon: '📝', condition: { type: 'quiz_completed', value: 10 } },
    { key: 'challenge_1', title: 'Meydan Okuyan', description: 'İlk kodlama görevini tamamla', icon: '⚔️', condition: { type: 'challenges_completed', value: 1 } },
    { key: 'challenge_10', title: 'Gladyatör', description: '10 kodlama görevini tamamla', icon: '🛡️', condition: { type: 'challenges_completed', value: 10 }, rarity: AchievementRarity.RARE },
    { key: 'challenge_50', title: 'Spartalı', description: '50 kodlama görevini tamamla', icon: '🗡️', condition: { type: 'challenges_completed', value: 50 }, rarity: AchievementRarity.EPIC },
    { key: 'night_owl', title: 'Gece Kuşu', description: 'Gece 12 ile 4 arası bir ders tamamla', icon: '🦉', condition: { type: 'time_night', value: 1 }, isSecret: true },
    { key: 'early_bird', title: 'Erkenci Kuş', description: 'Sabah 5 ile 8 arası bir ders tamamla', icon: '🌅', condition: { type: 'time_morning', value: 1 }, isSecret: true },
    { key: 'speed_demon', title: 'Hız Tutkunu', description: 'Bir dersi 1 dakikanın altında tamamla', icon: '⚡', condition: { type: 'speed_lesson', value: 1 }, isSecret: true },
    { key: 'weekend_warrior', title: 'Hafta Sonu Savaşçısı', description: 'Hafta sonu 5 ders tamamla', icon: '🎮', condition: { type: 'weekend_lessons', value: 5 } },
    { key: 'first_blood', title: 'İlk Kan', description: 'Bir kodlama görevinde ilk denemede başarılı ol', icon: '🩸', condition: { type: 'first_try_challenge', value: 1 }, isSecret: true },
    { key: 'social_butterfly', title: 'Sosyal Kelebek', description: 'Profilini herkese açık yap ve avatar yükle', icon: '🦋', condition: { type: 'profile_complete', value: 1 } },
    { key: 'shopaholic', title: 'Alışverişkolik', description: 'Markette 1000 altın harca', icon: '🛒', condition: { type: 'coins_spent', value: 1000 } },
    { key: 'bug_hunter', title: 'Böcek Avcısı', description: 'Arka arkaya 5 kez hatalı kod çalıştır ve sonra düzelt', icon: '🐛', condition: { type: 'fix_errors', value: 5 }, isSecret: true }
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  console.log('Creating category & course...');
  const category = await prisma.courseCategory.create({
    data: {
      name: 'Programlama Dilleri',
      slug: 'programlama-dilleri',
      description: 'Popüler programlama dilleriyle kodlamayı öğrenin',
      icon: 'Code2',
      color: '#3B82F6'
    }
  });

  const course = await prisma.course.create({
    data: {
      title: 'Python Programlama',
      slug: 'python',
      description: 'Sıfırdan ileri seviyeye Python programlama dilini öğrenin. Temel kavramlar, veri yapıları, nesne yönelimli programlama ve daha fazlası.',
      shortDesc: 'Sıfırdan ileri seviye Python',
      language: 'python',
      level: CourseLevel.BEGINNER,
      isPublished: true,
      categoryId: category.id,
      xpReward: 5000,
      coinReward: 1000,
      icon: 'FileCode2',
      color: '#F59E0B'
    }
  });

  console.log('Creating chapters and lessons...');
  // Data array for all 23 chapters
  const chaptersData = [
    {
      title: 'Giriş',
      lessons: [
        { title: 'Python Nedir?', type: LessonType.LESSON, xp: 10 },
        { title: 'Python Kurulumu', type: LessonType.LESSON, xp: 10 },
        { title: 'İlk Programımız', type: LessonType.LESSON, xp: 15 }
      ]
    },
    {
      title: 'Değişkenler',
      lessons: [
        { title: 'Değişkenler Nedir?', type: LessonType.LESSON, xp: 15 },
        { title: 'Değişken Adlandırma', type: LessonType.LESSON, xp: 15 },
        { title: 'Değişken Atama', type: LessonType.LESSON, xp: 20 },
        { title: 'Değişkenler Quiz', type: LessonType.QUIZ, xp: 25 }
      ]
    },
    {
      title: 'Veri Tipleri',
      lessons: [
        { title: 'String Tipi', type: LessonType.LESSON, xp: 20 },
        { title: 'Tam Sayı ve Ondalıklar', type: LessonType.LESSON, xp: 20 },
        { title: 'Boolean Tipi', type: LessonType.LESSON, xp: 15 },
        { title: 'tip() Fonksiyonu', type: LessonType.LESSON, xp: 15 },
        { title: 'Veri Tipleri Zorluk', type: LessonType.CHALLENGE, xp: 30 }
      ]
    },
    {
      title: 'Giriş/Çıkış',
      lessons: [
        { title: 'print() Fonksiyonu', type: LessonType.LESSON, xp: 20 },
        { title: 'input() Fonksiyonu', type: LessonType.LESSON, xp: 20 },
        { title: 'Format String', type: LessonType.LESSON, xp: 25 }
      ]
    },
    {
      title: 'Operatörler',
      lessons: [
        { title: 'Aritmetik Operatörler', type: LessonType.LESSON, xp: 20 },
        { title: 'Karşılaştırma Operatörleri', type: LessonType.LESSON, xp: 20 },
        { title: 'Mantıksal Operatörler', type: LessonType.LESSON, xp: 20 },
        { title: 'Operatörler Quiz', type: LessonType.QUIZ, xp: 30 }
      ]
    },
    {
      title: 'Koşullar',
      lessons: [
        { title: 'if Deyimi', type: LessonType.LESSON, xp: 25 },
        { title: 'else ve elif', type: LessonType.LESSON, xp: 25 },
        { title: 'İç İçe Koşullar', type: LessonType.LESSON, xp: 25 },
        { title: 'Koşullar Zorluk', type: LessonType.CHALLENGE, xp: 40 }
      ]
    },
    {
      title: 'Döngüler',
      lessons: [
        { title: 'while Döngüsü', type: LessonType.LESSON, xp: 25 },
        { title: 'for Döngüsü', type: LessonType.LESSON, xp: 25 },
        { title: 'range() Fonksiyonu', type: LessonType.LESSON, xp: 20 },
        { title: 'break ve continue', type: LessonType.LESSON, xp: 20 },
        { title: 'Döngüler Quiz', type: LessonType.QUIZ, xp: 35 }
      ]
    },
    {
      title: 'Fonksiyonlar',
      lessons: [
        { title: 'Fonksiyon Tanımlama', type: LessonType.LESSON, xp: 30 },
        { title: 'Parametreler', type: LessonType.LESSON, xp: 30 },
        { title: 'Return Değerler', type: LessonType.LESSON, xp: 30 },
        { title: 'Lambda Fonksiyonlar', type: LessonType.LESSON, xp: 30 },
        { title: 'Fonksiyonlar Zorluk', type: LessonType.CHALLENGE, xp: 50 }
      ]
    },
    {
      title: 'Listeler',
      lessons: [
        { title: 'Liste Oluşturma', type: LessonType.LESSON, xp: 25 },
        { title: 'Liste İşlemleri', type: LessonType.LESSON, xp: 25 },
        { title: 'Liste Metodları', type: LessonType.LESSON, xp: 25 },
        { title: 'Listeler Zorluk', type: LessonType.CHALLENGE, xp: 40 }
      ]
    },
    {
      title: 'Demetler',
      lessons: [
        { title: 'Demet Nedir?', type: LessonType.LESSON, xp: 20 },
        { title: 'Demet İşlemleri', type: LessonType.LESSON, xp: 20 },
        { title: 'Demet vs Liste', type: LessonType.LESSON, xp: 20 }
      ]
    },
    {
      title: 'Kümeler',
      lessons: [
        { title: 'Küme Nedir?', type: LessonType.LESSON, xp: 20 },
        { title: 'Küme İşlemleri', type: LessonType.LESSON, xp: 20 },
        { title: 'Küme Metodları', type: LessonType.LESSON, xp: 25 }
      ]
    },
    {
      title: 'Sözlükler',
      lessons: [
        { title: 'Sözlük Oluşturma', type: LessonType.LESSON, xp: 25 },
        { title: 'Sözlük İşlemleri', type: LessonType.LESSON, xp: 25 },
        { title: 'Sözlük Metodları', type: LessonType.LESSON, xp: 25 },
        { title: 'Sözlükler Zorluk', type: LessonType.CHALLENGE, xp: 40 }
      ]
    },
    {
      title: 'String İşlemleri',
      lessons: [
        { title: 'String Metodları', type: LessonType.LESSON, xp: 25 },
        { title: 'String Biçimlendirme', type: LessonType.LESSON, xp: 25 },
        { title: 'Dilim İşlemleri', type: LessonType.LESSON, xp: 25 },
        { title: 'String Zorluk', type: LessonType.CHALLENGE, xp: 40 }
      ]
    },
    {
      title: 'Modüller',
      lessons: [
        { title: 'import Komutu', type: LessonType.LESSON, xp: 25 },
        { title: 'Standart Kütüphane', type: LessonType.LESSON, xp: 25 },
        { title: 'Kendi Modülünü Oluştur', type: LessonType.LESSON, xp: 30 }
      ]
    },
    {
      title: 'Dosya İşlemleri',
      lessons: [
        { title: 'Dosya Okuma', type: LessonType.LESSON, xp: 25 },
        { title: 'Dosya Yazma', type: LessonType.LESSON, xp: 25 },
        { title: 'Dosya Yönetimi', type: LessonType.LESSON, xp: 30 }
      ]
    },
    {
      title: 'Hatalar ve İstisnalar',
      lessons: [
        { title: 'Hata Türleri', type: LessonType.LESSON, xp: 25 },
        { title: 'try-except', type: LessonType.LESSON, xp: 30 },
        { title: 'finally ve raise', type: LessonType.LESSON, xp: 30 },
        { title: 'Hata Yönetimi Zorluk', type: LessonType.CHALLENGE, xp: 45 }
      ]
    },
    {
      title: 'Sınıflar',
      lessons: [
        { title: 'Sınıf Nedir?', type: LessonType.LESSON, xp: 35 },
        { title: '__init__ Metodu', type: LessonType.LESSON, xp: 35 },
        { title: 'Sınıf Metodları', type: LessonType.LESSON, xp: 35 },
        { title: 'Sınıf Değişkenleri', type: LessonType.LESSON, xp: 35 },
        { title: 'Sınıflar Quiz', type: LessonType.QUIZ, xp: 45 }
      ]
    },
    {
      title: 'Nesne Yönelimli Programlama',
      lessons: [
        { title: 'Kalıtım', type: LessonType.LESSON, xp: 40 },
        { title: 'Polimorfizm', type: LessonType.LESSON, xp: 40 },
        { title: 'Kapsülleme', type: LessonType.LESSON, xp: 40 },
        { title: 'OOP Zorluk', type: LessonType.CHALLENGE, xp: 60 }
      ]
    },
    {
      title: 'Kalıtım',
      lessons: [
        { title: 'Tekli Kalıtım', type: LessonType.LESSON, xp: 35 },
        { title: 'Çoklu Kalıtım', type: LessonType.LESSON, xp: 35 },
        { title: 'super() Fonksiyonu', type: LessonType.LESSON, xp: 35 }
      ]
    },
    {
      title: 'Dekoratörler',
      lessons: [
        { title: 'Dekoratör Nedir?', type: LessonType.LESSON, xp: 40 },
        { title: 'Fonksiyon Dekoratörleri', type: LessonType.LESSON, xp: 40 },
        { title: 'Sınıf Dekoratörleri', type: LessonType.LESSON, xp: 40 }
      ]
    },
    {
      title: 'Üreteçler',
      lessons: [
        { title: 'Jeneratör Nedir?', type: LessonType.LESSON, xp: 40 },
        { title: 'yield Anahtar Kelimesi', type: LessonType.LESSON, xp: 40 },
        { title: 'Üreteç İfadeleri', type: LessonType.LESSON, xp: 40 }
      ]
    },
    {
      title: 'Kapsamlı İfadeler',
      lessons: [
        { title: 'Liste Kapsamı', type: LessonType.LESSON, xp: 35 },
        { title: 'Sözlük Kapsamı', type: LessonType.LESSON, xp: 35 },
        { title: 'Koşullu Kapsamlar', type: LessonType.LESSON, xp: 35 }
      ]
    },
    {
      title: 'Final Proje',
      lessons: [
        { title: 'Proje Tasarımı', type: LessonType.LESSON, xp: 50 },
        { title: 'Kodlama', type: LessonType.PROJECT, xp: 100 },
        { title: 'Test ve Sunum', type: LessonType.PROJECT, xp: 100 }
      ]
    }
  ];

  let chapterOrder = 1;
  let totalLessonsAdded = 0;
  let totalCourseLessons = 0;

  for (const cData of chaptersData) {
    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: cData.title,
        order: chapterOrder++,
        isPublished: true
      }
    });

    let lessonOrder = 1;
    for (const lData of cData.lessons) {
      totalCourseLessons++;
      const lesson = await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: lData.title,
          type: lData.type,
          order: lessonOrder++,
          isPublished: true,
          xpReward: lData.xp,
          coinReward: Math.floor(lData.xp / 2)
        }
      });

      // Create steps based on lesson type
      const steps = [];
      
      if (lData.type === LessonType.LESSON) {
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.EXPLANATION,
          title: `Konu Anlatımı: ${lData.title}`,
          content: `${lData.title} konusu, Python'da çok önemli bir yere sahiptir. Bu derste ${lData.title.toLowerCase()} kavramını öğreneceğiz.`,
          order: 1
        });
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.EXAMPLE,
          title: 'Örnek Kullanım',
          content: 'İşte bu kavramın nasıl kullanıldığına dair basit bir örnek:',
          code: `# ${lData.title} Örneği\nprint("Merhaba ${lData.title}")\nx = 5\ny = 10\nprint(x + y)`,
          language: 'python',
          order: 2
        });
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.PRACTICE,
          title: 'Sıra Sende',
          content: 'Şimdi sıra sende! Öğrendiklerini pekiştirmek için aşağıdaki alana kendi kodunu yaz.',
          code: `# Kodunu buraya yaz\n`,
          language: 'python',
          order: 3
        });
      } else if (lData.type === LessonType.QUIZ) {
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.EXPLANATION,
          title: 'Quiz Hazırlığı',
          content: 'Bu bölümde öğrendiğiniz konuları test etmek için bir quiz çözeceksiniz. Başarılar!',
          order: 1
        });
        // We will mock quiz by just adding a text step, actual quiz system would use Quiz models
      } else if (lData.type === LessonType.CHALLENGE) {
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.EXPLANATION,
          title: 'Zorluk: Görevi Tamamla',
          content: 'Bu görevde, öğrendiğiniz tüm bilgileri birleştirerek bir problemi çözmeniz bekleniyor.',
          order: 1
        });
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.CHALLENGE,
          title: 'Kodlama Görevi',
          content: 'Aşağıdaki problemi çözen bir Python kodu yazın.',
          code: `def solution():\n    # Kodunuzu buraya yazın\n    pass\n`,
          language: 'python',
          order: 2
        });
      } else if (lData.type === LessonType.PROJECT) {
        steps.push({
          lessonId: lesson.id,
          type: LessonStepType.EXPLANATION,
          title: 'Proje Aşaması',
          content: 'Bu bölümde büyük bir proje geliştireceksiniz. Öğrendiğiniz her şeyi kullanma vakti.',
          order: 1
        });
      }

      await prisma.lessonStep.createMany({ data: steps });
      totalLessonsAdded++;
    }
  }

  await prisma.course.update({
    where: { id: course.id },
    data: { totalLessons: totalCourseLessons }
  });

  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  const usersData = [
    { email: 'admin@codetr.dev', password: passwordHash, role: UserRole.ADMIN, name: 'Admin', username: 'admin' },
    { email: 'ayse@example.com', password: userPasswordHash, name: 'Ayşe Kılıç', username: 'aysekilic', xp: 2500, level: 8, coins: 850, currentStreak: 7, totalXpEarned: 2500, totalCoinsEarned: 1000 },
    { email: 'mehmet@example.com', password: userPasswordHash, name: 'Mehmet Tekin', username: 'mehmettekin', xp: 1200, level: 5, coins: 400, currentStreak: 3, totalXpEarned: 1200, totalCoinsEarned: 500 },
    { email: 'zeynep@example.com', password: userPasswordHash, name: 'Zeynep Arslan', username: 'zeyneparslan', xp: 5600, level: 15, coins: 2000, currentStreak: 30, totalXpEarned: 5600, totalCoinsEarned: 3000 },
    { email: 'ali@example.com', password: userPasswordHash, name: 'Ali Yıldız', username: 'aliyildiz', xp: 300, level: 2, coins: 120, currentStreak: 1, totalXpEarned: 300, totalCoinsEarned: 120 },
    { email: 'fatma@example.com', password: userPasswordHash, name: 'Fatma Öztürk', username: 'fatmaozturk', xp: 800, level: 4, coins: 290, currentStreak: 5, totalXpEarned: 800, totalCoinsEarned: 400 }
  ];

  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    
    // Enroll in Python course
    if (user.role !== UserRole.ADMIN) {
      const progress = Math.random() * 80; // random progress between 0 and 80%
      await prisma.courseEnrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          progress: progress,
          completed: false
        }
      });
      
      // Seed some activity for leaderboard
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: 'lesson_completed',
          xpEarned: Math.floor(Math.random() * 50) + 10,
          data: { courseId: course.id }
        }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
