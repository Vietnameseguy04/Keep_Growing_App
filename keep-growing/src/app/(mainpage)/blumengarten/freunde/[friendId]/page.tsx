"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { flowerImageById, flowerTitleById } from "../../flowers";

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

export default function FreundesGartenPage() {
  const router = useRouter();
  const params = useParams<{ friendId: string }>();
  const supabase = createClient();

  const friendId = params.friendId;

  const [userId, setUserId] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("deine Freundin");
  const [flowers, setFlowers] = useState<SavedFlower[]>([]);
  const [liked, setLiked] = useState(false);
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

      // Nur Wiesen von Freunden sind sichtbar (durch die RLS-Policies
      // in supabase-migration.sql abgesichert).
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
          "Diese Blumenwiese kannst du nur besuchen, wenn ihr befreundet seid.",
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
          (profile.full_name?.trim() || profile.email || "deine Freundin")
            .toLowerCase()
            .split(" ")[0],
        );
      }

      // Auch beim Besuch gilt die Monatsregel der Besitzerin
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
          `Die Blumenwiese konnte nicht geladen werden: ${flowerError.message}`,
        );
      } else {
        setFlowers(flowerData ?? []);
      }

      const { data: existingLike } = await supabase
        .from("garden_likes")
        .select("id")
        .eq("garden_owner_id", friendId)
        .eq("liker_id", user.id)
        .maybeSingle();

      setLiked(Boolean(existingLike));
      setLoading(false);
    }

    if (friendId) {
      load();
    }
  }, [friendId, router, supabase]);

  async function handleToggleLike() {
    if (!userId || likeBusy) return;

    setLikeBusy(true);
    setErrorMessage(null);

    if (liked) {
      const { error } = await supabase
        .from("garden_likes")
        .delete()
        .eq("garden_owner_id", friendId)
        .eq("liker_id", userId);

      if (error) {
        setErrorMessage("Das Like konnte nicht entfernt werden.");
      } else {
        setLiked(false);
      }
    } else {
      const { error } = await supabase.from("garden_likes").insert({
        garden_owner_id: friendId,
        liker_id: userId,
      });

      if (error) {
        setErrorMessage("Das Like konnte nicht gespeichert werden.");
      } else {
        setLiked(true);
      }
    }

    setLikeBusy(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3f1] flex items-center justify-center">
        <p className="text-[#7a6d71]">Die Blumenwiese wird geladen...</p>
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
            aria-label="Zurück zur Freundesliste"
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
        </div>

        <h2 className="mb-4 font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
          {friendName}s garten
        </h2>

        {!errorMessage && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="rounded-[18px] bg-[#f1ece9] px-5 py-3 text-[15px] font-semibold text-[#5e5357]">
              wow, wie schön!
            </p>
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={likeBusy}
              aria-label={liked ? "Like entfernen" : "Blumenwiese liken"}
              aria-pressed={liked}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e7ea] transition hover:bg-[#f2dce1] disabled:opacity-50"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={liked ? "#c05a6e" : "none"}
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

        {errorMessage && (
          <div className="mb-5 rounded-[22px] bg-[#f8e8ea] px-5 py-4 text-center">
            <p className="text-[14px] leading-6 text-[#9b5d68]">
              {errorMessage}
            </p>
          </div>
        )}

        {!errorMessage && (
          <div className="relative h-[360px] w-full overflow-hidden rounded-[28px]">
            {/* Wiesen-Hintergrund wie im eigenen Garten */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 400 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="skyFriend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7f8f0" />
                  <stop offset="60%" stopColor="#eef3e2" />
                  <stop offset="100%" stopColor="#e3ecd2" />
                </linearGradient>
                <linearGradient id="meadowFriend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d3e2ba" />
                  <stop offset="100%" stopColor="#b7cf9a" />
                </linearGradient>
              </defs>
              <rect width="400" height="360" fill="url(#skyFriend)" />
              <path
                d="M0 205 C 90 185, 170 200, 260 192 C 320 187, 370 194, 400 190 L 400 360 L 0 360 Z"
                fill="#dde9c6"
                opacity="0.8"
              />
              <path
                d="M0 235 C 80 218, 180 232, 270 224 C 330 219, 375 228, 400 222 L 400 360 L 0 360 Z"
                fill="url(#meadowFriend)"
              />
              <g
                stroke="#9db884"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
              >
                <path d="M30 340 C 28 326, 30 316, 34 306" fill="none" />
                <path d="M70 344 C 72 330, 70 320, 66 312" fill="none" />
                <path d="M130 338 C 128 326, 131 316, 135 308" fill="none" />
                <path d="M205 344 C 207 330, 204 320, 200 312" fill="none" />
                <path d="M275 340 C 273 328, 276 318, 280 310" fill="none" />
                <path d="M345 344 C 347 330, 344 320, 340 310" fill="none" />
                <path d="M375 338 C 373 326, 376 318, 380 310" fill="none" />
              </g>
            </svg>

            {flowers.map((flower) => (
              <img
                key={flower.id}
                src={
                  flowerImageById[flower.flower_type] ??
                  "/images/wildblume-1.svg"
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
                  Hier wachsen diesen Monat noch keine Blumen.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <img
            src="/images/wildblume-3.svg"
            alt=""
            className="h-10 w-10 rounded-full bg-[#f3e9e4] object-contain p-1"
          />
          <button
            type="button"
            onClick={() => router.push("/blumengarten")}
            className="text-[14px] text-[#5e5357] underline underline-offset-2 transition hover:text-[#c08a95]"
          >
            Zurück zu deiner Blumenwiese
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/impressum")}
            className="text-[11px] text-[#4f6175] underline underline-offset-2"
          >
            Über uns
          </button>
        </div>
      </div>
    </main>
  );
}
