"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HomeButton from "../HomeButton";

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
  message: string | null;
  read: boolean;
  created_at: string;
};

function displayName(profile: Profile | undefined): string {
  if (!profile) return "Someone";
  return profile.full_name?.trim() || profile.email || "Someone";
}

// One place to turn a notification row into its display text, so the
// friends page and the dashboard banner (DashboardFriends.tsx) agree on
// wording for every notification type.
function notificationText(type: string, actorName: string): string {
  switch (type) {
    case "friend_request":
      return `${actorName} sent you a friend request`;
    case "friend_accepted":
      return `${actorName} accepted your friend request`;
    case "garden_like":
    default:
      return `${actorName} loves your flower garden`;
  }
}

export default function FriendsPage() {
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
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(
    null,
  );

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
      // Wakes the global realtime listener (LikeNotifications in the
      // root layout) without requiring a page reload.
      window.dispatchEvent(new Event("kg-notifications-enabled"));
      new Notification("Keep Growing", {
        body: "Notifications are on – you'll know right away when someone loves your flower garden ♥",
        icon: "/images/flower-real-3.png",
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
          "The friends feature is not set up yet. Please run the database migration first (blumengarten/freunde/supabase-migration.sql).",
        );
        setLoading(false);
        return;
      }

      const loadedFriendships = friendshipData ?? [];
      setFriendships(loadedFriendships);

      const { data: notificationData, error: notificationError } =
        await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

      if (notificationError) {
        // Don't block the whole page over this - friends/requests still
        // work - but log it so a migration/RLS problem doesn't fail silently.
        console.error("Could not load notifications:", notificationError);
      }

      const loadedNotifications = notificationData ?? [];
      setNotifications(loadedNotifications);

      // Load all involved profiles in one query
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
        "The search failed. Has the database migration been run yet?",
      );
      setBusy(false);
      return;
    }

    if (!profile) {
      setErrorMessage("No account was found with this email address.");
      setBusy(false);
      return;
    }

    if (profile.id === userId) {
      setErrorMessage("You cannot send a request to yourself.");
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
        "The request could not be sent. Maybe you are already friends or a request is pending.",
      );
      setBusy(false);
      return;
    }

    setFriendships((prev) => [created, ...prev]);
    setProfiles((prev) => ({ ...prev, [profile.id]: profile }));
    setSearchEmail("");
    setMessage(`Your request was sent to ${displayName(profile)}.`);
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
      setErrorMessage("The request could not be accepted.");
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
      setErrorMessage("The request could not be removed.");
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

  async function handleDeleteNotification(id: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    }
  }

  async function handleClearNotifications() {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (!error) {
      setNotifications([]);
    }
  }

  async function handleRemoveFriend(friendship: Friendship) {
    setBusy(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendship.id);

    if (error) {
      setErrorMessage("The friend could not be removed.");
      setBusy(false);
      return;
    }

    setFriendships((prev) =>
      prev.filter((entry) => entry.id !== friendship.id),
    );
    setRemovingFriendId(null);
    setBusy(false);
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
        <p className="text-[#7a6d71]">Loading your friends...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f1] flex flex-col items-center px-6 py-6">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
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

        <h2 className="mb-6 font-[family-name:var(--font-cursive)] text-[42px] leading-tight lowercase text-[#d1c7b0] opacity-90">
          your friends
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

        {/* Enable browser notifications */}
        {notifPermission === "default" && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-[22px] bg-[#f6e7ea] px-5 py-4">
            <p className="text-[13px] leading-5 text-[#5e5357]">
              Find out right away when someone loves your flower garden.
            </p>
            <button
              type="button"
              onClick={handleEnableBrowserNotifications}
              className="shrink-0 rounded-full bg-[#c08a95] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#b67f8a]"
            >
              Enable
            </button>
          </div>
        )}
        {notifPermission === "denied" && (
          <p className="mb-5 rounded-[22px] bg-[#f1ece9] px-5 py-3 text-[12px] leading-5 text-[#8a7d81]">
            Browser notifications are blocked. You can allow them again in
            your browser&apos;s site settings.
          </p>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#5e5357]">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-[#c08a95] px-2 py-0.5 text-[11px] font-medium text-white">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <span className="flex gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-[#a29599] underline underline-offset-2 hover:text-[#c08a95]"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearNotifications}
                  className="text-[12px] text-[#a29599] underline underline-offset-2 hover:text-[#c08a95]"
                >
                  Clear all
                </button>
              </span>
            </div>
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <li
                  key={notification.id}
                  className={`flex items-start justify-between gap-3 rounded-[18px] px-4 py-3 text-[14px] leading-6 ${
                    notification.read
                      ? "bg-[#f1ece9] text-[#8a7d81]"
                      : "bg-[#f6e7ea] text-[#5e5357]"
                  }`}
                >
                  <span>
                    {notificationText(
                      notification.type,
                      displayName(
                        notification.actor_id
                          ? profiles[notification.actor_id]
                          : undefined,
                      ),
                    )}
                    {notification.type === "garden_like" && (
                      <>
                        {" "}
                        <span aria-hidden="true" className="text-[#c08a95]">
                          ♥
                        </span>
                      </>
                    )}
                    {notification.message && (
                      <span className="mt-1 block text-[13px] italic text-[#8a7d81]">
                        &ldquo;{notification.message}&rdquo;
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notification.id)}
                    aria-label="Delete notification"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#a29599] transition hover:bg-white hover:text-[#c08a95]"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Add a friend */}
        <section className="mb-8">
          <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
            Add a friend
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Email address"
              className="w-full min-w-0 flex-1 rounded-full border border-[#e5dbd5] bg-white px-5 py-3 text-[14px] text-[#5e5357] placeholder-[#b2a8ab] outline-none focus:border-[#c08a95]"
            />
            <button
              type="button"
              onClick={handleSendRequest}
              disabled={busy || !searchEmail.trim()}
              className="shrink-0 rounded-full bg-[#c08a95] px-5 py-3 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#b67f8a] disabled:opacity-50"
            >
              Send request
            </button>
          </div>
        </section>

        {/* Incoming requests */}
        {incomingRequests.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
              Requests for you
            </h3>
            <ul className="space-y-2">
              {incomingRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3"
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
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecline(request)}
                      disabled={busy}
                      className="rounded-full bg-[#efe8e3] px-4 py-1.5 text-[13px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9] disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sent requests */}
        {outgoingRequests.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
              Sent requests
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
                  <span className="flex items-center gap-3">
                    <span className="text-[12px] text-[#a29599]">Pending</span>
                    <button
                      type="button"
                      onClick={() => handleDecline(request)}
                      disabled={busy}
                      className="text-[12px] text-[#a29599] underline underline-offset-2 transition hover:text-[#c08a95] disabled:opacity-50"
                    >
                      Cancel request
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Friends list */}
        <section className="mb-8">
          <h3 className="mb-3 text-[15px] font-semibold text-[#5e5357]">
            Your friends
          </h3>
          {friends.length === 0 ? (
            <p className="rounded-[18px] bg-[#f1ece9] px-4 py-3 text-[14px] leading-6 text-[#8a7d81]">
              No friends yet. Send a request and visit each other&apos;s
              flower gardens!
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
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3"
                  >
                    <span className="text-[14px] text-[#5e5357]">
                      {displayName(profiles[friendId])}
                    </span>
                    {removingFriendId === friendship.id ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] text-[#8a7d81]">
                          Remove this friend?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friendship)}
                          disabled={busy}
                          className="rounded-full bg-[#c08a95] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#b67f8a] disabled:opacity-50"
                        >
                          Yes, remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemovingFriendId(null)}
                          className="rounded-full bg-[#efe8e3] px-4 py-1.5 text-[13px] font-medium text-[#6b5c61] transition hover:bg-[#e8dfd9]"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/blumengarten/freunde/${friendId}`)
                          }
                          className="rounded-full bg-[#c08a95] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#b67f8a]"
                        >
                          Visit garden
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemovingFriendId(friendship.id)}
                          className="text-[12px] text-[#a29599] underline underline-offset-2 transition hover:text-[#c08a95]"
                        >
                          Remove
                        </button>
                      </span>
                    )}
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
            About us
          </button>
        </div>
      </div>
    </main>
  );
}
