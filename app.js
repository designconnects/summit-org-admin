/* ============================================================
   Design Summit 2026 – Lieferanten-Formular
   Lieferanten oeffnen den Link, tragen ihr Design-Team ein, laden eine
   JSON-Datei herunter und schicken sie per Mail an SEND_TO.
   Es wird nichts automatisch verschickt; die Eingaben liegen nur im
   Browser des Lieferanten. Ausgewertet werden die Dateien im eigenen
   Projekt summit-org-admin.
   Die Bezeichner beginnend mit "k"/kiosk stammen aus der frueheren
   iPad-Version und meinen heute das Formular.
   ============================================================ */
"use strict";

const APP_VERSION = "2.1";
const SEND_TO = "designconnects@delta-sport.com";

/* Eigener Schluessel: das Admin-Werkzeug liegt unter derselben Adresse
   (alexiiio2012.github.io) und benutzt summitOrg.state.v1. Wer das Formular
   im eigenen Browser ausprobiert, soll den Admin-Bestand nicht beruehren. */
const LS_KEY = "summitOrg.supplier.v1";

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
  "app.tag":         ["Team, skills & responsibilities", "Team, Skills & Verantwortung"],

  "btn.cancel":      ["Cancel", "Abbrechen"],
  "btn.ok":          ["OK", "OK"],
  "btn.save":        ["Save", "Speichern"],
  "btn.delete":      ["Delete", "Löschen"],
  "btn.edit":        ["Edit", "Bearbeiten"],
  "btn.remove":      ["Remove", "Entfernen"],
  "btn.restore":     ["Restore", "Wiederherstellen"],

  "k.kick":          ["Design Summit 2026", "Design Summit 2026"],
  "k.welcome":       ["Tell us who is on your design team", "Wer ist in Ihrem Design-Team?"],
  "k.intro":         ["It takes about five minutes. Nothing is sent automatically — at the end you download one file and email it to us.", "Das dauert etwa fünf Minuten. Es wird nichts automatisch verschickt — am Ende laden Sie eine Datei herunter und schicken sie uns per E-Mail."],
  "k.how1":          ["Enter your company name", "Firmennamen eingeben"],
  "k.how2":          ["Add each person in your team", "Jede Person im Team erfassen"],
  "k.how3":          ["Download the file and email it to us", "Datei herunterladen und per E-Mail an uns senden"],
  "k.companyLabel":  ["Company name", "Firmenname"],
  "k.searchCompany": ["e.g. Ningbo Sunrise Co., Ltd.", "z. B. Ningbo Sunrise Co., Ltd."],
  "k.companyErr":    ["Please enter your company name.", "Bitte den Firmennamen eingeben."],
  "k.continue":      ["Start", "Los geht’s"],
  "k.nMembers":      ["{n} people added", "{n} Personen erfasst"],
  "k.nMember1":      ["1 person added", "1 Person erfasst"],
  "k.formTitle":     ["Add a person", "Person hinzufügen"],
  "k.formTitleEdit": ["Edit person", "Person bearbeiten"],
  "k.formSub":       ["Only the name is required — everything else helps us plan better.", "Nur der Name ist Pflicht — alles Weitere hilft uns bei der Planung."],
  "k.change":        ["Change", "Ändern"],
  "k.renameT":       ["Company name", "Firmenname"],
  "k.team":          ["Your team", "Ihr Team"],
  "k.teamEmpty1":    ["Nobody yet", "Noch niemand"],
  "k.teamEmpty2":    ["Fill in the form and press “Add person”. Repeat for everyone in your team.", "Formular ausfüllen und „Person hinzufügen“ drücken. Für jede Person im Team wiederholen."],
  "k.reset":         ["Clear", "Leeren"],
  "k.submit":        ["Add person", "Person hinzufügen"],
  "k.submitEdit":    ["Save changes", "Änderungen speichern"],
  "k.hint":          ["Only the name is required.", "Nur der Name ist Pflicht."],
  "k.hintEdit":      ["Editing an existing entry.", "Ein bestehender Eintrag wird bearbeitet."],
  "k.dupTitle":      ["Name already exists", "Name existiert bereits"],
  "k.dupText":       ["“{name}” is already on the list for {company}. Add anyway?", "„{name}“ steht bereits auf der Liste von {company}. Trotzdem eintragen?"],
  /* Fortschrittsleiste */
  "k.step1":         ["Add your team", "Team erfassen"],
  "k.step2":         ["Send us your file", "Datei an uns senden"],
  "k.stepNone":      ["Nobody added yet", "Noch niemand erfasst"],
  "k.sendB":         ["Download file", "Datei herunterladen"],
  "k.stNotYet":      ["Not sent yet", "Noch nicht gesendet"],
  "k.stChanged":     ["Changed since your last download — please download again", "Seit dem letzten Download geändert — bitte erneut herunterladen"],
  "k.stDone":        ["Downloaded — please email it to us", "Heruntergeladen — bitte per E-Mail an uns senden"],
  "k.needPerson":    ["Please add at least one person first.", "Bitte zuerst mindestens eine Person hinzufügen."],
  "k.pendingT":      ["This person is not on the list yet", "Diese Person steht noch nicht auf der Liste"],
  "k.pendingX":      ["“{name}” is still in the form and has not been added. Add this person before downloading?", "„{name}“ steht noch im Formular und wurde nicht hinzugefügt. Vor dem Download hinzufügen?"],
  "k.storageWarn":   ["This browser does not keep your entries (private mode?). Please download your file before you close this page.", "Dieser Browser behält Ihre Einträge nicht (privater Modus?). Bitte die Datei herunterladen, bevor Sie die Seite schließen."],
  "k.quotaWarn":     ["This browser’s storage is full — your latest entries could not be saved. Please download your file now.", "Der Speicher dieses Browsers ist voll — die letzten Eingaben konnten nicht gespeichert werden. Bitte jetzt die Datei herunterladen."],

  /* Nach dem Download */
  "s.title":         ["Your file is saved", "Ihre Datei ist gespeichert"],
  "s.file":          ["File: {file}", "Datei: {file}"],
  "s.step1":         ["Open a new email to the address below.", "Eine neue E-Mail an die Adresse unten öffnen."],
  "s.step2":         ["Attach the file you just saved.", "Die eben gespeicherte Datei anhängen."],
  "s.step3":         ["Send it — that’s all.", "Absenden — fertig."],
  "s.to":            ["Send to", "Senden an"],
  "s.copy":          ["Copy address", "Adresse kopieren"],
  "s.copied":        ["Address copied.", "Adresse kopiert."],
  "s.copyFail":      ["Please copy the address by hand.", "Bitte die Adresse von Hand kopieren."],
  "s.back":          ["Back to the form", "Zurück zum Formular"],
  "s.mail":          ["Open email", "E-Mail öffnen"],
  "s.subject":       ["Design Summit 2026 – {company}", "Design Summit 2026 – {company}"],
  "s.body":          ["Hello,\n\nattached is our design team for the Design Summit 2026.\n\nCompany: {company}\nFile: {file}\n\nBest regards", "Hallo,\n\nanbei unser Design-Team für den Design Summit 2026.\n\nFirma: {company}\nDatei: {file}\n\nViele Grüße"],

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


  "chart.role":      ["Team responsible", "Teamverantwortlich"],





  "c.delMemberT":    ["Delete person", "Person löschen"],
  "c.delMemberX":    ["Remove “{name}” from the list?", "„{name}“ von der Liste entfernen?"],

  "t.added":         ["{name} added.", "{name} hinzugefügt."],
  "t.changed":       ["Changes saved.", "Änderungen gespeichert."],
  "t.deleted":       ["Deleted.", "Gelöscht."],

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
      employees: (s.employees || []).map(normEmp),
      // Fingerabdruck des Stands beim letzten Download (Lieferanten-Ansicht)
      exportedSig: s.exportedSig || ""
    }));
    if (!store.suppliers.some(s => s.id === store.currentSupplierId)) {
      store.currentSupplierId = store.suppliers[0] ? store.suppliers[0].id : null;
    }
  } catch (e) { /* defekter Eintrag – mit Defaults weiterarbeiten */ }
}

