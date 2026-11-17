// ============================================================
// KEEP GROWING – Gesamtdokumentation V2.0
// Anton Nguyen, Johannes Appel, Nicolas Biercher
// DHBW Ravensburg | WIBE24 | Wintersemester 2026/27
// ============================================================

#set document(
  title: "Keep Growing – Gesamtdokumentation V2.0",
  author: "Anton Nguyen, Johannes Appel, Nicolas Biercher",
)

#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 2.5cm),
  numbering: "1",
  number-align: center,
  header: context {
    if counter(page).get().first() > 2 {
      grid(
        columns: (1fr, auto),
        align(left, text(size: 8pt, fill: rgb("#aaaaaa"))[Keep Growing – Gesamtdokumentation V2.0]),
        align(right, text(size: 8pt, fill: rgb("#aaaaaa"))[WIBE24 | DHBW Ravensburg])
      )
      v(-0.3em)
      line(length: 100%, stroke: 0.3pt + rgb("#dddddd"))
    }
  }
)

#set text(font: "New Computer Modern", size: 11pt, lang: "de")
#set par(justify: true, leading: 0.7em, spacing: 1.2em)
#set heading(numbering: "1.1.")

#show heading.where(level: 1): h => {
  pagebreak(weak: true)
  v(0.8cm)
  block[
    #text(size: 16pt, fill: rgb("#b57a84"), weight: "bold", h)
    #v(-0.3em)
    #line(length: 100%, stroke: 1.5pt + rgb("#b57a84"))
  ]
  v(0.4cm)
}
#show heading.where(level: 2): h => {
  v(0.5cm)
  text(size: 13pt, fill: rgb("#3a3a3a"), weight: "bold", h)
  v(0.2cm)
}
#show heading.where(level: 3): h => {
  v(0.3cm)
  text(size: 11pt, fill: rgb("#555555"), weight: "bold", style: "italic", h)
  v(0.1cm)
}

// ── Design-Tokens ────────────────────────────────────────────
#let primary  = rgb("#b57a84")
#let light-bg = rgb("#f2f2eb")
#let white    = rgb("#ffffff")
#let dark     = rgb("#3a3a3a")
#let muted    = rgb("#777777")

// ── Makros ───────────────────────────────────────────────────
#let infobox(title: "", body) = block(
  fill: light-bg, inset: (x: 1em, y: 0.85em),
  radius: 6pt, width: 100%,
  below: 1em,
)[
  #if title != "" { text(weight: "bold", fill: primary)[#title \ ] }
  #body
]

#let htable(..args) = table(
  stroke: 0.4pt + rgb("#cccccc"),
  fill: (col, row) => if row == 0 { primary }
        else if calc.odd(row) { white } else { light-bg },
  ..args
)

#let hcell(body) = text(fill: white, weight: "bold", body)

#let musspill = text(fill: rgb("#c0392b"), weight: "bold")[MUSS]
#let sollpill = text(fill: rgb("#e67e22"), weight: "bold")[SOLL]
#let kannpill = text(fill: rgb("#27ae60"), weight: "bold")[KANN]

// ── TITELSEITE ───────────────────────────────────────────────
#page(numbering: none, header: none)[
  #v(2cm)
  #align(center)[
    #block(fill: primary, width: 12cm, height: 4pt, radius: 2pt)
    #v(0.6cm)
    #text(size: 42pt, weight: "bold", fill: primary, tracking: 3pt)[KEEP GROWING]
    #v(0.25cm)
    #text(size: 13pt, style: "italic", fill: muted)[Dein Set-up für mentales Wachstum]
    #v(0.6cm)
    #block(fill: primary, width: 12cm, height: 4pt, radius: 2pt)

    #v(2cm)
    #text(size: 22pt, weight: "bold")[Gesamtdokumentation V2.0]
    #v(0.3cm)
    #text(size: 11pt, fill: muted)[
      Fortschreibung, Erweiterung und DHBW-Pilot-Spezifikation
    ]

    #v(2.5cm)

    #rect(stroke: 1.5pt + primary, inset: 1.5em, radius: 8pt, width: 14cm)[
      #grid(
        columns: (4cm, 1fr),
        row-gutter: 0.75em,
        column-gutter: 0.4em,
        align(right, text(weight: "bold")[Projekt:]),       [Keep Growing – Web-App für DHBW-Pilot],
        align(right, text(weight: "bold")[Neue Gruppe:]),   [Anton Nguyen, Johannes Appel, Nicolas Biercher],
        align(right, text(weight: "bold")[Vorgänger:]),     [Florian Trapp, Elias Huber, Marlon Brunner],
        align(right, text(weight: "bold")[Betreuung:]),     [Prof. Dr. Maren Müller],
        align(right, text(weight: "bold")[Studiengang:]),   [Wirtschaftsinformatik (WIBE24)],
        align(right, text(weight: "bold")[Hochschule:]),    [DHBW Ravensburg],
        align(right, text(weight: "bold")[Repository:]),    [github.com/Vietnameseguy04/Keep\_Growing\_App],
        align(right, text(weight: "bold")[Hosting:]),       [Vercel (keep-growing-app.vercel.app)],
        align(right, text(weight: "bold")[Datenbank:]),     [Supabase (PostgreSQL + Auth + RLS)],
        align(right, text(weight: "bold")[Stand:]),         [November 2026 – V2.0 Pilot-Release],
      )
    ]

    #v(2.5cm)
    #text(size: 9pt, fill: rgb("#bbbbbb"))[
      Diese Dokumentation setzt die Gesamtdokumentation V1.0 von Florian Trapp, \
      Elias Huber und Marlon Brunner (SS 2026) fort.
    ]
  ]
]

// ── INHALTSVERZEICHNIS ──────────────────────────────────────
#page(numbering: none, header: none)[
  #v(0.5cm)
  #text(size: 18pt, fill: primary, weight: "bold")[Inhaltsverzeichnis]
  #v(0.3cm)
  #line(length: 100%, stroke: 1.5pt + primary)
  #v(0.5cm)
  #outline(title: none, indent: 1.5em, depth: 3)
]

#counter(page).update(1)

// ============================================================
// EINLEITUNG
// ============================================================
= Einleitung

Keep Growing ist eine Progressive Web App (PWA), die Nutzerinnen und Nutzer dabei unterstützt, mentales Wohlbefinden durch tägliches Tracking, Gamification und gezielte Trainingseinheiten zu fördern. Die App wurde im Sommersemester 2026 von Florian Trapp, Elias Huber und Marlon Brunner im Rahmen ihres Semesterprojekts an der DHBW Ravensburg entwickelt.

Im Wintersemester 2026/27 übernahm unsere Gruppe (Anton Nguyen, Johannes Appel, Nicolas Biercher, Studiengang WIBE24) das Projekt und erweiterte es gezielt um DSGVO-konforme Funktionen, Push-Benachrichtigungen, PWA-Fähigkeiten sowie automatisierte Tests.

== Ziel dieser Dokumentation

Diese Gesamtdokumentation V2.0 beschreibt die Weiterentwicklung des Projekts auf Basis der V1.0. Sie umfasst die aktualisierte Vorgehensweise, ein erweitertes Lastenheft, ein vollständiges Pflichtenheft der neuen Features, die Projektdokumentation der Implementierungsphase sowie eine revidierte Roadmap für den DHBW-internen Pilotbetrieb.

== Abgrenzung

Diese Dokumentation konzentriert sich auf die *Erweiterungen der V2.0*. Grundlegende Architekturentscheidungen, die ursprüngliche Idee und die Basisimplementierung sind in der Gesamtdokumentation V1.0 (Florian Trapp et al.) beschrieben.

// ============================================================
// TEIL I – VORGEHENSWEISE
// ============================================================
= Teil I – Vorgehensweise & Projektmanagement

== Ausgangslage und Aufgabenstellung

Das Semesterprojekt der WIBE24 bestand in der Übernahme, Weiterentwicklung und Pilotierung der von der Vorgängergruppe entwickelten Keep-Growing-App. Die konkrete Aufgabenstellung umfasste drei Dimensionen:

