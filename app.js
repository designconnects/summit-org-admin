/* ============================================================
   Design Summit 2026 – Org Chart Admin
   Wertet die JSON-Dateien aus, die Lieferanten ueber das Formular
   (Projekt summit-org) herunterladen und per Mail schicken:
   importieren, korrigieren, Organigramm ansehen, Excel und PDF
   exportieren, Sicherungen.
   Alle Daten liegen nur im Browser, mit dem die Seite geoeffnet wird.
   Auf GitHub liegt ausschliesslich das Werkzeug.
   ============================================================ */
"use strict";

const APP_VERSION = "1.1";

/* Das Lieferanten-Formular, fuer "Formular oeffnen" und "Link kopieren".
   Beide Repos liegen im selben GitHub-Konto, also wird die Adresse aus der
   eigenen abgeleitet: <konto>.github.io/summit-org-admin/ -> .../summit-org/.
   So stimmt sie auch nach einem Kontowechsel. Nur beim lokalen Testen gilt
   die feste Adresse. */
const FORM_URL = location.hostname.endsWith(".github.io")
  ? location.origin + "/summit-org/"
  : "https://designconnects.github.io/summit-org/";

/* Gleiche Schluessel wie der fruehere Admin-Bereich in summit-org (?admin).
   Beide Projekte liegen unter derselben Adresse (<konto>.github.io) und teilen
   sich deshalb den Browser-Speicher – ein dort angelegter Bestand ist hier
   sofort da. */
const LS_KEY   = "summitOrg.state.v1";
const LS_SNAP  = "summitOrg.snapshots.v1";
const MAX_SNAP = 5;

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const DEFAULT_CATEGORIES = ["DIY & Hardware","Household","Pet Supplies","Kitchen","Furniture","Outdoor & Leisure","Stationery","Toys","Sports","Bags & Luggage","Decoration"];
const DEFAULT_CAD        = ["SolidWorks","Rhino 3D","KeyShot"];
const DEFAULT_2D         = ["Adobe Photoshop","Adobe Illustrator","Adobe InDesign"];
const DEFAULT_AI         = ["Vizcom","Claude","ChatGPT","Google Gemini"];
const DEFAULT_LANGUAGES  = ["German","English","Mandarin"];

/* ============================================================
   1. Sprachen
   ============================================================ */

