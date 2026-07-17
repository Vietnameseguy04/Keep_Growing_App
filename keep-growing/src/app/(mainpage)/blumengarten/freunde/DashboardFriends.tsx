"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Two small widgets for the dashboard (Startseite). All friends logic
// stays inside blumengarten/freunde – the dashboard only mounts these:
//
//   <FriendsButton />        icon button (with unread dot) in the header row
//   <FriendsNotifications /> compact banner listing unread notifications
//
// Both fail silently when the database migration has not been run yet.

type NotificationRow = {
  id: string;
  actor_id: string | null;
  message: string | null;
  read: boolean;
};

function useUnreadNotifications() {
  const [unread, setUnread] = useState<NotificationRow[]>([]);
  const [actorNames, setActorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("id, actor_id, message, read")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data || !active) return;
      setUnread(data);

      const actorIds = Array.from(
        new Set(data.map((row) => row.actor_id).filter(Boolean)),
      ) as string[];

      if (actorIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", actorIds);

        if (!active) return;
        const names: Record<string, string> = {};
        for (const profile of profileData ?? []) {
          names[profile.id] =
            profile.full_name?.trim() || profile.email || "Someone";
        }
        setActorNames(names);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { unread, actorNames };
}

export function FriendsButton() {
  const { unread } = useUnreadNotifications();

  return (
    <Link href="/blumengarten/freunde" className="flex flex-col items-center group">
      <div className="relative w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-50 transition-colors shadow-sm">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b57a84"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M15.5 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {unread.length > 0 && (
          <span
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#c05a6e] ring-2 ring-white"
            aria-label={`${unread.length} unread notifications`}
          />
        )}
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] mt-2 text-gray-400 font-bold">
        Friends
      </span>
    </Link>
  );
}

export function FriendsNotifications() {
  const { unread, actorNames } = useUnreadNotifications();

  if (unread.length === 0) return null;

  return (
    <Link
      href="/blumengarten/freunde"
      className="block w-full max-w-md mb-8 rounded-[25px] bg-[#f6e7ea] px-5 py-4 transition hover:bg-[#f2dce1]"
    >
      {unread.slice(0, 3).map((notification) => (
        <p
          key={notification.id}
          className="text-[14px] leading-6 text-[#5e5357]"
        >
          {(notification.actor_id && actorNames[notification.actor_id]) ||
            "Someone"}{" "}
          loves your flower meadow{" "}
          <span aria-hidden="true" className="text-[#c08a95]">
            ♥
          </span>
          {notification.message && (
            <span className="italic text-[#8a7d81]">
              {" "}
              &ldquo;{notification.message}&rdquo;
            </span>
          )}
        </p>
      ))}
      {unread.length > 3 && (
        <p className="mt-1 text-[12px] text-[#a29599]">
          and {unread.length - 3} more...
        </p>
      )}
    </Link>
  );
}
