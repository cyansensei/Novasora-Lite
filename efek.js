
(function(){
  var cv=document.getElementById('tapfx'),cx=cv.getContext('2d');
  var W=0,H=0,DPR=1;
  function size(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth||document.documentElement.clientWidth;H=innerHeight||document.documentElement.clientHeight;
    // ukuran CSS = persis innerWidth x innerHeight (bukan 100vw/100vh yang bisa lebih tinggi dari layar di HP), skala X & Y dihitung terpisah agar lingkaran tetap bulat
    cv.style.width=W+'px';cv.style.height=H+'px';cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));cx.setTransform(cv.width/W,0,0,cv.height/H,0,0)}
  size();addEventListener('resize',size);
  // cegah zoom tak sengaja akibat tap cepat / cubit di browser mobile
  ['gesturestart','gesturechange','gestureend','dblclick'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
  addEventListener('load',function(){window.dispatchEvent(new Event('resize'))});
  var C1='#19b8e8',LIFE=.55,rnd=function(a,b){return a+Math.random()*(b-a)};
  var shards=[],TL=[],byId={},running=false,lastShard=0,last=0;

  // ===== Sprite animasi klik (dari video referensi, latar dihapus): 30 frame @30fps, 6x5, 192px =====
  var SPR_SRC="img/sprite.webp",SPR=288,SPR_SZ=56,SPR_FPS=48,sprReady=false,spr=new Image(),sil=null;
  spr.onload=function(){
    try{ // siluet cyan tipis di bawah sprite supaya bagian putih tetap terbaca di latar terang
      sil=document.createElement('canvas');sil.width=spr.width;sil.height=spr.height;var sc=sil.getContext('2d');
      sc.drawImage(spr,0,0);sc.globalCompositeOperation='source-in';sc.fillStyle='#19b8e8';sc.fillRect(0,0,sil.width,sil.height);
    }catch(e){sil=null}
    sprReady=true;
  };
  spr.src=SPR_SRC;
  function drawSpr(T){ // 30 fps -> dihaluskan dengan campuran antar-frame agar mulus di layar 60/120 Hz
    var ff=Math.min(29,T.t*SPR_FPS),f0=Math.floor(ff),fr=ff-f0,h=SPR_SZ/2;
    cx.save();cx.translate(T.x,T.y);cx.rotate(T.rot);cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
    for(var k=0;k<2;k++){
      var f=Math.min(29,f0+k),al=k?fr:1;if(al<=0)continue;
      var sx=(f%6)*SPR,sy=Math.floor(f/6)*SPR;
      if(sil){cx.globalAlpha=.5*al;cx.drawImage(sil,sx,sy,SPR,SPR,-h*1.05,-h*1.05,SPR_SZ*1.05,SPR_SZ*1.05)}
      cx.globalAlpha=al;cx.drawImage(spr,sx,sy,SPR,SPR,-h,-h,SPR_SZ,SPR_SZ);
    }
    cx.restore();
  }
  var taps=[],TRI=[ // segitiga yang menempel di cincin: sudut(derajat), ukuran, arah (1=keluar)
    [292,3.4,1],[318,3.8,1],[65,3.4,1],[196,3,-1],[206,2.2,-1]];
  function burst(x,y){
    taps.push({x:x,y:y,t:0,rot:rnd(-25,25)*Math.PI/180});
    start();
  }
  var D=Math.PI/180,R0=19,ease=function(u){u=Math.max(0,Math.min(1,u));return 1-(1-u)*(1-u)*(1-u)};
  function ringR(f){return f<=6?2+(R0-2)*(1-Math.pow(1-f/6,2)):R0+15*ease((f-6)/17)}
  function arcRibbon(r,a0,a1,w,al,col){ // pita melengkung, meruncing di kedua ujung
    var n=Math.max(8,Math.ceil((a1-a0)/4)),i,pts=[];
    for(i=0;i<=n;i++){var u=i/n,a=(a0+(a1-a0)*u)*D,k=Math.min(1,u/.14,(1-u)/.14);k=k*k*(3-2*k);pts.push([Math.cos(a),Math.sin(a),k])}
    cx.globalAlpha=al;cx.fillStyle=col;cx.beginPath();
    for(i=0;i<=n;i++){var q=pts[i];cx[i?'lineTo':'moveTo'](tx+q[0]*(r+w*q[2]/2),ty+q[1]*(r+w*q[2]/2))}
    for(i=n;i>=0;i--){var q2=pts[i];cx.lineTo(tx+q2[0]*(r-w*q2[2]/2),ty+q2[1]*(r-w*q2[2]/2))}
    cx.closePath();cx.fill();
  }
  var tx=0,ty=0;
  function drawTap(T){
    var f=T.t*30,x=T.x,y=T.y;tx=x;ty=y;
    // 1) cakram cyan yang cepat membesar lalu lenyap
    if(f>0&&f<7.6){
      var r=ringR(Math.min(f,6)),m=Math.min(1,f/6),da=Math.min(1,(7.6-f)/1.4);
      cx.globalAlpha=.62*da;cx.fillStyle='rgb('+Math.round(122-59*m)+','+Math.round(219-76*m)+','+Math.round(232-24*m)+')';
      cx.beginPath();cx.arc(x,y,r,0,6.2832);cx.fill();
    }
    // 2) cincin: lingkaran penuh -> busur yang menyusut -> pecah dan hilang
    var r2=ringR(f),s0,e0,al=1;
    if(f<3)al=f/3;
    if(f<=6){s0=0;e0=360}
    else if(f<7.2){s0=150*ease((f-6)/1.2);e0=360}
    else if(f<15){var u=(f-7.2)/7.8;s0=150-25*u;e0=360-15*u}
    else if(f<=21){var u2=(f-15)/6;s0=125-5*u2;e0=345-63*u2}
    else s0=null;
    var rot=T.rot/D;
    function halo(a0,a1,fade){
      arcRibbon(r2,a0+rot,a1+rot,4.6,.12*fade,'#2cc4f0');
      arcRibbon(r2,a0+rot,a1+rot,2.9,.30*fade,'#5fd4fa');
      arcRibbon(r2,a0+rot,a1+rot,1.7,.95*fade,'#f6fdff');
    }
    if(f>0&&s0!==null){halo(s0,e0,al);
      if(f>6.5&&f<21){var f2=Math.min(1,(f-6.5)/3)*al,hi=Math.min(1,(21-f)/4);arcRibbon(r2+3.4,rot+250,rot+e0+5,1.1,.75*f2*hi,'#e4f8ff')}} // untai tipis kedua
    else if(f>=21&&f<28){var u3=(f-21)/6,fd=Math.max(0,1-Math.pow(u3,1.4));
      if(fd>0){halo(180+12*u3,282-35*u3,fd);halo(120+25*u3,180-12*u3,fd)}}
    // 3) segitiga yang menumpang di cincin
    for(var i=0;i<TRI.length;i++){
      var tr=TRI[i],st=2+i*.3,life=21+(i%2);
      if(f<st||f>life+1.5)continue;
      var a=(tr[0]*1+rot)*D,rr=r2+(tr[2]>0?2.5:1.5),sz=tr[1]*Math.min(1,(f-st)/1.5)*(f>life-3?Math.max(0,(life+1.5-f)/4.5):1);
      var px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
      cx.save();cx.translate(px,py);cx.rotate(a+(tr[2]>0?1.5708:0));cx.globalAlpha=Math.min(1,(life+1.5-f)/3);
      var gt=cx.createLinearGradient(0,-sz,0,sz*.8);gt.addColorStop(0,'#ffffff');gt.addColorStop(1,'rgba(70,205,245,.9)');
      shape(0,sz);cx.lineJoin='round';cx.lineWidth=.7;cx.strokeStyle='rgba(44,196,240,.5)';cx.fillStyle=gt;cx.fill();cx.stroke();cx.restore();
    }
    // 4) satu segitiga kecil terlepas dan melayang menjauh + serpihan titik
    if(f>5&&f<17){var uu=(f-5)/12,a4=(70+T.rot/D)*D,d4=r2+3+10*ease(uu),s4=2.4*(1-uu*.5);
      cx.save();cx.translate(x+Math.cos(a4)*d4,y+Math.sin(a4)*d4);cx.rotate(3.14159);cx.globalAlpha=(1-uu)*.9;cx.fillStyle='#7fdcfb';shape(0,s4);cx.fill();cx.restore();
      for(var k=0;k<3;k++){var a5=(30+k*125+T.rot/D)*D,d5=r2+4+7*ease(uu+k*.05);cx.globalAlpha=(1-uu)*.7;cx.fillStyle='#8be3ff';cx.fillRect(x+Math.cos(a5)*d5-.6,y+Math.sin(a5)*d5-.6,1.2,1.2)}}
    cx.globalAlpha=1;
  }
  function fleck(x,y,ux,uy){ // partikel tipis di sepanjang ekor
    var side=Math.random()<.5?-1:1,sp=rnd(10,26);
    shards.push({x:x+rnd(-2,2),y:y+rnd(-2,2),vx:-uy*side*sp-ux*8,vy:ux*side*sp-uy*8,rot:rnd(0,6.28),vr:rnd(-3,3),
      s:rnd(2.1,3.6),k:0,tiny:1,t:0,life:rnd(.35,.55),c:C1});
  }
  function shape(k,s){
    cx.beginPath();
    if(k===0){cx.moveTo(0,-s);cx.lineTo(s*.9,s*.7);cx.lineTo(-s*.9,s*.7);cx.closePath()}
    else if(k===1){cx.moveTo(0,-s*1.3);cx.lineTo(s*.7,0);cx.lineTo(0,s*1.3);cx.lineTo(-s*.7,0);cx.closePath()}
    else{cx.rect(-s*.6,-s*.6,s*1.2,s*1.2)}
  }
  function start(){if(!running){running=true;requestAnimationFrame(function(t){last=t;loop(t)})}}

  function loop(now){
    var dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;
    cx.clearRect(0,0,W,H);
    var i,p;
    for(i=0;i<taps.length;i++){taps[i].t+=dt;if(taps[i].t<.62){if(sprReady)drawSpr(taps[i]);else drawTap(taps[i])}}
    taps=taps.filter(function(q){return q.t<.62});
    for(i=0;i<shards.length;i++){p=shards[i];p.t+=dt;var v=p.t/p.life;if(v>=1)continue;
      var f=Math.pow(.05,dt);p.vx*=f;p.vy*=f;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
      var sz=p.s*(1-v*.35),al2=1-v;
      cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);
      var gt=cx.createLinearGradient(0,-sz,0,sz*.8);gt.addColorStop(0,'#ffffff');gt.addColorStop(1,'rgba(60,200,245,.9)');
      shape(0,sz);cx.lineJoin='round';cx.lineWidth=.8;cx.strokeStyle='rgba(44,196,240,.55)';
      cx.globalAlpha=al2*.95;cx.fillStyle=gt;cx.fill();cx.stroke();
      cx.restore();
    }
    shards=shards.filter(function(q){return q.t<q.life});
    // ekor: satu pita meruncing per jari
    var anyTrail=false;
    for(var ti=TL.length-1;ti>=0;ti--){
      var T=TL[ti],trail=T.pts;
      for(i=0;i<trail.length;i++)trail[i].t+=dt;
      T.pts=trail=trail.filter(function(q){return q.t<LIFE});
      if(!trail.length&&!T.active){TL.splice(ti,1);if(byId[T.id]===T)delete byId[T.id];continue}
      anyTrail=true;
      var n=trail.length;
      if(n>1){
        var nx=[],ny=[],wt=[];
        for(i=0;i<n;i++){var p0=trail[Math.max(i-3,0)],p1=trail[Math.min(i+3,n-1)],dx=p1.x-p0.x,dy=p1.y-p0.y,l=Math.hypot(dx,dy)||1;
          nx.push(-dy/l);ny.push(dx/l);var k=1-trail[i].t/LIFE;wt.push(k*k*(3-2*k)*Math.min(1,(n-1-i)/6+.25))}
        var P=[[5.8,.08,'#2cc4f0'],[3.7,.17,'#4fd2fa'],[2.3,.65,'#7fdcfb'],[1.2,.95,'#f6fdff']];
        for(var q=0;q<4;q++){
          var W2=P[q][0]/2;cx.globalAlpha=P[q][1];cx.fillStyle=P[q][2];cx.beginPath();
          for(i=0;i<n;i++){var w=W2*wt[i];cx[i?'lineTo':'moveTo'](trail[i].x+nx[i]*w,trail[i].y+ny[i]*w)}
          for(i=n-1;i>=0;i--){var w3=W2*wt[i];cx.lineTo(trail[i].x-nx[i]*w3,trail[i].y-ny[i]*w3)}
          cx.closePath();cx.fill();
        }
      }
    }
    cx.globalAlpha=1;
    if(taps.length||shards.length||anyTrail)requestAnimationFrame(loop);else{running=false;cx.clearRect(0,0,W,H)}
  }

  // ---------- input multi-jari: setiap pointer punya ekor sendiri ----------
  function getT(id){var T=byId[id];if(!T){T=byId[id]={id:id,pts:[],lx:0,ly:0,has:false,active:false};TL.push(T)}return T}
  var pinching=false;
  function move(T,x,y){
    if(!T.has){T.lx=x;T.ly=y;T.has=true}
    var dx=x-T.lx,dy=y-T.ly,d=Math.hypot(dx,dy);
    if(d<1.5)return;
    if(d>240){T.lx=x;T.ly=y;T.pts.length=0;return}
    var n=Math.ceil(d/5);for(var i=1;i<=n;i++)T.pts.push({x:T.lx+dx*i/n,y:T.ly+dy*i/n,t:0});
    T.lx=x;T.ly=y;
    var now=performance.now();if(now-lastShard>60){lastShard=now;fleck(x,y,dx/d,dy/d)}
    start();
  }
  function onMove(e){
    var T=getT(e.pointerId);
    if(e.pointerType==='touch'){
      if(touches[e.pointerId]){touches[e.pointerId].x=e.clientX;touches[e.pointerId].y=e.clientY}
      if(pinching){T.pts.length=0;T.lx=e.clientX;T.ly=e.clientY;pinch(e);return}
      if(!T.active)return;
    }
    var list=e.getCoalescedEvents?e.getCoalescedEvents():null;
    if(list&&list.length){for(var i=0;i<list.length;i++)move(T,list[i].clientX,list[i].clientY)}else move(T,e.clientX,e.clientY);
  }
  // ---------- zoom 2 jari (cubit) + geser; ctrl+scroll di desktop ----------
  /* ZOOM 2 JARI = KHUSUS MODE SKETSA (HTML). Matikan di game sungguhan dengan salah satu cara:
     - set  window.IN_GAME = true  sebelum skrip ini, atau
     - buka halaman dengan  ?game=1
     - atau ubah DEV_ZOOM di bawah menjadi false */
  var DEV_ZOOM=true,ZOOM_ON=DEV_ZOOM&&window.IN_GAME!==true&&!/[?&]game=1/.test(location.search);
  var touches={},P0=null,ZMIN=1,ZMAX=3.5;
  function clampZ(){
    var Z=window.__Z;Z.z=Math.max(ZMIN,Math.min(ZMAX,Z.z));
    var mx=(Z.z-1)*W/2,my=(Z.z-1)*H/2;Z.px=Math.max(-mx,Math.min(mx,Z.px));Z.py=Math.max(-my,Math.min(my,Z.py));
  }
  function twoTouch(){var k=Object.keys(touches);if(k.length<2)return null;var a=touches[k[0]],b=touches[k[1]];
    return{d:Math.hypot(a.x-b.x,a.y-b.y)||1,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}
  function cX(){var f=window.__fitInfo;return f?f.cx:W/2}function cY(){var f=window.__fitInfo;return f?f.cy:H/2}
  function pinchStart(){var t=twoTouch(),Z=window.__Z;if(!ZOOM_ON||!t)return;pinching=true;
    P0={d:t.d,z:Z.z,qx:(t.mx-cX()-Z.px)/Z.z,qy:(t.my-cY()-Z.py)/Z.z}}
  function pinch(){var t=twoTouch(),Z=window.__Z;if(!t||!P0)return;
    Z.z=P0.z*t.d/P0.d;Z.z=Math.max(ZMIN*.9,Math.min(ZMAX*1.1,Z.z));
    Z.px=t.mx-cX()-Z.z*P0.qx;Z.py=t.my-cY()-Z.z*P0.qy;
    var z=Z.z;Z.z=Math.max(ZMIN,Math.min(ZMAX,z));clampZ();window.__layout()}
  function pinchEnd(){pinching=false;P0=null;var Z=window.__Z;if(Z.z<1.03){Z.z=1;Z.px=0;Z.py=0}clampZ();window.__layout()}

  addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    var T=getT(e.pointerId);T.active=true;T.lx=e.clientX;T.ly=e.clientY;T.has=true;T.pts.length=0;
    if(e.pointerType==='touch'){touches[e.pointerId]={x:e.clientX,y:e.clientY};if(ZOOM_ON&&Object.keys(touches).length>=2&&!pinching)pinchStart()}
    burst(e.clientX,e.clientY);
  },true);
  addEventListener('pointermove',onMove,true);
  function up(e){
    var T=byId[e.pointerId];if(T)T.active=false;
    if(touches[e.pointerId]){delete touches[e.pointerId];if(pinching&&Object.keys(touches).length<2)pinchEnd()}
    if(e.pointerType==='mouse'&&T){T.active=true} // mouse tetap menggambar ekor saat hover
  }
  addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
  addEventListener('blur',function(){touches={};if(pinching)pinchEnd();TL.forEach(function(t){t.active=false})});
  addEventListener('wheel',function(e){
    if(!ZOOM_ON||!e.ctrlKey)return;e.preventDefault();
    var Z=window.__Z,z0=Z.z,z1=Math.max(ZMIN,Math.min(ZMAX,z0*Math.exp(-e.deltaY*.01))),k=z1/z0;
    Z.px=e.clientX-cX()-k*(e.clientX-cX()-Z.px);Z.py=e.clientY-cY()-k*(e.clientY-cY()-Z.py);Z.z=z1;
    if(z1<1.03){Z.z=1;Z.px=0;Z.py=0}clampZ();window.__layout();
  },{passive:false});
})();
