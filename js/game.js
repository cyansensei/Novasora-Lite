
(function(){
  /* ---------- Auto-fit stage (landscape normal, portrait diputar 90 derajat) ---------- */
  var W = 1280, H = 576, fit = document.getElementById('fit'), rotated = null;
  var Z = window.__Z = {z:1, px:0, py:0};
  var probe = document.createElement('div'); probe.id = 'saProbe'; document.body.appendChild(probe);
  function layout(){
    var vw = window.innerWidth || document.documentElement.clientWidth, vh = window.innerHeight || document.documentElement.clientHeight;
    var iT = 0, iR = 0, iB = 0, iL = 0;   // inset notch/safe-area diabaikan: stage selalu penuh sampai tepi fisik layar (tidak ada batas yang bergeser saat layar penuh)
    var aw = Math.max(1, vw - iL - iR), ah = Math.max(1, vh - iT - iB);   // area aman (di luar notch / sudut layar)
    var rot = vh > vw, s;
    if (rotated !== null && rot !== rotated){ Z.z = 1; Z.px = 0; Z.py = 0; }   // ganti orientasi: zoom/geser di-reset
    rotated = rot;
    s = rot ? Math.min(ah / W, aw / H) : Math.min(aw / W, ah / H);
    // stage dibuat selebar/setinggi area aman (dalam satuan desain) -> tidak ada celah di sisi mana pun
    var sw = (rot ? ah : aw) / s, sh = (rot ? aw : ah) / s;
    fit.style.width = sw + 'px'; fit.style.height = sh + 'px';
    var ex = Math.max(0, sw - W), ey = Math.max(0, sh - H);
    fit.style.setProperty('--ex', ex + 'px'); fit.style.setProperty('--exh', (ex / 2) + 'px');
    fit.style.setProperty('--ey', ey + 'px'); fit.style.setProperty('--eyh', (ey / 2) + 'px');
    var cx = iL + aw / 2, cy = iT + ah / 2;
    fit.style.left = cx + 'px'; fit.style.top = cy + 'px';
    fit.style.transform = 'translate(' + Z.px + 'px,' + Z.py + 'px) translate(-50%,-50%)' + (rot ? ' rotate(90deg)' : '') + ' scale(' + (s * Z.z) + ')';
    window.__fitInfo = { rotated: rot, scale: s * Z.z, cx: cx, cy: cy };
  }
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', layout);
  window.__layout = layout;
  layout();

  /* ---------- Data contoh (cukup ganti nilai ini) ---------- */
  var DATA = {
    player:  { name: 'Cyan', level: 90, exp: 1000, expMax: 1000 },
    energy:  [19, 240],
    credit:  18005747,
    diamond: 30566,
    streak:  12
  };
  function $(s){ return document.querySelector(s); }
  function fmt(n){ return n.toLocaleString('en-US'); }

  $('#pLv').textContent = DATA.player.level;
  $('#pName').textContent = DATA.player.name;
  $('#pExpTxt').textContent = DATA.player.exp >= DATA.player.expMax ? 'MAX' : DATA.player.exp + '/' + DATA.player.expMax;
  $('#vEnergy').textContent = DATA.energy[0] + '/' + DATA.energy[1];
  $('#vCredit').textContent = fmt(DATA.credit);
  $('#vDiamond').textContent = fmt(DATA.diamond);

  setTimeout(function(){ $('#pExp').style.width = (DATA.player.exp / DATA.player.expMax * 100) + '%'; }, 150);

  /* ======================================================================
     KANAN ATAS: pilih karakter / surat / menu / layar penuh
     ====================================================================== */
  var stageEl = $('#stage'), ov = $('#ov'), scrim = $('#scrim');
  var pMail = $('#pMail'), dMenu = $('#dMenu'), dMode = $('#dMode');
  /* ---- popup konfirmasi umum: askConfirm({ title, text, ok, danger }, onOk) ---- */
  var cfCb = null, cfT0 = 0;
  $('#stage').insertAdjacentHTML('beforeend', '<div id="cfOv"><div class="cfpop" role="alertdialog" aria-modal="true"><div class="cft" id="cfT"></div><div class="cfx" id="cfX"></div>' +
    '<div class="cfa"><button type="button" class="spbtn alt" id="cfNo">Batal</button><button type="button" class="spbtn" id="cfYes"></button></div></div></div>');
  function closeConfirm(){ $('#cfOv').classList.remove('on'); cfCb = null; }
  function askConfirm(o, cb){
    $('#cfT').textContent = o.title; $('#cfX').textContent = o.text || '';
    var y = $('#cfYes'); y.textContent = o.ok || 'Ya'; y.classList.toggle('danger', !!o.danger);
    cfCb = cb; cfT0 = Date.now(); $('#cfOv').classList.add('on');
  }
  $('#cfNo').addEventListener('click', closeConfirm);
  $('#cfYes').addEventListener('click', function(){ if (Date.now() - cfT0 < 350) return; var f = cfCb; closeConfirm(); if (f) f(); });
  $('#cfOv').addEventListener('click', function(e){ if (e.target === this) closeConfirm(); });
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape' && $('#cfOv').classList.contains('on')){ e.stopImmediatePropagation(); e.preventDefault(); closeConfirm(); } }, true);
  var toastEl = $('#toast'), toastT;
  function toast(msg){
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, 1900);
  }
  function closeAll(){
    pMail.classList.remove('open'); dMenu.classList.remove('open'); dMode.classList.remove('open');
    scrim.classList.remove('on'); scrim.classList.remove('lite');
  }
  scrim.addEventListener('click', closeAll);
  /* --- tombol Play: popup pilih mode --- */
  document.querySelector('.play').addEventListener('click', function(){
    if (dMode.classList.contains('open')){ closeAll(); return; }
    closeAll(); dMode.classList.add('open'); scrim.classList.add('on', 'lite');
  });
  $('#mClose').addEventListener('click', closeAll);
  Array.prototype.forEach.call(dMode.querySelectorAll('[data-mode]'), function(b){
    b.addEventListener('click', function(){ toast(b.getAttribute('data-mode') + ' segera hadir'); });
  });
  Array.prototype.forEach.call(ov.querySelectorAll('[data-close]'), function(b){ b.addEventListener('click', closeAll); });

  /* --- halaman surat --- */
  var MAILS = [
    { id: 1, from: 'Admin', title: 'Selamat datang di RPG Lobby!', time: 'Hari ini', read: false, claimed: false,
      body: 'Terima kasih sudah bergabung. Selesaikan task harianmu setiap hari untuk menjaga streak dan mendapatkan hadiah.',
      reward: { label: 'Diamond ×100', diamond: 100 } },
    { id: 2, from: 'Sistem', title: 'Hadiah Streak 10 Hari', time: 'Kemarin', read: false, claimed: false,
      body: 'Kamu berhasil mempertahankan streak selama 10 hari berturut-turut. Pertahankan terus!',
      reward: { label: 'Credit ×50,000', credit: 50000 } },
    { id: 3, from: 'Admin', title: 'Pembaruan versi 1.0', time: '3 hari lalu', read: true, claimed: true,
      body: 'Tampilan lobi baru sudah tersedia. Terima kasih atas dukunganmu.', reward: null }
  ];
  var selMail = null;
  function unreadCount(){ return MAILS.filter(function(m){ return !m.read; }).length; }
  function renderMail(){
    var body = $('#mBody'); body.innerHTML = '';
    $('#mCount').textContent = MAILS.length ? ('Belum dibaca: ' + unreadCount() + ' / ' + MAILS.length) : '';
    $('#mDel').style.display = MAILS.length ? '' : 'none';
    if (!MAILS.length){
      body.innerHTML = '<div class="empty">Tidak ada surat</div>'; return;
    }
    if (!MAILS.some(function(m){ return m.id === selMail; })) selMail = MAILS[0].id;
    MAILS.forEach(function(m){ if (m.id === selMail) m.read = true; });
    $('#mCount').textContent = 'Belum dibaca: ' + unreadCount() + ' / ' + MAILS.length;
    var list = document.createElement('div'); list.className = 'mlist';
    MAILS.forEach(function(m){
      var r = document.createElement('button'); r.className = 'mrow' + (m.id === selMail ? ' sel' : '');
      r.className += (m.read ? ' dim' : '');
      r.innerHTML = '<span class="mic"><svg viewBox="0 0 64 48"><use href="#i-mail"/></svg></span><span class="mt"><b>' + m.title + '</b><small>' + m.from + ' · ' + m.time +
        '</small></span>' + (m.reward && !m.claimed ? '<em class="mgift">Hadiah</em>' : '') + (m.read ? '' : '<i class="un"></i>');
      r.addEventListener('click', function(){ selMail = m.id; m.read = true; renderMail(); });
      list.appendChild(r);
    });
    var cur = MAILS.filter(function(m){ return m.id === selMail; })[0]; cur.read = true;
    var det = document.createElement('div'); det.className = 'mdetail';
    det.innerHTML = '<div class="mdhead"><span class="mav"><svg viewBox="0 0 64 48"><use href="#i-mail"/></svg></span><div><h3>' + cur.title + '</h3><div class="meta">' + cur.from + ' · ' + cur.time + '</div></div></div>' +
      '<div class="mdtext"><p>' + cur.body + '</p></div>' +
      (cur.reward ? '<div class="rw' + (cur.claimed ? ' done' : '') + '"><span class="rwi"><svg><use href="#' + (cur.reward.diamond ? 'i-gem' : 'i-credit') + '"/></svg></span><span class="rwt"><small>' + (cur.claimed ? 'Hadiah sudah diklaim' : 'Hadiah terlampir') + '</small><b>' + cur.reward.label + '</b></span><button class="btn" id="mClaim"' + (cur.claimed ? ' disabled' : '') + '>' + (cur.claimed ? 'Diklaim' : 'Klaim') + '</button></div>' : '');
    body.appendChild(list); body.appendChild(det);
    var cl = $('#mClaim');
    if (cl) cl.addEventListener('click', function(){
      if (cur.claimed) return; cur.claimed = true;
      if (cur.reward.diamond){ DATA.diamond += cur.reward.diamond; $('#vDiamond').textContent = fmt(DATA.diamond); }
      if (cur.reward.credit){ DATA.credit += cur.reward.credit; $('#vCredit').textContent = fmt(DATA.credit); }
      queueReward({ c:cur.reward.credit, d:cur.reward.diamond, x:0 }, 0); renderMail();
    });
  }
  $('#bMail').addEventListener('click', function(){
    closeAll(); renderMail(); pMail.classList.add('open');
  });
  $('#mDel').addEventListener('click', function(){
    var before = MAILS.length;
    MAILS = MAILS.filter(function(m){ return !(m.read && (m.claimed || !m.reward)); });
    toast(before === MAILS.length ? 'Tidak ada surat yang bisa dihapus' : 'Surat dihapus'); renderMail();
  });

  /* --- Tab Menu popup mengambang (pengaturan ada di dalamnya) --- */
  var curView = 'menu';
  var VT = { menu: 'Menu Tab', set: 'Pengaturan' };
  var VID = { menu:'vMenu', set:'vSet' };
  var BACK = { set:'menu' };
  function showView(v){
    curView = v;
    Object.keys(VID).forEach(function(n){ $('#' + VID[n]).classList.toggle('on', n === v); });
    $('#dTitle').textContent = VT[v];
    $('#dBack').hidden = (v === 'menu');
  }
  $('#bMenu').addEventListener('click', function(){
    closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on','lite');
  });
  $('#rSet').addEventListener('click', function(){ showView('set'); });
  $('#dBack').addEventListener('click', function(){ showView(BACK[curView] || 'menu'); });
  Array.prototype.forEach.call(ov.querySelectorAll('[data-soon]'), function(b){
    b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); });
  });
  Array.prototype.forEach.call(ov.querySelectorAll('[data-sw]'), function(b){
    b.addEventListener('click', function(){ b.querySelector('.sw').classList.toggle('on'); });
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    closeAll();
  });
  /* ===================== SHOP ===================== */
  function esc(t){ return String(t).replace(/[&<>"]/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]; }); }
  var DEF = {
    credit: [
      { id:1, name:'Novice Activity Report',   price:12500,  qty:5, type:'laporan', color:'biru' },
      { id:2, name:'Normal Activity Report',   price:125000, qty:5, type:'laporan', color:'biru' },
      { id:3, name:'Advanced Activity Report', price:300000, qty:3, type:'laporan', color:'oranye' },
      { id:4, name:'Superior Activity Report', price:500000, qty:1, type:'laporan', color:'ungu' },
      { id:5, name:'Lesser Enhancement Stone',   price:8000,   qty:5, type:'batu', color:'abu' },
      { id:6, name:'Normal Enhancement Stone',   price:40000,  qty:5, type:'batu', color:'biru' },
      { id:7, name:'Advanced Enhancement Stone', price:150000, qty:3, type:'batu', color:'oranye' },
      { id:8, name:'Superior Enhancement Stone', price:400000, qty:1, type:'batu', color:'ungu' }
    ],
    diamond: [
      { id:101, name:'Energy Drink', price:30,  qty:1, type:'hadiah', color:'hijau' },
      { id:102, name:'Credit Box',   price:100, qty:1, type:'hadiah', color:'oranye' },
      { id:103, name:'Superior Stone', price:150, qty:1, type:'batu', color:'ungu' }
    ]
  };
  var SHOP = JSON.parse(JSON.stringify(DEF)), shopTab = 'credit';

  var shopEl = $('#shop');
  function nameCls(n){ // 13px (seperti referensi) bila muat 2 baris; kalau tidak, kecilkan
    function lines(cpl){ var w = String(n).split(' '), l = 1, cur = 0; w.forEach(function(x){ if (cur && cur + 1 + x.length > cpl){ l++; cur = x.length; } else cur += (cur ? 1 : 0) + x.length; }); return l; }
    if (lines(15) <= 2) return ''; if (lines(18) <= 2) return ' m'; return ' s';
  }
  function renderShop(){
    $('#stCredit').classList.toggle('sel', shopTab === 'credit');
    $('#stDiamond').classList.toggle('sel', shopTab === 'diamond');
    var g = $('#sGrid'), list = SHOP[shopTab]; g.innerHTML = '';
    if (!list.length){ g.innerHTML = '<div class="sempty">Belum ada barang.</div>'; return; }
    list.forEach(function(it){
      var c = document.createElement('div'); c.className = 'scard';
      c.innerHTML = '<div class="sname' + nameCls(it.name) + '">' + esc(it.name) + '</div><div class="simg"><b class="sx">x' + it.qty + '</b></div><button class="sbuy"><span class="sbg"></span><span class="sprice"><i class="pbar"></i><svg class="' + (shopTab === 'credit' ? 'cr' : 'gm') + '"><use href="#' + (shopTab === 'credit' ? 'i-credit' : 'i-gem') +
        '"/></svg><b' + (fmt(it.price).length > 6 ? ' class="long"' : '') + '>' + fmt(it.price) + '</b></span><span class="sbtn">Purchase</span></button>';
      c.querySelector('.sbuy').addEventListener('click', function(){
        var k = shopTab;
        if (DATA[k] < it.price){ toast((k === 'credit' ? 'Credit' : 'Diamond') + ' tidak cukup'); return; }
        DATA[k] -= it.price; DATA.stats.buys++; saveBal(); updRes(); toast('Dibeli: ' + it.name + ' x' + it.qty);
      });
      g.appendChild(c);
    });
  }
  /* ---- loading antar halaman: layar hitam hanya selama halaman tujuan disiapkan (lama menyesuaikan performa perangkat) ---- */
  var ldBusy = false;
  function ldReady(){
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var work = fonts.then(function(){
      return Promise.all(Array.prototype.map.call(document.images, function(im){ return im.decode ? im.decode().catch(function(){}) : Promise.resolve(); }));
    }).then(function(){
      return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    });
    return Promise.race([work, new Promise(function(r){ setTimeout(r, 4000); })]);
  }
  function go(fn){
    var ldEl = document.getElementById('ldr'); if (ldBusy) return;
    if (!ldEl){ fn(); return; }
    ldBusy = true; ldEl.classList.add('on');
    setTimeout(function(){
      try { fn(); } catch (e) { if (window.console) console.error(e); }
      ldReady().then(function(){ ldEl.classList.remove('on'); setTimeout(function(){ ldBusy = false; }, 120); });
    }, 170);
  }

  /* ---- Char: halaman formasi (tampilan karakter & daftar karakter dihapus dulu) ---- */
  var cpEl = $('#cp'), cpSlot = null;
  function renderChar(){
    updRes();
    Array.prototype.forEach.call(cpEl.querySelectorAll('.cpfb'), function(b){ b.classList.toggle('sel', Number(b.getAttribute('data-f')) === Char.formAktif()); });
    Array.prototype.forEach.call(cpEl.querySelectorAll('.cps'), function(b){ b.classList.toggle('sel', cpSlot === Number(b.getAttribute('data-i'))); });
  }
  function openChar(){ closeAll(); closeShop(); closePage(); cpSlot = null; closeCpPop(); renderChar(); cpEl.classList.add('on'); }
  function closeChar(){ cpEl.classList.remove('on'); closeCpPop(); }
  function openCpPop(t){ $('#cpPopT').textContent = t; $('#cpPopB').textContent = 'Halaman ' + t + ' masih kosong.'; $('#cpPop').classList.add('on'); $('#cpOv').classList.add('on'); }
  function closeCpPop(){ $('#cpPop').classList.remove('on'); $('#cpOv').classList.remove('on'); }
  Array.prototype.forEach.call(cpEl.querySelectorAll('.cpfb'), function(b){
    b.addEventListener('click', function(){
      var n = Number(b.getAttribute('data-f')); if (n === Char.formAktif()) return;
      Char.setForm(n); saveGame(); cpSlot = null; renderChar();
    });
  });
  Array.prototype.forEach.call(cpEl.querySelectorAll('.cps'), function(b){
    b.addEventListener('click', function(){
      var i = Number(b.getAttribute('data-i')); cpSlot = (cpSlot === i) ? null : i; renderChar();
    });
  });
  $('#cBack').addEventListener('click', function(){ go(closeChar); });
  $('#cHome').addEventListener('click', function(){ go(closeChar); });
  $('#cGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });
  Array.prototype.forEach.call(cpEl.querySelectorAll('[data-soon]'), function(b){ b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); }); });
  $('#cpSkill .orb').innerHTML = $('#bSkill .orb').innerHTML; /* ikon Skill sama seperti di lobi */
  $('#cpChar').addEventListener('click', function(){ openCpPop('Char'); });
  $('#cpSkill').addEventListener('click', function(){ openCpPop('Skill'); });
  $('#cpPopX').addEventListener('click', closeCpPop);
  $('#cpOv').addEventListener('click', closeCpPop);
  document.querySelector('.nav[aria-label="Formation"]').addEventListener('click', function(){ go(openChar); });
  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape' || !cpEl.classList.contains('on')) return;
    if ($('#cpPop').classList.contains('on')){ closeCpPop(); return; }
    if (!(dMenu.classList.contains('open') || pMail.classList.contains('open'))) go(closeChar);
  }, true);

  function openShop(){ closeAll(); closeChar(); updRes(); renderShop(); shopEl.classList.add('on'); }
  function closeShop(){ shopEl.classList.remove('on'); }
  $('#bShop').addEventListener('click', function(){ go(openShop); });
  $('#sBack').addEventListener('click', function(){ go(closeShop); });
  $('#sHome').addEventListener('click', function(){ go(closeShop); });
  $('#sGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });
  $('#stCredit').addEventListener('click', function(){ shopTab = 'credit'; $('#sGrid').scrollTop = 0; renderShop(); });
  $('#stDiamond').addEventListener('click', function(){ shopTab = 'diamond'; $('#sGrid').scrollTop = 0; renderShop(); });
  Array.prototype.forEach.call(shopEl.querySelectorAll('[data-soon]'), function(b){
    b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); });
  });
  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape' || !shopEl.classList.contains('on')) return;
    if (!(dMenu.classList.contains('open') || pMail.classList.contains('open'))) go(closeShop);
  }, true);

  updRes();

  /* ===================== SISTEM GAME RPG (Task, Challenge, Achievement, hadiah & EXP) ===================== */
  var KIND = { task:{ n:'Task', ic:'i-task' }, chal:{ n:'Recruit', ic:'i-challenge' }, ach:{ n:'Formation', ic:'i-trophy' }, skill:{ n:'Skill', ic:'i-task' }, craft:{ n:'Craft', ic:'i-task' }, inv:{ n:'Inventory', ic:'i-bag' }, char:{ n:'Char', ic:'i-char' }, social:{ n:'Social', ic:'i-task' } };
  function today(){ return new Date().toLocaleDateString('en-CA'); }
  function ago(){ var d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString('en-CA'); }
  function RW(c, d, x){ return { c:c, d:d, x:x }; }
  function weekKey(){ var d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toLocaleDateString('en-CA'); }

  /* ===== KATALOG ITEM (rancangan Story 2): hanya Water + Universal; Affinity lain menyusul ===== */
  var ENH_STONE_EXP = [10, 40, 160, 640];
  var IV_V = [1, 4, 16, 64, 256], ASC_V = [0, 1, 4, 16, 64], IV_EXP = [0, 100, 400, 1600, 6400];   /* Ascension Seal: G1 (putih) dihapus; mulai G2 (abu-abu) = 1, x4 tiap grade */   /* G1 dihapus; mulai G2 (abu-abu) = 100, x4 tiap grade */
  var IV_TABS = [{ n:'Artifact', ic:'art' }, { n:'Manual & Core', ic:'man' }, { n:'Universal', ic:'exp' }, { n:'Equipment', ic:'eq' }];
  var IV_FAMS = [
    { tab:0, pre:'WAT', code:'SKART', ic:'art', fam:'Skill Artifact', aff:'Water', names:['Ripple Fragment','Current Shard','Tidal Crystal','Deepwater Essence','Oceanheart Relic'], d:function(g){ return 'Bahan upgrade Skill karakter Affinity Water. Dipakai bersama Skill Manual, jumlah tiap Grade harus pas sesuai resep.'; } },
    { tab:0, pre:'WAT', code:'ULTART', ic:'art', fam:'Ultimate Artifact', aff:'Water', names:['Surge Fragment','Maelstrom Shard','Abyssal Pearl','Leviathan Scale','Primordial Tide Core'], d:function(g){ return 'Bahan upgrade Ultimate karakter Affinity Water. Dipakai bersama Ultimate Manual, jumlah tiap Grade harus pas sesuai resep.'; } },
    { tab:0, pre:'WAT', code:'PASART', ic:'art', fam:'Passive Artifact', aff:'Water', names:['Dew Rune','Ripple Rune','Current Sigil','Abyssal Sigil','Eternal Tide Relic'], d:function(g){ return 'Bahan upgrade Passive karakter Affinity Water. Dipakai bersama Passive Core, jumlah tiap Grade harus pas sesuai resep.'; } },
    { tab:1, pre:'WAT', code:'SKMAN', ic:'man', fam:'Skill Manual', aff:'Water', names:['Flow Notes','Current Manual','Tidal Technique Manual','Deepwater Codex','Oceanic Grimoire'], d:function(g){ return 'Bahan upgrade Skill karakter Affinity Water. Dipakai bersama Skill Artifact, jumlah tiap Grade harus pas sesuai resep.'; } },
    { tab:1, pre:'WAT', code:'ULTMAN', ic:'man', fam:'Ultimate Manual', aff:'Water', names:['Surge Invocation','Tidal Invocation','Maelstrom Scripture','Abyssal Codex','Sovereign Tide Grimoire'], d:function(g){ return 'Bahan upgrade Ultimate karakter Affinity Water. Dipakai bersama Ultimate Artifact, jumlah tiap Grade harus pas sesuai resep.'; } },
    { tab:1, pre:'WAT', code:'PASCORE', ic:'core', fam:'Passive Core', aff:'Water', names:['Mist Core','Flow Core','Tidal Core','Deepsea Core','Oceanic Heart'], d:function(g){ return 'Memberi nilai untuk upgrade Passive karakter Water. Grade bebas digabung sampai total nilai terpenuhi. Nilai Grade: ' + IV_V[g - 1] + '.'; } },
    { tab:2, pre:'UNI', code:'EXP', skip:1, ic:'exp', fam:'Training Report', aff:'', names:['Basic Training Report','Standard Training Report','Advanced Training Report','Expert Training Report','Master Training Report'], d:function(g){ return 'Memberi EXP karakter sebesar ' + IV_EXP[g - 1].toLocaleString('en-US') + '. Semua Grade bisa dipakai.'; } },
    { tab:2, pre:'UNI', code:'ASC', skip:1, ic:'seal', fam:'Ascension Seal', aff:'', names:['Minor Ascension Seal','Standard Ascension Seal','Refined Ascension Seal','Greater Ascension Seal','Supreme Ascension Seal'], d:function(g){ return 'Dipakai untuk Ascension karakter agar batas level naik. Grade bebas digabung. Nilai Grade: ' + ASC_V[g - 1] + '.'; } },
    { tab:2, pre:'UNI', code:'TALENT', ic:'badge', fam:'Talent Insignia', aff:'', names:['Talent Insignia'], none:true, id:'UNI_TALENT_UNLOCK', d:function(g){ return 'Membuka Unique Weapon karakter dan tiap Star-nya. Star 1 = batas Lv. 30, Star 2 = Lv. 40, Star 3 = Lv. 50. Butuh 1 Insignia per Star. Tanpa Grade.'; } },
    { tab:2, pre:'UNI', code:'ENH', ic:'enh', fam:'Enhancement Stone', aff:'', names:['Blue Enhancement Stone','Green Enhancement Stone','Purple Enhancement Stone','Yellow Enhancement Stone'], d:function(g){ return 'Bahan enhancement Equipment untuk semua kategori. Memberi ' + ENH_STONE_EXP[g - 1].toLocaleString('en-US') + ' EXP. Keempat grade bisa digabung dalam satu proses enhancement, dan batu yang dipakai akan habis.'; } },
    { tab:2, pre:'UNI', code:'TALENT', ic:'prism', skip:1, fam:'Talent Prism', aff:'', names:['Dull Talent Prism','Polished Talent Prism','Refined Talent Prism','Radiant Talent Prism','Supreme Talent Prism'], d:function(g){ return 'Bahan upgrade level Unique Weapon. Grade bebas digabung. Nilai Grade: ' + IV_V[g - 1] + '.'; } }
  ];
  var IV_ITEMS = [];
  IV_FAMS.forEach(function(f, fi){
    f.names.forEach(function(n, gi){
      if (f.skip && gi < f.skip) return;
      var g = f.none ? 0 : gi + 1;
      IV_ITEMS.push({ id: f.id || (f.pre + '_' + f.code + '_0' + g), name:n, g:g, fi:fi, tab:f.tab, ic:f.ic, fam:f.fam, aff:f.aff, desc:f.d(g), use:false });
    });
  });
  IV_ITEMS.forEach(function(it){ if (it.fam === 'Enhancement Stone') it.ic = 'enh_' + it.g; });
  var EQ_IMG = {
    'enh_1':'assets/img/items/enh_1.png',
    'enh_2':'assets/img/items/enh_2.png',
    'enh_3':'assets/img/items/enh_3.png',
    'enh_4':'assets/img/items/enh_4.png',
    'eq_rusty_sword':'assets/img/equipment/eq_rusty_sword.webp',
    'eq_wooden_bow':'assets/img/equipment/eq_wooden_bow.webp',
    'eq_apprentice_staff':'assets/img/equipment/eq_apprentice_staff.webp',
    'eq_iron_sword':'assets/img/equipment/eq_iron_sword.webp',
    'eq_hunters_bow':'assets/img/equipment/eq_hunters_bow.webp',
    'eq_adept_staff':'assets/img/equipment/eq_adept_staff.webp',
    'eq_leather_armor':'assets/img/equipment/eq_leather_armor.webp',
    'eq_wooden_shield':'assets/img/equipment/eq_wooden_shield.webp',
    'eq_iron_armor':'assets/img/equipment/eq_iron_armor.webp',
    'eq_reinforced_shield':'assets/img/equipment/eq_reinforced_shield.webp',
    'eq_copper_ring':'assets/img/equipment/eq_copper_ring.webp',
    'eq_simple_pendant':'assets/img/equipment/eq_simple_pendant.webp',
    'eq_silver_ring':'assets/img/equipment/eq_silver_ring.webp',
    'eq_mana_pendant':'assets/img/equipment/eq_mana_pendant.webp'
  };
  /* Data equipment (Cyan_Equipment_Data v1.0). Stat belum ditampilkan di Inventory. Material, biaya, dan cara dapat belum dirancang. */
  var EQ_DEF = {"rusty_sword": {"id": "rusty_sword", "name": "Rusty Sword", "grade": 1, "category": "Weapon", "subtype": "Sword", "description": "Pedang tua dengan bilah berkarat dan gagang aus. Meski sederhana, senjata ini masih layak menemani petualang pemula.", "lore": "Konon pedang seperti ini pernah menjadi perlengkapan penjaga desa.", "min_level": 1, "max_level": 10, "base_stats": {"ATK": 5}, "growth_per_level": {"ATK": 1}, "icon": "Grade_1/Rusty_Sword.png"}, "wooden_bow": {"id": "wooden_bow", "name": "Wooden Bow", "grade": 1, "category": "Weapon", "subtype": "Bow", "description": "Busur sederhana dari kayu lentur. Ringan dan mudah digunakan, meski daya hancurnya terbatas.", "lore": "Busur latihan yang sering dibuat untuk pemburu muda.", "min_level": 1, "max_level": 10, "base_stats": {"ATK": 3, "CRT_RATE": 1, "SPD": 1}, "growth_per_level": {"ATK": 1, "CRT_RATE": 0.1, "SPD": 0.2}, "icon": "Grade_1/Wooden_Bow.png"}, "apprentice_staff": {"id": "apprentice_staff", "name": "Apprentice Staff", "grade": 1, "category": "Weapon", "subtype": "Staff", "description": "Tongkat sihir pemula dengan kristal kecil di ujungnya untuk menyalurkan energi sihir.", "lore": "Sering diberikan kepada murid yang baru mempelajari dasar-dasar sihir.", "min_level": 1, "max_level": 10, "base_stats": {"MATK": 5, "MP": 5}, "growth_per_level": {"MATK": 1, "MP": 1}, "icon": "Grade_1/Apprentice_Staff.png"}, "iron_sword": {"id": "iron_sword", "name": "Iron Sword", "grade": 2, "category": "Weapon", "subtype": "Sword", "description": "Pedang besi dengan bilah lebih tebal dan tajam dibanding senjata pemula.", "lore": "Senjata standar bagi petualang yang mulai menghadapi ancaman lebih berat.", "min_level": 1, "max_level": 20, "base_stats": {"ATK": 12}, "growth_per_level": {"ATK": 2}, "icon": "Grade_2/Iron_Sword.png"}, "hunters_bow": {"id": "hunters_bow", "name": "Hunter's Bow", "grade": 2, "category": "Weapon", "subtype": "Bow", "description": "Busur dari kayu pilihan dengan lengkungan stabil, dirancang untuk tembakan kuat dan terarah.", "lore": "Disukai pemburu berpengalaman karena keseimbangan kekuatan dan kelincahannya.", "min_level": 1, "max_level": 20, "base_stats": {"ATK": 8, "CRT_RATE": 2, "SPD": 2}, "growth_per_level": {"ATK": 1, "CRT_RATE": 0.2, "SPD": 0.2}, "icon": "Grade_2/Hunters_Bow.png"}, "adept_staff": {"id": "adept_staff", "name": "Adept Staff", "grade": 2, "category": "Weapon", "subtype": "Staff", "description": "Tongkat sihir dengan kristal lebih besar dan rangka yang diperkuat untuk menyalurkan sihir lebih kuat.", "lore": "Dibuat bagi penyihir yang telah melewati tahap latihan dasar.", "min_level": 1, "max_level": 20, "base_stats": {"MATK": 10, "MP": 15}, "growth_per_level": {"MATK": 1, "MP": 2}, "icon": "Grade_2/Adept_Staff.png"}, "leather_armor": {"id": "leather_armor", "name": "Leather Armor", "grade": 1, "category": "Armor", "subtype": "Body Armor", "description": "Pelindung tubuh dari beberapa lapis kulit yang dijahit kuat. Ringan dan memberi perlindungan dasar.", "lore": "Pilihan umum petualang yang mengutamakan keluwesan.", "min_level": 1, "max_level": 10, "base_stats": {"DEF": 5}, "growth_per_level": {"DEF": 1}, "icon": "Grade_1/Leather_Armor.png"}, "wooden_shield": {"id": "wooden_shield", "name": "Wooden Shield", "grade": 1, "category": "Armor", "subtype": "Shield", "description": "Perisai kayu bundar dengan lapisan logam sederhana di bagian tengah.", "lore": "Perisai sederhana yang mudah diperbaiki oleh pengrajin desa.", "min_level": 1, "max_level": 10, "base_stats": {"DEF": 3, "HP": 5}, "growth_per_level": {"DEF": 1, "HP": 1}, "icon": "Grade_1/Wooden_Shield.png"}, "iron_armor": {"id": "iron_armor", "name": "Iron Armor", "grade": 2, "category": "Armor", "subtype": "Body Armor", "description": "Baju zirah besi yang menutupi bagian penting tubuh dan memberi perlindungan kuat.", "lore": "Umum digunakan penjaga dan petualang yang sering berhadapan langsung dengan musuh.", "min_level": 1, "max_level": 20, "base_stats": {"DEF": 12, "MDEF": 4}, "growth_per_level": {"DEF": 2, "MDEF": 1}, "icon": "Grade_2/Iron_Armor.png"}, "reinforced_shield": {"id": "reinforced_shield", "name": "Reinforced Shield", "grade": 2, "category": "Armor", "subtype": "Shield", "description": "Perisai kokoh dengan rangka logam dan permukaan kayu yang diperkuat.", "lore": "Dipilih petualang yang mengutamakan keselamatan saat menjelajah.", "min_level": 1, "max_level": 20, "base_stats": {"DEF": 8, "HP": 15, "MDEF": 3}, "growth_per_level": {"DEF": 1, "HP": 2, "MDEF": 0.5}, "icon": "Grade_2/Reinforced_Shield.png"}, "copper_ring": {"id": "copper_ring", "name": "Copper Ring", "grade": 1, "category": "Accessory", "subtype": "Ring", "description": "Cincin tembaga polos dengan bentuk sederhana, cukup kuat untuk digunakan sehari-hari.", "lore": "Cincin seperti ini kerap menjadi pembelian pertama seorang petualang.", "min_level": 1, "max_level": 10, "base_stats": {"HP": 10}, "growth_per_level": {"HP": 2}, "icon": "Grade_1/Copper_Ring.png"}, "simple_pendant": {"id": "simple_pendant", "name": "Simple Pendant", "grade": 1, "category": "Accessory", "subtype": "Pendant", "description": "Liontin sederhana dengan batu biru kecil yang menyimpan sedikit energi.", "lore": "Batu biru ini sering dianggap simbol awal perjalanan seorang pengelana.", "min_level": 1, "max_level": 10, "base_stats": {"MP": 10, "MDEF": 1, "SPD": 1}, "growth_per_level": {"MP": 2, "MDEF": 0.2, "SPD": 0.1}, "icon": "Grade_1/Simple_Pendant.png"}, "silver_ring": {"id": "silver_ring", "name": "Silver Ring", "grade": 2, "category": "Accessory", "subtype": "Ring", "description": "Cincin perak dengan permata biru yang dipercaya membantu penggunanya menemukan celah lawan.", "lore": "Perhiasan yang kerap menjadi hadiah bagi petualang setelah tugas sulit.", "min_level": 1, "max_level": 20, "base_stats": {"HP": 25, "CRT_DMG": 5}, "growth_per_level": {"HP": 3, "CRT_DMG": 0.5}, "icon": "Grade_2/Silver_Ring.png"}, "mana_pendant": {"id": "mana_pendant", "name": "Mana Pendant", "grade": 2, "category": "Accessory", "subtype": "Pendant", "description": "Liontin dengan kristal biru yang mampu menyimpan energi sihir lebih banyak.", "lore": "Kristalnya diproses agar dapat menampung energi lebih besar daripada batu biasa.", "min_level": 1, "max_level": 20, "base_stats": {"MP": 25, "MDEF": 3, "SPD": 2}, "growth_per_level": {"MP": 3, "MDEF": 0.5, "SPD": 0.2}, "icon": "Grade_2/Mana_Pendant.png"}};
  /* Data EXP Enhancement Equipment (Cyan_Data_EXP_Enhancement_Equipment). HANYA DISIMPAN dulu: tombol Enhance belum memakai data ini. */
  var EQ_ENH = {
    stones: [ { grade:1, color:'Biru', exp:10 }, { grade:2, color:'Hijau', exp:40 }, { grade:3, color:'Ungu', exp:160 }, { grade:4, color:'Kuning', exp:640 } ], /* tiap naik grade = 4x EXP */
    curve: { multiplier:1.3, rounding:'up' }, /* EXP naik x1,3 tiap level, dibulatkan ke atas */
    need: { /* EXP untuk naik ke level 2, 3, ... (indeks 0 = Lv.2) */
      1: { max_level:10, exp:[20, 26, 34, 45, 59, 77, 101, 132, 172], total:666 },
      2: { max_level:20, exp:[40, 52, 68, 89, 116, 151, 197, 257, 335, 436, 567, 738, 960, 1248, 1623, 2110, 2743, 3566, 4636], total:19932 }
    },
    rules: ['Batu dipakai untuk semua kategori equipment', 'Keempat grade boleh digabung dalam satu proses', 'Batu yang dipakai dikonsumsi', 'Pemain memasukkan material manual lalu menekan Enhance', 'EXP berlebih dibawa ke level berikutnya']
  };
  var EQ_ORDER = ["rusty_sword", "wooden_bow", "apprentice_staff", "iron_sword", "hunters_bow", "adept_staff", "leather_armor", "wooden_shield", "iron_armor", "reinforced_shield", "copper_ring", "simple_pendant", "silver_ring", "mana_pendant"];
  function eqStat(inst, key){ var def = EQ_DEF[inst.id], b = def.base_stats[key] || 0, g = def.growth_per_level[key] || 0; return Math.round((b + g * (inst.lv - 1)) * 100) / 100; } /* base + growth x (level - 1); dipakai nanti di tab Eq */
  function eqDefault(){ return EQ_ORDER.map(function(id, i){ return { uid:'e' + (i + 1), id:id, lv:1 }; }); }
  function ivDefault(){
    var o = {};
    IV_ITEMS.forEach(function(it){ o[it.id] = it.g ? [240, 140, 80, 36, 12][it.g - 1] + it.fi * 3 : 6; });
    return o;
  }
  function defGame(){
    return { credit:1000000, credit1m:false, diamond:100, xpToday:0, dailyDia:'', weeklyDia:'', taskDia:null, player:{ name:'Cyan', level:1, exp:0 }, streak:0, best:0, stats:{ done:0, buys:0, tasks:0 }, last:today(), lastComplete:'', lastWeek:weekKey(),
      tasks:{
        daily:[
          { id:11, name:'Rapikan Tempat Tidur', goal:1, done:0, w:1, xg:0, reward:RW(2000,5,0), claimed:false },
          { id:12, name:'Jalan Kaki 30 Menit', goal:1, done:0, w:3, xg:0, reward:RW(2000,5,0), claimed:false },
          { id:13, name:'Tulis Jurnal', goal:1, done:0, w:2, xg:0, reward:RW(2000,5,0), claimed:false } ],
        weekly:[
          { id:21, name:'Olahraga 3 Kali', goal:3, done:0, reward:RW(15000,30,80), claimed:false },
          { id:22, name:'Beres-beres Rumah', goal:1, done:0, reward:RW(15000,30,80), claimed:false },
          { id:23, name:'Review Mingguan', goal:1, done:0, reward:RW(15000,30,80), claimed:false } ] },
      chars:[
        { id:1, name:'Aira', lv:12, color:'biru',   weapon:'Pedang Fajar' },
        { id:2, name:'Rei',  lv:8,  color:'ungu',   weapon:'Tombak Petir' },
        { id:3, name:'Kaito',lv:15, color:'oranye', weapon:'Kapak Bara' },
        { id:4, name:'Mika', lv:5,  color:'pink',   weapon:'Busur Sakura' },
        { id:5, name:'Hana', lv:3,  color:'hijau',  weapon:'Belati Daun' },
        { id:6, name:'Ryu',  lv:10, color:'abu',    weapon:'Palu Gunung' },
        { id:7, name:'Sora', lv:1,  color:'biru',   weapon:'Tongkat Awan' },
        { id:8, name:'Nami', lv:7,  color:'hijau',  weapon:'Cambuk Ombak' } ],
      forms:[ [1,2,3,4], [5,6,7,8], [1,3,5,7], [2,4,6,8] ], formSel:0,
      chals:[],
      achs:[], inv: ivDefault(), eq: eqDefault(), eqSlots:{}, prog:{} };
  }
  var sv = null; try { sv = JSON.parse(localStorage.getItem('rpg_game')); } catch (e) {}
  var base0 = defGame();
  Object.keys(base0).forEach(function(k){ DATA[k] = (sv && sv[k] !== undefined) ? sv[k] : base0[k]; });
  if (!DATA.chars || !DATA.chars.length) DATA.chars = base0.chars;
  if (!Array.isArray(DATA.forms) || DATA.forms.length !== 4) DATA.forms = base0.forms;
  DATA.forms = DATA.forms.map(function(f){ var r = []; for (var i = 0; i < 4; i++){ var id = f && f[i]; r.push(DATA.chars.some(function(c){ return c.id === id; }) ? id : null); } return r; });
  if (!(DATA.formSel >= 0 && DATA.formSel <= 3)) DATA.formSel = 0;
  if (!DATA.prog || typeof DATA.prog !== 'object') DATA.prog = {};
  if (!DATA.inv || typeof DATA.inv !== 'object') DATA.inv = base0.inv;
  Object.keys(DATA.inv).forEach(function(k){ if (k.indexOf('EQ_') === 0) delete DATA.inv[k]; }); /* sisa versi lama: equipment tidak lagi memakai jumlah */
  IV_ITEMS.forEach(function(it){ if (DATA.inv[it.id] === undefined) DATA.inv[it.id] = base0.inv[it.id]; });
  if (!Array.isArray(DATA.eq)) DATA.eq = base0.eq;
  (function(){ var seen = {}, n = 0; DATA.eq = DATA.eq.filter(function(e){ return e && EQ_DEF[e.id]; }).map(function(e){
    var mx = EQ_DEF[e.id].max_level, lv = Math.floor(Number(e.lv)); if (!(lv >= 1)) lv = 1; if (lv > mx) lv = mx;
    var uid = (typeof e.uid === 'string' && e.uid && !seen[e.uid]) ? e.uid : 'e' + (++n + 1000 + Date.now() % 100000); seen[uid] = 1; return { uid:uid, id:e.id, lv:lv, xp:(lv < mx && Number(e.xp) > 0) ? Math.floor(Number(e.xp)) : 0 }; }); })();
  (function(){ /* slot equipment per karakter: 3 slot bebas, tiap equipment hanya boleh dipakai satu slot */
    var es = DATA.eqSlots; if (!es || typeof es !== 'object' || Array.isArray(es)) es = DATA.eqSlots = {}; var used = {};
    Object.keys(es).forEach(function(c){ var a = Array.isArray(es[c]) ? es[c] : []; es[c] = [0, 1, 2].map(function(i){ var u = a[i]; if (typeof u === 'string' && !used[u] && DATA.eq.some(function(e){ return e.uid === u; })){ used[u] = 1; return u; } return null; }); });
  })();
  Object.keys(base0.inv).forEach(function(k){ if (typeof DATA.inv[k] !== 'number') DATA.inv[k] = base0.inv[k]; });
  ['UNI_EXP_01','UNI_ASC_01','UNI_TALENT_01'].forEach(function(k){ delete DATA.inv[k]; }); /* grade terbawah sudah dihapus */
  if (!DATA.credit1m){ DATA.credit = 1000000; DATA.credit1m = true; saveGame(); } /* sekali saja: atur Coin ke 1.000.000 */
  DATA.achs = []; /* halaman Formation: dikosongkan dulu */
  DATA.chals = []; /* halaman Recruit (dulu Challenge): dikosongkan dulu */
  delete DATA.targets; (DATA.chals || []).forEach(function(x){ if (x.name === 'Selesaikan 10 Target') x.name = 'Selesaikan 10 Task'; });
  DATA.stats = DATA.stats || { done:0, buys:0, tasks:0 }; DATA.stats.tasks = DATA.stats.tasks || 0;
  if (!DATA.tasks || !DATA.tasks.daily || !DATA.tasks.weekly) DATA.tasks = base0.tasks;
  /* Task dibuat sederhana: hanya sudah / belum (tanpa hitungan "x kali") */
  ['daily','weekly'].forEach(function(k){ (DATA.tasks[k] || []).forEach(function(x){ x.goal = 1; x.done = x.claimed ? 1 : 0; }); });
  /* Bonus diamond task = satu pengaturan terpisah per daftar (harian / mingguan), tidak lagi diisi per task.
     Data lama: nilai awal = jumlah diamond semua task, jadi besar bonus tidak berubah. */
  ['daily','weekly'].forEach(function(k){
    var list = DATA.tasks[k] || [];
    if (!DATA.taskDia || typeof DATA.taskDia !== 'object') DATA.taskDia = {};
    if (typeof DATA.taskDia[k] !== 'number'){
      var sum0 = 0; list.forEach(function(x){ sum0 += (x.reward && x.reward.d) || 0; });
      DATA.taskDia[k] = sum0;
    }
    list.forEach(function(x){ if (x.reward) x.reward.d = 0; });
  });
  /* Challenge & Achievement: hadiah hanya diamond (tanpa credit dan EXP) */
  ['chals','achs'].forEach(function(k){ (DATA[k] || []).forEach(function(x){ if (x.reward){ x.reward.c = 0; x.reward.x = 0; } x.prog = x.claimed ? x.goal : Math.min(x.goal, x.prog || 0); }); });
  function saveGame(){
    try { var o = {}; Object.keys(base0).forEach(function(k){ o[k] = DATA[k]; }); localStorage.setItem('rpg_game', JSON.stringify(o)); } catch (e) {}
  }
  function saveBal(){ saveGame(); }
  /* ===== Inv: satu-satunya pintu ke stok item (DATA.inv) =====
     Fitur lain (Char, Skill, Equipment, Inventory) hanya memakai fungsi di sini,
     tidak membaca/menulis DATA.inv langsung. Tampilan dan aturan game tidak berubah.
       Inv.jml(id)            jumlah stok (0 kalau belum ada)
       Inv.ada(id, n)         true kalau stok >= n (n bawaan 1)
       Inv.tambah(id, n)      tambah stok
       Inv.kurangi(id, n)     kurangi stok (tanpa batas bawah, sama seperti sebelumnya)
       Inv.kurangiAman(id, n) kurangi stok, tidak lebih rendah dari 0
       Inv.info(id)           data item: name, g (grade), ic (ikon), dst. (dari IV_MAP)
     Penyimpanan progres tetap lewat saveGame() di pemanggil. */
  var Inv = {
    jml: function(id){ return DATA.inv[id] || 0; },
    ada: function(id, n){ return Inv.jml(id) >= (n === undefined ? 1 : n); },
    tambah: function(id, n){ DATA.inv[id] = Inv.jml(id) + n; },
    kurangi: function(id, n){ DATA.inv[id] -= n; },
    kurangiAman: function(id, n){ DATA.inv[id] = Math.max(0, Inv.jml(id) - n); },
    info: function(id){ return IV_MAP[id]; }
  };
  /* ===== Eq: satu-satunya pintu ke data equipment (DATA.eq = daftar instance, DATA.eqSlots = slot per karakter) =====
     Fitur lain (Char, Inventory, halaman Equipment) hanya memakai fungsi di sini.
     Definisi statis (EQ_DEF, EQ_ORDER) dan hitungan stat (eqStat) tetap fungsi biasa.
       Eq.semua()              daftar semua instance equipment {uid, id, lv, xp}
       Eq.cari(uid)            instance dengan uid itu, atau null
       Eq.urut()               salinan daftar, urut kategori > grade > urutan > level (untuk tab Inventory & halaman Equipment)
       Eq.slot(char)           array 3 slot milik karakter (uid atau null); dibuat kalau belum ada
       Eq.pemilik(uid)         {c, i} karakter & slot yang memakai uid itu, atau null
       Eq.pasang(char, i, uid) pakai uid di slot i; kalau sedang dipakai di slot lain, dilepas dulu
       Eq.lepas(char, i)       kosongkan slot i
       Eq.setLv(inst, lv, xp)  simpan hasil upgrade
     Penyimpanan progres tetap lewat saveGame() di pemanggil. */
  var Eq = {
    semua: function(){ return DATA.eq || []; },
    cari: function(uid){ var r = null; Eq.semua().forEach(function(e){ if (e.uid === uid) r = e; }); return r; },
    urut: function(){
      var cs = ['Weapon', 'Armor', 'Accessory'];
      return Eq.semua().slice().sort(function(a, b){
        var da = EQ_DEF[a.id], db = EQ_DEF[b.id];
        return (cs.indexOf(da.category) - cs.indexOf(db.category)) || (da.grade - db.grade) || (EQ_ORDER.indexOf(a.id) - EQ_ORDER.indexOf(b.id)) || (a.lv - b.lv) || (a.uid < b.uid ? -1 : 1);
      });
    },
    slot: function(c){ var a = DATA.eqSlots[c]; if (!Array.isArray(a)) a = DATA.eqSlots[c] = [null, null, null]; return a; },
    pemilik: function(uid){ var r = null; Object.keys(DATA.eqSlots).forEach(function(c){ Eq.slot(c).forEach(function(x, i){ if (x === uid) r = { c:c, i:i }; }); }); return r; },
    pasang: function(c, i, uid){ var o = Eq.pemilik(uid); if (o) Eq.slot(o.c)[o.i] = null; Eq.slot(c)[i] = uid; },
    lepas: function(c, i){ Eq.slot(c)[i] = null; },
    setLv: function(inst, lv, xp){ inst.lv = lv; inst.xp = xp; }
  };
  /* ===== Char: satu-satunya pintu ke data karakter (DATA.chars, DATA.prog, DATA.formSel) =====
     Fitur lain (Skill, Talent, Weapon, Equipment, halaman Char) hanya memakai fungsi di sini.
     DATA.player (akun pemain) bukan bagian dari Char dan tidak diubah.
       Char.prog()        catatan progres Nia (level, EXP, ascension, skill, weapon); dibuat & dirapikan kalau belum ada
       Char.semua()       daftar karakter koleksi {id, name, lv, color, weapon}
       Char.nama(id)      nama karakter dari id ('nia' = Nia; id tak dikenal dikembalikan apa adanya)
       Char.formAktif()   nomor form tim yang dipilih (0-3)
       Char.setForm(n)    pilih form tim
     Penyimpanan progres tetap lewat saveGame() di pemanggil. */
  var Char = {
    prog: function(){ var p = DATA.prog.nia; if (!p) p = DATA.prog.nia = { level:1, currentExp:0, ascensionStage:0, skill1Level:1, skill2Level:1, ultimateLevel:1, passiveLevel:1, uniqueWeaponUnlocked:false, uniqueWeaponLevel:0, uniqueWeaponExp:0, uniqueWeaponStars:0 }; if (p.uniqueWeaponStars == null) p.uniqueWeaponStars = p.uniqueWeaponUnlocked ? (p.uniqueWeaponLevel > 40 ? 3 : p.uniqueWeaponLevel > 30 ? 2 : 1) : 0; return p; },
    semua: function(){ return DATA.chars || []; },
    nama: function(c){ if (c === 'nia') return 'Nia'; var n = c; Char.semua().forEach(function(x){ if (String(x.id) === String(c)) n = x.name; }); return n; },
    formAktif: function(){ return DATA.formSel; },
    setForm: function(n){ DATA.formSel = n; }
  };
  /* ===== SISTEM EXP =====
     Kurva level : level 1->2 = 400 EXP (bonus awal), level l->l+1 = 800 + 10*l EXP, maksimum level 90.
     EXP harian  : task harian berbagi kuota EXP per hari. Tiap item dapat EXP minimum,
                   sisa kuota dibagi menurut bobot kesulitan (ringan 1, sedang 2, berat 3).
                   EXP diberikan proporsional dengan progres (+1 = sebagian EXP).            */
  var LV_MAX = 90, XP_BASE = 375, XP_EXTRA = 25, XP_FREE = 6, XP_MIN = 10;
  var DIFF = { 1:'Ringan', 2:'Sedang', 3:'Berat' };
  function lvMax(l){ return l <= 1 ? 400 : 800 + 10 * l; }
  function dailyItems(){ return DATA.tasks.daily; }
  function dailyBudget(n){ return XP_BASE + XP_EXTRA * Math.max(0, n - XP_FREE); }
  function wOf(it){ return (it.w >= 1 && it.w <= 3) ? it.w : 2; }
  function shareExp(w, n, sumW){
    var rem = Math.max(0, dailyBudget(n) - n * XP_MIN);
    return Math.round(XP_MIN + rem * w / (sumW || 1));
  }
  function expOf(it){
    var L = dailyItems(), sw = 0; L.forEach(function(x){ sw += wOf(x); });
    return shareExp(wOf(it), L.length || 1, sw);
  }
  function isDay(it, k){ return k === 'task' && pgSub === 'daily'; }
  function addExp(x){
    var p = DATA.player, up = false; p.exp += x;
    while (p.level < LV_MAX && p.exp >= lvMax(p.level)){ p.exp -= lvMax(p.level); p.level++; up = true; }
    if (p.level >= LV_MAX) p.exp = 0;
    return up;
  }
  function grantProgress(it){
    var tgt = Math.round(expOf(it) * Math.min(it.done, it.goal) / it.goal), d = tgt - (it.xg || 0);
    if (d > 0){
      it.xg = (it.xg || 0) + d; DATA.xpToday = (DATA.xpToday || 0) + d;
      var up = addExp(d); toast('+' + d + ' EXP' + (up ? ' · Level ' + DATA.player.level + '!' : ''));
    }
  }
  function renderProfile(){
    var p = DATA.player, mx = p.level >= 90;
    $('#pLv').textContent = p.level; $('#pName').textContent = p.name;
    $('#pExpTxt').textContent = mx ? 'MAX' : p.exp + '/' + lvMax(p.level);
    $('#pExp').style.width = (mx ? 100 : p.exp / lvMax(p.level) * 100) + '%';
  }
  function updRes(){
    ['Credit','Diamond'].forEach(function(nm){
      var v = fmt(DATA[nm.toLowerCase()]);
      ['#v','#s','#p','#c','#n','#i','#q'].forEach(function(pre){ var e = $(pre + nm); if (e) e.textContent = v; });
    });
    var en = DATA.energy[0] + '/' + DATA.energy[1];
    ['#vEnergy','#sEnergy','#pEnergy','#cEnergy','#nEnergy','#iEnergy','#qEnergy'].forEach(function(i){ var e = $(i); if (e) e.textContent = en; });
  }
  function rollover(){
    var t = today(), w = weekKey(), ch = false;
    if (DATA.last !== t){
      DATA.tasks.daily.forEach(function(x){ x.done = 0; x.claimed = false; x.xg = 0; });
      DATA.xpToday = 0;
      if (DATA.lastComplete !== ago() && DATA.lastComplete !== t) DATA.streak = 0;
      DATA.last = t; ch = true;
    }
    if (DATA.lastWeek !== w){
      DATA.tasks.weekly.forEach(function(x){ x.done = 0; x.claimed = false; });
      DATA.lastWeek = w; ch = true;
    }
    if (ch) saveGame();
    return ch;
  }
  rollover();

  function syncLobby(){
    renderProfile(); syncTaskBadge(); syncDots();
  }
  /* titik notifikasi (Challenge & Achievement): satu titik saja.
     merah = ada yang siap di-claim (prioritas, walau masih ada yang belum dikerjakan);
     kuning = tidak ada yang bisa di-claim, tapi masih ada yang belum selesai */
  function syncDots(){
    var c = { r:false, y:false }, a = { r:false, y:false };
    [['#chalRed', c.r], ['#chalYel', c.y], ['#achRed', a.r], ['#achYel', a.y]].forEach(function(d){
      var e = $(d[0]); if (e) e.hidden = !d[1];
    });
  }
  function syncTaskBadge(){
    var d = DATA.tasks.daily, c = d.filter(function(x){ return x.claimed; }).length, b = $('#tBadge');
    b.textContent = c + '/' + d.length; b.style.display = d.length ? '' : 'none';
  }

  /* ---- halaman Challenge / Achievement / Task ---- */
  var pgBar = $('#shop .sbar').cloneNode(true);
  Array.prototype.forEach.call(pgBar.querySelectorAll('[id]'), function(e){ e.id = 'p' + e.id.slice(1); });
  var pgT = pgBar.querySelector('.stitle'); pgT.id = 'pTitle'; pgT.innerHTML = '';
  var pg = document.createElement('section'); pg.id = 'pg';
  pg.innerHTML = '<div class="pgsum" id="pgSum"></div><div class="pgseg" id="pgSeg"><button data-s="daily">Harian</button><button data-s="weekly">Mingguan</button></div><div class="chbar" id="chBar"><span class="chsp"></span><div class="chtabs" id="chTabs"><button data-f="all" class="on">Semua</button><button data-f="front">Front</button><button data-f="mid">Middle</button><button data-f="back">Back</button></div><button class="chflt" id="chFlt" aria-label="Filter"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>Filter</button></div><div class="pglist" id="pgList"></div><div class="pgbot" id="pgBot"></div>';
  pg.insertBefore(pgBar, pg.firstChild); shopEl.parentNode.insertBefore(pg, $('#ov'));
  pg.insertAdjacentHTML('beforeend', '<div id="pgOv"><div class="pgpop" id="pgPop" role="dialog" aria-label="Progres"></div></div>');
  function setDir(root, d){ var m = { u:['0px','14px'], d:['0px','-14px'], r:['26px','0px'], l:['-26px','0px'] }[d] || ['0px','14px']; root.style.setProperty('--dx', m[0]); root.style.setProperty('--dy', m[1]); }
  var pgKind = 'task', pgSub = 'daily', pgAnim = false, pgDir = 'u';
  var popIt = null, popV = 0;
  function updPop(){
    var g = popIt.goal, full = popV >= g;
    $('#pFill').style.width = Math.min(100, Math.round(popV / g * 100)) + '%';
    $('#pCnt').textContent = popV + '/' + g;
    $('#pPlus').disabled = full; $('#pNote').style.display = full ? '' : 'none';
  }
  function openProg(it, k){
    if (it.claimed) return;
    popIt = it; popV = Math.min(it.prog || 0, it.goal);
    $('#pgPop').innerHTML = '<div class="ptag">' + (k === 'chal' ? 'Recruit' : 'Formation') + '</div><div class="ptt">' + esc(it.name) + '</div>' +
      '<div class="prw">Hadiah: ' + fmt(it.reward.d) + ' diamond</div>' +
      '<div class="pbar"><div class="b2"><i id="pFill"></i></div><span id="pCnt"></span></div>' +
      '<button type="button" class="pplus" id="pPlus" aria-label="Tambah progres">+</button>' +
      '<div class="prw" id="pNote">Tercapai! Simpan, lalu klaim hadiahnya.</div>' +
      '<div class="pacts"><button type="button" class="spbtn alt" id="pCx">Batal</button><button type="button" class="spbtn" id="pSv">Simpan</button></div>';
    $('#pPlus').addEventListener('click', function(){ if (popV < popIt.goal){ popV++; updPop(); } });
    $('#pCx').addEventListener('click', closePop);
    $('#pSv').addEventListener('click', function(){
      var full = popV >= popIt.goal; popIt.prog = popV; closePop(); afterChange();
      toast(full ? 'Tercapai! Klaim hadiahnya' : 'Progres disimpan');
    });
    updPop(); $('#pgOv').classList.add('on');
  }
  function closePop(){ $('#pgOv').classList.remove('on'); popIt = null; }
  $('#pgOv').addEventListener('click', function(e){ if (e.target === this) closePop(); });
  function glist(k){ if (k === 'skill' || k === 'craft' || k === 'inv' || k === 'char' || k === 'social') return []; return k === 'task' ? DATA.tasks[pgSub] : k === 'chal' ? DATA.chals : DATA.achs; }
  function mval(m){ return Math.min(m.goal, m.prog || 0); }
  function chipsOf(r, dx, w, mode){
    var h = '';
    if (mode !== 'dia') h += '<span class="chip"><svg><use href="#i-credit"/></svg>' + fmt(r.c) + '</span>';
    if (mode !== 'bonus') h += '<span class="chip"><svg><use href="#i-gem"/></svg>' + fmt(r.d) + '</span>';
    if (mode !== 'dia') h += '<span class="chip">EXP ' + fmt(dx != null ? dx : r.x) + (dx != null ? ' · ' + DIFF[w] : '') + '</span>';
    return h;
  }
  function dailyStreak(){
    var L = DATA.tasks.daily;
    if (!L.length || DATA.lastComplete === today() || !L.every(function(x){ return x.claimed; })) return;
    DATA.streak = (DATA.lastComplete === ago()) ? DATA.streak + 1 : 1; DATA.lastComplete = today(); DATA.best = Math.max(DATA.best, DATA.streak);
    setTimeout(function(){ toast('Semua task harian selesai! Streak ' + DATA.streak + ' hari'); }, 3700);
  }
  function completeTask(it){
    if (it.claimed) return;
    var xp = it.reward.x;
    if (pgSub === 'daily'){
      xp = Math.max(0, expOf(it) - (it.xg || 0)); it.xg = (it.xg || 0) + xp; DATA.xpToday = (DATA.xpToday || 0) + xp;
    }
    it.done = 1; it.claimed = true; DATA.stats.tasks = (DATA.stats.tasks || 0) + 1;
    give({ c:it.reward.c, d:0, x:xp }); if (pgSub === 'daily') dailyStreak(); afterChange();
  }
  /* ===== animasi REWARD ACQUIRED! (mengikuti video referensi) ===== */
  var RW_TITLE = '<svg viewBox="0 0 1038.8 107.5" aria-label="REWARD ACQUIRED!" shape-rendering="geometricPrecision"><defs><linearGradient id="rwTg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f68c"/><stop offset=".12" stop-color="#fff959"/><stop offset=".22" stop-color="#fffb54"/><stop offset=".32" stop-color="#fffb58"/><stop offset=".42" stop-color="#fdf956"/><stop offset=".52" stop-color="#faf55c"/><stop offset=".62" stop-color="#fbf152"/><stop offset=".72" stop-color="#ffeb5a"/><stop offset=".82" stop-color="#fbe35e"/><stop offset="1" stop-color="#f6dd60"/></linearGradient></defs><path fill="url(#rwTg)" fill-rule="evenodd" d="M1007.00 82.95 Q1003.50 83.00 1002.75 84.10 L1002.75 84.10 Q1002.00 85.20 1001.77 88.69 L1001.43 94.01 Q1001.20 97.50 1002.60 98.15 L1002.60 98.15 Q1004.00 98.80 1007.50 98.72 L1013.50 98.58 Q1017.00 98.50 1018.10 97.00 L1018.10 97.00 Q1019.20 95.50 1019.98 92.09 L1021.02 87.61 Q1021.80 84.20 1019.80 83.50 L1019.80 83.50 Q1017.80 82.80 1014.30 82.85ZM999.73 11.84 Q998.00 8.80 995.06 6.90 L992.74 5.40 Q989.80 3.50 986.30 3.50 L956.00 3.50 Q952.50 3.50 949.57 5.41 L943.93 9.09 Q941.00 11.00 940.10 14.38 L938.10 21.82 Q937.20 25.20 936.61 28.65 L927.09 84.55 Q926.50 88.00 926.50 89.60 L926.50 89.60 Q926.50 91.20 927.15 92.00 L927.15 92.00 Q927.80 92.80 931.30 92.82 L966.00 92.98 Q969.50 93.00 971.75 92.40 L971.75 92.40 Q974.00 91.80 976.98 89.97 L978.52 89.03 Q981.50 87.20 983.99 84.74 L986.51 82.26 Q989.00 79.80 990.52 76.65 L992.68 72.15 Q994.20 69.00 994.81 65.55 L1002.19 23.65 Q1002.80 20.20 1002.50 18.20 L1002.50 18.20 Q1002.20 16.20 1000.47 13.16ZM976.70 16.45 Q980.20 16.50 982.00 18.00 L982.00 18.00 Q983.80 19.50 984.15 21.75 L984.15 21.75 Q984.50 24.00 983.90 27.45 L976.80 68.55 Q976.20 72.00 974.60 74.40 L974.60 74.40 Q973.00 76.80 970.60 78.50 L970.60 78.50 Q968.20 80.20 964.70 80.25 L952.50 80.45 Q949.00 80.50 947.75 79.15 L947.75 79.15 Q946.50 77.80 946.50 75.30 L946.50 75.30 Q946.50 72.80 947.11 69.35 L955.19 23.45 Q955.80 20.00 958.00 18.10 L958.00 18.10 Q960.20 16.20 963.70 16.25ZM446.74 9.91 Q444.80 7.00 441.61 5.57 L440.19 4.93 Q437.00 3.50 433.50 3.50 L405.30 3.50 Q401.80 3.50 399.40 4.35 L399.40 4.35 Q397.00 5.20 394.27 7.40 L392.53 8.80 Q389.80 11.00 388.69 14.32 L387.91 16.68 Q386.80 20.00 386.19 23.45 L379.11 63.55 Q378.50 67.00 377.97 70.46 L376.03 83.04 Q375.50 86.50 375.85 89.35 L375.85 89.35 Q376.20 92.20 377.70 92.70 L377.70 92.70 Q379.20 93.20 382.70 93.14 L416.30 92.56 Q419.80 92.50 422.84 90.76 L428.96 87.24 Q432.00 85.50 434.43 82.98 L435.07 82.32 Q437.50 79.80 439.27 76.78 L439.43 76.52 Q441.20 73.50 441.86 70.06 L449.14 32.24 Q449.80 28.80 449.80 25.30 L449.80 18.00 Q449.80 14.50 447.86 11.59ZM428.00 16.60 Q430.20 17.20 431.50 19.60 L431.50 19.60 Q432.80 22.00 432.42 25.48 L431.88 30.52 Q431.50 34.00 430.71 37.41 L429.79 41.39 Q429.00 44.80 429.00 47.90 L429.00 47.90 Q429.00 51.00 427.82 54.29 L427.38 55.51 Q426.20 58.80 425.86 62.28 L425.54 65.52 Q425.20 69.00 424.10 71.90 L424.10 71.90 Q423.00 74.80 420.21 76.92 L418.29 78.38 Q415.50 80.50 412.00 80.45 L399.30 80.25 Q395.80 80.20 394.90 79.10 L394.90 79.10 Q394.00 78.00 394.00 76.60 L394.00 76.60 Q394.00 75.20 394.67 71.77 L404.53 21.63 Q405.20 18.20 407.70 17.10 L407.70 17.10 Q410.20 16.00 413.70 16.00 L422.30 16.00 Q425.80 16.00 428.00 16.60ZM931.10 4.15 Q930.20 3.50 926.70 3.50 L895.50 3.50 Q892.00 3.50 888.77 4.84 L888.73 4.86 Q885.50 6.20 882.89 8.53 L881.61 9.67 Q879.00 12.00 878.19 15.41 L876.01 24.59 Q875.20 28.00 874.64 31.45 L866.56 81.35 Q866.00 84.80 865.10 87.15 L865.10 87.15 Q864.20 89.50 864.85 91.25 L864.85 91.25 Q865.50 93.00 869.00 93.04 L909.70 93.46 Q913.20 93.50 915.10 92.35 L915.10 92.35 Q917.00 91.20 917.75 88.50 L917.75 88.50 Q918.50 85.80 917.75 83.50 L917.75 83.50 Q917.00 81.20 913.50 81.18 L891.30 81.02 Q887.80 81.00 886.30 79.60 L886.30 79.60 Q884.80 78.20 884.80 75.20 L884.80 75.20 Q884.80 72.20 885.39 68.75 L886.91 59.95 Q887.50 56.50 888.50 55.00 L888.50 55.00 Q889.50 53.50 893.00 53.41 L913.50 52.89 Q917.00 52.80 918.60 51.65 L918.60 51.65 Q920.20 50.50 921.50 47.25 L921.90 46.25 Q923.20 43.00 923.10 42.00 L923.10 42.00 Q923.00 41.00 922.10 40.50 L922.10 40.50 Q921.20 40.00 917.70 40.00 L901.50 40.00 Q898.00 40.00 895.60 39.50 L895.60 39.50 Q893.20 39.00 892.50 38.10 L892.50 38.10 Q891.80 37.20 891.80 35.60 L891.80 35.60 Q891.80 34.00 892.49 30.57 L894.11 22.43 Q894.80 19.00 896.00 18.00 L896.00 18.00 Q897.20 17.00 899.50 16.50 L899.50 16.50 Q901.80 16.00 905.30 15.94 L925.50 15.56 Q929.00 15.50 930.00 14.65 L930.00 14.65 Q931.00 13.80 931.75 11.40 L931.75 11.40 Q932.50 9.00 932.25 6.90 L932.25 6.90 Q932.00 4.80 931.10 4.15ZM821.70 3.70 Q819.20 4.20 816.35 6.23 L813.65 8.17 Q810.80 10.20 809.50 13.20 L809.50 13.20 Q808.20 16.20 807.58 19.65 L796.62 81.05 Q796.00 84.50 796.10 88.00 L796.10 88.30 Q796.20 91.80 797.20 92.50 L797.20 92.50 Q798.20 93.20 801.70 93.20 L805.30 93.20 Q808.80 93.20 810.00 92.70 L810.00 92.70 Q811.20 92.20 812.00 90.70 L812.00 90.70 Q812.80 89.20 813.39 85.75 L817.21 63.65 Q817.80 60.20 819.50 59.35 L819.50 59.35 Q821.20 58.50 824.70 58.50 L828.50 58.50 Q832.00 58.50 833.50 59.50 L833.50 59.50 Q835.00 60.50 836.00 63.35 L836.00 63.35 Q837.00 66.20 837.67 69.64 L841.33 88.36 Q842.00 91.80 843.60 92.65 L843.60 92.65 Q845.20 93.50 848.70 93.40 L852.50 93.30 Q856.00 93.20 857.10 92.35 L857.10 92.35 Q858.20 91.50 858.35 90.35 L858.35 90.35 Q858.50 89.20 857.88 85.76 L853.12 59.44 Q852.50 56.00 854.69 53.27 L859.31 47.53 Q861.50 44.80 863.00 42.00 L863.00 42.00 Q864.50 39.20 865.12 35.76 L868.18 18.94 Q868.80 15.50 868.51 12.01 L868.49 11.69 Q868.20 8.20 865.60 6.20 L865.60 6.20 Q863.00 4.20 859.90 3.70 L859.90 3.70 Q856.80 3.20 853.30 3.20 L827.70 3.20 Q824.20 3.20 821.70 3.70ZM826.85 17.85 Q828.20 16.50 831.70 16.40 L842.00 16.10 Q845.50 16.00 847.25 16.50 L847.25 16.50 Q849.00 17.00 849.75 17.90 L849.75 17.90 Q850.50 18.80 849.94 22.25 L848.06 33.75 Q847.50 37.20 846.35 39.35 L846.35 39.35 Q845.20 41.50 843.00 43.25 L843.00 43.25 Q840.80 45.00 837.31 45.19 L829.49 45.61 Q826.00 45.80 823.75 44.40 L823.75 44.40 Q821.50 43.00 821.89 39.52 L822.81 31.28 Q823.20 27.80 824.10 24.42 L824.60 22.58 Q825.50 19.20 826.85 17.85ZM797.10 4.25 Q796.20 3.50 792.70 3.50 L787.30 3.50 Q783.80 3.50 782.40 4.75 L782.40 4.75 Q781.00 6.00 780.38 9.44 L768.62 74.36 Q768.00 77.80 767.71 81.29 L767.09 88.51 Q766.80 92.00 767.50 92.60 L767.50 92.60 Q768.20 93.20 771.70 93.20 L777.30 93.20 Q780.80 93.20 782.00 91.60 L782.00 91.60 Q783.20 90.00 783.82 86.56 L797.38 11.44 Q798.00 8.00 798.00 6.50 L798.00 6.50 Q798.00 5.00 797.10 4.25ZM768.00 4.65 Q767.20 3.80 763.71 3.60 L760.29 3.40 Q756.80 3.20 754.40 4.20 L754.40 4.20 Q752.00 5.20 751.40 8.65 L742.60 59.55 Q742.00 63.00 741.11 66.39 L738.69 75.61 Q737.80 79.00 734.80 80.75 L734.80 80.75 Q731.80 82.50 728.30 82.58 L721.50 82.72 Q718.00 82.80 715.00 81.30 L715.00 81.30 Q712.00 79.80 711.25 78.40 L711.25 78.40 Q710.50 77.00 710.50 74.90 L710.50 74.90 Q710.50 72.80 711.09 69.35 L721.41 8.95 Q722.00 5.50 720.00 4.35 L720.00 4.35 Q718.00 3.20 714.50 3.31 L712.30 3.39 Q708.80 3.50 707.50 4.15 L707.50 4.15 Q706.20 4.80 705.43 8.21 L700.97 28.09 Q700.20 31.50 700.05 35.00 L699.95 37.30 Q699.80 40.80 699.15 44.24 L693.65 73.36 Q693.00 76.80 693.85 80.20 L694.15 81.40 Q695.00 84.80 697.38 87.37 L698.82 88.93 Q701.20 91.50 704.42 92.86 L705.78 93.44 Q709.00 94.80 712.50 94.80 L731.00 94.80 Q734.50 94.80 737.73 93.44 L740.77 92.16 Q744.00 90.80 746.64 88.50 L750.86 84.80 Q753.50 82.50 754.98 79.33 L755.52 78.17 Q757.00 75.00 757.56 71.55 L763.24 36.65 Q763.80 33.20 764.80 30.35 L764.80 30.35 Q765.80 27.50 766.36 24.05 L768.24 12.45 Q768.80 9.00 768.80 7.25 L768.80 7.25 Q768.80 5.50 768.00 4.65ZM614.25 4.20 Q612.50 3.20 609.00 3.28 L583.00 3.92 Q579.50 4.00 576.43 5.69 L572.57 7.81 Q569.50 9.50 567.38 12.29 L565.32 15.01 Q563.20 17.80 562.51 21.23 L554.19 62.77 Q553.50 66.20 553.29 69.69 L553.01 74.31 Q552.80 77.80 553.15 79.30 L553.15 79.30 Q553.50 80.80 555.50 83.40 L555.50 83.40 Q557.50 86.00 560.26 88.15 L561.44 89.05 Q564.20 91.20 567.60 92.02 L570.40 92.68 Q573.80 93.50 577.30 93.50 L592.30 93.50 Q595.80 93.50 598.50 92.50 L598.50 92.50 Q601.20 91.50 601.83 88.06 L602.17 86.24 Q602.80 82.80 601.80 82.00 L601.80 82.00 Q600.80 81.20 597.30 81.14 L579.00 80.86 Q575.50 80.80 574.00 80.15 L574.00 80.15 Q572.50 79.50 571.35 77.85 L571.35 77.85 Q570.20 76.20 570.52 72.71 L571.18 65.69 Q571.50 62.20 572.10 58.75 L577.20 29.65 Q577.80 26.20 579.11 22.95 L579.19 22.75 Q580.50 19.50 583.60 17.88 L583.70 17.82 Q586.80 16.20 590.30 16.17 L607.30 16.03 Q610.80 16.00 612.65 15.50 L612.65 15.50 Q614.50 15.00 615.25 13.60 L615.25 13.60 Q616.00 12.20 616.00 8.70 L616.00 8.70 Q616.00 5.20 614.25 4.20ZM539.25 6.15 Q538.50 4.50 536.25 3.85 L536.25 3.85 Q534.00 3.20 530.50 3.25 L517.50 3.45 Q514.00 3.50 511.50 5.00 L511.50 5.00 Q509.00 6.50 507.62 9.72 L478.38 77.78 Q477.00 81.00 475.90 84.32 L475.30 86.18 Q474.20 89.50 474.70 91.25 L474.70 91.25 Q475.20 93.00 478.70 93.07 L481.50 93.13 Q485.00 93.20 486.40 92.70 L486.40 92.70 Q487.80 92.20 489.29 89.03 L497.01 72.67 Q498.50 69.50 501.25 68.00 L501.25 68.00 Q504.00 66.50 507.50 66.61 L522.30 67.09 Q525.80 67.20 527.00 68.85 L527.00 68.85 Q528.20 70.50 528.57 73.98 L530.13 88.72 Q530.50 92.20 531.65 92.85 L531.65 92.85 Q532.80 93.50 536.30 93.50 L538.70 93.50 Q542.20 93.50 543.60 92.75 L543.60 92.75 Q545.00 92.00 545.17 88.50 L545.63 79.50 Q545.80 76.00 545.28 72.54 L544.02 64.26 Q543.50 60.80 543.36 57.30 L542.14 26.70 Q542.00 23.20 541.55 19.73 L540.45 11.27 Q540.00 7.80 539.25 6.15ZM522.20 17.65 Q523.20 17.50 524.10 19.65 L524.10 19.65 Q525.00 21.80 525.21 25.29 L526.59 48.51 Q526.80 52.00 525.15 53.10 L525.15 53.10 Q523.50 54.20 520.00 54.15 L512.30 54.05 Q508.80 54.00 507.90 53.25 L507.90 53.25 Q507.00 52.50 507.40 49.65 L507.40 49.65 Q507.80 46.80 509.16 43.58 L517.44 24.02 Q518.80 20.80 520.00 19.30 L520.00 19.30 Q521.20 17.80 522.20 17.65ZM376.50 8.00 Q375.20 6.00 372.70 4.75 L372.70 4.75 Q370.20 3.50 366.70 3.50 L335.30 3.50 Q331.80 3.50 329.50 4.25 L329.50 4.25 Q327.20 5.00 324.35 7.03 L323.05 7.97 Q320.20 10.00 319.00 13.29 L317.40 17.71 Q316.20 21.00 316.03 24.50 L315.97 25.50 Q315.80 29.00 315.15 32.44 L305.65 82.76 Q305.00 86.20 305.50 89.35 L305.50 89.35 Q306.00 92.50 309.49 92.75 L312.31 92.95 Q315.80 93.20 318.40 92.10 L318.40 92.10 Q321.00 91.00 321.67 87.56 L326.13 64.64 Q326.80 61.20 327.80 60.20 L327.80 60.20 Q328.80 59.20 331.80 58.70 L331.80 58.70 Q334.80 58.20 338.15 58.50 L338.15 58.50 Q341.50 58.80 342.65 59.65 L342.65 59.65 Q343.80 60.50 345.11 63.75 L345.19 63.95 Q346.50 67.20 346.81 70.69 L346.89 71.71 Q347.20 75.20 348.03 78.60 L350.37 88.10 Q351.20 91.50 354.20 92.65 L354.20 92.65 Q357.20 93.80 360.10 93.65 L360.10 93.65 Q363.00 93.50 364.90 92.65 L364.90 92.65 Q366.80 91.80 367.00 90.15 L367.00 90.15 Q367.20 88.50 366.54 85.06 L363.16 67.44 Q362.50 64.00 362.29 60.51 L362.21 58.99 Q362.00 55.50 364.05 52.66 L371.75 42.04 Q373.80 39.20 374.39 35.75 L377.41 18.25 Q378.00 14.80 377.90 12.40 L377.90 12.40 Q377.80 10.00 376.50 8.00ZM335.60 18.65 Q337.20 16.50 340.70 16.40 L350.50 16.10 Q354.00 16.00 356.50 16.60 L356.50 16.60 Q359.00 17.20 359.50 17.85 L359.50 17.85 Q360.00 18.50 359.43 21.95 L357.37 34.35 Q356.80 37.80 355.90 39.40 L355.90 39.40 Q355.00 41.00 352.17 43.05 L352.03 43.15 Q349.20 45.20 345.70 45.36 L339.30 45.64 Q335.80 45.80 334.30 45.40 L334.30 45.40 Q332.80 45.00 331.90 44.00 L331.90 44.00 Q331.00 43.00 331.47 39.53 L333.53 24.27 Q334.00 20.80 335.60 18.65ZM146.29 3.92 Q142.80 4.20 142.30 6.70 L142.30 6.70 Q141.80 9.20 141.87 12.70 L142.93 68.30 Q143.00 71.80 143.11 75.30 L143.39 84.30 Q143.50 87.80 144.15 89.65 L144.15 89.65 Q144.80 91.50 146.40 92.25 L146.40 92.25 Q148.00 93.00 151.50 93.05 L158.70 93.15 Q162.20 93.20 164.10 92.50 L164.10 92.50 Q166.00 91.80 167.90 89.30 L167.90 89.30 Q169.80 86.80 171.06 83.54 L177.54 66.76 Q178.80 63.50 180.43 60.40 L182.17 57.10 Q183.80 54.00 184.65 54.10 L184.65 54.10 Q185.50 54.20 186.25 55.70 L186.25 55.70 Q187.00 57.20 187.31 60.69 L189.69 87.71 Q190.00 91.20 191.40 92.00 L191.40 92.00 Q192.80 92.80 196.29 93.00 L201.71 93.30 Q205.20 93.50 208.57 92.54 L208.83 92.46 Q212.20 91.50 213.35 90.00 L213.35 90.00 Q214.50 88.50 215.75 85.23 L219.75 74.77 Q221.00 71.50 222.22 68.22 L242.58 13.28 Q243.80 10.00 244.30 7.40 L244.30 7.40 Q244.80 4.80 243.65 4.00 L243.65 4.00 Q242.50 3.20 239.00 3.20 L238.00 3.20 Q234.50 3.20 231.65 4.20 L231.65 4.20 Q228.80 5.20 227.66 8.51 L208.94 62.69 Q207.80 66.00 205.65 68.50 L205.65 68.50 Q203.50 71.00 202.85 70.10 L202.85 70.10 Q202.20 69.20 201.85 65.85 L201.85 65.85 Q201.50 62.50 201.45 59.00 L201.05 29.70 Q201.00 26.20 200.40 25.10 L200.40 25.10 Q199.80 24.00 198.30 23.60 L198.30 23.60 Q196.80 23.20 193.30 23.20 L187.30 23.20 Q183.80 23.20 181.90 24.20 L181.90 24.20 Q180.00 25.20 178.72 28.46 L165.08 63.24 Q163.80 66.50 162.65 68.25 L162.65 68.25 Q161.50 70.00 160.35 69.50 L160.35 69.50 Q159.20 69.00 159.02 65.50 L158.38 53.30 Q158.20 49.80 158.26 46.30 L158.94 9.30 Q159.00 5.80 158.60 5.00 L158.60 5.00 Q158.20 4.20 156.70 3.70 L156.70 3.70 Q155.20 3.20 151.71 3.48ZM136.30 5.60 Q135.80 4.20 132.30 4.14 L99.00 3.56 Q95.50 3.50 93.75 4.15 L93.75 4.15 Q92.00 4.80 89.22 6.92 L85.98 9.38 Q83.20 11.50 82.50 14.93 L76.90 42.57 Q76.20 46.00 75.72 49.47 L73.68 64.33 Q73.20 67.80 72.18 71.15 L72.02 71.65 Q71.00 75.00 70.57 78.47 L69.43 87.53 Q69.00 91.00 69.40 91.75 L69.40 91.75 Q69.80 92.50 73.30 92.55 L115.00 93.15 Q118.50 93.20 119.85 92.60 L119.85 92.60 Q121.20 92.00 121.61 88.52 L121.79 86.98 Q122.20 83.50 121.35 82.25 L121.35 82.25 Q120.50 81.00 117.00 80.97 L97.30 80.83 Q93.80 80.80 91.80 80.00 L91.80 80.00 Q89.80 79.20 89.15 77.20 L89.15 77.20 Q88.50 75.20 89.35 71.80 L89.95 69.40 Q90.80 66.00 90.89 62.50 L90.91 61.50 Q91.00 58.00 91.60 56.40 L91.60 56.40 Q92.20 54.80 93.85 53.90 L93.85 53.90 Q95.50 53.00 99.00 53.00 L115.30 53.00 Q118.80 53.00 121.40 52.10 L121.40 52.10 Q124.00 51.20 125.35 47.97 L126.15 46.03 Q127.50 42.80 126.75 41.40 L126.75 41.40 Q126.00 40.00 122.50 40.00 L104.00 40.00 Q100.50 40.00 98.65 39.00 L98.65 39.00 Q96.80 38.00 96.40 36.25 L96.40 36.25 Q96.00 34.50 96.51 31.04 L97.29 25.66 Q97.80 22.20 98.90 20.10 L98.90 20.10 Q100.00 18.00 101.40 17.10 L101.40 17.10 Q102.80 16.20 106.30 16.15 L129.70 15.85 Q133.20 15.80 134.70 13.90 L134.70 13.90 Q136.20 12.00 136.50 9.50 L136.50 9.50 Q136.80 7.00 136.30 5.60ZM27.50 3.93 Q24.00 4.00 21.06 5.89 L19.94 6.61 Q17.00 8.50 15.06 11.41 L14.74 11.89 Q12.80 14.80 12.16 18.24 L3.84 63.36 Q3.20 66.80 2.74 70.27 L0.46 87.73 Q0.00 91.20 1.00 92.20 L1.00 92.20 Q2.00 93.20 5.50 93.20 L7.50 93.20 Q11.00 93.20 13.00 92.60 L13.00 92.60 Q15.00 92.00 16.00 90.10 L16.00 90.10 Q17.00 88.20 17.63 84.76 L21.37 64.44 Q22.00 61.00 24.90 59.75 L24.90 59.75 Q27.80 58.50 31.30 58.36 L32.00 58.34 Q35.50 58.20 37.15 59.20 L37.15 59.20 Q38.80 60.20 40.09 63.46 L40.51 64.54 Q41.80 67.80 42.42 71.24 L45.38 87.76 Q46.00 91.20 47.00 92.00 L47.00 92.00 Q48.00 92.80 51.50 92.85 L57.70 92.95 Q61.20 93.00 62.00 90.90 L62.00 90.90 Q62.80 88.80 61.90 86.30 L61.90 86.30 Q61.00 83.80 60.54 80.33 L57.66 58.67 Q57.20 55.20 59.31 52.40 L66.69 42.60 Q68.80 39.80 69.46 36.36 L72.34 21.24 Q73.00 17.80 72.72 14.31 L72.48 11.49 Q72.20 8.00 71.20 6.75 L71.20 6.75 Q70.20 5.50 67.50 4.35 L67.50 4.35 Q64.80 3.20 61.30 3.27ZM51.35 16.60 Q54.20 17.20 54.70 19.20 L54.70 19.20 Q55.20 21.20 54.55 24.64 L53.45 30.56 Q52.80 34.00 51.47 37.24 L51.33 37.56 Q50.00 40.80 48.90 41.90 L48.90 41.90 Q47.80 43.00 44.90 44.40 L44.90 44.40 Q42.00 45.80 38.50 45.80 L33.70 45.80 Q30.20 45.80 28.35 44.90 L28.35 44.90 Q26.50 44.00 26.63 40.50 L26.87 34.30 Q27.00 30.80 27.81 27.40 L29.19 21.60 Q30.00 18.20 30.75 17.50 L30.75 17.50 Q31.50 16.80 34.15 16.40 L34.15 16.40 Q36.80 16.00 40.30 16.00 L45.00 16.00 Q48.50 16.00 51.35 16.60ZM291.91 7.20 Q290.50 4.00 287.00 3.85 L270.00 3.15 Q266.50 3.00 264.65 3.75 L264.65 3.75 Q262.80 4.50 261.31 7.67 L250.49 30.63 Q249.00 33.80 248.04 37.17 L247.96 37.43 Q247.00 40.80 245.61 44.01 L227.59 85.59 Q226.20 88.80 226.60 90.80 L226.60 90.80 Q227.00 92.80 230.50 92.97 L231.70 93.03 Q235.20 93.20 238.00 92.60 L238.00 92.60 Q240.80 92.00 242.15 90.10 L242.15 90.10 Q243.50 88.20 244.76 84.93 L249.24 73.27 Q250.50 70.00 252.75 68.40 L252.75 68.40 Q255.00 66.80 258.50 66.73 L267.30 66.57 Q270.80 66.50 274.25 67.12 L275.75 67.38 Q279.20 68.00 280.50 71.10 L280.50 71.10 Q281.80 74.20 282.07 77.69 L282.93 88.71 Q283.20 92.20 286.69 92.48 L289.71 92.72 Q293.20 93.00 295.50 92.10 L295.50 92.10 Q297.80 91.20 297.62 87.70 L293.98 15.00 Q293.80 11.50 292.39 8.30ZM274.35 18.10 Q275.20 18.00 276.00 18.60 L276.00 18.60 Q276.80 19.20 277.50 22.20 L277.50 22.20 Q278.20 25.20 278.31 28.70 L278.89 48.00 Q279.00 51.50 277.10 52.85 L277.10 52.85 Q275.20 54.20 271.70 54.10 L264.70 53.90 Q261.20 53.80 260.35 52.90 L260.35 52.90 Q259.50 52.00 260.33 48.60 L260.37 48.40 Q261.20 45.00 262.57 41.78 L270.13 24.02 Q271.50 20.80 272.50 19.50 L272.50 19.50 Q273.50 18.20 274.35 18.10ZM649.00 3.47 Q645.50 3.50 642.60 5.46 L634.10 11.24 Q631.20 13.20 628.95 15.88 L627.05 18.12 Q624.80 20.80 623.97 24.20 L619.83 41.10 Q619.00 44.50 618.51 47.97 L614.49 76.53 Q614.00 80.00 615.10 82.25 L615.10 82.25 Q616.20 84.50 618.67 86.97 L620.03 88.33 Q622.50 90.80 625.35 92.40 L625.35 92.40 Q628.20 94.00 631.70 94.15 L648.00 94.85 Q651.50 95.00 653.00 96.10 L653.00 96.10 Q654.50 97.20 655.99 100.37 L657.51 103.63 Q659.00 106.80 662.50 106.92 L667.30 107.08 Q670.80 107.20 671.90 105.70 L671.90 105.70 Q673.00 104.20 672.09 100.82 L671.11 97.18 Q670.20 93.80 670.35 91.65 L670.35 91.65 Q670.50 89.50 672.94 86.99 L675.36 84.51 Q677.80 82.00 679.67 79.04 L682.13 75.16 Q684.00 72.20 684.61 68.75 L691.39 30.45 Q692.00 27.00 692.18 23.50 L692.32 21.00 Q692.50 17.50 690.49 14.63 L688.21 11.37 Q686.20 8.50 683.21 6.68 L680.49 5.02 Q677.50 3.20 674.00 3.23ZM669.05 15.94 Q672.50 16.50 673.85 18.65 L673.85 18.65 Q675.20 20.80 675.03 24.30 L674.97 25.50 Q674.80 29.00 674.22 32.45 L668.78 64.55 Q668.20 68.00 666.94 71.27 L666.76 71.73 Q665.50 75.00 663.75 77.00 L663.75 77.00 Q662.00 79.00 658.95 80.72 L658.85 80.78 Q655.80 82.50 652.30 82.63 L645.50 82.87 Q642.00 83.00 638.57 82.29 L638.23 82.21 Q634.80 81.50 633.15 79.65 L633.15 79.65 Q631.50 77.80 631.25 75.80 L631.25 75.80 Q631.00 73.80 631.56 70.35 L635.64 45.45 Q636.20 42.00 637.06 38.61 L639.64 28.39 Q640.50 25.00 642.79 22.36 L644.71 20.14 Q647.00 17.50 648.75 16.65 L648.75 16.65 Q650.50 15.80 654.00 15.65 L661.00 15.35 Q664.50 15.20 667.95 15.76ZM1037.65 1.35 Q1036.80 0.50 1033.30 0.38 L1025.30 0.12 Q1021.80 0.00 1020.00 1.10 L1020.00 1.10 Q1018.20 2.20 1017.56 5.64 L1008.84 52.76 Q1008.20 56.20 1007.83 59.68 L1007.17 65.72 Q1006.80 69.20 1007.65 70.10 L1007.65 70.10 Q1008.50 71.00 1012.00 71.00 L1017.00 71.00 Q1020.50 71.00 1021.85 69.75 L1021.85 69.75 Q1023.20 68.50 1024.01 65.10 L1037.69 7.90 Q1038.50 4.50 1038.50 3.35 L1038.50 3.35 Q1038.50 2.20 1037.65 1.35Z"/></svg>';
  var RWQ = { c:0, d:0, x:0, lv:0 }, rwTm = null, rwOpen = false, rwAt = 0, rwEl = null, rwHideT;
  function queueReward(r, lv){
    RWQ.c += Number(r.c) || 0; RWQ.d += Number(r.d) || 0; RWQ.x += Number(r.x) || 0; if (lv) RWQ.lv = lv;
    if (!rwTm) rwTm = setTimeout(flushReward, 0);
  }
  function flushReward(){
    rwTm = null;
    if (rwOpen) return; /* akan diputar setelah ditutup */
    var q = RWQ, items = []; RWQ = { c:0, d:0, x:0, lv:0 };
    if (q.c) items.push({ t:'Credit', ic:'<svg><use href="#i-credit"/></svg>', n:q.c });
    if (q.d) items.push({ t:'Diamond', ic:'<svg><use href="#i-gem"/></svg>', n:q.d });
    if (q.x) items.push({ t:'EXP', ic:'<em>EXP</em>', n:q.x });
    if (!items.length) return;
    showReward(items, q.lv);
  }
  /* ===== data animasi: diukur frame-demi-frame dari video referensi (1280x270, 30 fps) =====
     koordinat = piksel stage (1280x576); waktu dalam detik sejak klaim.
     Partikel dengan t >= 1.3 diulang terus (periode 1.75 dtk) selama layar hadiah terbuka. */
  var RWX = {
    L:1.3, P:1.75,
    /* bintang 4 sudut: [t, x, y, lebar, tinggi, durasi] */
    stars:[
      [.567,428,145,64,114,.14],[.567,353,132,34,40,.14],[.567,942,146,40,52,.14],[.567,296,150,36,40,.2],[.567,880,152,34,38,.2],[.567,640,159,30,24,.1],
      [.667,295,128,26,26,.12],[.667,895,150,46,38,.14],[.667,392,140,50,44,.12],
      [.733,577,105,44,88,.1],[.733,997,136,22,28,.08],[.733,292,152,29,29,.1],[.733,401,136,32,34,.1],
      [.833,743,237,45,62,.17],[.833,973,174,65,29,.1],
      [1.37,921,156,46,56,.17],[1.73,598,157,38,37,.1],[2.0,439,98,61,73,.1],[2.13,395,148,65,80,.13],
      [2.27,724,150,42,68,.17],[2.43,907,125,48,84,.1],[2.6,935,229,102,93,.13],[2.87,692,94,94,107,.13]
    ],
    /* kilap kecil di sekitar huruf: [t, x, y, ukuran] */
    glints:[
      [.73,372,127,10],[.73,403,138,12],[.73,923,140,8],[.73,910,147,12],[.73,911,164,9],[.73,973,169,9],[.73,949,172,9],
      [.77,392,175,9],[.77,351,187,16],[.83,244,130,18],[.83,396,131,22],[.83,1057,150,14],[.83,917,147,9],[.87,273,151,20],
      [.9,250,171,6],[.93,1025,133,13],[.93,937,136,6],[.97,1031,132,15],[.97,859,149,11],[1.0,214,127,17],[1.0,382,132,12],
      [1.03,1038,132,13],[1.07,1043,134,10],[1.1,189,127,11],[1.1,1106,149,13],[1.2,169,127,8],[1.23,211,155,5]
    ],
    /* kotak krem miring: [t, x, y, lebar, tinggi, durasi] */
    sqs:[
      [.667,973,135,30,30,.1],[.667,1008,152,23,22,.1],[.733,265,127,16,18,.1],[.733,350,182,30,20,.1],[.733,385,180,29,18,.1],
      [.733,439,209,80,43,.1],[.733,890,148,16,12,.12],[.733,1036,152,19,16,.1],
      [.833,565,119,38,39,.1],[.967,819,100,40,22,.1],[1.03,863,220,41,30,.1],[1.37,637,204,53,44,.13],
      [1.8,905,179,84,40,.07],[2.23,486,52,84,48,.07],[2.6,755,128,35,36,.07]
    ],
    /* segitiga biru melayang naik: [t0, t1, x0, y0, x1, y1, ukuran] */
    tris:[
      [1.4,1.87,739,256,739,217,10],[1.7,2.25,771,259,771,203,9],[2.38,2.87,638,258,638,224,7],
      [2.67,3.05,1044,253,1044,213,13],[2.7,2.8,174,257,174,244,5]
    ],
    /* panah kuning kecil: [t0, t1, x0, y0, x1, y1] */
    arrows:[
      [1.3,1.7,151,124,118,126],[1.33,1.57,364,131,359,132],[1.63,1.72,1108,128,1110,128],[1.33,1.5,1139,150,1139,150]
    ],
    /* persegi biru transparan: [t0, t1, x, y, lebar, tinggi] */
    rects:[ [.47,.6,942,60,123,50],[.667,.77,321,58,145,137],[.733,.83,311,170,80,52] ]
  };
  var RWSTAR = '<svg viewBox="0 0 100 130" preserveAspectRatio="none"><path d="M50 0Q54.5 61 100 65Q54.5 69 50 130Q45.5 69 0 65Q45.5 61 50 0Z" fill="#fff"/><circle cx="50" cy="65" r="13" fill="rgba(255,250,190,.9)"/><circle cx="50" cy="65" r="6" fill="#fff"/></svg>';
  function rwKf(fr, T){
    /* lengkapi tiap keyframe: sifat yang tidak disebut ikut nilai keyframe sebelumnya (dan yang baru muncul belakangan diisi mundur) */
    var o = fr.map(function(f){ var k = { offset:Math.max(0, Math.min(1, f[0] / T)) }; for (var p in f[1]) k[p] = f[1][p]; return k; }), props = {}, cur = {}, first = {};
    o.forEach(function(k){ for (var p in k) if (p !== 'offset'){ props[p] = 1; if (!(p in first)) first[p] = k[p]; } });
    o.forEach(function(k){ for (var p in props){ if (p in k) cur[p] = k[p]; else k[p] = (p in cur) ? cur[p] : first[p]; } });
    if (o[0].offset > 0){ var c = {}; for (var p in o[0]) c[p] = o[0][p]; c.offset = 0; o.unshift(c); }
    var l = o[o.length - 1]; if (l.offset < 1){ var d = {}; for (var q in l) d[q] = l[q]; d.offset = 1; o.push(d); }
    return o;
  }
  /* jalankan animasi: fr = [[detik, {css}], ...]; T = total detik; loop = ulangi tiap RWX.P setelah RWX.L */
  function rwPlay(el, fr, T, loop){
    return el.animate(rwKf(fr, T), { duration:T * 1000, delay:loop ? RWX.L * 1000 : 0, iterations:loop ? Infinity : 1, fill:'both', easing:'linear' });
  }
  function rwFxBuild(){
    var fx = $('#rwFx'), W = 1000, i; fx.innerHTML = '';
    function add(cls, css, html){ var e = document.createElement('i'); e.className = cls; if (css) e.style.cssText = css; if (html) e.innerHTML = html; fx.appendChild(e); return e; }
    function tr(x, y, s, extra){ return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (extra ? ' ' + extra : ''); }
    /* jadwalkan satu kejadian; frames dibuat relatif terhadap awal kejadian (dt) */
    function ev(t, life, mk){
      var loop = t >= RWX.L, base = loop ? t - RWX.L : t, T = loop ? RWX.P : t + life + .02, fr = mk(function(dt, css){ return [base + dt, css]; });
      return { fr:fr, T:T, loop:loop };
    }
    function go(el, e){ rwPlay(el, e.fr, e.T, e.loop); }

    /* --- kilat putih layar penuh + redup latar (t = 0.033 .. 0.10) --- */
    var wash = $('#rwOv .rw0'), dim = $('#rwOv .rd');
    [wash, dim].forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); });
    rwPlay(wash, [[0,{opacity:0}],[.033,{opacity:1}],[.067,{opacity:.8}],[.1,{opacity:0}]], .1);
    rwPlay(dim,  [[0,{opacity:0}],[.03,{opacity:0}],[.1,{opacity:1}]], .1);

    /* --- pita kuning selebar layar yang menipis jadi garis oranye --- */
    var bd = add('bd');
    rwPlay(bd, [[.067,{opacity:0,height:'58px',background:'#fffda1'}],[.1,{opacity:1,height:'58px'}],[.167,{height:'46px'}],[.2,{height:'16px',background:'#fdfc94'}],
      [.267,{height:'14px',background:'#fffd93'}],[.3,{height:'13px',background:'#f9d87e'}],[.333,{height:'13px',background:'#f8c37b'}],
      [.367,{height:'12px',opacity:.7}],[.4,{opacity:.63}],[.467,{height:'10px',opacity:.3}],[.533,{height:'6px',opacity:.13}],[.567,{height:'2px',opacity:0}]], .6);
    var bgb = add('bg');
    rwPlay(bgb, [[.55,{opacity:0}],[.567,{opacity:.37}],[.633,{opacity:.37}],[.65,{opacity:0}]], .66);

    /* --- halo kuning di belakang teks (memudar ±1.4 dtk) --- */
    var hz = add('hz');
    rwPlay(hz, [[.4,{opacity:0}],[.5,{opacity:.9}],[.567,{opacity:.74}],[.667,{opacity:.57}],[.733,{opacity:.53}],[.833,{opacity:.39}],[.967,{opacity:.3}],
      [1.1,{opacity:.2}],[1.233,{opacity:.13}],[1.5,{opacity:.05}],[1.7,{opacity:0}]], 1.72);

    /* --- elips glow kuning yang menyusut --- */
    var gl = add('gl');
    rwPlay(gl, [[.067,{opacity:0,width:'880px',height:'205px'}],[.1,{opacity:1,width:'880px',height:'205px'}],[.133,{width:'866px',height:'201px'}],[.2,{width:'798px',height:'177px'}],
      [.267,{width:'754px',height:'169px'}],[.333,{width:'734px',height:'161px'}],[.4,{width:'682px',height:'151px'}],[.467,{width:'665px',height:'141px'}],
      [.5,{width:'622px',height:'128px'}],[.567,{opacity:1,width:'424px',height:'118px'}],[.6,{opacity:.7,width:'380px',height:'110px'}],[.667,{opacity:0,width:'330px',height:'100px'}]], .7);

    /* --- judul: muncul pucat & mengecil dari 1.03x, lalu stabil --- */
    var ti = add('ti', '', RW_TITLE);
    rwPlay(ti, [[.067,{opacity:0,transform:'scale(.92)'}],[.1,{opacity:.4,transform:'scale(.92)'}],[.133,{opacity:.45,transform:'scale(.92)'}],[.167,{opacity:.45,transform:'scale(.92)'}],
      [.2,{opacity:.92,transform:'scale(1.028)'}],[.267,{opacity:1,transform:'scale(1.025)'}],[.3,{transform:'scale(1.01)'}],[.367,{transform:'scale(1)'}]], .4);

    /* --- inti putih yang melebar lalu pecah jadi kilauan --- */
    var cr = add('cr');
    rwPlay(cr, [[.067,{opacity:0,left:'645px',width:'437px',height:'115px'}],[.1,{opacity:1,left:'645px',width:'437px',height:'115px'}],[.133,{left:'644px',width:'449px',height:'113px'}],
      [.167,{left:'644px',width:'449px',height:'113px'}],[.2,{left:'646px',width:'475px',height:'109px'}],[.233,{left:'650px',width:'493px',height:'109px'}],
      [.267,{left:'651px',width:'499px',height:'109px'}],[.3,{left:'651px',width:'511px',height:'107px'}],[.333,{left:'652px',width:'521px',height:'105px'}],
      [.367,{left:'653px',width:'543px',height:'105px'}],[.4,{left:'652px',width:'553px',height:'105px'}],[.433,{left:'653px',width:'575px',height:'105px'}],
      [.467,{left:'655px',width:'615px',height:'100px'}],[.5,{left:'682px',width:'727px',height:'73px'}],[.533,{left:'682px',width:'727px',height:'73px'}],
      [.567,{opacity:1,left:'648px',width:'651px',height:'65px'}],[.633,{opacity:.85,left:'648px',width:'651px',height:'65px'}],[.667,{opacity:0}]], .7);

    /* --- persegi biru transparan --- */
    RWX.rects.forEach(function(r){
      var e = add('rc2', 'width:' + r[4] + 'px;height:' + r[5] + 'px;transform:translate(' + r[2] + 'px,' + r[3] + 'px)'), d = r[1] - r[0];
      rwPlay(e, [[r[0],{opacity:0}],[r[0] + d * .15,{opacity:1}],[r[0] + d * .8,{opacity:.9}],[r[1],{opacity:0}]], r[1] + .02);
    });
    /* --- bintang & kilap --- */
    function star(t, x, y, w, h, life){
      var e = add('st', 'width:' + w + 'px;height:' + h + 'px', RWSTAR), p = function(s){ return tr(x - w / 2, y - h / 2, 0, 'scale(' + s + ')'); };
      go(e, ev(t, life, function(f){ return [f(0,{opacity:0,transform:p(.25)}), f(life * .25,{opacity:1,transform:p(1)}), f(life * .6,{opacity:1,transform:p(1.06)}), f(life,{opacity:0,transform:p(.4)})]; }));
    }
    RWX.stars.forEach(function(s){ star(s[0], s[1], s[2], s[3], s[4], s[5]); });
    RWX.glints.forEach(function(g){ star(g[0], g[1], g[2], g[3], Math.round(g[3] * 1.25), .16); });
    /* --- kotak krem --- */
    RWX.sqs.forEach(function(s){
      var e = add('sq', 'width:' + s[3] + 'px;height:' + s[4] + 'px'), x = s[1] - s[3] / 2, y = s[2] - s[4] / 2, life = s[5];
      go(e, ev(s[0], life, function(f){ return [f(-.001,{opacity:0,transform:tr(x, y, 0, 'skewX(-12deg)')}), f(0,{opacity:.95,transform:tr(x, y, 0, 'skewX(-12deg)')}), f(life * .5,{opacity:.9,transform:tr(x, y - 3, 0, 'skewX(-12deg)')}), f(life,{opacity:0,transform:tr(x, y - 6, 0, 'skewX(-12deg)')})]; }));
    });
    /* --- segitiga biru naik & panah kuning --- */
    function drift(cls, t0, t1, x0, y0, x1, y1, sz, w, h, top){
      var e = add(cls, 'width:' + w + 'px;height:' + h + 'px'), d = t1 - t0;
      function at(u){ return tr(x0 + (x1 - x0) * u - w / 2, y0 + (y1 - y0) * u - h / 2, 0); }
      go(e, ev(t0, d, function(f){ return [f(0,{opacity:0,transform:at(0)}), f(d * .12,{opacity:top,transform:at(.12)}), f(d * .8,{opacity:top * .85,transform:at(.8)}), f(d,{opacity:0,transform:at(1)})]; }));
    }
    RWX.tris.forEach(function(s){ drift('tr', s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[6], Math.round(s[6] * .85), .95); });
    RWX.arrows.forEach(function(s){ drift('ar', s[0], s[1], s[2], s[3], s[4], s[5], 8, 8, 7, .9); });
  }
  function buildReward(){
    $('#stage').insertAdjacentHTML('beforeend', '<div id="rwOv" role="dialog" aria-label="Hadiah diterima"><div class="rd"></div><div class="rw0"></div><div id="rwFx"></div>' +
      '<div class="rb"><div class="rbf"></div><div class="rc" id="rwCards"></div><div class="rps" id="rwPs"></div></div>' +
      '<div class="rlv" id="rwLv"></div><div class="rtc">TOUCH TO CONTINUE</div></div>');
    rwEl = $('#rwOv');
    rwEl.addEventListener('click', closeReward);
    window.addEventListener('keydown', function(e){ if (rwOpen && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopImmediatePropagation(); closeReward(); } }, true);
  }
  function showReward(items, lv){
    if (!rwEl) buildReward();
    clearTimeout(rwHideT);
    $('#rwCards').innerHTML = items.map(function(it, i){
      return '<div class="rcw" style="--i:' + i + '"><div class="rbeam"></div><div class="rcard"><div class="rcn">' + it.t + '</div><div class="rci">' + it.ic + '</div><div class="rcx">x' + fmt(it.n) + '</div></div></div>';
    }).join('');
    $('#rwLv').textContent = lv ? 'LEVEL UP!  Lv. ' + lv : '';
    var ps = ''; for (var i = 0; i < 16; i++){
      ps += '<i class="rp" style="left:' + (8 + Math.random() * 84).toFixed(1) + '%;top:' + (30 + Math.random() * 62).toFixed(1) + '%;--t:' + (1.1 + Math.random() * 2.4).toFixed(2) + 's;--d:' + (2.6 + Math.random() * 2.4).toFixed(2) + 's;--x:' + Math.round(-14 + Math.random() * 28) + 'px"></i>';
    }
    $('#rwPs').innerHTML = ps;
    rwEl.classList.remove('go', 'out'); rwEl.classList.add('on'); void rwEl.offsetWidth; rwEl.classList.add('go');
    rwFxBuild();
    rwOpen = true; rwAt = Date.now();
  }
  function closeReward(){
    if (!rwOpen || Date.now() - rwAt < 900) return; /* "touch to continue" baru muncul ±1 dtk */
    rwOpen = false; rwEl.classList.add('out');
    rwHideT = setTimeout(function(){ rwEl.classList.remove('on', 'go', 'out'); $('#rwFx').innerHTML = ''; if (RWQ.c || RWQ.d || RWQ.x) flushReward(); }, 240);
  }
  function give(r){
    DATA.credit += r.c; DATA.diamond += r.d; var up = addExp(r.x);
    queueReward(r, up ? DATA.player.level : 0);
  }
  function bonusInfo(){
    var daily = pgSub === 'daily', list = DATA.tasks[pgSub], key = daily ? 'dailyDia' : 'weeklyDia', stamp = daily ? today() : weekKey();
    var n = list.length, c = list.filter(function(x){ return x.claimed; }).length, allDone = n > 0 && c === n, got = allDone && DATA[key] === stamp;
    return { daily:daily, list:list, key:key, stamp:stamp, n:n, c:c, allDone:allDone, got:got, ready:allDone && !got };
  }
  function claimBonus(){
    var S = bonusInfo(); if (!S.ready) return;
    var sum = Math.max(0, Math.floor(Number(DATA.taskDia[pgSub])) || 0);
    DATA[S.key] = S.stamp; DATA.diamond += sum;
    queueReward({ c:0, d:sum, x:0 }, 0);
    afterChange();
  }
  function claimAll(){
    var S = bonusInfo(), pend = S.list.filter(function(x){ return !x.claimed; });
    if (!pend.length){ claimBonus(); return; }
    askConfirm({ title:'Claim All?', text:pend.length + ' task yang belum selesai akan ditandai selesai dan hadiahnya langsung diberikan. Bonus diamond diambil dengan klik lagi. Tidak bisa dibatalkan.', ok:'Claim All' }, function(){
      pend.forEach(function(it){ completeTask(it); });
      /* diamond bonus baru bisa diklaim setelah semua task selesai, jadi harus diklik lagi */
    });
  }
  function afterChange(){ saveGame(); updRes(); syncLobby(); renderPage(); }
  function renderPage(){
    var anim = pgAnim, bot = $('#pgBot'); pgAnim = false; if (anim) setDir(pg, pgDir); pgDir = 'u';
    var L = $('#pgList'), k = pgKind, list = glist(k), sc = anim ? 0 : L.scrollTop, claimed = 0; L.innerHTML = '';
    L.classList.remove('anim-in'); bot.classList.remove('anim-bot'); if (anim && k === 'task') bot.classList.add('anim-bot');
    list.forEach(function(it){ if (it.claimed || it.fin) claimed++; });
    $('#pgSum').textContent = k === 'task' ? (pgSub === 'daily' ? 'Hari ini ' : 'Minggu ini ') + claimed + '/' + list.length + ' task selesai' : (k === 'ach' || k === 'chal' || k === 'skill' || k === 'craft' || k === 'inv' || k === 'char' || k === 'social') ? '' : 'Diklaim ' + claimed + '/' + list.length;
    if (k === 'task' && pgSub === 'daily') $('#pgSum').textContent += ' · EXP ' + (DATA.xpToday || 0) + '/' + dailyBudget(dailyItems().length);
    if (k === 'task') renderTaskBar();
    if (k === 'char'){ renderChar(L, anim); return; }
    if (!list.length){ L.innerHTML = '<div class="pgempty">' + (k === 'ach' ? 'Halaman Formation masih kosong.' : (k === 'chal' || k === 'skill' || k === 'craft' || k === 'inv' || k === 'char' || k === 'social') ? 'Halaman ' + KIND[k].n + ' masih kosong.' : 'Belum ada ' + KIND[k].n + '.') + '</div>'; if (anim) L.classList.add('anim-in'); return; }
    list.forEach(function(it){
      var cnt = (k === 'task'), v = cnt ? it.done : mval(it, k), g = it.goal, ready = v >= g && !it.claimed, c = document.createElement('div');
      c.className = (k === 'task' ? 'tk' : 'pc') + ((it.claimed || it.fin) ? ' ok' : '');
      c.innerHTML = k === 'task' ? taskCard(it) : '<span class="pci"><svg><use href="#' + KIND[k].ic + '"/></svg></span><div class="pcm"><div class="pcn">' + esc(it.name) + '</div>' + (k === 'task' ? '<div class="pcb"><span>' + (it.claimed ? 'Sudah selesai' : 'Belum selesai') + '</span></div>' :
        '<div class="pcb"><div class="b2"><i style="width:' + Math.min(100, Math.round(v / g * 100)) + '%"></i></div><span>' + Math.min(v, g) + '/' + g + '</span></div>') + '<div class="pcr">' + chipsOf(it.reward, isDay(it, k) ? expOf(it) : null, wOf(it), (k === 'chal' || k === 'ach') ? 'dia' : k === 'task' ? 'bonus' : '') + '</div></div>';
      var act = function(label, cls, fn, dis){
        var b = document.createElement('button'); b.className = (k === 'task' ? 'tkbtn ' : 'pbt ') + cls; b.textContent = label; b.disabled = !!dis; if (fn) b.addEventListener('click', function(e){ e.stopPropagation(); fn(e); }); (k === 'task' ? c.querySelector('.tkb') : c).appendChild(b); return b;
      };
      if (it.claimed) act('Selesai ✓', '', null, true);
      else if (k === 'task'){
        act('Selesai', 'gold', function(){
          askConfirm({ title:'Selesaikan task?', text:'“' + it.name + '” ditandai selesai dan hadiahnya langsung diberikan. Tidak bisa dibatalkan.', ok:'Selesai' }, function(){ completeTask(it); });
        });
      }
      else if (ready) act('Klaim', 'gold', function(){ { it.claimed = true; if (k === 'task'){ DATA.stats.tasks = (DATA.stats.tasks || 0) + 1; give({ c:it.reward.c, d:0, x:isDay(it, k) ? 0 : it.reward.x }); } else give({ c:0, d:it.reward.d, x:0 }); afterChange(); } });
      else if (cnt){
        if (it.done > 0) act('−', 'sm', function(){ it.done--; afterChange(); });
        act('+1', '', function(){ it.done++; if (isDay(it, k)) grantProgress(it); afterChange(); });
      } else act('Progres', '', function(){ openProg(it, k); });
      if ((k === 'chal' || k === 'ach') && !it.claimed){ c.classList.add('tap'); c.addEventListener('click', function(){ openProg(it, k); }); }
      L.appendChild(c);
    });
    L.scrollTop = sc;
    if (anim) L.classList.add('anim-in');
  }
  function ibox(ic, txt){ return '<span class="ib">' + ic + '<i class="ibx">x' + txt + '</i></span>'; }
  function taskCard(it){
    var daily = pgSub === 'daily', r = it.reward;
    var xp = daily ? expOf(it) : r.x, v = it.claimed ? 1 : 0, info = [];
    info.push(daily ? DIFF[wOf(it)] : 'Minggu ini');
    return '<div class="tkb"><div class="tkt"><span class="tkn">' + esc(it.name) + '</span></div>' +
      '<div class="tkp"><div class="tkc"><span>Count</span><b>' + v + ' / 1</b></div><div class="tkbar"><i style="width:' + (v * 100) + '%"></i></div></div>' +
      '<div class="tkrw">' + (r.c ? ibox('<svg><use href="#i-credit"/></svg>', fmt(r.c)) : '') + (xp ? ibox('<em>EXP</em>', fmt(xp)) : '') + '</div></div>';
  }
  function renderTaskBar(){
    var S = bonusInfo(), bot = $('#pgBot'), pend = S.n - S.c, all = S.got;
    bot.classList.toggle('done', all);
    bot.innerHTML = '<div class="bpanel"><div class="bm"><div class="bl"><b>Complete at least ' + S.n + ' ' + (S.daily ? 'Daily' : 'Weekly') + ' Task(s)</b><span>Count <b>' + S.c + ' / ' + S.n + '</b></span></div>' +
      '<div class="bbar' + (S.allDone ? ' full' : '') + '"><i style="width:' + (S.n ? Math.round(S.c / S.n * 100) : 0) + '%"></i></div></div>' +
      '<span class="btile"><svg><use href="#i-gem"/></svg><em>x' + fmt(DATA.taskDia[pgSub] || 0) + '</em></span>' +
      '<button class="bclaim' + (S.got ? ' got' : '') + '" id="bBonus"' + (S.ready ? '' : ' disabled') + '>' + (S.got ? 'Complete' : 'Claim') + '</button></div>' +
      '<button class="bbig" id="bAll"' + ((pend > 0 || S.ready) ? '' : ' disabled') + '>Claim All</button>';
  }
  $('#pgBot').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.id === 'bBonus') claimBonus(); else if (b.id === 'bAll') claimAll();
  });
  function paintSeg(){
    var sg = $('#pgSeg'); sg.style.display = pgKind === 'task' ? 'flex' : 'none'; pg.classList.toggle('hasseg', pgKind === 'task'); pg.classList.toggle('istask', pgKind === 'task'); pg.classList.toggle('ischar', pgKind === 'char');
    Array.prototype.forEach.call(sg.querySelectorAll('button'), function(b){ b.classList.toggle('on', b.getAttribute('data-s') === pgSub); });
  }
  function openPage(k){ closeAll(); closeShop(); closeChar(); pgKind = k; pgT.textContent = KIND[k].n; updRes(); paintSeg(); pgAnim = true; renderPage(); pg.classList.add('on'); }
  Array.prototype.forEach.call($('#pgSeg').querySelectorAll('button'), function(b){
    b.addEventListener('click', function(){ if (pgSub === b.getAttribute('data-s')) return; pgDir = b.getAttribute('data-s') === 'weekly' ? 'r' : 'l'; pgSub = b.getAttribute('data-s'); $('#pgList').scrollTop = 0; paintSeg(); pgAnim = true; renderPage(); });
  });
  /* ---- halaman Char: kartu karakter (isi kartu menyusul) + tab filter posisi barisan ---- */
  var CHARS = [{ pos:'front' }, { pos:'mid', nia:1 }, { pos:'back' }], chFilter = 'all';
  function renderChar(L, anim){
    L.innerHTML = '';
    CHARS.forEach(function(c){
      if (chFilter !== 'all' && c.pos !== chFilter) return;
      var d = document.createElement('div'); d.className = 'chcard'; d.setAttribute('data-pos', c.pos); L.appendChild(d);
      if (c.nia){ d.classList.add('nia'); d.innerHTML = '<div class="ncs">&#9670;&#9670;&#9670;&#9670;</div>' + DROP_SVG + '<div class="ncn">Nia</div><div class="nce">Water &middot; DPS &middot; Middle</div>'; d.addEventListener('click', function(){ go(openNia); }); }
    });
    if (anim) L.classList.add('anim-in');
  }
  function paintChTabs(){
    Array.prototype.forEach.call($('#chTabs').querySelectorAll('button'), function(b){ b.classList.toggle('on', b.getAttribute('data-f') === chFilter); });
  }
  Array.prototype.forEach.call($('#chTabs').querySelectorAll('button'), function(b){
    b.addEventListener('click', function(){
      var f = b.getAttribute('data-f'); if (f === chFilter) return;
      chFilter = f; paintChTabs(); $('#pgList').scrollTop = 0; pgAnim = true; pgDir = 'u'; renderPage();
    });
  });
  $('#chFlt').addEventListener('click', function(){ toast('Filter segera hadir'); });
  var DROP_SVG = '<svg class="ncf" viewBox="0 0 100 120"><defs><linearGradient id="ndgc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe0f6"/><stop offset="1" stop-color="#4f9de0"/></linearGradient></defs><path d="M50 6C50 6 14 50 14 78a36 36 0 0 0 72 0C86 50 50 6 50 6z" fill="url(#ndgc)"/></svg>';
  var NIA_ST = [['HP',850],['ATK',70],['DEF',50],['MATK',160],['MDEF',70],['SPD',105],['Crit Rate','7%'],['Crit DMG','55%'],['MP',100]];
  var NIA_SK = [
    { k:'U', n:"Ocean's Wrath", t:'Pusaran air besar menghantam semua musuh. DMG 350% MATK dan +2 Aqua Mark. Butuh 100 MP.' },
    { k:'1', n:'Aqua Lance', t:'Menembakkan tombak air ke 3 musuh terdekat. DMG 180% MATK dan +1 Aqua Mark. Cooldown 6 detik.' },
    { k:'2', n:'Tidal Burst', t:'Gelombang air mengenai semua musuh. DMG 140% MATK, +1 Aqua Mark, Slow 20% selama 2 detik, dan knockback ringan. Cooldown 10 detik.' } ];
  var ndSkCur = -1;
  var NIA_TL = [
    { n:'Water Affinity', t:'Water DMG Bonus +8% dan MATK +5%.' },
    { n:'Enhanced Resonance', t:'Batas Aqua Mark naik dari 5 menjadi 6 dan MATK +5%. Dengan 6 Mark, damage Nia hingga +18% ke musuh itu.' },
    { n:'Oceanic Mastery', t:'Ultimate DMG +15%, Water DMG Bonus +8%, dan Crit Rate +10% saat menyerang musuh dengan minimal 5 Aqua Mark.' } ];
  /* ===== SKALA SKILL (linear dari Lv.1): damage maks = 2x Lv.1; cooldown maks = -20% dari Lv.1; pasif 3% > 5% ===== */
  var SK_BASE = [ { dmg:350, max:5 }, { dmg:180, cd:6, max:10 }, { dmg:140, cd:10, max:10 } ];   /* indeks sama dengan NIA_SK: 0 Ultimate, 1 Skill 1, 2 Skill 2 */
  function sk1(x){ return String(Math.round(x * 10) / 10).replace('.', ','); }
  function skDmg(i, lv){ var b = SK_BASE[i]; return b.dmg * (1 + (lv - 1) / (b.max - 1)); }
  function skCd(i, lv){ var b = SK_BASE[i]; return b.cd * (1 - 0.2 * (lv - 1) / (b.max - 1)); }
  function paPct(lv){ return 3 + (lv - 1) * 0.5; }
  function paMax(){ return Char.prog().uniqueWeaponStars >= 2 ? 6 : 5; }
  function pvn(cur, nxt, suf){ return sk1(cur) + suf + (nxt == null ? '' : '<span class="pvg"> &gt; ' + sk1(nxt) + suf + '</span>'); }
  function pvc(cur, nxt){ return sk1(cur) + (nxt == null ? '' : '<span class="pvg"> &gt; ' + sk1(nxt) + '</span>') + ' detik'; }
  function skTxt(i, lv, pv){   /* pv = true: tampilkan nilai level berikutnya (hijau) tepat di samping angkanya */
    var n = pv && lv < SK_BASE[i].max ? lv + 1 : 0, D = pvn(skDmg(i, lv), n ? skDmg(i, n) : null, '%');
    if (i === 0) return 'Pusaran air besar menghantam semua musuh. DMG ' + D + ' MATK dan +2 Aqua Mark. Butuh 100 MP.';
    var C = pvc(skCd(i, lv), n ? skCd(i, n) : null);
    if (i === 1) return 'Menembakkan tombak air ke 3 musuh terdekat. DMG ' + D + ' MATK dan +1 Aqua Mark. Cooldown ' + C + '.';
    return 'Gelombang air mengenai semua musuh. DMG ' + D + ' MATK, +1 Aqua Mark, Slow 20% selama 2 detik, dan knockback ringan. Cooldown ' + C + '.';
  }
  function paTxt(lv, pv){ return 'Pasif: Skill memberi +1 Aqua Mark (Ultimate +2) ke tiap musuh yang terkena, maks ' + paMax() + ' Mark. Tiap Mark menambah ' + pvn(paPct(lv), pv && lv < 5 ? paPct(lv + 1) : null, '%') + ' damage Nia ke musuh itu selama 5 detik. Basic Attack tidak memberi Mark.'; }
  /* bonus persen Talent (Star 1 +5%, Star 2 +5% = total +10%) dihitung dari MATK dasar pada level saat ini (tanpa equipment & Unique Weapon) */
  function talMatk(v0){ return v0 * 0.05 * Math.min(Char.prog().uniqueWeaponStars, 2); }
  function talTxt(i){
    if (i === 1) return 'Batas Aqua Mark naik dari 5 menjadi 6 dan MATK +5%. Dengan 6 Mark, damage Nia hingga +' + sk1(6 * paPct(Char.prog().passiveLevel)) + '% ke musuh itu.';
    return NIA_TL[i].t;
  }
  var STAR_COST = [1, 1, 1];   /* Talent Insignia untuk membuka Star 1 / 2 / 3 */
  var STAR_CAP = [30, 40, 50], W_MAX = 50;   /* batas level Unique Weapon per Star terbuka */
  var ndOv = $('#ndOv');
  function ndSkill(i, btn){
    ndSkCur = (i === ndSkCur) ? -1 : i;
    var on = ndSkCur >= 0, pop = $('#ndSk');
    $('#ndDim').style.display = pop.style.display = on ? 'block' : 'none';
    Array.prototype.forEach.call($('#ndRcl').querySelectorAll('.ndc'), function(b, j){ b.classList.toggle('on', j === ndSkCur); });
    if (!on || !btn) return;
    $('#ndSkN').innerHTML = NIA_SK[ndSkCur].n + ' <span class="ndlvl">Lv ' + ndSkLv(ndSkCur) + '</span>'; $('#ndSkT').textContent = skTxt(ndSkCur, ndSkLv(ndSkCur));
    var o = ndOv.getBoundingClientRect(), r = btn.getBoundingClientRect(), k = o.width / ndOv.offsetWidth;
    var cx = (r.left - o.left) / k + r.width / k / 2, ph = pop.offsetHeight, pw = pop.offsetWidth;
    var left = Math.max(12, Math.min(cx - pw / 2, 1280 - pw - 12)), top = Math.min((r.bottom - o.top) / k + 24, 570 - ph);
    pop.style.left = left + 'px'; pop.style.top = top + 'px'; pop.style.setProperty('--ax', (cx - left - 8) + 'px');
  }
  var ndTalCur = 0;
  function ndTalent(i){
    ndTalCur = i;
    $('#ndTc').innerHTML = '&#10022;'; $('#ndTn').textContent = 'Star ' + (i + 1) + ' - ' + NIA_TL[i].n; $('#ndTd').textContent = talTxt(i);
    Array.prototype.forEach.call($('#ndNodes').children, function(b, j){ b.classList.toggle('on', j === i); });
    ndStarBtn();
  }
  function ndPage(p){
    if (eqcSlot >= 0){ eqcSlot = -1; $('#ndP4').classList.remove('on'); eqcSlots(); }
    Array.prototype.forEach.call(ndOv.querySelectorAll('.ndt'), function(b){ b.classList.toggle('on', b.getAttribute('data-p') === String(p)); });
    ['ndP0','ndP1','ndP2','ndP3'].forEach(function(id, i){ $('#' + id).classList.toggle('on', p === i); });
    ndOv.querySelector('.ndeq').style.display = p === 0 ? 'block' : 'none';
    ndOv.classList.toggle('tal', p === 1);
    var wasSk = ndOv.classList.contains('skl'); ndOv.classList.toggle('skl', p === 3); if (p === 3 && !wasSk) ndSkSel = 0; skRender();
  }
  $('#ndSt').innerHTML = NIA_ST.map(function(x){ return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('');
  $('#ndRcl').innerHTML = NIA_SK.map(function(x, i){ return '<div><button class="ndc" data-i="' + i + '">' + x.k + '</button><small>' + 'Lv 1' + '</small></div>'; }).join('');
  $('#ndNodes').innerHTML = NIA_TL.map(function(x, i){ return '<button class="nd2n' + (i < 2 ? ' l' : '') + '" data-i="' + i + '" style="top:' + (330 - i * 156) + 'px">Star ' + (i + 1) + '<small>' + x.n + '</small><small>Batas Lv. ' + STAR_CAP[i] + '</small></button>'; }).join('');
  Array.prototype.forEach.call($('#ndRcl').querySelectorAll('.ndc'), function(b){ b.addEventListener('click', function(){ ndSkill(Number(b.getAttribute('data-i')), b); }); });
  $('#ndDim').addEventListener('click', function(){ ndSkill(ndSkCur); });
  Array.prototype.forEach.call($('#ndNodes').children, function(b){ b.addEventListener('click', function(){ ndTalent(Number(b.getAttribute('data-i'))); $('#stOv').classList.add('on'); }); });
  Array.prototype.forEach.call(ndOv.querySelectorAll('.ndt'), function(b){ b.addEventListener('click', function(){ ndPage(Number(b.getAttribute('data-p'))); }); });
  Array.prototype.forEach.call(ndOv.querySelectorAll('[data-soon]'), function(b){ b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); }); });

  /* ===== EQUIPMENT KARAKTER: 3 slot bebas, eksklusif per equipment, stat masuk ke karakter ===== */
  var EQC_ID = 'nia', EQC_KEYS = ['HP','ATK','DEF','MATK','MDEF','SPD','CRT_RATE','CRT_DMG','MP'], eqcSlot = -1, eqcSel = null;
  function eqcBonus(i){ var k = EQC_KEYS[i], v = 0; Eq.slot(EQC_ID).forEach(function(u){ var it = u && Eq.cari(u); if (it) v += eqStat(it, k); }); return Math.round(v * 100) / 100; }
  function eqcSlots(){
    Array.prototype.forEach.call(ndOv.querySelectorAll('.ndeq .dm'), function(d, i){
      var u = Eq.slot(EQC_ID)[i], it = u && Eq.cari(u), df = it && EQ_DEF[it.id];
      d.setAttribute('data-s', i); d.className = 'dm' + (df ? ' eqf g' + df.grade : '') + (eqcSlot === i ? ' sel' : '');
      d.innerHTML = df ? '<span class="eqd">' + ivIcon('eq_' + df.id) + '<b>Lv ' + it.lv + '</b></span>' : '<span>+</span>';
    });
  }
  function eqcRender(){
    var cur = Eq.slot(EQC_ID)[eqcSlot], L = Eq.semua().slice().sort(function(a, b){
      var ma = Eq.pemilik(a.uid), mb = Eq.pemilik(b.uid), fa = ma && ma.c === EQC_ID ? 0 : 1, fb = mb && mb.c === EQC_ID ? 0 : 1, da = EQ_DEF[a.id], db = EQ_DEF[b.id];
      return (fa - fb) || (db.grade - da.grade) || (EQ_ORDER.indexOf(a.id) - EQ_ORDER.indexOf(b.id)) || (b.lv - a.lv);
    });
    if (!Eq.cari(eqcSel)) eqcSel = cur || (L[0] && L[0].uid);
    var eqcKeep = $('#eqcList').scrollTop;
    $('#eqcList').innerHTML = L.map(function(e){
      var d = EQ_DEF[e.id], o = Eq.pemilik(e.uid);
      return '<button class="ivs eqs g' + d.grade + (e.uid === eqcSel ? ' sel' : '') + '" data-id="' + esc(e.uid) + '" aria-label="' + esc(d.name) + '">' + ivIcon('eq_' + d.id) + '<b class="eqg">G' + d.grade + '</b><b class="eqv">Lv ' + e.lv + '</b>' + (o ? '<b class="eqo' + (o.c === EQC_ID ? ' me' : '') + '">' + esc(Char.nama(o.c)) + '</b>' : '') + '</button>';
    }).join(''); $('#eqcList').scrollTop = eqcKeep;
    var it = Eq.cari(eqcSel), d = it && EQ_DEF[it.id]; if (!d){ $('#eqcDet').innerHTML = ''; return; }
    var keys = Object.keys(d.base_stats);
    var st = keys.map(function(k){
      var v = eqStat(it, k), u = (k === 'CRT_RATE' || k === 'CRT_DMG') ? '%' : '';
      return '<div><small>' + esc(k === 'CRT_RATE' ? 'Crit Rate' : k === 'CRT_DMG' ? 'Crit DMG' : k) + '</small><b>' + v + u + '</b></div>';
    }).join('');
    $('#eqcDet').className = 'eqcd g' + d.grade;
    $('#eqcDet').innerHTML = '<div class="eqcic" role="button" aria-label="Buka di halaman Equipment">' + ivIcon('eq_' + d.id) + '</div><div class="eqcin"><div class="eqcnm">' + esc(d.name) + '<span class="ch">Grade ' + d.grade + '</span><small>Lv ' + it.lv + '/' + d.max_level + '</small></div><div class="ndst eqcst">' + st + '</div><p>' + esc(d.description) + '</p><span class="eqcua">Unique Ability · segera hadir</span></div>';
    var o = Eq.pemilik(it.uid); $('#eqcUse').textContent = o && o.c === EQC_ID && o.i === eqcSlot ? 'Lepas' : 'Use';
  }
  function eqcOpen(i){
    if (eqcSlot === i) return; /* tap slot yang sama: panel tetap terbuka, hanya tombol silang yang menutup */
    eqcSlot = i; eqcSel = Eq.slot(EQC_ID)[i] || null;
    ['ndP0','ndP1','ndP2','ndP3'].forEach(function(id){ $('#' + id).classList.remove('on'); }); $('#ndP4').classList.add('on');
    eqcRender(); eqcSlots(); $('#eqcList').scrollTop = 0;
  }
  function eqcClose(){ if (eqcSlot < 0) return; eqcSlot = -1; $('#ndP4').classList.remove('on'); $('#ndP0').classList.add('on'); $('#eqcDlg').classList.remove('on'); eqcSlots(); }
  function eqcDo(u){
    Eq.pasang(EQC_ID, eqcSlot, u); saveGame(); ndRefresh(); eqcRender(); toast('Equipment dipakai');
  }
  $('.ndeq').addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('.dm'); if (b) eqcOpen(Number(b.getAttribute('data-s'))); });
  $('#eqcList').addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('.eqs'); if (!b) return; eqcSel = b.getAttribute('data-id'); eqcRender(); });
  $('#eqcX').addEventListener('click', eqcClose);
  /* panel equipment hanya ditutup lewat tombol silang (#eqcX): tap di luar panel atau di dalam daftar tidak menutupnya */
  $('#eqcUse').addEventListener('click', function(){
    var it = Eq.cari(eqcSel); if (!it) return; var o = Eq.pemilik(it.uid), d = EQ_DEF[it.id];
    if (o && o.c === EQC_ID && o.i === eqcSlot){ Eq.lepas(EQC_ID, eqcSlot); saveGame(); ndRefresh(); eqcRender(); toast('Equipment dilepas'); return; }
    if (o && o.c !== EQC_ID){
      $('#eqcDT').textContent = 'Pindahkan Equipment'; $('#eqcDX').textContent = d.name + ' sedang dipakai ' + Char.nama(o.c) + '. Lepas dari ' + Char.nama(o.c) + ' dan pakai di ' + Char.nama(EQC_ID) + '?';
      $('#eqcDlg').classList.add('on'); return;
    }
    eqcDo(it.uid);
  });
  $('#eqcNo').addEventListener('click', function(){ $('#eqcDlg').classList.remove('on'); });
  $('#eqcYes').addEventListener('click', function(){ $('#eqcDlg').classList.remove('on'); if (Eq.cari(eqcSel)) eqcDo(eqcSel); });
  function openNia(){ updRes(); ndPend = [0,0,0,0,0,0]; ndWPend = [0,0,0,0,0,0]; ndRefresh(); ndSkCur = 0; ndSkill(0); ndTalent(0); ndPage(0); ndOv.classList.add('on'); }
  function closeNia(){ $('#wpOv').classList.remove('on'); $('#stOv').classList.remove('on'); ndWPend = [0,0,0,0,0,0]; ndSkCur = 0; ndSkill(0); ndOv.classList.remove('on'); }
  /* ===== SISTEM UPGRADE (konfigurasi universal; progres disimpan per karakter di DATA.prog) ===== */
  var IV_MAP = {}; IV_ITEMS.forEach(function(it){ IV_MAP[it.id] = it; });
  var UPC = {
    caps:[20,30,40,50,60,70,80,90],
    asc:[[20,2000],[40,4000],[80,7000],[160,11000],[256,16000],[384,23000],[512,32000]],
    skill:{ max:10, rec:[[[1,2]],[[1,3]],[[2,2],[1,4]],[[2,3],[1,6]],[[3,2],[2,4],[1,8]],[[3,3],[2,6],[1,12]],[[4,2],[3,4],[2,8]],[[4,3],[3,6],[2,12]],[[5,4],[4,8],[3,16]]], coin:[1000,1500,2500,4000,6000,9000,13000,18000,25000] },
    ult:{ max:5, rec:[[[1,2]],[[2,2],[1,4]],[[3,3],[2,6],[1,12]],[[5,4],[4,8],[3,16]]], coin:[2000,5000,10000,20000] },
    pas:{ max:5, rec:[[[1,2]],[[2,3],[1,6]],[[3,4],[2,8],[1,16]],[[4,4],[3,8],[2,16]]], coin:[1500,3000,6000,12000], core:[4,16,64,256] }
  };
  /* Growth Rate per stat (urutan sama dengan NIA_ST): null = belum diatur, stat tetap di nilai dasar. 5 stat pertama (HP, ATK, DEF, MATK, MDEF) memakai kurva di ndStatLv, sisanya linear (dasar + (Lv - 1) x growth) */
  var CHDEF = { nia:{ aff:'WAT', base:[850,70,50,160,70,105,7,55,100], unit:['','','','','','','%','%',''], growth:[85,7,5,16,7,0.5,0.1,0.3,0] } };
  function upNeed(l){ return 100 + 50 * (l - 1); }
  function upCap(){ return UPC.caps[Char.prog().ascensionStage]; }
  function upRem(){ var p = Char.prog(), t = -p.currentExp; for (var l = p.level; l < upCap(); l++) t += upNeed(l); return t; }
  function chExp(x){ var p = Char.prog(), cap = upCap(); p.currentExp += x; while (p.level < cap && p.currentExp >= upNeed(p.level)){ p.currentExp -= upNeed(p.level); p.level++; } if (p.level >= cap) p.currentExp = 0; }
  var SK_KEY = ['ultimateLevel','skill1Level','skill2Level'];
  function ndSkLv(i){ return Char.prog()[SK_KEY[i]]; }
  var ndPend = [0,0,0,0,0,0], ndWPend = [0,0,0,0,0,0];
  function ndPendT(){ var t = 0; for (var g = 2; g <= 5; g++) t += ndPend[g] * IV_EXP[g - 1]; return t; }
  /* --- Ascension: saat level sudah di batas, bar item berganti jadi Ascension Seal --- */
  var ndAsc = [0,0,0,0,0,0];
  function ascOn(){ var p = Char.prog(); return p.level >= upCap() && p.ascensionStage < UPC.asc.length; }
  function ascNeed(){ return UPC.asc[Char.prog().ascensionStage][0]; }
  function ascCoin(){ return UPC.asc[Char.prog().ascensionStage][1]; }
  function ndAscT(){ var t = 0; for (var g = 2; g <= 5; g++) t += ndAsc[g] * ASC_V[g - 1]; return t; }
  /* Kurva stat (aturan universal): HP, ATK, DEF, MATK, MDEF naik 12,5x di Lv.90 dengan kurva pangkat 1,3 (melonjak sedikit di level tinggi).
     Stat lain (SPD, Crit Rate, Crit DMG, MP) tetap linear. Rumus: dasar x (1 + (12,5 - 1) x ((Lv - 1) / (90 - 1)) ^ 1,3) */
  var CURVE_MAX_MUL = 12.5, CURVE_POW = 1.3, CURVE_STATS = 5;
  function ndStatLv(d, i, L){
    var g = d.growth[i];
    if (g == null) return d.base[i];
    if (i < CURVE_STATS) return Math.round(d.base[i] * (1 + (CURVE_MAX_MUL - 1) * Math.pow((L - 1) / (LV_MAX - 1), CURVE_POW)));
    return d.base[i] + (L - 1) * g;
  }
  function ndSimLv(){ var p = Char.prog(), cap = upCap(), l = p.level, e = p.currentExp + ndPendT(); while (l < cap && e >= upNeed(l)){ e -= upNeed(l); l++; } return l; }
  function ndPrev(){
    var p = Char.prog(), cap = upCap(), mx = p.level >= cap, t = ndPendT(), l = p.level, e = p.currentExp + t;
    if (ascOn()){
      var an = ascNeed(), at = ndAscT(), al = Math.max(0, at - an);
      $('#ndLv').textContent = 'Lv. ' + p.level; $('#ndLvG').textContent = '';
      $('#ndCap').textContent = 'Batas Lv. ' + cap + ' > ' + UPC.caps[p.ascensionStage + 1];
      $('#ndXpT').textContent = 'Seal ' + fmt(Math.min(at, an)) + ' / ' + fmt(an) + ' \u00b7 ' + fmt(ascCoin()) + ' Coin';
      $('#ndXpB').style.width = '0%'; $('#ndXpG').style.width = Math.min(100, at / an * 100) + '%';
      $('#ndLvBtn').textContent = 'Ascension';
      $('#ndItT').textContent = 'Ascension Seal' + (at ? ' \u00b7 Nilai ' + fmt(at) : '') + (al ? ' (kelebihan ' + fmt(al) + ' hilang)' : '');
      return;
    }
    while (l < cap && e >= upNeed(l)){ e -= upNeed(l); l++; }
    if (l >= cap) e = 0;
    var up = l > p.level, lost = Math.max(0, t - upRem()), real = 0, ghost = 0, txt;
    if (mx){ txt = 'Batas level tercapai'; real = 100; }
    else if (!t){ txt = p.currentExp + ' / ' + upNeed(p.level); real = p.currentExp / upNeed(p.level) * 100; }
    else if (l >= cap){ txt = 'Mencapai batas Lv. ' + cap + ' (+' + fmt(t) + ')'; ghost = 100; }
    else if (up){ txt = e + ' / ' + upNeed(l) + ' (+' + fmt(t) + ')'; ghost = e / upNeed(l) * 100; }
    else { txt = p.currentExp + ' > ' + e + ' / ' + upNeed(l); real = p.currentExp / upNeed(l) * 100; ghost = e / upNeed(l) * 100; }
    $('#ndLv').textContent = 'Lv. ' + p.level; $('#ndLvG').textContent = up ? ' > ' + l : '';
    $('#ndCap').textContent = 'Batas Lv. ' + cap;
    $('#ndXpT').textContent = txt; $('#ndXpB').style.width = real + '%'; $('#ndXpG').style.width = ghost + '%';
    $('#ndLvBtn').textContent = mx ? 'Maks' : 'Upgrade';
    $('#ndItT').textContent = 'Training Report' + (t ? ' \u00b7 EXP +' + fmt(t) : '') + (lost ? ' (kelebihan ' + fmt(lost) + ' hilang)' : '');
  }
  function ndItems(){
    var h = '', A = ascOn(), arr = A ? ndAsc : ndPend;
    for (var g = 2; g <= 5; g++){
      var id = (A ? 'UNI_ASC_0' : 'UNI_EXP_0') + g, own = Inv.jml(id), n = arr[g], it = IV_MAP[id], v = A ? ASC_V[g - 1] : IV_EXP[g - 1];
      h += '<button class=\"ndi g' + g + (own - n <= 0 ? ' zero' : '') + (n ? ' sel' : '') + '\" data-g=\"' + g + '\" aria-label=\"' + esc(it.name) + '\">' + ivIcon(it.ic) + '<small>+' + fmt(v) + '</small><b class=\"ivq\">' + fmt(own - n) + '</b>' + (n ? '<u class=\"ndn\">+' + n + '</u><span class=\"ndm\" data-m=\"1\">-</span>' : '') + '</button>';
    }
    $('#ndIt').innerHTML = h;
  }
  $('#ndIt').addEventListener('click', function(e){
    var m = e.target.closest && e.target.closest('[data-m]'), b = e.target.closest && e.target.closest('button[data-g]'); if (!b) return;
    var g = Number(b.getAttribute('data-g')), p = Char.prog(), A = ascOn(), arr = A ? ndAsc : ndPend, own = Inv.jml((A ? 'UNI_ASC_0' : 'UNI_EXP_0') + g);
    if (m){ if (arr[g] > 0) arr[g]--; }
    else if (!A && p.level >= upCap()){ toast('Level sudah maksimum'); return; }
    else if (arr[g] >= own){ toast('Item habis'); return; }
    else if (A ? ndAscT() >= ascNeed() : ndPendT() >= upRem()){ toast(A ? 'Nilai Seal sudah cukup' : 'Sudah cukup untuk mencapai batas level'); return; }
    else arr[g]++;
    ndRefresh();
  });
  $('#ndItR').addEventListener('click', function(){ ndPend = [0,0,0,0,0,0]; ndAsc = [0,0,0,0,0,0]; ndRefresh(); });
  /* --- Talent (Unique Weapon): sistem upgrade sama seperti tab Status; nilai Prism terkumpul jadi progres, sisa nilai disimpan --- */
  function wNeed(l){ return 4 * l; }
  function wCoin(l){ return 1500 + 500 * l; }
  function wExp(){ return Char.prog().uniqueWeaponExp || 0; }
  function wCap(){ var n = Char.prog().uniqueWeaponStars; return n ? STAR_CAP[n - 1] : 0; }
  function wCapMsg(){ var n = Char.prog().uniqueWeaponStars; return n >= 3 ? 'Level sudah maksimum' : 'Batas Lv. ' + wCap() + ' tercapai - buka Star ' + (n + 1) + ' dulu'; }
  function wRem(){ var p = Char.prog(), t = -wExp(); for (var l = p.uniqueWeaponLevel; l < wCap(); l++) t += wNeed(l); return t; }
  function ndWPendT(){ var t = 0; for (var g = 2; g <= 5; g++) t += ndWPend[g] * IV_V[g - 1]; return t; }
  function wSim(t){ var p = Char.prog(), cap = wCap(), l = p.uniqueWeaponLevel, e = wExp() + t, coin = 0; while (l < cap && e >= wNeed(l)){ e -= wNeed(l); coin += wCoin(l); l++; } if (l >= cap) e = 0; return { l:l, e:e, coin:coin }; }
  function ndWPrev(){
    var p = Char.prog(), un = p.uniqueWeaponUnlocked, w = p.uniqueWeaponLevel, cap = wCap(), mx = un && w >= cap, t = un ? ndWPendT() : 0, ex = wExp();
    var s = un ? wSim(t) : { l:0, e:0, coin:0 }, up = un && s.l > w, lost = un ? Math.max(0, t - wRem()) : 0, real = 0, ghost = 0, txt;
    if (!un){ txt = 'Belum terbuka - butuh 1 Talent Insignia'; }
    else if (mx){ txt = cap >= W_MAX ? 'Level maksimum' : 'Batas Lv. ' + cap + ' - buka Star ' + (p.uniqueWeaponStars + 1); real = 100; }
    else if (!t){ txt = ex + ' / ' + wNeed(w); real = ex / wNeed(w) * 100; }
    else if (s.l >= cap){ txt = 'Mencapai batas Lv. ' + cap + ' (+' + fmt(t) + ')'; ghost = 100; }
    else if (up){ txt = s.e + ' / ' + wNeed(s.l) + ' (+' + fmt(t) + ')'; ghost = s.e / wNeed(s.l) * 100; }
    else { txt = ex + ' > ' + s.e + ' / ' + wNeed(w); real = ex / wNeed(w) * 100; ghost = s.e / wNeed(w) * 100; }
    $('#ndWLv').textContent = un ? 'Lv. ' + w : 'Terkunci'; $('#ndWLvG').textContent = up ? ' > ' + s.l : '';
    $('#ndWXpT').textContent = txt; $('#ndWXpB').style.width = real + '%'; $('#ndWXpG').style.width = ghost + '%';
    $('#ndWpUp').textContent = !un ? 'Buka' : w >= W_MAX ? 'Maks' : 'Upgrade';
    $('#ndWItT').textContent = 'Talent Prism' + (t ? ' \u00b7 Nilai +' + fmt(t) : '') + (s.coin ? ' \u00b7 Coin ' + fmt(s.coin) : '') + (lost ? ' (kelebihan ' + fmt(lost) + ' hilang)' : '');
  }
  /* tombol buka Star: Star dibuka terpisah dari level (boleh meski level masih rendah), berurutan */
  /* Bonus stat Unique Weapon (naik tiap level). i = indeks stat di NIA_ST: 0 HP, 3 MATK, 4 MDEF, 6 Crit Rate. Nilai = base + (Lv-1) x g */
  var WP_BONUS = [ { i:3, base:10, g:2 }, { i:0, base:60, g:8 }, { i:4, base:5, g:.8 }, { i:6, base:.5, g:.1 } ];
  function wBonusOf(r){ var p = Char.prog(); if (!p.uniqueWeaponUnlocked || p.uniqueWeaponLevel < 1) return 0; return Math.round((r.base + (p.uniqueWeaponLevel - 1) * r.g) * 100) / 100; }
  function wBonus(i){ for (var k = 0; k < WP_BONUS.length; k++) if (WP_BONUS[k].i === i) return wBonusOf(WP_BONUS[k]); return 0; }
  function ndWBonusUI(){
    var un = Char.prog().uniqueWeaponUnlocked, u = CHDEF.nia.unit, sl = un ? wSim(ndWPendT()).l : 0, wl = Char.prog().uniqueWeaponLevel;
    $('#ndWst').innerHTML = '<div class="wsh">Bonus Stat</div>' + WP_BONUS.map(function(r){ return '<div class="wsr"><span>' + NIA_ST[r.i][0] + '</span><b>' + (un ? '+' + wBonusOf(r) + u[r.i] + (sl > wl ? '<span class="pvg"> &gt; +' + (Math.round((r.base + (sl - 1) * r.g) * 100) / 100) + u[r.i] + '</span>' : '') : '-') + '</b><small>+' + r.g + u[r.i] + ' / Lv</small></div>'; }).join('');
  }
  function ndStarBtn(){
    var p = Char.prog(), b = $('#ndStarBtn'), i = ndTalCur, n = p.uniqueWeaponStars, ts = $('#ndTs');
    ts.textContent = !p.uniqueWeaponUnlocked ? 'Terkunci \u00b7 buka Tidal Heart dulu' : i < n ? 'Terbuka \u00b7 batas Lv. ' + STAR_CAP[i] : 'Terkunci \u00b7 membuka batas Lv. ' + STAR_CAP[i];
    ts.className = 'sochip' + (p.uniqueWeaponUnlocked && i < n ? ' ok' : '');
    if (!p.uniqueWeaponUnlocked || i < n){ b.hidden = true; return; }
    b.hidden = false; b.disabled = i > n;
    b.textContent = i > n ? 'Buka Star ' + (n + 1) + ' dulu' : 'Buka Star ' + (i + 1) + ' \u00b7 ' + STAR_COST[i] + ' Insignia';
  }
  $('#stNo').addEventListener('click', function(){ $('#stOv').classList.remove('on'); });
  $('#stOv').addEventListener('click', function(e){ if (e.target === this) this.classList.remove('on'); });
  $('#ndStarBtn').addEventListener('click', function(){
    var p = Char.prog(), i = ndTalCur;
    if (i !== p.uniqueWeaponStars) return;
    openUp({ title:'Buka Star ' + (i + 1) + ': ' + NIA_TL[i].n, rows:[{ t:'x', label:'Talent Insignia', items:[['UNI_TALENT_UNLOCK', STAR_COST[i]]] }], coin:0, ok:'Buka', msg:'Star ' + (i + 1) + ' terbuka (batas Lv. ' + STAR_CAP[i] + ')', done:function(){ p.uniqueWeaponStars = i + 1; } });
  });
  function ndWItems(){
    var h = '';
    for (var g = 2; g <= 5; g++){
      var id = 'UNI_TALENT_0' + g, own = Inv.jml(id), n = ndWPend[g], it = IV_MAP[id];
      h += '<button class="ndi g' + g + (own - n <= 0 ? ' zero' : '') + (n ? ' sel' : '') + '" data-g="' + g + '" aria-label="' + esc(it.name) + '">' + ivIcon(it.ic) + '<small>+' + fmt(IV_V[g - 1]) + '</small><b class="ivq">' + fmt(own - n) + '</b>' + (n ? '<u class="ndn">+' + n + '</u><span class="ndm" data-m="1">-</span>' : '') + '</button>';
    }
    $('#ndWIt').innerHTML = h;
  }
  $('#ndWIt').addEventListener('click', function(e){
    var m = e.target.closest && e.target.closest('[data-m]'), b = e.target.closest && e.target.closest('button[data-g]'); if (!b) return;
    var g = Number(b.getAttribute('data-g')), p = Char.prog(), own = Inv.jml('UNI_TALENT_0' + g);
    if (m){ if (ndWPend[g] > 0) ndWPend[g]--; }
    else if (!p.uniqueWeaponUnlocked){ toast('Buka Tidal Heart dulu (butuh Talent Insignia)'); return; }
    else if (p.uniqueWeaponLevel >= wCap()){ toast(wCapMsg()); return; }
    else if (ndWPend[g] >= own){ toast('Item habis'); return; }
    else if (ndWPendT() >= wRem()){ toast('Sudah cukup untuk mencapai batas level'); return; }
    else ndWPend[g]++;
    ndRefresh();
  });
  $('#ndWItR').addEventListener('click', function(){ ndWPend = [0,0,0,0,0,0]; ndRefresh(); });
  function ndRefresh(){
    var p = Char.prog(), cap = upCap(), d = CHDEF.nia, mx = p.level >= cap, w = p.uniqueWeaponLevel;
    ndPrev(); ndItems();
    var pl = ndSimLv();
    $('#ndSt').innerHTML = NIA_ST.map(function(x, i){ var g = d.growth[i], v0 = ndStatLv(d, i, p.level), b = Math.round((wBonus(i) + eqcBonus(i) + (i === 3 ? talMatk(v0) : 0)) * 100) / 100, tot = Math.round((v0 + b) * 100) / 100, v1 = ndStatLv(d, i, pl), nx = Math.round((v1 + wBonus(i) + eqcBonus(i) + (i === 3 ? talMatk(v1) : 0)) * 100) / 100; return '<div><small>' + x[0] + '</small><b>' + tot + d.unit[i] + (nx !== tot ? '<span class="pvg"> &gt; ' + nx + d.unit[i] + '</span>' : '') + (b ? '<em>+' + b + d.unit[i] + '</em>' : '') + '</b></div>'; }).join('');
    Array.prototype.forEach.call($('#ndRcl').querySelectorAll('small'), function(e, i){ e.textContent = 'Lv ' + ndSkLv(i); });
    $('#ndPasLv').textContent = 'Lv ' + p.passiveLevel;
    if (ndSkCur >= 0){ $('#ndSkN').innerHTML = NIA_SK[ndSkCur].n + ' <span class="ndlvl">Lv ' + ndSkLv(ndSkCur) + '</span>'; $('#ndSkT').textContent = skTxt(ndSkCur, ndSkLv(ndSkCur)); }
    var un = p.uniqueWeaponUnlocked;
    $('#ndWl').innerHTML = un ? 'Lv. ' + w + '/' + W_MAX + '<div class="nd2b"><i style="width:' + w / W_MAX * 100 + '%"></i></div><small>' + (w >= wCap() ? (w >= W_MAX ? 'Level maksimum' : 'Batas Lv. ' + wCap() + ' - buka Star ' + (p.uniqueWeaponStars + 1)) : 'Progres: ' + wExp() + ' / ' + wNeed(w) + ' &middot; Coin ' + fmt(wCoin(w))) + '</small><small>Batas Lv. ' + wCap() + '</small>' : 'Belum terbuka<small>Butuh 1 Talent Insignia</small>';
    ndWPrev(); ndWItems(); ndStarBtn(); ndWBonusUI(); skRender(); eqcSlots();
    Array.prototype.forEach.call($('#ndNodes').children, function(b, j){ b.classList.toggle('lk', !(un && j < p.uniqueWeaponStars)); });
  }
  /* --- jendela upgrade --- */
  var UPS = null;
  function xrow(label, pre, code, r){ return { t:'x', label:label, items:r.map(function(z){ return [pre + '_' + code + '_0' + z[0], z[1]]; }) }; }
  function vrow(label, pre, code, need){ return { t:'v', label:label, pre:pre, code:code, unit:IV_V, min:need, max:need, autoT:need }; }
  function upChip(id, extra){ var it = IV_MAP[id]; return '<span class="upk g' + it.g + '" title="' + esc(it.name) + '">' + ivIcon(it.ic) + extra + '</span>'; }
  function upTot(i){ var r = UPS.cfg.rows[i], s = UPS.sel[i], t = 0; for (var g = 1; g <= 5; g++) t += s[g] * r.unit[g - 1]; return t; }
  function upOwn(r){ var o = [0]; for (var g = 1; g <= 5; g++) o.push(Inv.jml(r.pre + '_' + r.code + '_0' + g)); return o; }
  function upAuto(t, over, own, unit){
    var s = [0,0,0,0,0,0], rem = t, g;
    for (g = 1; g <= 5; g++){ var n = Math.min(own[g], Math.floor(rem / unit[g - 1])); s[g] = n; rem -= n * unit[g - 1]; }
    if (rem > 0 && over) for (g = 1; g <= 5; g++) if (own[g] > s[g]){ s[g]++; break; }
    return s;
  }
  function upOk(){
    var c = UPS.cfg, ok = DATA.credit >= c.coin;
    c.rows.forEach(function(r, i){ if (r.t === 'x') r.items.forEach(function(z){ if ((Inv.jml(z[0])) < z[1]) ok = false; }); else if (upTot(i) < r.min) ok = false; });
    return ok;
  }
  function upRender(){
    var c = UPS.cfg, h = '';
    c.rows.forEach(function(r, i){
      h += '<div class="upr"><b>' + esc(r.label) + '</b><div class="uprow">';
      if (r.t === 'x'){ r.items.forEach(function(z){ var hv = Inv.jml(z[0]); h += upChip(z[0], '<i class="' + (hv >= z[1] ? '' : 'no') + '">' + fmt(hv) + '/' + z[1] + '</i>'); }); h += '</div>'; }
      else {
        var tot = upTot(i);
        for (var g = 1; g <= 5; g++){ var id = r.pre + '_' + r.code + '_0' + g, a = ' data-r="' + i + '" data-g="' + g + '"'; h += '<div>' + upChip(id, '<i>x' + fmt(Inv.jml(id)) + '</i>') + '<div class="ups"><button data-a="m"' + a + '>-</button><b>' + UPS.sel[i][g] + '</b><button data-a="p"' + a + '>+</button></div></div>'; }
        h += '</div><div class="upn">' + (r.info ? r.info(tot) : 'Nilai ' + tot + ' / ' + r.min) + '<button class="ivb alt" data-a="auto" data-r="' + i + '">Otomatis</button>' + (r.mx ? '<button class="ivb alt" data-a="max" data-r="' + i + '">Maks</button>' : '') + '</div>';
        if (tot > r.max || (!r.mx && tot > r.min)) h += '<div class="upw">Kelebihan ' + fmt(tot - (r.mx ? r.max : r.min)) + (r.mx ? ' EXP hilang (batas level)' : ' tidak disimpan') + '</div>';
      }
      h += '</div>';
    });
    $('#upT').textContent = c.title; $('#upB').innerHTML = h;
    $('#upCoin').innerHTML = c.coin ? '<span class="' + (DATA.credit >= c.coin ? '' : 'no') + '">Coin ' + fmt(c.coin) + '</span> (dimiliki ' + fmt(DATA.credit) + ')' : 'Tanpa Coin';
    $('#upYes').textContent = c.ok; $('#upYes').disabled = !upOk();
  }
  function openUp(c){ UPS = { cfg:c, sel:c.rows.map(function(){ return [0,0,0,0,0,0]; }) }; upRender(); $('#upOv').classList.add('on'); }
  function upClose(){ $('#upOv').classList.remove('on'); UPS = null; }
  $('#upNo').addEventListener('click', upClose);
  $('#upOv').addEventListener('click', function(e){
    if (e.target === this){ upClose(); return; }
    var b = e.target.closest && e.target.closest('button[data-a]'); if (!b || !UPS) return;
    var a = b.getAttribute('data-a'), i = Number(b.getAttribute('data-r')), g = Number(b.getAttribute('data-g')), r = UPS.cfg.rows[i], s = UPS.sel[i];
    if (a === 'm'){ if (s[g] > 0) s[g]--; }
    else if (a === 'p'){ if (s[g] < (Inv.jml(r.pre + '_' + r.code + '_0' + g)) && upTot(i) < r.max) s[g]++; }
    else if (a === 'auto') UPS.sel[i] = upAuto(r.autoT, true, upOwn(r), r.unit);
    else if (a === 'max') UPS.sel[i] = upAuto(r.max, false, upOwn(r), r.unit);
    upRender();
  });
  $('#upYes').addEventListener('click', function(){
    if (!UPS || !upOk()) return;
    var c = UPS.cfg, tot = 0;
    c.rows.forEach(function(r, i){
      if (r.t === 'x') r.items.forEach(function(z){ Inv.kurangi(z[0], z[1]); });
      else { tot = upTot(i); for (var g = 1; g <= 5; g++) Inv.kurangi(r.pre + '_' + r.code + '_0' + g, UPS.sel[i][g]); }
    });
    DATA.credit -= c.coin; c.done(tot); saveGame(); updRes(); upClose(); ndRefresh(); toast(c.msg);
  });
  function upSkill(i){
    var p = Char.prog(), k = SK_KEY[i], C = i ? UPC.skill : UPC.ult, lv = p[k], pre = CHDEF.nia.aff;
    if (lv >= C.max){ toast('Level sudah maksimum'); return; }
    var r = C.rec[lv - 1];
    openUp({ title:NIA_SK[i].n + ': Lv ' + lv + ' > Lv ' + (lv + 1), rows:[xrow(i ? 'Skill Artifact' : 'Ultimate Artifact', pre, i ? 'SKART' : 'ULTART', r), xrow(i ? 'Skill Manual' : 'Ultimate Manual', pre, i ? 'SKMAN' : 'ULTMAN', r)], coin:C.coin[lv - 1], ok:'Upgrade', msg:NIA_SK[i].n + ' naik ke Lv ' + (lv + 1), done:function(){ p[k] = lv + 1; } });
  }
  $('#ndSkUp').addEventListener('click', function(){ if (ndSkCur < 0){ toast('Pilih skill dulu'); return; } upSkill(ndSkCur); });

  /* ===== TAB SKILL: 4 belah ketupat (Ultimate, Skill 1, Skill 2, Pasif) + panel upgrade; popup konfirmasi tetap dipakai ===== */
  var ndSkSel = 0, SK_TYPE = ['Ultimate', 'Skill 1', 'Skill 2', 'Pasif'];
  var NIA_PAS = { n:'Aqua Mark', t:'Pasif: Skill memberi +1 Aqua Mark (Ultimate +2) ke tiap musuh yang terkena, maks 5 Mark. Tiap Mark menambah 3% damage Nia ke musuh itu selama 5 detik. Basic Attack tidak memberi Mark.' };
  function skData(i){
    var p = Char.prog(), pre = CHDEF.nia.aff, lv, C, r, items = [], core = 0;
    if (i < 3){
      lv = ndSkLv(i); C = i ? UPC.skill : UPC.ult; r = C.rec[lv - 1];
      if (r) (i ? ['SKART', 'SKMAN'] : ['ULTART', 'ULTMAN']).forEach(function(c){ r.forEach(function(z){ items.push({ id:pre + '_' + c + '_0' + z[0], need:z[1], tag:/ART$/.test(c) ? 'Artifact' : 'Manual' }); }); });
    } else {
      lv = p.passiveLevel; C = UPC.pas; r = C.rec[lv - 1];
      if (r){ r.forEach(function(z){ items.push({ id:pre + '_PASART_0' + z[0], need:z[1], tag:'Artifact' }); }); core = C.core[lv - 1]; }
    }
    return { lv:lv, C:C, items:items, core:core, coin:lv >= C.max ? 0 : C.coin[lv - 1] };
  }
  function skBox(it, hv, need, tag){
    return '<span class="upk g' + it.g + '" data-n="' + esc(it.name) + '">' + ivIcon(it.ic) + '<em>' + tag + '</em><i class="' + (hv >= need ? '' : 'no') + '">' + fmt(hv) + '/' + fmt(need) + '</i></span>';
  }
  function skRender(){
    var i = ndSkSel | 0, d = skData(i), mx = d.lv >= d.C.max, pre = CHDEF.nia.aff, h = '';
    Array.prototype.forEach.call(document.querySelectorAll('#ndOv .skd button'), function(b, j){ b.classList.toggle('on', j === i); b.querySelector('small').textContent = 'Lv ' + skData(j).lv; });
    $('#skName').textContent = i < 3 ? NIA_SK[i].n : NIA_PAS.n;
    $('#skLv').textContent = 'Lv ' + d.lv + (mx ? ' (maks)' : '');
    $('#skType').textContent = SK_TYPE[i];
    $('#skDesc').innerHTML = i < 3 ? skTxt(i, d.lv, true) : paTxt(d.lv, true);
    $('#skStep').textContent = mx ? '' : 'Lv ' + d.lv + ' > Lv ' + (d.lv + 1);
    if (mx) h = '<div class="skmax">Level sudah maksimum</div>';
    else {
      d.items.forEach(function(z){ var it = IV_MAP[z.id]; if (it) h += skBox(it, Inv.jml(z.id), z.need, z.tag); });
      if (d.core){
        var own = 0, c1 = IV_MAP[pre + '_PASCORE_01'];
        for (var g = 1; g <= 5; g++) own += (Inv.jml(pre + '_PASCORE_0' + g)) * IV_V[g - 1];
        if (c1) h += skBox(c1, own, d.core, 'Core');
      }
    }
    $('#skG').innerHTML = h;
    $('#skCoin').innerHTML = mx ? '<span>Tanpa biaya</span>' : '<span class="' + (DATA.credit >= d.coin ? '' : 'no') + '">' + fmt(d.coin) + '</span><span>Dimiliki ' + fmt(DATA.credit) + '</span>';
    $('#skUp').disabled = mx; $('#skUp').textContent = mx ? 'Maks' : 'Upgrade';
  }
  Array.prototype.forEach.call(document.querySelectorAll('#ndOv .skd button'), function(b){ b.addEventListener('click', function(){ ndSkSel = Number(b.getAttribute('data-i')); skRender(); }); });
  $('#skG').addEventListener('click', function(e){ var t = e.target.closest && e.target.closest('[data-n]'); if (t) toast(t.getAttribute('data-n')); });
  $('#skUp').addEventListener('click', function(){ if (ndSkSel < 3) upSkill(ndSkSel); else $('#ndPasUp').click(); });
  $('#ndPasUp').addEventListener('click', function(){
    var p = Char.prog(), lv = p.passiveLevel, C = UPC.pas, pre = CHDEF.nia.aff;
    if (lv >= C.max){ toast('Level sudah maksimum'); return; }
    openUp({ title:'Aqua Mark: Lv ' + lv + ' > Lv ' + (lv + 1), rows:[xrow('Passive Artifact', pre, 'PASART', C.rec[lv - 1]), vrow('Passive Core', pre, 'PASCORE', C.core[lv - 1])], coin:C.coin[lv - 1], ok:'Upgrade', msg:'Passive naik ke Lv ' + (lv + 1), done:function(){ p.passiveLevel = lv + 1; } });
  });
  function wpClose(){ $('#wpOv').classList.remove('on'); ndWPend = [0,0,0,0,0,0]; ndRefresh(); }
  $('#ndWpUp').addEventListener('click', function(){
    var p = Char.prog(), w = p.uniqueWeaponLevel;
    if (!p.uniqueWeaponUnlocked){ openUp({ title:'Buka Unique Weapon: Tidal Heart', rows:[{ t:'x', label:'Talent Insignia', items:[['UNI_TALENT_UNLOCK', 1]] }], coin:0, ok:'Buka', msg:'Tidal Heart terbuka (Star 1)', done:function(){ p.uniqueWeaponUnlocked = true; p.uniqueWeaponLevel = 1; p.uniqueWeaponExp = 0; p.uniqueWeaponStars = 1; ndWPend = [0,0,0,0,0,0]; } }); return; }
    if (w >= wCap()){ toast(wCapMsg()); return; }
    ndWPend = [0,0,0,0,0,0]; ndRefresh(); $('#wpOv').classList.add('on');
  });
  $('#wpNo').addEventListener('click', wpClose);
  $('#wpOv').addEventListener('click', function(e){ if (e.target === this) wpClose(); });
  $('#wpOk').addEventListener('click', function(){
    var p = Char.prog(), w = p.uniqueWeaponLevel;
    if (w >= wCap()){ toast(wCapMsg()); return; }
    var t = ndWPendT(); if (!t){ toast('Pilih item dulu'); return; }
    var s = wSim(t), lost = Math.max(0, t - wRem());
    if (s.coin > DATA.credit){ toast('Coin tidak cukup (butuh ' + fmt(s.coin) + ')'); return; }
    function apply(){
      for (var g = 2; g <= 5; g++) Inv.kurangi('UNI_TALENT_0' + g, ndWPend[g]);
      DATA.credit -= s.coin; p.uniqueWeaponLevel = s.l; p.uniqueWeaponExp = s.e; ndWPend = [0,0,0,0,0,0];
      saveGame(); updRes(); $('#wpOv').classList.remove('on'); ndRefresh();
      toast(s.l > w ? 'Tidal Heart naik ke Lv ' + s.l + (s.l >= wCap() && wCap() < W_MAX ? ' (batas level, buka Star berikutnya)' : '') : 'Nilai Prism tersimpan');
    }
    if (lost) askConfirm({ title:'Kelebihan nilai', text:'Nilai Prism berlebih ' + fmt(lost) + ' akan hilang karena batas level. Lanjut?', ok:'Upgrade' }, apply); else apply();
  });
  $('#ndLvBtn').addEventListener('click', function(){
    var p = Char.prog(), t = ndPendT();
    if (ascOn()){
      var an = ascNeed(), at = ndAscT(), ac = ascCoin(), al = at - an;
      if (!at){ toast('Pilih Seal dulu'); return; }
      if (at < an){ toast('Nilai Seal belum cukup (butuh ' + fmt(an) + ')'); return; }
      if (ac > DATA.credit){ toast('Coin tidak cukup (butuh ' + fmt(ac) + ')'); return; }
      var doAsc = function(){ for (var q = 2; q <= 5; q++) Inv.kurangi('UNI_ASC_0' + q, ndAsc[q]); DATA.credit -= ac; p.ascensionStage++; ndAsc = [0,0,0,0,0,0]; saveGame(); updRes(); ndRefresh(); toast('Ascension berhasil! Batas level naik ke Lv. ' + upCap()); };
      if (al) askConfirm({ title:'Kelebihan nilai', text:'Nilai Seal berlebih ' + fmt(al) + ' akan hilang. Lanjut?', ok:'Ascension' }, doAsc); else doAsc();
      return;
    }
    if (p.level >= upCap()){ toast('Level sudah maksimum'); return; }
    if (!t){ toast('Pilih item dulu'); return; }
    var lost = Math.max(0, t - upRem());
    function apply(){ for (var g = 2; g <= 5; g++) Inv.kurangi('UNI_EXP_0' + g, ndPend[g]); ndPend = [0,0,0,0,0,0]; chExp(t); saveGame(); updRes(); ndRefresh(); toast('EXP bertambah'); }
    if (lost) askConfirm({ title:'Kelebihan EXP', text:'EXP berlebih ' + fmt(lost) + ' akan hilang karena batas level. Lanjut?', ok:'Upgrade' }, apply); else apply();
  });

  $('#ndBack').addEventListener('click', function(){ go(closeNia); });
  $('#ndHome').addEventListener('click', function(){ go(function(){ closeNia(); closePage(); }); });
  $('#ndGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });

  function closePage(){ closePop(); pg.classList.remove('on'); }
  $('#pBack').addEventListener('click', function(){ go(closePage); }); $('#pHome').addEventListener('click', function(){ go(closePage); });
  $('#pGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });
  Array.prototype.forEach.call(pg.querySelectorAll('[data-soon]'), function(b){ b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); }); });
  $('#bRecruit').addEventListener('click', function(){ go(function(){ openPage('chal'); }); });
  $('#bEvent').addEventListener('click', function(){ toast('Event segera hadir'); });
  $('#bNotice').addEventListener('click', function(){ toast('Notice segera hadir'); });
  $('#bBanner').addEventListener('click', function(){ toast('Banner segera hadir'); });
  $('#bBannerR').addEventListener('click', function(){ toast('Banner segera hadir'); });
  $('#bSocial').addEventListener('click', function(){ go(function(){ openPage('social'); }); });
  $('#bCraft').addEventListener('click', function(){ go(function(){ openPage('craft'); }); });
  document.querySelector('.nav[aria-label="Inventory"]').addEventListener('click', function(){ go(openInv); });
  $('#bEquip').addEventListener('click', function(){ go(openEq); });
  $('#bSkill').addEventListener('click', function(){ go(function(){ openPage('skill'); }); });
  $('#bTask').addEventListener('click', function(){ go(function(){ openPage('task'); }); });
  document.querySelector('.nav[aria-label="Char"]').addEventListener('click', function(){ go(function(){ openPage('char'); }); });
  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape' || !pg.classList.contains('on')) return;
    if ($('#pgOv').classList.contains('on')){ closePop(); return; }
    if (!(dMenu.classList.contains('open') || pMail.classList.contains('open'))) go(closePage);
  }, true);

  /* ---- reset progres ---- */
  $('#rReset').addEventListener('click', function(){
    askConfirm({ title:'Reset progres?', text:'Semua progres, task, dan pengaturan kembali ke awal. Tidak bisa dibatalkan.', ok:'Reset', danger:true }, function(){
      try { localStorage.removeItem('rpg_game'); } catch (e) {}
      location.reload();
    });
  });


  /* ===== INVENTORY: 3 tab, grid slot, detail item (kiri), jual (konfirmasi) ===== */
  var ivOv = $('#ivOv'), ivTab = 0, ivSel = [null, null, null, null], ivCb = null, ivT0 = 0;
  var IV_PRICE = {}; /* harga jual per ID item: belum ditentukan. Isi nanti, mis. IV_PRICE.WAT_SKART_01 = 50 */
  var IV_SVG = {
    art:   '<path d="M24 4l14 12-14 28L10 16z"/><path d="M10 16h28M24 4l-5 12 5 28 5-28z" fill="none"/>',
    man:   '<path d="M9 8h24a6 6 0 0 1 6 6v26H15a6 6 0 0 1-6-6z"/><path d="M15 40a6 6 0 0 1-6-6M16 15h16M16 22h12" fill="none"/>',
    core:  '<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="8" fill="none"/>',
    exp:   '<path d="M12 6h18l8 8v28H12z"/><path d="M30 6v8h8M17 22h16M17 29h16M17 36h10" fill="none"/>',
    seal:  '<circle cx="24" cy="24" r="18"/><path d="M24 12l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8.1L24 30.4l-7.2 3.9 1.4-8.1-5.9-5.7 8.1-1.1z" fill="none"/>',
    badge: '<path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z"/><path d="M24 14v18M16 22h16" fill="none"/>',
    prism: '<path d="M24 5L42 40H6z"/><path d="M24 5v35M15 22h18" fill="none"/>',
    eq:    '<path d="M39 5h4v4L26 26l-4-4z"/><path d="M17 25l6 6M14 28l-6 6 4 4 6-6" fill="none"/>'
  };
  function ivIcon(ic){ if (EQ_IMG[ic]) return '<img src="' + EQ_IMG[ic] + '" alt="" draggable="false">'; return '<svg viewBox="0 0 48 48" fill="var(--gc)" stroke="var(--gs)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">' + IV_SVG[ic] + '</svg>'; }
  function eqCur(){
    var inst = Eq.cari(ivSel[3]);
    if (!inst) return null; var d = EQ_DEF[inst.id];
    return { id:inst.uid, name:d.name, g:d.grade, ic:'eq_' + d.id, fam:d.category, desc:d.description, eq:true, inst:inst, def:d, use:false };
  }
  function eqListHtml(){
    var h = '', last = '';
    Eq.urut().forEach(function(e){
      var d = EQ_DEF[e.id];
      if (d.category !== last){ last = d.category; h += '<div class="ivgh">' + esc(last) + '</div>'; }
      h += '<button class="ivs g' + d.grade + (e.uid === ivSel[3] ? ' sel' : '') + '" data-id="' + esc(e.uid) + '" aria-label="' + esc(d.name) + ' Lv ' + e.lv + '">' + ivIcon('eq_' + d.id) + '<b class="ivq">Lv ' + e.lv + '</b></button>';
    });
    return h;
  }
  function eqDescHtml(it){
    var d = it.def;
    return '<span class="own">Lv ' + it.inst.lv + '/' + d.max_level + '</span><h4>' + esc(d.name) + '</h4><div class="chs"><span class="ch gr">Grade ' + d.grade + '</span><span class="ch">' + esc(d.category) + '</span><span class="ch">' + esc(d.subtype) + '</span></div><p>' + esc(d.description) + '</p>';
  }
  function ivCur(){ if (ivTab === 3) return eqCur(); var id = ivSel[ivTab]; for (var i = 0; i < IV_ITEMS.length; i++) if (IV_ITEMS[i].id === id) return IV_ITEMS[i]; return null; }
  function ivList(){
    var h = '', last = -1, L = $('#ivList'), st = L.scrollTop;
    if (ivTab === 3){ L.innerHTML = eqListHtml(); L.scrollTop = st; return; }
    IV_ITEMS.forEach(function(it){
      if (it.tab !== ivTab) return;
      if (it.fi !== last){ last = it.fi; h += '<div class="ivgh">' + esc(it.fam) + (it.aff ? '<small>' + esc(it.aff) + '</small>' : '') + '</div>'; }
      var q = Inv.jml(it.id);
      h += '<button class="ivs g' + it.g + (q ? '' : ' zero') + (it.id === ivSel[ivTab] ? ' sel' : '') + '" data-id="' + it.id + '" aria-label="' + esc(it.name) + '">' + ivIcon(it.ic) + '<b class="ivq">' + fmt(q) + '</b></button>';
    });
    L.innerHTML = h; L.scrollTop = st;
  }
  function ivSide(){
    var it = ivCur(), q = it ? (Inv.jml(it.id)) : 0;
    $('#ivBig').className = 'ivbig' + (it ? ' g' + it.g : ''); $('#ivBig').innerHTML = it ? ivIcon(it.ic) : '';
    $('#ivDesc').className = 'ivdesc' + (it ? ' g' + it.g : '');
    $('#ivDesc').innerHTML = it && it.eq ? eqDescHtml(it) : it ? '<span class="own">x' + fmt(q) + '</span><h4>' + esc(it.name) + '</h4><div class="chs"><span class="ch gr">' + (it.g ? 'Grade ' + it.g : 'Tanpa Grade') + '</span><span class="ch">' + esc(it.fam) + '</span><span class="ch">' + (it.aff ? esc(it.aff) : (it.eq ? 'Equipment' : 'Universal')) + '</span></div><p>' + esc(it.desc) + '</p>' : '';
    $('#ivUse').hidden = !(it && it.use);
  }
  function ivTabSet(t){
    ivTab = t;
    Array.prototype.forEach.call(ivOv.querySelectorAll('.ivt'), function(b){
      var i = Number(b.getAttribute('data-t')); b.classList.toggle('on', i === t);
      if (!b.firstChild) b.innerHTML = '<svg viewBox="0 0 48 48" fill="#5d86a6" stroke="#33557f" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">' + IV_SVG[IV_TABS[i].ic] + '</svg>';
    });
    $('#ivH').textContent = IV_TABS[t].n;
    if (t === 3){ var o = Eq.urut(); if (!o.some(function(e){ return e.uid === ivSel[3]; })) ivSel[3] = o.length ? o[0].uid : null; }
    if (!ivSel[t]) for (var i = 0; i < IV_ITEMS.length; i++) if (IV_ITEMS[i].tab === t){ ivSel[t] = IV_ITEMS[i].id; break; }
    $('#ivList').scrollTop = 0; ivList(); ivSide();
  }
  function openInv(){ closeAll(); closeShop(); closeChar(); closePage(); updRes(); ivTabSet(ivTab); ivOv.classList.add('on'); }
  function closeInv(){ ivCloseDlg(); ivOv.classList.remove('on'); }
  function ivAsk(t, x, ok, danger, cb, only){
    $('#ivDT').textContent = t; $('#ivDX').textContent = x;
    var y = $('#ivDYes'); y.textContent = ok; y.classList.toggle('danger', !!danger);
    $('#ivDNo').style.display = only ? 'none' : ''; ivCb = cb; ivT0 = Date.now(); $('#ivDlg').classList.add('on');
  }
  function ivCloseDlg(){ $('#ivDlg').classList.remove('on'); ivCb = null; }
  Array.prototype.forEach.call(ivOv.querySelectorAll('.ivt'), function(b){ b.addEventListener('click', function(){ ivTabSet(Number(b.getAttribute('data-t'))); }); });
  $('#ivList').addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.ivs'); if (!b) return;
    ivSel[ivTab] = b.getAttribute('data-id');
    Array.prototype.forEach.call($('#ivList').querySelectorAll('.ivs'), function(x){ x.classList.toggle('sel', x === b); });
    ivSide();
  });
  $('#ivHelp').addEventListener('click', function(){
    var it = ivCur(); if (!it) return;
    ivAsk('Cara mendapatkan', it.name + ': informasi cara mendapatkan item ini belum tersedia.', 'OK', false, null, true);
  });
  $('#ivDel').addEventListener('click', function(){
    var it = ivCur(); if (!it) return;
    if (!it.eq && !(Inv.jml(it.id) > 0)){ toast('Item ini belum dimiliki'); return; }
    var p = IV_PRICE[it.id];
    ivAsk('Jual item?', 'Jual 1x ' + it.name + '? Harga jual: ' + (p ? fmt(p) + ' Coin' : 'belum ditentukan') + '.', 'Jual', true, function(){
      if (!p){ toast('Harga jual belum ditentukan, penjualan belum aktif'); return; }
      Inv.kurangi(it.id, 1); DATA.credit += p; saveGame(); updRes(); ivList(); ivSide(); toast('Terjual +' + fmt(p) + ' Coin');
    });
  });
  $('#ivDNo').addEventListener('click', ivCloseDlg);
  $('#ivDYes').addEventListener('click', function(){ if (Date.now() - ivT0 < 250) return; var f = ivCb; ivCloseDlg(); if (f) f(); });
  $('#ivDlg').addEventListener('click', function(e){ if (e.target === this) ivCloseDlg(); });
  Array.prototype.forEach.call(ivOv.querySelectorAll('[data-soon]'), function(b){ b.addEventListener('click', function(){ toast(b.getAttribute('data-soon') + ' segera hadir'); }); });
  $('#ivBack').addEventListener('click', function(){ go(closeInv); });
  $('#ivHome').addEventListener('click', function(){ go(function(){ closeInv(); closePage(); }); });
  $('#ivGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });
  /* ===== EQUIPMENT: halaman sendiri (kiri: detail, tengah: preview, kanan: daftar per kategori) ===== */
  var eqOv = $('#eqOv'), eqCat = 'Weapon', eqSel = null, EQ_CATS = ['Weapon', 'Armor', 'Accessory'], EQ_TIC = ['eq', 'badge', 'seal'];
  var eqUse = [0, 0, 0, 0];
  function eqNeedAt(g, lv, mx){ var t = EQ_ENH.need[g]; return t && lv < mx ? t.exp[lv - 1] : 0; }
  function eqSim(it){
    var d = EQ_DEF[it.id], add = 0, lv = it.lv, xp = it.xp || 0;
    eqUse.forEach(function(n, i){ add += n * ENH_STONE_EXP[i]; }); xp += add; /* EXP boleh dicicil: sisa disimpan di equipment */
    while (lv < d.max_level && xp >= eqNeedAt(d.grade, lv, d.max_level)){ xp -= eqNeedAt(d.grade, lv, d.max_level); lv++; }
    if (lv >= d.max_level) xp = 0;
    return { add:add, lv:lv, xp:xp };
  }
  function eqPick(){ return Eq.cari(eqSel); }
  function eqRender(){
    var L = Eq.urut().filter(function(e){ return EQ_DEF[e.id].category === eqCat; });
    if (!L.some(function(e){ return e.uid === eqSel; })) eqSel = L.length ? L[0].uid : null;
    Array.prototype.forEach.call(eqOv.querySelectorAll('.eqt'), function(b){
      var i = EQ_CATS.indexOf(b.getAttribute('data-c')); b.classList.toggle('on', i === EQ_CATS.indexOf(eqCat));
      if (!b.firstChild) b.innerHTML = '<svg viewBox="0 0 48 48" fill="#5d86a6" stroke="#33557f" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">' + IV_SVG[EQ_TIC[i]] + '</svg>';
    });
    $('#eqH').textContent = eqCat;
    $('#eqList').innerHTML = L.map(function(e){
      var d = EQ_DEF[e.id];
      return '<button class="ivs eqs g' + d.grade + (e.uid === eqSel ? ' sel' : '') + '" data-id="' + esc(e.uid) + '" aria-label="' + esc(d.name) + ' Lv ' + e.lv + '">' + ivIcon('eq_' + d.id) + '<b class="eqg">G' + d.grade + '</b><b class="eqv">Lv ' + e.lv + '</b></button>';
    }).join('');
    var it = eqPick(), d = it ? EQ_DEF[it.id] : null;
    $('#eqN').textContent = d ? d.name : ''; $('#eqT').textContent = d ? d.name : '';
    var g = $('#eqG'); g.textContent = d ? 'Grade ' + d.grade : ''; g.className = 'ch g' + (d ? d.grade : 1);
    var sm = d ? eqSim(it) : null, nd = d ? eqNeedAt(d.grade, sm.lv, d.max_level) : 0;
    $('#eqLv').textContent = d ? 'Lv ' + it.lv + '/' + d.max_level + (sm.lv > it.lv ? ' → ' + sm.lv : '') : '';
    $('#eqPv').textContent = !d ? '' : !nd ? 'Level maksimum' : (sm.add ? '+' + sm.add + ' EXP · ' : 'EXP ') + sm.xp + '/' + nd;
    $('#eqMt').innerHTML = [0, 1, 2, 3].map(function(i){
      var own = Inv.jml('UNI_ENH_0' + (i + 1)), u = eqUse[i];
      return '<button class="eqsl g' + (i + 1) + (u ? ' on' : '') + '" data-i="' + i + '"' + (!d || (!u && (own <= 0 || !nd)) ? ' disabled' : '') + ' aria-label="Batu grade ' + (i + 1) + '">' + ivIcon('enh_' + (i + 1)) + '<span>' + u + '/' + own + '</span>' + (u ? '<b class="eqx" data-m="1">−</b>' : '') + '</button>';
    }).join('');
    $('#eqBar').style.width = d ? (nd ? sm.xp / nd * 100 : 100) + '%' : '0';
    $('#eqSt').innerHTML = d ? Object.keys(d.base_stats).slice(0, 4).map(function(k){ var cu = eqStat(it, k), nx = sm.lv > it.lv ? eqStat({ id:it.id, lv:sm.lv }, k) : cu; return '<div><span>' + esc(k.replace(/_/g, ' ')) + '</span><b>' + cu + (nx !== cu ? '<span class="pvg"> &gt; ' + nx + '</span>' : '') + '</b></div>'; }).join('') : '';
    $('#eqBig').className = 'ivbig eqbig' + (d ? ' g' + d.grade : ''); $('#eqBig').innerHTML = d ? ivIcon('eq_' + d.id) : '';
    $('#eqD').className = 'ivdesc eqd' + (d ? ' g' + d.grade : '');
    $('#eqD').innerHTML = d ? '<p>' + esc(d.description) + '</p>' + (d.lore ? '<em>' + esc(d.lore) + '</em>' : '') : '';
    var up = $('#eqUp'); up.disabled = !d || !sm.add; up.textContent = d && it.lv >= d.max_level ? 'MAX' : 'Upgrade';
  }
  var eqFromNia = false; /* true = halaman Equipment dibuka lewat shortcut dari panel equipment Nia; tombol kembali balik ke sana */
  function openEq(){ eqFromNia = false; closeAll(); closeShop(); closeChar(); closePage(); closeInv(); updRes(); eqUse = [0, 0, 0, 0]; eqRender(); $('#eqList').scrollTop = 0; eqOv.classList.add('on'); }
  function closeEq(){ eqOv.classList.remove('on'); }
  /* shortcut: ikon equipment di panel Nia -> halaman Equipment, equipment itu otomatis terpilih (Nia tetap terbuka di bawahnya) */
  function openEqFromNia(){
    var it = Eq.cari(eqcSel), d = it && EQ_DEF[it.id]; if (!d) return;
    eqFromNia = true; eqUse = [0, 0, 0, 0]; eqCat = d.category; eqSel = it.uid;
    updRes(); eqRender(); eqOv.classList.add('on');
    var l = $('#eqList'), b = l.querySelector('.eqs.sel');
    l.scrollTop = b ? Math.max(0, b.offsetTop - (l.clientHeight - b.offsetHeight) / 2) : 0;
  }
  /* kembali dari shortcut: tutup halaman Equipment saja, panel equipment Nia masih terbuka di slot & pilihan yang sama */
  function eqBackToNia(){
    eqFromNia = false; closeEq(); ndRefresh(); eqcSlots(); if (eqcSlot >= 0) eqcRender();
  }
  $('#eqcDet').addEventListener('click', function(e){ if (e.target.closest && e.target.closest('.eqcic')) go(openEqFromNia); });
  Array.prototype.forEach.call(eqOv.querySelectorAll('.eqt'), function(b){ b.addEventListener('click', function(){ eqUse = [0, 0, 0, 0]; eqCat = b.getAttribute('data-c'); $('#eqList').scrollTop = 0; eqRender(); }); });
  $('#eqList').addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('.eqs'); if (!b) return; eqSel = b.getAttribute('data-id'); eqUse = [0, 0, 0, 0]; eqRender(); });
  $('#eqMt').addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.eqsl'); if (!b) return;
    var i = Number(b.getAttribute('data-i')), it = eqPick(); if (!it) return;
    if (e.target.getAttribute && e.target.getAttribute('data-m')){ if (eqUse[i] > 0) eqUse[i]--; }
    else if (eqUse[i] < (Inv.jml('UNI_ENH_0' + (i + 1))) && eqSim(it).lv < EQ_DEF[it.id].max_level) eqUse[i]++;
    eqRender();
  });
  $('#eqUp').addEventListener('click', function(){
    var it = eqPick(); if (!it) return; var sm = eqSim(it);
    if (!sm.add){ toast('Pilih batu enhancement dulu'); return; }
    eqUse.forEach(function(n, i){ var k = 'UNI_ENH_0' + (i + 1); Inv.kurangiAman(k, n); });
    var up = sm.lv > it.lv; Eq.setLv(it, sm.lv, sm.xp); eqUse = [0, 0, 0, 0]; saveGame();
    toast(up ? 'Equipment naik ke Lv ' + it.lv : '+' + sm.add + ' EXP tersimpan');
    eqRender();
  });
  $('#qBack').addEventListener('click', function(){ go(eqFromNia ? eqBackToNia : closeEq); });
  $('#qHome').addEventListener('click', function(){ go(function(){ if (eqFromNia){ eqFromNia = false; closeNia(); } closeEq(); closePage(); }); });
  $('#qGear').addEventListener('click', function(){ closeAll(); showView('menu'); dMenu.classList.add('open'); scrim.classList.add('on', 'lite'); });

  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape' || !ivOv.classList.contains('on')) return;
    if ($('#ivDlg').classList.contains('on')){ ivCloseDlg(); return; }
    go(closeInv);
  }, true);

  setInterval(function(){ if (rollover()){ afterChange(); } }, 60000);
  updRes(); syncLobby();

})();
