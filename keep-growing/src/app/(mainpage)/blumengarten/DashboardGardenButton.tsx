"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Same garden icon the dashboard always had, just aware of whether a
// trained flower is waiting to be planted (the same "selectedFlower"
// localStorage key the garden page itself reads for its reminder
// banner) so it can show the same kind of red dot as the friends icon.
export default function DashboardGardenButton() {
  const [flowerWaiting, setFlowerWaiting] = useState(false);

  useEffect(() => {
    setFlowerWaiting(Boolean(localStorage.getItem("selectedFlower")));
  }, []);

  return (
    <Link href="/blumengarten" className="flex flex-col items-center group">
      <div className="relative w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-50 transition-colors shadow-sm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b57a84" strokeWidth="1.5">
          <path d="M12 10c0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6 6-2.686 6-6z" transform="translate(6,2) scale(0.5)" strokeLinecap="round"/>
          <path d="M12 22V12m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="8" r="3" />
          <path d="M12 5v3m-3 2h3" />
        </svg>
        {flowerWaiting && (
          <span
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#c05a6e] ring-2 ring-white"
            aria-label="A new flower is ready to plant"
          />
        )}
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] mt-2 text-gray-400 font-bold">Garten</span>
    </Link>
  );
}