+ *Übernahme:* Einarbeitung in die bestehende Codebasis, Verständnis der Architektur und Identifikation von Erweiterungsbedarfen
+ *Weiterentwicklung:* Implementierung neuer Features entsprechend dem aktualisierten Lastenheft
+ *Dokumentation:* Fortschreibung der Gesamtdokumentation und Vorbereitung der Prüfungspräsentation

=== Projektübergabe

Die Übergabe vom Vorgängerkurs erfolgte zu Beginn des Wintersemesters 2026/27. Übergeben wurden:
- Zugang zum Original-Repository (github.com/Florian565/Keep_Growing)
- Zugang zur Supabase-Projektinstanz
- Gesamtdokumentation V1.0 (44 Seiten)
- Vercel-Deployment-Konfiguration

Nach der Übergabe fork-ten wir das Repository in unser eigenes GitHub-Konto (Vietnameseguy04/Keep_Growing_App) und richteten eine eigenständige Entwicklungsumgebung ein.

== Teamstruktur und Aufgabenverteilung

Wir arbeiteten als gleichberechtigtes Dreierteam. Die Schwerpunkte verteilten sich wie folgt:

#htable(
  columns: (3.5cm, 1fr, 3.5cm),
  hcell[Person], hcell[Hauptverantwortlichkeit], hcell[Anteil],
  [Anton Nguyen], [Technische Implementierung: PWA, Web Push, Playwright-Tests, Repository-Management], [ca. 40 %],
  [Johannes Appel], [Anforderungsanalyse, DSGVO-Konzept, Pflichtenheft V2.0, Qualitätssicherung], [ca. 30 %],
  [Nicolas Biercher], [Datenbankschema, Deployment, DSGVO-Funktionen (Export/Löschen), Dokumentation], [ca. 30 %],
)

== Projektplanung und Meilensteine

=== Zeitplan

#htable(
  columns: (2cm, 3cm, 1fr, 2cm),
  hcell[Sprint], hcell[Zeitraum], hcell[Inhalte], hcell[Status],
  [1], [Okt. W1–W2], [Einarbeitung, Repository-Fork, lokale Dev-Umgebung, Gap-Analyse], [✓ Done],
  [2], [Okt. W3–W4], [DHBW-E-Mail-Validierung, DSGVO-Konzept, DB-Schema `push_subscriptions`], [✓ Done],
  [3], [Nov. W1–W2], [PWA-Manifest, Service Worker, Web-Push-API, PushNotificationToggle-UI], [✓ Done],
  [4], [Nov. W3–W4], [Playwright-Tests, Error Boundary, Datenexport-API, Account-Löschfunktion], [✓ Done],
  [5], [Dez. 2026],  [Deployment-Verifikation, Bugfixes, Dokumentation, Präsentation], [✓ Done],
)

=== Zeitaufwand (geschätzt)

#htable(
  columns: (3.5cm, 2cm, 2cm, 2cm, 1fr),
  hcell[Person], hcell[Analyse], hcell[Impl.], hcell[Doku], hcell[Gesamt],
  [Anton], [8 h], [35 h], [10 h], [ca. 53 h],
  [Johannes Appel], [15 h], [15 h], [18 h], [ca. 48 h],
  [Nicolas], [10 h], [20 h], [15 h], [ca. 45 h],
  [*Gesamt*], [*33 h*], [*70 h*], [*43 h*], [*ca. 146 h*],
)

== Agiles Vorgehen

Wir orientierten uns an einem leichtgewichtigen Scrum-Prozess, angepasst an die Rahmenbedingungen eines Semesterprojekts:

=== Meetings und Kommunikation

- *Sprint Planning (montags, 30 min):* Aufgaben aus dem Backlog für den Sprint auswählen und zuweisen
- *Daily Standup (täglich, asynchron per WhatsApp):* Was habe ich seit gestern gemacht? Was plane ich heute? Gibt es Blocker?
- *Sprint Review (freitags, 20 min):* Fertige Features demonstrieren, Feedback einholen
- *Retrospektive (alle 2 Wochen, 30 min):* Was lief gut? Was können wir verbessern?

=== Backlog und Aufgabenverwaltung

Als Backlog-Tool nutzten wir *GitHub Issues und Projects*. Jedes Feature wurde als Issue angelegt, mit einem Label (Feature / Bug / Doku), einer zuständigen Person und einem Meilenstein versehen.

Branches folgten dem Schema `feature/<kurzname>` bzw. `fix/<kurzname>`. Merges in `main` erfolgten ausschließlich per Pull Request mit mindestens einem Review durch ein anderes Teammitglied.

== Abstimmungstermine mit Prof. Dr. Müller

In Anlehnung an die Vorgängergruppe führten wir drei strukturierte Abstimmungstermine mit unserer Betreuerin durch:

#htable(
  columns: (2.5cm, 2.5cm, 1fr),
  hcell[Termin], hcell[Zeitpunkt], hcell[Inhalt],
  [Kick-off], [Oktober 2026], [Projektübergabe, Erwartungsklärung, Zieldefinition für V2.0; Klärung Zielgruppe und Pilotrahmen],
  [Zwischenfeedback], [November 2026], [Vorstellung implementierter Features (DHBW-Zugang, DSGVO, PWA), Feedback zu Roadmap und Pilot-Planung],
  [Abnahme], [Dezember 2026], [Abschluss-Demo, Freigabe für Pilotbetrieb, Vorbesprechung Präsentation],
)

== Qualitätssicherung

Qualitätssicherung erfolgte auf drei Ebenen:

+ *Statische Analyse:* TypeScript mit striktem Mode (`strict: true` in `tsconfig.json`) – Typfehler werden zur Compile-Zeit abgefangen
+ *Automatisierte Tests:* 8 Playwright-E2E-Testfälle decken alle kritischen User Journeys ab (vgl. Abschnitt 3.8)
+ *Code-Review:* Kein Merge ohne Review durch ein Teammitglied

== Werkzeuge und Entwicklungsumgebung

#htable(
  columns: (3.5cm, 1fr, 3cm),
  hcell[Werkzeug], hcell[Einsatzzweck], hcell[Version],
  [VS Code], [Primäre IDE, TypeScript/TSX-Entwicklung], [1.95+],
  [Node.js / npm], [JavaScript-Laufzeit und Paketmanager], [v22 / v10],
  [Next.js], [React-Framework (App Router, Server Actions)], [15.x],
  [TypeScript], [Typsichere Entwicklung], [5.x],
  [Supabase CLI], [Lokale Datenbankmigrationen, Schema-Management], [2.x],
  [Playwright], [End-to-End-Testframework], [1.49+],
  [GitHub], [Versionskontrolle, Issues, CI/CD-Integration], [—],
  [Vercel], [Cloud-Hosting, Preview-Deployments], [—],
  [Typst], [Dokumenten-Typesetting (diese Dokumentation)], [0.15+],
)

// ============================================================
// TEIL II – LASTENHEFT
// ============================================================
= Teil II – Lastenheft (V2.0)

== Ausgangssituation

Die Keep-Growing-App existiert seit SS 2026 als funktionsfähige Web-Anwendung. Sie erlaubt Nutzenden, tägliche Einträge zu Stimmung und Wohlbefinden zu erstellen, einen digitalen Blumengarten zu pflegen und kurze Mental-Health-Trainings durchzuführen. Die App wird auf Vercel gehostet und nutzt Supabase als Backend.

Bei Übernahme durch WIBE24 fehlten jedoch wesentliche Funktionen für einen hochschulinternen Betrieb: Es gab keinen Zugangschutz auf DHBW-Angehörige, keine DSGVO-konformen Datenlösch- und Exportfunktionen, keine Push-Benachrichtigungen und keine installierbaren PWA-Fähigkeiten.

== Zielbestimmung

=== Mussziele

Die folgenden Ziele sind für den DHBW-Pilot unverzichtbar:

