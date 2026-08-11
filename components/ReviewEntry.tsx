"use client";

import Link from "next/link";
import { useUiLang } from "@/lib/i18n";

export default function ReviewEntry({ count }: { count: number }) {
  const { lang } = useUiLang();

  if (count === 0) return null;

  const label =
    lang === "id"
      ? `${count} kata perlu diulang`
      : `${count} tembung perlu dibolan-baleni`;
  const button = lang === "id" ? "Latihan Ulang" : "Bolan-baleni";

  return (
    <Link href="/review" className="review-banner">
      <span className="review-banner-icon">🔁</span>
      <span className="review-banner-label">{label}</span>
      <span className="review-banner-cta">{button} →</span>
    </Link>
  );
}
