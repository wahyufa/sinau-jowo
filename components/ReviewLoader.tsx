"use client";

import dynamic from "next/dynamic";
import type { VocabItem } from "@/lib/curriculum";

const ReviewRunner = dynamic(() => import("@/components/ReviewRunner"), {
  ssr: false,
  loading: () => (
    <div className="lesson-page">
      <div className="loading-spinner" />
    </div>
  ),
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