#htable(
  columns: (1.5cm, 1fr),
  hcell[ID], hcell[Mussziel],
  [M01], [Die App ist ausschließlich für Personen mit einer DHBW-E-Mail-Adresse zugänglich],
  [M02], [Nutzende können ihr Konto und alle personenbezogenen Daten vollständig löschen (DSGVO Art. 17)],
  [M03], [Nutzende können ihre gespeicherten Daten als maschinenlesbaren Export herunterladen (DSGVO Art. 20)],
  [M04], [Die App ist als PWA auf dem Homescreen von iOS und Android installierbar],
  [M05], [Kritische Fehler in Unterseiten crashen nicht die gesamte Anwendung],
)

=== Wunschziele

#htable(
  columns: (1.5cm, 1fr),
  hcell[ID], hcell[Wunschziel],
  [W01], [Nutzende können tägliche Push-Benachrichtigungen als Reminder aktivieren],
  [W02], [Zentrale User Journeys sind durch automatisierte Tests abgedeckt],
  [W03], [Die App läuft stabil in aktuellen Chrome-, Firefox- und Safari-Versionen],
)

=== Abgrenzungsziele

#htable(
  columns: (1.5cm, 1fr),
  hcell[ID], hcell[Abgrenzungsziel],
  [A01], [Die App wird *nicht* kommerziell betrieben – keine Bezahl- oder Premium-Funktionen],
  [A02], [Es wird *kein* nativer iOS- oder Android-App-Store-Eintrag angestrebt],
  [A03], [Eine Mehrsprachigkeit über Deutsch/Englisch hinaus ist *nicht* vorgesehen],
  [A04], [Social-Media-Sharing oder Community-Features sind *nicht* Teil des Piloten],
)

== Produkteinsatz

=== Anwendungsbereich

Keep Growing dient als digitales Wellbeing-Tool für den DHBW-internen Einsatz. Primärer Anwendungsfall ist das tägliche Selbstreflexions-Ritual: Studierende erfassen morgens oder abends ihre Stimmung, schreiben optional einen kurzen Tagebucheintrag und erhalten durch Gamification-Elemente (Blumengarten) positives Feedback für Kontinuität.

=== Zielgruppen

Das ursprüngliche Lastenheft der Vorgängergruppe definierte als Zielgruppe „junge, digital affine Frauen (18–28 Jahre)". Im Rahmen unserer Übergabe haben wir diese Einschränkung bewusst aufgehoben. Begründung:

- Der Auftrag von Prof. Dr. Müller lautet explizit: DHBW-interner Pilot für *alle* Studierenden
- Mental-Health-Förderung ist geschlechts- und altersunabhängig relevant
- Ein breiterer Zielrahmen erhöht die Datenbasis für den Pilottest

#htable(
  columns: (3cm, 1fr, 2.5cm),
  hcell[Zielgruppe], hcell[Beschreibung], hcell[Priorität],
  [DHBW-Studierende], [Hauptzielgruppe: alle Studierenden mit DHBW-E-Mail; primär WGM-Studierende im Pilot], [HOCH],
  [DHBW-Lehrende], [Sekundäre Zielgruppe: Nutzung als Selbstfürsorge-Tool], [MITTEL],
  [Studiengangsleitung], [Indirekte Stakeholder: Interesse an aggregierten, anonymisierten Nutzungsdaten], [NIEDRIG],
)

=== Betriebsbedingungen

- *Endgeräte:* Smartphones (iOS 16+, Android 10+), Desktop-Browser (Chrome 120+, Firefox 121+, Safari 17+)
- *Netzwerk:* Standard WLAN / Mobilfunk; Push-Notifications erfordern aktive Internetverbindung
- *Verfügbarkeit:* 24/7, abhängig von Vercel und Supabase Free Tier (SLA ~99,9 %)
- *Gleichzeitige Nutzer:* Für den Pilot bis zu 200 Nutzende (Supabase Free Tier: 50.000 MAU)

=== Entscheidungsmatrix: Bereitstellungsform

Eine zentrale Entscheidung war die Wahl der Bereitstellungsform. Drei Optionen wurden bewertet:

#htable(
  columns: (2.8cm, 1fr, 1fr, 1fr),
  hcell[Kriterium], hcell[Native App (App Store)], hcell[PWA (Homescreen)], hcell[DHBW-Server],
  [Installierbarkeit], [✓ Nativ auf Homescreen], [✓ Homescreen-Install via Browser], [✗ Nur Browser-Tab],
  [iOS-Kompatibilität], [✓ Vollständig], [◐ iOS 16.4+ nötig für Push], [✓ Vollständig],
  [Kosten], [✗ 99 \$/Jahr (Apple Developer)], [✓ Kostenlos (Vercel Free)], [◐ Serverkosten DHBW],
  [Deployment-Aufwand], [✗ Review-Prozess: 1–2 Wochen], [✓ Sofort via Git-Push], [✗ IT-Abteilung nötig],
  [Datenschutz (DSGVO)], [◐ Daten bei Apple/Google], [◐ Daten bei Supabase/Vercel (AVV nötig)], [✓ Daten auf DHBW-Infrastruktur],
  [Wartungsaufwand], [✗ Store-Updates nötig], [✓ Automatisch via Vercel], [✗ Manueller Server-Betrieb],
  [Pilotgeschwindigkeit], [✗ Wochen bis Launch], [✓ Sofort einsatzbereit], [✗ Einrichtung dauert Wochen],
)

*Entscheidung: PWA auf Vercel.* Die PWA-Lösung bietet den besten Kompromiss aus Installierbarkeit, Kosten und Deploymentgeschwindigkeit. Sie ermöglicht einen sofortigen Pilotstart ohne Store-Gebühren oder IT-Infrastruktur der DHBW. Der einzige Nachteil (Datenschutz: Daten bei US-Anbietern) wird durch den Abschluss eines Auftragsverarbeitungsvertrags (AVV) adressiert (vgl. Abschnitt 4.3).

== Produktfunktionen

=== Bestehende Funktionen (übernommen aus V1.0)

#htable(
  columns: (1.5cm, 1fr),
  hcell[ID], hcell[Funktion],
  [PF01], [Registrierung und Login via E-Mail + Passwort (Supabase Auth)],
  [PF02], [Passwort vergessen / Passwort-Reset per E-Mail],
  [PF03], [Tagesübersicht (Dashboard): Mood-Score eingeben, Tagebucheintrag schreiben],
  [PF04], [Blumengarten: Gamification – Blumen wachsen pro positivem Tageseintrag],
  [PF05], [Trainingsbereich: Kuratierte Mental-Health-Übungen],
  [PF06], [Einstellungen: Passwort ändern, Blumengarten zurücksetzen, Logout],
  [PF07], [Impressum / About-Seite],
)

=== Neue Funktionen (V2.0)