let _saveT = null;
function saveState(immediate) {
  clearTimeout(_saveT);
  const run = () => {
    store.savedAt = new Date().toISOString();
    const ok = lsSet(LS_KEY, JSON.stringify(store));
    if (ok) return;
    // Schreiben fehlgeschlagen (Speicher voll). Das darf NICHT still bleiben:
    // Der Lieferant soll seine Datei jetzt herunterladen, solange die Eingaben
    // noch im Fenster stehen.
    storageOK = false;
    if (!saveState._warned) { saveState._warned = true; toast(t("k.quotaWarn"), 8000); }
  };
  if (immediate) run(); else _saveT = setTimeout(run, 250);
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
   4. Formular fuer eine Person
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
      renderFormState(); saveState();
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
  $("kSubmit").textContent   = t(editing ? "k.submitEdit" : "k.submit");
  $("kHint").textContent     = t(editing ? "k.hintEdit" : "k.hint");
  $("kFormTitle").textContent = t(editing ? "k.formTitleEdit" : "k.formTitle");
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
   5. Lieferanten-Ansicht
   Ablauf: Firma eingeben -> Personen erfassen -> Datei herunterladen
   -> per Mail an SEND_TO. Der Browser gehoert dem Lieferanten, also
   bleibt die Firma ueber Neuladen hinweg stehen und alle Eintraege
   sind bearbeitbar.
   ============================================================ */


function kioskStep() { return curSup() ? "enter" : "pick"; }

function renderKiosk() {
  const step = kioskStep();
  $("kPick").classList.toggle("hidden", step !== "pick");
  $("kEnter").classList.toggle("hidden", step !== "enter");
  $("kBar").classList.toggle("hidden", step !== "enter");
  $("kSteps").classList.toggle("hidden", step !== "enter");
  if (step === "pick") return;

  const sup = curSup();
  $("kCompanyName").textContent = nameOr(sup.name);
  if (formHost !== $("kFormHost")) mountForm($("kFormHost")); else renderFormState();
  renderKioskTeam();
  syncFormLabels();
}

/* Startseite: aus dem eingegebenen Namen wird die Firma. Liegt schon eine
   gleichnamige vor (Lieferant hat neu angefangen), wird diese weiterbenutzt. */
function startCompany() {
  const inp = $("kCompanyInput");
  const name = inp.value.trim();
  $("kCompanyErr").classList.toggle("show", !name);
  if (!name) { inp.focus(); return; }
  let sup = findSupByName(name);
  if (!sup) {
    sup = { id: uid("sup"), name, employees: [], exportedSig: "" };
    store.suppliers.push(sup);
  }
  pickCompany(sup.id);
}

function pickCompany(id) {
  store.currentSupplierId = id;
  resetDraft();
  $("kCompanyInput").value = "";
  saveState(true);
  renderKiosk();
  $("kioskBody").scrollTop = 0;
  setTimeout(() => { if (FE) FE.name.focus(); }, 120);
}

/* "Aendern" am Firmen-Chip benennt um, statt eine zweite Firma anzulegen:
   Meist ist es ein Tippfehler, und die erfassten Personen sollen bleiben. */
function renameCompany() {
  const sup = curSup();
  if (!sup) return;
  promptSheet(t("k.renameT"), sup.name, v => {
    const name = (v || "").trim();
    if (!name) return;
    sup.name = name;
    saveState(true);
    renderKiosk();
  });
}

function renderKioskTeam() {
  const sup = curSup();
  const host = $("kTeamList");
  host.innerHTML = "";
  $("kTeamCount").textContent = peopleCount(sup ? sup.employees.length : 0);
  renderSteps();
  if (!sup || !sup.employees.length) {
    host.appendChild(emptyBox("k.teamEmpty1", "k.teamEmpty2"));
    return;
  }
  const list = el("div", "mlist");
  sortedEmployees(sup).forEach(emp => list.appendChild(memberCard(emp)));
  host.appendChild(list);
}

/* Alle Eintraege gehoeren dem Lieferanten selbst, also alle bearbeitbar */
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
  const ctr = el("div", "m-controls");
  const ed = el("button", "btn btn-ghost btn-sm", t("btn.edit"));
  ed.onclick = () => startEdit(emp.id);
  const rm = el("button", "btn btn-danger btn-sm", t("btn.remove"));
  rm.onclick = () => askDelete(emp.id);
  ctr.appendChild(ed); ctr.appendChild(rm);
  row.appendChild(ctr);
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

/* then: optional, wird nach erfolgreichem Hinzufuegen aufgerufen (Download-Weg) */
function kioskSubmit(then) {
  const sup = curSup();
  if (!sup) return;
  if (!validateDraft()) return;
  const dup = sup.employees.some(e =>
    e.id !== editingId && nameOr(e.name).toLowerCase() === draft.name.toLowerCase());
  if (dup && !editingId) {
    confirmSheet(t("k.dupTitle"), t("k.dupText", { name: draft.name, company: nameOr(sup.name) }),
      () => finishKioskSubmit(sup, then));
    return;
  }
  finishKioskSubmit(sup, then);
}

/* Kein "Danke"-Dialog mehr nach jeder Person: Der Lieferant erfasst meist
   mehrere Leute hintereinander. Kurze Meldung, Formular leer, Liste waechst. */
function finishKioskSubmit(sup, then) {
  const r = commitDraft(sup);
  const nm = r.emp.name;
  resetDraft();
  saveState(true);
  renderFormState();
  renderKioskTeam();
  toast(r.isNew ? t("t.added", { name: nm }) : t("t.changed"));
  $("kioskBody").scrollTop = 0;
  if (typeof then === "function") { then(); return; }
  setTimeout(() => { if (FE) FE.name.focus(); }, 120);
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
  renderKiosk();
  $("kioskBody").scrollTop = 0;
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
    renderKioskTeam();
    renderFormState();
    toast(t("t.deleted"));
  }, t("btn.delete"));
}

