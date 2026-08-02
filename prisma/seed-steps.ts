import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting to seed lesson steps...");

  const pythonCourse = await prisma.course.findFirst({
    where: { slug: "python" },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            take: 5
          }
        }
      }
    }
  });

  if (!pythonCourse || !pythonCourse.chapters.length) {
    console.log("Python course or chapters not found.");
    return;
  }

  const firstChapter = pythonCourse.chapters[0];
  const first5Lessons = firstChapter.lessons;

  console.log(`Found ${first5Lessons.length} lessons in first chapter. Seeding steps...`);


  const lessonsData = [
    {
      // Lesson 1: "Python Nedir?"
      id: first5Lessons[0].id,
      steps: [
        {
          order: 1,
          type: "EXPLANATION",
          title: "Python'a Giriş",
          content: "<h2>Python Nedir?</h2><p>Python 1991 yılında Guido van Rossum tarafından geliştirilmiş genel amaçlı bir programlama dilidir. Web geliştirme, veri bilimi, yapay zeka ve otomasyon gibi birçok alanda kullanılır. Okunabilir sözdizimi ile bilinir.</p><p>Eğlenceli bilgi: Google, Netflix ve NASA Python kullanır!</p><div class=\"code-block\">print(\"Merhaba, Dünya!\")</div>"
        },
        {
          order: 2,
          type: "EXAMPLE",
          title: "Python Kodu Nasıl Görünür?",
          content: "<p>Aşağıda bazı basit Python kodu örnekleri verilmiştir:</p>",
          code: "# Python ile merhaba\nprint(\"Merhaba, Dünya!\")\n\n# Matematik\nprint(2 + 2)\n\n# String\nprint(\"Python\" + \" \" + \"harika!\")"
        },
        {
          order: 3,
          type: "SUMMARY",
          title: "Harika! 🎉",
          content: "<p>Python'un ne olduğunu ve nerelerde kullanıldığını öğrendin. İlk dersini tamamladın, tebrikler!</p>"
        }
      ]
    },
    {
      // Lesson 2: "Python Kurulumu"
      id: first5Lessons[1].id,
      steps: [
        {
          order: 1,
          type: "EXPLANATION",
          title: "Kurulum Gerekmez!",
          content: "<p>CodeTR platformunda Python doğrudan tarayıcı içinde WebAssembly (Pyodide) teknolojisi ile çalışır. Hiçbir kurulum yapmana gerek yok. Sadece kodu yaz ve Çalıştır butonuna bas.</p><table><thead><tr><th>Geleneksel</th><th>CodeTR</th></tr></thead><tbody><tr><td>İndir → Kur → Yapılandır → Çalıştır</td><td>Yaz → Çalıştır</td></tr></tbody></table>"
        },
        {
          order: 2,
          type: "EXAMPLE",
          title: "Hemen Dene!",
          content: "<p>Sağ taraftaki kod editöründe bu kodları çalıştırmayı dene.</p>",
          code: "# Bu kodu çalıştır!\nprint(\"Merhaba CodeTR!\")\nprint(\"Python tarayıcıda çalışıyor!\")\nprint(1 + 1)"
        },
        {
          order: 3,
          type: "SUMMARY",
          title: "Hazırsın! 🚀",
          content: "<p>Kurulum gerektirmeden kod yazabilmenin keyfini çıkar!</p>"
        }
      ]
    },
    {
      // Lesson 3: "İlk Programımız"
      id: first5Lessons[2].id,
      steps: [
        {
          order: 1,
          type: "EXPLANATION",
          title: "print() Fonksiyonu",
          content: "<p><code>print()</code> fonksiyonu ekrana çıktı yazdırmak için kullanılır. Kullanımı: <code>print(değer)</code> şeklindedir.</p><p>Metinleri tırnak içinde, sayıları tırnaksız yazdırabilirsin. Birden fazla değeri virgülle ayırarak aynı satırda yazdırabilirsin.</p>"
        },
        {
          order: 2,
          type: "EXAMPLE",
          title: "print() Örnekleri",
          content: "<p>İşte <code>print()</code> fonksiyonunun farklı kullanımları:</p>",
          code: "print(\"Merhaba Dünya\")\nprint(42)\nprint(3.14)\nprint(\"Adım:\", \"Ali\")\nprint(\"1 + 1 =\", 1 + 1)"
        },
        {
          order: 3,
          type: "CHALLENGE",
          title: "Sıra Sende! 💪",
          content: "<p>Ekrana kendi adını ve yaşını yazdıran bir program yaz. İki ayrı <code>print()</code> kullan.</p>",
          challenge: {
            title: "İlk Programım",
            description: "print() kullanarak adını ve yaşını ayrı satırlarda yazdır.",
            starterCode: "# Adını yazdır\n# Yaşını yazdır",
            solutionCode: "print(\"Ali\")\nprint(25)",
            testCases: [
              {
                order: 1,
                input: "",
                expectedOutput: "",
                description: "print() ile en az iki satır çıktı ver",
                isHidden: false
              },
              {
                order: 2,
                input: "",
                expectedOutput: ".*\\n.*",
                description: "İki satır yazdırmalısın",
                isHidden: true
              }
            ]
          }
        },
        {
          order: 4,
          type: "SUMMARY",
          title: "Süpersin! ⭐",
          content: "<p>İlk çalışan programını yazdın, tebrikler!</p>"
        }
      ]
    }
  ];

  // Only process lessons that actually exist in DB
  const availableLessonsData = lessonsData.filter((_, i) => i < first5Lessons.length);

  for (const lessonData of availableLessonsData) {
    const lessonId = lessonData.id;
    
    await prisma.lessonStep.deleteMany({ where: { lessonId } });
    await prisma.codeChallenge.deleteMany({ where: { lessonId } });

    for (const step of lessonData.steps) {
      const stepRecord = await prisma.lessonStep.create({
        data: {
          lessonId,
          order: step.order,
          type: step.type as any,
          title: step.title,
          content: step.content,
          code: step.code || null,
        }
      });

      if (step.challenge) {
        const challenge = await prisma.codeChallenge.create({
          data: {
            lessonId,
            title: step.challenge.title,
            description: step.challenge.description,
            starterCode: step.challenge.starterCode,
            solutionCode: step.challenge.solutionCode,
          }
        });

        for (const tc of step.challenge.testCases) {
          await prisma.testCase.create({
            data: {
              challengeId: challenge.id,
              order: tc.order,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              description: tc.description,
              isHidden: tc.isHidden
            }
          });
        }
      }
    }
    console.log(`Seeded steps for lesson ID: ${lessonId}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