#htable(
  columns: (1.5cm, 1fr, 2cm),
  hcell[ID], hcell[Funktion], hcell[Prio],
  [PF08], [Zugangsbeschränkung auf DHBW-E-Mail-Adressen bei Registrierung], [#musspill],
  [PF09], [Account-Löschung inkl. aller personenbezogenen Daten (DSGVO Art. 17)], [#musspill],
  [PF10], [Datenexport als JSON-Datei (DSGVO Art. 20)], [#musspill],
  [PF11], [PWA-Manifest: App auf Homescreen installierbar], [#musspill],
  [PF12], [Service Worker: Push-Notifications empfangbar], [#sollpill],
  [PF13], [Push-Reminder: tägliche Benachrichtigung aktivieren/deaktivieren], [#sollpill],
  [PF14], [Error Boundary: Fehler in Unterseiten isoliert abfangen], [#sollpill],
  [PF15], [Playwright-E2E-Tests für zentrale User Journeys], [#sollpill],
)

== Produktdaten

Die App speichert folgende personenbezogenen Daten:

#htable(
  columns: (3cm, 1fr, 2.5cm),
  hcell[Datenkategorie], hcell[Inhalt], hcell[Rechtsgrundlage],
  [Account-Daten], [E-Mail-Adresse, Vor-/Nachname, Passwort-Hash, Registrierungsdatum], [Art. 6 Abs. 1b DSGVO],
  [Tageseinträge], [Datum, Stimmungswert (1–10), Freitextnotiz], [Art. 9 Abs. 2a DSGVO (ausdrückliche Einwilligung)],
  [Blumen], [Typ, Position im Garten, Erstellungsdatum], [Art. 6 Abs. 1b DSGVO],
  [Garteneinstellungen], [Letzter Reset-Zeitpunkt], [Art. 6 Abs. 1b DSGVO],
  [Push-Subscription], [Endpoint-URL, Auth-Keys (verschlüsselt), Erstellungsdatum], [Art. 6 Abs. 1a DSGVO (Einwilligung)],
)

#infobox(title: "Datenschutz-Hinweis")[
  Tageseinträge zu Stimmung und mentalem Wohlbefinden können nach Art. 9 DSGVO als Gesundheitsdaten einzustufen sein. Die Rechtsgrundlage ist die ausdrückliche Einwilligung der Nutzenden bei Registrierung.
]

== Qualitätsanforderungen

#htable(
  columns: (3cm, 1fr, 2cm),
  hcell[Kriterium], hcell[Anforderung], hcell[Priorität],
  [Performance], [Seitenladezeit unter 3 Sekunden auf Mobilgeräten (4G)], [HOCH],
  [Verfügbarkeit], [99 % Uptime im Pilotbetrieb (abhängig von Vercel/Supabase SLA)], [HOCH],
  [Sicherheit], [Keine SQL-Injections möglich; Row Level Security auf Datenbankebene; HTTPS erzwungen], [HOCH],
  [Datenschutz], [DSGVO-Konformität: Lösch- und Exportfunktionen vorhanden und funktionsfähig], [HOCH],
  [Usability], [Kernfunktionen (Login, Dashboard, Eintrag) in max. 3 Klicks erreichbar], [MITTEL],
  [Kompatibilität], [Funktionsfähig in Chrome 120+, Firefox 121+, Safari 17+], [MITTEL],
  [Testbarkeit], [Mind. 8 automatisierte E2E-Tests vorhanden und im CI lauffähig], [MITTEL],
)

// ============================================================
// TEIL III – PFLICHTENHEFT
// ============================================================
= Teil III – Pflichtenheft (V2.0)

== Systemarchitektur

Keep Growing folgt einer klassischen Dreischichten-Architektur, vollständig als Serverless-Lösung deployt:

#htable(
  columns: (2.5cm, 3cm, 1fr),
  hcell[Schicht], hcell[Technologie], hcell[Verantwortlichkeit],
  [Frontend], [Next.js 15 (React)], [Server-gerenderte Seiten, Client-Komponenten, PWA-Fähigkeiten],
  [Backend], [Next.js API Routes + Server Actions], [Authentifizierung, Datenzugriff, Push-Versand],
  [Persistenz], [Supabase (PostgreSQL)], [Datenhaltung, Auth, Row Level Security],
  [Hosting], [Vercel (Serverless)], [Globales CDN, automatische HTTPS, Preview-Deployments],
  [Push-Service], [Web Push / VAPID], [Delivery von Push-Notifications via Browser-Push-Service],
)

=== Technologie-Stack im Detail

#htable(
  columns: (3.5cm, 1fr, 2.5cm),
  hcell[Technologie], hcell[Rolle im Projekt], hcell[Version],
  [Next.js], [React-Framework mit App Router; Server Components reduzieren Client-Bundle-Größe], [15.x],
  [React], [UI-Bibliothek; Hooks für Client-State (Notification-Toggle)], [19.x],
  [TypeScript], [Typsicherheit; `strict: true`; verhindert Kategorie von Runtime-Fehlern], [5.x],
  [Tailwind CSS], [Utility-First CSS; konsistentes Design-System aus V1.0 übernommen], [3.x],
  [Supabase JS], [Offizieller Client für DB-Zugriff und Auth aus Next.js], [2.x],
  [web-push], [VAPID-basierter Push-Versand (v4.0.0: nur Named Exports)], [4.0.0],
  [Playwright], [Browser-Automatisierung für E2E-Tests], [1.49+],
)

== Datenbankdesign

=== Gesamtübersicht (V2.0)

#htable(
  columns: (3.5cm, 1fr, 2cm),
  hcell[Tabelle], hcell[Felder], hcell[Neu in V2],
  [`daily_entries`], [`id`, `user_id` (FK), `created_at` (Datum), `score` (1–10), `note` (Text)], [Nein],
  [`flowers`], [`id`, `user_id` (FK), `created_at`, `type`, `position_x`, `position_y`], [Nein],
  [`garden_settings`], [`id`, `user_id` (FK), `last_reset_at`], [Nein],
  [`notes`], [`id`, `user_id` (FK), `created_at`, `content`], [Nein],
  [`push_subscriptions`], [`user_id` (PK + FK), `subscription` (JSON-Text), `created_at`], [*Ja*],
)

=== Tabelle `push_subscriptions` (neu)

```sql
CREATE TABLE push_subscriptions (
  user_id      UUID        PRIMARY KEY
               REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscription"
  ON push_subscriptions
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

*Designentscheidungen:*
- `user_id` als Primary Key: ein Nutzer hat maximal eine aktive Subscription (UPSERT-Logik)
- `ON DELETE CASCADE`: automatische Löschung bei Account-Löschung (DSGVO Art. 17)
- Row Level Security: Nutzer lesen und schreiben ausschließlich eigene Zeilen

== API-Spezifikation

=== Übersicht aller API-Routes

#htable(
  columns: (1.5cm, 3.5cm, 1fr, 2cm),
  hcell[Methode], hcell[Route], hcell[Funktion], hcell[Auth],
  [GET],  [`/api/export`], [Alle Nutzerdaten als JSON-Download zurückgeben (DSGVO Art. 20)], [Required],
  [POST], [`/api/push`],   [Push-Subscription in Supabase speichern], [Required],
  [GET],  [`/api/push`],   [Test-Push-Notification an gespeicherte Subscription senden], [Required],
)

=== Route `GET /api/export`

*Request:* Kein Body, Auth via Supabase Session-Cookie

*Response (200 OK):*
```json
{
  "account": {
    "email": "vorname\@student.dhbw-stuttgart.de",
    "name": "Max Mustermann",
    "created_at": "2026-10-01T10:00:00Z"
  },
  "daily_entries": [...],
  "flowers": [...],
  "garden_settings": [...]
}
```

*Response-Header:*
```
Content-Type: application/json
Content-Disposition: attachment; filename="keep-growing-data.json"
```

*Fehlerfall (401):* `{ "error": "Unauthorized" }` wenn keine aktive Session

=== Route `POST /api/push`

*Request-Body:*
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

*Response (200 OK):* `{ "success": true }`

*Verhalten:* UPSERT auf `push_subscriptions` – existierende Subscription wird überschrieben

=== Route `GET /api/push`

*Request:* Kein Body, Auth via Supabase Session-Cookie

*Response (200 OK):* `{ "success": true }` nach erfolgreichem Push-Versand

*Fehlerfall (404):* `{ "error": "No subscription" }` wenn keine Subscription gespeichert

== Feature-Spezifikationen

=== F01 – DHBW-E-Mail-Validierung (PF08)

*Zweck:* Zugangsbeschränkung der App auf DHBW-Angehörige

*Implementierung:* Serverseitige Validierung in der Server Action `handleSignUp()` in `src/app/actions.ts`

*Validierungslogik:*
```typescript
if (!email.toLowerCase().match(/@(student\.)?dhbw/)) {
  return { error: 'no-dhbw-email' };
}
```

*Akzeptierte Adressen (Beispiele):*
- `vorname.nachname\@dhbw-ravensburg.de`
- `s123456\@student.dhbw-stuttgart.de`
- `mitarbeiter\@dhbw-mosbach.de`

*Ablauf bei abgelehnter E-Mail:*
+ Server Action gibt `{ error: 'no-dhbw-email' }` zurück
+ Client-Komponente leitet zu `/register?error=no-dhbw-email` weiter
+ Registrierungsseite zeigt: „Bitte verwende deine DHBW-E-Mail-Adresse (\@dhbw... oder \@student.dhbw...)."

*Betroffene Dateien:*
- `src/app/actions.ts` – Validierungslogik
- `src/app/(auth)/register/register-form.tsx` – Fehlerweiterleitung
- `src/app/(auth)/register/page.tsx` – Fehleranzeige

---

=== F02 – Account-Löschung (PF09) – DSGVO Art. 17

*Zweck:* Umsetzung des Rechts auf Vergessenwerden

*UI:* Versteckt hinter `<details>`-Element in den Einstellungen mit expliziter Bestätigungsschaltfläche „Ja, Account dauerhaft löschen"

*Lösch-Sequenz (Server Action `deleteAccount()`):*

#htable(
  columns: (1cm, 3cm, 1fr),
  hcell[Schritt], hcell[Aktion], hcell[Details],
  [1], [Parallel-Delete], [`daily_entries`, `flowers`, `garden_settings` WHERE `user_id = user.id`],
  [2], [Auth-Delete], [`supabase.auth.admin.deleteUser(user.id)` – löscht Auth-Eintrag und `push_subscriptions` via CASCADE],
  [3], [Session-Ende], [`supabase.auth.signOut()`],
  [4], [Redirect], [→ `/login?deleted=true` mit Bestätigungsmeldung],
)

*Datei:* `src/app/actions.ts` → `deleteAccount()`

---

=== F03 – Datenexport (PF10) – DSGVO Art. 20

*Zweck:* Recht auf Datenübertragbarkeit in maschinenlesbarem Format

*Implementierung:* API-Route `GET /api/export` (nicht als Server Action, da Server Actions `void` zurückgeben müssen)

*UI:* `<a href="/api/export" download="keep-growing-data.json">` – kein JavaScript nötig, Download via Browser

*Datei:* `src/app/api/export/route.ts`

---

=== F04 – Progressive Web App (PF11)

*Zweck:* Native App-ähnliche Installation auf Mobilgeräten ohne App-Store

#htable(
  columns: (4cm, 1fr),
  hcell[Datei], hcell[Funktion],
  [`public/manifest.json`], [PWA-Manifest: Name, Icons, Theme-Color `\#b57a84`, `display: standalone`],
  [`public/sw.js`], [Service Worker: Install/Activate-Handler; Push-Event-Handler; Notification-Click → `/dashboard`],
  [`src/app/ServiceWorkerRegistrar.tsx`], [`'use client'`-Komponente; registriert `/sw.js` einmalig via `useEffect`],
  [`src/app/layout.tsx`], [Metadata: `manifest: "/manifest.json"`, Apple-WebApp-Flags],
)

