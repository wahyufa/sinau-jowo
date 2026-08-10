import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/learn");

  return (
    <main className="landing">
      <section className="landing-hero">
        <p className="landing-kicker">Basa Jawa Alus</p>
        <h1>Sinau Kromo Inggil, Saben Dina</h1>
        <p className="landing-lede">
          Belajar unggah-ungguh basa Jawa halus lewat latihan singkat harian —
          sapaan, kosakata keluarga, angka, sampai kata kerja sehari-hari.
        </p>
        <div className="landing-cta">
          <Link href="/signup" className="btn btn-primary">
            Wiwit Sinau — Gratis
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Masuk
          </Link>
        </div>
      </section>

      <section className="landing-note">
        <p>
          <strong>Catatan:</strong> materi masih draf awal dan belum direview
          penutur asli. Sinau karo tekun, lan koreksi yen ana sing kurang pas.
        </p>
      </section>
    </main>
  );
}
