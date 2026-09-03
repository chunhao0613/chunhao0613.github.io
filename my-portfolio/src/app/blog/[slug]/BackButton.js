"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // 有站內歷史就回上一頁，否則回首頁的文章區
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/#blog");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors"
    >
      <ArrowLeft size={18} />
      回到上一頁
    </button>
  );
}