const STR = {
  /* en, de */
  "app.name":        ["Design Summit 2026", "Design Summit 2026"],
  "app.tag":         ["Org chart admin", "Organigramm-Auswertung"],

  "btn.cancel":      ["Cancel", "Abbrechen"],
  "btn.ok":          ["OK", "OK"],
  "btn.save":        ["Save", "Speichern"],
  "btn.delete":      ["Delete", "Löschen"],
  "btn.edit":        ["Edit", "Bearbeiten"],
  "btn.remove":      ["Remove", "Entfernen"],
  "btn.restore":     ["Restore", "Wiederherstellen"],

  "f.name":          ["Name", "Name"],
  "f.namePh":        ["e.g. Li Wei", "z. B. Li Wei"],
  "f.nameErr":       ["Please enter a name.", "Bitte einen Namen eingeben."],
  "f.email":         ["Email", "E-Mail"],
  "f.emailPh":       ["name@company.com", "name@firma.com"],
  "f.emailErr":      ["This email address looks incomplete.", "Diese E-Mail-Adresse sieht unvollständig aus."],
  "f.phone":         ["Company phone / mobile", "Firmen-Telefon / Mobil"],
  "f.phonePh":       ["+86 21 1234 5678", "+86 21 1234 5678"],
  "f.cats":          ["Core Categories / product groups", "Kern-Kategorien / Warengruppen"],
  "f.catsPh":        ["Add another category…", "Weitere Kategorie…"],
  "f.langs":         ["Languages", "Sprachen"],
  "f.langsPh":       ["Add another language…", "Weitere Sprache…"],
  "f.cad":           ["3D Software", "3D-Software"],
  "f.cadPh":         ["Add more Software…", "Weitere Software…"],
  "f.twoD":          ["2D Software", "2D-Software"],
  "f.twoDPh":        ["Add more Software…", "Weitere Software…"],
  "f.ai":            ["AI Software", "AI-Software"],
  "f.aiPh":          ["Add more Software…", "Weitere Software…"],
  "f.optional":      ["optional", "optional"],
  "f.lead":          ["Team responsible", "Teamverantwortlich"],
  "f.leadHelp":      ["Without this check the person is placed as a member below the team responsible.", "Ohne diesen Haken wird die Person als Mitglied unter dem Teamverantwortlichen eingeordnet."],
  "f.addTitle":      ["Add", "Hinzufügen"],

  "a.title":         ["Admin", "Admin"],
  "a.sup1":          ["1 supplier", "1 Lieferant"],
  "a.supN":          ["{n} suppliers", "{n} Lieferanten"],
  "a.emp1":          ["1 person", "1 Person"],
  "a.empN":          ["{n} people", "{n} Personen"],
  "a.totalsNone":    ["No data yet — import the JSON files from your suppliers.", "Noch keine Daten — JSON-Dateien der Lieferanten importieren."],
  "a.openForm":      ["Open supplier form", "Lieferanten-Formular öffnen"],
  "a.copyLink":      ["Copy supplier link", "Lieferanten-Link kopieren"],
  "a.linkCopied":    ["Link copied — send it to your suppliers.", "Link kopiert — einfach an die Lieferanten schicken."],
  "a.linkCopyFail":  ["Copy failed. The link is: {url}", "Kopieren fehlgeschlagen. Der Link lautet: {url}"],
  "a.supplier":      ["Supplier", "Lieferant"],
  "a.rename":        ["Rename", "Umbenennen"],
  "a.delete":        ["Delete", "Löschen"],
  "a.add":           ["+ Add", "+ Anlegen"],
  "a.newSupplierPh": ["New supplier, e.g. Sunrise", "Neuer Lieferant, z. B. Sunrise"],
  "a.nMembers":      ["{n} members", "{n} Mitglieder"],
  "a.tabMembers":    ["Members", "Mitglieder"],
  "a.tabChart":      ["Org chart", "Organigramm"],
  "a.tabData":       ["Backup & settings", "Sicherung & Einstellungen"],
  "a.addMember":     ["Add member", "Mitglied hinzufügen"],
  "a.editMember":    ["Edit member", "Mitglied bearbeiten"],
  "a.addMemberSub":  ["Person, categories and software", "Person, Kategorien und Software"],
  "a.saveMember":    ["Save member", "Mitglied speichern"],
  "a.saveChanges":   ["Save changes", "Änderungen speichern"],
  "a.overview":      ["Supplier overview", "Lieferanten-Übersicht"],
  "a.overviewSub":   ["All recorded people for the selected supplier", "Alle erfassten Personen des gewählten Lieferanten"],
  "a.noMembers1":    ["No members yet", "Noch keine Mitglieder"],
  "a.noMembers2":    ["Add the first person on the left to start the org chart.", "Links die erste Person erfassen, um das Organigramm zu starten."],
  "a.noSupplier1":   ["No supplier yet", "Noch kein Lieferant"],
  "a.noSupplier2":   ["Use “Import JSON files” above to load the files your suppliers sent you.", "Oben über „JSON-Dateien importieren“ die Dateien der Lieferanten laden."],
  "a.noChart1":      ["No org chart yet", "Noch kein Organigramm"],
  "a.noChart2":      ["Add people under “Members” first.", "Zuerst unter „Mitglieder“ Personen erfassen."],

  "a.fCat":          ["Category", "Kategorie"],
  "a.fCad":          ["3D", "3D"],
  "a.f2d":           ["2D", "2D"],
  "a.fAi":           ["AI", "AI"],
  "a.fSearch":       ["Search", "Suche"],
  "a.fSearchPh":     ["Name…", "Name…"],
  "a.fView":         ["View", "Ansicht"],
  "a.fit":           ["Fit", "Einpassen"],
  "a.all":           ["All", "Alle"],
  "legend.lead":     ["Team responsible", "Teamverantwortlich"],
  "legend.cad":      ["3D Software", "3D-Software"],
  "legend.twod":     ["2D Software", "2D-Software"],
  "legend.ai":       ["AI Software", "AI-Software"],
  "legend.lang":     ["Languages", "Sprachen"],
  "chart.sub":       ["ORGANISATION CHART · DESIGN", "ORGANIGRAMM · DESIGN"],
  "chart.role":      ["Team responsible", "Teamverantwortlich"],

  "a.autosaveText":  ["Stored in this browser automatically.", "Wird automatisch in diesem Browser gespeichert."],
  "a.lastSaved":     ["Last saved: {time}", "Zuletzt gespeichert: {time}"],
  "a.storageWarnTag":["No storage", "Kein Speicher"],
  "a.storageWarnText":["This browser blocks local storage (private mode?). Entries live only until the tab closes — export a JSON backup regularly.","Dieser Browser blockiert den lokalen Speicher (privater Modus?). Einträge bestehen nur bis zum Schließen des Tabs — bitte regelmäßig ein JSON-Backup exportieren."],
  /* Getrennt vom Fall oben: hier ist Speicher grundsaetzlich da, aber voll.
     Andere Ursache, andere Abhilfe – deshalb ein eigener Text. */
  "a.quotaTag":      ["Storage full", "Speicher voll"],
  "a.quotaText":     ["The storage of this browser is full — the last entries could NOT be saved. Export a JSON backup now, then delete old restore points or suppliers you no longer need.","Der Speicher dieses Browsers ist voll — die letzten Eingaben konnten NICHT gespeichert werden. Jetzt eine JSON-Sicherung exportieren, danach alte Wiederherstellungspunkte oder nicht mehr benötigte Lieferanten löschen."],

  "a.excelB":        ["Excel", "Excel"],
  "a.pdfB":          ["PDF – all suppliers", "PDF – alle Lieferanten"],
  "a.jsonT":         ["JSON backup", "JSON-Sicherung"],
  "a.jsonS":         ["Full state including all suppliers — can be imported again later, also in another browser.", "Vollständiger Stand mit allen Lieferanten — lässt sich später wieder importieren, auch in einem anderen Browser."],
  "a.jsonT2":        ["Save everything", "Alles sichern"],
  "a.jsonB":         ["Save backup", "Sicherung speichern"],
  "a.forwardB":      ["Only this supplier", "Nur dieser Lieferant"],
  "a.import":        ["Other imports", "Weitere Importe"],
  "a.impJsonT":      ["JSON files from suppliers", "JSON-Dateien der Lieferanten"],
  "a.impJsonS":      ["Select several files at once. Suppliers already in the list are merged, people already present are skipped.", "Mehrere Dateien auf einmal auswählen. Vorhandene Lieferanten werden zusammengeführt, vorhandene Personen übersprungen."],
  "a.impJsonB":      ["Import JSON files", "JSON-Dateien importieren"],
  "a.impExcelT":     ["Excel / CSV file", "Excel- / CSV-Datei"],
  "a.impExcelS":     ["Recognises German and English column headers, including files exported here.", "Erkennt deutsche und englische Spaltenüberschriften, auch hier exportierte Dateien."],
  "a.impExcelB":     ["Import Excel", "Excel importieren"],

  "a.snapT":         ["Restore points", "Wiederherstellungspunkte"],
  "a.snapS":         ["Automatically created on every start and before every import. The five most recent are kept.", "Werden bei jedem Öffnen und vor jedem Import automatisch angelegt. Die fünf neuesten bleiben erhalten."],
  "a.snapNone":      ["No restore points yet.", "Noch keine Wiederherstellungspunkte."],
  "a.snapInfo":      ["{sup} supplier(s), {emp} people", "{sup} Lieferant(en), {emp} Personen"],
  "a.snapStart":     ["App start", "App-Start"],
  "a.snapImport":    ["Before import", "Vor Import"],
  "a.snapManual":    ["Manual", "Manuell"],
  "a.snapConfirm":   ["Restore this state? The current state will be overwritten — a restore point is created beforehand.", "Diesen Stand wiederherstellen? Der aktuelle Stand wird überschrieben — vorher wird ein Wiederherstellungspunkt angelegt."],

  "a.settings":      ["Settings", "Einstellungen"],
  "a.wipeT":         ["Delete all data", "Alle Daten löschen"],
  "a.wipeS":         ["Removes every supplier and person from this browser. Save a backup first.", "Entfernt alle Lieferanten und Personen aus diesem Browser. Vorher eine Sicherung speichern."],
  "a.wipeB":         ["Reset", "Zurücksetzen"],
  "a.aboutT":        ["Version", "Version"],

  "c.delMemberT":    ["Delete person", "Person löschen"],
  "c.delMemberX":    ["Remove “{name}” from the list?", "„{name}“ von der Liste entfernen?"],
  "c.delSupT":       ["Delete supplier", "Lieferant löschen"],
  "c.delSupX":       ["Delete “{name}” including all {n} people? This cannot be undone.", "„{name}“ samt aller {n} Personen löschen? Das kann nicht rückgängig gemacht werden."],
  "c.renameT":       ["Rename supplier", "Lieferant umbenennen"],
  "c.mergeT":        ["Supplier already exists", "Lieferant existiert bereits"],
  "c.mergeX":        ["Already in your list: {names}. Merge the file into these existing entries? People who are already there stay untouched, only new ones are added. Cancel imports nothing.","Schon in Ihrer Liste: {names}. Die Datei in diese bestehenden Einträge zusammenführen? Bereits vorhandene Personen bleiben unverändert, nur neue kommen hinzu. Abbrechen importiert nichts."],
  "c.mergeB":        ["Merge", "Zusammenführen"],
  "c.wipeT":         ["Reset app", "App zurücksetzen"],
  "c.wipeX":         ["Really delete all suppliers and people from this browser?", "Wirklich alle Lieferanten und Personen aus diesem Browser löschen?"],

  "t.added":         ["{name} added.", "{name} hinzugefügt."],
  "t.changed":       ["Changes saved.", "Änderungen gespeichert."],
  "t.deleted":       ["Deleted.", "Gelöscht."],
  "t.supAdded":      ["Supplier “{name}” created.", "Lieferant „{name}“ angelegt."],
  "t.needSupplier":  ["Please create a supplier first.", "Bitte zuerst einen Lieferanten anlegen."],
  "t.noData":        ["Nothing to export yet.", "Noch nichts zu exportieren."],
  "t.noChart":       ["No org chart to export.", "Kein Organigramm zum Exportieren."],
  "t.excelOk":       ["Excel exported — {n} supplier(s).", "Excel exportiert — {n} Lieferant(en)."],
  "t.csvOk":         ["Exported as CSV.", "Als CSV exportiert."],
  "t.pdfWait":       ["Creating PDF… {i} of {n}", "PDF wird erstellt… {i} von {n}"],
  "t.pdfOk":         ["PDF exported — {n} suppliers, one page each.", "PDF exportiert — {n} Lieferanten, je eine Seite."],
  "t.pdfSkipped":    ["Skipped (no people): {names}", "Ausgelassen (keine Personen): {names}"],
  "t.pdfFail":       ["PDF failed — opening the print dialog instead.", "PDF fehlgeschlagen — Druckdialog wird geöffnet."],
  "t.jsonOk":        ["Backup saved.", "Sicherung gespeichert."],
  "t.fwdOk":         ["File created for “{name}”.", "Datei für „{name}“ erstellt."],
  "t.impOk":         ["{n} supplier(s) imported.", "{n} Lieferant(en) importiert."],
  "t.impOne":        ["Supplier “{name}” imported.", "Lieferant „{name}“ importiert."],
  "t.impFail":       ["Could not read the file.", "Die Datei konnte nicht gelesen werden."],
  "t.impExcelOk":    ["{n} people imported from Excel ({s} supplier(s)).", "{n} Personen aus Excel importiert ({s} Lieferant(en))."],
  "t.impExcelNone":  ["No usable rows found.", "Keine verwertbaren Zeilen gefunden."],
  "t.impMerged":     ["Merged: {added} people added, {skipped} already present.", "Zusammengeführt: {added} Personen ergänzt, {skipped} waren schon vorhanden."],
  "t.impCancelled":  ["Import cancelled — nothing changed.", "Import abgebrochen — nichts geändert."],
  "t.impBatch":      ["{ok} of {n} files imported: {added} people added, {skipped} already present.", "{ok} von {n} Dateien importiert: {added} Personen ergänzt, {skipped} waren schon vorhanden."],
  "t.impBatchFail":  ["Could not read: {files}", "Nicht lesbar: {files}"],
  "t.xlsxMissing":   ["Excel library not available.", "Excel-Bibliothek nicht verfügbar."],
  "t.snapOk":        ["State restored.", "Stand wiederhergestellt."],
  "t.wiped":         ["App reset.", "App zurückgesetzt."],
  "t.shared":        ["File handed to the share sheet.", "Datei an das Teilen-Menü übergeben."],

  "x.supplier":      ["Supplier", "Lieferant"],
  "x.name":          ["Name", "Name"],
  "x.email":         ["Email", "E-Mail"],
  "x.phone":         ["Phone / Mobile", "Telefon / Mobil"],
  "x.lead":          ["Team responsible", "Teamverantwortlich"],
  "x.cats":          ["Categories", "Kategorien"],
  "x.cad":           ["3D Software", "3D-Software"],
  "x.twoD":          ["2D Software", "2D-Software"],
  "x.ai":            ["AI Software", "AI-Software"],
  "x.langs":         ["Languages", "Sprachen"],
  "x.yes":           ["Yes", "Ja"],
  "x.allSuppliers":  ["All suppliers", "Alle Lieferanten"]
};

let LANG = "en";

function t(key, vars) {
  const row = STR[key];
  let s = row ? (LANG === "de" ? row[1] : row[0]) : key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(String(vars[k]));
  return s;
}

function applyI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(n => { n.textContent = t(n.getAttribute("data-i18n")); });
  document.querySelectorAll("[data-i18n-ph]").forEach(n => { n.placeholder = t(n.getAttribute("data-i18n-ph")); });
  document.querySelectorAll(".langsw button").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
  $("orgSub").textContent = t("chart.sub");
}

/* ============================================================
   2. Zustand & Persistenz
   ============================================================ */

function defaultStore() {
  return {
    v: 1,
    availableCategories: [...DEFAULT_CATEGORIES],
    availableCad: [...DEFAULT_CAD],
    available2d: [...DEFAULT_2D],
    availableAi: [...DEFAULT_AI],
    availableLanguages: [...DEFAULT_LANGUAGES],
    suppliers: [],
    currentSupplierId: null,
    settings: { lang: "en" },
    savedAt: null
  };
}

let store = defaultStore();
let storageOK = true;
let storageFail = "blocked";   // blocked = privater Modus | quota = Speicher voll
let lastSavedAt = null;

function lsGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
function lsSet(key, val) { try { window.localStorage.setItem(key, val); return true; } catch (e) { return false; } }

function probeStorage() {
  try {
    window.localStorage.setItem("__probe", "1");
    window.localStorage.removeItem("__probe");
    return true;
  } catch (e) { return false; }
}

