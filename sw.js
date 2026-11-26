/* Service worker: jaringan dulu (selalu dapat versi terbaru), cache sebagai cadangan offline. */
var CACHE = 'novasora-v2';
var FILES = [
 "./",
 "./index.html",
 "./manifest.json",
 "./assets/icons/apple-touch-icon.png",
 "./assets/icons/icon-192.png",
 "./assets/icons/icon-512.png",
 "./assets/icons/icon-maskable.png",
 "./assets/img/equipment/eq_adept_staff.webp",
 "./assets/img/equipment/eq_apprentice_staff.webp",
 "./assets/img/equipment/eq_copper_ring.webp",
 "./assets/img/equipment/eq_hunters_bow.webp",
 "./assets/img/equipment/eq_iron_armor.webp",
 "./assets/img/equipment/eq_iron_sword.webp",
 "./assets/img/equipment/eq_leather_armor.webp",
 "./assets/img/equipment/eq_mana_pendant.webp",
 "./assets/img/equipment/eq_reinforced_shield.webp",
 "./assets/img/equipment/eq_rusty_sword.webp",
 "./assets/img/equipment/eq_silver_ring.webp",
 "./assets/img/equipment/eq_simple_pendant.webp",
 "./assets/img/equipment/eq_wooden_bow.webp",
 "./assets/img/equipment/eq_wooden_shield.webp",
 "./assets/img/fx/sprite.webp",
 "./assets/img/items/enh_1.png",
 "./assets/img/items/enh_2.png",
 "./assets/img/items/enh_3.png",
 "./assets/img/items/enh_4.png",
 "./assets/img/ui/i-bag.webp",
 "./assets/img/ui/i-bolt.webp",
 "./assets/img/ui/i-challenge.webp",
 "./assets/img/ui/i-char.webp",
 "./assets/img/ui/i-credit.webp",
 "./assets/img/ui/i-gem.webp",
 "./assets/img/ui/i-shop.webp",
 "./assets/img/ui/i-task.webp",
 "./assets/img/ui/i-tm-acc.webp",
 "./assets/img/ui/i-tm-help.webp",
 "./assets/img/ui/i-tm-opt.webp",
 "./assets/img/ui/i-tm-setup.webp",
 "./assets/img/ui/i-trophy.webp",
 "./assets/img/ui/ikon-besar.webp",
 "./assets/img/ui/orb-skill.webp",
 "./assets/img/ui/orb-tall.webp",
 "./assets/img/ui/tombol-play.webp",
 "./css/base.css",
 "./css/style.css",
 "./js/efek.js",
 "./js/game.js",
 "./js/geser.js",
 "./js/layar-penuh.js"
];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET' || e.request.url.indexOf(self.location.origin) !== 0) return;
  e.respondWith(fetch(e.request).then(function(r){
    var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); return r;
  }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); }));
});
