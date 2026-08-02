const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// ─── Helper ────────────────────────────────────────────────────────────────────
async function getOrCreateCourse(data) {
  const existing = await db.course.findUnique({ where: { slug: data.slug } });
  if (existing) { console.log(`  ⚠️  Course exists: ${data.slug}`); return existing; }
  const course = await db.course.create({ data });
  console.log(`  ✅ Created course: ${data.title}`);
  return course;
}

async function getOrCreateChapter(courseId, title, order, description) {
  const existing = await db.chapter.findFirst({ where: { courseId, order } });
  if (existing) return existing;
  return db.chapter.create({ data: { courseId, title, order, description, isPublished: true } });
}

async function getOrCreateLesson(chapterId, title, type, order, xp = 25) {
  const existing = await db.lesson.findFirst({ where: { chapterId, order } });
  if (existing) return existing;
  return db.lesson.create({
    data: { chapterId, title, type, order, isPublished: true, xpReward: xp, coinReward: Math.ceil(xp / 5) }
  });
}

async function seedLesson(lessonId, steps, challenge = null) {
  await db.lessonStep.deleteMany({ where: { lessonId } });
  await db.codeChallenge.deleteMany({ where: { lessonId } });

  for (const step of steps) {
    await db.lessonStep.create({
      data: {
        lessonId,
        order: step.order,
        type: step.type,
        title: step.title || null,
        content: step.content,
        code: step.code || null,
        language: step.language || 'javascript',
      }
    });
  }

  if (challenge) {
    const ch = await db.codeChallenge.create({
      data: {
        lessonId,
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        solutionCode: challenge.solutionCode,
        language: challenge.language || 'javascript',
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
  console.log(`    ✅ Seeded lesson: ${lessonId}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// JAVASCRIPT COURSE
// ──────────────────────────────────────────────────────────────────────────────
async function seedJavaScript() {
  console.log('\n📚 JavaScript Kursu');

  const course = await getOrCreateCourse({
    title: 'JavaScript ile Web Programlama',
    slug: 'javascript',
    description: 'Sıfırdan JavaScript öğren, dinamik web sayfaları oluştur, modern ES6+ söz dizimini keşfet.',
    language: 'javascript',
    icon: '⚡',
    color: '#F7DF1E',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 2000,
    totalLessons: 0,
  });

  // Chapter 1: Temeller
  const ch1 = await getOrCreateChapter(course.id, 'JavaScript Temelleri', 1, 'JS nedir, nasıl çalışır?');
  const l1_1 = await getOrCreateLesson(ch1.id, "JavaScript Nedir?", 'LESSON', 1, 20);
  const l1_2 = await getOrCreateLesson(ch1.id, "Değişkenler: let, const, var", 'LESSON', 2, 25);
  const l1_3 = await getOrCreateLesson(ch1.id, "Veri Tipleri", 'LESSON', 3, 25);
  const l1_4 = await getOrCreateLesson(ch1.id, "Operatörler", 'LESSON', 4, 25);

  await seedLesson(l1_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: "JavaScript Nedir?", language: 'javascript',
      content: `<h2>JavaScript Nedir?</h2>
<p>JavaScript, web sayfalarını <strong>dinamik ve etkileşimli</strong> hale getiren programlama dilidir. HTML yapıyı, CSS görünümü sağlarken JavaScript <em>davranışı</em> kontrol eder.</p>
<h3>JS Ne Yapabilir?</h3>
<ul>
<li>🖱️ Kullanıcı tıklamalarına tepki ver</li>
<li>📡 Sunucudan veri çek (API)</li>
<li>✨ Animasyonlar oluştur</li>
<li>📝 Form verilerini doğrula</li>
<li>⚙️ Tarayıcı depolama alanını kullan</li>
</ul>
<h3>Nerede Çalışır?</h3>
<p>JS hem <strong>tarayıcıda</strong> (frontend) hem de <strong>sunucuda</strong> (Node.js ile backend) çalışır!</p>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'İlk JavaScript Kodun', language: 'javascript',
      content: '<p>Tarayıcı konsoluna mesaj yazalım:</p>',
      code: `// Konsola mesaj yazdır
console.log("Merhaba, JavaScript!");

// Basit hesaplar
console.log(2 + 2);      // 4
console.log(10 * 5);     // 50
console.log("CodeTR" + " " + "🚀");  // CodeTR 🚀

// alert() ile popup göster (tarayıcıda)
// alert("Hoş geldin!");`
    },
    { order: 3, type: 'SUMMARY', title: 'Harika Başlangıç! 🎉', content: '<p>JavaScript dünyasına ilk adımı attın! Şimdi değişkenleri öğreneceğiz.</p>' }
  ]);

  await seedLesson(l1_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'let, const ve var', language: 'javascript',
      content: `<h2>JavaScript Değişkenleri</h2>
<p>Modern JavaScript'te değişken tanımlamak için <code>let</code> ve <code>const</code> kullanılır.</p>
<div class="code-block">// const - değeri değiştirilemez
const PI = 3.14159;
const isim = "Ayşe";

// let - değeri değiştirilebilir  
let yas = 20;
yas = 21; // ✅ OK

// var - eski yöntem (kullanmaktan kaçın!)
var eskiYontem = "kaçın";</div>
<h3>Ne Zaman Ne Kullan?</h3>
<ul>
<li><code>const</code>: değer değişmeyecekse (önerilen default)</li>
<li><code>let</code>: değer değişecekse</li>
<li><code>var</code>: kullanma! (scope sorunları var)</li>
</ul>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Değişken Örnekleri', language: 'javascript',
      content: '<p>Farklı tiplerle değişken kullanımı:</p>',
      code: `// const ile sabit değerler
const site = "CodeTR";
const yil = 2025;
const aktif = true;

// let ile değişen değerler
let puan = 0;
puan += 10;
puan += 25;
console.log("Puanın:", puan); // 35

// Birden fazla atama
let x = 1, y = 2, z = 3;
console.log(x + y + z); // 6

// Template literal (şablon dizesi)
const mesaj = \`\${site}'e hoş geldin! Yılımız: \${yil}\`;
console.log(mesaj);`
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Değişkenleri Tanımla!', language: 'javascript',
      content: '<p><code>isim</code>, <code>yas</code> ve <code>sehir</code> değişkenleri oluştur, template literal ile yazdır.</p>'
    },
    { order: 4, type: 'SUMMARY', title: 'Değişkenleri Öğrendin! ⚡', content: '<p><code>let</code> ve <code>const</code> artık senin için sır değil!</p>' }
  ], {
    title: 'Kişisel Tanıtım',
    description: 'isim, yas, sehir değişkenlerini oluştur ve template literal ile yazdır.',
    starterCode: '// isim, yas ve sehir değişkenlerini tanımla\n\n// Template literal ile yazdır: "Merhaba, ben [isim], [yas] yaşındayım ve [sehir]\'de yaşıyorum."',
    solutionCode: 'const isim = "Ali";\nconst yas = 22;\nconst sehir = "Istanbul";\nconsole.log(`Merhaba, ben ${isim}, ${yas} yaşındayım ve ${sehir}\'de yaşıyorum.`);',
    language: 'javascript',
    testCases: [{ order: 1, input: '', expectedOutput: '', description: 'Çıktı template literal formatında olmalı', isHidden: true }]
  });

  await seedLesson(l1_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'JS Veri Tipleri', language: 'javascript',
      content: `<h2>JavaScript Veri Tipleri</h2>
<p>JavaScript'te 7 temel (primitive) veri tipi vardır:</p>
<div class="code-block">typeof "merhaba"   // "string"
typeof 42          // "number"
typeof 3.14        // "number"  (int/float farkı yok!)
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object"  (tarihi bir hata!)
typeof Symbol()    // "symbol"
typeof 42n         // "bigint"</div>
<h3>String (Metin)</h3>
<div class="code-block">const tek = 'tek tırnak';
const cift = "çift tırnak";
const sifrelon = \`şablon\`; // template literal</div>
<h3>Number (Sayı)</h3>
<div class="code-block">const tam = 42;
const ondalik = 3.14;
const sonsuz = Infinity;
const gecersiz = NaN; // Not a Number</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'typeof Operatörü', language: 'javascript',
      code: `// Tip kontrolü
console.log(typeof "CodeTR");    // string
console.log(typeof 2025);        // number
console.log(typeof true);        // boolean
console.log(typeof undefined);   // undefined
console.log(typeof null);        // object (!)
console.log(typeof [1,2,3]);     // object
console.log(typeof {a: 1});      // object

// Tip dönüşümü
console.log(Number("42"));       // 42
console.log(String(42));         // "42"
console.log(Boolean(0));         // false
console.log(Boolean(""));        // false
console.log(Boolean("sıfır"));   // true`,
      content: '<p>typeof ile tip kontrolü:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Tipler Tamam! 📊', content: '<p>JS veri tiplerini öğrendin. Number hem int hem float — bu JS özelliği!</p>' }
  ]);

  await seedLesson(l1_4.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'JS Operatörleri', language: 'javascript',
      content: `<h2>JavaScript Operatörleri</h2>
<h3>Aritmetik</h3>
<div class="code-block">5 + 3   // 8
10 - 4  // 6
3 * 4   // 12
15 / 4  // 3.75
15 % 4  // 3  (kalan)
2 ** 8  // 256 (üs)</div>
<h3>Karşılaştırma (= vs == vs ===)</h3>
<div class="code-block">// == tip dönüşümü yapar (kaçın!)
"5" == 5    // true  ⚠️

// === hem değer hem tip kontrol eder (kullan!)
"5" === 5   // false ✅
5 === 5     // true  ✅</div>
<h3>Mantıksal</h3>
<div class="code-block">true && false  // false (ve)
true || false  // true  (veya)
!true          // false (değil)</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Operatör Örnekleri', language: 'javascript',
      code: `// Aritmetik
let toplam = 10 + 5;
let carpim = 3 * 7;
console.log(toplam, carpim); // 15 21

// Kısayol operatörler
let sayac = 0;
sayac++;           // 1
sayac += 5;        // 6
sayac *= 2;        // 12
console.log(sayac); // 12

// Karşılaştırma (=== kullan!)
console.log(10 === 10);   // true
console.log("5" === 5);   // false
console.log(null == undefined);  // true
console.log(null === undefined); // false

// Mantıksal
const yasli = 25 > 18 && 25 < 65;
console.log("Çalışma çağında:", yasli); // true`,
      content: '<p>Operatör örnekleri:</p>'
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Hesap Makinesi!', language: 'javascript',
      content: '<p>a=17, b=5 ile; toplam, fark, çarpım, bölüm ve kalanı hesapla.</p>'
    },
    { order: 4, type: 'SUMMARY', title: 'Operatörler Tamamlandı! ✅', content: '<p>Her zaman <strong>===</strong> kullan, <strong>==</strong> değil!</p>' }
  ], {
    title: 'Temel Hesaplamalar',
    description: 'a=17, b=5 ile tüm temel işlemleri console.log ile yazdır.',
    starterCode: 'const a = 17;\nconst b = 5;\n\n// Toplam, fark, carpim, bolum, kalan',
    solutionCode: 'const a = 17;\nconst b = 5;\nconsole.log(a + b);\nconsole.log(a - b);\nconsole.log(a * b);\nconsole.log(a / b);\nconsole.log(a % b);',
    language: 'javascript',
    testCases: [{ order: 1, input: '', expectedOutput: '22\n12\n85\n3.4\n2', description: 'Tüm işlemler', isHidden: false }]
  });

  // Chapter 2: Kontrol Akışı
  const ch2 = await getOrCreateChapter(course.id, 'Kontrol Akışı', 2, 'if/else, döngüler ve koşullar');
  const l2_1 = await getOrCreateLesson(ch2.id, 'if / else / else if', 'LESSON', 1, 30);
  const l2_2 = await getOrCreateLesson(ch2.id, 'Döngüler: for ve while', 'LESSON', 2, 30);
  const l2_3 = await getOrCreateLesson(ch2.id, 'switch İfadesi', 'LESSON', 3, 25);

  await seedLesson(l2_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'if / else', language: 'javascript',
      content: `<h2>Koşul İfadeleri</h2>
<div class="code-block">if (koşul) {
  // doğruysa
} else if (digerKoşul) {
  // diğer koşul doğruysa
} else {
  // hiçbiri değilse
}</div>
<h3>Ternary Operator (Kısayol)</h3>
<div class="code-block">// koşul ? doğru : yanlış
const mesaj = yas >= 18 ? "Yetişkin" : "Genç";

// Nullish coalescing (??)
const isim = kullanici?.isim ?? "Misafir";</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Koşul Örnekleri', language: 'javascript',
      code: `const not = 75;

// Klasik if/else
if (not >= 90) {
  console.log("Pekiyi");
} else if (not >= 75) {
  console.log("İyi");
} else if (not >= 60) {
  console.log("Orta");
} else {
  console.log("Zayıf");
}

// Ternary
const durum = not >= 50 ? "Geçti ✅" : "Kaldı ❌";
console.log(durum);

// Optional chaining + nullish
const kullanici = { profil: { ad: "Ali" } };
const ad = kullanici?.profil?.ad ?? "Bilinmiyor";
console.log(ad);`,
      content: '<p>if/else ve modern JS kısayolları:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Koşullar Öğrenildi! 🎯', content: '<p>Ternary ve optional chaining modern JS yazmanın anahtarı!</p>' }
  ]);

  await seedLesson(l2_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'for ve while Döngüleri', language: 'javascript',
      content: `<h2>Döngüler</h2>
<div class="code-block">// for döngüsü
for (let i = 0; i < 5; i++) {
  console.log(i); // 0,1,2,3,4
}

// while
let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}

