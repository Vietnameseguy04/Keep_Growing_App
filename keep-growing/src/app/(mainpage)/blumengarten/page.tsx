"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { flowerImageById, flowerTitleById } from "./flowers";
import HomeButton from "./HomeButton";

type SavedFlower = {
  id: string;
  user_id: string;
  flower_type: string;
  x: number;
  y: number;
  layer_order: number;
  created_at: string;
};

type PendingFlower = {
  x: number;
  y: number;
  flower_type: string;
};

type GardenMode = "view" | "place-new" | "edit-select" | "edit-move";

// Flowers are collected per month: only flowers planted after the start
// of the current month (or after a manual reset in the settings) show up.
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Gentle watercolor-like meadow: soft sky, organic hills, loose grass
// tufts and a few distant blossoms so it doesn't look too uniform.
function MeadowBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 400 360"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="meadowSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f8f1" />
          <stop offset="55%" stopColor="#f0f4e4" />
          <stop offset="100%" stopColor="#e5edd5" />
        </linearGradient>
        <linearGradient id="meadowGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6e3bf" />
          <stop offset="100%" stopColor="#bad19e" />
        </linearGradient>
        <filter id="meadowTexture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.65  0 0 0 0 0.45  0 0 0 0.05 0"
          />
        </filter>
      </defs>
      <rect width="400" height="360" fill="url(#meadowSky)" />
      <path
        d="M0 212 C 55 198, 118 207, 176 199 C 235 191, 287 201, 336 195 C 362 192, 384 196, 400 193 L 400 360 L 0 360 Z"
        fill="#dfeaca"
        opacity="0.75"
      />
      <path
        d="M0 241 C 62 226, 121 237, 183 229 C 246 221, 300 233, 348 226 C 370 223, 388 228, 400 225 L 400 360 L 0 360 Z"
        fill="url(#meadowGrass)"
      />
      <rect width="400" height="360" filter="url(#meadowTexture)" opacity="0.6" />
      <g stroke="#9db884" strokeLinecap="round" fill="none">
        <g opacity="0.5" strokeWidth="1.8">
          <path d="M26 338 C 23 325, 26 315, 31 307" />
          <path d="M33 341 C 33 330, 36 322, 41 315" />
          <path d="M96 346 C 98 333, 95 323, 90 316" />
          <path d="M167 337 C 164 327, 166 318, 171 310" />
          <path d="M174 340 C 176 330, 174 320, 169 313" />
          <path d="M247 344 C 249 331, 246 322, 241 314" />
          <path d="M311 336 C 308 326, 310 317, 315 309" />
          <path d="M318 340 C 320 329, 318 320, 313 312" />
          <path d="M373 345 C 371 333, 374 323, 379 314" />
        </g>
        <g opacity="0.35" strokeWidth="1.4">
          <path d="M62 350 C 60 341, 62 334, 66 328" />
          <path d="M135 352 C 137 342, 135 335, 131 329" />
          <path d="M209 349 C 207 340, 209 333, 213 327" />
          <path d="M282 352 C 284 342, 282 335, 278 328" />
          <path d="M349 350 C 347 341, 349 334, 353 328" />
        </g>
      </g>
      <g opacity="0.45">
        <circle cx="58" cy="288" r="2.4" fill="#fdfaf2" />
        <circle cx="142" cy="304" r="2" fill="#f3e7b9" />
        <circle cx="228" cy="292" r="2.4" fill="#fdfaf2" />
        <circle cx="296" cy="309" r="1.8" fill="#eed7dd" />
        <circle cx="358" cy="296" r="2.2" fill="#fdfaf2" />
      </g>
    </svg>
  );
}

