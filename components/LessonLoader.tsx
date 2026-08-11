"use client";

import dynamic from "next/dynamic";
import type { Unit, Lesson } from "@/lib/curriculum";

const LessonRunner = dynamic(() => import("@/components/LessonRunner"), {
  ssr: false,
  loading: () => <div className="lesson-page lesson-loading" />,
});

export default function LessonLoader({ unit, lesson }: { unit: Unit; lesson: Lesson }) {
  return <LessonRunner unit={unit} lesson={lesson} />;
}
