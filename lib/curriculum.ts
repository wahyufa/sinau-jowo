// Kosakata di bawah ini adalah draf awal (kromo/krama alus) dan belum
// direview oleh penutur asli. Cek ulang sebelum dipakai user publik.

export type VocabItem = {
  id: string;
  indonesian: string;
  krama: string;
};

export type Lesson = {
  id: string;
  title: string;
  vocab: VocabItem[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
};

function vocab(unitId: string, items: [string, string][]): VocabItem[] {
  return items.map(([indonesian, krama], i) => ({
    id: `${unitId}-${i}`,
    indonesian,
    krama,
  }));
}

export const CURRICULUM: Unit[] = [
  {
    id: "sapaan",
    title: "Sapaan & Pamitan",
    description: "Ucapan sehari-hari untuk menyapa dan berpamitan",
    icon: "👋",
    lessons: [
      {
        id: "sapaan",
        title: "Sapaan Dasar",
        vocab: vocab("sapaan", [
          ["Selamat pagi", "Sugeng enjing"],
          ["Selamat siang", "Sugeng siang"],
          ["Selamat sore", "Sugeng sonten"],
          ["Selamat malam", "Sugeng dalu"],
          ["Apa kabar?", "Pripun kabaripun?"],
          ["Terima kasih", "Matur nuwun"],
          ["Sama-sama", "Sami-sami"],
          ["Permisi/maaf", "Nuwun sewu"],
          ["Sampai jumpa lagi", "Sugeng pepanggihan malih"],
        ]),
      },
    ],
  },
  {
    id: "ganti-wong",
    title: "Tembung Ganti Wong",
    description: "Kata ganti orang yang sopan",
    icon: "🙋",
    lessons: [
      {
        id: "ganti-wong",
        title: "Kata Ganti Orang",
        vocab: vocab("ganti-wong", [
          ["Saya", "Kula"],
          ["Kamu/Anda", "Panjenengan"],
          ["Dia", "Piyambakipun"],
          ["Kita/kami", "Kula sedaya"],
          ["Mereka", "Piyambakipun sedaya"],
          ["Nama saya", "Nama kula"],
          ["Nama Anda", "Asma panjenengan"],
        ]),
      },
    ],
  },
  {
    id: "kulawarga",
    title: "Kulawarga",
    description: "Sebutan untuk anggota keluarga",
    icon: "👪",
    lessons: [
      {
        id: "kulawarga",
        title: "Keluarga",
        vocab: vocab("kulawarga", [
          ["Ayah", "Bapak"],
          ["Ibu", "Ibu"],
          ["Anak laki-laki", "Putra"],
          ["Anak perempuan", "Putri"],
          ["Saudara", "Sedherek"],
          ["Suami", "Garwa kakung"],
          ["Istri", "Garwa putri"],
          ["Kakek", "Eyang kakung"],
          ["Nenek", "Eyang putri"],
        ]),
      },
    ],
  },
  {
    id: "angka",
    title: "Angka",
    description: "Berhitung dengan halus",
    icon: "🔢",
    lessons: [
      {
        id: "angka",
        title: "Angka 1-10",
        vocab: vocab("angka", [
          ["Satu", "Setunggal"],
          ["Dua", "Kalih"],
          ["Tiga", "Tigo"],
          ["Empat", "Sekawan"],
          ["Lima", "Gangsal"],
          ["Enam", "Enem"],
          ["Tujuh", "Pitu"],
          ["Delapan", "Wolu"],
          ["Sembilan", "Sanga"],
          ["Sepuluh", "Sedasa"],
        ]),
      },
    ],
  },
  {
    id: "wektu-dinten",
    title: "Wektu & Dinten",
    description: "Waktu dan hari",
    icon: "🕐",
    lessons: [
      {
        id: "wektu-dinten",
        title: "Waktu & Hari",
        vocab: vocab("wektu-dinten", [
          ["Hari ini", "Dinten menika"],
          ["Besok", "Mbenjing"],
          ["Kemarin", "Kala wingi"],
          ["Sekarang", "Samenika"],
          ["Pagi", "Enjing"],
          ["Siang", "Siang"],
          ["Sore", "Sonten"],
          ["Malam", "Dalu"],
        ]),
      },
    ],
  },
  {
    id: "kriya-padinan",
    title: "Kriya Padinan",
    description: "Kata kerja sehari-hari",
    icon: "🏃",
    lessons: [
      {
        id: "kriya-padinan",
        title: "Kata Kerja Sehari-hari",
        vocab: vocab("kriya-padinan", [
          ["Makan", "Dhahar"],
          ["Tidur", "Tilem"],
          ["Pergi", "Tindak"],
          ["Datang", "Rawuh"],
          ["Minum", "Ngunjuk"],
          ["Melihat", "Mirsani"],
          ["Berbicara", "Ngendika"],
          ["Duduk", "Lenggah"],
          ["Berdiri", "Jumeneng"],
          ["Mandi", "Siram"],
        ]),
      },
    ],
  },
  {
    id: "panganan",
    title: "Panganan & Unjukan",
    description: "Makanan dan minuman",
    icon: "🍚",
    lessons: [
      {
        id: "panganan",
        title: "Makanan & Minuman",
        vocab: vocab("panganan", [
          ["Nasi", "Sekul"],
          ["Air", "Toya"],
          ["Minuman", "Unjukan"],
          ["Makanan", "Dhaharan"],
        ]),
      },
    ],
  },
  {
    id: "perangan-badan",
    title: "Perangan Badan",
    description: "Bagian tubuh (untuk orang yang dihormati)",
    icon: "🖐️",
    lessons: [
      {
        id: "perangan-badan",
        title: "Bagian Tubuh",
        vocab: vocab("perangan-badan", [
          ["Kepala", "Mustaka"],
          ["Mata", "Paningal"],
          ["Tangan", "Asta"],
          ["Kaki", "Suku"],
          ["Wajah", "Pasuryan"],
          ["Rambut", "Rikma"],
        ]),
      },
    ],
  },
  {
    id: "griya-barang",
    title: "Griya & Barang",
    description: "Rumah dan barang milik",
    icon: "🏠",
    lessons: [
      {
        id: "griya-barang",
        title: "Rumah & Barang",
        vocab: vocab("griya-barang", [
          ["Rumah", "Griya"],
          ["Rumah (org dihormati)", "Dalem"],
          ["Tempat tidur", "Pasareyan"],
          ["Baju", "Rasukan"],
          ["Uang", "Yatra"],
        ]),
      },
    ],
  },
  {
    id: "tembung-sopan",
    title: "Tembung Sopan",
    description: "Frasa sopan sehari-hari",
    icon: "🙏",
    lessons: [
      {
        id: "tembung-sopan",
        title: "Frasa Sopan",
        vocab: vocab("tembung-sopan", [
          ["Silakan", "Mangga"],
          ["Tolong", "Nyuwun tulung"],
          ["Maaf", "Nyuwun pangapunten"],
          ["Terima kasih banyak", "Matur nuwun sanget"],
          ["Sama-sama", "Sami-sami"],
          ["Permisi (lewat)", "Nuwun sewu"],
        ]),
      },
    ],
  },
];

export function getUnit(unitId: string): Unit | undefined {
  return CURRICULUM.find((u) => u.id === unitId);
}

export function getUnitIndex(unitId: string): number {
  return CURRICULUM.findIndex((u) => u.id === unitId);
}
