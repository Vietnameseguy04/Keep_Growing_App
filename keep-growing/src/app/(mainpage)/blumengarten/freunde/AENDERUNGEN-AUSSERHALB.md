# Änderungen außerhalb von `blumengarten/` – genaue Zeilen-Dokumentation

Für die Team-Absprache: Diese Dateien außerhalb des Blumengarten-Ordners
wurden angepasst (drei bestehende Dateien plus eine neue,
`global-error.tsx`). Hier steht **jede geänderte Zeile** mit Begründung.
Alles andere (neue Seiten, Komponenten, SQL, Bilder) liegt als **neue
Datei** in `blumengarten/`, `blumengarten/freunde/` oder `public/images/`
und verändert keinen bestehenden Code.

---

## 1. `src/app/(mainpage)/dashboard/page.tsx` (Startseite)

**Zweck:** Freunde-Button (mit Benachrichtigungspunkt) in der Icon-Reihe,
ungelesene Benachrichtigungen auf der Startseite, und derselbe rote Punkt
jetzt auch am Garten-Icon, wenn eine trainierte Blume noch aufs
Einpflanzen wartet. Die gesamte Logik liegt in
`blumengarten/freunde/DashboardFriends.tsx` bzw.
`blumengarten/DashboardGardenButton.tsx` – das Dashboard bekommt nur
Import + Austausch der bestehenden Icon-Elemente.

### Änderung 1 – Imports (neue Zeilen 5–6, direkt nach dem `saveDailyEntry`-Import)

```tsx
import { FriendsButton, FriendsNotifications } from '../blumengarten/freunde/DashboardFriends';
import DashboardGardenButton from '../blumengarten/DashboardGardenButton';
```

### Änderung 2 – Garten-Icon ersetzt (bisheriges `<Link href="/blumengarten">`-Markup entfernt, durch eine Zeile ersetzt)

Vorher stand hier das komplette Garten-Icon-Markup direkt im Dashboard
(SVG, Link, Label). Es wurde 1:1 in `DashboardGardenButton.tsx`
übernommen und hier durch die Komponente ersetzt:

```tsx
          {/* Blumengarten-Icon (Logik liegt in blumengarten/DashboardGardenButton.tsx) */}
          <DashboardGardenButton />
```

