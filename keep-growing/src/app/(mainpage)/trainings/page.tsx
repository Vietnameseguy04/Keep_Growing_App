"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

// Partikel-Setup für die zufällige Sternen-Aura
const auraParticles = Array.from({ length: 24 }).map((_, i) => {
  const angle = Math.random() * 2 * Math.PI;
  const maxRadiusX = 280;
  const maxRadiusY = 220;

  const randomRadiusX = Math.random() * maxRadiusX;
  const randomRadiusY = Math.random() * maxRadiusY;

  return {
    id: i,
    x: Math.cos(angle) * randomRadiusX,
    y: Math.sin(angle) * randomRadiusY,
    size: Math.random() * 1.0 + 0.5,
    delay: Math.random() * 3,
  };
});

// Mapping der Trainings-Kategorien auf die neuen Flower-Types
const FLOWER_MAPPING: Record<string, string> = {
  "creativity & warmth": "creativityWarmth",
  "imaginative training": "imaginativeTraining",
  "inner peace": "innerPeace",
  "self-empowerment": "selfEmpowerment",
  meditation: "creativityWarmth",
  atemübung: "imaginativeTraining",
  selbstliebe: "innerPeace",
  entspannung: "selfEmpowerment",
  energie: "creativityWarmth",
};

// Übersetzung der Supabase-Kategorien in englische Labels fürs Mockup-Design
const CATEGORY_LABELS: Record<string, string> = {
  "creativity & warmth": "Creativity & warmth",
  "imaginative training": "Imaginative training",
  "inner peace": "Inner peace",
  "self-empowerment": "Self-empowerment",
  meditation: "Creativity & warmth",
  atemübung: "Imaginative training",
  selbstliebe: "Inner peace",
  entspannung: "Self-empowerment",
  energie: "Creativity & warmth",
};

// Zuweisung der Blumen-Bilder aus dem Mockup passend zur Kategorie (aktualisiert auf flower-real)
const CATEGORY_FLOWERS: Record<string, string> = {
  "creativity & warmth": "/images/flower-real-1.png",
  "imaginative training": "/images/flower-real-2.png",
  "inner peace": "/images/flower-real-3.png",
  "self-empowerment": "/images/flower-real-4.png",
  meditation: "/images/flower-real-1.png",
  atemübung: "/images/flower-real-2.png",
  selbstliebe: "/images/flower-real-3.png",
  entspannung: "/images/flower-real-4.png",
  energie: "/images/flower-real-1.png",
};

// Zuordnung der Blumen-Bilder für den Reward-Screen (aktualisiert auf flower-pressed)
const FLOWER_EMOJIS: Record<string, string> = {
  creativityWarmth: "/images/flower-pressed-1.png",
  imaginativeTraining: "/images/flower-pressed-2.png",
  innerPeace: "/images/flower-pressed-3.png",
  selfEmpowerment: "/images/flower-pressed-4.png",
};

// Definition der 4 Hauptkategorien für die Menüansicht
const DISPLAY_CATEGORIES = [
  {
    key: "creativityWarmth",
    label: "Creativity & warmth",
    types: ["creativity & warmth", "meditation", "energie"],
    flowerImg: "/images/flower-real-1.png",
  },
  {
    key: "imaginativeTraining",
    label: "Imaginative training",
    types: ["imaginative training", "atemübung"],
    flowerImg: "/images/flower-real-2.png",
  },
  {
    key: "innerPeace",
    label: "Inner peace",
    types: ["inner peace", "selbstliebe"],
    flowerImg: "/images/flower-real-3.png",
  },
  {
    key: "selfEmpowerment",
    label: "Self-empowerment",
    types: ["self-empowerment", "entspannung"],
    flowerImg: "/images/flower-real-4.png",
  },
];