function loadState() {
  const raw = lsGet(LS_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.suppliers)) return;
    store = Object.assign(defaultStore(), d);
    store.settings = Object.assign(defaultStore().settings, d.settings || {});
    // Migration: Staende vor dem AI-Feld haben keinen availableAi-Pool. Object.assign
    // laesst den Default stehen, ein explizit leeres Array im Altstand aber nicht –
    // deshalb hier noch einmal absichern.
    if (!Array.isArray(store.availableAi) || !store.availableAi.length) store.availableAi = [...DEFAULT_AI];
    store.suppliers = d.suppliers.map(s => ({
      id: s.id || uid("sup"),
      name: s.name || "",
      employees: (s.employees || []).map(normEmp)
    }));
    if (!store.suppliers.some(s => s.id === store.currentSupplierId)) {
      store.currentSupplierId = store.suppliers[0] ? store.suppliers[0].id : null;
    }
    lastSavedAt = d.savedAt || null;
  } catch (e) { /* defekter Eintrag – mit Defaults weiterarbeiten */ }
}

let _saveT = null;
function saveState(immediate) {
  clearTimeout(_saveT);
  const run = () => {
    store.savedAt = new Date().toISOString();
    const ok = lsSet(LS_KEY, JSON.stringify(store));
    if (ok) { lastSavedAt = store.savedAt; renderSaveInfo(); return; }
    // Schreiben fehlgeschlagen. Das darf NICHT still bleiben: sonst tippt man
    // weiter und haelt den Stand fuer gesichert, waehrend nur noch der
    // Zeitstempel oben stehen bleibt. probeStorage() hat beim Start funktioniert,
    // also ist Speicher grundsaetzlich da und jetzt voll – eigener Text dafuer.
    storageOK = false;
    storageFail = "quota";
    renderSaveInfo();
    if (!saveState._warned) { saveState._warned = true; toast(t("a.quotaText")); }
  };
  if (immediate) run(); else _saveT = setTimeout(run, 250);
}

/* ---- Wiederherstellungspunkte ---- */
function readSnaps() {
  try { const a = JSON.parse(lsGet(LS_SNAP) || "[]"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function addSnapshot(kind) {
  if (!store.suppliers.length) return;
  const snaps = readSnaps();
  const payload = JSON.stringify({
    availableCategories: store.availableCategories,
    availableCad: store.availableCad,
    available2d: store.available2d,
    availableAi: store.availableAi,
    availableLanguages: store.availableLanguages,
    suppliers: store.suppliers
  });
  const last = snaps[0];
  if (last && last.payload === payload) return;      // nichts geaendert
  snaps.unshift({
    ts: new Date().toISOString(),
    kind: kind,
    sup: store.suppliers.length,
    emp: store.suppliers.reduce((n, s) => n + s.employees.length, 0),
    payload: payload
  });
  lsSet(LS_SNAP, JSON.stringify(snaps.slice(0, MAX_SNAP)));
}
function restoreSnapshot(i) {
  const snaps = readSnaps();
  const s = snaps[i];
  if (!s) return;
  confirmSheet(t("a.snapT"), t("a.snapConfirm"), () => {
    addSnapshot("manual");
    try {
      const d = JSON.parse(s.payload);
      store.availableCategories = d.availableCategories || [...DEFAULT_CATEGORIES];
      store.availableCad        = d.availableCad || [...DEFAULT_CAD];
      store.available2d         = d.available2d || [...DEFAULT_2D];
      store.availableAi         = d.availableAi || [...DEFAULT_AI];
      store.availableLanguages  = d.availableLanguages || [...DEFAULT_LANGUAGES];
      store.suppliers           = (d.suppliers || []).map(x => ({ id: x.id, name: x.name, employees: (x.employees || []).map(normEmp) }));
      store.currentSupplierId   = store.suppliers[0] ? store.suppliers[0].id : null;
      resetDraft();
      saveState(true);
      renderAll();
      toast(t("t.snapOk"));
    } catch (e) { toast(t("t.impFail")); }
  });
}

/* ============================================================
   3. Helfer
   ============================================================ */

function $(id) { return document.getElementById(id); }
function el(tag, cls, txt) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt != null) n.textContent = txt;
  return n;
}
function uid(prefix) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 11; i++) s += c[Math.floor(Math.random() * c.length)];
  return prefix + "_" + s;
}
function curSup() { return store.suppliers.find(s => s.id === store.currentSupplierId) || null; }
function nameOr(n) { n = (n || "").trim(); return n === "" ? "—" : n; }
/* Dateinamen-Baustein. \p{L}/\p{N} statt \w, weil \w nur ASCII kennt: ein
   chinesischer Firmenname wurde dadurch komplett weggestrippt und alle
   Exportdateien hiessen gleich ("supplier"), also ueberschrieben sich. */
function slug(s) {
  const base = (s || "").normalize("NFC")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return base || "supplier";
}
function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(LANG === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function toggleIn(arr, v) { const i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }

function toast(msg, ms) {
  const n = $("toast");
  n.textContent = msg;
  n.classList.add("show");
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove("show"), ms || 2800);
}

/* ---- Modal statt confirm()/prompt() ---- */
let _modalOk = null, _modalCancel = null;
function closeModal() { $("modal").classList.add("hidden"); _modalOk = null; _modalCancel = null; }
/* Abbrechen soll beim Import eine Rueckmeldung geben koennen ("nichts geaendert"),
   deshalb ein optionaler onCancel. closeModal loescht beide Callbacks, damit der
   OK-Weg nicht zusaetzlich den Cancel-Weg ausloest. */
function cancelModal() { const c = _modalCancel; closeModal(); if (c) c(); }
function confirmSheet(title, text, onOk, okLabel, onCancel) {
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  $("modalInputWrap").classList.add("hidden");
  $("modalOk").textContent = okLabel || t("btn.ok");
  $("modalCancel").textContent = t("btn.cancel");
  _modalOk = () => { closeModal(); onOk(); };
  _modalCancel = onCancel || null;
  $("modal").classList.remove("hidden");
}
function promptSheet(title, value, onOk) {
  $("modalTitle").textContent = title;
  $("modalText").textContent = "";
  $("modalInputWrap").classList.remove("hidden");
  $("modalInput").value = value || "";
  $("modalOk").textContent = t("btn.save");
  $("modalCancel").textContent = t("btn.cancel");
  _modalOk = () => { const v = $("modalInput").value; closeModal(); onOk(v); };
  _modalCancel = null;
  $("modal").classList.remove("hidden");
  setTimeout(() => $("modalInput").focus(), 60);
}
$("modalCancel").onclick = cancelModal;
$("modalOk").onclick = () => { if (_modalOk) _modalOk(); };
$("modalInput").addEventListener("keydown", e => { if (e.key === "Enter" && _modalOk) _modalOk(); });

/* ---- Datei ausliefern: auf iOS ueber das Teilen-Menue, sonst Download ---- */
async function deliverFile(blob, filename, mime) {
  const type = mime || blob.type || "application/octet-stream";
  if (IS_IOS && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return "shared";
      }
    } catch (e) {
      if (e && e.name === "AbortError") return "aborted";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  return "downloaded";
}

function normEmp(x) {
  let langs = Array.isArray(x.languages) ? x.languages : [];
  if (!langs.length && x.english === true) langs = ["English"];
  return {
    name: x.name || "",
    email: x.email || "",
    phone: x.phone || "",
    categories: Array.isArray(x.categories) ? x.categories : [],
    cad: Array.isArray(x.cad) ? x.cad : [],
    twoD: Array.isArray(x.twoD) ? x.twoD : [],
    // Datensaetze aus der Zeit vor dem AI-Feld bekommen eine leere Liste
    ai: Array.isArray(x.ai) ? x.ai : [],
    languages: langs,
    isLead: !!x.isLead,
    id: x.id || uid("emp")
  };
}
function cleanEmp(supId) {
  return e => ({
    name: e.name, email: e.email || "", phone: e.phone || "",
    categories: e.categories || [], cad: e.cad || [], twoD: e.twoD || [], ai: e.ai || [],
    languages: e.languages || [], isLead: !!e.isLead, supplierId: supId, id: e.id
  });
}
function mergePools(cats, cads, twoDs, ais, langs) {
  (cats || []).forEach(c => { if (c && !store.availableCategories.includes(c)) store.availableCategories.push(c); });
  (cads || []).forEach(c => { if (c && !store.availableCad.includes(c)) store.availableCad.push(c); });
  (twoDs || []).forEach(c => { if (c && !store.available2d.includes(c)) store.available2d.push(c); });
  (ais || []).forEach(c => { if (c && !store.availableAi.includes(c)) store.availableAi.push(c); });
  (langs || []).forEach(c => { if (c && !store.availableLanguages.includes(c)) store.availableLanguages.push(c); });
}

/* ============================================================
   4. Formular fuer Personen
   ============================================================ */

function blankDraft() {
  return { name: "", email: "", phone: "", categories: [], cad: [], twoD: [], ai: [], languages: [], isLead: false };
}
let draft = blankDraft();
let editingId = null;
let formHost = null;
let FE = null;                        // Referenzen auf die Formularelemente

function resetDraft() { draft = blankDraft(); editingId = null; }