// for...of (dizi elemanları)
const renkler = ["kırmızı", "mavi", "yeşil"];
for (const renk of renkler) {
  console.log(renk);
}

// forEach (dizi metodu)
renkler.forEach((renk, index) => {
  console.log(index, renk);
});</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Döngü Örnekleri', language: 'javascript',
      code: `// 1'den 10'a kadar sayılar
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    console.log(i + " çift");
  }
}

// Dizi üzerinde döngü
const meyveler = ["elma", "armut", "kiraz"];
meyveler.forEach((meyve, i) => {
  console.log(\`\${i + 1}. \${meyve}\`);
});

// while ile toplam
let toplam = 0;
let n = 1;
while (n <= 100) {
  toplam += n;
  n++;
}
console.log("1'den 100'e toplam:", toplam); // 5050`,
      content: '<p>Farklı döngü türleri:</p>'
    },
    {
      order: 3, type: 'CHALLENGE', title: 'FizzBuzz Klasiği!', language: 'javascript',
      content: '<p>1\'den 15\'e kadar: 3\'ün katları için "Fizz", 5\'in katları için "Buzz", ikisinin katları için "FizzBuzz" yazdır.</p>'
    },
    { order: 4, type: 'SUMMARY', title: 'Döngü Ustası! 🔄', content: '<p>for, while ve forEach döngülerini öğrendin!</p>' }
  ], {
    title: 'FizzBuzz',
    description: '1-15 arası FizzBuzz döngüsü yaz.',
    starterCode: '// 1\'den 15\'e kadar FizzBuzz\nfor (let i = 1; i <= 15; i++) {\n  // 3 ve 5\'in katı: "FizzBuzz"\n  // 3\'ün katı: "Fizz"\n  // 5\'in katı: "Buzz"\n  // Diğer: sayı\n}',
    solutionCode: 'for (let i = 1; i <= 15; i++) {\n  if (i % 3 === 0 && i % 5 === 0) console.log("FizzBuzz");\n  else if (i % 3 === 0) console.log("Fizz");\n  else if (i % 5 === 0) console.log("Buzz");\n  else console.log(i);\n}',
    language: 'javascript',
    testCases: [{ order: 1, input: '', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', description: 'FizzBuzz çıktısı', isHidden: false }]
  });

  await seedLesson(l2_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'switch İfadesi', language: 'javascript',
      content: `<h2>switch İfadesi</h2>
<p>Birden fazla değeri kontrol etmek için if/else'e alternatif:</p>
<div class="code-block">switch (deger) {
  case "A":
    console.log("A seçildi");
    break;
  case "B":
  case "C":
    console.log("B veya C"); // fall-through
    break;
  default:
    console.log("Bilinmiyor");
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'switch Örneği', language: 'javascript',
      code: `const gun = "Çarşamba";

switch (gun) {
  case "Pazartesi":
  case "Salı":
  case "Çarşamba":
  case "Perşembe":
  case "Cuma":
    console.log("Hafta içi 💼");
    break;
  case "Cumartesi":
  case "Pazar":
    console.log("Hafta sonu 🎉");
    break;
  default:
    console.log("Geçersiz gün");
}`,
      content: '<p>Gün kontrolü örneği:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'switch Tamamlandı! 🔀', content: '<p>switch, çok sayıda değer kontrolünde if/else\'den daha okunabilir!</p>' }
  ]);

  // Chapter 3: Fonksiyonlar
  const ch3 = await getOrCreateChapter(course.id, 'Fonksiyonlar', 3, 'Fonksiyon tanımlama ve kullanma');
  const l3_1 = await getOrCreateLesson(ch3.id, 'Fonksiyon Tanımlama', 'LESSON', 1, 30);
  const l3_2 = await getOrCreateLesson(ch3.id, 'Arrow Functions', 'LESSON', 2, 30);
  const l3_3 = await getOrCreateLesson(ch3.id, 'Parametreler ve Return', 'LESSON', 3, 25);

  await seedLesson(l3_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Fonksiyon Nedir?', language: 'javascript',
      content: `<h2>Fonksiyonlar</h2>
<p>Fonksiyon, tekrar kullanılabilir kod bloğudur. Bir kez tanımla, istediğin kadar çağır!</p>
<div class="code-block">// Fonksiyon tanımlama (declaration)
function selamla(isim) {
  return "Merhaba, " + isim + "!";
}

// Fonksiyon çağırma
const mesaj = selamla("Ali");
console.log(mesaj); // Merhaba, Ali!

// Fonksiyon ifadesi (expression)
const topla = function(a, b) {
  return a + b;
};</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Fonksiyon Örnekleri', language: 'javascript',
      code: `// Basit fonksiyon
function karesiAl(sayi) {
  return sayi * sayi;
}
console.log(karesiAl(5));   // 25
console.log(karesiAl(12));  // 144

// Default parametre
function selamla(isim = "Ziyaretçi") {
  return \`Merhaba, \${isim}!\`;
}
console.log(selamla());          // Merhaba, Ziyaretçi!
console.log(selamla("Zeynep")); // Merhaba, Zeynep!

// Birden fazla return değeri (object ile)
function minMax(dizi) {
  return {
    min: Math.min(...dizi),
    max: Math.max(...dizi)
  };
}
const { min, max } = minMax([3, 1, 8, 2, 9, 4]);
console.log(\`Min: \${min}, Max: \${max}\`);`,
      content: '<p>Fonksiyon kullanımı:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Fonksiyonları Öğrendin! 🛠️', content: '<p>Fonksiyonlar kodunu organize etmenin en iyi yolu!</p>' }
  ]);

  await seedLesson(l3_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Arrow Functions (Ok Fonksiyonları)', language: 'javascript',
      content: `<h2>Arrow Functions</h2>
<p>ES6 ile gelen kısa fonksiyon yazım şekli:</p>
<div class="code-block">// Normal fonksiyon
function topla(a, b) { return a + b; }

// Arrow function - eşdeğer
const topla = (a, b) => a + b;

// Tek parametre: parantez isteğe bağlı
const karesi = x => x * x;

// Çok satırlı: süslü parantez ve return gerekli
const uzun = (x) => {
  const sonuc = x * 2;
  return sonuc + 1;
};</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Arrow Function Örnekleri', language: 'javascript',
      code: `// Dizilerle arrow function kullanımı
const sayilar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// filter: çift sayılar
const ciftler = sayilar.filter(n => n % 2 === 0);
console.log(ciftler); // [2, 4, 6, 8, 10]

// map: kareleri
const kareler = sayilar.map(n => n ** 2);
console.log(kareler); // [1, 4, 9, 16, ...]

// reduce: toplam
const toplam = sayilar.reduce((acc, n) => acc + n, 0);
console.log("Toplam:", toplam); // 55

// Zincirleme
const sonuc = sayilar
  .filter(n => n > 5)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0);
