"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Listens via Supabase Realtime for new rows in "notifications" and shows
// a browser notification ("X loves your flower garden ♥").
//
// The component renders nothing and is mounted once in the root layout
// (src/app/layout.tsx) so notifications arrive on every page. It only
// becomes active once the user has granted the browser permission
// (via the "Enable" button on the friends page).
export default function LikeNotifications() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    async function subscribe() {
      if (!active || channel) return;
      if (Notification.permission !== "granted") return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !active) return;

      channel = supabase
        .channel("like-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const row = payload.new as {
              actor_id: string | null;
              message: string | null;
            };

            let actorName = "Someone";
            if (row.actor_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", row.actor_id)
                .maybeSingle();
              actorName =
                profile?.full_name?.trim() || profile?.email || "Someone";
            }

            const body = row.message
              ? `${actorName} loves your flower garden ♥ "${row.message}"`
              : `${actorName} loves your flower garden ♥`;

            new Notification("Keep Growing", {
              body,
              icon: "/images/flower-real-3.png",
            });
          },
        )
        .subscribe();
    }

    subscribe();

    // Fired by the friends page as soon as permission is granted – so no
    // page reload is needed.
    window.addEventListener("kg-notifications-enabled", subscribe);

    return () => {
      active = false;
      window.removeEventListener("kg-notifications-enabled", subscribe);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return null;
}