/* ---- Senden: Datei herunterladen, dann per Mail ----
   Ob der aktuelle Stand schon heruntergeladen wurde, merkt sich ein
   Fingerabdruck der Personenliste. Aendert sich danach etwas, steht der
   Status wieder auf "geaendert" – damit keine veraltete Datei verschickt wird. */
function teamSig(sup) {
  const s = JSON.stringify([sup.name, sup.employees.map(cleanEmp(sup.id))]);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

function peopleCount(n) { return n === 1 ? t("k.nMember1") : t("k.nMembers", { n }); }

function renderSteps() {
  const sup = curSup();
  if (!sup) return;
  const n = sup.employees.length;
  $("kStepCount").textContent = n ? peopleCount(n) : t("k.stepNone");
  $("kStep1").classList.toggle("ok", n > 0);

  const st = !n ? "none" : !sup.exportedSig ? "new" : sup.exportedSig === teamSig(sup) ? "done" : "changed";
  $("kSendState").textContent =
    st === "none" ? t("k.needPerson") : st === "done" ? t("k.stDone") : st === "changed" ? t("k.stChanged") : t("k.stNotYet");
  $("kStep2").classList.toggle("ok", st === "done");
  $("kStep2").classList.toggle("warn", st === "changed");
  $("kSend").disabled = !n;
}

function supplierFileName(sup) { return "design-summit-2026_" + slug(sup.name) + ".json"; }

/* Nur die tatsaechlich benutzten Werte mitschicken. Sonst landen beim Import
   auch Tippfehler, die der Lieferant gleich wieder abgewaehlt hat, in unseren
   Filterlisten. */
function usedValues(sup, key) {
  const set = new Set();
  sup.employees.forEach(e => (e[key] || []).forEach(v => set.add(v)));
  return [...set];
}

/* Steht noch eine Person im Formular, die nicht hinzugefuegt wurde, wuerde
   sie in der Datei fehlen. Lieber einmal nachfragen. */
function sendFile() {
  const sup = curSup();
  if (!sup) return;
  const pending = FE && (FE.name.value.trim() || FE.email.value.trim() || FE.phone.value.trim());
  if (pending) {
    const nm = FE.name.value.trim() || FE.email.value.trim() || FE.phone.value.trim();
    confirmSheet(t("k.pendingT"), t("k.pendingX", { name: nm }),
      () => kioskSubmit(() => sendFile()), t("k.submit"));
    return;
  }
  if (!sup.employees.length) { toast(t("k.needPerson")); return; }
  downloadSupplierFile(sup);
}

async function downloadSupplierFile(sup) {
  const payload = {
    type: "supplier-export", version: 1, appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    supplier: { id: sup.id, name: sup.name },
    employees: sup.employees.map(cleanEmp(sup.id)),
    availableCategories: usedValues(sup, "categories"),
    availableCad: usedValues(sup, "cad"),
    available2d: usedValues(sup, "twoD"),
    availableAi: usedValues(sup, "ai"),
    availableLanguages: usedValues(sup, "languages")
  };
  const file = supplierFileName(sup);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const how = await deliverFile(blob, file, "application/json");
  if (how === "aborted") return;
  sup.exportedSig = teamSig(sup);
  saveState(true);
  renderSteps();
  openSendOverlay(sup, file);
}

function openSendOverlay(sup, file) {
  $("sendFile").textContent = t("s.file", { file });
  $("sendAddr").textContent = SEND_TO;
  const subject = t("s.subject", { company: nameOr(sup.name) });
  const body = t("s.body", { company: nameOr(sup.name), file });
  // encodeURIComponent statt URLSearchParams: Mailprogramme lesen "+" sonst als Pluszeichen
  $("sendMail").href = "mailto:" + SEND_TO + "?subject=" + encodeURIComponent(subject) +
                       "&body=" + encodeURIComponent(body);
  $("sendOverlay").classList.remove("hidden");
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

/* Gleichnamige Firma wiederfinden (Lieferant faengt neu an, gleicher Name) */
function supKey(name) { return (name || "").trim().toLowerCase(); }
function findSupByName(name) {
  const k = supKey(name);
  return k ? (store.suppliers.find(s => supKey(s.name) === k) || null) : null;
}

/* ============================================================
   6. Verdrahtung
   ============================================================ */

function renderAll() {
  applyI18n();
  // Formular neu aufbauen: uebernimmt Sprache und den aktuellen Entwurf
  if (formHost) mountForm(formHost);
  renderKiosk();
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

$("kContinue").onclick = startCompany;
$("kCompanyInput").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); startCompany(); }
});
$("kCompanyInput").addEventListener("input", () => $("kCompanyErr").classList.remove("show"));
$("kChangeCompany").onclick = renameCompany;
$("kSubmit").onclick = () => kioskSubmit();
$("kReset").onclick = () => { resetDraft(); renderFormState(); renderKioskTeam(); };
$("kSend").onclick = sendFile;

