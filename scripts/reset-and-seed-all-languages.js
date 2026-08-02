const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function resetAllUserData() {
  console.log('🔄 1/3: Resetting all user XP, coins, levels, streak, and progress...');

  // Delete progress and enrollments
  await db.lessonProgress.deleteMany({});
  await db.courseEnrollment.deleteMany({});
  await db.codeSubmission.deleteMany({});
  await db.userAchievement.deleteMany({});
  await db.userDailyReward.deleteMany({});
  await db.keyRedemption.deleteMany({});
  await db.certificate.deleteMany({});

  // Reset all users
  await db.user.updateMany({
    data: {
      xp: 0,
      level: 1,
      coins: 100, // Starter bonus coins
      totalXpEarned: 0,
      totalCoinsEarned: 100,
      currentStreak: 0,
      longestStreak: 0,
      lastStreakDate: null,
      lastLoginDate: null,
    }
  });

  console.log('✅ User progress reset to 0 (with 100 starter coins).');
}

async function getOrCreateCourse(data) {
  const existing = await db.course.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return db.course.update({ where: { slug: data.slug }, data });
  }
  return db.course.create({ data });
}

async function getOrCreateChapter(courseId, title, order, description) {
  const existing = await db.chapter.findFirst({ where: { courseId, order } });
  if (existing) {
    return db.chapter.update({ where: { id: existing.id }, data: { title, description, isPublished: true } });
  }
  return db.chapter.create({ data: { courseId, title, order, description, isPublished: true } });
}

async function createLessonWithSteps(chapterId, title, type, order, xpReward, coinReward, steps, challenge = null) {
  let lesson = await db.lesson.findFirst({ where: { chapterId, order } });
  if (!lesson) {
    lesson = await db.lesson.create({
      data: { chapterId, title, type, order, isPublished: true, xpReward, coinReward }
    });
  } else {
    await db.lesson.update({ where: { id: lesson.id }, data: { title, type, xpReward, coinReward } });
  }

  await db.lessonStep.deleteMany({ where: { lessonId: lesson.id } });
  await db.codeChallenge.deleteMany({ where: { lessonId: lesson.id } });

  for (const s of steps) {
    await db.lessonStep.create({
      data: {
        lessonId: lesson.id,
        order: s.order,
        type: s.type,
        title: s.title || null,
        content: s.content,
        code: s.code || null,
        language: s.language || 'python',
      }
    });
  }

  if (challenge) {
    const ch = await db.codeChallenge.create({
      data: {
        lessonId: lesson.id,
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        solutionCode: challenge.solutionCode,
        language: challenge.language || 'python',
        difficulty: challenge.difficulty || 'easy',
      }
    });

    for (const tc of challenge.testCases) {
      await db.testCase.create({
        data: {
          challengeId: ch.id,
          order: tc.order,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput,
          description: tc.description || '',
          isHidden: tc.isHidden || false,
        }
      });
    }
  }

  return lesson;
}

