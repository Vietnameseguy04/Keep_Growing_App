"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
  created_at: string;
};

type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  read: boolean;
  created_at: string;
};

function displayName(profile: Profile | undefined): string {
  if (!profile) return "Unbekannt";
  return profile.full_name?.trim() || profile.email || "Unbekannt";
}

export default function FreundePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ("Notification" in window) {
        setNotifPermission(Notification.permission);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleEnableBrowserNotifications() {
    if (notifPermission !== "default") return;

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === "granted") {
      // Weckt den globalen Realtime-Listener (LikeBenachrichtigungen im
      // Root-Layout), ohne dass die Seite neu geladen werden muss.
      window.dispatchEvent(new Event("kg-benachrichtigungen-aktiviert"));
      new Notification("Keep Growing", {
        body: "Benachrichtigungen sind aktiviert – du erfährst es sofort, wenn jemandem deine Blumenwiese gefällt ♥",
        icon: "/images/wildblume-3.svg",
      });
    }
  }

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

      const { data: friendshipData, error: friendshipError } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (friendshipError) {
        setErrorMessage(
          "Das Freunde-System ist noch nicht eingerichtet. Bitte zuerst die Datenbank-Migration ausführen (blumengarten/freunde/supabase-migration.sql).",
        );
        setLoading(false);
        return;
      }

      const loadedFriendships = friendshipData ?? [];
      setFriendships(loadedFriendships);

      const { data: notificationData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const loadedNotifications = notificationData ?? [];
      setNotifications(loadedNotifications);

      // Profile aller beteiligten Personen in einem Rutsch nachladen
      const ids = new Set<string>();
      for (const friendship of loadedFriendships) {
        ids.add(friendship.requester_id);
        ids.add(friendship.addressee_id);
      }
      for (const notification of loadedNotifications) {
        if (notification.actor_id) ids.add(notification.actor_id);
      }
      ids.delete(user.id);

      if (ids.size > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", Array.from(ids));

        const map: Record<string, Profile> = {};
        for (const profile of profileData ?? []) {
          map[profile.id] = profile;
        }
        setProfiles(map);
      }

      setLoading(false);
    }

    load();
  }, [router, supabase]);

  async function handleSendRequest() {
    if (!userId) return;

    const email = searchEmail.trim().toLowerCase();
    if (!email) return;

    setBusy(true);
    setMessage(null);
    setErrorMessage(null);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      setErrorMessage(
        "Die Suche ist fehlgeschlagen. Wurde die Datenbank-Migration schon ausgeführt?",
      );
      setBusy(false);
      return;
    }

    if (!profile) {
      setErrorMessage("Es wurde kein Konto mit dieser E-Mail gefunden.");
      setBusy(false);
      return;
    }

    if (profile.id === userId) {
      setErrorMessage("Du kannst dir nicht selbst eine Anfrage schicken.");
      setBusy(false);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("friendships")
      .insert({
        requester_id: userId,
        addressee_id: profile.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      setErrorMessage(
        "Die Anfrage konnte nicht gesendet werden. Vielleicht seid ihr schon befreundet oder eine Anfrage läuft bereits.",
      );
      setBusy(false);
      return;
    }

    setFriendships((prev) => [created, ...prev]);
    setProfiles((prev) => ({ ...prev, [profile.id]: profile }));
    setSearchEmail("");
    setMessage(`Anfrage an ${displayName(profile)} wurde gesendet.`);
    setBusy(false);
  }

  async function handleAccept(friendship: Friendship) {
    setBusy(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendship.id);

    if (error) {
      setErrorMessage("Die Anfrage konnte nicht angenommen werden.");
      setBusy(false);
      return;
    }

    setFriendships((prev) =>
      prev.map((entry) =>
        entry.id === friendship.id
          ? { ...entry, status: "accepted" as const }
          : entry,
      ),
    );
    setBusy(false);
  }

  async function handleDecline(friendship: Friendship) {
    setBusy(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendship.id);

    if (error) {
      setErrorMessage("Die Anfrage konnte nicht entfernt werden.");
      setBusy(false);
      return;
    }

    setFriendships((prev) =>
      prev.filter((entry) => entry.id !== friendship.id),
    );
    setBusy(false);
  }

  async function handleMarkAllRead() {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (!error) {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
    }
  }

  const incomingRequests = friendships.filter(
    (entry) => entry.status === "pending" && entry.addressee_id === userId,
  );
  const outgoingRequests = friendships.filter(
    (entry) => entry.status === "pending" && entry.requester_id === userId,
  );
  const friends = friendships.filter((entry) => entry.status === "accepted");
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3f1] flex items-center justify-center">
        <p className="text-[#7a6d71]">Deine Freunde werden geladen...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f1] flex flex-col items-center px-6 py-6">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/blumengarten")}
            aria-label="Zurück zur Blumenwiese"
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

        <h2 className="mb-6 font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
          deine freunde
        </h2>

        {errorMessage && (
          <div className="mb-5 rounded-[22px] bg-[#f8e8ea] px-5 py-4 text-center">
            <p className="text-[14px] leading-6 text-[#9b5d68]">
              {errorMessage}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-[22px] bg-[#eaf1e2] px-5 py-4 text-center">
            <p className="text-[14px] leading-6 text-[#5e7050]">{message}</p>
          </div>
        )}

        {/* Browser-Benachrichtigungen aktivieren */}
        {notifPermission === "default" && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-[22px] bg-[#f6e7ea] px-5 py-4">
            <p className="text-[13px] leading-5 text-[#5e5357]">
              Erfahre sofort, wenn jemandem deine Blumenwiese gefällt.
            </p>
            <button
              type="button"
              onClick={handleEnableBrowserNotifications}
              className="shrink-0 rounded-full bg-[#c08a95] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#b67f8a]"
            >
              Aktivieren
            </button>
          </div>
        )}
        {notifPermission === "denied" && (
          <p className="mb-5 rounded-[22px] bg-[#f1ece9] px-5 py-3 text-[12px] leading-5 text-[#8a7d81]">
            Browser-Benachrichtigungen sind blockiert. Du kannst sie in den
            Website-Einstellungen deines Browsers wieder erlauben.
          </p>
        )}

        {/* Benachrichtigungen */}
        {notifications.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#5e5357]">
                Benachrichtigungen
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-[#c08a95] px-2 py-0.5 text-[11px] font-medium text-white">
                    {unreadCount} neu
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[12px] text-[#a29599] underline underline-offset-2 hover:text-[#c08a95]"
                >
                  Alle als gelesen markieren
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <li
                  key={notification.id}
                  className={`rounded-[18px] px-4 py-3 text-[14px] leading-6 ${
                    notification.read
                      ? "bg-[#f1ece9] text-[#8a7d81]"
                      : "bg-[#f6e7ea] text-[#5e5357]"
                  }`}
                >
                  {displayName(
                    notification.actor_id
                      ? profiles[notification.actor_id]
                      : undefined,
                  )}{" "}
                  gefällt deine Blumenwiese{" "}
                  <span aria-hidden="true" className="text-[#c08a95]">
                    ♥
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Freundin oder Freund hinzufügen */}
        <section className="mb-8">
          <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
            Freundin oder Freund hinzufügen
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="E-Mail-Adresse"
              className="flex-1 rounded-full border border-[#e5dbd5] bg-white px-5 py-3 text-[14px] text-[#5e5357] placeholder-[#b2a8ab] outline-none focus:border-[#c08a95]"
            />
            <button
              type="button"
              onClick={handleSendRequest}
              disabled={busy || !searchEmail.trim()}
              className="rounded-full bg-[#c08a95] px-5 py-3 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
            >
              Anfrage senden
            </button>
          </div>
        </section>

        {/* Eingegangene Anfragen */}
        {incomingRequests.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
              Anfragen an dich
            </h3>
            <ul className="space-y-2">
              {incomingRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3"
                >
                  <span className="text-[14px] text-[#5e5357]">
                    {displayName(profiles[request.requester_id])}
                  </span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(request)}
                      disabled={busy}
                      className="rounded-full bg-[#c08a95] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#b67f8a] disabled:opacity-50"
                    >
                      Annehmen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecline(request)}
                      disabled={busy}
                      className="rounded-full bg-[#efe8e3] px-4 py-1.5 text-[13px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9] disabled:opacity-50"
                    >
                      Ablehnen
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gesendete Anfragen */}
        {outgoingRequests.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
              Gesendete Anfragen
            </h3>
            <ul className="space-y-2">
              {outgoingRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3"
                >
                  <span className="text-[14px] text-[#5e5357]">
                    {displayName(profiles[request.addressee_id])}
                  </span>
                  <span className="text-[12px] text-[#a29599]">
                    Ausstehend
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Freundesliste */}
        <section className="mb-8">
          <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
            Deine Freunde
          </h3>
          {friends.length === 0 ? (
            <p className="rounded-[18px] bg-[#f1ece9] px-4 py-3 text-[14px] leading-6 text-[#8a7d81]">
              Noch keine Freunde. Sende eine Anfrage und besucht gegenseitig
              eure Blumenwiesen!
            </p>
          ) : (
            <ul className="space-y-2">
              {friends.map((friendship) => {
                const friendId =
                  friendship.requester_id === userId
                    ? friendship.addressee_id
                    : friendship.requester_id;
                return (
                  <li
                    key={friendship.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3"
                  >
                    <span className="text-[14px] text-[#5e5357]">
                      {displayName(profiles[friendId])}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/blumengarten/freunde/${friendId}`)
                      }
                      className="rounded-full bg-[#c08a95] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#b67f8a]"
                    >
                      Wiese besuchen
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
