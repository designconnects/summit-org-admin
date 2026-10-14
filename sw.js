/* Abbau des Service Workers.

   Die fruehere iPad-Version hat einen Service Worker installiert, der die
   Seite aus seinem eigenen Cache ausliefert – auch dann, wenn auf GitHub
   laengst eine neue Version liegt. Wer die alte Version einmal geoeffnet hat,
   wuerde ohne dieses Skript dauerhaft den alten Stand sehen.

   Der Browser prueft bei jedem Seitenaufruf, ob sich sw.js geaendert hat.
   Diese Fassung ersetzt dann den alten Worker, loescht seine Caches, meldet
   sich selbst ab und laedt offene Tabs neu. Danach kommt alles wieder direkt
   von GitHub Pages.

   Datei bitte NICHT loeschen, solange noch jemand eine alte Version offen
   haben koennte. Sie richtet keinen Schaden an und wird nicht mehr neu
   registriert (app.js tut das nicht mehr). */
"use strict";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const tabs = await self.clients.matchAll({ type: "window" });
    tabs.forEach(tab => tab.navigate(tab.url));
  })());
});

/* Kein fetch-Handler: alle Anfragen gehen direkt ans Netz. */
