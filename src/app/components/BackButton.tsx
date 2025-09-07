"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="px-5 py-2 rounded-lg bg-[#546A51] text-white font-semibold hover:bg-[#40523a] transition shadow-lg"
      type="button"
    >
      &larr; Kembali
    </button>
  );
}
