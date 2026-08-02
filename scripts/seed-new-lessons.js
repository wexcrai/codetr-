const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Lesson step seeder helper
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
        language: 'python',
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
  console.log(`  ✅ Seeded: ${lessonId}`);
}

async function main() {
  console.log('\n🚀 Seeding new lessons...\n');

  const courseId = 'cmrxch5os001uxogblhjx0rt6'; // Python course

  // ──────────────────────────────────────────────
  // Chapter 2: Değişkenler - seed existing lessons
  // ──────────────────────────────────────────────
  console.log('📚 Chapter 2: Değişkenler');

  // Lesson: Değişkenler Nedir?
  await seedLesson('cmrxch85z0029xogbljcrufrq', [
    {
      order: 1, type: 'EXPLANATION', title: 'Değişken Nedir?',
      content: `<h2>Değişken Nedir?</h2>
<p>Değişken, programda veri saklamak için kullandığımız <strong>isimlendirilmiş bir kutu</strong> gibidir.</p>
<p>Örneğin bir öğrencinin adını ve yaşını saklamak istiyorsak:</p>
<div class="code-block">isim = "Ayşe"
yaş = 17</div>
<p>Burada <code>isim</code> değişkeni <em>"Ayşe"</em> değerini, <code>yaş</code> değişkeni ise <em>17</em> sayısını saklar.</p>
<h3>Değişkenin Özellikleri</h3>
<ul>
<li>💾 Veriyi bellekte saklar</li>
<li>🏷️ Anlamlı bir isim taşır</li>
<li>🔄 Değeri değiştirilebilir (bu yüzden <em>değişken</em> denir!)</li>
</ul>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Değişken Örnekleri',
      content: '<p>Farklı veri tipleriyle değişken kullanımına bakalım:</p>',
      code: `# Metin (string) değişkeni
isim = "Ahmet"
şehir = 'İstanbul'

# Sayı değişkenleri
yaş = 25
not_ortalamasi = 87.5

# Mantıksal değişken
öğrenci_mi = True

# Değerleri yazdır
print("İsim:", isim)
print("Şehir:", şehir)
print("Yaş:", yaş)
print("Not Ortalaması:", not_ortalamasi)
print("Öğrenci mi?", öğrenci_mi)`
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Kendi Değişkenlerini Oluştur! 💪',
      content: `<p>Aşağıdaki değişkenleri oluştur ve ekrana yazdır:</p>
<ul>
<li><code>isim</code> — kendi adın</li>
<li><code>yaş</code> — kaç yaşındasın</li>
<li><code>şehir</code> — hangi şehirde yaşıyorsun</li>
</ul>`
    },
    {
      order: 4, type: 'SUMMARY', title: 'Harika! 🎉',
      content: '<p>Değişkenlerin ne olduğunu ve nasıl kullanılacağını öğrendin. +20 XP kazandın!</p>'
    }
  ], {
    title: 'Değişken Oluşturma',
    description: 'isim, yaş ve şehir değişkenlerini oluştur ve yazdır.',
    starterCode: '# isim değişkenini oluştur\n# yaş değişkenini oluştur\n# şehir değişkenini oluştur\n# Üçünü de yazdır',
    solutionCode: 'isim = "Ali"\nyaş = 20\nşehir = "Ankara"\nprint(isim)\nprint(yaş)\nprint(şehir)',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: '', description: 'En az 3 satır çıktı olmalı', isHidden: true }
    ]
  });

  // Lesson: Değişken Adlandırma
  await seedLesson('cmrxch8ta002dxogbpo1xw7m9', [
    {
      order: 1, type: 'EXPLANATION', title: 'İyi İsimlendirme Kuralları',
      content: `<h2>Değişken Adlandırma Kuralları</h2>
<p>Python'da değişken isimleri belirli kurallara uymalıdır:</p>
<h3>✅ Geçerli İsimler</h3>
<div class="code-block">ogrenci_sayisi = 30
sinifAdi = "10-A"      # camelCase
not_ortalamasi = 85.5  # snake_case (önerilen)
x = 5                  # kısa ama geçerli</div>
<h3>❌ Geçersiz İsimler</h3>
<div class="code-block">2ogrenci = 30      # Sayıyla başlayamaz!
öğrenci-sayısı = 5 # Tire (-) kullanılamaz!
class = "10-A"     # Rezerve kelime!</div>
<h3>📏 Kurallar</h3>
<ul>
<li>Harf, rakam veya alt çizgi (_) içerebilir</li>
<li>Rakamla <strong>başlayamaz</strong></li>
<li>Büyük/küçük harf <strong>duyarlıdır</strong>: <code>isim ≠ İsim ≠ İSİM</code></li>
<li><code>if</code>, <code>for</code>, <code>class</code> gibi <strong>anahtar kelimeler kullanılamaz</strong></li>
</ul>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'snake_case vs camelCase',
      content: "<p>Python'da <strong>snake_case</strong> kullan\u0131m\u0131 \u00f6nerilir:</p>",
      code: `# ✅ Önerilen: snake_case
ogrenci_sayisi = 30
sinif_adi = "10-A"
not_ortalamasi = 85.5

# ⚠️ Kabul edilir: camelCase
ogrenciSayisi = 30

# Büyük/küçük harf duyarlılığı
Isim = "Ahmet"
isim = "Mehmet"
ISIM = "Ali"

print(Isim)   # Ahmet
print(isim)   # Mehmet
print(ISIM)   # Ali  (hepsi farklı değişken!)`
    },
    {
      order: 3, type: 'SUMMARY', title: 'Profesyonel Kodcu Adayısın! 🏆',
      content: '<p>Artık temiz ve okunabilir kod yazmanın sırrını biliyorsun. <strong>snake_case</strong> kullan, anlamlı isimler ver!</p>'
    }
  ]);

  // Lesson: Değişken Atama
  await seedLesson('cmrxch9h1002hxogbb19utmqt', [
    {
      order: 1, type: 'EXPLANATION', title: '= Operatörü',
      content: `<h2>Atama Operatörü (=)</h2>
<p>Python'da <code>=</code> işareti <strong>eşitlik değil, atama</strong> anlamındadır.</p>
<div class="code-block">x = 5      # x değişkenine 5 değeri ata
x = x + 1  # x'i 1 artır (şimdi x = 6)</div>
<h3>Çoklu Atama</h3>
<div class="code-block"># Birden fazla değişkene aynı değer
a = b = c = 0
print(a, b, c)  # 0 0 0

# Tek satırda farklı değerler
x, y, z = 1, 2, 3
print(x, y, z)  # 1 2 3

# Değerleri yer değiştir
a, b = 10, 20
a, b = b, a  # Swap!
print(a, b)  # 20 10</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Değer Güncelleme',
      content: '<p>Değişkenin değerini güncelleme örnekleri:</p>',
      code: `# Başlangıç değeri
puan = 0
print("Başlangıç:", puan)

# Puan ekle
puan = puan + 10
print("10 puan eklendi:", puan)

# Kısayol: += operatörü
puan += 25
print("25 puan daha:", puan)

# Diğer kısayollar
puan -= 5   # 5 çıkar
puan *= 2   # 2 ile çarp
print("Final puan:", puan)`
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Hesap Makinesi! 🔢',
      content: `<p>İki değişken oluştur: <code>a = 15</code> ve <code>b = 4</code></p>
<p>Sonra şunları hesapla ve yazdır:</p>
<ul><li>Toplam: a + b</li><li>Fark: a - b</li><li>Çarpım: a * b</li><li>Bölüm: a / b</li></ul>`
    },
    {
      order: 4, type: 'SUMMARY', title: 'Değişkenleri Ustaca Kullanıyorsun! ⚡',
      content: '<p>Atama operatörünü ve kısayollarını öğrendin. Bir sonraki bölümde veri tiplerini keşfedeceğiz!</p>'
    }
  ], {
    title: 'Hesap Makinesi',
    description: 'a=15 ve b=4 ile toplam, fark, çarpım ve bölümü hesapla.',
    starterCode: 'a = 15\nb = 4\n\n# Toplam\n# Fark\n# Çarpım\n# Bölüm',
    solutionCode: 'a = 15\nb = 4\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: '19\n11\n60\n3.75', description: 'Toplam, fark, çarpım ve bölümü yazdır', isHidden: false }
    ]
  });

  // ──────────────────────────────────────────────
  // Chapter 3: Veri Tipleri (create new chapter + lessons)
  // ──────────────────────────────────────────────
  console.log('\n📚 Chapter 3: Veri Tipleri (creating...)');

  // Check if chapter 3 already exists
  let ch3 = await db.chapter.findFirst({ where: { courseId, order: 3 } });
  if (!ch3) {
    ch3 = await db.chapter.create({
      data: {
        courseId, title: 'Veri Tipleri', order: 3,
        description: "Python'da sayılar, metinler ve mantıksal değerleri öğrenin",
        isPublished: true,
      }
    });
    console.log('  Created Chapter 3');
  }

  // Create lessons for Chapter 3 if they don't exist
  async function getOrCreateLesson(chapterId, title, type, order, xp = 25) {
    let lesson = await db.lesson.findFirst({ where: { chapterId, order } });
    if (!lesson) {
      lesson = await db.lesson.create({
        data: { chapterId, title, type, order, isPublished: true, xpReward: xp, coinReward: Math.ceil(xp/5) }
      });
      console.log(`  Created lesson: ${title}`);
    }
    return lesson;
  }

  const l3_1 = await getOrCreateLesson(ch3.id, 'Sayılar (int ve float)', 'LESSON', 1, 25);
  const l3_2 = await getOrCreateLesson(ch3.id, 'Metinler (string)', 'LESSON', 2, 25);
  const l3_3 = await getOrCreateLesson(ch3.id, 'Mantıksal Değerler (bool)', 'LESSON', 3, 20);
  const l3_4 = await getOrCreateLesson(ch3.id, 'type() Fonksiyonu', 'LESSON', 4, 20);
  const l3_5 = await getOrCreateLesson(ch3.id, 'Tip Dönüşümü', 'LESSON', 5, 30);

  // Seed Chapter 3 lessons
  await seedLesson(l3_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Sayı Tipleri: int ve float',
      content: `<h2>Python'da Sayılar</h2>
<p>Python'da iki ana sayı tipi vardır:</p>
<h3>int (Tam Sayı)</h3>
<div class="code-block">yas = 25
nufus = 85000000
sicaklik = -10</div>
<h3>float (Ondalıklı Sayı)</h3>
<div class="code-block">pi = 3.14159
boy = 1.75
vergi_orani = 0.18</div>
<h3>Fark Nedir?</h3>
<p><code>int</code> tam sayılar için, <code>float</code> kesirli/ondalıklı sayılar içindir.</p>
<div class="code-block">print(type(5))    # &lt;class 'int'&gt;
print(type(5.0))  # &lt;class 'float'&gt;</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Sayısal İşlemler',
      content: `<p>Python'da matematiksel işlemler:</p>`,
      code: `# Temel işlemler
print(10 + 3)   # Toplama: 13
print(10 - 3)   # Çıkarma: 7
print(10 * 3)   # Çarpma: 30
print(10 / 3)   # Bölme: 3.333...
print(10 // 3)  # Tam bölme: 3
print(10 % 3)   # Kalan: 1
print(2 ** 10)  # Üs alma: 1024

# int vs float
print(5 + 2)    # int: 7
print(5 + 2.0)  # float: 7.0
print(5 / 2)    # float: 2.5
print(5 // 2)   # int: 2`
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Matematik Ustası! 🧮',
      content: '<p>Bir dikdörtgenin alanını ve çevresini hesapla: <code>uzunluk = 12</code>, <code>genişlik = 5</code></p>'
    },
    { order: 4, type: 'SUMMARY', title: 'Sayıları Öğrendin! 🔢', content: '<p>int ve float tiplerini ve matematiksel operatörleri artık biliyorsun!</p>' }
  ], {
    title: 'Dikdörtgen Hesaplama',
    description: 'Dikdörtgenin alan ve çevresini hesapla.',
    starterCode: 'uzunluk = 12\ngenislik = 5\n\n# Alan = uzunluk * genislik\n# Cevre = 2 * (uzunluk + genislik)',
    solutionCode: 'uzunluk = 12\ngenislik = 5\nalan = uzunluk * genislik\ncevre = 2 * (uzunluk + genislik)\nprint(alan)\nprint(cevre)',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: '60\n34', description: 'Alan=60, Çevre=34 olmalı', isHidden: false }
    ]
  });

  await seedLesson(l3_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'String (Metin) Tipi',
      content: `<h2>String Nedir?</h2>
<p>String, metin verilerini saklamak için kullanılan veri tipidir. Tek tırnak (<code>'</code>) veya çift tırnak (<code>"</code>) ile yazılır.</p>
<div class="code-block">isim = "Ayşe"
mesaj = 'Merhaba, Dünya!'
uzun_metin = """Bu çok
satırlı bir
metindir."""</div>
<h3>String İşlemleri</h3>
<div class="code-block">selamlama = "Merhaba"
isim = "Ali"

# Birleştirme (concatenation)
tam_mesaj = selamlama + ", " + isim + "!"
print(tam_mesaj)  # Merhaba, Ali!

# Tekrarlama
print("Ha" * 3)   # HaHaHa

# Uzunluk
print(len(isim))  # 3</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'String Metodları',
      content: '<p>Python stringler üzerinde kullanabileceğin hazır metodlar:</p>',
      code: `metin = "python programlama"

# Büyük/küçük harf
print(metin.upper())    # PYTHON PROGRAMLAMA
print(metin.title())    # Python Programlama
print(metin.capitalize()) # Python programlama

# Arama
print("python" in metin)   # True
print(metin.count("a"))    # 4

# Bölme
kelimeler = metin.split(" ")
print(kelimeler)  # ['python', 'programlama']

# Değiştirme
yeni = metin.replace("python", "CodeTR")
print(yeni)  # codetr programlama

# Boşluk temizleme
kirli = "  merhaba  "
print(kirli.strip())  # "merhaba"`
    },
    {
      order: 3, type: 'CHALLENGE', title: 'İsim Formatla! ✍️',
      content: '<p>Kullanıcı adı: <code>"   ahmet yilmaz   "</code> → Boşlukları temizle ve Her Kelimeyi Büyük Yap.</p>'
    },
    { order: 4, type: 'SUMMARY', title: 'String Ustası Oldun! 📝', content: '<p>Stringlerin nasıl çalıştığını ve temel metodları öğrendin!</p>' }
  ], {
    title: 'İsim Formatlama',
    description: 'Verilen string\'i temizle ve Title Case yap.',
    starterCode: 'kullanici_adi = "   ahmet yilmaz   "\n\n# Boşlukları temizle\n# Title case yap\n# Sonucu yazdır',
    solutionCode: 'kullanici_adi = "   ahmet yilmaz   "\ntemiz = kullanici_adi.strip()\nformatli = temiz.title()\nprint(formatli)',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: 'Ahmet Yilmaz', description: 'Temizlenmiş ve formatlanmış isim', isHidden: false }
    ]
  });

  await seedLesson(l3_3.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Boolean Tipi',
      content: `<h2>Boolean (Mantıksal) Değerler</h2>
<p>Boolean tipi sadece iki değer alabilir: <code>True</code> veya <code>False</code></p>
<div class="code-block">online_mi = True
sisteme_girildi = False</div>
<h3>Karşılaştırma Operatörleri</h3>
<div class="code-block">print(5 > 3)    # True
print(5 < 3)    # False
print(5 == 5)   # True  (== eşitlik kontrolü!)
print(5 != 3)   # True
print(5 >= 5)   # True
print(5 <= 4)   # False</div>
<h3>Mantıksal Operatörler</h3>
<div class="code-block">print(True and False)  # False
print(True or False)   # True
print(not True)        # False</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Boolean Örnekleri',
      content: '<p>Gerçek dünyadan boolean örnekleri:</p>',
      code: `yas = 20
gelir = 5000

# Karşılaştırmalar
yetiskin_mi = yas >= 18
print("Yetişkin mi?", yetiskin_mi)  # True

# Birden fazla koşul
kredi_uygun_mu = yetiskin_mi and gelir >= 3000
print("Kredi uygun mu?", kredi_uygun_mu)  # True

# not operatörü
giris_yapilmadi = not True
print("Giriş yapılmadı:", giris_yapilmadi)  # False

# Sayıların boolean karşılığı
print(bool(0))     # False
print(bool(1))     # True
print(bool(""))    # False
print(bool("hi"))  # True`
    },
    { order: 3, type: 'SUMMARY', title: 'Boolean\'ları Öğrendin! ✅', content: '<p>Mantıksal değerler ve karşılaştırma operatörleri artık senin için sır değil!</p>' }
  ]);

  await seedLesson(l3_4.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'type() ile Tip Kontrolü',
      content: `<h2>type() Fonksiyonu</h2>
<p><code>type()</code> fonksiyonu bir değerin tipini söyler:</p>
<div class="code-block">print(type(42))       # &lt;class 'int'&gt;
print(type(3.14))     # &lt;class 'float'&gt;
print(type("hello"))  # &lt;class 'str'&gt;
print(type(True))     # &lt;class 'bool'&gt;</div>
<h3>isinstance() ile Tip Kontrolü</h3>
<div class="code-block">x = 42
print(isinstance(x, int))    # True
print(isinstance(x, float))  # False
print(isinstance(x, (int, float)))  # True</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Tip Kontrolü Örnekleri',
      content: '<p>type() ve isinstance() kullanımı:</p>',
      code: `# Çeşitli tipler
degerler = [42, 3.14, "merhaba", True, None]

for d in degerler:
    print(f"{d!r:15} → {type(d).__name__}")

print()

# isinstance ile güvenli kontrol
sayi = 7
if isinstance(sayi, int):
    print(f"{sayi} bir tam sayıdır")
    
metin = "CodeTR"
if isinstance(metin, str):
    print(f'"{metin}" bir string\'dir, uzunluğu: {len(metin)}')`
    },
    { order: 3, type: 'SUMMARY', title: 'Tip Kontrolcüsü! 🔍', content: '<p>type() ve isinstance() ile değişken tiplerini kontrol etmeyi öğrendin!</p>' }
  ]);

  await seedLesson(l3_5.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'Tip Dönüşümü (Type Casting)',
      content: `<h2>Tip Dönüşümü</h2>
<p>Bir veri tipini başka bir tipe dönüştürebilirsiniz:</p>
<div class="code-block">int("42")     → 42  (str → int)
float("3.14") → 3.14 (str → float)
str(42)       → "42" (int → str)
bool(0)       → False (int → bool)
list("abc")   → ['a','b','c']</div>
<h3>Neden Gerekli?</h3>
<p>Kullanıcıdan gelen veriler genellikle string formatındadır. İşlem yapmak için sayıya dönüştürmen gerekir:</p>
<div class="code-block">giris = "25"  # String
yas = int(giris)  # Artık int
print(yas + 5)    # 30 ✅</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'Dönüşüm Örnekleri',
      code: `# String → Sayı
metin_sayi = "42"
tam_sayi = int(metin_sayi)
ondalikli = float(metin_sayi)
print(tam_sayi + 8)    # 50
print(ondalikli + 0.5) # 42.5

# Sayı → String
yas = 25
mesaj = "Yaşım: " + str(yas)
print(mesaj)

# float → int (yuvarlama olmadan, kırpar!)
print(int(3.9))   # 3 (dikkat: 4 değil!)
print(int(-3.9))  # -3

# Güvenli dönüşüm
try:
    sayi = int("merhaba")  # Hata!
except ValueError:
    print("Bu bir sayı değil!")`,
      content: '<p>Farklı tip dönüşüm örnekleri:</p>'
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Dönüştür ve Hesapla! 🔄',
      content: '<p>Aşağıdaki string değerleri sayıya dönüştür ve toplamlarını yazdır: <code>a = "15"</code>, <code>b = "27"</code></p>'
    },
    { order: 4, type: 'SUMMARY', title: 'Tip Dönüşümünü Öğrendin! 🎓', content: '<p>Veri tiplerini birbiriyle dönüştürebiliyorsun. Bir sonraki bölümde kullanıcıdan giriş almayı öğreneceğiz!</p>' }
  ], {
    title: 'String\'den Sayıya Dönüştür',
    description: '"15" ve "27" string\'lerini int\'e dönüştür ve toplamını yazdır.',
    starterCode: 'a = "15"\nb = "27"\n\n# a ve b\'yi int\'e dönüştür\n# Toplamlarını yazdır',
    solutionCode: 'a = "15"\nb = "27"\ntoplam = int(a) + int(b)\nprint(toplam)',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: '42', description: '15 + 27 = 42', isHidden: false }
    ]
  });

  // ──────────────────────────────────────────────
  // Chapter 4: Koşul İfadeleri
  // ──────────────────────────────────────────────
  console.log('\n📚 Chapter 4: Koşul İfadeleri (creating...)');
  let ch4 = await db.chapter.findFirst({ where: { courseId, order: 4 } });
  if (!ch4) {
    ch4 = await db.chapter.create({
      data: { courseId, title: 'Koşul İfadeleri', order: 4, description: 'if/elif/else yapılarını öğrenin', isPublished: true }
    });
  }

  const l4_1 = await getOrCreateLesson(ch4.id, 'if Koşulu', 'LESSON', 1, 30);
  const l4_2 = await getOrCreateLesson(ch4.id, 'elif ve else', 'LESSON', 2, 30);
  const l4_3 = await getOrCreateLesson(ch4.id, 'İç İçe if', 'LESSON', 3, 30);
  const l4_4 = await getOrCreateLesson(ch4.id, 'Koşul Görevi', 'CHALLENGE', 4, 50);

  await seedLesson(l4_1.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'if Koşulu',
      content: `<h2>if İfadesi</h2>
<p><code>if</code> ifadesi, bir koşulun doğru olması durumunda kod çalıştırır.</p>
<div class="code-block">if koşul:
    # koşul True ise çalışır
    yapılacak_işlem</div>
<h3>Önemli: Girinti (Indentation)</h3>
<p>Python'da kod blokları <strong>4 boşluk</strong> girinti ile belirlenir. Bu zorunludur!</p>
<div class="code-block">yas = 20
if yas >= 18:
    print("Ehliyet alabilirsiniz")  # Bu çalışır
    print("Oy kullanabilirsiniz")   # Bu da çalışır
print("Bu her zaman çalışır")       # if dışında</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'if Örnekleri',
      code: `not_ortalamasi = 75

# Basit if
if not_ortalamasi >= 50:
    print("Geçtiniz!")

# Birden fazla koşul (and/or)
yas = 22
burs_alici_mi = True

if yas < 25 and burs_alici_mi:
    print("İndirimli bilet hakkınız var!")

# Sayısal kontrol
sayi = 17
if sayi % 2 == 0:
    print(f"{sayi} çift sayıdır")
    
if sayi % 2 != 0:
    print(f"{sayi} tek sayıdır")`,
      content: '<p>if koşulunun farklı kullanımları:</p>'
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Not Kontrolü! 📊',
      content: `<p><code>not_ortalamasi = 73</code> değişkeni için: 50\'den büyükse "Geçti", değilse "Kaldı" yazdır.</p>`
    },
    { order: 4, type: 'SUMMARY', title: 'if\'i Öğrendin! 🎯', content: '<p>Koşullu ifadeler programlamada karar verme mekanizmasıdır. Harika!</p>' }
  ], {
    title: 'Not Kontrolü',
    description: 'not_ortalamasi 50 veya üstüyse "Gecti" yazdır.',
    starterCode: 'not_ortalamasi = 73\n\n# 50 veya üstü ise "Gecti" yazdır\n# 50\'den az ise "Kaldi" yazdır',
    solutionCode: 'not_ortalamasi = 73\nif not_ortalamasi >= 50:\n    print("Gecti")\nelse:\n    print("Kaldi")',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: 'Gecti', description: '73 >= 50 olduğu için "Gecti"', isHidden: false }
    ]
  });

  await seedLesson(l4_2.id, [
    {
      order: 1, type: 'EXPLANATION', title: 'elif ve else',
      content: `<h2>elif ve else</h2>
<p>Birden fazla koşul için <code>elif</code>, hiçbiri sağlanmazsa <code>else</code> kullanılır:</p>
<div class="code-block">if koşul1:
    # koşul1 True ise
elif koşul2:
    # koşul2 True ise
elif koşul3:
    # koşul3 True ise
else:
    # hiçbiri değilse</div>
<h3>Not Sistemi Örneği</h3>
<div class="code-block">not = 85
if not >= 90:
    harf = "AA"
elif not >= 80:
    harf = "BA"
elif not >= 70:
    harf = "BB"
elif not >= 60:
    harf = "CB"
else:
    harf = "FF"
print("Harf notunuz:", harf)  # BA</div>`
    },
    {
      order: 2, type: 'EXAMPLE', title: 'BMI Hesaplama',
      code: `agirlik = 70  # kg
boy = 1.75    # metre

bmi = agirlik / (boy ** 2)
print(f"BMI: {bmi:.1f}")

if bmi < 18.5:
    kategori = "Zayıf"
elif bmi < 25.0:
    kategori = "Normal"
elif bmi < 30.0:
    kategori = "Fazla Kilolu"
else:
    kategori = "Obez"

print(f"Kategori: {kategori}")`,
      content: '<p>elif zinciri örneği — BMI hesaplama:</p>'
    },
    {
      order: 3, type: 'CHALLENGE', title: 'Mevsim Bulucu! 🌸',
      content: '<p><code>ay = 4</code> değişkeni için mevsimi bul ve yazdır (1-3: Kış, 4-6: İlkbahar, 7-9: Yaz, 10-12: Sonbahar)</p>'
    },
    { order: 4, type: 'SUMMARY', title: 'elif/else Ustası! 🌟', content: '<p>Çoklu koşulları elif zinciriyle yönetmeyi öğrendin!</p>' }
  ], {
    title: 'Mevsim Bulucu',
    description: 'ay değişkenine göre mevsimi yazdır.',
    starterCode: 'ay = 4\n\n# 1-3: Kış, 4-6: İlkbahar, 7-9: Yaz, 10-12: Sonbahar',
    solutionCode: 'ay = 4\nif ay <= 3:\n    print("Kış")\nelif ay <= 6:\n    print("İlkbahar")\nelif ay <= 9:\n    print("Yaz")\nelse:\n    print("Sonbahar")',
    difficulty: 'easy',
    testCases: [
      { order: 1, input: '', expectedOutput: 'İlkbahar', description: 'Ay 4 → İlkbahar', isHidden: false }
    ]
  });

  // Update course totalLessons count
  const totalLessons = await db.lesson.count({ where: { chapter: { courseId } } });
  await db.course.update({ where: { id: courseId }, data: { totalLessons, isPublished: true } });
  console.log(`\n✅ Total lessons now: ${totalLessons}`);
  console.log('🎉 All lessons seeded successfully!');

  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
