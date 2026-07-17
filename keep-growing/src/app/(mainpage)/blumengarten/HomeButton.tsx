"use client";

import { useRouter } from "next/navigation";

// One shared home icon for every flower-garden page so the symbol is
// identical everywhere (matches the house icon in the design PDF).
export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard")}
      className="flex h-11 w-11 items-center justify-center rounded-2xl transition hover:bg-[#f3ece8]"
      aria-label="Back to home"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c08a95"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
      </svg>
    </button>
  );
}
