"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { flowerImageById, flowerTitleById } from "../../flowers";
import HomeButton from "../../HomeButton";

type SavedFlower = {
  id: string;
  user_id: string;
  flower_type: string;
  x: number;
  y: number;
  layer_order: number;
  created_at: string;
};

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function FriendGardenPage() {
  const router = useRouter();
  const params = useParams<{ friendId: string }>();
  const supabase = createClient();

  const friendId = params.friendId;

  const [userId, setUserId] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("your friend");
  const [flowers, setFlowers] = useState<SavedFlower[]>([]);

  // Like flow: heart click opens a message box, sending stores the like
  // (plus optional message) and resets the heart so it can be sent again.
  const [likeBoxOpen, setLikeBoxOpen] = useState(false);
  const [likeMessage, setLikeMessage] = useState("");
  const [likeSent, setLikeSent] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Only meadows of friends are visible (enforced by the RLS
      // policies in supabase-migration.sql).
      const { data: friendship, error: friendshipError } = await supabase
        .from("friendships")
        .select("id")
        .eq("status", "accepted")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`,
        )
        .maybeSingle();

      if (friendshipError || !friendship) {
        setErrorMessage(
          "You can only visit this flower meadow once you are friends.",
        );
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", friendId)
        .maybeSingle();

      if (profile) {
        setFriendName(
          (profile.full_name?.trim() || profile.email || "your friend")
            .toLowerCase()
            .split(" ")[0],
        );
      }

      // The owner's monthly rule also applies when visiting
      let visibleFrom = startOfCurrentMonth();

      const { data: settings } = await supabase
        .from("garden_settings")
        .select("last_reset_at")
        .eq("user_id", friendId)
        .maybeSingle();

      if (settings?.last_reset_at) {
        const lastReset = new Date(settings.last_reset_at);
        if (lastReset > visibleFrom) {
          visibleFrom = lastReset;
        }
      }

      const { data: flowerData, error: flowerError } = await supabase
        .from("flower_garden")
        .select("*")
        .eq("user_id", friendId)
        .gte("created_at", visibleFrom.toISOString())
        .order("layer_order", { ascending: true });

      if (flowerError) {
        setErrorMessage(
          `The flower meadow could not be loaded: ${flowerError.message}`,
        );
      } else {
        setFlowers(flowerData ?? []);
      }

      setLoading(false);
    }

    if (friendId) {
      load();
    }
  }, [friendId, router, supabase]);

  async function handleSendLike() {
    if (!userId || likeBusy) return;

    setLikeBusy(true);
    setErrorMessage(null);

    const trimmed = likeMessage.trim();

    const { error } = await supabase.from("garden_likes").insert({
      garden_owner_id: friendId,
      liker_id: userId,
      message: trimmed || null,
    });

    if (error) {
      setErrorMessage("Your like could not be sent. Please try again.");
      setLikeBusy(false);
      return;
    }

    // Reset the heart so another like can be sent later.
    setLikeBoxOpen(false);
    setLikeMessage("");
    setLikeSent(true);
    setLikeBusy(false);
    window.setTimeout(() => setLikeSent(false), 3500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3f1] flex items-center justify-center">
        <p className="text-[#7a6d71]">Loading the flower meadow...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f1] flex flex-col items-center px-6 py-6">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/blumengarten/freunde")}
            aria-label="Back to your friends"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#f3ece8]"
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

          <HomeButton />
        </div>

        <h2 className="mb-4 font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
          {friendName}&apos;s garden
        </h2>

        {!errorMessage && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="rounded-[18px] bg-[#f1ece9] px-5 py-3 text-[15px] font-semibold text-[#5e5357]">
              wow, how beautiful!
            </p>
            <button
              type="button"
              onClick={() => setLikeBoxOpen((open) => !open)}
              disabled={likeBusy}
              aria-label="Like this flower meadow"
              aria-expanded={likeBoxOpen}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e7ea] transition hover:bg-[#f2dce1] disabled:opacity-50"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={likeBoxOpen ? "#c05a6e" : "none"}
                stroke="#c05a6e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21c-4.2-3.2-7.6-6-8.8-9.2C2 8.7 3.6 5.6 6.6 5.1c1.8-.3 3.7.5 5.4 2.6 1.7-2.1 3.6-2.9 5.4-2.6 3 .5 4.6 3.6 3.4 6.7C19.6 15 16.2 17.8 12 21z" />
              </svg>
            </button>
          </div>
        )}

        <AnimatePresence initial={false}>
          {likeBoxOpen && !errorMessage && (
            <motion.div
              key="like-box"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mb-6 rounded-[22px] bg-white px-5 py-4">
                <label
                  htmlFor="like-message"
                  className="mb-2 block text-[13px] font-medium text-[#5e5357]"
                >
                  Add a little message if you like:
                </label>
                <textarea
                  id="like-message"
                  value={likeMessage}
                  onChange={(e) => setLikeMessage(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="wow, your meadow looks lovely..."
                  className="w-full resize-none rounded-[16px] bg-[#f6f3f1] px-4 py-3 text-[14px] text-[#5e5357] placeholder-[#b2a8ab] outline-none focus:ring-1 focus:ring-[#c08a95]"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLikeBoxOpen(false);
                      setLikeMessage("");
                    }}
                    className="rounded-full bg-[#efe8e3] px-4 py-2 text-[13px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendLike}
                    disabled={likeBusy}
                    className="rounded-full bg-[#c08a95] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#b67f8a] disabled:opacity-50"
                  >
                    {likeBusy ? "Sending..." : "Send like ♥"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {likeSent && (
            <motion.p
              key="like-sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-[22px] bg-[#eaf1e2] px-5 py-3 text-center text-[14px] text-[#5e7050]"
            >
              Your like is on its way ♥
            </motion.p>
          )}
        </AnimatePresence>

        {errorMessage && (
          <div className="mb-5 rounded-[22px] bg-[#f8e8ea] px-5 py-4 text-center">
            <p className="text-[14px] leading-6 text-[#9b5d68]">
              {errorMessage}
            </p>
          </div>
        )}

        {!errorMessage && (
          <div className="relative h-[360px] w-full overflow-hidden rounded-[28px]">
            {/* Same meadow background as your own garden */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 400 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="skyFriend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8f8f1" />
                  <stop offset="55%" stopColor="#f0f4e4" />
                  <stop offset="100%" stopColor="#e5edd5" />
                </linearGradient>
                <linearGradient id="meadowFriend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6e3bf" />
                  <stop offset="100%" stopColor="#bad19e" />
                </linearGradient>
              </defs>
              <rect width="400" height="360" fill="url(#skyFriend)" />
              <path
                d="M0 212 C 55 198, 118 207, 176 199 C 235 191, 287 201, 336 195 C 362 192, 384 196, 400 193 L 400 360 L 0 360 Z"
                fill="#dfeaca"
                opacity="0.75"
              />
              <path
                d="M0 241 C 62 226, 121 237, 183 229 C 246 221, 300 233, 348 226 C 370 223, 388 228, 400 225 L 400 360 L 0 360 Z"
                fill="url(#meadowFriend)"
              />
              <g
                stroke="#9db884"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
                strokeWidth="1.8"
              >
                <path d="M26 338 C 23 325, 26 315, 31 307" />
                <path d="M96 346 C 98 333, 95 323, 90 316" />
                <path d="M167 337 C 164 327, 166 318, 171 310" />
                <path d="M247 344 C 249 331, 246 322, 241 314" />
                <path d="M318 340 C 320 329, 318 320, 313 312" />
                <path d="M373 345 C 371 333, 374 323, 379 314" />
              </g>
            </svg>

            {flowers.map((flower) => (
              <img
                key={flower.id}
                src={
                  flowerImageById[flower.flower_type] ??
                  "/images/flower-pressed-1.png"
                }
                alt={flowerTitleById[flower.flower_type] ?? flower.flower_type}
                className="absolute w-[58px] object-contain"
                style={{
                  left: `${flower.x * 100}%`,
                  top: `${flower.y * 100}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: flower.layer_order,
                }}
              />
            ))}

            {flowers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <p className="text-sm text-[#7d8a70]">
                  No flowers are growing here this month yet.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <img
            src="/images/flower-real-3.png"
            alt=""
            className="h-10 w-10 rounded-full bg-[#f3e9e4] object-contain p-1"
          />
          <button
            type="button"
            onClick={() => router.push("/blumengarten")}
            className="text-[14px] text-[#5e5357] underline underline-offset-2 transition hover:text-[#c08a95]"
          >
            go back to your flower meadow
          </button>
        </div>

        <div className="mt-6 text-center">
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
