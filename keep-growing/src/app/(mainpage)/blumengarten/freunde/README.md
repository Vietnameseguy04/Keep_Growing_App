# Blumengarten v2 – Freunde, Monats-Reset & neues Wiesen-Design

Dokumentation der Änderungen rund um den Blumengarten (Stand: Juli 2026).

## Was ist neu?

### Im Blumengarten (`blumengarten/`)
- **Alle Texte auf Englisch** (einheitliche Schreibweise wie in der
  Design-Vorlage), inkl. der Trainings-Titel in `flowers.ts`
  („Gravity & warmth", „Imaginative training", „Inner peace",
  „Self-empowerment").
- **Kleinere Blumen** (58 px) für einen Wiesen-Look.
- **Drei umschaltbare Blumen-Stile** in `flowers.ts` (`FLOWER_STYLE`):
  - `"pressed"` (aktiv): echte Pressblumen **mit Stiel**, extrahiert aus
    den Garten-Mockups der Auftraggeber-PDF
    (`public/images/flower-pressed-1..4.png`: rosa Cosmee,
    Löwenmäulchen, Wachsblume, Kornblume)
  - `"blossom"`: die Aquarell-Blütenköpfe aus dem Auswahl-Mockup der PDF
    (`public/images/flower-real-1..4.png`)
  - `"watercolor"`: selbst gezeichnete SVG-Wildblumen mit Stiel
    (`public/images/wildblume-1..4.svg`)
  Pro Training gibt es eine eigene Blume. Zum Umschalten nur den Wert
  von `FLOWER_STYLE` ändern – alle Bild-Sets bleiben im images-Ordner.
- **Grüner Wiesen-Hintergrund**: weicher Verlauf mit organischen Hügeln,
  lockeren Grasbüscheln, dezenter Textur und kleinen Blüten-Tupfern.
- **Sanfte Übergänge**: Info-Text und Fußbereich haben feste Höhen und
  blenden per framer-motion über – kein Springen mehr beim Wechsel in den
  Bearbeiten-/Platzieren-Modus.
- **Einheitlicher Home-Button**: gemeinsame Komponente
  `blumengarten/HomeButton.tsx`, überall dasselbe Haus-Symbol.
- **Monatlicher Reset**: Sichtbar sind nur Blumen des aktuellen Monats,
  ältere bleiben als Archiv in der Datenbank. Manuell zurücksetzen geht
  **nur in den Einstellungen** (nicht mehr im Garten selbst).
- **Sponsoring-Link**: „More info." verlinkt auf die Blühpatenschaften
  des Netzwerks Blühende Landschaft (Mellifera e.V.):
  <https://bluehende-landschaft.de/bluehpatenschaften-mit-echter-wirkung/>

### Neuer Ordner `blumengarten/freunde/`
- `page.tsx` – Freunde verwalten: per E-Mail suchen und Anfrage senden,
  Anfragen annehmen/ablehnen, Freundesliste, Benachrichtigungen
  („X loves your flower meadow ♥" inkl. mitgeschickter Nachricht),
  Browser-Benachrichtigungen aktivieren.
- `[friendId]/page.tsx` – Blumenwiese einer Freundin/eines Freundes
  besuchen (nur lesend). **Like mit Nachricht:** Herz antippen → optional
  eine kurze Nachricht schreiben → absenden. Danach springt das Herz
  zurück, sodass später erneut geliked werden kann. Jedes Like erzeugt
  automatisch eine Benachrichtigung bei der Besitzerin.
- `DashboardFriends.tsx` – die zwei Widgets für die Startseite
  (Freunde-Button mit Punkt, Benachrichtigungs-Banner).
- `LikeNotifications.tsx` – globaler Realtime-Listener für
  Browser-Benachrichtigungen (im Root-Layout eingebunden).
- `supabase-migration.sql` – die komplette Datenbank-Migration (s.u.).

## ⚠️ Vor dem Testen: Datenbank-Migration ausführen

1. Supabase-Dashboard öffnen → **SQL Editor** → **New query**
2. Kompletten Inhalt von `supabase-migration.sql` einfügen → **Run**
3. Das Skript ist idempotent – mehrfaches Ausführen schadet nicht. Wer
   die frühere Version des Skripts schon ausgeführt hat, kann es einfach
   erneut laufen lassen (enthält die nötigen Upgrade-ALTERs für
   Like-Nachrichten und Mehrfach-Likes).

Die Migration legt an: `profiles`, `friendships`, `garden_settings`,
`garden_likes` (mit `message`, Mehrfach-Likes erlaubt), `notifications`
(mit `message`) – jeweils mit Row-Level-Security-Policies – plus eine
zusätzliche SELECT-Policy auf `flower_garden` (Freunde dürfen ansehen,
nie verändern) und die Realtime-Freischaltung für `notifications`.

Ohne Migration läuft der restliche Blumengarten normal weiter;
Freunde-Seiten, Dashboard-Widgets und Reset zeigen dann einen Hinweis
bzw. bleiben unsichtbar.

## 📋 Änderungen außerhalb von `blumengarten/` (zur Absprache)

**Jede einzelne geänderte Codezeile ist in
[`AENDERUNGEN-AUSSERHALB.md`](./AENDERUNGEN-AUSSERHALB.md) dokumentiert.**
Zusammenfassung:

| Ort | Was | Warum |
| --- | --- | --- |
| `dashboard/page.tsx` (Startseite) | 3 additive Einfügungen: Import, `<FriendsButton />`, `<FriendsNotifications />` | Freunde-Button mit Benachrichtigungspunkt + Benachrichtigungen auf der Startseite |
| `einstellungen/page.tsx` | Neue Sektion „Flower meadow" mit „Reset your meadow" (Server Action); Funktionskopf liest `searchParams` | Manueller Reset – jetzt ausschließlich hier |
| `src/app/layout.tsx` | 2 additive Zeilen: Import + `<LikeNotifications />` | Browser-Benachrichtigungen auf jeder Seite |
| `public/images/flower-real-1..4.png`, `wildblume-1..4.svg` | 8 neue Bild-Dateien | Zwei umschaltbare Blumen-Stile; alte `flower-*.png` bleiben unangetastet |
| Supabase (Datenbank) | `supabase-migration.sql` | Freunde-System, Likes mit Nachricht, Benachrichtigungen, Reset. **Vor dem Ausführen im Team absprechen.** |

## Hinweis zum Datenschutz

Damit die Freundes-Suche funktioniert, sind `full_name` und `email` aller
Konten für **eingeloggte** Nutzerinnen über die Tabelle `profiles` lesbar.
Falls das zu offen ist, kann die Suche später auf eine
Datenbank-Funktion mit exakter E-Mail-Übereinstimmung umgestellt werden.
