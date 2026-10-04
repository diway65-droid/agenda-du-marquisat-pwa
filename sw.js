try { importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'); } catch (e) {}

const CACHE = 'marquisat-v6';
const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon-96x96.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Ne pas mettre en cache les appels externes
  if (
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('google.com/spreadsheets') ||
    e.request.url.includes('cloudinary.com') ||
    e.request.url.includes('onesignal.com') ||
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('fonts.gstatic.com')
  ) return;

  // Page : réseau d'abord (toujours la dernière version), cache en secours hors-ligne
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('/index.html', copy));
        return r;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match('/index.html'))
    )
  );
});