console.log("Sonuç:", sonuc); // 60`,
      content: '<p>Arrow function ile dizi metodları:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Arrow Functions Tamamlandı! 🏹', content: '<p>Arrow function + dizi metodları = fonksiyonel programlama gücü!</p>' }
  ]);

  await seedLesson(l3_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Parametreler ve Döndürme Değerleri', language: 'javascript',
      content: `<h2>Parametreler ve Return</h2>
<div class="code-block">// Rest parametreler (...args)
function topla(...sayilar) {
  return sayilar.reduce((a, b) => a + b, 0);
}
topla(1, 2, 3);       // 6
topla(1, 2, 3, 4, 5); // 15

// Destructuring parametreler
function kisi({ isim, yas, sehir = "İstanbul" }) {
  return \`\${isim}, \${yas} yaş, \${sehir}\`;
}
kisi({ isim: "Ali", yas: 25 });

// Return olmayan fonksiyon → undefined döner
function yaz(mesaj) {
  console.log(mesaj);
  // return yok → undefined
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Gelişmiş Parametreler', language: 'javascript',
      code: `// Rest params
function maksimum(...sayilar) {
  return Math.max(...sayilar);
}
console.log(maksimum(3, 7, 2, 9, 1)); // 9

// Destructuring params
function profil({ isim, yas, meslek = "Belirtilmedi" }) {
  return \`\${isim} (\${yas}) - \${meslek}\`;
}
console.log(profil({ isim: "Zeynep", yas: 28, meslek: "Geliştirici" }));
console.log(profil({ isim: "Ahmet", yas: 22 }));

// Callback (fonksiyon parametre olarak)
function islemYap(a, b, islem) {
  return islem(a, b);
}
console.log(islemYap(10, 5, (a, b) => a + b)); // 15
console.log(islemYap(10, 5, (a, b) => a * b)); // 50`,
      content: '<p>Gelişmiş parametre kullanımı:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Fonksiyon Ustası! 🏆', content: '<p>Rest params, destructuring ve callback — artık fonksiyon konusunda ustasın!</p>' }
  ]);

  const totalLessons = await db.lesson.count({ where: { chapter: { courseId: course.id } } });
  await db.course.update({ where: { id: course.id }, data: { totalLessons } });
  console.log(`  ✅ JS: ${totalLessons} ders`);
}

