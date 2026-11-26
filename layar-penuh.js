
/* ===== Tombol mengambang "layar penuh browser" + penyegaran ukuran saat rotasi / fullscreen ===== */
(function(){
  /* 1) Browser mobile sering melaporkan ukuran layar terlambat saat rotasi / masuk-keluar fullscreen:
        kirim ulang event resize beberapa kali supaya layout & efek sentuh selalu pas. */
  var timers = [];
  function kick(){
    timers.forEach(clearTimeout); timers = [];
    [0, 120, 350, 800].forEach(function(ms){ timers.push(setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, ms)); });
  }
  window.addEventListener('orientationchange', kick);
  window.addEventListener('pageshow', kick);
  document.addEventListener('fullscreenchange', kick);
  document.addEventListener('webkitfullscreenchange', kick);
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', kick);

  /* 2) Tombol mengambang (bisa digeser, nempel ke tepi). Muncul hanya jika belum fullscreen & browser mendukung. */
  var de = document.documentElement;
  var req = de.requestFullscreen || de.webkitRequestFullscreen || de.msRequestFullscreen;
  var ok = document.fullscreenEnabled !== undefined ? document.fullscreenEnabled : document.webkitFullscreenEnabled;
  var app = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || window.navigator.standalone;
  if (!req || ok === false || app) return;

  var b = document.createElement('button');
  b.id = 'fsFloat'; b.type = 'button'; b.className = 'pulse';
  b.setAttribute('aria-label', 'Masuk mode layar penuh');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  document.body.appendChild(b);

  var KEY = 'rpg_fsbtn', M = 10, pos = { fx: 1, fy: .42 };
  try { var sv = JSON.parse(localStorage.getItem(KEY)); if (sv && isFinite(sv.fx) && isFinite(sv.fy)) pos = sv; } catch(e){}
  function isFs(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function inset(n){ var c = getComputedStyle(document.getElementById('saProbe') || document.body); return parseFloat(c['padding' + n]) || 0; }
  function place(){
    var vw = innerWidth, vh = innerHeight, w = b.offsetWidth || 48;
    var l = inset('Left') + M, r = vw - inset('Right') - M - w, t = inset('Top') + M, bt = vh - inset('Bottom') - M - w;
    var x = l + (r - l) * pos.fx, y = t + (bt - t) * pos.fy;
    b.style.left = Math.max(l, Math.min(r, x)) + 'px'; b.style.top = Math.max(t, Math.min(bt, y)) + 'px';
  }
  function sync(){ b.classList.toggle('show', !isFs()); place(); }
  window.addEventListener('resize', place);
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  setTimeout(sync, 900);

  function enter(){
    try {
      var r = req.call(de, { navigationUI: 'hide' });
      if (r && r.catch) r.catch(function(){ try { var r2 = req.call(de); if (r2 && r2.catch) r2.catch(function(){}); } catch(e){} });
    } catch(e){ try { req.call(de); } catch(e2){} }
  }

  /* tap = layar penuh, tarik = pindahkan lalu tempel ke tepi kiri/kanan terdekat */
  var d = null, moved = false;
  b.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var r = b.getBoundingClientRect(); d = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, x: e.clientX, y: e.clientY }; moved = false;
    try { b.setPointerCapture(e.pointerId); } catch(x){}
    e.stopPropagation();
  });
  b.addEventListener('pointermove', function(e){
    if (!d || e.pointerId !== d.id) return;
    if (!moved){ if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return; moved = true; b.classList.add('drag'); }
    b.style.left = (e.clientX - d.dx) + 'px'; b.style.top = (e.clientY - d.dy) + 'px';
    e.preventDefault();
  });
  function done(e){
    if (!d || e.pointerId !== d.id) return;
    var was = moved; d = null; moved = false; b.classList.remove('drag');
    if (was){
      var vw = innerWidth, vh = innerHeight, w = b.offsetWidth, rc = b.getBoundingClientRect();
      var l = inset('Left') + M, r = vw - inset('Right') - M - w, t = inset('Top') + M, bt = vh - inset('Bottom') - M - w;
      pos = { fx: (rc.left + w / 2 < vw / 2) ? 0 : 1, fy: Math.max(0, Math.min(1, (rc.top - t) / Math.max(1, bt - t))) };
      try { localStorage.setItem(KEY, JSON.stringify(pos)); } catch(x){}
      place();
    } else if (e.type === 'pointerup'){ b.classList.remove('pulse'); enter(); }
  }
  b.addEventListener('pointerup', done);
  b.addEventListener('pointercancel', done);
  b.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); enter(); } });
})();
