# Design Summit 2026 – Org Chart Admin

Auswertung der Dateien, die Lieferanten über das Formular
(`https://designconnects.github.io/organizational-chart/`) herunterladen und per Mail an
designconnects@delta-sport.com schicken:

**JSON-Dateien importieren → prüfen und korrigieren → Organigramm ansehen →
Excel und PDF exportieren.**

**Link:** `https://designconnects.github.io/summit-org-admin/`

Die Dateien werden **im Browser** eingelesen und bleiben auf deinem Rechner.
Auf GitHub liegt nur das leere Werkzeug – keine Namen, E-Mails oder
Telefonnummern. Lege die JSON-Dateien deshalb **nicht** ins Repo: eine
GitHub-Pages-Seite ist öffentlich, alles im Repo wäre im Internet abrufbar.

---

## 1. Einrichten auf GitHub (einmalig)

1. Auf GitHub ein neues Repository **`summit-org-admin`** anlegen.
   Den Namen bitte genau so – er ist Teil der Adresse.
2. Den gesamten Inhalt dieses Ordners hochladen (*Add file → Upload files*),
   **mit den Unterordnern** `fonts/`, `icons/` und `vendor/`. Am einfachsten
   den Ordnerinhalt im Explorer markieren und ins Browserfenster ziehen.
3. *Settings → Pages → Branch: `main`, Ordner `/ (root)` → Save*.
   Nach ein bis zwei Minuten ist die Seite unter dem Link oben erreichbar.

**Prüfen:** Die Seite muss oben „Org chart admin" und den Knopf „Import JSON
files" zeigen. Steht dort „Tell us who is on your design team", liegen die
Dateien des Lieferanten-Formulars im falschen Repo.

`.nojekyll` ist optional; die Seite funktioniert auch ohne.

---

## 2. Arbeiten

**Oben in der Leiste:**

- **JSON-Dateien importieren** – alle eingegangenen Dateien auf einmal
  auswählen. Eine Meldung fasst zusammen, wie viele Dateien und Personen
  übernommen wurden, und nennt Dateien, die nicht lesbar waren.