// ──────────────────────────────────────────────────────────────────────────────
// HTML & CSS COURSE
// ──────────────────────────────────────────────────────────────────────────────
async function seedHtmlCss() {
  console.log('\n📚 HTML & CSS Kursu');

  const course = await getOrCreateCourse({
    title: 'HTML & CSS ile Web Tasarımı',
    slug: 'html-css',
    description: 'Web sayfalarının temellerini öğren, güzel ve duyarlı arayüzler oluştur.',
    language: 'html',
    icon: '🎨',
    color: '#E34F26',
    level: 'BEGINNER',
    isPublished: true,
    isFeatured: true,
    xpReward: 1500,
    totalLessons: 0,
  });

  const ch1 = await getOrCreateChapter(course.id, 'HTML Temelleri', 1, 'HTML yapısı ve temel etiketler');
  const l1_1 = await getOrCreateLesson(ch1.id, 'HTML Nedir?', 'LESSON', 1, 20);
  const l1_2 = await getOrCreateLesson(ch1.id, 'Temel HTML Etiketleri', 'LESSON', 2, 25);
  const l1_3 = await getOrCreateLesson(ch1.id, 'Bağlantılar ve Resimler', 'LESSON', 3, 25);
  const l1_4 = await getOrCreateLesson(ch1.id, 'Listeler ve Tablolar', 'LESSON', 4, 25);

  await seedLesson(l1_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'HTML Nedir?', language: 'html',
      content: `<h2>HTML — HyperText Markup Language</h2>
<p>HTML, web sayfalarının <strong>iskeletini</strong> oluşturan işaretleme dilidir. Her web sayfası bir HTML belgesidir.</p>
<h3>Temel Yapı</h3>
<div class="code-block">&lt;!DOCTYPE html&gt;
&lt;html lang="tr"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;Sayfam&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Merhaba Dünya!&lt;/h1&gt;
    &lt;p&gt;Bu benim web sayfam.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</div>
<h3>Etiket Anatomisi</h3>
<div class="code-block">&lt;etiket özellik="değer"&gt;İçerik&lt;/etiket&gt;
&lt;p class="giris"&gt;Merhaba!&lt;/p&gt;</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'İlk HTML Sayfan', language: 'html',
      content: '<p>Minimal bir HTML sayfası:</p>',
      code: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeTR - İlk Sayfa</title>
</head>
<body>
  <h1>Merhaba, Dünya! 🌍</h1>
  <p>Bu benim <strong>ilk</strong> HTML sayfam.</p>
  <p>HTML öğrenmek <em>çok eğlenceli!</em></p>
</body>
</html>`
    },
    { order: 3, type: 'SUMMARY', title: 'HTML Temeli Atıldı! 🏗️', content: '<p>HTML iskeletini öğrendin. Şimdi etiketleri keşfedelim!</p>' }
  ]);

  await seedLesson(l1_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Temel HTML Etiketleri', language: 'html',
      content: `<h2>Sık Kullanılan HTML Etiketleri</h2>
<table>
<tr><th>Etiket</th><th>Açıklama</th></tr>
<tr><td><code>&lt;h1&gt;-&lt;h6&gt;</code></td><td>Başlıklar (h1 en büyük)</td></tr>
<tr><td><code>&lt;p&gt;</code></td><td>Paragraf</td></tr>
<tr><td><code>&lt;strong&gt;</code></td><td>Kalın metin</td></tr>
<tr><td><code>&lt;em&gt;</code></td><td>Eğik metin</td></tr>
<tr><td><code>&lt;br&gt;</code></td><td>Satır sonu</td></tr>
<tr><td><code>&lt;hr&gt;</code></td><td>Yatay çizgi</td></tr>
<tr><td><code>&lt;div&gt;</code></td><td>Blok konteyner</td></tr>
<tr><td><code>&lt;span&gt;</code></td><td>Satır içi konteyner</td></tr>
</table>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Etiket Örnekleri', language: 'html',
      content: '<p>Yaygın HTML etiketleri kullanımı:</p>',
      code: `<body>
  <h1>Ana Başlık</h1>
  <h2>Alt Başlık</h2>
  <h3>Daha Küçük</h3>

  <p>Normal bir paragraf metni. <strong>Bu kısım kalın.</strong></p>
  <p>Bu da <em>eğik yazı</em> içeriyor.</p>
  
  <hr>
  
  <div class="kutu">
    <p>div bir <span style="color:blue">blok</span> elementidir.</p>
  </div>
  
  <address>
    İletişim: <a href="mailto:info@codetr.com">info@codetr.com</a>
  </address>
</body>`
    },
    { order: 3, type: 'SUMMARY', title: 'Etiketleri Öğrendin! 🏷️', content: '<p>HTML etiketleri sayfanın yapı taşları. Hepsini ezberlemeye gerek yok — zamanla öğrenirsin!</p>' }
  ]);

  await seedLesson(l1_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Bağlantılar ve Resimler', language: 'html',
      content: `<h2>Bağlantılar: &lt;a&gt;</h2>
<div class="code-block">&lt;!-- Harici link --&gt;
&lt;a href="https://codetr.com" target="_blank"&gt;CodeTR&lt;/a&gt;

&lt;!-- Dahili link --&gt;
&lt;a href="/hakkimizda"&gt;Hakkımızda&lt;/a&gt;

&lt;!-- E-posta linki --&gt;
&lt;a href="mailto:info@codetr.com"&gt;Mail Gönder&lt;/a&gt;</div>

<h2>Resimler: &lt;img&gt;</h2>
<div class="code-block">&lt;!-- Temel resim --&gt;
&lt;img src="foto.jpg" alt="Fotoğraf açıklaması" width="300"&gt;

&lt;!-- Harici resim --&gt;
&lt;img src="https://picsum.photos/400/300" alt="Örnek"&gt;</div>
<p>⚠️ <code>alt</code> özelliği <strong>zorunludur</strong> (erişilebilirlik + SEO)!</p>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Link ve Resim Örnekleri', language: 'html',
      content: '<p>Kullanım örnekleri:</p>',
      code: `<body>
  <h1>Web Siteleri</h1>
  
  <!-- Linkler -->
  <nav>
    <a href="/">Ana Sayfa</a> |
    <a href="/kurslar">Kurslar</a> |
    <a href="https://github.com" target="_blank" rel="noopener">
      GitHub ↗
    </a>
  </nav>
  
  <!-- Resim + link kombinasyonu -->
  <a href="https://codetr.com">
    <img 
      src="https://picsum.photos/400/200" 
      alt="CodeTR platformu"
      width="400"
      height="200"
    >
  </a>
  
  <p>
    <a href="mailto:destek@codetr.com">📧 Destek</a>
  </p>
</body>`
    },
    { order: 3, type: 'SUMMARY', title: 'Bağlantılar ve Resimler! 🔗', content: '<p>Artık sayfalar arası geçiş yapabilir ve resim ekleyebilirsin!</p>' }
  ]);

  await seedLesson(l1_4.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Listeler ve Tablolar', language: 'html',
      content: `<h2>Listeler</h2>
<div class="code-block">&lt;!-- Sırasız liste (ul) --&gt;
&lt;ul&gt;
  &lt;li&gt;Elma&lt;/li&gt;
  &lt;li&gt;Armut&lt;/li&gt;
&lt;/ul&gt;

&lt;!-- Sıralı liste (ol) --&gt;
&lt;ol&gt;
  &lt;li&gt;Birinci&lt;/li&gt;
  &lt;li&gt;İkinci&lt;/li&gt;
&lt;/ol&gt;</div>

<h2>Tablolar</h2>
<div class="code-block">&lt;table&gt;
  &lt;thead&gt;
    &lt;tr&gt;&lt;th&gt;İsim&lt;/th&gt;&lt;th&gt;Yaş&lt;/th&gt;&lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;&lt;td&gt;Ali&lt;/td&gt;&lt;td&gt;25&lt;/td&gt;&lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Liste ve Tablo Örnekleri', language: 'html',
      content: '<p>Gerçek kullanım senaryoları:</p>',
      code: `<body>
  <h2>Öğrenilecek Diller</h2>
  <ol>
    <li>HTML & CSS</li>
    <li>JavaScript</li>
    <li>Python</li>
    <li>TypeScript</li>
  </ol>
  
  <h2>En Sevilen Özellikler</h2>
  <ul>
    <li>✅ Ücretsiz kurslar</li>
    <li>🎮 Oyunlaştırma</li>
    <li>🤖 AI tutor</li>
  </ul>

  <h2>Öğrenci Notları</h2>
  <table border="1" style="border-collapse:collapse; padding:8px;">
    <thead>
      <tr>
        <th>Öğrenci</th>
        <th>Not</th>
        <th>Harf</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Ali</td><td>88</td><td>BA</td></tr>
      <tr><td>Ayşe</td><td>95</td><td>AA</td></tr>
    </tbody>
  </table>
</body>`
    },
    { order: 3, type: 'SUMMARY', title: 'Listeler ve Tablolar! 📋', content: '<p>HTML yapısını öğrendin. Sıradaki adım: CSS ile güzelleştirme!</p>' }
  ]);

  // Chapter 2: CSS Temelleri
  const ch2 = await getOrCreateChapter(course.id, 'CSS ile Stil', 2, 'Sayfalara renk ve güzellik kat');
  const l2_1 = await getOrCreateLesson(ch2.id, 'CSS Nedir? Seçiciler', 'LESSON', 1, 25);
  const l2_2 = await getOrCreateLesson(ch2.id, 'Renkler ve Yazı Tipleri', 'LESSON', 2, 25);
  const l2_3 = await getOrCreateLesson(ch2.id, 'Box Model: margin, padding, border', 'LESSON', 3, 30);
  const l2_4 = await getOrCreateLesson(ch2.id, 'Flexbox ile Yerleşim', 'LESSON', 4, 35);

  await seedLesson(l2_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'CSS Nedir?', language: 'css',
      content: `<h2>CSS — Cascading Style Sheets</h2>
<p>HTML yapıyı sağlarken CSS <strong>görünümü</strong> belirler. Renkler, boyutlar, konumlandırma — hepsi CSS ile!</p>
<h3>CSS Yazım Yolları</h3>
<div class="code-block">/* 1. Harici dosya (önerilen) */
&lt;link rel="stylesheet" href="style.css"&gt;

/* 2. &lt;style&gt; etiketi içinde */
&lt;style&gt;
  p { color: blue; }
&lt;/style&gt;

/* 3. Inline (kaçın!) */
&lt;p style="color: blue;"&gt;Metin&lt;/p&gt;</div>
<h3>CSS Söz Dizimi</h3>
<div class="code-block">seçici {
  özellik: değer;
  özellik2: değer2;
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'CSS Seçiciler', language: 'css',
      content: '<p>Temel CSS seçicileri:</p>',
      code: `/* Etiket seçici */
h1 { color: #3b82f6; }
p  { font-size: 16px; }

/* Class seçici */
.baslik { font-weight: bold; }
.vurgu  { background: yellow; }

/* ID seçici */
#logo { width: 100px; }

/* Kombinasyon */
.kart h2 { color: white; }          /* .kart içindeki h2 */
.buton:hover { background: blue; }  /* hover durumu */
input:focus { border-color: blue; } /* odak durumu */

/* Tümünü seç */
* { box-sizing: border-box; margin: 0; padding: 0; }`
    },
    { order: 3, type: 'SUMMARY', title: 'CSS Seçiciler! 🎯', content: '<p>Class seçicilerini kullan, ID seçicilerini ise sadece JS için sakla!</p>' }
  ]);

  await seedLesson(l2_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Renkler ve Yazı Tipleri', language: 'css',
      content: `<h2>CSS Renkleri</h2>
<div class="code-block">color: red;               /* isim */
color: #3b82f6;           /* hex */
color: rgb(59, 130, 246); /* rgb */
color: hsl(217, 91%, 60%);/* hsl */
color: rgba(0,0,0,0.5);  /* rgba (yarı saydam) */</div>
<h2>Yazı Tipleri</h2>
<div class="code-block">font-family: 'Inter', sans-serif;
font-size: 18px;    /* boyut */
font-weight: 700;   /* kalınlık: 100-900 */
font-style: italic; /* eğik */
line-height: 1.6;   /* satır yüksekliği */
text-align: center; /* hizalama */
text-decoration: underline; /* altı çizili */
letter-spacing: 2px; /* harf aralığı */</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Renk ve Font Örnekleri', language: 'css',
      content: '<p>Renk ve font kullanımı:</p>',
      code: `/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
  background-color: #f8fafc;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: -0.025em;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`
    },
    { order: 3, type: 'SUMMARY', title: 'Renkler ve Fontlar! 🎨', content: '<p>HSL renk formatı en esnekidir — denemekten çekinme!</p>' }
  ]);

  await seedLesson(l2_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'CSS Box Model', language: 'css',
      content: `<h2>Box Model (Kutu Modeli)</h2>
<p>Her HTML elementi bir kutudur. Bu kutunun 4 katmanı vardır:</p>
<div class="code-block">/* Dıştan içe: margin > border > padding > content */
.kutu {
  /* İçerik boyutu */
  width: 300px;
  height: 200px;
  
  /* Padding: içerik ile border arası boşluk */
  padding: 20px;
  padding: 10px 20px;      /* üst/alt sol/sağ */
  padding: 5px 10px 15px 20px; /* üst sağ alt sol */
  
  /* Border: çerçeve */
  border: 2px solid #3b82f6;
  border-radius: 8px;      /* köşe yuvarlama */
  
  /* Margin: dış boşluk */
  margin: 16px;
  margin: 0 auto;          /* yatayda ortala */
  
  /* box-sizing önemli! */
  box-sizing: border-box;  /* padding dahil boyut */
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Box Model Kullanımı', language: 'css',
      content: '<p>Gerçek bir kart bileşeni:</p>',
      code: `/* Reset */
* { box-sizing: border-box; margin: 0; padding: 0; }

.kart {
  width: 320px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  background: white;
  margin: 16px auto;
}

.kart-baslik {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1e293b;
}

.kart-metin {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.buton {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}`
    },
    { order: 3, type: 'SUMMARY', title: 'Box Model Tamamlandı! 📦', content: '<p>Her zaman <code>box-sizing: border-box</code> kullan — hayatın kolaylaşır!</p>' }
  ]);

  await seedLesson(l2_4.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Flexbox', language: 'css',
      content: `<h2>Flexbox ile Yerleşim</h2>
<p>Flexbox, öğeleri <strong>satır veya sütun</strong> halinde hizalamayı kolaylaştırır.</p>
<div class="code-block">.konteyner {
  display: flex;
  
  /* Yön */
  flex-direction: row;         /* yatay (varsayılan) */
  flex-direction: column;      /* dikey */
  
  /* Ana eksen hizalama */
  justify-content: flex-start; /* başa */
  justify-content: center;     /* ortaya */
  justify-content: space-between; /* aralarına boşluk */
  
  /* Çapraz eksen hizalama */
  align-items: stretch;    /* genişlet */
  align-items: center;     /* ortaya */
  align-items: flex-end;   /* sona */
  
  /* Sarma */
  flex-wrap: wrap;
  gap: 16px; /* öğe arası boşluk */
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Flexbox Örnekleri', language: 'css',
      content: '<p>Navigation bar ve kart grid:</p>',
      code: `/* Navigation Bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1e293b;
  color: white;
}

.navbar .logo { font-weight: 700; font-size: 1.25rem; }
.navbar nav { display: flex; gap: 24px; }
.navbar nav a { color: #94a3b8; text-decoration: none; }

/* Kart Grid */
.kartlar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
}

.kart {
  flex: 1 1 280px; /* büyü, küçül, min 280px */
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* Dikey + Yatay Ortalama */
.merkez {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`
    },
    { order: 3, type: 'SUMMARY', title: 'Flexbox Ustası! 💪', content: '<p>Flexbox modern web layoutunun temel taşı. Sırada Grid var!</p>' }
  ]);

  const totalLessons = await db.lesson.count({ where: { chapter: { courseId: course.id } } });
  await db.course.update({ where: { id: course.id }, data: { totalLessons } });
  console.log(`  ✅ HTML&CSS: ${totalLessons} ders`);
}