*Manifest (Auszug):*
```json
{
  "name": "Keep Growing",
  "short_name": "Keep Growing",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#b57a84",
  "background_color": "#ffffff"
}
```

---

=== F05 – Web Push Notifications (PF12/PF13)

*Zweck:* Opt-in tägliche Reminder an Nutzende ohne App öffnen zu müssen

*Technologie:* VAPID (Voluntary Application Server Identification) via `web-push` npm-Package

*Ablauf – Subscription:*

#htable(
  columns: (1cm, 2.5cm, 1fr),
  hcell[\#], hcell[Akteur], hcell[Aktion],
  [1], [Browser], [Nutzer klickt „Activate Daily Reminders" → Berechtigung anfragen],
  [2], [Browser], [`pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`],
  [3], [Client], [Subscription-Objekt per `POST /api/push` an Backend senden],
  [4], [Backend], [Subscription in `push_subscriptions` per UPSERT speichern],
)

*Ablauf – Notification versenden:*

#htable(
  columns: (1cm, 2.5cm, 1fr),
  hcell[\#], hcell[Akteur], hcell[Aktion],
  [1], [Backend], [Subscription aus `push_subscriptions` lesen],
  [2], [Backend], [`sendNotification(subscription, payload)` via VAPID],
  [3], [Push-Service], [FCM (Android) oder APNs (iOS) liefern Notification aus],
  [4], [Browser/Gerät], [Service Worker empfängt `push`-Event, zeigt Notification an],
)

*Umgebungsvariablen (nie im Repository):*
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY  (Browserseite)
VAPID_PRIVATE_KEY             (nur Server)
VAPID_EMAIL                   (Kontakt-E-Mail für Push-Services)
```

*Betroffene Dateien:*
- `src/app/api/push/route.ts` – POST/GET-Handler
- `src/app/(mainpage)/einstellungen/PushNotificationToggle.tsx` – Subscribe-UI
- `public/sw.js` – Push-Event-Handler

---

=== F06 – Error Boundary (PF14)

*Zweck:* Fehler in Unterseiten isolieren, damit die gesamte App nicht abstürzt

*Datei:* `src/app/(mainpage)/error.tsx`

*Verhalten:* Next.js `error.tsx` fängt alle unbehandelten Fehler in der `(mainpage)`-Route-Group ab. Nutzer sehen eine benutzerfreundliche Meldung mit „Erneut versuchen"-Button (`reset()`-Funktion).

---

=== F07 – Playwright E2E-Tests (PF15)

*Zweck:* Automatisierter Nachweis der Kernfunktionalität; Regressionssicherheit

*Konfiguration:* `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser-Projekte: Chromium Desktop + Mobile Chrome (Pixel 5)
- Web-Server: automatisch via `npm run dev` gestartet

*Testfälle:*

#htable(
  columns: (1.5cm, 1fr, 3cm),
  hcell[Test-ID], hcell[Beschreibung], hcell[Abgedecktes Feature],
  [T-01], [Login-Seite lädt und zeigt E-Mail- und Passwort-Felder an], [Auth-Grundfunktion],
  [T-02], [Registrierung mit Nicht-DHBW-E-Mail wird abgelehnt (Fehlermeldung erscheint)], [F01 – Validierung],
  [T-03], [Registrierung mit DHBW-E-Mail passiert Validierung (kein Fehler auf Validator-Ebene)], [F01 – Validierung],
  [T-04], [Falscher Login zeigt Fehlermeldung „Invalid credentials"]  , [Auth-Fehlerbehandlung],
  [T-05], [Dashboard nach erfolgreichem Login erreichbar und zeigt Willkommensnachricht], [Core-Flow],
  [T-06], [Blumengarten-Seite `/blumengarten` erreichbar], [Navigation],
  [T-07], [Trainings-Seite `/trainings` erreichbar], [Navigation],
  [T-08], [Einstellungen zeigen DSGVO-Abschnitt (Export-Link, Löschen-Button) und Reminders-Toggle], [F02, F03, F05],
)

*Ausführung:*
```bash
cd keep-growing
npx playwright test            # alle Tests im Headless-Modus
npx playwright test --ui       # interaktiver UI-Modus
npx playwright show-report     # HTML-Bericht anzeigen
```

== Sicherheitskonzept

#htable(
  columns: (3.5cm, 1fr),
  hcell[Bereich], hcell[Maßnahme],
  [Transport], [HTTPS erzwungen via Vercel (TLS 1.3); keine HTTP-Verbindungen erlaubt],
  [Authentifizierung], [Passwörter als bcrypt-Hash via Supabase Auth; kein Klartext-Speicher],
  [Autorisierung], [Row Level Security auf PostgreSQL-Ebene; Nutzer können nur eigene Daten lesen/schreiben],
  [VAPID-Schlüssel], [Private Key nur als Vercel-Umgebungsvariable; nicht im Repository],
  [E-Mail-Validierung], [Serverseitig in Server Action; clientseitige Validierung ist nur UX-Hilfe],
  [Dependency-Sicherheit], [Regelmäßige `npm audit`-Checks; aktueller Stand: keine kritischen Vulnerabilities],
  [SQL-Injection], [Alle DB-Zugriffe via Supabase JS Client mit Prepared Statements; kein rohes SQL im Anwendungscode],
)

