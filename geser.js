
/* geser daftar dengan jari (tahan & tarik, ada momentum) atau klik-tahan mouse.
   Dikerjakan lewat JS supaya tetap jalan walau body memakai touch-action:none. */
(function(){
  var SEL = '.pglist,.cplist,.splist,.sgrid,.spf,#fTL,.mlist,.mdtext,.ivlist,.upc', st = null, moved = false, fingers = {}, raf = 0;
  function swallow(e){ e.stopPropagation(); e.preventDefault(); }
  function canScroll(el){ return el.scrollHeight > el.clientHeight + 1; }
  function findScroller(t){
    var el = t.closest && t.closest(SEL);
    while (el && !canScroll(el)) el = el.parentElement ? el.parentElement.closest(SEL) : null;
    return el;
  }
  function stopMomentum(){ if (raf){ cancelAnimationFrame(raf); raf = 0; } }
  function pos(e, rot){ return rot ? -e.clientX : e.clientY; }   // portrait: stage diputar 90deg, sumbu tegak stage = sumbu X layar (terbalik)
  document.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'touch') fingers[e.pointerId] = 1;
    stopMomentum();
    if (Object.keys(fingers).length > 1){ if (st){ st.el.style.cursor = ''; st = null; moved = false; } return; }   // 2 jari = zoom
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!e.target.closest || e.target.closest('input,select,textarea')) return;
    var el = findScroller(e.target); if (!el) return;
    var fi = window.__fitInfo || { rotated: false, scale: 1 }, sc = fi.scale || 1, rot = !!fi.rotated;
    st = { el: el, y: pos(e, rot), rot: rot, top: el.scrollTop, id: e.pointerId, sc: sc, touch: e.pointerType === 'touch', s: [{ t: performance.now(), y: pos(e, rot) }] };
    moved = false;
  }, true);
  document.addEventListener('pointermove', function(e){
    if (!st || e.pointerId !== st.id) return;
    var py = pos(e, st.rot), dy = py - st.y;
    if (!moved){ if (Math.abs(dy) < (st.touch ? 8 : 6)) return; moved = true; st.el.style.cursor = 'grabbing'; }
    st.el.scrollTop = st.top - dy / st.sc;
    var now = performance.now(); st.s.push({ t: now, y: py });
    while (st.s.length > 2 && now - st.s[0].t > 100) st.s.shift();
    if (e.cancelable) e.preventDefault();
  }, true);
  function end(e){
    if (e.pointerType === 'touch') delete fingers[e.pointerId];
    if (!st || e.pointerId !== st.id) return;
    var el = st.el, sc = st.sc, s = st.s, was = moved;
    el.style.cursor = '';
    if (was){
      document.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(function(){ document.removeEventListener('click', swallow, true); }, 60);
      var a = s[0], z = s[s.length - 1], dt = z.t - a.t, v = dt > 0 ? (a.y - z.y) / dt / sc : 0;   // px/ms (arah scrollTop)
      if (st.touch && e.type === 'pointerup' && Math.abs(v) > 0.05 && performance.now() - z.t < 160){
        var last = performance.now();
        var step = function(now){
          var d = Math.min(now - last, 32); last = now;
          var before = el.scrollTop; el.scrollTop = before + v * d; v *= Math.pow(0.94, d / 16);
          if (Math.abs(v) < 0.02 || el.scrollTop === before){ raf = 0; return; }
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
    }
    st = null; moved = false;
  }
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);
})();