// ──────────────────────────────────────────────────────────────────────────────
// TYPESCRIPT COURSE
// ──────────────────────────────────────────────────────────────────────────────
async function seedTypeScript() {
  console.log('\n📚 TypeScript Kursu');

  const course = await getOrCreateCourse({
    title: 'TypeScript ile Güvenli Kod',
    slug: 'typescript',
    description: "JavaScript'e tip güvenliği ekle, büyük projelerde hataları önce yakala.",
    language: 'typescript',
    icon: '📘',
    color: '#3178C6',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 2500,
    totalLessons: 0,
  });

  const ch1 = await getOrCreateChapter(course.id, "TypeScript'e Giriş", 1, 'Neden TypeScript?');
  const l1_1 = await getOrCreateLesson(ch1.id, 'TypeScript Nedir?', 'LESSON', 1, 25);
  const l1_2 = await getOrCreateLesson(ch1.id, 'Temel Tipler', 'LESSON', 2, 30);
  const l1_3 = await getOrCreateLesson(ch1.id, 'Interface ve Type Alias', 'LESSON', 3, 35);
  const l1_4 = await getOrCreateLesson(ch1.id, 'Fonksiyon Tipleri', 'LESSON', 4, 30);

  await seedLesson(l1_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: "TypeScript Nedir?", language: 'typescript',
      content: `<h2>TypeScript = JavaScript + Tipler</h2>
<p>TypeScript, Microsoft tarafından geliştirilen ve JavaScript'e <strong>statik tip sistemi</strong> ekleyen bir programlama dilidir.</p>
<h3>Neden TypeScript?</h3>
<ul>
<li>🐛 Hataları çalışma öncesi (derleme zamanında) yakala</li>
<li>📝 Daha iyi IDE desteği (otomatik tamamlama)</li>
<li>🏗️ Büyük ekiplerde kodu anlamak kolaylaşır</li>
<li>📚 Kodun kendisi dokümantasyon görevi görür</li>
</ul>
<h3>JavaScript vs TypeScript</h3>
<div class="code-block">// JavaScript - hata çalışma zamanında!
function topla(a, b) { return a + b; }
topla("5", 3); // "53" - bug! ama hata yok

// TypeScript - hata derleme zamanında!
function topla(a: number, b: number): number {
  return a + b;
}
topla("5", 3); // ❌ Derleme hatası! string'i number yerine kullanamazsın</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'İlk TypeScript Kodu', language: 'typescript',
      content: '<p>TypeScript ile tip güvenli kod:</p>',
      code: `// Tip anotasyonları
let isim: string = "Ali";
let yas: number = 25;
let aktif: boolean = true;

// Tip çıkarımı (type inference) - tip yazmak zorunda değilsin!
let sehir = "İstanbul"; // TypeScript: string olduğunu anlar
sehir = 42; // ❌ Hata! number, string'e atanamaz

// Fonksiyon tip anotasyonları  
function selamla(ad: string): string {
  return \`Merhaba, \${ad}!\`;
}

console.log(selamla("Zeynep")); // ✅
// selamla(42); // ❌ Hata!

// Array tipleri
const sayilar: number[] = [1, 2, 3, 4, 5];
const isimler: string[] = ["Ali", "Ayşe", "Ahmet"];`
    },
    { order: 3, type: 'SUMMARY', title: "TypeScript'e Hoş Geldin! 📘", content: "<p>TypeScript JavaScript'in süper güçlü versiyonu. Tip güvenliği = daha az bug!</p>" }
  ]);

  await seedLesson(l1_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'TypeScript Temel Tipler', language: 'typescript',
      content: `<h2>Temel Tipler</h2>
<div class="code-block">// Primitive tipler
let isim: string = "CodeTR";
let sayi: number = 42;
let ondalik: number = 3.14;
let dogru: boolean = true;
let tanimsiz: undefined = undefined;
let bos: null = null;

// Array
let sayilar: number[] = [1, 2, 3];
let isimler: Array&lt;string&gt; = ["Ali", "Ayşe"];

// Tuple (sabit uzunluklu, sabit tipli dizi)
let koordinat: [number, number] = [41.0082, 28.9784];
let kisi: [string, number] = ["Ali", 25];

// any (kaçın!) - tip güvenliğini devre dışı bırakır
let bisey: any = "metin";
bisey = 42;     // ✅ hata yok (ama tehlikeli!)

// unknown (any'e güvenli alternatif)
let bilmiyorum: unknown = "metin";
// bilmiyorum.toUpperCase(); // ❌ tip kontrolü yapılmadan kullanılamaz

// never - asla değer döndürmeyen
function hataFirlat(mesaj: string): never {
  throw new Error(mesaj);
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Tip Kullanımı', language: 'typescript',
      code: `// Union types (birden fazla tip)
let id: string | number = "abc123";
id = 42; // ✅ ikisi de OK

function kimlik(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase();
  }
  return id.toString();
}