$("sendBack").onclick = () => $("sendOverlay").classList.add("hidden");
$("sendCopy").onclick = async () => toast(t((await copyText(SEND_TO)) ? "s.copied" : "s.copyFail"));
$("sendOverlay").addEventListener("click", e => {
  if (e.target === $("sendOverlay")) $("sendOverlay").classList.add("hidden");
});

/* Viewport-Hoehe: haelt die Aktionsleiste ueber der Bildschirmtastatur.
   Die Hoehe kommt normalerweise aus CSS (100dvh). Nur wenn die Tastatur den
   sichtbaren Bereich deutlich verkleinert, wird eine feste Pixelhoehe gesetzt. */
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
window.addEventListener("orientationchange", () => setTimeout(syncVH, 300));
syncVH();
setTimeout(syncVH, 400);

/* fokussiertes Feld ueber der Tastatur halten */
document.addEventListener("focusin", e => {
  if (e.target.matches("input, select, textarea")) {
    setTimeout(() => { try { e.target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) {} }, 280);
  }
});

/* ============================================================
   7. Start
   ============================================================ */

/* Die fruehere iPad-Version hat einen Service Worker installiert, der die
   Seite aus seinem Cache ausliefert. sw.js ist jetzt ein Abbau-Skript; hier
   wird zusaetzlich jede noch vorhandene Registrierung entfernt, damit niemand
   auf einem alten Stand haengen bleibt. */
if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(r => r.unregister()))
    .catch(() => {});
}

storageOK = probeStorage();
loadState();
LANG = store.settings.lang === "de" ? "de" : "en";
applyI18n();
renderKiosk();
if (!storageOK) setTimeout(() => toast(t("k.storageWarn"), 7000), 900);