function buildMemberForm() {
  const wrap = el("div", "mform");
  FE = {};

  const textField = (key, phKey, type, extra) => {
    const f = el("div", "field");
    const lab = el("label", "flabel", t(key));
    if (extra && extra.optional) lab.appendChild(el("span", "opt", t("f.optional")));
    const inp = document.createElement("input");
    inp.type = type; inp.placeholder = t(phKey);
    if (extra) Object.assign(inp, extra.attrs || {});
    lab.htmlFor = inp.id = "fld_" + key.replace(/\W/g, "");
    f.appendChild(lab); f.appendChild(inp);
    wrap.appendChild(f);
    return { field: f, input: inp };
  };

  const nameF = textField("f.name", "f.namePh", "text", { attrs: { autocapitalize: "words", autocomplete: "off" } });
  FE.name = nameF.input;
  FE.nameErr = el("div", "err", t("f.nameErr"));
  nameF.field.appendChild(FE.nameErr);

  const mailF = textField("f.email", "f.emailPh", "email", {
    optional: true, attrs: { autocapitalize: "off", autocorrect: "off", spellcheck: false, inputMode: "email", autocomplete: "off" }
  });
  FE.email = mailF.input;
  FE.emailErr = el("div", "err", t("f.emailErr"));
  mailF.field.appendChild(FE.emailErr);

  FE.phone = textField("f.phone", "f.phonePh", "tel", { optional: true, attrs: { inputMode: "tel", autocomplete: "off" } }).input;

  const pillGroup = (labelKey, phKey, poolKey, draftKey, extraCls) => {
    const f = el("div", "field");
    const lab = el("label", "flabel", t(labelKey));
    lab.appendChild(el("span", "opt", t("f.optional")));
    const pills = el("div", "pills");
    const row = el("div", "add-row");
    const inp = document.createElement("input");
    inp.type = "text"; inp.placeholder = t(phKey); inp.autocomplete = "off";
    const add = el("button", "add-btn", "+");
    add.type = "button"; add.title = t("f.addTitle"); add.setAttribute("aria-label", t("f.addTitle"));
    const commit = () => {
      const v = inp.value.trim();
      if (!v) return;
      if (!store[poolKey].includes(v)) store[poolKey].push(v);
      if (!draft[draftKey].includes(v)) draft[draftKey].push(v);
      inp.value = "";
      renderFormState(); renderFilters(); saveState();
    };
    add.onclick = commit;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); commit(); } });
    row.appendChild(inp); row.appendChild(add);
    f.appendChild(lab); f.appendChild(pills); f.appendChild(row);
    wrap.appendChild(f);
    return { pills, poolKey, draftKey, extraCls };
  };

  FE.groups = [
    pillGroup("f.cats",  "f.catsPh",  "availableCategories", "categories", ""),
    pillGroup("f.langs", "f.langsPh", "availableLanguages",  "languages",  ""),
    pillGroup("f.cad",   "f.cadPh",   "availableCad",        "cad",        "cad"),
    pillGroup("f.twoD",  "f.twoDPh",  "available2d",         "twoD",       "twod"),
    pillGroup("f.ai",    "f.aiPh",    "availableAi",         "ai",         "ai")
  ];

  const lead = el("div", "lead-box");
  const cb = el("span", "cb");
  cb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  lead.appendChild(cb);
  lead.appendChild(el("span", "txt", t("f.lead")));
  lead.setAttribute("role", "checkbox");
  lead.onclick = () => { draft.isLead = !draft.isLead; renderFormState(); };
  wrap.appendChild(lead);
  wrap.appendChild(el("div", "help", t("f.leadHelp")));
  FE.lead = lead;

  FE.name.oninput  = e => { draft.name = e.target.value; if (draft.name.trim()) FE.nameErr.classList.remove("show"); };
  FE.email.oninput = e => { draft.email = e.target.value; FE.emailErr.classList.remove("show"); };
  FE.phone.oninput = e => { draft.phone = e.target.value; };

  return wrap;
}

function mountForm(host) {
  formHost = host;
  const f = buildMemberForm();
  host.innerHTML = "";
  host.appendChild(f);
  renderFormState();
}

function renderFormState() {
  if (!FE) return;
  FE.name.value  = draft.name;
  FE.email.value = draft.email || "";
  FE.phone.value = draft.phone || "";
  FE.groups.forEach(g => {
    g.pills.innerHTML = "";
    const pool = store[g.poolKey];
    const sel  = draft[g.draftKey];
    // ausgewaehlte Werte, die (noch) nicht im Pool stehen, trotzdem anzeigen
    const items = pool.concat(sel.filter(v => !pool.includes(v)));
    items.forEach(v => {
      const b = el("button", "pill " + g.extraCls + (sel.includes(v) ? " on" : ""), v);
      b.type = "button";
      b.setAttribute("aria-pressed", sel.includes(v) ? "true" : "false");
      b.onclick = () => { toggleIn(sel, v); renderFormState(); };
      g.pills.appendChild(b);
    });
  });
  FE.lead.classList.toggle("on", !!draft.isLead);
  FE.lead.setAttribute("aria-checked", draft.isLead ? "true" : "false");
  syncFormLabels();
}

function syncFormLabels() {
  const editing = !!editingId;
  $("aSubmit").textContent   = t(editing ? "a.saveChanges" : "a.saveMember");
  $("aFormTitle").textContent = t(editing ? "a.editMember" : "a.addMember");
}

/* ---- Speichern ---- */
function validateDraft() {
  draft.name = FE.name.value.trim();
  draft.email = (FE.email.value || "").trim();
  draft.phone = (FE.phone.value || "").trim();
  if (!draft.name) {
    FE.nameErr.classList.add("show");
    FE.name.focus();
    FE.name.scrollIntoView({ block: "center", behavior: "smooth" });
    return false;
  }
  if (draft.email && !isEmail(draft.email)) {
    FE.emailErr.classList.add("show");
    FE.email.focus();
    FE.email.scrollIntoView({ block: "center", behavior: "smooth" });
    return false;
  }
  return true;
}

function commitDraft(sup) {
  mergePools(draft.categories, draft.cad, draft.twoD, draft.ai, draft.languages);
  const existing = editingId ? sup.employees.find(x => x.id === editingId) : null;
  if (existing) {
    Object.assign(existing, {
      name: draft.name, email: draft.email, phone: draft.phone,
      categories: [...draft.categories], cad: [...draft.cad], twoD: [...draft.twoD],
      ai: [...draft.ai], languages: [...draft.languages], isLead: draft.isLead
    });
    return { emp: existing, isNew: false };
  }
  const emp = {
    name: draft.name, email: draft.email, phone: draft.phone,
    categories: [...draft.categories], cad: [...draft.cad], twoD: [...draft.twoD],
    ai: [...draft.ai], languages: [...draft.languages], isLead: draft.isLead, id: uid("emp")
  };
  sup.employees.push(emp);
  return { emp, isNew: true };
}

/* ============================================================
   5. Personenkarten, Bearbeiten, Loeschen
   ============================================================ */

function memberCard(emp) {
  const row = el("div", "member" + (emp.isLead ? " is-lead" : ""));
  const main = el("div", "m-main");
  main.appendChild(el("div", "m-name", nameOr(emp.name)));
  if (emp.email) main.appendChild(el("div", "m-meta", emp.email));
  if (emp.phone) main.appendChild(el("div", "m-meta", emp.phone));
  const tags = el("div", "m-tags");
  if (emp.isLead) tags.appendChild(el("span", "tag lead", t("chart.role")));
  (emp.languages || []).forEach(v => tags.appendChild(el("span", "tag lang", v)));
  (emp.categories || []).forEach(v => tags.appendChild(el("span", "tag cat", v)));
  (emp.cad || []).forEach(v => tags.appendChild(el("span", "tag cad", v)));
  (emp.twoD || []).forEach(v => tags.appendChild(el("span", "tag twod", v)));
  (emp.ai || []).forEach(v => tags.appendChild(el("span", "tag ai", v)));
  if (tags.childNodes.length) main.appendChild(tags);
  row.appendChild(main);
  return row;
}

function emptyBox(k1, k2) {
  const b = el("div", "empty");
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  b.appendChild(el("div", "e1", t(k1)));
  b.appendChild(el("div", "e2", t(k2)));
  return b;
}

function sortedEmployees(sup) {
  return sup.employees.slice().sort((a, b) => {
    if (!!a.isLead !== !!b.isLead) return a.isLead ? -1 : 1;
    return nameOr(a.name).localeCompare(nameOr(b.name));
  });
}

function startEdit(id) {
  const sup = curSup();
  const e = sup && sup.employees.find(x => x.id === id);
  if (!e) return;
  editingId = id;
  draft = {
    name: e.name || "", email: e.email || "", phone: e.phone || "",
    categories: [...(e.categories || [])], cad: [...(e.cad || [])], twoD: [...(e.twoD || [])],
    ai: [...(e.ai || [])], languages: [...(e.languages || [])], isLead: !!e.isLead
  };
  adminTab("members");
  mountForm($("aFormHost"));
  $("aFormHost").scrollIntoView({ block: "start", behavior: "smooth" });
  renderFormState();
}

