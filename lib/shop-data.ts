export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  badge: string;
  category: "BOOST" | "LIMIT" | "BADGE" | "KEY";
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "streak-freeze",
    name: "Seri Koruyucu (Streak Freeze)",
    description: "Bir gün ders yapmayı kaçırsan bile aktif serini (streak) sıfırlanmaktan korur.",
    price: 100,
    icon: "🛡️",
    badge: "Popüler",
    category: "BOOST",
  },
  {
    id: "xp-boost",
    name: "2x XP Katlayıcı (2 Saat)",
    description: "Önümüzdeki 2 saat boyunca tamamladığın her dersten 2 kat fazla XP kazan.",
    price: 150,
    icon: "⚡",
    badge: "Güçlendirici",
    category: "BOOST",
  },
  {
    id: "limit-booster",
    name: "Günlük Ders Limiti Artırıcı (+5 Hakkı)",
    description: "Bugün yapabileceğin maksimum ders limitine +5 ekstra ders hakkı ekler.",
    price: 120,
    icon: "🚀",
    badge: "Özel",
    category: "LIMIT",
  },
  {
    id: "vip-badge",
    name: "Efsanevi VIP Profil Çerçevesi",
    description: "Profilinde ve liderlik tablosunda adının yanında altın VIP rozeti gösterir.",
    price: 300,
    icon: "👑",
    badge: "Koleksiyon",
    category: "BADGE",
  },
  {
    id: "random-key",
    name: "Sürpriz Erişim Anahtarı (Random Key)",
    description: "Kilitli kurslardan birinin kapısını açan rastgele bir Kurs Erişim Anahtarı kazandırır.",
    price: 200,
    icon: "🔑",
    badge: "Sürpriz",
    category: "KEY",
  },
];
