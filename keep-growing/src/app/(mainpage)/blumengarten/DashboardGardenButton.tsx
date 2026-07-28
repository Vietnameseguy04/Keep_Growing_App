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
        <svg
  width="33"
  height="33"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#b57a84"
  strokeWidth="1.25"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  {/* Blütenblätter */}
  <circle cx="12" cy="5.5" r="2.4" />
  <circle cx="8.6" cy="8.4" r="2.4" />
  <circle cx="15.4" cy="8.4" r="2.4" />
  <circle cx="9.9" cy="12.4" r="2.4" />
  <circle cx="14.1" cy="12.4" r="2.4" />

  {/* Blütenmitte */}
  <circle cx="12" cy="9.2" r="2" />

  {/* Stiel */}
  <path d="M12 14.3v5.2" />

  {/* Blätter */}
  <path d="M12 16.7c-2.2-.5-3.8.4-4.5 2.1 2.2.5 3.8-.4 4.5-2.1Z" />
  <path d="M12 17.8c2.2-.5 3.8.4 4.5 2.1-2.2.5-3.8-.4-4.5-2.1Z" />
</svg>

        {flowerWaiting && (
          <span
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#c05a6e] ring-2 ring-white"
            aria-label="A new flower is ready to plant"
          />
        )}
      </div>

      <span className="text-[10px] uppercase tracking-[0.2em] mt-2 text-gray-400 font-bold">
        Garden
      </span>
    </Link>
  );
}