export default function BlumengartenPage() {
  const router = useRouter();
  const supabase = createClient();
  const gardenRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("friend");
  const [flowers, setFlowers] = useState<SavedFlower[]>([]);
  const [selectedFlowerType, setSelectedFlowerType] = useState<string | null>(
    null,
  );

  const [mode, setMode] = useState<GardenMode>("view");

  const [pendingNewFlower, setPendingNewFlower] =
    useState<PendingFlower | null>(null);

  const [editingFlowerId, setEditingFlowerId] = useState<string | null>(null);
  const [pendingEditPosition, setPendingEditPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadGarden() {
      setLoading(true);
      setErrorMessage(null);

      const selected = localStorage.getItem("selectedFlower");

      if (selected) {
        setSelectedFlowerType(selected);
        setMode("place-new");
      } else {
        setSelectedFlowerType(null);
        setMode("view");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserName((user.user_metadata.full_name || "friend").toLowerCase());

      // Visibility boundary: start of month or the last manual reset
      let visibleFrom = startOfCurrentMonth();

      const { data: settings } = await supabase
        .from("garden_settings")
        .select("last_reset_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settings?.last_reset_at) {
        const lastReset = new Date(settings.last_reset_at);
        if (lastReset > visibleFrom) {
          visibleFrom = lastReset;
        }
      }

      const { data, error } = await supabase
        .from("flower_garden")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", visibleFrom.toISOString())
        .order("layer_order", { ascending: true });

      if (error) {
        setErrorMessage(
          `Your flower meadow could not be loaded: ${error.message}`,
        );
      } else {
        setFlowers(data ?? []);
      }

      setLoading(false);
    }

    loadGarden();
  }, [router, supabase]);

  function getRelativePosition(e: React.MouseEvent<HTMLDivElement>) {
    if (!gardenRef.current) return null;

    const rect = gardenRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / rect.width;
    const rawY = (e.clientY - rect.top) / rect.height;

    return {
      x: Math.max(0.08, Math.min(0.92, rawX)),
      y: Math.max(0.45, Math.min(0.92, rawY)),
    };
  }

  function handleGardenClick(e: React.MouseEvent<HTMLDivElement>) {
    if (saving) return;

    const pos = getRelativePosition(e);
    if (!pos) return;

    if (mode === "place-new" && selectedFlowerType) {
      setPendingNewFlower({
        x: pos.x,
        y: pos.y,
        flower_type: selectedFlowerType,
      });
      return;
    }

    if (mode === "edit-move" && editingFlowerId) {
      setPendingEditPosition({
        x: pos.x,
        y: pos.y,
      });
    }
  }

  function handleFlowerClickForEdit(flowerId: string) {
    if (mode !== "edit-select") return;

    setEditingFlowerId(flowerId);
    setPendingEditPosition(null);
    setMode("edit-move");
  }

  async function handleConfirmNewFlower() {
    if (!pendingNewFlower || !userId) return;

    setSaving(true);
    setErrorMessage(null);

    const nextLayerOrder =
      flowers.length > 0
        ? Math.max(...flowers.map((flower) => flower.layer_order)) + 1
        : 1;

    const { data, error } = await supabase
      .from("flower_garden")
      .insert({
        user_id: userId,
        flower_type: pendingNewFlower.flower_type,
        x: pendingNewFlower.x,
        y: pendingNewFlower.y,
        layer_order: nextLayerOrder,
      })
      .select()
      .single();

    if (error) {
      setErrorMessage(`The flower could not be saved: ${error.message}`);
      setSaving(false);
      return;
    }

    setFlowers((prev) => [...prev, data]);
    setPendingNewFlower(null);
    setSelectedFlowerType(null);
    localStorage.removeItem("selectedFlower");
    setMode("view");
    setSaving(false);
  }

  async function handleConfirmEdit() {
    if (!editingFlowerId || !pendingEditPosition) return;

    setSaving(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("flower_garden")
      .update({
        x: pendingEditPosition.x,
        y: pendingEditPosition.y,
      })
      .eq("id", editingFlowerId);

    if (error) {
      setErrorMessage(
        `The flower position could not be updated: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setFlowers((prev) =>
      prev.map((flower) =>
        flower.id === editingFlowerId
          ? { ...flower, x: pendingEditPosition.x, y: pendingEditPosition.y }
          : flower,
      ),
    );

    setEditingFlowerId(null);
    setPendingEditPosition(null);
    setMode("view");
    setSaving(false);
  }

  function handleStartEditMode() {
    setEditingFlowerId(null);
    setPendingEditPosition(null);
    setPendingNewFlower(null);
    setMode("edit-select");
  }

  function handleCancelEditMode() {
    setEditingFlowerId(null);
    setPendingEditPosition(null);
    setMode("view");
  }

  function handleCancelPlaceNew() {
    setPendingNewFlower(null);
    setSelectedFlowerType(null);
    localStorage.removeItem("selectedFlower");
    setMode("view");
  }

  const infoText =
    mode === "place-new"
      ? pendingNewFlower
        ? "Does this place feel right for your flower?"
        : "Choose a place where your new flower can grow."
      : mode === "edit-select"
        ? "Select a flower you would like to move."
        : mode === "edit-move"
          ? pendingEditPosition
            ? "Does this new place feel right for your flower?"
            : "Choose a new place for your flower."
          : "Lovely to see you again! Watch your flower meadow & your mind slowly grow.";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3f1] flex items-center justify-center">
        <p className="text-[#7a6d71]">Loading your flower meadow...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f1] flex flex-col items-center px-6 py-6">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
              hello {userName}
            </h2>
          </div>

          <div className="flex gap-2">
            {mode === "view" && (
              <button
                type="button"
                onClick={handleStartEditMode}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Edit
              </button>
            )}

            {(mode === "edit-select" || mode === "edit-move") && (
              <button
                type="button"
                onClick={handleCancelEditMode}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Cancel
              </button>
            )}

            {mode === "place-new" && (
              <button
                type="button"
                onClick={handleCancelPlaceNew}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Cancel
              </button>
            )}

            <HomeButton />
          </div>
        </div>

        {/* Fixed height so the meadow below never jumps when the text changes */}
        <div className="mb-6 flex min-h-[56px] items-center justify-center px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={infoText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center text-[14px] leading-6 text-[#5e5357]"
            >
              {infoText}
            </motion.p>
          </AnimatePresence>
        </div>

        <div
          ref={gardenRef}
          onClick={handleGardenClick}
          className="relative h-[360px] w-full overflow-hidden rounded-[28px]"
        >
          <MeadowBackground />

          {flowers.map((flower) => {
            const imageSrc =
              flowerImageById[flower.flower_type] ??
              "/images/flower-pressed-1.png";
            const flowerTitle =
              flowerTitleById[flower.flower_type] ?? flower.flower_type;
            const isEditingSelected = editingFlowerId === flower.id;

            const previewX =
              isEditingSelected && pendingEditPosition
                ? pendingEditPosition.x
                : flower.x;
            const previewY =
              isEditingSelected && pendingEditPosition
                ? pendingEditPosition.y
                : flower.y;

            return (
              <button
                key={flower.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlowerClickForEdit(flower.id);
                }}
                className="absolute"
                style={{
                  left: `${previewX * 100}%`,
                  top: `${previewY * 100}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: flower.layer_order,
                }}
              >
                <img
                  src={imageSrc}
                  alt={flowerTitle}
                  className={`w-[58px] object-contain transition ${
                    isEditingSelected ? "scale-105 opacity-80" : ""
                  }`}
                />
              </button>
            );
          })}

          {pendingNewFlower && mode === "place-new" && (
            <img
              src={
                flowerImageById[pendingNewFlower.flower_type] ??
                "/images/flower-pressed-1.png"
              }
              alt="Preview of your new flower"
              className="pointer-events-none absolute w-[58px] object-contain opacity-80"
              style={{
                left: `${pendingNewFlower.x * 100}%`,
                top: `${pendingNewFlower.y * 100}%`,
                transform: "translate(-50%, -100%)",
                zIndex: 9999,
              }}
            />
          )}

          {flowers.length === 0 && mode === "view" && (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="text-sm text-[#7d8a70]">
                No flowers yet. Complete a training and let your first flower
                grow.
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-[22px] bg-[#f8e8ea] px-5 py-4 text-center">
            <p className="text-[14px] leading-6 text-[#9b5d68]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Fixed-height footer area: content cross-fades between modes so
            the layout stays calm instead of jumping. */}
        <div className="relative mt-5 min-h-[168px]">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "place-new" && pendingNewFlower && (
              <motion.div
                key="confirm-new"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={handleConfirmNewFlower}
                  disabled={saving}
                  className="w-full rounded-[18px] bg-[#c08a95] px-4 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Confirm position"}
                </button>
              </motion.div>
            )}

            {mode === "edit-move" && editingFlowerId && pendingEditPosition && (
              <motion.div
                key="confirm-edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={handleConfirmEdit}
                  disabled={saving}
                  className="w-full rounded-[18px] bg-[#c08a95] px-4 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Confirm new position"}
                </button>
              </motion.div>
            )}

            {mode === "view" && (
              <motion.div
                key="view-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="px-4 text-center text-[15px] leading-6 text-[#5e5357]">
                  Make a difference! Support biodiversity
                  <br />
                  with a wildflower meadow sponsorship
                  <br />
                  for 2,99 €.{" "}
                  <a
                    href="https://bluehende-landschaft.de/bluehpatenschaften-mit-echter-wirkung/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition hover:text-[#c08a95]"
                  >
                    More info.
                  </a>
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <img
                    src="/images/flower-real-3.png"
                    alt=""
                    className="h-10 w-10 rounded-full bg-[#f3e9e4] object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => router.push("/blumengarten/freunde")}
                    className="text-[14px] text-[#5e5357] underline underline-offset-2 transition hover:text-[#c08a95]"
                  >
                    discover your friends&apos; flower meadows
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 text-center">
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