// Literal types (spesifik değerler)
type Yon = "kuzey" | "guney" | "dogu" | "bati";
let gidiyorum: Yon = "kuzey";
// gidiyorum = "yukari"; // ❌ Hata!

// Optional (?) 
function kullanici(isim: string, yas?: number): string {
  return yas ? \`\${isim} (\${yas})\` : isim;
}
console.log(kullanici("Ali"));
console.log(kullanici("Ayşe", 25));`,
      content: '<p>Union, literal ve optional tipler:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Tipler Tamamlandı! ✅', content: "<p>Union types ve optional parametreler TypeScript'in en güçlü özellikleri!</p>" }
  ]);

  await seedLesson(l1_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Interface ve Type Alias', language: 'typescript',
      content: `<h2>Nesne Şablonları</h2>
<h3>Interface</h3>
<div class="code-block">interface Kullanici {
  id: number;
  isim: string;
  email: string;
  yas?: number;        // optional
  readonly rol: string; // readonly - değiştirilemez
}

// Kullanım
const user: Kullanici = {
  id: 1,
  isim: "Ali",
  email: "ali@example.com",
  rol: "admin"
};

// Interface genişletme
interface Admin extends Kullanici {
  yetkiler: string[];
}</div>

<h3>Type Alias</h3>
<div class="code-block">type Nokta = { x: number; y: number };
type Renk = "kirmizi" | "mavi" | "yesil";
type KullaniciId = string | number;

// Intersection type
type AdminUser = Kullanici & { adminSeviye: number };</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Interface Örnekleri', language: 'typescript',
      code: `// Ürün interface
interface Urun {
  id: number;
  isim: string;
  fiyat: number;
  stok: number;
  kategori?: string;
}

// Fonksiyonda interface kullanımı
function indirimliFiyat(urun: Urun, oran: number): number {
  return urun.fiyat * (1 - oran / 100);
}

const laptop: Urun = {
  id: 1,
  isim: "MacBook Pro",
  fiyat: 50000,
  stok: 5,
  kategori: "Elektronik"
};

console.log(indirimliFiyat(laptop, 10)); // 45000

// Array of interface
const sepet: Urun[] = [laptop];
const toplam = sepet.reduce((acc, u) => acc + u.fiyat, 0);
console.log("Toplam:", toplam);`,
      content: '<p>Interface ile gerçek senaryo:</p>'
    },
    { order: 3, type: 'SUMMARY', title: 'Interface Ustası! 🏗️', content: '<p>Interface nesnelerin şeklini tanımlar. Büyük projelerde hayat kurtarır!</p>' }
  ]);

  await seedLesson(l1_4.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Fonksiyon Tipleri', language: 'typescript',
      content: `<h2>TypeScript Fonksiyon Tipleri</h2>
<div class="code-block">// Parametre ve dönüş tipi
function topla(a: number, b: number): number {
  return a + b;
}

// Void - değer döndürmeyen
function yaz(mesaj: string): void {
  console.log(mesaj);
}

// Arrow function tipi
const carp = (a: number, b: number): number => a * b;

// Fonksiyon tip alias
type HesapFn = (a: number, b: number) => number;
const bol: HesapFn = (a, b) => a / b;

// Generics - tip parametresi
function ilkEleman&lt;T&gt;(dizi: T[]): T | undefined {
  return dizi[0];
}
ilkEleman([1, 2, 3]);        // number
ilkEleman(["a", "b", "c"]); // string</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Generic Fonksiyonlar', language: 'typescript',
      code: `// Generic fonksiyon
function ters<T>(dizi: T[]): T[] {
  return [...dizi].reverse();
}

console.log(ters([1, 2, 3, 4, 5]));     // [5,4,3,2,1]
console.log(ters(["a", "b", "c"]));     // ["c","b","a"]

// Generic ile kısıtlama (constraint)
interface IdSahibi {
  id: number;
}

function idGetir<T extends IdSahibi>(nesne: T): number {
  return nesne.id;
}

// Overload
function birlestir(a: string, b: string): string;
function birlestir(a: number, b: number): number;
function birlestir(a: any, b: any): any {
  return a + b;
}

console.log(birlestir("Merhaba ", "Dünya")); // string
console.log(birlestir(10, 20));              // number`,
      content: '<p>Generics ve overload kullanımı:</p>'
    },
    { order: 3, type: 'SUMMARY', title: "TypeScript Fonksiyonları! 🚀", content: "<p>Generics TypeScript'in en güçlü özelliği — yeniden kullanılabilir, tip güvenli kod!</p>" }
  ]);

  const totalLessons = await db.lesson.count({ where: { chapter: { courseId: course.id } } });
  await db.course.update({ where: { id: course.id }, data: { totalLessons } });
  console.log(`  ✅ TypeScript: ${totalLessons} ders`);
}