function askDelete(id) {
  const sup = curSup();
  const e = sup && sup.employees.find(x => x.id === id);
  if (!e) return;
  confirmSheet(t("c.delMemberT"), t("c.delMemberX", { name: nameOr(e.name) }), () => {
    sup.employees = sup.employees.filter(x => x.id !== id);
    if (editingId === id) resetDraft();
    saveState(true);
    renderFormState();
    renderAdmin();
    toast(t("t.deleted"));
  }, t("btn.delete"));
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch (e) { /* weiter mit dem Rueckfall */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

/* ============================================================
   6. Admin
   ============================================================ */

/* Nach jeder Datenaenderung: Leiste, Liste, Summen und Diagramm neu zeichnen */
function renderAdmin() { renderSupplierBar(); renderAdminTeam(); renderTotals(); renderChart(); }

function adminTab(which) {
  $("tabMembers").classList.toggle("active", which === "members");
  $("tabChart").classList.toggle("active", which === "chart");
  $("tabData").classList.toggle("active", which === "data");
  $("adminMembers").classList.toggle("hidden", which !== "members");
  $("adminChart").classList.toggle("hidden", which !== "chart");
  $("adminData").classList.toggle("hidden", which !== "data");
  if (which === "members" && formHost !== $("aFormHost")) mountForm($("aFormHost"));
  if (which === "chart") { renderChart(); }
  if (which === "data") renderSnapList();
}

function openAdmin() {
  if (!curSup() && store.suppliers.length) store.currentSupplierId = store.suppliers[0].id;
  mountForm($("aFormHost"));
  adminTab("members");
  renderSupplierBar();
  renderAdminTeam();
  renderTotals();
  renderFilters();
  renderSaveInfo();
  renderSettings();
  renderSnapList();
}

/* Gesamtzahl in der Aktionsleiste – zeigt nach einem Import sofort, ob alles da ist */
function renderTotals() {
  const sup = store.suppliers.length;
  const emp = store.suppliers.reduce((n, s) => n + s.employees.length, 0);
  const n = (k, v) => v === 1 ? t(k + "1") : t(k + "N", { n: v });
  $("totals").textContent = sup ? n("a.sup", sup) + " · " + n("a.emp", emp) : t("a.totalsNone");
}

async function copySupplierLink() {
  const ok = await copyText(FORM_URL);
  toast(ok ? t("a.linkCopied") : t("a.linkCopyFail", { url: FORM_URL }));
}

function renderSaveInfo() {
  $("lastSaved").textContent = lastSavedAt ? t("a.lastSaved", { time: fmtTime(lastSavedAt) }) : "";
  $("storageWarn").classList.toggle("hidden", storageOK);
  // Zwei verschiedene Ursachen, zwei verschiedene Texte
  const quota = storageFail === "quota";
  $("storageWarnTag").textContent  = t(quota ? "a.quotaTag" : "a.storageWarnTag");
  $("storageWarnText").textContent = t(quota ? "a.quotaText" : "a.storageWarnText");
}

function renderSupplierBar() {
  const sel = $("supplierSelect");
  sel.innerHTML = "";
  if (!store.suppliers.length) {
    const o = document.createElement("option");
    o.value = ""; o.textContent = "—";
    sel.appendChild(o);
  } else {
    store.suppliers.slice().sort((a, b) => nameOr(a.name).localeCompare(nameOr(b.name))).forEach(s => {
      const o = document.createElement("option");
      o.value = s.id; o.textContent = nameOr(s.name);
      sel.appendChild(o);
    });
    sel.value = store.currentSupplierId || "";
  }
  const sup = curSup();
  $("memberCount").textContent = t("a.nMembers", { n: sup ? sup.employees.length : 0 });
}

function renderAdminTeam() {
  const sup = curSup();
  const host = $("aTeamList");
  host.innerHTML = "";
  if (!sup) { host.appendChild(emptyBox("a.noSupplier1", "a.noSupplier2")); return; }
  if (!sup.employees.length) { host.appendChild(emptyBox("a.noMembers1", "a.noMembers2")); return; }
  const list = el("div", "mlist");
  sortedEmployees(sup).forEach(emp => {
    const row = memberCard(emp);
    const ctr = el("div", "m-controls");
    const ed = el("button", "btn btn-ghost btn-sm", t("btn.edit"));
    ed.onclick = () => startEdit(emp.id);
    const rm = el("button", "btn btn-danger btn-sm", t("btn.delete"));
    rm.onclick = () => askDelete(emp.id);
    ctr.appendChild(ed); ctr.appendChild(rm);
    row.appendChild(ctr);
    list.appendChild(row);
  });
  host.appendChild(list);
}

function adminSubmit() {
  const sup = curSup();
  if (!sup) { toast(t("t.needSupplier")); return; }
  if (!validateDraft()) return;
  const r = commitDraft(sup);
  const nm = r.emp.name;
  resetDraft();
  saveState(true);
  mountForm($("aFormHost"));
  renderAdmin();
  toast(r.isNew ? t("t.added", { name: nm }) : t("t.changed"));
}

function addSupplier() {
  const inp = $("newSupplierName");
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }
  const s = { id: uid("sup"), name, employees: [] };
  store.suppliers.push(s);
  store.currentSupplierId = s.id;
  inp.value = "";
  resetDraft();
  saveState(true);
  mountForm($("aFormHost"));
  renderAdmin(); renderFilters();
  toast(t("t.supAdded", { name }));
}

function renameSupplier() {
  const sup = curSup();
  if (!sup) return;
  promptSheet(t("c.renameT"), sup.name, v => {
    sup.name = (v || "").trim();
    saveState(true);
    renderSupplierBar(); renderChart();
  });
}

function deleteSupplier() {
  const sup = curSup();
  if (!sup) return;
  confirmSheet(t("c.delSupT"), t("c.delSupX", { name: nameOr(sup.name), n: sup.employees.length }), () => {
    addSnapshot("manual");
    store.suppliers = store.suppliers.filter(s => s.id !== sup.id);
    store.currentSupplierId = store.suppliers[0] ? store.suppliers[0].id : null;
    resetDraft();
    saveState(true);
    mountForm($("aFormHost"));
    renderAdmin();
    toast(t("t.deleted"));
  }, t("btn.delete"));
}

function renderSettings() {
  $("verLabel").textContent = "v" + APP_VERSION;
}

function renderSnapList() {
  const host = $("snapList");
  host.innerHTML = "";
  const snaps = readSnaps();
  if (!snaps.length) { host.appendChild(el("div", "help", t("a.snapNone"))); return; }
  snaps.forEach((s, i) => {
    const row = el("div", "snap");
    const info = el("div", "si");
    const kindKey = s.kind === "start" ? "a.snapStart" : s.kind === "import" ? "a.snapImport" : "a.snapManual";
    info.appendChild(el("b", null, fmtTime(s.ts) + " · " + t(kindKey)));
    info.appendChild(el("span", null, t("a.snapInfo", { sup: s.sup, emp: s.emp })));
    row.appendChild(info);
    const b = el("button", "btn btn-ghost btn-sm", t("btn.restore"));
    b.onclick = () => restoreSnapshot(i);
    row.appendChild(b);
    host.appendChild(row);
  });
}

function wipeAll() {
  confirmSheet(t("c.wipeT"), t("c.wipeX"), () => {
    addSnapshot("manual");
    const keep = store.settings;
    store = defaultStore();
    store.settings = keep;
    resetDraft();
    saveState(true);
    mountForm($("aFormHost"));
    renderAll();
    toast(t("t.wiped"));
  }, t("btn.delete"));
}


/* ============================================================
   7. Organigramm
   ============================================================ */

const filters = { cat: "", cad: "", twoD: "", ai: "", search: "" };
let fitMode = true, currentScale = 1;

const AVATAR = '<svg class="avatar" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#d4d4d4"/><circle cx="32" cy="25" r="11" fill="#f5f5f5"/><path d="M13 53c2.5-11 10-16.5 19-16.5S48.5 42 51 53z" fill="#f5f5f5"/></svg>';

function fillSelect(sel, items, val) {
  sel.innerHTML = "";
  const all = document.createElement("option");
  all.value = ""; all.textContent = t("a.all");
  sel.appendChild(all);
  items.slice().sort((a, b) => a.localeCompare(b)).forEach(i => {
    const o = document.createElement("option");
    o.value = i; o.textContent = i;
    sel.appendChild(o);
  });
  sel.value = items.includes(val) ? val : "";
}
function renderFilters() {
  fillSelect($("filterCat"), store.availableCategories, filters.cat);
  fillSelect($("filterCad"), store.availableCad, filters.cad);
  fillSelect($("filter2d"), store.available2d, filters.twoD);
  fillSelect($("filterAi"), store.availableAi, filters.ai);
  $("filterSearch").value = filters.search;
}
function matchesFilter(emp) {
  if (filters.cat && !(emp.categories || []).includes(filters.cat)) return false;
  if (filters.cad && !(emp.cad || []).includes(filters.cad)) return false;
  if (filters.twoD && !(emp.twoD || []).includes(filters.twoD)) return false;
  if (filters.ai && !(emp.ai || []).includes(filters.ai)) return false;
  if (filters.search && !nameOr(emp.name).toLowerCase().includes(filters.search.toLowerCase())) return false;
  return true;
}

function fbox(kind, text) { return el("div", "fbox " + kind, text); }

/* Werteliste fuer einen Kasten. Geschuetztes Leerzeichen (Zeichen 160) vor dem
   Punkt: Bricht eine lange Liste um, bleibt "·" am vorigen Wort statt eine
   Zeile zu beginnen. */
const LIST_SEP = String.fromCharCode(160) + "· ";
function joinList(arr) { return arr.join(LIST_SEP); }

function empNode(emp, isRoot, active) {
  const on = el("div", "onode" + (isRoot ? " root" : "") + (active && !matchesFilter(emp) ? " dim" : ""));
  on.innerHTML = AVATAR;
  const f = el("div", "fields");
  f.appendChild(fbox("name", nameOr(emp.name)));
  if (emp.email) f.appendChild(fbox("mail", emp.email));
  if (emp.phone) f.appendChild(fbox("phone", emp.phone));
  if (emp.isLead) f.appendChild(fbox("role", t("chart.role")));
  const cats = emp.categories || [], cads = emp.cad || [];
  if (cats.length || cads.length) {
    const r = el("div", "frow");
    if (cats.length) r.appendChild(fbox("cat", joinList(cats)));
    if (cads.length) r.appendChild(fbox("cad", joinList(cads)));
    f.appendChild(r);
  }
  if ((emp.twoD || []).length) {
    const r = el("div", "frow");
    r.appendChild(fbox("twod", joinList(emp.twoD)));
    f.appendChild(r);
  }
  if ((emp.ai || []).length) {
    const r = el("div", "frow");
    r.appendChild(fbox("ai", joinList(emp.ai)));
    f.appendChild(r);
  }
  if ((emp.languages || []).length) {
    const r = el("div", "frow");
    r.appendChild(fbox("lang", joinList(emp.languages)));
    f.appendChild(r);
  }
  on.appendChild(f);
  return on;
}

function companyNode(sup) {
  const on = el("div", "onode root");
  on.innerHTML = '<svg class="avatar" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#000"/><path d="M24 12v24M12 24h24" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/></svg>';
  const f = el("div", "fields");
  f.appendChild(fbox("company", nameOr(sup.name)));
  on.appendChild(f);
  return on;
}

/* ---- Aufbau ----
   Oben die Teamleitung (wer "Team responsible" angehakt hat) in einem eigenen
   Rahmen, darunter eine Linie zum Team-Block: alle uebrigen Personen als
   einzelne Karten im Raster, alphabetisch. Nach Kategorien wird nicht mehr
   gruppiert – die Kategorien stehen in jeder Karte.
   Ist niemand als Teamleitung markiert, steht oben der Firmenname. Sind
   mehrere markiert, steht die erste oben; die anderen kommen zuerst in den
   Team-Block und behalten ihre Kennzeichnung. */
const TEAM_COLS = 3;     // Karten je Zeile im Team-Block

/* Filter dimmen die ganze Karte samt Rahmen, nicht nur den Inhalt */
function moveDim(node, holder) {
  if (node.classList.contains("dim")) { node.classList.remove("dim"); holder.classList.add("dim"); }
  holder.appendChild(node);
  return holder;
}

function renderChart() {
  const sup = curSup();
  const chart = $("chart");
  chart.innerHTML = "";
  $("companyPill").textContent = sup ? nameOr(sup.name).toUpperCase() : "COMPANY";

  if (!sup || !sup.employees.length) {
    chart.appendChild(emptyBox("a.noChart1", "a.noChart2"));
    const inner = $("chartInner"), stage = $("chartStage");
    inner.style.transform = "none";
    // Der Platzhalter liegt absolut positioniert – die Buehne braucht eine eigene Hoehe,
    // sonst rutscht die Fusszeile darueber.
    stage.style.width = "100%"; stage.style.height = "240px";
    drawConnectors();
    $("zoomPct").textContent = "100%";
    return;
  }

  const active = !!(filters.cat || filters.cad || filters.twoD || filters.ai || filters.search);
  const sorted = sortedEmployees(sup);
  const lead = sorted.find(e => e.isLead) || null;
  const team = sorted.filter(e => e !== lead);

  const wrap = el("div", "ochart");
  wrap.appendChild(moveDim(lead ? empNode(lead, true, active) : companyNode(sup), el("div", "oc-lead")));

  if (team.length) {
    wrap.appendChild(el("div", "oc-stem"));
    const block = el("div", "oc-team");
    // Bei kleinen Teams nicht mehr Spalten als Personen, sonst bleiben Luecken
    block.style.gridTemplateColumns = "repeat(" + Math.min(TEAM_COLS, team.length) + ", 1fr)";
    team.forEach(m => block.appendChild(moveDim(empNode(m, false, active), el("div", "oc-card"))));
    wrap.appendChild(block);
  }
  chart.appendChild(wrap);
  // Nach dem Layout messen. requestAnimationFrame wird im Hintergrund-Tab
  // gedrosselt, deshalb zusaetzlich ein Timer als Rueckfallebene.
  requestAnimationFrame(applyZoom);
  clearTimeout(renderChart._t);
  renderChart._t = setTimeout(applyZoom, 120);
}

/* Die einzige Verbindung (Teamleitung -> Team-Block) ist jetzt ein Element
   (.oc-stem) und braucht keine Berechnung. Die SVG-Ebene fuer Linien wird nur
   noch auf 0 gesetzt: Mit der Groesse eines frueheren Diagramms wuerde sie
   die Vermessung in applyZoom und beim PDF verfaelschen. */
function drawConnectors() {
  const svg = $("chartLines");
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute("width", 0); svg.setAttribute("height", 0);
  svg.removeAttribute("viewBox");
}

function applyZoom() {
  const inner = $("chartInner"), stage = $("chartStage"), scroll = $("chartScroll");
  if (!inner || !stage || !scroll) return;
  inner.style.transform = "none";
  if (!inner.querySelector(".onode")) {
    // Kein Diagramm, nur der Platzhalter. Der liegt absolut positioniert, also
    // braucht die Buehne seine Hoehe – sonst rutscht die Fusszeile darueber.
    const ph = inner.querySelector(".empty");
    if (ph) {
      stage.style.width = "100%";
      stage.style.height = Math.ceil(ph.getBoundingClientRect().height) + "px";
    } else {
      stage.style.width = ""; stage.style.height = "";
    }
    return;
  }
  drawConnectors();
  const natW = inner.scrollWidth, natH = inner.scrollHeight;
  if (!natW || !inner.offsetParent) return;
  let s = fitMode ? Math.min(1, (scroll.clientWidth - 2) / natW) : currentScale;
  s = Math.max(0.15, Math.min(2, s));
  inner.style.transformOrigin = "top left";
  inner.style.transform = "scale(" + s + ")";
  stage.style.width = (natW * s) + "px";
  stage.style.height = (natH * s) + "px";
  currentScale = s;
  $("zoomPct").textContent = Math.round(s * 100) + "%";
}
function setScale(v) { fitMode = false; currentScale = Math.max(0.15, Math.min(2, v)); applyZoom(); }

/* Pinch-Zoom auf dem Diagramm */
(function pinch() {
  const scroll = $("chartScroll");
  let start = 0, base = 1;
  const dist = e => {
    const a = e.touches[0], b = e.touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };
  scroll.addEventListener("touchstart", e => {
    if (e.touches.length === 2) { start = dist(e); base = currentScale; }
  }, { passive: true });
  scroll.addEventListener("touchmove", e => {
    if (e.touches.length === 2 && start > 0) {
      e.preventDefault();
      setScale(base * (dist(e) / start));
    }
  }, { passive: false });
  scroll.addEventListener("touchend", e => { if (e.touches.length < 2) start = 0; }, { passive: true });
})();

/* ============================================================
   8. Export / Import
   ============================================================ */

function empRow(e) {
  return [nameOr(e.name), e.email || "", e.phone || "", e.isLead ? t("x.yes") : "",
    (e.categories || []).join(", "), (e.cad || []).join(", "),
    (e.twoD || []).join(", "), (e.ai || []).join(", "), (e.languages || []).join(", ")];
}

async function exportExcel() {
  if (!store.suppliers.length) { toast(t("t.noData")); return; }
  const headAll = [t("x.supplier"), t("x.name"), t("x.email"), t("x.phone"), t("x.lead"),
                   t("x.cats"), t("x.cad"), t("x.twoD"), t("x.ai"), t("x.langs")];
  const headSup = headAll.slice(1);
  const rowsAll = [headAll];
  const perSup = [];
  store.suppliers.forEach((sup, i) => {
    const rows = [headSup];
    sortedEmployees(sup).forEach(e => {
      const r = empRow(e);
      rows.push(r);
      rowsAll.push([nameOr(sup.name), ...r]);
    });
    perSup.push({ name: nameOr(sup.name) || ("Supplier " + (i + 1)), rows });
  });

  if (typeof XLSX !== "undefined") {
    const wb = XLSX.utils.book_new();
    const wsAll = XLSX.utils.aoa_to_sheet(rowsAll);
    wsAll["!cols"] = [{ wch: 22 }, { wch: 20 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsAll, t("x.allSuppliers").slice(0, 31));
    const used = new Set([t("x.allSuppliers").slice(0, 31).toLowerCase()]);
    perSup.forEach((s, i) => {
      let nm = (s.name || ("Supplier " + (i + 1))).replace(/[\\\/\?\*\[\]:]/g, " ").trim().slice(0, 28) || ("Supplier " + (i + 1));
      const base = nm.slice(0, 25);
      let k = 2;
      while (used.has(nm.toLowerCase())) { nm = base + " " + k; k++; }
      used.add(nm.toLowerCase());
      const ws = XLSX.utils.aoa_to_sheet(s.rows);
      ws["!cols"] = [{ wch: 20 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws, nm);
    });
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const how = await deliverFile(blob, "supplier-overview.xlsx");
    if (how !== "aborted") toast(how === "shared" ? t("t.shared") : t("t.excelOk", { n: store.suppliers.length }));
    return;
  }
  const esc = v => { v = (v == null ? "" : String(v)); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const csv = rowsAll.map(r => r.map(esc).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const how = await deliverFile(blob, "supplier-overview.csv");
  if (how !== "aborted") toast(t("t.csvOk"));
}

async function saveJson(onlyCurrent) {
  if (!store.suppliers.length) { toast(t("t.noData")); return; }
  let payload, filename;
  if (onlyCurrent) {
    const sup = curSup();
    if (!sup) { toast(t("t.needSupplier")); return; }
    payload = {
      type: "supplier-export", version: 1, exportedAt: new Date().toISOString(),
      supplier: { id: sup.id, name: sup.name },
      employees: sup.employees.map(cleanEmp(sup.id)),
      availableCategories: store.availableCategories,
      availableCad: store.availableCad,
      available2d: store.available2d,
      availableAi: store.availableAi,
      availableLanguages: store.availableLanguages
    };
    filename = "supplier-" + slug(sup.name) + ".json";
  } else {
    payload = {
      type: "supplier-workspace", version: 1, savedAt: new Date().toISOString(),
      availableCategories: store.availableCategories,
      availableCad: store.availableCad,
      available2d: store.available2d,
      availableAi: store.availableAi,
      availableLanguages: store.availableLanguages,
      suppliers: store.suppliers.map(s => ({ id: s.id, name: s.name, employees: s.employees.map(cleanEmp(s.id)) }))
    };
    filename = "summit-org-backup.json";
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const how = await deliverFile(blob, filename);
  if (how === "aborted") return;
  if (how === "shared") { toast(t("t.shared")); return; }
  toast(onlyCurrent ? t("t.fwdOk", { name: nameOr(curSup().name) }) : t("t.jsonOk"));
}

/* ---- PDF: alle Lieferanten, eine Seite je Lieferant ----
   Fuer jede Seite wird eine Kopie von Kopf (Firmenname, Untertitel),
   Diagramm und Fusszeile in einer unsichtbaren Buehne aufgebaut und per
   html2canvas aufgenommen. Der Firmenname kommt so als Bild ins PDF – auch
   chinesische Schrift, die die eingebaute PDF-Schrift nicht kennt.
   Die Seite ist so gross wie das jeweilige Diagramm: nichts wird verkleinert
   oder abgeschnitten, auch bei sehr breiten Teams. */
const PT = 0.75;         // CSS-Pixel -> PDF-Punkte
const PAGE_PAD = 24;     // Seitenrand in Punkten
const PAGE_MIN_W = 760;  // Mindestbreite, damit der Kopf nicht umbricht

function nextFrames(ms) {
  return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, ms || 0))));
}

/* Kopie ohne IDs, damit nichts doppelt im Dokument steht */
function cloneClean(node) {
  const c = node.cloneNode(true);
  c.removeAttribute("id");
  c.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
  return c;
}

/* Baut die Seite fuer den gerade gezeigten Lieferanten und nimmt sie auf. */
async function captureSupplierPage(stage) {
  const inner = $("chartInner");
  inner.style.transform = "none";
  drawConnectors();
  const w = Math.max(PAGE_MIN_W, inner.scrollWidth);

  const page = el("div", "pdf-page");
  page.style.width = (w + 44) + "px";                  // 2 x 22px Innenabstand wie die Karte
  page.appendChild(cloneClean($("chartHead")));
  const chart = cloneClean(inner);
  chart.style.position = "relative";
  chart.style.width = inner.scrollWidth + "px";
  chart.style.height = inner.scrollHeight + "px";
  // #chart traegt im CSS z-index:1, damit die Linien hinter den Kaesten liegen
  const boxes = chart.querySelector("svg + div");
  if (boxes) { boxes.style.position = "relative"; boxes.style.zIndex = "1"; }
  // Filter dimmen Nichttreffer – im PDF sollen alle voll sichtbar sein
  chart.querySelectorAll(".dim").forEach(n => n.classList.remove("dim"));
  page.appendChild(chart);
  page.appendChild(cloneClean(document.querySelector("#chartShell .org-foot")));
  stage.appendChild(page);
  await nextFrames(30);

  const pw = page.offsetWidth, ph = page.offsetHeight;
  // Browser-Grenze fuer Canvas-Flaechen (iOS ca. 16 Mio. Pixel) einhalten
  const scale = Math.max(1, Math.min(2, Math.sqrt(11000000 / Math.max(1, pw * ph))));
  try {
    const canvas = await html2canvas(page, {
      scale, backgroundColor: "#ededed", logging: false, useCORS: true,
      windowWidth: Math.max(window.innerWidth, pw), windowHeight: Math.max(window.innerHeight, ph)
    });
    return { canvas, cssW: pw, cssH: ph };
  } finally {
    page.remove();
  }
}

async function exportPdf() {
  const list = store.suppliers.slice().sort((a, b) => nameOr(a.name).localeCompare(nameOr(b.name)));
  const withPeople = list.filter(s => s.employees.length);
  const skipped = list.filter(s => !s.employees.length).map(s => nameOr(s.name));
  if (!withPeople.length) { toast(t("t.noChart")); return; }
  if (typeof html2canvas === "undefined" || !window.jspdf) {
    toast(t("t.pdfFail"));
    setTimeout(() => window.print(), 250);
    return;
  }

  const prevId = store.currentSupplierId;
  const btn = $("btnPdf");
  btn.disabled = true;
  adminTab("chart");
  const stage = el("div", "pdf-stage");
  document.body.appendChild(stage);
  try {
    const { jsPDF } = window.jspdf;
    let pdf = null;
    for (let i = 0; i < withPeople.length; i++) {
      toast(t("t.pdfWait", { i: i + 1, n: withPeople.length }), 60000);
      store.currentSupplierId = withPeople[i].id;
      renderChart();
      await nextFrames(160);                            // renderChart misst per Timer nach

      const shot = await captureSupplierPage(stage);
      const iw = shot.cssW * PT, ih = shot.cssH * PT;
      const pw = iw + PAGE_PAD * 2, ph = ih + PAGE_PAD * 2;
      const orient = pw >= ph ? "landscape" : "portrait";
      if (!pdf) pdf = new jsPDF({ orientation: orient, unit: "pt", format: [pw, ph] });
      else pdf.addPage([pw, ph], orient);
      pdf.setFillColor(237, 237, 237);
      pdf.rect(0, 0, pw, ph, "F");
      pdf.addImage(shot.canvas.toDataURL("image/png"), "PNG", PAGE_PAD, PAGE_PAD, iw, ih, undefined, "FAST");
    }
    pdf.setProperties({ title: "Design Summit 2026 – Org charts", creator: "Summit Org Admin " + APP_VERSION });
    const day = new Date().toISOString().slice(0, 10);
    const how = await deliverFile(pdf.output("blob"), "design-summit-2026_org-charts_" + day + ".pdf", "application/pdf");
    if (how !== "aborted") {
      let msg = how === "shared" ? t("t.shared") : t("t.pdfOk", { n: withPeople.length });
      if (skipped.length) msg += " " + t("t.pdfSkipped", { names: skipped.join(", ") });
      toast(msg, skipped.length ? 7000 : 3500);
    }
  } catch (e) {
    toast(t("t.pdfFail"));
    setTimeout(() => window.print(), 250);
  } finally {
    stage.remove();
    btn.disabled = false;
    store.currentSupplierId = prevId;
    renderSupplierBar();
    renderChart();
  }
}

/* ---- Import: Zusammenfuehren statt blind anlegen ----
   Dieselbe Datei zweimal einzulesen war der einfachste Weg, sich den ganzen
   Bestand zu verdoppeln – es wurde immer ein neuer Lieferant angelegt. Bei
   Namensgleichheit wird jetzt gefragt; Personen werden ueber Name + E-Mail
   wiedererkannt und nicht doppelt eingetragen. */
function supKey(name) { return (name || "").trim().toLowerCase(); }
function findSupByName(name) {
  const k = supKey(name);
  return k ? (store.suppliers.find(s => supKey(s.name) === k) || null) : null;
}
function empKey(e) {
  return (e.name || "").trim().toLowerCase() + "|" + (e.email || "").trim().toLowerCase();
}
function mergeEmployees(sup, incoming) {
  const seen = new Set(sup.employees.map(empKey));
  let added = 0, skipped = 0;
  incoming.forEach(e => {
    const k = empKey(e);
    if (seen.has(k)) { skipped++; return; }
    seen.add(k);
    sup.employees.push(e);
    added++;
  });
  return { added, skipped };
}
/* Uebernimmt die eingelesenen Lieferanten. merge=true fuehrt bei gleichem
   Namen zusammen, merge=false legt sie wie bisher als eigene Eintraege an. */
function applyImportedSuppliers(list, merge) {
  let added = 0, skipped = 0, lastId = null;
  list.forEach(s => {
    const hit = merge ? findSupByName(s.name) : null;
    if (hit) {
      const r = mergeEmployees(hit, s.employees);
      added += r.added; skipped += r.skipped;
      lastId = hit.id;
    } else {
      const id = (!s.id || store.suppliers.some(x => x.id === s.id)) ? uid("sup") : s.id;
      store.suppliers.push({ id, name: s.name || "", employees: s.employees });
      added += s.employees.length;
      lastId = id;
    }
  });
  if (lastId) store.currentSupplierId = lastId;
  return { added, skipped };
}
/* Fragt nur nach, wenn es wirklich Namensdubletten gibt. */
function confirmImport(list, onGo, onCancel) {
  const clashes = list.map(s => nameOr(s.name)).filter(n => findSupByName(n));
  if (!clashes.length) { onGo(false); return; }
  confirmSheet(t("c.mergeT"), t("c.mergeX", { names: clashes.join(", ") }),
    () => onGo(true), t("c.mergeB"), onCancel);
}

/* Liest eine JSON-Datei und uebernimmt sie. Meldet nicht selbst, sondern gibt
   ein Ergebnis zurueck – so kann der Mehrfach-Import eine Sammelmeldung zeigen. */
function importJsonFile(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onerror = () => resolve({ status: "fail", file: file.name });
    r.onload = () => {
      let list, pools;
      try {
        const d = JSON.parse(r.result);
        if (d.type === "supplier-workspace" && Array.isArray(d.suppliers)) {
          list = d.suppliers.map(s => ({ id: s.id, name: s.name || "", employees: (s.employees || []).map(normEmp) }));
        } else if (d.supplier && Array.isArray(d.employees)) {
          list = [{ id: d.supplier.id, name: d.supplier.name || "", employees: d.employees.map(normEmp) }];
        } else throw new Error("format");
        pools = d;
      } catch (e) { resolve({ status: "fail", file: file.name }); return; }

      confirmImport(list, merge => {
        mergePools(pools.availableCategories, pools.availableCad, pools.available2d, pools.availableAi, pools.availableLanguages);
        const res = applyImportedSuppliers(list, merge);
        resolve({ status: "ok", file: file.name, merge, list, added: res.added, skipped: res.skipped });
      }, () => resolve({ status: "cancel", file: file.name }));
    };
    r.readAsText(file);
  });
}