// ============================================================
// TEIL IV – PROJEKTDOKUMENTATION
// ============================================================
= Teil IV – Projektdokumentation

== Soll-Ist-Vergleich

=== Funktionsumfang

#htable(
  columns: (1fr, 2cm, 2cm),
  hcell[Feature], hcell[Soll (V2.0)], hcell[Ist (Stand Nov. 2026)],
  [DHBW-E-Mail-Validierung], [✓ MUSS], [✓ Implementiert],
  [Account-Löschung (DSGVO Art. 17)], [✓ MUSS], [✓ Implementiert],
  [Datenexport (DSGVO Art. 20)], [✓ MUSS], [✓ Implementiert],
  [PWA-Manifest + Homescreen-Install], [✓ MUSS], [✓ Implementiert],
  [Service Worker (Push-Empfang)], [✓ SOLL], [✓ Implementiert],
  [Push-Reminder (Opt-in)], [✓ SOLL], [✓ Implementiert],
  [Error Boundary], [✓ SOLL], [✓ Implementiert],
  [Playwright E2E-Tests (mind. 8)], [✓ SOLL], [✓ 8 Tests vorhanden],
  [Automatischer täglicher Cron-Push], [✓ KANN], [○ Nicht implementiert],
)

=== Abweichungen und Begründungen

Der automatische tägliche Cron-Push (alle Nutzer täglich um 19:00 Uhr benachrichtigen) wurde bewusst nicht implementiert. Gründe:
- Vercel Cron Jobs erfordern den Pro-Plan (20 \$/Monat)
- Push-Notifications können nur gesendet werden, wenn eine Subscription vorliegt – eine zentrale Liste aller aktiven Subscriptions wäre nötig
- Datenschutzrechtlich kritisch: Massenversand von Push-Notifications erfordert gesonderte Einwilligung

Als Alternative wurde die manuelle Test-Notification via `GET /api/push` implementiert. Ein späterer Cron-Job ist als Phase-2-Aufgabe in der Roadmap dokumentiert.

== Aufgetretene Herausforderungen und Lösungen

=== Herausforderung 1: TypeScript – Server Action als Form-Action

*Problem:* `exportUserData()` sollte als Server Action direkt in `<form action={...}>` verwendet werden. TypeScript warf einen Fehler: Server Actions, die in Form-Actions verwendet werden, müssen `void` zurückgeben. Eine Export-Funktion muss aber Daten zurückgeben.

*Lösung:* Dateiexport als dedizierte API-Route (`GET /api/export`) umgebaut. Im Frontend wird ein `<a href="/api/export" download>` verwendet – semantisch korrekt und ohne JavaScript.

*Lesson Learned:* Next.js Server Actions sind für Formular-Mutations gedacht, nicht für Datei-Downloads. API Routes sind der richtige Ansatz für Response mit Body.

---

=== Herausforderung 2: `web-push` v4.0.0 – Breaking Change

*Problem:* `import webpush from 'web-push'` schlug beim Build fehl: „Export default doesn't exist in target module". Version 4.0.0 entfernte den Default-Export.

*Lösung:*
```typescript
// Vorher (schlägt fehl mit web-push v4.0.0):
import webpush from 'web-push';

// Nachher (korrekt):
import { setVapidDetails, sendNotification } from 'web-push';
```

*Lesson Learned:* Bei npm-Paketen immer den Changelog auf Breaking Changes prüfen, besonders bei Minor-Versionssprüngen. `npm install web-push` installiert immer die neueste Version.

---

=== Herausforderung 3: Next.js Build-Cache nach Code-Änderungen

*Problem:* Nach dem Fix des `web-push`-Imports zeigte der Browser weiterhin den alten Fehler, obwohl der Code korrekt war.

*Ursache:* Next.js / Turbopack hatte eine veraltete Version des kompilierten Moduls gecacht.

*Lösung:*
```bash
rm -rf .next/
npm run dev
```

*Lesson Learned:* Bei hartnäckigen Build-Fehlern nach Code-Fixes immer den Next.js-Cache löschen.

---

=== Herausforderung 4: Supabase MX-Record-Validierung

*Problem:* `test\@student.dhbw-stuttgart.de` wurde von Supabase Auth abgelehnt: „Email address is invalid".

*Ursache:* Supabase prüft beim Signup, ob die Domain real existiert (MX-Record-Lookup). `student.dhbw-stuttgart.de` als Subdomain hat in der Regel keine eigenen MX-Records.

*Schlussfolgerung:* Kein Bug in unserer DHBW-Validierung. Für vollständige Tests wird eine echte DHBW-Studierenden-E-Mail benötigt.

---

=== Herausforderung 5: Git Lock-File bei Remote-Wechsel

*Problem:* `git remote remove origin` schlug fehl mit „cannot lock ref 'refs/remotes/origin/florian'".

*Lösung:* Statt Remote zu entfernen, nur die URL geändert:
```bash
git remote set-url origin https://github.com/Vietnameseguy04/Keep_Growing_App.git
```

== Datenschutz-Konzept (DSGVO)

Keep Growing verarbeitet nach Art. 9 DSGVO potenziell besonders schützenswerte Gesundheitsdaten (Stimmungswerte, mentale Gesundheitseinträge). Folgende technisch-organisatorische Maßnahmen (TOMs) wurden implementiert:

#htable(
  columns: (3.5cm, 1fr),
  hcell[DSGVO-Artikel], hcell[Umsetzung in V2.0],
  [Art. 9 (Sensible Daten)], [Zugangsbeschränkung auf DHBW-Angehörige; RLS verhindert Fremdzugriff auf DB-Ebene],
  [Art. 13/14 (Informationspflicht)], [Impressum mit Datenschutzinformationen vorhanden],
  [Art. 15 (Auskunft)], [Datenexport-Funktion zeigt alle gespeicherten Daten des Nutzers],
  [Art. 17 (Löschrecht)], [Account-Löschen löscht alle Daten inkl. Auth-Konto; ON DELETE CASCADE sichert DB-Konsistenz],
  [Art. 20 (Portabilität)], [JSON-Export in maschinenlesbarem, strukturiertem Format],
  [Art. 25 (Privacy by Design)], [RLS ab Datenbankebene; VAPID-Keys nicht im Code-Repository; HTTPS erzwungen],
  [Art. 32 (Sicherheit)], [Passwörter nur als Hash (Supabase bcrypt); TLS 1.3 via Vercel],
)

=== Auftragsverarbeitungsvertrag (AVV)

Ein zentrales datenschutzrechtliches Thema ist der Einsatz von Supabase (USA) und Vercel (USA) als Auftragsverarbeiter für Gesundheitsdaten nach Art. 9 DSGVO.

*Status: Erledigt.* Supabase integriert das Data Processing Addendum (DPA) automatisch in seine Terms of Service – alle Organisationen erhalten den Schutz automatisch, ohne separaten Vertragsabschluss. Dies wurde im Supabase-Dashboard unter Organization Settings → Legal → Legal Documents verifiziert (November 2026).

- *Supabase DPA:* Automatisch aktiv durch Terms of Service – kein separater AVV nötig
- *Vercel:* Bietet ebenfalls einen AVV an (über Vercel-Accounteinstellungen); für den Pilotbetrieb im Hobby-Plan ausreichend abgedeckt
- *Region:* Das Supabase-Projekt wurde bereits von der Vorgängergruppe auf EU-Region (Irland, `eu-west-1`) eingerichtet – Daten verlassen die EU nicht

== Pilottest-Konzept

Laut Aufgabenstellung ist ein *echter Pilottest mit Nutzungszahlen* der stärkste Differenzierer gegenüber der Vorgängergruppe, die ausschließlich intern getestet hat. Frau Müller hat die Frage „Nutzen die Studis das überhaupt?" explizit als ihre Kernfrage bezeichnet.

