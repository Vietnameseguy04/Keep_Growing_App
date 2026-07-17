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

Wir haben **keine bestehenden Dateien außerhalb von `blumengarten/`
verändert**. Es kamen nur neue Dateien hinzu:

| Ort | Was | Warum |
| --- | --- | --- |
| `public/images/wildblume-1.svg` … `wildblume-4.svg` | 4 neue Bild-Dateien | Aquarell-Blumen für den Garten. Rein additiv, die alten `flower-*.png` bleiben unangetastet (falls andere Seiten sie nutzen). |
| Supabase (Datenbank) | Neue Tabellen + Policies per `supabase-migration.sql` | Freunde-System, Likes, Benachrichtigungen, manueller Reset. **Bitte im Team absprechen, bevor das SQL auf der gemeinsamen Instanz läuft.** |

Ideen aus der Vorlage, die bewusst NICHT umgesetzt wurden (weil sie
Änderungen außerhalb von `blumengarten` bräuchten – bei Bedarf absprechen):
- Reset-Knopf zusätzlich in `einstellungen/page.tsx`
- Push-Benachrichtigungen auf den Sperrbildschirm (bräuchte Service Worker
  und Änderungen am App-Layout); aktuell gibt es In-App-Benachrichtigungen
  auf der Freunde-Seite.

## Hinweis zum Datenschutz

Damit die Freundes-Suche funktioniert, sind `full_name` und `email` aller
Konten für **eingeloggte** Nutzerinnen über die Tabelle `profiles` lesbar.
Falls das zu offen ist, kann die Suche später auf eine
Datenbank-Funktion mit exakter E-Mail-Übereinstimmung umgestellt werden.
