// Kosakata di bawah ini adalah draf awal (kromo/krama alus) dan belum
// direview oleh penutur asli. Cek ulang sebelum dipakai user publik.
// Catatan "context" (kapan/ke siapa dipakai) juga masih draf kasar per
// kategori, bukan hasil riset linguistik mendalam per kata.

export type VocabItem = {
  id: string;
  indonesian: string;
  krama: string;
  context: string;
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

function lesson(
  unitId: string,
  lessonNum: number,
  title: string,
  items: [string, string, string?][],
  defaultContext: string,
): Lesson {
  return {
    id: `${unitId}-l${lessonNum}`,
    title,
    vocab: items.map(([indonesian, krama, context], i) => ({
      id: `${unitId}-l${lessonNum}-${i}`,
      indonesian,
      krama,
      context: context ?? defaultContext,
    })),
  };
}

const CTX_SAPAAN = "Dipakai untuk menyapa siapa saja, terutama yang lebih tua atau baru dikenal.";
const CTX_KULAWARGA = "Dipakai saat menyebut anggota keluarga secara hormat, baik keluarga sendiri maupun orang lain.";
const CTX_ANGKA = "Dipakai saat menyebut jumlah/angka dalam percakapan sopan (kromo).";
const CTX_WEKTU = "Dipakai saat menyebut waktu dalam percakapan sopan.";
const CTX_KRIYA = "Kata kerja untuk kegiatan orang yang dihormati, bukan untuk kegiatan diri sendiri.";
const CTX_PANGANAN = "Dipakai saat menyebut makanan/minuman secara sopan, misalnya saat menawarkan pada tamu.";
const CTX_BADAN = "Dipakai untuk menyebut bagian tubuh orang yang dihormati, bukan diri sendiri.";
const CTX_GRIYA = "Dipakai untuk menyebut rumah/barang milik orang yang dihormati secara sopan.";
const CTX_SOPAN = "Frasa sopan yang bisa dipakai ke siapa saja dalam percakapan sehari-hari.";

export const CURRICULUM: Unit[] = [
  {
    id: "sapaan",
    title: "Sapaan & Pamitan",
    description: "Ucapan sehari-hari untuk menyapa dan berpamitan",
    icon: "👋",
    lessons: [
      lesson(
        "sapaan",
        1,
        "Bagian 1",
        [
          ["Selamat pagi", "Sugeng enjing"],
          ["Selamat siang", "Sugeng siang"],
          ["Selamat sore", "Sugeng sonten"],
          ["Selamat malam", "Sugeng dalu"],
          ["Apa kabar?", "Pripun kabaripun?"],
        ],
        CTX_SAPAAN,
      ),
      lesson(
        "sapaan",
        2,
        "Bagian 2",
        [
          ["Terima kasih", "Matur nuwun"],
          ["Sama-sama", "Sami-sami"],
          ["Permisi/maaf", "Nuwun sewu"],
          ["Sampai jumpa lagi", "Sugeng pepanggihan malih"],
        ],
        CTX_SAPAAN,
      ),
    ],
  },
  {
    id: "ganti-wong",
    title: "Tembung Ganti Wong",
    description: "Kata ganti orang yang sopan",
    icon: "🙋",
    lessons: [
      lesson(
        "ganti-wong",
        1,
        "Bagian 1",
        [
          ["Saya", "Kula", "Untuk menyebut diri sendiri secara merendah saat bicara sopan."],
          ["Kamu/Anda", "Panjenengan", "Untuk menyebut lawan bicara yang dihormati, seperti \"Anda\" yang sangat sopan."],
          ["Dia", "Piyambakipun", "Untuk menyebut orang ketiga yang dihormati."],
          ["Kita/kami", "Kula sedaya", "Untuk menyebut \"kami/kita\" secara sopan."],
        ],
        "Kata ganti orang dalam percakapan sopan.",
      ),
      lesson(
        "ganti-wong",
        2,
        "Bagian 2",
        [
          ["Mereka", "Piyambakipun sedaya", "Untuk menyebut \"mereka\" yang dihormati."],
          ["Nama saya", "Nama kula", "Untuk menyebut nama diri sendiri secara sopan."],
          ["Nama Anda", "Asma panjenengan", "Untuk menanyakan/menyebut nama lawan bicara yang dihormati."],
        ],
        "Kata ganti orang dalam percakapan sopan.",
      ),
    ],
  },
  {
    id: "kulawarga",
    title: "Kulawarga",
    description: "Sebutan untuk anggota keluarga",
    icon: "👪",
    lessons: [
      lesson(
        "kulawarga",
        1,
        "Bagian 1",
        [
          ["Ayah", "Bapak"],
          ["Ibu", "Ibu"],
          ["Anak laki-laki", "Putra"],
          ["Anak perempuan", "Putri"],
          ["Saudara", "Sedherek"],
        ],
        CTX_KULAWARGA,
      ),
      lesson(
        "kulawarga",
        2,
        "Bagian 2",
        [
          ["Suami", "Garwa kakung"],
          ["Istri", "Garwa putri"],
          ["Kakek", "Eyang kakung"],
          ["Nenek", "Eyang putri"],
        ],
        CTX_KULAWARGA,
      ),
    ],
  },
  {
    id: "angka",
    title: "Angka",
    description: "Berhitung dengan halus",
    icon: "🔢",
    lessons: [
      lesson(
        "angka",
        1,
        "Angka 1-5",
        [
          ["Satu", "Setunggal"],
          ["Dua", "Kalih"],
          ["Tiga", "Tigo"],
          ["Empat", "Sekawan"],
          ["Lima", "Gangsal"],
        ],
        CTX_ANGKA,
      ),
      lesson(
        "angka",
        2,
        "Angka 6-10",
        [
          ["Enam", "Enem"],
          ["Tujuh", "Pitu"],
          ["Delapan", "Wolu"],
          ["Sembilan", "Sanga"],
          ["Sepuluh", "Sedasa"],
        ],
        CTX_ANGKA,
      ),
    ],
  },
  {
    id: "wektu-dinten",
    title: "Wektu & Dinten",
    description: "Waktu dan hari",
    icon: "🕐",
    lessons: [
      lesson(
        "wektu-dinten",
        1,
        "Bagian 1",
        [
          ["Hari ini", "Dinten menika"],
          ["Besok", "Mbenjing"],
          ["Kemarin", "Kala wingi"],
          ["Sekarang", "Samenika"],
        ],
        CTX_WEKTU,
      ),
      lesson(
        "wektu-dinten",
        2,
        "Bagian 2",
        [
          ["Pagi", "Enjing"],
          ["Siang", "Siang"],
          ["Sore", "Sonten"],
          ["Malam", "Dalu"],
        ],
        CTX_WEKTU,
      ),
    ],
  },
  {
    id: "kriya-padinan",
    title: "Kriya Padinan",
    description: "Kata kerja sehari-hari",
    icon: "🏃",
    lessons: [
      lesson(
        "kriya-padinan",
        1,
        "Bagian 1",
        [
          ["Makan", "Dhahar"],
          ["Tidur", "Tilem"],
          ["Pergi", "Tindak"],
          ["Datang", "Rawuh"],
          ["Minum", "Ngunjuk"],
        ],
        CTX_KRIYA,
      ),
      lesson(
        "kriya-padinan",
        2,
        "Bagian 2",
        [
          ["Melihat", "Mirsani"],
          ["Berbicara", "Ngendika"],
          ["Duduk", "Lenggah"],
          ["Berdiri", "Jumeneng"],
          ["Mandi", "Siram"],
        ],
        CTX_KRIYA,
      ),
    ],
  },
  {
    id: "panganan",
    title: "Panganan & Unjukan",
    description: "Makanan dan minuman",
    icon: "🍚",
    lessons: [
      lesson(
        "panganan",
        1,
        "Makanan & Minuman",
        [
          ["Nasi", "Sekul"],
          ["Air", "Toya"],
          ["Minuman", "Unjukan"],
          ["Makanan", "Dhaharan"],
        ],
        CTX_PANGANAN,
      ),
    ],
  },
  {
    id: "perangan-badan",
    title: "Perangan Badan",
    description: "Bagian tubuh (untuk orang yang dihormati)",
    icon: "🖐️",
    lessons: [
      lesson(
        "perangan-badan",
        1,
        "Bagian 1",
        [
          ["Kepala", "Mustaka"],
          ["Mata", "Paningal"],
          ["Tangan", "Asta"],
        ],
        CTX_BADAN,
      ),
      lesson(
        "perangan-badan",
        2,
        "Bagian 2",
        [
          ["Kaki", "Suku"],
          ["Wajah", "Pasuryan"],
          ["Rambut", "Rikma"],
        ],
        CTX_BADAN,
      ),
    ],
  },
  {
    id: "griya-barang",
    title: "Griya & Barang",
    description: "Rumah dan barang milik",
    icon: "🏠",
    lessons: [
      lesson(
        "griya-barang",
        1,
        "Bagian 1",
        [
          ["Rumah", "Griya"],
          ["Rumah (org dihormati)", "Dalem", "Khusus untuk rumah orang yang sangat dihormati — lebih halus dari \"Griya\"."],
          ["Tempat tidur", "Pasareyan"],
        ],
        CTX_GRIYA,
      ),
      lesson(
        "griya-barang",
        2,
        "Bagian 2",
        [
          ["Baju", "Rasukan"],
          ["Uang", "Yatra"],
        ],
        CTX_GRIYA,
      ),
    ],
  },
  {
    id: "tembung-sopan",
    title: "Tembung Sopan",
    description: "Frasa sopan sehari-hari",
    icon: "🙏",
    lessons: [
      lesson(
        "tembung-sopan",
        1,
        "Bagian 1",
        [
          ["Silakan", "Mangga"],
          ["Tolong", "Nyuwun tulung"],
          ["Maaf", "Nyuwun pangapunten"],
        ],
        CTX_SOPAN,
      ),
      lesson(
        "tembung-sopan",
        2,
        "Bagian 2",
        [
          ["Terima kasih banyak", "Matur nuwun sanget"],
          ["Sama-sama", "Sami-sami"],
          ["Permisi (lewat)", "Nuwun sewu"],
        ],
        CTX_SOPAN,
      ),
    ],
  },
];

export function getUnit(unitId: string): Unit | undefined {
  return CURRICULUM.find((u) => u.id === unitId);
}

export type LessonContext = {
  unit: Unit;
  lesson: Lesson;
  unitIndex: number;
  lessonIndexInUnit: number;
};

export function getLessonContext(lessonId: string): LessonContext | undefined {
  for (let unitIndex = 0; unitIndex < CURRICULUM.length; unitIndex++) {
    const unit = CURRICULUM[unitIndex];
    const lessonIndexInUnit = unit.lessons.findIndex((l) => l.id === lessonId);
    if (lessonIndexInUnit !== -1) {
      return { unit, lesson: unit.lessons[lessonIndexInUnit], unitIndex, lessonIndexInUnit };
    }
  }
  return undefined;
}

export type FlatLesson = {
  unit: Unit;
  lesson: Lesson;
  isFirstInUnit: boolean;
};

/** All lessons across all units, in path order, for sequential unlock. */
export function getFlatLessons(): FlatLesson[] {
  return CURRICULUM.flatMap((unit) =>
    unit.lessons.map((lesson, i) => ({ unit, lesson, isFirstInUnit: i === 0 })),
  );
}

/** All vocab items across the whole curriculum, for review-mode lookups. */
export function getAllVocab(): VocabItem[] {
  return CURRICULUM.flatMap((unit) => unit.lessons.flatMap((l) => l.vocab));
}