=== Vorgehen

#htable(
  columns: (2cm, 3cm, 1fr),
  hcell[Phase], hcell[Zeitraum], hcell[Maßnahme],
  [Vorbereitung], [Jan. 2027], [Datenschutzerklärung ergänzen, Onboarding-Text vorbereiten],
  [Launch], [Feb. 2027], [Einladung eines WGM-Kurses per DHBW-E-Mail; freiwillige Teilnahme],
  [Messung], [Feb.–Mär. 2027], [Anonyme Nutzungsdaten aus Supabase auswerten; Kurzumfrage nach 2 Wochen],
  [Auswertung], [Apr. 2027], [Ergebnisse aufbereiten für Präsentation],
)

=== Zu erhebende Kennzahlen

#htable(
  columns: (3.5cm, 1fr),
  hcell[Kennzahl], hcell[Bedeutung / Messung],
  [Registrierungen], [Anzahl erstellter Accounts – Supabase Auth Dashboard],
  [Day-7-Retention], [Nutzer mit mind. 1 Eintrag in Woche 2 geteilt durch Gesamtregistrierungen],
  [Ø Einträge/Woche], [Durchschnittliche `daily_entries` pro aktivem Nutzer und Woche],
  [Push-Opt-in-Rate], [Anteil Nutzer mit gespeicherter Push-Subscription],
  [NPS / SUS-Score], [Kurzumfrage (5 Fragen) nach 2 Wochen],
)

#infobox(title: "Datenschutz beim Pilottest")[
  Alle Nutzungsdaten werden anonymisiert ausgewertet. Teilnahme ist freiwillig; Ausstieg jederzeit durch die Account-Löschfunktion möglich.
]

== Individuelle Beiträge

Anton übernahm die technische Hauptimplementierung des Projekts. Schwerpunkte waren das PWA-Setup (Manifest, Service Worker, ServiceWorkerRegistrar-Komponente), die komplette Web-Push-Infrastruktur mit VAPID-Schlüsselverwaltung sowie die Playwright-E2E-Test-Suite. Darüber hinaus managte Anton das GitHub-Repository, erstellte alle Pull Requests und führte den initialen Fork vom Vorgänger-Repository durch.

Größte Herausforderung: Der Breaking Change in `web-push` v4.0.0, der erst nach intensivem Debugging im kompilierten Modul identifiziert wurde.

=== Johannes Appel

Johannes verantwortete die Anforderungsanalyse und die Erstellung des aktualisierten Pflichtenhefts. Er identifizierte systematisch die sechs Lücken in der V1.0-Implementierung und leitete daraus die Mussziele und Wunschziele der V2.0 ab. Besonderer Fokus lag auf dem DSGVO-Konzept: Die Zuordnung der Funktionen zu den relevanten DSGVO-Artikeln und die Sicherstellung der rechtlichen Anforderungen waren sein Hauptbeitrag.

Wichtigste Erkenntnis: DSGVO-Konformität muss von Anfang an mitgedacht werden – nachträgliche Implementierung von Lösch- und Exportfunktionen ist aufwändiger als geplant.

=== Nicolas Biercher

Nicolas war für das Datenbankschema und das Deployment verantwortlich. Er entwarf und implementierte die `push_subscriptions`-Tabelle inklusive Row Level Security Policy und erstellte das SQL-Migrationsskript. Außerdem implementierte er die DSGVO-Funktionen (Account-Löschfunktion und Datenexport-API-Route) und verifizierten das Vercel-Deployment nach jeder größeren Änderung.

Wichtigste Erkenntnis: `ON DELETE CASCADE` in PostgreSQL ist ein mächtiges Werkzeug für DSGVO-konforme Datenlöschung – spart Anwendungslogik und verhindert inkonsistente Datenbankzustände.

// ============================================================
// TEIL V – ROADMAP
// ============================================================
= Teil V – Roadmap DHBW-Pilot

== Strategische Ausrichtung

Die ursprüngliche Roadmap der V1.0 sah einen kommerziellen Betrieb vor. Diese Ausrichtung wurde im Rahmen der Übergabe an WIBE24 verworfen. Die neue Strategie fokussiert auf drei Säulen:

+ *Datenschutzkonformität* als nicht verhandelbare Grundvoraussetzung für den Hochschulbetrieb
+ *Niedrige Betriebskosten* (Serverless auf Vercel, Supabase Free Tier: 0 \$/Monat)
+ *Übergabefähigkeit* als Forschungs- und Lehrobjekt für zukünftige WGM-Kurse

== Phase 1 – Pilot-Release (Q4 2026, abgeschlossen)

#htable(
  columns: (auto, 1fr, auto),
  hcell[ID], hcell[Meilenstein], hcell[Status],
  [P1.1], [Repository übernommen und lokale Entwicklungsumgebung eingerichtet], [✓],
  [P1.2], [DHBW-E-Mail-Validierung implementiert und getestet], [✓],
  [P1.3], [DSGVO-Funktionen: Account löschen + Datenexport], [✓],
  [P1.4], [PWA-Manifest und Service Worker implementiert], [✓],
  [P1.5], [Web Push Notifications mit VAPID implementiert], [✓],
  [P1.6], [Playwright E2E-Test-Suite (8 Tests) erstellt], [✓],
  [P1.7], [Gesamtdokumentation V2.0 fertiggestellt], [✓],
  [P1.8], [Vercel-Deployment verifiziert und live], [✓],
)

== Phase 2 – Ausbau und DHBW-Rollout (Q1 2027)

#htable(
  columns: (auto, 1fr, 2.5cm),
  hcell[ID], hcell[Feature / Aufgabe], hcell[Priorität],
  [P2.1], [Automatischer täglicher Cron-Push (Vercel Cron Jobs, täglich 19:00 Uhr)], [HOCH],
  [P2.2], [Onboarding-Flow: Intro-Slides bei erstem Login], [MITTEL],
  [P2.3], [Offline-Fallback-Seite im Service Worker], [MITTEL],
  [P2.4], [PWA-Icon-Set in verschiedenen Größen (192×192, 512×512, maskable)], [NIEDRIG],
  [P2.5], [Admin-Dashboard für Studiengangsleitung (anonymisierte Nutzungsstatistiken)], [NIEDRIG],
)

== Phase 3 – Evaluation und Übergabe an Nachfolgegruppe (Q2–Q3 2027)

#htable(
  columns: (auto, 1fr),
  hcell[ID], hcell[Aufgabe],
  [P3.1], [Nutzerbefragung: System Usability Scale (SUS) und Net Promoter Score (NPS) erheben],
  [P3.2], [Auswertung: Welche Features werden am häufigsten genutzt? (Supabase Analytics)],
  [P3.3], [Abschlussbericht mit Empfehlungen für die nächste Gruppe],
  [P3.4], [Übergabe-Meeting (analog zu unserer eigenen Übergabe)],
  [P3.5], [Repository-Archivierung als öffentliches Open-Source-Referenzprojekt],
)

== Technische Schulden und Risiken

#htable(
  columns: (3cm, 1fr, 2cm),
  hcell[Risiko], hcell[Beschreibung / Auswirkung], hcell[Schwere],
  [Supabase Free Tier], [500 MB DB, 50.000 MAU – bei vollständigem DHBW-Rollout Upgrade nötig (25 \$/Monat)], [MITTEL],
  [Kein Cron-Push], [Reminders nur per manuellem Trigger – Nutzungskontinuität leidet], [HOCH],
  [Kein Error-Monitoring], [Produktionsfehler werden nicht aktiv gemeldet (kein Sentry o.Ä.)], [MITTEL],
  [Push auf iOS < 16.4], [Web Push auf älteren iPhones nicht unterstützt – Reminders nicht verfügbar], [NIEDRIG],
  [VAPID-Key-Verlust], [Bei Key-Verlust müssen alle Subscriptions neu eingeholt werden], [MITTEL],
  [TypeScript `strict`], [Einige Legacy-Teile aus V1.0 nutzen noch `any`-Types – technische Schuld], [NIEDRIG],
)

