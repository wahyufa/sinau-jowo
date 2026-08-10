"use client";

import { useUiLang } from "@/lib/i18n";

export default function LearnGreeting({ username }: { username: string }) {
  const { t } = useUiLang();
  return (
    <p className="learn-greeting">
      {t("learnGreetingPrefix")} {username}
    </p>
  );
}