// ──────────────────────────────────────────────────────────────────────────────
// JAVA COURSE (temel)
// ──────────────────────────────────────────────────────────────────────────────
async function seedJava() {
  console.log('\n📚 Java Kursu');

  const course = await getOrCreateCourse({
    title: 'Java ile Nesne Tabanlı Programlama',
    slug: 'java',
    description: "Java'nın temellerini, OOP prensiplerini ve gerçek dünya uygulamalarını öğren.",
    language: 'java',
    icon: '☕',
    color: '#ED8B00',
    level: 'INTERMEDIATE',
    isPublished: true,
    isFeatured: false,
    xpReward: 3000,
    totalLessons: 0,
  });

  const ch1 = await getOrCreateChapter(course.id, "Java'ya Giriş", 1, 'Java temelleri');
  const l1_1 = await getOrCreateLesson(ch1.id, "Java Nedir?", 'LESSON', 1, 20);
  const l1_2 = await getOrCreateLesson(ch1.id, 'Değişkenler ve Tipler', 'LESSON', 2, 25);
  const l1_3 = await getOrCreateLesson(ch1.id, 'Koşul ve Döngüler', 'LESSON', 3, 30);

  await seedLesson(l1_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: "Java Nedir?", language: 'java',
      content: `<h2>Java Programlama Dili</h2>
<p>Java, <strong>"Write Once, Run Anywhere"</strong> prensibiyle 1995'te geliştirilen, nesne tabanlı bir programlama dilidir.</p>
<h3>Özellikler</h3>
<ul>
<li>☕ Platform bağımsız (JVM üzerinde çalışır)</li>
<li>🔒 Güçlü tip güvenliği</li>
<li>🧩 Nesne tabanlı programlama</li>
<li>🌐 Enterprise dünya standardı</li>
<li>📱 Android geliştirme</li>
</ul>
<h3>İlk Program</h3>
<div class="code-block">public class Merhaba {
    public static void main(String[] args) {
        System.out.println("Merhaba, Dünya!");
    }
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Merhaba Java!', language: 'java',
      content: '<p>İlk Java programı:</p>',
      code: `public class IlkProgram {
    public static void main(String[] args) {
        // Konsola yazdır
        System.out.println("Merhaba, Java!");
        System.out.println("CodeTR'ye hoş geldin!");
        
        // Değişken tanımla
        String isim = "Ali";
        int yas = 25;
        
        System.out.println("İsim: " + isim);
        System.out.println("Yaş: " + yas);
        
        // String format
        System.out.printf("Merhaba, %s! %d yaşındasın.%n", isim, yas);
    }
}`
    },
    { order: 3, type: 'SUMMARY', title: "Java'ya Başladın! ☕", content: "<p>Java'nın temel yapısını gördün. Her şey class içinde!</p>" }
  ]);

  await seedLesson(l1_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Java Değişken Tipleri', language: 'java',
      content: `<h2>Java Veri Tipleri</h2>
<h3>Primitive Tipler</h3>
<div class="code-block">int     sayi = 42;          // 32-bit tam sayı
long    buyukSayi = 9999L;  // 64-bit tam sayı
double  ondalik = 3.14;     // 64-bit ondalık
float   kucuk = 3.14f;      // 32-bit ondalık
boolean dogru = true;       // true/false
char    harf = 'A';         // tek karakter
byte    kucukSayi = 127;    // -128 to 127
short   ortaSayi = 30000;   // -32768 to 32767</div>
<h3>Reference Tipler</h3>
<div class="code-block">String isim = "CodeTR";      // String (büyük S!)
int[] dizi = {1, 2, 3, 4, 5}; // Array</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Değişken Örnekleri', language: 'java',
      content: '<p>Java değişken kullanımı:</p>',
      code: `public class Degiskenler {
    public static void main(String[] args) {
        // Primitive tipler
        int yas = 25;
        double boy = 1.75;
        boolean aktif = true;
        char ilkHarf = 'A';
        
        // String
        String isim = "Ayşe";
        String mesaj = isim + " " + yas + " yaşında.";
        System.out.println(mesaj);
        
        // String metodları
        System.out.println(isim.length());          // 4
        System.out.println(isim.toUpperCase());     // AYŞE
        System.out.println(isim.contains("ş"));     // true
        
        // Type casting
        int tamSayi = (int) 3.99;  // 3 (kesir düşer!)
        double ondalik = (double) 5 / 2; // 2.5
        System.out.println(tamSayi + ", " + ondalik);
    }
}`
    },
    { order: 3, type: 'SUMMARY', title: 'Tipler Öğrenildi! 📊', content: "<p>Java'da tipler kesindir — otomatik dönüşüm olmaz, açık casting gerekir!</p>" }
  ]);

  await seedLesson(l1_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Koşul ve Döngüler', language: 'java',
      content: `<h2>Java Kontrol Akışı</h2>
<div class="code-block">// if/else
if (not >= 90) {
    System.out.println("AA");
} else if (not >= 80) {
    System.out.println("BA");
} else {
    System.out.println("Düşük not");
}

// for döngüsü
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// while
int n = 1;
while (n <= 10) {
    System.out.print(n + " ");
    n++;
}

// for-each (gelişmiş for)
int[] sayilar = {1, 2, 3, 4, 5};
for (int s : sayilar) {
    System.out.println(s);
}</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Kontrol Akışı Örnekleri', language: 'java',
      code: `public class KontrolAkisi {
    public static void main(String[] args) {
        // 1'den 20'ye FizzBuzz
        for (int i = 1; i <= 20; i++) {
            if (i % 15 == 0) {
                System.out.println("FizzBuzz");
            } else if (i % 3 == 0) {
                System.out.println("Fizz");
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
            } else {
                System.out.println(i);
            }
        }
        
        // Dizi toplama
        int[] notlar = {75, 88, 92, 65, 79};
        int toplam = 0;
        for (int not : notlar) {
            toplam += not;
        }
        double ortalama = (double) toplam / notlar.length;
        System.out.printf("Ortalama: %.1f%n", ortalama);
    }
}`,
      content: '<p>FizzBuzz ve dizi işlemleri:</p>'
    },
    { order: 3, type: 'SUMMARY', title: "Java Kontrolü Tamamlandı! ☕", content: "<p>Java'da kontrol yapıları C/C++'a benzer. Güçlü bir temel attın!</p>" }
  ]);

  const totalLessons = await db.lesson.count({ where: { chapter: { courseId: course.id } } });
  await db.course.update({ where: { id: course.id }, data: { totalLessons } });
  console.log(`  ✅ Java: ${totalLessons} ders`);
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Yeni kurslar ekleniyor...\n');
  await seedJavaScript();
  await seedHtmlCss();
  await seedTypeScript();
  await seedJava();

  console.log('\n✅ Tüm kurslar başarıyla eklendi!');
  await db.$disconnect();
}

main().catch(e => { console.error(e); db.$disconnect(); process.exit(1); });
