"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { flowerImageById, flowerTitleById } from "./flowers";

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

// Blumen werden pro Monat gesammelt: Sichtbar sind nur Blumen, die nach dem
// Monatsanfang (bzw. nach einem manuellen Zurücksetzen) gepflanzt wurden.
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function BlumengartenPage() {
  const router = useRouter();
  const supabase = createClient();
  const gardenRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("freundin");
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
  const [confirmingReset, setConfirmingReset] = useState(false);

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
      setUserName((user.user_metadata.full_name || "freundin").toLowerCase());

      // Sichtbarkeitsgrenze: Monatsanfang oder letztes manuelles Zurücksetzen
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
          `Deine Blumenwiese konnte nicht geladen werden: ${error.message}`,
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
      setErrorMessage(
        `Die Blume konnte nicht gespeichert werden: ${error.message}`,
      );
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
        `Die Position konnte nicht gespeichert werden: ${error.message}`,
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

  async function handleConfirmReset() {
    if (!userId) return;

    setSaving(true);
    setErrorMessage(null);

    // Die Blumen bleiben als Archiv in der Datenbank erhalten und werden
    // nur ausgeblendet: Ab jetzt zählt last_reset_at als Sichtbarkeitsgrenze.
    const { error } = await supabase.from("garden_settings").upsert({
      user_id: userId,
      last_reset_at: new Date().toISOString(),
    });

    if (error) {
      setErrorMessage(
        "Zum Zurücksetzen muss zuerst die Datenbank-Migration ausgeführt werden (siehe blumengarten/freunde/supabase-migration.sql).",
      );
      setSaving(false);
      setConfirmingReset(false);
      return;
    }

    setFlowers([]);
    setConfirmingReset(false);
    setSaving(false);
  }

  function handleLeaveGarden() {
    router.push("/dashboard");
  }

  const infoText =
    mode === "place-new"
      ? pendingNewFlower
        ? "Fühlt sich dieser Platz richtig an für deine Blume?"
        : "Wähle einen Platz, an dem deine neue Blume wachsen kann."
      : mode === "edit-select"
        ? "Wähle eine Blume aus, die du verschieben möchtest."
        : mode === "edit-move"
          ? pendingEditPosition
            ? "Fühlt sich der neue Platz richtig an für deine Blume?"
            : "Wähle einen neuen Platz für deine Blume."
          : "Schön, dass du dranbleibst! Sieh zu, wie deine Blumenwiese & dein Geist langsam wachsen.";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3f1] flex items-center justify-center">
        <p className="text-[#7a6d71]">Deine Blumenwiese wird geladen...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f1] flex flex-col items-center px-6 py-6">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
              hallo {userName}
            </h2>
          </div>

          <div className="flex gap-2">
            {mode === "view" && (
              <button
                type="button"
                onClick={handleStartEditMode}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Bearbeiten
              </button>
            )}

            {(mode === "edit-select" || mode === "edit-move") && (
              <button
                type="button"
                onClick={handleCancelEditMode}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Abbrechen
              </button>
            )}

            {mode === "place-new" && (
              <button
                type="button"
                onClick={handleCancelPlaceNew}
                className="rounded-[18px] bg-[#efe8e3] px-4 py-2.5 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
              >
                Abbrechen
              </button>
            )}

            <button
              type="button"
              onClick={handleLeaveGarden}
              className="flex h-11 w-11 items-center justify-center rounded-2xl transition hover:bg-[#f3ece8]"
              aria-label="Blumenwiese verlassen"
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
          </div>
        </div>

        <p className="mb-8 px-4 text-center text-[14px] leading-6 text-[#5e5357]">
          {infoText}
        </p>

        <div
          ref={gardenRef}
          onClick={handleGardenClick}
          className="relative h-[360px] w-full overflow-hidden rounded-[28px]"
        >
          {/* Wiesen-Hintergrund: heller Himmel, sanfte Hügel, Grashalme */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 400 360"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7f8f0" />
                <stop offset="60%" stopColor="#eef3e2" />
                <stop offset="100%" stopColor="#e3ecd2" />
              </linearGradient>
              <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d3e2ba" />
                <stop offset="100%" stopColor="#b7cf9a" />
              </linearGradient>
            </defs>
            <rect width="400" height="360" fill="url(#sky)" />
            <path
              d="M0 205 C 90 185, 170 200, 260 192 C 320 187, 370 194, 400 190 L 400 360 L 0 360 Z"
              fill="#dde9c6"
              opacity="0.8"
            />
            <path
              d="M0 235 C 80 218, 180 232, 270 224 C 330 219, 375 228, 400 222 L 400 360 L 0 360 Z"
              fill="url(#meadow)"
            />
            <g stroke="#9db884" strokeWidth="2" strokeLinecap="round" opacity="0.55">
              <path d="M30 340 C 28 326, 30 316, 34 306" fill="none" />
              <path d="M70 344 C 72 330, 70 320, 66 312" fill="none" />
              <path d="M130 338 C 128 326, 131 316, 135 308" fill="none" />
              <path d="M205 344 C 207 330, 204 320, 200 312" fill="none" />
              <path d="M275 340 C 273 328, 276 318, 280 310" fill="none" />
              <path d="M345 344 C 347 330, 344 320, 340 310" fill="none" />
              <path d="M375 338 C 373 326, 376 318, 380 310" fill="none" />
            </g>
          </svg>

          {flowers.map((flower) => {
            const imageSrc =
              flowerImageById[flower.flower_type] ?? "/images/wildblume-1.svg";
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
                "/images/wildblume-1.svg"
              }
              alt="Vorschau der neuen Blume"
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
                Noch keine Blumen gepflanzt. Wähle zuerst ein Training aus und
                lass deine erste Blume wachsen.
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

        {mode === "place-new" && pendingNewFlower && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleConfirmNewFlower}
              disabled={saving}
              className="w-full rounded-[18px] bg-[#c08a95] px-4 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
            >
              {saving ? "Wird gespeichert..." : "Position bestätigen"}
            </button>
          </div>
        )}

        {mode === "edit-move" && editingFlowerId && pendingEditPosition && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleConfirmEdit}
              disabled={saving}
              className="w-full rounded-[18px] bg-[#c08a95] px-4 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
            >
              {saving ? "Wird gespeichert..." : "Neue Position bestätigen"}
            </button>
          </div>
        )}

        {mode === "view" && (
          <>
            <p className="mt-6 px-4 text-center text-[15px] leading-6 text-[#5e5357]">
              Mach einen Unterschied! Unterstütze die Artenvielfalt
              <br />
              mit einer Wildblumenwiesen-Patenschaft
              <br />
              für 2,99 €. Mehr Infos.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <img
                src="/images/wildblume-3.svg"
                alt=""
                className="h-10 w-10 rounded-full bg-[#f3e9e4] object-contain p-1"
              />
              <button
                type="button"
                onClick={() => router.push("/blumengarten/freunde")}
                className="text-[14px] text-[#5e5357] underline underline-offset-2 transition hover:text-[#c08a95]"
              >
                Entdecke die Blumenwiesen deiner Freunde
              </button>
            </div>

            <div className="mt-6 text-center">
              {confirmingReset ? (
                <div className="rounded-[22px] bg-[#efe8e3] px-5 py-4">
                  <p className="mb-3 text-[14px] leading-6 text-[#5e5357]">
                    Möchtest du deine Wiese wirklich zurücksetzen? Deine
                    bisherigen Blumen werden archiviert.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmReset}
                      disabled={saving}
                      className="rounded-full bg-[#c08a95] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#b67f8a] disabled:opacity-50"
                    >
                      Ja, zurücksetzen
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(false)}
                      className="rounded-full bg-white px-5 py-2 text-[14px] font-medium text-[#6b5c61] transition hover:bg-[#f3ece8]"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingReset(true)}
                  className="text-[12px] text-[#a29599] underline underline-offset-2 transition hover:text-[#c08a95]"
                >
                  Wiese zurücksetzen
                </button>
              )}
            </div>
          </>
        )}

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
