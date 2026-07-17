"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Lauscht per Supabase Realtime auf neue Einträge in "notifications" und
// zeigt eine Browser-Benachrichtigung ("X gefällt deine Blumenwiese ♥").
//
// Die Komponente rendert nichts und wird einmalig im Root-Layout
// (src/app/layout.tsx) eingebunden, damit Benachrichtigungen auf jeder
// Seite ankommen. Aktiv wird sie nur, wenn die Nutzerin die
// Browser-Berechtigung erteilt hat (Button auf der Freunde-Seite).
export default function LikeBenachrichtigungen() {
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
        .channel("like-benachrichtigungen")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const actorId = (payload.new as { actor_id: string | null })
              .actor_id;

            let actorName = "Jemand";
            if (actorId) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", actorId)
                .maybeSingle();
              actorName =
                profile?.full_name?.trim() || profile?.email || "Jemand";
            }

            new Notification("Keep Growing", {
              body: `${actorName} gefällt deine Blumenwiese ♥`,
              icon: "/images/wildblume-3.svg",
            });
          },
        )
        .subscribe();
    }

    subscribe();

    // Wird von der Freunde-Seite ausgelöst, sobald die Berechtigung
    // erteilt wurde – so muss die Seite nicht neu geladen werden.
    window.addEventListener("kg-benachrichtigungen-aktiviert", subscribe);

    return () => {
      active = false;
      window.removeEventListener("kg-benachrichtigungen-aktiviert", subscribe);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return null;
}