`DashboardGardenButton` rendert exakt dasselbe Icon wie vorher (gleiches
SVG, gleicher Link, gleiches Label „Garten") und zeigt zusätzlich denselben
roten Punkt-Stil wie beim Freunde-Icon, sobald `localStorage` einen
gewählten, noch nicht gepflanzten Trainings-Blumentyp enthält.

### Änderung 3 – Freunde-Button (neue Zeilen, direkt nach dem schließenden `</Link>` bzw. jetzt `</DashboardGardenButton>`-Aufruf des Training-Icons, vor dem `</div>` der Icon-Reihe)

```tsx
          {/* Freunde-Icon (Logik liegt in blumengarten/freunde/DashboardFriends.tsx) */}
          <FriendsButton />
```

Der Button hat denselben Stil wie die Garten-/Training-Icons (12×12,
runde Ecken, Label in Großbuchstaben) und zeigt einen kleinen rosa Punkt,
wenn ungelesene Benachrichtigungen vorliegen.

### Änderung 4 – Benachrichtigungs-Banner (direkt nach dem schließenden `</div>` des Header-Bereichs, vor dem Mood-`<form>`)

```tsx
      {/* Ungelesene Freunde-Benachrichtigungen (blumengarten/freunde/DashboardFriends.tsx) */}
      <FriendsNotifications />
```

Zeigt bis zu 3 ungelesene Meldungen (Likes, Freundschaftsanfragen,
Annahmen) und verlinkt zur Freunde-Seite. Rendert `null`, wenn nichts
Ungelesenes da ist oder die Migration fehlt – die Startseite sieht dann
exakt aus wie vorher.

**Nicht verändert:** Begrüßung, Mood-Formular, Insights-Graph,
Einstellungs- und Training-Icon. Das Garten-Icon sieht optisch identisch
aus wie vorher (gleiches SVG, gleicher Link, gleiches Label), nur die
Implementierung wanderte in eine eigene Komponente. (Hinweis: Der
bestehende ESLint-`no-explicit-any`-Fehler in `getTrainingStats` war schon
vor unseren Änderungen da und stammt nicht von uns.)

---

## 2. `src/app/global-error.tsx` (neue Datei)

**Zweck:** Der `ChunkLoadError`, der immer wieder beim Öffnen/Aktualisieren
der Seite auftauchte – meist direkt nachdem im Hintergrund ein neuer
Deploy passiert ist und der Browser noch auf den alten Build zeigt.
Bisher landete man dabei auf einer roten Next.js-Fehlerseite.

Next.js bietet dafür extra `global-error.tsx`: die einzige Stelle, die
Fehler abfangen kann, die im Root-Layout selbst passieren (`layout.tsx`,
z.B. beim Rendern von `<LikeNotifications />`) – ein normales `error.tsx`
greift dort nicht. Die Datei erkennt speziell `ChunkLoadError` und lädt
die Seite dann automatisch einmal neu, statt die Fehlerseite zu zeigen.
Bei jedem anderen (echten) Fehler gibt es weiterhin einen Hinweis mit
„Erneut versuchen"-Button.

Komplett neue, eigenständige Datei – verändert keine bestehende Zeile in
`layout.tsx` oder sonst wo.

---

## 3. `src/app/(mainpage)/einstellungen/page.tsx`

**Zweck:** Manueller „Reset your meadow"-Button in den Einstellungen.
Der Reset-Link im Blumengarten selbst wurde entfernt – zurücksetzen geht
jetzt **nur** hier.

### Änderung 1 – Funktionskopf (vorher Zeile 5, jetzt Zeilen 5–11)

Vorher:

```tsx
export default async function EinstellungenPage() {
```

Nachher (liest den Fehler-Parameter `?reset=fehler` aus der URL):

```tsx
export default async function EinstellungenPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
```

### Änderung 2 – Neue Server Action (eingefügt nach dem Ende von `handleLogout`, jetzt Zeilen 29–54)

```tsx
  /**
   * Server Action: Blumenwiese zurücksetzen.
   * Die Blumen werden nicht gelöscht, sondern nur ausgeblendet – der
   * Blumengarten zeigt nur Blumen, die nach garden_settings.last_reset_at
   * gepflanzt wurden (Tabelle aus blumengarten/freunde/supabase-migration.sql).
   */
  async function handleGardenReset() {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }

    const { error } = await supabase.from('garden_settings').upsert({
      user_id: user.id,
      last_reset_at: new Date().toISOString(),
    });

    if (error) {
      redirect('/einstellungen?reset=fehler');
    }

    redirect('/blumengarten');
  }
```

### Änderung 3 – Neue UI-Sektion (eingefügt zwischen Account-Sektion und Logout-Button, jetzt Zeilen 80–107)

Neue Sektion „Flower meadow" im selben Stil wie die Account-Sektion
(`bg-[#f2f2eb] rounded-[25px]`), Texte auf Englisch. Der Reset ist hinter
einem `<details>`-Aufklapper versteckt, damit niemand versehentlich klickt:

```tsx
        {/* Flower meadow Sektion */}
        <section className="bg-[#f2f2eb] rounded-[25px] p-6 shadow-sm">
          <h2 className="text-gray-400 uppercase text-[10px] tracking-[0.2em] font-bold mb-4">Flower meadow</h2>
          {reset === 'fehler' && (
            <p className="mb-4 text-sm text-[#9b5d68]">
              The reset did not work. Has the database migration
              (blumengarten/freunde/supabase-migration.sql) been run yet?
            </p>
          )}
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-gray-800 font-medium">
              Reset your meadow
              <span className="text-gray-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <p className="mt-3 text-sm text-gray-400">
              Your current flowers will be archived and your meadow starts
              fresh. This also happens automatically at the start of each
              month.
            </p>
            <form action={handleGardenReset} className="mt-4">
              <button
                type="submit"
                className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all"
              >
                Yes, reset my meadow now
              </button>
            </form>
          </details>
        </section>
```

**Nicht verändert:** Auth-Check, `handleLogout`, Account-Sektion,
Logout-Button, Footer.

---

## 4. `src/app/layout.tsx` (Root-Layout)

**Zweck:** Browser-Benachrichtigungen („X loves your flower meadow ♥")
sollen auf **jeder** Seite ankommen. Die gesamte Logik liegt in
`blumengarten/freunde/LikeNotifications.tsx` – das Layout bekommt nur
zwei Zeilen.

### Änderung 1 – Import (neue Zeile 4, direkt nach `import "./globals.css";`)

```tsx
import LikeNotifications from "./(mainpage)/blumengarten/freunde/LikeNotifications";
```

### Änderung 2 – Einbindung (neue Zeile 46, direkt vor `{children}` im `<body>`)

```tsx
        <LikeNotifications />
```

**Nicht verändert:** Fonts, Metadata, `<html lang="de">`, className.
Die Komponente rendert `null` und hat keinen Einfluss auf Layout oder
Styling.

---

## 5. Verhalten & Grenzen der Benachrichtigungen

- Aktivierung über den Button „Enable" auf der Freunde-Seite
  (`/blumengarten/freunde`) – kein aufdringliches Popup beim Seitenaufruf.
- Technik: Supabase **Realtime** auf der Tabelle `notifications`
  (Freischaltung ist Teil von `supabase-migration.sql`) plus die
  **Notification API** des Browsers. Mitgeschickte Like-Nachrichten
  erscheinen im Benachrichtigungstext.
- Benachrichtigungen kommen an, solange die App in einem Tab geöffnet ist
  (auch Hintergrund-Tab / minimierter Browser am Desktop).
- **Echte** Push-Nachrichten bei komplett geschlossenem Browser (wie im
  Sperrbildschirm-Mockup) bräuchten zusätzlich Service Worker,
  VAPID-Schlüssel und eine Supabase Edge Function – nächster
  Ausbauschritt, braucht eigene Absprache.

---

## 6. Checkliste für die Absprache

| Datei | Art der Änderung | Risiko |
| --- | --- | --- |
| `dashboard/page.tsx` | 3 rein additive Einfügungen (Import, Button, Banner) | Sehr gering – rendert ohne Migration exakt wie vorher |
| `einstellungen/page.tsx` | 1 Zeile ersetzt (Funktionskopf), 2 Blöcke additiv | Gering – bestehende Logik unverändert |
| `app/layout.tsx` | 2 Zeilen additiv (Import + Komponente) | Sehr gering – Komponente rendert `null` |
| Supabase | `supabase-migration.sql` ausführen (Tabellen, Policies, Realtime; Upgrade-ALTERs für frühere Skript-Version enthalten) | Im Team absprechen |