async function seedAllCourses() {
  console.log('\n📚 2/3: Seeding 10 Programming Languages Courses & Lessons...');

  // 1. PYTHON
  const python = await getOrCreateCourse({
    title: 'Python Programlama',
    slug: 'python',
    description: 'Sıfırdan Python öğren. Değişkenler, döngüler, veri yapıları ve veri analizi temelleri.',
    language: 'python',
    icon: '🐍',
    color: '#3776AB',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 2000,
  });

  const pyCh1 = await getOrCreateChapter(python.id, 'Python Temelleri', 1, 'Python söz dizimi ve veri tipleri');
  await createLessonWithSteps(pyCh1.id, "Python'a Giriş ve print()", "LESSON", 1, 25, 5, [
    { order: 1, type: "EXPLANATION", title: "Python Nedir?", language: "python", content: "<h2>Python Nedir?</h2><p>Python, anlaşılması ve yazılması son derece kolay olan popüler bir dildir.</p>" },
    { order: 2, type: "EXAMPLE", title: "İlk Python Kodu", language: "python", content: "<p>Konsola yazdırma:</p>", code: 'print("Merhaba, CodeTR! 🚀")\nprint(10 + 20)' },
    { order: 3, type: "SUMMARY", title: "Harika Başlangıç!", content: "<p>Python'a ilk adımı attın!</p>" }
  ]);

  await createLessonWithSteps(pyCh1.id, "Değişkenler ve Veri Tipleri", "LESSON", 2, 30, 6, [
    { order: 1, type: "EXPLANATION", title: "Değişken Tanımlama", language: "python", content: "<h2>Python Değişkenleri</h2><p>Python'da değişken tanımlarken tür belirtmeye gerek yoktur.</p>" },
    { order: 2, type: "EXAMPLE", title: "Örnek", language: "python", content: "<p>Değişken tanımları:</p>", code: 'isim = "Ahmet"\nyas = 22\npuan = 95.5\naktif = True\nprint(f"{isim} - {yas} yaşında - {puan} puan")' },
    { order: 3, type: "SUMMARY", title: "Tamamlandı!", content: "<p>Değişkenleri öğrendin!</p>" }
  ]);

  // 2. JAVASCRIPT
  const js = await getOrCreateCourse({
    title: 'JavaScript ile Web Programlama',
    slug: 'javascript',
    description: 'Dinamik web uygulamaları ve modern ES6+ JS dünyasını keşfet.',
    language: 'javascript',
    icon: '⚡',
    color: '#F7DF1E',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 2200,
  });

  const jsCh1 = await getOrCreateChapter(js.id, 'JS Temelleri', 1, 'Değişkenler, let, const ve fonksiyonlar');
  await createLessonWithSteps(jsCh1.id, 'JavaScript Değişkenleri', 'LESSON', 1, 25, 5, [
    { order: 1, type: 'EXPLANATION', title: 'let ve const', language: 'javascript', content: '<h2>JS Değişkenleri</h2><p>Modern JS let ve const kullanır.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'JS Kodu', language: 'javascript', content: '<p>Konsola yazdırma:</p>', code: 'const site = "CodeTR";\nlet puan = 100;\nconsole.log(`${site} - Puan: ${puan}`);' },
    { order: 3, type: 'SUMMARY', title: 'Tebrikler!', content: '<p>JavaScript temellerini öğrendin.</p>' }
  ]);

  // 3. TYPESCRIPT
  const ts = await getOrCreateCourse({
    title: 'TypeScript ile Tip Güvenliği',
    slug: 'typescript',
    description: 'JavaScript kodunu tip güvenliği ve interface ile güçlendir.',
    language: 'typescript',
    icon: '📘',
    color: '#3178C6',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 2500,
  });

  const tsCh1 = await getOrCreateChapter(ts.id, 'TypeScript Giriş', 1, 'Statik tipler ve Interface');
  await createLessonWithSteps(tsCh1.id, 'Statik Tipler', 'LESSON', 1, 30, 6, [
    { order: 1, type: 'EXPLANATION', title: 'Neden TypeScript?', language: 'typescript', content: '<h2>TypeScript</h2><p>JS üzerine statik tip sistemi ekler.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'TS Örneği', language: 'typescript', content: '<p>Tip tanımları:</p>', code: 'let isim: string = "Zeynep";\nlet yas: number = 24;\nconsole.log(isim, yas);' },
    { order: 3, type: 'SUMMARY', title: 'Harika!', content: '<p>TypeScript temel tiplerini öğrendin.</p>' }
  ]);

  // 4. HTML & CSS
  const htmlcss = await getOrCreateCourse({
    title: 'HTML5 & CSS3 Tasarım',
    slug: 'html-css',
    description: 'Web sayfalarının yapısını kur, CSS Flexbox & Grid ile tasarla.',
    language: 'html',
    icon: '🎨',
    color: '#E34F26',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 1800,
  });

  const htmlCh1 = await getOrCreateChapter(htmlcss.id, 'HTML Yapısı', 1, 'Etiketler ve Flexbox');
  await createLessonWithSteps(htmlCh1.id, 'HTML İskeleti', 'LESSON', 1, 20, 4, [
    { order: 1, type: 'EXPLANATION', title: 'HTML5 Yapısı', language: 'html', content: '<h2>HTML5</h2><p>Web sayfalarının temel iskeleti.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'HTML Kodu', language: 'html', content: '<p>İlk etiketler:</p>', code: '<h1>Merhaba Dünya</h1>\n<p>CodeTR ile HTML öğreniyorum.</p>' },
    { order: 3, type: 'SUMMARY', title: 'Tebrikler!', content: '<p>HTML iskeletini kavradın!</p>' }
  ]);

  // 5. JAVA
  const java = await getOrCreateCourse({
    title: 'Java Nesne Tabanlı Programlama',
    slug: 'java',
    description: "Java'nın güçlü nesne yönelimli mimarisi (OOP) ve JVM dünyası.",
    language: 'java',
    icon: '☕',
    color: '#ED8B00',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 2800,
  });

  const javaCh1 = await getOrCreateChapter(java.id, 'Java Temelleri', 1, 'Public Class ve Main Metodu');
  await createLessonWithSteps(javaCh1.id, 'Java Giriş', 'LESSON', 1, 30, 6, [
    { order: 1, type: 'EXPLANATION', title: 'Java Nedir?', language: 'java', content: '<h2>Java</h2><p>Write once, run anywhere prensibiyle çalışan dil.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'Java Kodu', language: 'java', content: '<p>Main metodu:</p>', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Merhaba Java!");\n    }\n}' },
    { order: 3, type: 'SUMMARY', title: 'Tebrikler!', content: '<p>Java temelleri tamamlandı.</p>' }
  ]);

  // 6. C#
  const csharp = await getOrCreateCourse({
    title: 'C# ve .NET Geliştirme',
    slug: 'csharp',
    description: 'Microsoft .NET ekosisteminde C# ile uygulama geliştirme.',
    language: 'csharp',
    icon: '🔷',
    color: '#239120',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 2700,
  });

  const csCh1 = await getOrCreateChapter(csharp.id, 'C# Temelleri', 1, 'Console App ve Veri Tipleri');
  await createLessonWithSteps(csCh1.id, 'C# Console Giriş', 'LESSON', 1, 25, 5, [
    { order: 1, type: 'EXPLANATION', title: 'C# Nedir?', language: 'csharp', content: '<h2>C# & .NET</h2><p>Modern nesne yönelimli sistem dili.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'Console App', language: 'csharp', content: '<p>Console.WriteLine:</p>', code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Merhaba C#!");\n    }\n}' },
    { order: 3, type: 'SUMMARY', title: 'Tamamlandı!', content: '<p>C# dersini bitirdin.</p>' }
  ]);

  // 7. C++
  const cpp = await getOrCreateCourse({
    title: 'C++ Sistem ve Oyun Programlama',
    slug: 'cpp',
    description: 'Yüksek performanslı bellek yönetimi, pointerlar ve C++ temelleri.',
    language: 'cpp',
    icon: '⚡',
    color: '#00599C',
    level: 'ADVANCED',
    isPublished: true,
    isFeatured: false,
    xpReward: 3200,
  });

  const cppCh1 = await getOrCreateChapter(cpp.id, 'C++ Temelleri', 1, 'std::cout ve Bellek');
  await createLessonWithSteps(cppCh1.id, 'C++ Giriş', 'LESSON', 1, 35, 7, [
    { order: 1, type: 'EXPLANATION', title: 'C++ Nedir?', language: 'cpp', content: '<h2>C++</h2><p>Yüksek hızlı sistem ve oyun motoru geliştirme dili.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'C++ Kodu', language: 'cpp', content: '<p>iostream kullanımı:</p>', code: '#include <iostream>\n\nint main() {\n    std::cout << "Merhaba C++!" << std::endl;\n    return 0;\n}' },
    { order: 3, type: 'SUMMARY', title: 'Tebrikler!', content: '<p>C++ temellerini öğrendin.</p>' }
  ]);

  // 8. GO (GOLANG)
  const golang = await getOrCreateCourse({
    title: 'Go (Golang) ile Backend',
    slug: 'go',
    description: 'Google tarafından geliştirilen hızlı, eşzamanlı (goroutine) sistem dili.',
    language: 'go',
    icon: '🐹',
    color: '#00ADD8',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 2900,
  });

  const goCh1 = await getOrCreateChapter(golang.id, 'Go Temelleri', 1, 'package main ve fmt');
  await createLessonWithSteps(goCh1.id, 'Go Giriş', 'LESSON', 1, 30, 6, [
    { order: 1, type: 'EXPLANATION', title: 'Go Nedir?', language: 'go', content: '<h2>Go / Golang</h2><p>Bulut ve mikroservis mimarilerinin vazgeçilmezi.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'Go Kodu', language: 'go', content: '<p>fmt.Println:</p>', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Merhaba Go 🐹")\n}' },
    { order: 3, type: 'SUMMARY', title: 'Tamamlandı!', content: '<p>Go ile tanıştın.</p>' }
  ]);

  // 9. RUST
  const rust = await getOrCreateCourse({
    title: 'Rust Güvenli Sistem Programlama',
    slug: 'rust',
    description: 'Garbage collector olmadan bellek güvenliği (ownership/borrowing).',
    language: 'rust',
    icon: '🦀',
    color: '#DEA584',
    level: 'ADVANCED',
    isPublished: true,
    isFeatured: false,
    xpReward: 3500,
  });

  const rustCh1 = await getOrCreateChapter(rust.id, 'Rust Temelleri', 1, 'println! makrosu ve Ownership');
  await createLessonWithSteps(rustCh1.id, 'Rust Giriş', 'LESSON', 1, 35, 7, [
    { order: 1, type: 'EXPLANATION', title: 'Rust Nedir?', language: 'rust', content: '<h2>Rust 🦀</h2><p>Sıfır maliyetli soyutlama ve tam bellek güvenliği.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'Rust Kodu', language: 'rust', content: '<p>fn main():</p>', code: 'fn main() {\n    println!("Merhaba Rust! 🦀");\n}' },
    { order: 3, type: 'SUMMARY', title: 'Harika!', content: '<p>Rust dünyasına ilk adımı attın.</p>' }
  ]);

  // 10. SQL
  const sql = await getOrCreateCourse({
    title: 'SQL ve Veritabanı Sorgulama',
    slug: 'sql',
    description: 'İlişkisel veritabanları, SELECT, JOIN ve veritabanı yönetimi.',
    language: 'sql',
    icon: '🗄️',
    color: '#4479A1',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 2000,
  });

  const sqlCh1 = await getOrCreateChapter(sql.id, 'SQL Temelleri', 1, 'SELECT ve WHERE Sorguları');
  await createLessonWithSteps(sqlCh1.id, 'SELECT Sorgusu', 'LESSON', 1, 20, 4, [
    { order: 1, type: 'EXPLANATION', title: 'SQL Nedir?', language: 'sql', content: '<h2>SQL (Structured Query Language)</h2><p>Verileri sorgulama dili.</p>' },
    { order: 2, type: 'EXAMPLE', title: 'SELECT Örneği', language: 'sql', content: '<p>Temel sorgu:</p>', code: 'SELECT id, isim, email FROM kullanicilar WHERE aktif = true;' },
    { order: 3, type: 'SUMMARY', title: 'Tebrikler!', content: '<p>SQL temelini öğrendin.</p>' }
  ]);

  // Update total lesson counts on courses
  const allCourses = await db.course.findMany();
  for (const c of allCourses) {
    const totalLessons = await db.lesson.count({ where: { chapter: { courseId: c.id } } });
    await db.course.update({ where: { id: c.id }, data: { totalLessons } });
  }

  console.log(`✅ 10 Programming Languages successfully seeded (${allCourses.length} total courses).`);
}

async function main() {
  await resetAllUserData();
  await seedAllCourses();
  console.log('\n🎉 ALL DONE! Users reset to 0, 10 programming languages active.');
  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
