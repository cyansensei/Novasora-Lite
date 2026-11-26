/* Service worker: jaringan dulu (selalu dapat versi terbaru), cache sebagai cadangan offline. */
var CACHE = 'novasora-v1';
var FILES = [
 "./",
 "./apple-touch-icon.png",
 "./base.css",
 "./efek.js",
 "./enh_1.png",
 "./enh_2.png",
 "./enh_3.png",
 "./enh_4.png",
 "./eq_adept_staff.webp",
 "./eq_apprentice_staff.webp",
 "./eq_copper_ring.webp",
 "./eq_hunters_bow.webp",
 "./eq_iron_armor.webp",
 "./eq_iron_sword.webp",
 "./eq_leather_armor.webp",
 "./eq_mana_pendant.webp",
 "./eq_reinforced_shield.webp",
 "./eq_rusty_sword.webp",
 "./eq_silver_ring.webp",
 "./eq_simple_pendant.webp",
 "./eq_wooden_bow.webp",
 "./eq_wooden_shield.webp",
 "./game.js",
 "./geser.js",
 "./i-bag.webp",
 "./i-bolt.webp",
 "./i-challenge.webp",
 "./i-char.webp",
 "./i-credit.webp",
 "./i-gem.webp",
 "./i-shop.webp",
 "./i-task.webp",
 "./i-tm-acc.webp",
 "./i-tm-help.webp",
 "./i-tm-opt.webp",
 "./i-tm-setup.webp",
 "./i-trophy.webp",
 "./icon-192.png",
 "./icon-512.png",
 "./icon-maskable.png",
 "./ikon-besar.webp",
 "./index.html",
 "./layar-penuh.js",
 "./manifest.json",
 "./orb-skill.webp",
 "./orb-tall.webp",
 "./sprite.webp",
 "./style.css",
 "./tombol-play.webp"
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