/* Mehrere Lieferanten-Dateien nacheinander einlesen. Ein einziger
   Wiederherstellungspunkt fuer den ganzen Stapel: einer pro Datei wuerde ab
   der sechsten Datei den Stand von vor dem Import aus der Liste schieben. */
async function importJsonFiles(files) {
  addSnapshot("import");
  const results = [];
  for (const f of files) results.push(await importJsonFile(f));
  const ok = results.filter(r => r.status === "ok");
  const failed = results.filter(r => r.status === "fail");
  if (ok.length) { resetDraft(); saveState(true); renderAll(); }

  if (files.length === 1) {
    const r = results[0];
    if (r.status === "fail") toast(t("t.impFail"));
    else if (r.status === "cancel") toast(t("t.impCancelled"));
    else if (r.merge) toast(t("t.impMerged", r));
    else if (r.list.length === 1) toast(t("t.impOne", { name: nameOr(r.list[0].name) }));
    else toast(t("t.impOk", { n: r.list.length }));
    return;
  }
  const added = ok.reduce((n, r) => n + r.added, 0);
  const skipped = ok.reduce((n, r) => n + r.skipped, 0);
  let msg = t("t.impBatch", { ok: ok.length, n: files.length, added, skipped });
  if (failed.length) msg += " " + t("t.impBatchFail", { files: failed.map(r => r.file).join(", ") });
  toast(msg, 7000);
}

