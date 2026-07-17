"use client";

import { useRouter } from "next/navigation";
import { flowerOptions, type FlowerId } from "../flowers";

export default function FlowerSelectionPage() {
  const router = useRouter();

  function handleSelect(flowerId: FlowerId) {
    localStorage.setItem("selectedFlower", flowerId);
    router.push("/blumengarten");
  }

  function handleSkip() {
    localStorage.removeItem("selectedFlower");
    router.push("/blumengarten");
  }

  return (
    <main className="min-h-screen bg-[#faf7f5] flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#f3ece8]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b57a84"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="mb-10 rounded-3xl bg-[#f2ebe8] px-6 py-5 text-center shadow-sm">
          <h1 className="text-lg font-bold leading-7 text-[#7a4a58]">
            Choose your autogenic training for today and let your mind grow
          </h1>
        </div>

        <div className="space-y-5">
          {flowerOptions.map((flower) => (
            <button
              key={flower.id}
              type="button"
              onClick={() => handleSelect(flower.id)}
              className="flex w-full items-center gap-4 text-left"
            >
              <img
                src={flower.image}
                alt=""
                className="h-14 w-14 shrink-0 object-contain"
              />
              <span className="flex-1 rounded-full bg-[#c08a95] px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#b67f8a]">
                {flower.title}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[13px] text-[#4f6175] underline underline-offset-2"
          >
            go directly to your flower garden
          </button>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => router.push("/impressum")}
            className="text-[11px] text-[#4f6175] underline underline-offset-2"
          >
            About us
          </button>
        </div>
      </div>
    </main>
  );
}