export default function TrainingsPage() {
  const [view, setView] = useState<"menu" | "growth" | "player" | "reward">(
    "menu"
  );
  const [trainings, setTrainings] = useState<any[]>([]);
  const [activeTraining, setActiveTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [rewardFlower, setRewardFlower] = useState("/images/flower-pressed-1.png");

  const supabase = createClient();

  useEffect(() => {
    async function loadInitialData() {
      const { data } = await supabase
        .from("audio_trainings")
        .select("*")
        .order("id", { ascending: true });
      if (data) setTrainings(data);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  // Funktion zur Auswahl des nächsten Audios innerhalb einer Kategorie im Wechsel-Prinzip (1, 2, 3, 4...)
  const selectNextTrainingFromCategory = (catKey: string, types: string[]) => {
    const matchingTrainings = trainings.filter((t) =>
      types.includes(t.training_type?.toLowerCase())
    );

    if (matchingTrainings.length === 0) return;

    const storageKey = `last_training_index_${catKey}`;
    const lastIndexStr = localStorage.getItem(storageKey);
    let nextIndex = 0;

    if (lastIndexStr !== null) {
      const lastIndex = parseInt(lastIndexStr, 10);
      nextIndex = (lastIndex + 1) % matchingTrainings.length;
    }

    localStorage.setItem(storageKey, nextIndex.toString());
    setActiveTraining(matchingTrainings[nextIndex]);
    setView("growth");
  };

  const handleCompletion = async () => {
    const typeKey =
      activeTraining?.training_type?.toLowerCase() || "meditation";
    const assignedFlowerType = FLOWER_MAPPING[typeKey] || "innerPeace";

    setRewardFlower(FLOWER_EMOJIS[assignedFlowerType] || "/images/flower-pressed-1.png");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && activeTraining) {
      await supabase.from("trainings_log").insert({
        user_id: user.id,
        training_type: activeTraining.training_type,
        completed_at: new Date().toISOString(),
      });

      localStorage.setItem("selectedFlower", assignedFlowerType);
    }

    setView("reward");
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#b57a84] font-bold tracking-widest uppercase text-xs">
        Loading garden...
      </div>
    );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#fdfaf5]">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: "url('/beach-background.jpg')",
          opacity: view === "menu" ? 0.8 : 0.2,
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-[50px] p-8 sm:p-10 shadow-2xl w-full max-w-md border border-white/40 flex flex-col items-center"
            >
              {/* Zurück-Pfeil (wie im Mockup) */}
              <Link
                href="/"
                className="absolute top-8 left-8 text-[#c17a85] text-2xl font-bold hover:scale-110 active:scale-95 transition-transform"
              >
                ←
              </Link>

              {/* Titel-Box (wie im Mockup) */}
              <div className="w-full bg-[#f2efe9] rounded-2xl p-4 text-center text-[#5a544f] font-medium text-sm leading-snug mt-10 mb-8 shadow-inner">
                Choose your autogenic training for today <br /> and let your mind grow
              </div>

              {/* Trainings-Liste: 4 exakte Kategorien mit wechselndem Audio-Abspielprinzip */}
              <div className="w-full space-y-6 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar text-left">
                {DISPLAY_CATEGORIES.map((cat) => {
                  return (
                    <div key={cat.key} className="flex items-center gap-4 w-full">
                      {/* Blumen-Bild */}
                      <div className="w-14 h-14 relative flex-shrink-0">
                        <Image
                          src={cat.flowerImg}
                          alt={cat.label}
                          fill
                          className="object-contain"
                        />
                      </div>

                      {/* Altrosa-Button */}
                      <button
                        onClick={() => selectNextTrainingFromCategory(cat.key, cat.types)}
                        className="flex-grow bg-[#c17a85] hover:bg-[#b06a75] active:scale-98 text-white font-medium py-2.5 px-4 rounded-full text-center text-sm transition-all shadow-sm underline decoration-white/60 underline-offset-2"
                      >
                        {cat.label}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer Link zum Blumengarten (wie im Mockup) */}
              <div className="mt-8 pt-2 border-t border-gray-100 w-full flex justify-center">
                <Link
                  href="/blumengarten"
                  className="flex items-center gap-2 text-[#5a544f] text-xs underline font-medium hover:text-black transition-colors"
                >
                  <span className="w-4 h-4 relative inline-block">
                    <Image
                      src="/images/flower-real-1.png"
                      alt="Flower Icon"
                      fill
                      className="object-contain"
                    />
                  </span>
                  go directly to your flower meadow
                </Link>
              </div>
            </motion.div>
          )}

          {view === "growth" && activeTraining && (
            <motion.div
              key="growth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                className="relative z-20 flex items-center justify-center outline-none"
                whileTap="growing"
                onAnimationComplete={(def) =>
                  def === "growing" && setView("player")
                }
              >
                <motion.div
                  variants={{ growing: { scale: 60 } }}
                  transition={{ duration: 3, ease: "easeIn" }}
                  className="absolute z-0 w-10 h-10 rounded-full bg-[#b57a84]"
                />
                <motion.div
                  variants={{ growing: { scale: 2.5, rotate: 15 } }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="relative z-10 w-36 h-36 select-none flex items-center justify-center"
                >
                  <Image
                    src={CATEGORY_FLOWERS[activeTraining.training_type?.toLowerCase()] || "/images/flower-real-1.png"}
                    alt="Flower"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-widest leading-tight">
                      Hold to
                      <br />
                      start
                    </span>
                  </div>
                </motion.div>
              </motion.button>
              <motion.p
                className="absolute top-40 w-full left-0 text-white text-[10px] font-bold uppercase tracking-[0.4em] drop-shadow-md opacity-70"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Press and hold for: {activeTraining.title}
              </motion.p>
            </motion.div>
          )}

          {view === "player" && activeTraining && (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center w-full max-w-md px-4"
            >
              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setView("menu");
                }}
                className="absolute top-10 right-10 text-gray-800/50 hover:text-gray-800 text-3xl transition-colors"
              >
                ✕
              </button>

              <motion.div
                animate={
                  isPlaying ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-44 h-44 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/30 shadow-xl relative p-4"
              >
                <div className="w-full h-full relative select-none">
                  <Image
                    src={CATEGORY_FLOWERS[activeTraining.training_type?.toLowerCase()] || "/images/flower-real-1.png"}
                    alt="Active Flower"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>

              <h4 className="text-[#b57a84] text-[10px] font-bold uppercase tracking-[0.5em] mb-2 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                {CATEGORY_LABELS[activeTraining.training_type?.toLowerCase()] || activeTraining.training_type}
              </h4>

              <h3 className="text-2xl font-light text-[#4a4a4a] italic mb-6 leading-relaxed px-4">
                "{activeTraining.title}"
              </h3>

              <div className="w-full mb-8 px-4 max-h-[120px] overflow-y-auto custom-scrollbar">
                <p className="text-[#4a4a4a]/70 text-sm leading-relaxed font-medium italic">
                  {activeTraining.description ||
                    "Breathe in and out deeply... Release all tension and focus entirely on the present moment."}
                </p>
              </div>

              <div className="w-full bg-white/90 backdrop-blur-md rounded-[30px] p-6 shadow-xl border border-white/50">
                <div className="flex items-center gap-5">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 flex items-center justify-center bg-[#b57a84] text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    {isPlaying ? (
                      <span className="text-xl">❚❚</span>
                    ) : (
                      <span className="text-2xl ml-1">▶</span>
                    )}
                  </button>

                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#b57a84] hover:h-3 transition-all"
                      style={{
                        backgroundImage: `linear-gradient(to right, #b57a84 ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 0%)`,
                      }}
                    />
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={activeTraining.audio_url}
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleCompletion}
              />
            </motion.div>
          )}

          {view === "reward" && (
            <motion.div
              key="reward"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-[50px] p-8 sm:p-12 shadow-2xl w-full max-w-md border border-white/40 flex flex-col items-center text-center my-auto"
            >
              {/* Home-Button oben rechts (wie im Mockup) */}
              <Link
                href="/"
                className="absolute top-8 right-8 text-[#c17a85] hover:scale-110 active:scale-95 transition-transform"
                title="Home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h5.25v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h5.25c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </Link>

              {/* Titel: "Congratulations!" */}
              <h2 className="text-[#a8747c] font-normal text-2xl sm:text-3xl mt-6 mb-8 tracking-wide">
                Congratulations!
              </h2>

              {/* Blumen-Anzeige mit sanfter Aquarell-Aura */}
              <div className="relative w-56 h-56 my-2 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#fbf2f2] rounded-full filter blur-2xl opacity-80" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-44 h-44 z-10"
                >
                  <Image
                    src={rewardFlower}
                    alt="Reward Flower"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </div>

              {/* Textlink zur Blumenwiese */}
              <div className="mt-8 mb-4">
                <Link
                  href="/blumengarten"
                  className="text-[#a8747c] text-sm font-medium underline decoration-[#a8747c]/50 underline-offset-4 hover:opacity-80 transition-opacity leading-relaxed inline-block max-w-[280px]"
                >
                  you’ve collected a new flower for your beautiful flower meadow
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-10 left-0 w-full z-50 flex justify-center pointer-events-none">
        <Link
          href="/impressum"
          className="text-[#6b6b6b] text-sm font-medium tracking-widest underline decoration-1 underline-offset-4 hover:text-[#2a2a2a] hover:decoration-2 hover:scale-105 transition-all duration-300 pointer-events-auto"
        >
          About us
        </Link>
      </div>
    </main>
  );
}