- **Excel** und **PDF** exportieren **nur den ausgewählten Lieferanten**.
  Links neben den Knöpfen steht, für wen („Export: …"). Für einen anderen
  Lieferanten erst unten in der Lieferanten-Leiste umschalten. Hat der
  Lieferant noch keine Personen, sind beide Knöpfe gesperrt.
  - **Excel:** ein Blatt mit den Spalten Lieferant, Name, E-Mail, Telefon,
    Responsible for Design Department, Team responsible, Team / area, Kategorien,
    3D Software, 2D Software, AI Software,
    Sprachen. Lässt sich unverändert wieder importieren. Ältere Excel-Dateien,
    in denen „Team responsible" noch die Abteilungsleitung meinte, werden beim
    Import richtig zugeordnet.
  - **PDF:** eine Seite mit dem Organigramm, oben der Firmenname (auch in
    chinesischer Schrift). Die Seite ist so groß wie das Organigramm, nichts
    wird abgeschnitten. Filter wirken nicht aufs PDF.
  - Dateiname: `Organizational-Chart_<lieferant>.xlsx` bzw. `.pdf`.

**Darunter:** Lieferant auswählen, umbenennen, löschen, neu anlegen.

**Tabs:**

- **Mitglieder** – Personen des gewählten Lieferanten. *Bearbeiten* lädt sie
  links ins Formular, *Löschen* fragt nach. Personen lassen sich auch von
  Hand ergänzen.
- **Organigramm** – Filter nach Kategorie, 3D, 2D, AI, Name; Zoom.
- **Sicherung & Einstellungen** – JSON-Sicherung, Excel-Import,
  Wiederherstellungspunkte, alles löschen.

**Schickt ein Lieferant zweimal** (z. B. nach einer Korrektur), fragt die App
nach: *Zusammenführen* ergänzt nur Personen, die noch fehlen (erkannt über
Name + E-Mail). Geänderte Angaben bereits vorhandener Personen werden dabei
**nicht** überschrieben – dafür die Person im Tab *Mitglieder* bearbeiten
oder vorher löschen und die Datei neu importieren.

---

## 3. Wo die Daten liegen

Im Browser, mit dem du die Seite öffnest. Auf einem anderen Rechner oder in
einem anderen Browser ist der Stand nicht da.

- **Regelmäßig *Sicherung & Einstellungen → Sicherung speichern*.** Die
  Sicherung lässt sich überall wieder importieren.
- Die Lieferanten-Dateien aus dem Postfach sind ein zweites Backup: sie
  lassen sich jederzeit erneut importieren.
- Wiederherstellungspunkte: bei jedem Öffnen und vor jedem Import, die fünf
  neuesten bleiben.
- Rote Hinweise: **„Kein Speicher"** = privater Modus, **„Speicher voll"** =
  letzte Eingaben nicht gespeichert, sofort sichern.

**Bisherige Daten:** Hattest du den früheren Admin-Bereich
`designconnects.github.io/summit-org/?admin` (frühere Adresse des Formulars) benutzt, ist dieser Stand hier
automatisch da – im selben Browser. Beide Projekte liegen unter
`designconnects.github.io` und teilen sich den Browser-Speicher.

Daten unter einer **anderen Adresse** (z. B. der früheren
`alexiiio2012.github.io`) kommen nicht automatisch mit: Der Browser trennt den
Speicher strikt nach Adresse. Dort *Sicherung speichern* und die Datei hier
über *JSON-Dateien importieren* einlesen.

---

## 4. Dateien

| Datei / Ordner | Zweck |
|----------------|-------|
| `index.html`, `app.css`, `app.js` | Das Werkzeug |
| `vendor/` | xlsx (Excel), html2canvas (Bild), jsPDF (PDF) – lokal, kein CDN |
| `fonts/` | Mulish, lokal (SIL Open Font License 1.1) |
| `icons/` | Browser-Symbol |
| `_lokal_testen.ps1` | Testserver für den Windows-Rechner, nicht Teil der App |
| `.nojekyll` | Optional: schaltet die Jekyll-Verarbeitung von GitHub Pages ab |

Lokal testen: Rechtsklick auf `_lokal_testen.ps1` → „Mit PowerShell
ausführen", der Browser öffnet `http://localhost:8099/`.

Falls das Lieferanten-Formular einmal umzieht: die Adresse steht in `app.js`
ganz oben bei `FORM_URL`.

---

## 5. Aufbau des Organigramms

Drei Ebenen, jeweils mit einer Linie verbunden:

1. **Oben** in einem eigenen Rahmen: wer **Responsible for Design Department**
   angehakt hat. Ist niemand markiert, steht dort der Firmenname.
2. **Die Team-Verantwortlichen** (**Team responsible**) links und rechts außen
   neben der Leitung, jeweils mit ihrem Bereich, z. B. „Team responsible ·
   Baumarkt". Jede Karte hängt über eine abgewinkelte Linie an der Leitung; die
   unterste Karte jeder Seite hat einen Strich zum Team-Block. Die erste Hälfte (nach Bereich
   sortiert) steht links, der Rest rechts; mehrere auf einer Seite stehen
   untereinander. Von der Leitung führt außerdem eine Mittellinie direkt zum
   Team-Block. Gibt es keine Team-Verantwortlichen, entfällt diese Ebene.
3. **Der Team-Block** mit allen übrigen Personen als Karten, drei pro Zeile,
   alphabetisch. Bei ein oder zwei Personen entsprechend weniger Spalten.
   Alle Karten sind gleich breit; lange Kategorielisten brechen innerhalb
   ihres Kastens um.

Wer zu welchem Team gehört, wird nicht erfasst – das hält das Formular für die
Lieferanten einfach. Eine Person ist entweder Abteilungsleitung oder
Team-Verantwortliche, nicht beides. Sind mehrere als Abteilungsleitung
markiert, steht die erste oben, die anderen kommen in den Team-Block und
behalten ihre Kennzeichnung.

Nach Kategorien wird nicht gruppiert; die Kategorien stehen in jeder Karte.
Die Spaltenzahl steht in `app.js` bei `TEAM_COLS`.

Filter blenden nicht passende Karten ab, entfernen sie aber nicht. Das PDF
zeigt immer alle Karten voll.