function importExcelFile(file) {
  if (typeof XLSX === "undefined") { toast(t("t.xlsxMissing")); return; }
  const r = new FileReader();
  r.onload = () => {
    try {
      const wb = XLSX.read(new Uint8Array(r.result), { type: "array" });
      const norm = s => String(s == null ? "" : s).trim().toLowerCase();
      const allNames = ["all suppliers", "alle lieferanten"];
      const overview = wb.SheetNames.find(n => allNames.includes(norm(n)));
      const sheets = overview ? [overview] : wb.SheetNames;
      const splitList = v => String(v == null ? "" : v).split(/[,;·\n]/).map(x => x.trim()).filter(Boolean);
      const truthy = v => ["ja", "yes", "x", "true", "1", "wahr", "english", "englisch"].includes(norm(v));
      const groups = {};
      let count = 0;

      sheets.forEach(sn => {
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: "" });
        if (!aoa.length) return;
        let hIdx = aoa.findIndex(row => row.some(c => norm(c) === "name"));
        if (hIdx < 0) hIdx = 0;
        const header = aoa[hIdx].map(norm);
        const col = names => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };
        const ci = {
          sup:  col(["lieferant", "supplier"]),
          name: col(["name"]),
          email: col(["e-mail", "email", "mail"]),
          phone: col(["phone / mobile", "telefon / mobil", "telefon", "mobil", "phone", "tel", "mobile", "firmen-telefon", "firmen telefon"]),
          // Alte Spaltenkoepfe bleiben gueltig, damit vor der Umbenennung
          // exportierte Dateien weiter einlesbar sind.
          lead: col(["teamverantwortlich", "team responsible", "teamleiter", "lead", "team leader"]),
          cat:  col(["kern-kategorien", "core categories", "kategorien", "kategorie", "categories", "category"]),
          cad:  col(["3d-software", "3d software", "3d", "cad-software", "cad", "cad software"]),
          twoD: col(["2d-software", "2d", "2d software", "twod"]),
          ai:   col(["ai-software", "ai software", "ai", "ki-software", "ki software", "ki"]),
          lang: col(["sprachen", "sprache", "languages", "language"]),
          en:   col(["englisch", "english", "en"])
        };
        for (let i = hIdx + 1; i < aoa.length; i++) {
          const row = aoa[i] || [];
          const nm = ci.name >= 0 ? String(row[ci.name] || "").trim() : "";
          const email = ci.email >= 0 ? String(row[ci.email] || "").trim() : "";
          const phone = ci.phone >= 0 ? String(row[ci.phone] || "").trim() : "";
          if (!nm && !email && !phone) continue;
          const supName = (ci.sup >= 0 && String(row[ci.sup] || "").trim()) ? String(row[ci.sup]).trim() : sn;
          let languages = ci.lang >= 0 ? splitList(row[ci.lang]) : [];
          if (!languages.length && ci.lang < 0 && ci.en >= 0 && truthy(row[ci.en])) languages = ["English"];
          (groups[supName] = groups[supName] || []).push({
            name: nm, email, phone,
            categories: ci.cat >= 0 ? splitList(row[ci.cat]) : [],
            cad: ci.cad >= 0 ? splitList(row[ci.cad]) : [],
            twoD: ci.twoD >= 0 ? splitList(row[ci.twoD]) : [],
            ai: ci.ai >= 0 ? splitList(row[ci.ai]) : [],
            languages,
            isLead: ci.lead >= 0 ? truthy(row[ci.lead]) : false
          });
          count++;
        }
      });

      const supNames = Object.keys(groups);
      if (!supNames.length) { toast(t("t.impExcelNone")); return; }
      const list = supNames.map(supName => ({
        id: null, name: supName, employees: groups[supName].map(normEmp)
      }));

      confirmImport(list, merge => {
        addSnapshot("import");
        // Pools erst hier fuellen – bei Abbruch soll die Datei keine Spur hinterlassen
        list.forEach(s => s.employees.forEach(e => mergePools(e.categories, e.cad, e.twoD, e.ai, e.languages)));
        const res = applyImportedSuppliers(list, merge);
        resetDraft();
        saveState(true);
        renderAll();
        toast(merge ? t("t.impMerged", res) : t("t.impExcelOk", { n: count, s: supNames.length }));
      }, () => toast(t("t.impCancelled")));
    } catch (err) { toast(t("t.impFail")); }
  };
  r.readAsArrayBuffer(file);
}

