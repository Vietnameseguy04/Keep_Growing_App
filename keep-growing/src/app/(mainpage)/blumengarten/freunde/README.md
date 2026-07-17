# Blumengarten v2 – Freunde, Monats-Reset & neues Wiesen-Design

Dokumentation der Änderungen rund um den Blumengarten (Stand: Juli 2026).

## Was ist neu?

### Im Blumengarten (`blumengarten/`)
- **Alle Texte auf Deutsch** (einheitliche Groß-/Kleinschreibung), inkl.
  deutscher Trainings-Titel in `flowers.ts` („Schwere & Wärme",
  „Fantasiereise", „Innere Ruhe", „Selbststärkung").
- **Kleinere Blumen** (58 px statt 84 px) für einen Wiesen-Look.
- **Grüner Wiesen-Hintergrund**: sanfter Verlauf mit Hügeln und Grashalmen
  als Inline-SVG, passend zur hellen Design-Vorlage.
- **Neue Aquarell-Blumen mit Stiel** (`public/images/wildblume-1.svg` bis
  `wildblume-4.svg`) – selbst erstellt, transparent, lizenzfrei.
- **Monatlicher Reset**: Es werden nur Blumen des aktuellen Monats angezeigt.
  Ältere Blumen bleiben als Archiv in der Datenbank erhalten.
- **Manueller Reset**: Link „Wiese zurücksetzen" unten im Garten
  (mit Bestätigungs-Dialog). Benötigt die Tabelle `garden_settings`
  aus der Migration.

### Neuer Ordner `blumengarten/freunde/`
- `page.tsx` – Freunde verwalten: per E-Mail suchen und Anfrage senden,
  eingegangene Anfragen annehmen/ablehnen, Freundesliste,
  Benachrichtigungen („X gefällt deine Blumenwiese ♥").
- `[friendId]/page.tsx` – Blumenwiese einer Freundin/eines Freundes
  besuchen (nur lesend) und mit dem Herz liken. Das Like erzeugt
  automatisch eine Benachrichtigung bei der Besitzerin.
- `supabase-migration.sql` – die komplette Datenbank-Migration (s.u.).

## ⚠️ Vor dem Testen: Datenbank-Migration ausführen

Das Freunde-System und der manuelle Reset brauchen neue Tabellen.

1. Supabase-Dashboard öffnen → **SQL Editor** → **New query**
2. Kompletten Inhalt von `supabase-migration.sql` einfügen → **Run**
3. Das Skript ist idempotent – mehrfaches Ausführen schadet nicht.

Die Migration legt an: `profiles`, `friendships`, `garden_settings`,
`garden_likes`, `notifications` – jeweils mit Row-Level-Security-Policies –
plus eine zusätzliche SELECT-Policy auf `flower_garden`, damit Freunde
gegenseitig ihre Wiesen **ansehen** (niemals verändern) können.

Ohne Migration funktioniert der restliche Blumengarten normal weiter;
Freunde-Seite und Reset zeigen dann einen freundlichen Hinweis.

## 📋 Änderungen außerhalb von `blumengarten/` (zur Absprache)

**Jede einzelne geänderte Codezeile ist in
[`AENDERUNGEN-AUSSERHALB.md`](./AENDERUNGEN-AUSSERHALB.md) dokumentiert.**
Zusammenfassung:

| Ort | Was | Warum |
| --- | --- | --- |
| `einstellungen/page.tsx` | Neue Sektion „Blumenwiese" mit „Wiese zurücksetzen" (Server Action + aufklappbarer Bestätigung); Funktionskopf liest jetzt `searchParams` für die Fehlermeldung | Manueller Reset auch aus den Einstellungen heraus |
| `src/app/layout.tsx` | 2 additive Zeilen: Import + `<LikeBenachrichtigungen />` | Browser-Benachrichtigungen bei neuen Likes auf jeder Seite (Logik liegt in `freunde/LikeBenachrichtigungen.tsx`) |
| `public/images/wildblume-1.svg` … `wildblume-4.svg` | 4 neue Bild-Dateien | Aquarell-Blumen für den Garten. Rein additiv, die alten `flower-*.png` bleiben unangetastet (falls andere Seiten sie nutzen). |
| Supabase (Datenbank) | Neue Tabellen + Policies + Realtime per `supabase-migration.sql` | Freunde-System, Likes, Benachrichtigungen, manueller Reset. **Bitte im Team absprechen, bevor das SQL auf der gemeinsamen Instanz läuft.** |

Browser-Benachrichtigungen werden über den Button „Aktivieren" auf der
Freunde-Seite eingeschaltet und kommen an, solange die App in einem Tab
geöffnet ist. Echte Push-Nachrichten bei geschlossenem Browser (wie im
Sperrbildschirm-Mockup) bräuchten zusätzlich Service Worker + VAPID +
Supabase Edge Function – möglicher nächster Ausbauschritt.

## Hinweis zum Datenschutz

Damit die Freundes-Suche funktioniert, sind `full_name` und `email` aller
Konten für **eingeloggte** Nutzerinnen über die Tabelle `profiles` lesbar.
Falls das zu offen ist, kann die Suche später auf eine
Datenbank-Funktion mit exakter E-Mail-Übereinstimmung umgestellt werden.
