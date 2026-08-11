"use client";

import dynamic from "next/dynamic";
import type { VocabItem } from "@/lib/curriculum";

const ReviewRunner = dynamic(() => import("@/components/ReviewRunner"), {
  ssr: false,
  loading: () => <div className="lesson-page lesson-loading" />,
});

export default function ReviewLoader({
  words,
  allVocab,
}: {
  words: VocabItem[];
  allVocab: VocabItem[];
}) {
  return <ReviewRunner words={words} allVocab={allVocab} />;
}