/* ============================================================
   9. Verdrahtung
   ============================================================ */

function renderAll() {
  applyI18n();
  // Formular neu aufbauen: uebernimmt Sprache und den aktuellen Entwurf
  if (formHost) mountForm(formHost);
  renderAdmin();
  renderFilters();
  renderSaveInfo();
  renderSettings();
  renderSnapList();
  syncFormLabels();
}

function setLang(l) {
  LANG = (l === "de") ? "de" : "en";
  store.settings.lang = LANG;
  saveState();
  renderAll();
}

document.querySelectorAll(".langsw button").forEach(b => {
  b.onclick = () => setLang(b.dataset.lang);
});

$("btnCopyLink").onclick = copySupplierLink;

$("tabMembers").onclick = () => adminTab("members");
$("tabChart").onclick   = () => adminTab("chart");
$("tabData").onclick    = () => adminTab("data");

$("supplierSelect").onchange = e => {
  store.currentSupplierId = e.target.value || null;
  resetDraft();
  mountForm($("aFormHost"));
  saveState();
  renderAdmin();
};
$("btnAddSupplier").onclick = addSupplier;
$("newSupplierName").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addSupplier(); } });
$("btnRename").onclick = renameSupplier;
$("btnDeleteSup").onclick = deleteSupplier;
$("aSubmit").onclick = adminSubmit;
$("aReset").onclick = () => { resetDraft(); mountForm($("aFormHost")); };

$("btnExcel").onclick   = exportExcel;
$("btnPdf").onclick     = exportPdf;
$("btnSaveJson").onclick = () => saveJson(false);
$("btnForward").onclick = () => saveJson(true);
$("btnImportJson").onclick  = () => $("fileInput").click();
$("btnImportExcel").onclick = () => $("excelInput").click();
$("fileInput").onchange  = e => { const fs = [...e.target.files]; e.target.value = ""; if (fs.length) importJsonFiles(fs); };
$("excelInput").onchange = e => { const f = e.target.files[0]; if (f) importExcelFile(f); e.target.value = ""; };

$("filterCat").onchange = e => { filters.cat = e.target.value; renderChart(); };
$("filterCad").onchange = e => { filters.cad = e.target.value; renderChart(); };
$("filter2d").onchange  = e => { filters.twoD = e.target.value; renderChart(); };
$("filterAi").onchange  = e => { filters.ai = e.target.value; renderChart(); };
$("filterSearch").oninput = e => { filters.search = e.target.value; renderChart(); };
$("zoomIn").onclick  = () => setScale(currentScale + 0.1);
$("zoomOut").onclick = () => setScale(currentScale - 0.1);
$("zoomFit").onclick = () => { fitMode = true; applyZoom(); };

$("btnWipe").onclick = wipeAll;

/* Viewport-Hoehe: haelt die Aktionsleiste ueber der iOS-Tastatur */
/* Die Screen-Hoehe kommt normalerweise aus CSS (100dvh) – das stimmt beim Drehen
   auch ohne JS. Nur wenn die Bildschirmtastatur den sichtbaren Bereich deutlich
   verkleinert, wird eine feste Pixelhoehe gesetzt, damit die Aktionsleiste
   ueber der Tastatur bleibt. */
function syncVH() {
  const vv = window.visualViewport;
  const layout = window.innerHeight || 0;
  const visible = vv && vv.height ? vv.height : 0;
  if (visible > 200 && layout > 200 && layout - visible > 80) {
    document.documentElement.style.setProperty("--vh", visible + "px");
  } else {
    document.documentElement.style.removeProperty("--vh");
  }
}
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncVH);
  window.visualViewport.addEventListener("scroll", syncVH);
}
window.addEventListener("resize", syncVH);
window.addEventListener("pageshow", syncVH);
document.addEventListener("visibilitychange", syncVH);
window.addEventListener("orientationchange", () => setTimeout(() => { syncVH(); applyZoom(); }, 300));
syncVH();
setTimeout(syncVH, 400);

/* fokussiertes Feld ueber der Tastatur halten */
document.addEventListener("focusin", e => {
  if (e.target.matches("input, select, textarea")) {
    setTimeout(() => { try { e.target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) {} }, 280);
  }
});

let _rz = null;
window.addEventListener("resize", () => { clearTimeout(_rz); _rz = setTimeout(applyZoom, 150); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => applyZoom());

/* ============================================================
   10. Start
   ============================================================ */

storageOK = probeStorage();
loadState();
LANG = store.settings.lang === "de" ? "de" : "en";
addSnapshot("start");
applyI18n();
$("btnOpenForm").href = FORM_URL;
openAdmin();
if (!storageOK) setTimeout(() => toast(t("a.storageWarnText")), 900);
