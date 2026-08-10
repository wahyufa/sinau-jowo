"use client";

import dynamic from "next/dynamic";
import type { Unit } from "@/lib/curriculum";

const LessonRunner = dynamic(() => import("@/components/LessonRunner"), {
  ssr: false,
  loading: () => <div className="lesson-page lesson-loading" />,
});

export default function LessonLoader({ unit }: { unit: Unit }) {
  return <LessonRunner unit={unit} />;
}
