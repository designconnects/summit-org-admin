# Design Summit 2026 – Lieferanten-Formular

Lieferanten bekommen den Link, tragen ihr Design-Team ein, laden am Ende eine
Datei herunter und schicken sie per E-Mail an
**designconnects@delta-sport.com**.

**Link für die Lieferanten:** `https://alexiiio2012.github.io/summit-org/`

Ausgewertet werden die Dateien im eigenen Projekt **summit-org-admin**
(Import, Organigramm, Excel, PDF): `https://alexiiio2012.github.io/summit-org-admin/`

Es wird **nichts automatisch verschickt** und es gibt keinen Server. Die
Eingaben liegen nur im Browser des Lieferanten.

---

## 1. Ablauf für die Lieferanten

1. Link öffnen, **Firmennamen** eingeben, „Start".
2. **Jede Person** erfassen und „Person hinzufügen" drücken. Nur der Name ist
   Pflicht.
3. Oben **„Datei herunterladen"**. Danach erscheint ein Fenster mit der
   Adresse, einem Knopf „E-Mail öffnen" (Empfänger und Betreff sind
   vorausgefüllt) und dem Hinweis, die Datei anzuhängen.

Was dabei hilft:

- **Die Leiste oben** zeigt jederzeit, wie viele Personen erfasst sind und ob
  die Datei schon heruntergeladen wurde. Wird danach noch etwas geändert,
  springt sie auf „Seit dem letzten Download geändert".
- **Vergessene Eingaben:** Steht beim Download noch eine Person im Formular,
  die nicht hinzugefügt wurde, fragt die App nach.
- **Neu laden oder später weitermachen** geht: Firma und Personen bleiben im
  Browser gespeichert.
- „Ändern" neben dem Firmennamen **benennt um** (z. B. bei Tippfehler), legt
  keine zweite Firma an.
- Sprache EN/DE oben rechts, Vorgabe ist Englisch.

**Die Felder:**

| Feld | Pflicht | Inhalt |
|------|---------|--------|
| Name | ja | — |
| E-Mail, Telefon | nein | E-Mail wird auf Plausibilität geprüft |
| Core Categories / product groups | nein | Die **erste** Angabe bestimmt die Gruppe im Organigramm |
| Languages | nein | Vorauswahl German, English, Mandarin |
| 3D Software | nein | Vorauswahl SolidWorks, Rhino 3D, KeyShot |
| 2D Software | nein | Vorauswahl Adobe Photoshop, Illustrator, InDesign |
| AI Software | nein | Vorauswahl Vizcom, Claude, ChatGPT, Google Gemini |
| Team responsible | nein | Wer angehakt ist, steht im Organigramm oben |

Jede Auswahlzeile hat ein Freitextfeld für eigene Einträge.

Die Datei heißt `design-summit-2026_<firma>.json`. Sie enthält nur die Werte,
die tatsächlich ausgewählt sind.

---

## 2. Dateien im Repo

| Datei / Ordner | Zweck |
|----------------|-------|
| `index.html`, `app.css`, `app.js` | Das Formular |
| `sw.js` | Baut den Offline-Speicher der alten iPad-Version ab – siehe unten |
| `fonts/` | Mulish, lokal (SIL Open Font License 1.1) |
| `icons/` | Browser-Symbol |
| `_lokal_testen.ps1` | Testserver für den Windows-Rechner, nicht Teil der App |
| `.nojekyll` | Sorgt dafür, dass GitHub Pages die Ordner unverändert ausliefert |

Es gibt keine Verbindung nach außen: kein CDN, keine Google-Fonts, kein Tracking.

**Zu `sw.js`:** Die frühere iPad-Version hat sich als Offline-App
eingerichtet und die Seite aus einem eigenen Speicher ausgeliefert. Wer sie
einmal geöffnet hat, würde ohne `sw.js` dauerhaft den alten Stand sehen. Die
jetzige `sw.js` räumt das beim nächsten Aufruf ab und lädt die Seite neu.
**Nicht löschen.**

Nach Änderungen an der App ist kein Hochzählen von Versionen mehr nötig –
GitHub Pages liefert direkt aus (ggf. einmal mit Strg+F5 neu laden).

---

## 3. Vor dem Versand testen

Rechtsklick auf `_lokal_testen.ps1` → „Mit PowerShell ausführen". Der Browser
öffnet `http://localhost:8099/`.

Eingaben beim Testen liegen nur in deinem Browser und berühren den Bestand im
Admin-Projekt nicht (eigener Speicher-Schlüssel).
