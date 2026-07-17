# Änderungen außerhalb von `blumengarten/` – genaue Zeilen-Dokumentation

Für die Team-Absprache: Diese zwei bestehenden Dateien außerhalb des
Blumengarten-Ordners wurden angepasst. Hier steht **jede geänderte Zeile**
mit Begründung. Alles andere (neue Seiten, Komponenten, SQL) liegt als
**neue Datei** in `blumengarten/` bzw. `blumengarten/freunde/` und
verändert keinen bestehenden Code.

---

## 1. `src/app/(mainpage)/einstellungen/page.tsx`

**Zweck:** Manueller „Wiese zurücksetzen"-Button in den Einstellungen
(zusätzlich zum Link im Blumengarten selbst).

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

### Änderung 2 – Neue Server Action (eingefügt nach dem Ende von `handleLogout`, vorher Zeile 22, jetzt Zeilen 29–54)

Komplett neu eingefügt (verändert keine bestehende Zeile):

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

### Änderung 3 – Neue UI-Sektion (eingefügt zwischen der Account-Sektion und dem Logout-Button, vorher Zeile 48, jetzt Zeilen 80–107)

Komplett neu eingefügt, im selben Stil wie die Account-Sektion
(`bg-[#f2f2eb] rounded-[25px]`). Der Reset ist hinter einem
`<details>`-Aufklapper versteckt, damit niemand versehentlich klickt:

```tsx
        {/* Blumenwiese Sektion */}
        <section className="bg-[#f2f2eb] rounded-[25px] p-6 shadow-sm">
          <h2 className="text-gray-400 uppercase text-[10px] tracking-[0.2em] font-bold mb-4">Blumenwiese</h2>
          {reset === 'fehler' && (
            <p className="mb-4 text-sm text-[#9b5d68]">
              Das Zurücksetzen hat nicht geklappt. Wurde die Datenbank-Migration
              (blumengarten/freunde/supabase-migration.sql) schon ausgeführt?
            </p>
          )}
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-gray-800 font-medium">
              Wiese zurücksetzen
              <span className="text-gray-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <p className="mt-3 text-sm text-gray-400">
              Deine bisherigen Blumen werden archiviert und deine Wiese beginnt
              leer. Zum Monatsanfang passiert das automatisch.
            </p>
            <form action={handleGardenReset} className="mt-4">
              <button
                type="submit"
                className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all"
              >
                Ja, Wiese jetzt zurücksetzen
              </button>
            </form>
          </details>
        </section>
```

**Nicht verändert:** Auth-Check, `handleLogout`, Account-Sektion,
Logout-Button, Footer – alles unangetastet.

---

## 2. `src/app/layout.tsx` (Root-Layout)

**Zweck:** Browser-Benachrichtigungen („X gefällt deine Blumenwiese ♥")
sollen auf **jeder** Seite ankommen, nicht nur im Blumengarten. Dafür wird
eine unsichtbare Listener-Komponente einmalig im Layout eingebunden. Die
gesamte Logik liegt in `blumengarten/freunde/LikeBenachrichtigungen.tsx` –
das Layout bekommt nur zwei Zeilen.

### Änderung 1 – Import (neue Zeile 4, direkt nach `import "./globals.css";`)

```tsx
import LikeBenachrichtigungen from "./(mainpage)/blumengarten/freunde/LikeBenachrichtigungen";
```

### Änderung 2 – Einbindung (neue Zeile 46, direkt vor `{children}` im `<body>`)

Vorher (Zeilen 43–45):

```tsx
      >
        {children}
      </body>
```

Nachher:

```tsx
      >
        <LikeBenachrichtigungen />
        {children}
      </body>
```

**Nicht verändert:** Fonts, Metadata, `<html lang="de">`, className –
alles unangetastet. Die Komponente rendert `null` und hat keinerlei
Einfluss auf das Layout oder Styling.

---

## 3. Verhalten & Grenzen der Benachrichtigungen

- Aktiviert wird die Berechtigung über den Button „Aktivieren" auf der
  Freunde-Seite (`/blumengarten/freunde`) – es gibt kein aufdringliches
  Popup beim Seitenaufruf.
- Technik: Supabase **Realtime** auf der Tabelle `notifications`
  (Realtime-Freischaltung ist Teil von `supabase-migration.sql`) plus die
  **Notification API** des Browsers.
- Benachrichtigungen kommen an, solange die App in einem Tab geöffnet ist
  (auch im Hintergrund-Tab / minimiertem Browser am Desktop).
- **Echte** Push-Nachrichten bei komplett geschlossenem Browser (wie im
  Sperrbildschirm-Mockup) bräuchten zusätzlich einen Service Worker,
  VAPID-Schlüssel und eine Supabase Edge Function – das wäre der nächste
  Ausbauschritt und braucht eine eigene Absprache.

---

## 4. Checkliste für die Absprache

| Datei | Art der Änderung | Risiko |
| --- | --- | --- |
| `einstellungen/page.tsx` | 1 Zeile ersetzt (Funktionskopf), 2 Blöcke rein additiv eingefügt | Gering – bestehende Logik unverändert |
| `app/layout.tsx` | 2 Zeilen rein additiv eingefügt (Import + Komponente) | Sehr gering – Komponente rendert `null` |
| Supabase | `supabase-migration.sql` ausführen (Tabellen, Policies, Realtime) | Im Team absprechen |