// ============================================================
// FAZIT & REFLEXION
// ============================================================
= Fazit und Reflexion

== Projektergebnis

Wir haben die Keep-Growing-App erfolgreich übernommen und um alle definierten Mussziele erweitert. Die App ist DSGVO-konform, auf DHBW-Angehörige beschränkt, als PWA installierbar, unterstützt Push-Notifications und ist durch automatisierte Playwright-Tests abgesichert. Das Deployment auf Vercel ist stabil, die Codebasis ist sauber und übergabefähig.

Gegenüber der V1.0 wurde die Dokumentation strukturell beibehalten und inhaltlich erheblich vertieft – insbesondere im Bereich DSGVO, Datenbankdesign und Testkonzept.

== Reflexion je Person

=== Anton Nguyen

Das Projekt hat mir gezeigt, wie wichtig es ist, Abhängigkeiten (npm-Packages) vor dem Einsatz sorgfältig zu prüfen. Der Breaking Change in `web-push` v4.0.0 hat mich mehrere Stunden Debugging gekostet, wäre aber mit einem kurzen Blick ins Changelog vermeidbar gewesen. Positiv überrascht hat mich das Playwright-Framework: E2E-Tests schreiben sich deutlich schneller als gedacht und geben einem als Entwickler ein gutes Sicherheitsgefühl bei Refactorings.

*Was ich beim nächsten Mal anders mache:* `npm install <paket>@latest` immer mit `--dry-run` vorab prüfen und Changelog lesen.

=== Johannes Appel

Die Anforderungsanalyse war aufwändiger als erwartet, aber lohnend: Erst durch die systematische Gap-Analyse haben wir erkannt, dass DSGVO-Konformität kein „Nice-to-have" ist, sondern für einen Hochschulbetrieb zwingend erforderlich. Die Auseinandersetzung mit den konkreten DSGVO-Artikeln (Art. 17, Art. 20) hat mir gezeigt, wie direkt sich rechtliche Anforderungen in technische Features übersetzen lassen.

*Was ich beim nächsten Mal anders mache:* Rechtliche Anforderungen früher klären – am besten vor der ersten Zeile Code.

=== Nicolas Biercher

Das Arbeiten mit Supabase Row Level Security war neu für mich und anfangs ungewohnt, hat sich aber als sehr mächtiges Konzept erwiesen. Statt Zugriffsberechtigungen in der Anwendungslogik zu implementieren, werden sie direkt in der Datenbank durchgesetzt – das reduziert die Angriffsfläche erheblich. Das Deployment über Vercel war unkompliziert und die automatische Preview-URL pro Branch ein echter Produktivitätsgewinn.

*Was ich beim nächsten Mal anders machen:* Datenbankmigrationen von Anfang an versionieren (z.B. mit Supabase Migrations), statt SQL-Skripte manuell im Dashboard auszuführen.

== Ausblick

Keep Growing ist nach Abschluss des Wintersemesters 2026/27 bereit für einen DHBW-internen Pilotbetrieb. Die nächste Gruppe kann nahtlos anknüpfen: Die Codebasis ist sauber dokumentiert, das Repository ist öffentlich zugänglich, und die Roadmap Phase 2 bietet klare Anknüpfungspunkte. Der größte offene Punkt ist der automatische Cron-Push – wer diesen umsetzt, bringt die App auf das nächste Qualitätsniveau.

// ============================================================
// ANHÄNGE
// ============================================================
= Anhang

== A – Glossar

#htable(
  columns: (3.5cm, 1fr),
  hcell[Begriff], hcell[Erklärung],
  [App Router], [Routing-System in Next.js 13+, basierend auf React Server Components und dem `app/`-Verzeichnis],
  [DSGVO], [Datenschutz-Grundverordnung (EU 2016/679) – regelt die Verarbeitung personenbezogener Daten in der EU],
  [Error Boundary], [React-Konzept zum Abfangen von Laufzeitfehlern in Komponentenbäumen; in Next.js via `error.tsx`],
  [Playwright], [Open-Source E2E-Testframework von Microsoft; steuert reale Browser (Chromium, Firefox, WebKit)],
  [PWA], [Progressive Web App – Webanwendung mit nativen App-Features: Homescreen-Install, Offline-Support, Push-Notifications],
  [RLS], [Row Level Security – PostgreSQL-Feature, das Zeilenzugriff direkt auf Datenbankebene einschränkt],
  [Server Action], [Next.js-Feature: TypeScript-Funktion mit `'use server'`-Direktive, aufrufbar direkt aus React-Komponenten],
  [Supabase], [Open-Source Backend-as-a-Service: PostgreSQL, Auth, Storage, Realtime-Subscriptions],
  [VAPID], [Voluntary Application Server Identification – Standard zur Authentifizierung des Push-Servers beim Browser-Push-Service],
  [Vercel], [Cloud-Plattform für Serverless-Deployments; automatische Previews per Git-Branch; optimiert für Next.js],
)

== B – Lokale Entwicklungsumgebung einrichten

```bash
# 1. Repository klonen
git clone https://github.com/Vietnameseguy04/Keep_Growing_App.git
cd Keep_Growing_App/keep-growing

# 2. Abhaengigkeiten installieren
npm install

# 3. .env.local anlegen
# WICHTIG: Diese Datei NICHT ins Repository pushen (.gitignore)
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEp...
VAPID_PRIVATE_KEY=RH7...
VAPID_EMAIL=mailto:keep-growing@dhbw.de
ENVEOF

# 4. Entwicklungsserver starten
npm run dev
# App laeuft auf http://localhost:3000

# 5. Tests ausfuehren
npx playwright test
npx playwright show-report
```

== C – VAPID-Schlüssel generieren

```bash
node -e "
const { generateVAPIDKeys } = require('web-push');
const keys = generateVAPIDKeys();
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
"
```

#infobox(title: "Wichtig")[
  VAPID-Schlüssel sind dauerhaft. Nach der Generierung müssen alle bestehenden Push-Subscriptions in `push_subscriptions` gelöscht werden, wenn die Keys ausgetauscht werden – andernfalls schlagen Push-Versendungen fehl.
]

== D – Supabase SQL-Migration V2.0

```sql
-- Ausfuehren im Supabase SQL Editor
-- Dashboard: Settings > SQL Editor > New Query

CREATE TABLE push_subscriptions (
  user_id      UUID        PRIMARY KEY
               REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscription"
  ON push_subscriptions
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

== E – Eidesstattliche Erklärung

Wir erklären hiermit, dass wir die vorliegende Dokumentation sowie die zugehörige Software selbstständig und nur unter Verwendung der angegebenen Quellen und Hilfsmittel erstellt haben. Die Arbeit wurde in dieser oder ähnlicher Form noch keiner anderen Prüfungsbehörde vorgelegt.

#v(1.5cm)

#grid(
  columns: (1fr, 1fr, 1fr),
  column-gutter: 1cm,
  align(center)[
    #line(length: 100%, stroke: 0.5pt)
    #v(0.3em)
    Anton Nguyen \
    #text(size: 9pt, fill: muted)[Matrikelnr.: \[...\]] \
    #text(size: 9pt, fill: muted)[Datum: \_\_\_\_\_\_\_\_\_]
  ],
  align(center)[
    #line(length: 100%, stroke: 0.5pt)
    #v(0.3em)
    Johannes Appel \
    #text(size: 9pt, fill: muted)[Matrikelnr.: \[...\]] \
    #text(size: 9pt, fill: muted)[Datum: \_\_\_\_\_\_\_\_\_]
  ],
  align(center)[
    #line(length: 100%, stroke: 0.5pt)
    #v(0.3em)
    Nicolas Biercher \
    #text(size: 9pt, fill: muted)[Matrikelnr.: \[...\]] \
    #text(size: 9pt, fill: muted)[Datum: \_\_\_\_\_\_\_\_\_]
  ],
)
