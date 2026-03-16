/* =====================================================
   LA COLMENA — Browser JS v4
   Comunicación via postMessage (funciona en file://)
   Flujo: Fachada → surfacePassed → Minijuego → TOR → Sitio real
   ===================================================== */

const ROUTES = {
  '':                  {file:'pages/home.html',       title:'Nueva Pestaña'},
  'home':              {file:'pages/home.html',       title:'Nueva Pestaña'},
  'marketcore.onion':  {file:'pages/marketcore.html', title:'MarketCore',   surface:'pages/surface/marketcore.html'},
  'cryptoforum.onion': {file:'pages/cryptoforum.html',title:'CryptoForum',  surface:'pages/surface/cryptoforum.html'},
  'shadowwiki.onion':  {file:'pages/shadowwiki.html', title:'ShadowWiki',   surface:'pages/surface/shadowwiki.html'},
  'mailnode.onion':    {file:'pages/mailnode.html',   title:'MailNode',     surface:'pages/surface/mailnode.html'},
  'datavault.onion':   {file:'pages/datavault.html',  title:'DataVault',    surface:'pages/surface/datavault.html'},
  'darksearch.onion':  {file:'pages/darksearch.html', title:'DarkSearch',   surface:'pages/surface/darksearch.html'},
  'neonews.onion':     {file:'pages/neonews.html',    title:'NeoNews',      surface:'pages/surface/neonews.html'},
  'ghostchat.onion':   {file:'pages/ghostchat.html',  title:'GhostChat',    surface:'pages/surface/ghostchat.html'},
  'cryptex.onion':     {file:'pages/cryptex.html',    title:'CrypteX',      surface:'pages/surface/cryptex.html'},
  'idforge.onion':     {file:'pages/idforge.html',    title:'ID Forge',     surface:'pages/surface/idforge.html'},
  'blackboard.onion':  {file:'pages/blackboard.html', title:'BlackBoard',   surface:'pages/surface/blackboard.html'},
  'phantomvpn.onion':  {file:'pages/phantomvpn.html', title:'PhantomVPN',   surface:'pages/surface/phantomvpn.html'},
};

const CIRCUITS=['DE → NL → SE','US → FR → JP','CH → SE → AU','UK → RU → BR','CA → NL → SG'];
const IPS=['89.247.xx.xx','185.220.xx.xx','176.10.xx.xx','51.15.xx.xx','45.33.xx.xx'];
const NODE_SETS=[['DE-01','NL-03','SE-02'],['US-05','FR-07','JP-01'],
                 ['CH-08','SE-11','AU-06'],['UK-02','RU-04','BR-09'],['CA-03','NL-01','SG-05']];

// hist[] moved to per-tab system
const surfaceCleared  = new Set();
const minigameCleared = new Set();

const frame    = document.getElementById('pageframe');
const addrBar  = document.getElementById('addr');
const tabLabel = document.getElementById('tab-label');
const prog     = document.getElementById('prog');
const torOvl   = document.getElementById('toroverlay');
const mgOvl    = document.getElementById('mgoverlay');
const mgContent= document.getElementById('mg-content');
const bkpanel  = document.getElementById('bkpanel');

/* ─── postMessage listener ───────────────────────── */
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.action) return;
  switch (e.data.action) {
    case 'navigate':
      if (e.data.url !== undefined) navigate(e.data.url);
      break;
    case 'surfacePassed':
      if (e.data.url) {
        surfaceCleared.add(e.data.url);
        navigate(e.data.url);
      }
      break;
    case 'fakeDownload':
      if (typeof fakeDownload !== 'undefined') fakeDownload(e.data.file || null);
      break;
  }
});

/* ─── Navigate ───────────────────────────────────── */
function navigate(raw, fromHistory) {
  const clean = (raw||'').trim().toLowerCase().replace(/^https?:\/\//,'');
  const url   = clean.split('?')[0];
  const query = clean.includes('?') ? clean.split('?')[1] : '';
  const route = ROUTES[url];

  // Tab system handles per-tab history
  updateNavBtns();
  addrBar.value = (url===''||url==='home') ? '' : (raw||'');

  if (!route) {
    doLoad('pages/error.html?url='+encodeURIComponent(raw||''), '404', false);
    return;
  }
  const isHome = (url===''||url==='home');
  if (isHome) { doLoad(route.file, route.title, false); return; }

  // STEP 1: show surface page (fake facade)
  if (!surfaceCleared.has(url)) {
    doLoad(route.surface, url+' — fachada', false);
    updateTabTitle(url);
    return;
  }

  // STEP 2: show minigame
  if (!minigameCleared.has(url)) {
    showMinigame(url, function() {
      minigameCleared.add(url);
      showTor(function() {
        doLoad(route.file + (query?'?'+query:''), route.title, true);
      });
    });
    return;
  }

  // STEP 3+: revisit — short TOR only
  showTor(function() {
    doLoad(route.file + (query?'?'+query:''), route.title, true);
  });
}

function doLoad(src, title, animate) {
  animProg(500);
  if (animate) { frame.style.opacity='0'; frame.style.transition='opacity .25s'; }
  frame.src = src;
  frame.onload = function() {
    if (animate) frame.style.opacity='1';
    if (title) updateTabTitle(title);
  };
}

function updateTabTitle(title) {
  // Update tab object title
  if (tabs && tabs[activeTab]) tabs[activeTab].title = title;
  // Re-render tabs to show new title
  if (typeof renderTabs === 'function') renderTabs();
  document.title = title + ' — La Colmena';
}

function animProg(ms) {
  prog.style.transition='none'; prog.style.width='0%';
  requestAnimationFrame(function(){
    prog.style.transition='width '+ms+'ms ease'; prog.style.width='100%';
    setTimeout(function(){ prog.style.transition='none'; prog.style.width='0%'; }, ms+80);
  });
}

function updateNavBtns() {
  document.getElementById('btn-back').disabled = histIdx<=0;
  document.getElementById('btn-fwd').disabled  = histIdx>=hist.length-1;
}

/* ─── TOR animation ──────────────────────────────── */
function showTor(cb) {
  var tms  = torOvl.querySelectorAll('.tm');
  var nids = ['tn-you','tn-r1','tn-r2','tn-r3','tn-dst'];
  var nodes = nids.map(function(id){ return document.getElementById(id); });
  tms.forEach(function(m){ m.classList.remove('show','ok','done'); });
  nodes.forEach(function(n){ if(n) n.classList.remove('lit'); });
  var ni = Math.floor(Math.random()*NODE_SETS.length);
  document.getElementById('tn-r1').textContent = NODE_SETS[ni][0];
  document.getElementById('tn-r2').textContent = NODE_SETS[ni][1];
  document.getElementById('tn-r3').textContent = NODE_SETS[ni][2];
  torOvl.classList.remove('hidden');
  [0,360,720,1080,1440,1800].forEach(function(d,i){
    setTimeout(function(){
      tms[i].classList.add('show');
      if(i < tms.length-1) tms[i].classList.add('ok');
      if(i === tms.length-1) tms[i].classList.add('done');
      if(nodes[i]) nodes[i].classList.add('lit');
    }, d);
  });
  setTimeout(function(){
    torOvl.classList.add('hidden');
    var ci = Math.floor(Math.random()*CIRCUITS.length);
    document.getElementById('ib-circuit').textContent = CIRCUITS[ci];
    document.getElementById('ib-ip').textContent = IPS[ci];
    if(cb) cb();
  }, 2400);
}

/* ═══════════════════════════════════════════════════
   MINIGAMES
   ═══════════════════════════════════════════════════ */
var MINIGAMES = [buildTerminalGame, buildCipherGame, buildPatternGame, buildHashGame, buildWireGame];
var mgTimer=null, mgTimeLeft=0, mgCurrentCb=null, mgAttempts=0;

function showMinigame(siteUrl, onSuccess) {
  mgCurrentCb = onSuccess;
  mgAttempts  = 0;
  document.getElementById('mg-site-label').textContent = siteUrl;
  var dots = document.getElementById('mg-dots');
  dots.innerHTML = '<div class="mg-dot filled"></div><div class="mg-dot"></div><div class="mg-dot"></div>';
  MINIGAMES[Math.floor(Math.random()*MINIGAMES.length)]();
  mgOvl.classList.remove('hidden');
  startMgTimer(35);
}

function startMgTimer(s) {
  clearInterval(mgTimer); mgTimeLeft=s;
  var el = document.getElementById('mg-time');
  if(el) el.textContent = s;
  mgTimer = setInterval(function(){
    mgTimeLeft--;
    var el2 = document.getElementById('mg-time');
    if(el2) el2.textContent = mgTimeLeft;
    if(mgTimeLeft <= 0){
      clearInterval(mgTimer);
      setMgMsg('⏱ TIEMPO AGOTADO — acceso denegado', true);
      setTimeout(function(){ mgOvl.classList.add('hidden'); }, 2000);
    }
  }, 1000);
}

function mgSuccess() {
  clearInterval(mgTimer);
  document.querySelectorAll('.mg-dot').forEach(function(d){ d.classList.add('filled'); });
  mgContent.innerHTML =
    '<div style="text-align:center;padding:28px 0">' +
    '<div style="font-size:48px;margin-bottom:14px">✅</div>' +
    '<div style="font-size:15px;color:var(--green);font-weight:700;letter-spacing:2px">ACCESO CONCEDIDO</div>' +
    '<div style="font-size:11px;color:var(--t3);margin-top:10px">Estableciendo conexión segura…</div>' +
    '</div>';
  setTimeout(function(){
    mgOvl.classList.add('hidden');
    if(mgCurrentCb) mgCurrentCb();
  }, 1300);
}

function mgFail(msg) {
  mgAttempts++;
  setMgMsg(msg || '✗ Incorrecto. Intenta de nuevo.', true);
  if(mgAttempts >= 3) {
    clearInterval(mgTimer);
    setTimeout(function(){
      mgContent.innerHTML =
        '<div style="text-align:center;padding:24px 0">' +
        '<div style="font-size:40px;margin-bottom:12px">🔒</div>' +
        '<div style="font-size:13px;color:var(--red);font-weight:700;letter-spacing:1px">ACCESO BLOQUEADO</div>' +
        '<div style="font-size:11px;color:var(--t3);margin-top:8px">Demasiados intentos fallidos.</div>' +
        '</div>';
      setTimeout(function(){ mgOvl.classList.add('hidden'); }, 2200);
    }, 600);
  }
}

function setMgMsg(txt, isErr) {
  var el = mgContent.querySelector('.mg-error');
  if(!el) return;
  el.style.color = isErr ? 'var(--red)' : 'var(--green)';
  el.textContent = txt;
  setTimeout(function(){ el.textContent=''; }, 2500);
}

function cancelMg() { clearInterval(mgTimer); mgOvl.classList.add('hidden'); }

/* GAME 1 – Terminal */
function buildTerminalGame(){
  var cmds=[
    'CONNECT --ANON --KEY=0xF3',
    'AUTH BYPASS --TOR --ENCRYPT',
    'TUNNEL OPEN --STEALTH --NO-LOG',
    'ROUTE --ONION --RELAY=3'
  ];
  var c = cmds[Math.floor(Math.random()*cmds.length)];
  mgContent.innerHTML =
    '<div class="mg-title">AUTENTICACIÓN TERMINAL</div>' +
    '<div class="mg-desc">El servicio requiere el comando exacto. Escríbelo tal como aparece (diferencia mayúsculas).</div>' +
    '<div style="background:var(--bg0);border:1px solid var(--bdr);padding:12px 16px;border-radius:4px;margin-bottom:14px;font-size:14px;color:var(--cyan);letter-spacing:1px;text-align:center;font-weight:700">'+c+'</div>' +
    '<div class="mg-terminal">' +
    '<div style="color:var(--green);font-size:11px;margin-bottom:6px">colmena@anon:~$</div>' +
    '<div style="display:flex;align-items:center;gap:6px"><span style="color:var(--green)">›</span>' +
    '<input class="mg-input" id="mgi" type="text" placeholder="escribe el comando…" spellcheck="false" autocomplete="off"></div></div>' +
    '<button class="mg-btn" id="mgs">EJECUTAR</button>' +
    '<div class="mg-error" id="mg-err"></div>' +
    '<span class="mg-skip" id="mgsk">↩ Cancelar</span>';
  setTimeout(function(){
    var inp = document.getElementById('mgi');
    var go  = function(){ inp.value.trim()===c ? mgSuccess() : (mgFail('✗ Comando incorrecto.'), inp.value='', inp.focus()); };
    document.getElementById('mgs').onclick = go;
    inp.onkeydown = function(e){ if(e.key==='Enter') go(); };
    inp.focus();
    document.getElementById('mgsk').onclick = cancelMg;
  }, 30);
}

/* GAME 2 – Cipher ROT-3 */
function buildCipherGame(){
  var words=['PHANTOM','COLMENA','DARKNODE','CIPHER','ONIONKEY','STEALTH','CRYPTON','VAULTKEY'];
  var word = words[Math.floor(Math.random()*words.length)];
  var enc  = word.split('').map(function(ch){
    var n=ch.charCodeAt(0);
    return (n>=65&&n<=90) ? String.fromCharCode(((n-65+3)%26)+65) : ch;
  }).join('');
  mgContent.innerHTML =
    '<div class="mg-title">DESCIFRADO ROT-3</div>' +
    '<div class="mg-desc">El descriptor está cifrado con ROT-3. Cada letra fue desplazada 3 posiciones. Escribe la palabra original.</div>' +
    '<div class="mg-cipher-display">'+enc+'</div>' +
    '<div style="font-size:10px;color:var(--t3);text-align:center;margin-bottom:14px;letter-spacing:.5px">A→D &nbsp; B→E &nbsp; C→F &nbsp; … &nbsp; X→A &nbsp; Y→B &nbsp; Z→C</div>' +
    '<input class="mg-text-input" id="mgi" type="text" placeholder="DESCIFRADO…" maxlength="12" spellcheck="false" autocomplete="off">' +
    '<button class="mg-btn" id="mgs" style="margin-top:10px">VERIFICAR</button>' +
    '<div class="mg-error" id="mg-err"></div>' +
    '<span class="mg-skip" id="mgsk">↩ Cancelar</span>';
  setTimeout(function(){
    var inp = document.getElementById('mgi');
    var go  = function(){ inp.value.trim().toUpperCase()===word ? mgSuccess() : (mgFail('✗ Incorrecto.'), inp.value='', inp.focus()); };
    document.getElementById('mgs').onclick = go;
    inp.onkeydown = function(e){ if(e.key==='Enter') go(); };
    inp.focus();
    document.getElementById('mgsk').onclick = cancelMg;
  }, 30);
}

/* GAME 3 – Pattern lock */
function buildPatternGame(){
  var pats=[[1,2,3,6,9],[1,5,9,4,7],[3,2,1,4,5],[7,4,1,2,3],[1,4,7,8,9],[3,6,9,8,7]];
  var pat  = pats[Math.floor(Math.random()*pats.length)];
  var sel  = [], locked = false;
  var arrows = ['↖','↑','↗','←','●','→','↙','↓','↘'];
  mgContent.innerHTML =
    '<div class="mg-title">PATRÓN DE SEGURIDAD</div>' +
    '<div class="mg-desc">Memoriza el patrón y replícalo en el mismo orden.</div>' +
    '<div id="mgps" style="text-align:center;font-size:12px;color:var(--cyan);letter-spacing:2px;margin-bottom:14px">Patrón: '+pat.join(' → ')+'</div>' +
    '<div class="mg-grid" id="mgg">'+arrows.map(function(a,i){ return '<div class="mg-node" data-n="'+(i+1)+'">'+a+'</div>'; }).join('')+'</div>' +
    '<div style="text-align:center;font-size:10px;color:var(--t3);margin-bottom:12px">Seleccionado: <span id="mgsel">—</span></div>' +
    '<button class="mg-btn" id="mgs" disabled>CONFIRMAR</button>' +
    '<div class="mg-error" id="mg-err"></div>' +
    '<span class="mg-skip" id="mgsk">↩ Cancelar</span>';
  setTimeout(function(){
    var nodes  = document.querySelectorAll('.mg-node');
    var selEl  = document.getElementById('mgsel');
    var btn    = document.getElementById('mgs');
    setTimeout(function(){ document.getElementById('mgps').textContent='Ahora replica el patrón:'; }, 2800);
    nodes.forEach(function(nd){
      nd.onclick = function(){
        if(locked) return;
        var n = parseInt(nd.dataset.n);
        if(sel.includes(n)) return;
        sel.push(n); nd.classList.add('sel');
        selEl.textContent = sel.join(' → ');
        if(sel.length >= pat.length) btn.disabled=false;
      };
    });
    btn.onclick = function(){
      locked=true;
      var ok = sel.length===pat.length && sel.every(function(v,i){ return v===pat[i]; });
      nodes.forEach(function(nd){ if(pat.includes(parseInt(nd.dataset.n))) nd.classList.add(ok?'ok':'err'); });
      if(ok){ setTimeout(mgSuccess,400); }
      else {
        mgFail('✗ Patrón incorrecto.');
        setTimeout(function(){
          locked=false; sel=[];
          nodes.forEach(function(nd){ nd.classList.remove('sel','err','ok'); });
          btn.disabled=true; selEl.textContent='—';
        }, 900);
      }
    };
    document.getElementById('mgsk').onclick = cancelMg;
  }, 30);
}

/* GAME 4 – Hash */
function buildHashGame(){
  var hx='0123456789abcdef';
  var rnd=function(n){ return Array.from({length:n},function(){ return hx[Math.floor(Math.random()*16)]; }).join(''); };
  var suf=rnd(8), ans=suf.slice(-4), full=rnd(48)+suf;
  mgContent.innerHTML =
    '<div class="mg-title">VERIFICACIÓN DE HASH</div>' +
    '<div class="mg-desc">Ingresa los <strong style="color:var(--gold)">últimos 4 caracteres</strong> del hash SHA-256 para verificar el descriptor.</div>' +
    '<div class="mg-hash-block">'+full.slice(0,16)+' '+full.slice(16,32)+'<br>'+full.slice(32,48)+' <span class="hl">'+suf+'</span></div>' +
    '<div style="font-size:10px;color:var(--t3);text-align:center;margin-bottom:12px">↑ últimos 4 caracteres (resaltados)</div>' +
    '<input class="mg-text-input" id="mgi" type="text" placeholder="????" maxlength="4" spellcheck="false" autocomplete="off" style="letter-spacing:8px;font-size:18px">' +
    '<button class="mg-btn" id="mgs" style="margin-top:10px">VERIFICAR HASH</button>' +
    '<div class="mg-error" id="mg-err"></div>' +
    '<span class="mg-skip" id="mgsk">↩ Cancelar</span>';
  setTimeout(function(){
    var inp = document.getElementById('mgi');
    var go  = function(){ inp.value.trim().toLowerCase()===ans ? mgSuccess() : (mgFail('✗ Hash inválido.'), inp.value='', inp.focus()); };
    document.getElementById('mgs').onclick = go;
    inp.onkeydown = function(e){ if(e.key==='Enter') go(); };
    inp.focus();
    document.getElementById('mgsk').onclick = cancelMg;
  }, 30);
}

/* GAME 5 – Wire match */
function buildWireGame(){
  var sets=[
    [{l:'ENTRADA',r:'INPUT'},{l:'CIFRADO',r:'CIPHER'},{l:'NODO',r:'NODE'}],
    [{l:'PUERTO 80',r:'HTTP'},{l:'PUERTO 443',r:'HTTPS'},{l:'PUERTO 9001',r:'TOR'}],
    [{l:'SHA-256',r:'HASH'},{l:'AES-256',r:'SIMÉTRICO'},{l:'RSA-4096',r:'ASIMÉTRICO'}],
    [{l:'ORIGEN',r:'SOURCE'},{l:'DESTINO',r:'DEST'},{l:'RELAY',r:'NODO MEDIO'}],
  ];
  var pairs = sets[Math.floor(Math.random()*sets.length)];
  var shuf  = pairs.slice().sort(function(){ return Math.random()-.5; });
  var lsel  = null, conns = {};
  mgContent.innerHTML =
    '<div class="mg-title">CONECTAR CABLES</div>' +
    '<div class="mg-desc">Conecta cada terminal izquierdo con su equivalente derecho. Clic izquierdo → clic derecho.</div>' +
    '<div class="mg-wires-wrap">' +
    '<div class="mg-wire-col">'+pairs.map(function(p,i){ return '<div class="mg-wire" data-s="l" data-i="'+i+'">'+p.l+'</div>'; }).join('')+'</div>' +
    '<div class="mg-wire-mid">'+pairs.map(function(){ return '<div class="mg-wire-conn"></div>'; }).join('')+'</div>' +
    '<div class="mg-wire-col">'+shuf.map(function(p,i){ return '<div class="mg-wire" data-s="r" data-i="'+i+'" data-v="'+p.r+'">'+p.r+'</div>'; }).join('')+'</div>' +
    '</div>' +
    '<button class="mg-btn" id="mgs" disabled>VERIFICAR</button>' +
    '<div class="mg-error" id="mg-err"></div>' +
    '<span class="mg-skip" id="mgsk">↩ Cancelar</span>';
  setTimeout(function(){
    var lw  = document.querySelectorAll('.mg-wire[data-s="l"]');
    var rw  = document.querySelectorAll('.mg-wire[data-s="r"]');
    var cd  = document.querySelectorAll('.mg-wire-conn');
    var btn = document.getElementById('mgs');
    lw.forEach(function(w){
      w.onclick = function(){
        lw.forEach(function(x){ x.classList.remove('wsel'); });
        w.classList.add('wsel'); lsel=parseInt(w.dataset.i);
      };
    });
    rw.forEach(function(w){
      w.onclick = function(){
        if(lsel===null) return;
        conns[lsel]=w.dataset.v; w.classList.add('wsel');
        if(cd[lsel]) cd[lsel].classList.add('active');
        lsel=null;
        if(Object.keys(conns).length >= pairs.length) btn.disabled=false;
      };
    });
    btn.onclick = function(){
      var ok=true;
      pairs.forEach(function(p,i){ var c=conns[i]===p.r; lw[i].classList.add(c?'wok':'wbad'); if(!c)ok=false; });
      if(ok){ setTimeout(mgSuccess,500); }
      else {
        mgFail('✗ Conexiones incorrectas.');
        setTimeout(function(){
          lw.forEach(function(w){ w.classList.remove('wsel','wok','wbad'); });
          rw.forEach(function(w){ w.classList.remove('wsel','wok','wbad'); });
          cd.forEach(function(c){ c.classList.remove('active'); });
          conns={}; lsel=null; btn.disabled=true;
        }, 1000);
      }
    };
    document.getElementById('mgsk').onclick = cancelMg;
  }, 30);
}

/* ─── UI Events ──────────────────────────────────── */
document.getElementById('btn-back').onclick   = function(){ if(histIdx>0){ histIdx--; navigate(hist[histIdx],true); } };
document.getElementById('btn-fwd').onclick    = function(){ if(histIdx<hist.length-1){ histIdx++; navigate(hist[histIdx],true); } };
document.getElementById('btn-reload').onclick = function(){ var c=hist[histIdx]; c?navigate(c,true):navigate('',true); };
document.getElementById('btn-home').onclick   = function(){ navigate(''); };

document.getElementById('gobtn').onclick = function(){ navigate(addrBar.value.trim()||''); };
addrBar.onkeydown = function(e){
  if(e.key==='Enter'){ navigate(addrBar.value.trim()||''); }
  if(e.key==='Escape'){ addrBar.blur(); }
};
addrBar.onfocus = function(){ addrBar.select(); };

document.getElementById('btn-bk').onclick    = function(){ bkpanel.classList.toggle('open'); };
document.getElementById('bk-close').onclick  = function(){ bkpanel.classList.remove('open'); };
document.querySelectorAll('.bk-item').forEach(function(it){
  it.onclick = function(e){ e.preventDefault(); bkpanel.classList.remove('open'); navigate(it.dataset.page); };
});
/* ═══════════════════════════════════════════════════
   MULTI-TAB SYSTEM — max 3 tabs
   ═══════════════════════════════════════════════════ */
var MAX_TABS = 3;
var tabs = [
  { id: 'tab-0', title: 'Nueva Pestaña', url: '', history: [''], histIdx: 0 }
];
var activeTab = 0;

function createTab(url) {
  if (tabs.length >= MAX_TABS) {
    showMaxTabsWarning();
    return;
  }
  var id  = 'tab-' + Date.now();
  var tab = { id: id, title: 'Nueva Pestaña', url: url || '', history: [url || ''], histIdx: 0 };
  tabs.push(tab);
  activeTab = tabs.length - 1;
  renderTabs();
  navigateInTab(activeTab, url || '');
}

function closeTab(idx) {
  if (tabs.length === 1) {
    // Last tab — just go home instead of closing
    navigateInTab(0, '');
    return;
  }
  tabs.splice(idx, 1);
  if (activeTab >= tabs.length) activeTab = tabs.length - 1;
  renderTabs();
  // Load current active tab content
  var t = tabs[activeTab];
  loadTabContent(t.history[t.histIdx], t.title, false);
  addrBar.value = t.url === '' ? '' : t.url;
  updateNavBtns();
}

function switchTab(idx) {
  if (idx === activeTab) return;
  activeTab = idx;
  renderTabs();
  var t = tabs[activeTab];
  loadTabContent(t.history[t.histIdx], t.title, false);
  addrBar.value = t.url === '' ? '' : t.url;
  updateNavBtns();
}

function renderTabs() {
  var tabbar = document.getElementById('tabs-container');
  if (!tabbar) return;
  tabbar.innerHTML = tabs.map(function(t, i) {
    return '<div class="tab' + (i === activeTab ? ' active' : '') + '" data-idx="' + i + '">' +
      '<span class="tab-icon">⬡</span>' +
      '<span class="tab-lbl">' + escapeHtml(t.title) + '</span>' +
      '<span class="tab-x" data-close="' + i + '">×</span>' +
      '</div>';
  }).join('');

  // Update new tab button appearance
  var newTabBtn = document.getElementById('newtab');
  if (newTabBtn) {
    newTabBtn.disabled = tabs.length >= MAX_TABS;
    newTabBtn.title    = tabs.length >= MAX_TABS ? 'Máximo 3 pestañas' : 'Nueva pestaña';
    newTabBtn.style.opacity = tabs.length >= MAX_TABS ? '0.3' : '1';
    newTabBtn.style.cursor  = tabs.length >= MAX_TABS ? 'not-allowed' : 'pointer';
  }

  // Bind events
  tabbar.querySelectorAll('.tab').forEach(function(tab) {
    var idx = parseInt(tab.dataset.idx);
    tab.addEventListener('click', function(e) {
      if (e.target.dataset.close !== undefined) return;
      switchTab(idx);
    });
  });
  tabbar.querySelectorAll('.tab-x').forEach(function(x) {
    x.addEventListener('click', function(e) {
      e.stopPropagation();
      closeTab(parseInt(x.dataset.close));
    });
  });
}

function escapeHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showMaxTabsWarning() {
  showNotif({
    type:  'warn',
    icon:  '🚫',
    title: 'LÍMITE DE PESTAÑAS',
    msg:   'La Colmena permite máximo <strong>' + MAX_TABS + ' pestañas</strong> simultáneas. Cerrá una para abrir otra.',
    duration: 5000
  });
  // Flash the tab bar
  var tabbar = document.getElementById('tabbar');
  if (tabbar) {
    tabbar.style.outline = '2px solid var(--red)';
    setTimeout(function(){ tabbar.style.outline = ''; }, 800);
  }
}

function loadTabContent(src, title, animate) {
  animProg(500);
  if (animate) { frame.style.opacity = '0'; frame.style.transition = 'opacity .25s'; }
  frame.src = src || 'pages/home.html';
  frame.onload = function() {
    if (animate) frame.style.opacity = '1';
    if (title) updateTabTitle(title);
  };
}

// Override navigate to work per-tab
var _baseNavigate = navigate;
navigate = function(raw, fromHistory) {
  // Update current tab's history
  var t = tabs[activeTab];
  if (!fromHistory && raw !== undefined) {
    t.history = t.history.slice(0, t.histIdx + 1);
    t.history.push(raw || '');
    t.histIdx = t.history.length - 1;
  }
  t.url = raw || '';
  _baseNavigate(raw, fromHistory);
};

// Override updateNavBtns to use per-tab history
var _baseUpdateNavBtns = updateNavBtns;
updateNavBtns = function() {
  var t = tabs[activeTab];
  document.getElementById('btn-back').disabled = t.histIdx <= 0;
  document.getElementById('btn-fwd').disabled  = t.histIdx >= t.history.length - 1;
};

// Override back/forward to use per-tab history
document.getElementById('btn-back').onclick = function() {
  var t = tabs[activeTab];
  if (t.histIdx > 0) { t.histIdx--; navigate(t.history[t.histIdx], true); }
};
document.getElementById('btn-fwd').onclick = function() {
  var t = tabs[activeTab];
  if (t.histIdx < t.history.length - 1) { t.histIdx++; navigate(t.history[t.histIdx], true); }
};

// New tab / close tab buttons
document.getElementById('newtab').onclick = function() { createTab(''); };

// Initial render
renderTabs();


setInterval(function(){
  var i=Math.floor(Math.random()*CIRCUITS.length);
  document.getElementById('ib-circuit').textContent=CIRCUITS[i];
  document.getElementById('ib-ip').textContent=IPS[i];
}, 45000);

/* ─── Boot ───────────────────────────────────────── */
updateNavBtns();
navigate('');


/* ═══════════════════════════════════════════════════
   SETTINGS PANEL
   ═══════════════════════════════════════════════════ */

var cfgPanel   = document.getElementById('cfg-panel');
var cfgOpen    = false;
var vpnConnected = false;
var vpnTimer   = null;
var vpnSeconds = 0;

/* ── VPN PERSISTENCE helpers ── */
function saveVpnState() {
  try {
    localStorage.setItem('vpn_connected', vpnConnected ? '1' : '0');
    localStorage.setItem('vpn_country',   vpnCountrySel ? vpnCountrySel.value : 'de');
    localStorage.setItem('vpn_seconds',   String(vpnSeconds));
  } catch(e) {}
}
function loadVpnState() {
  try { return localStorage.getItem('vpn_connected') === '1'; } catch(e) { return false; }
}
function loadVpnCountry() {
  try { return localStorage.getItem('vpn_country') || 'de'; } catch(e) { return 'de'; }
}
function loadVpnSeconds() {
  try { return parseInt(localStorage.getItem('vpn_seconds') || '0', 10); } catch(e) { return 0; }
}

// Open/close settings
document.getElementById('btn-cfg') && (document.getElementById('btn-cfg').onclick = function(){
  cfgOpen = !cfgOpen;
  cfgPanel.classList.toggle('open', cfgOpen);
  if(cfgOpen) renderHistoryTab();
});
document.getElementById('cfg-close').onclick = function(){
  cfgOpen = false; cfgPanel.classList.remove('open');
};

// ── Tab switching ──────────────────────────────────
document.querySelectorAll('.cfg-tab').forEach(function(tab){
  tab.onclick = function(){
    document.querySelectorAll('.cfg-tab').forEach(function(t){ t.classList.remove('on'); });
    document.querySelectorAll('.cfg-tab-content').forEach(function(c){ c.style.display='none'; });
    tab.classList.add('on');
    var target = document.getElementById('tab-'+tab.dataset.tab);
    if(target) { target.style.display='block'; }
    if(tab.dataset.tab === 'history') renderHistoryTab();
  };
});

// ── APPEARANCE ─────────────────────────────────────

// Dark/light mode
var darkToggle  = document.getElementById('toggle-dark');
var lightToggle = document.getElementById('toggle-light');

darkToggle.onchange = function(){
  if(this.checked) {
    document.body.classList.remove('light');
    lightToggle.checked = false;
    localStorage.setItem('theme','dark');
  }
};
lightToggle.onchange = function(){
  if(this.checked) {
    document.body.classList.add('light');
    darkToggle.checked = false;
    localStorage.setItem('theme','light');
  } else {
    document.body.classList.remove('light');
    darkToggle.checked = true;
  }
};

// Scanlines
document.getElementById('toggle-scanlines').onchange = function(){
  document.body.style.setProperty('--scanlines', this.checked ? '1' : '0');
  if(!this.checked){
    // Remove scanline pseudo via class
    document.body.classList.toggle('no-scanlines', !this.checked);
  } else {
    document.body.classList.remove('no-scanlines');
  }
};

// TOR animation toggle (stored as a flag)
var showTorAnim = true;
document.getElementById('toggle-tor-anim').onchange = function(){
  showTorAnim = this.checked;
};

// Minigames toggle
var showMinigames = true;
document.getElementById('toggle-minigames').onchange = function(){
  showMinigames = this.checked;
};

// Accent colors
var ACCENTS = {
  blue:   {blue:'#3d8bff', blue2:'#2a70e0', blueg:'rgba(61,139,255,.18)', cyan:'#22d4f5'},
  cyan:   {blue:'#22d4f5', blue2:'#0891b2', blueg:'rgba(34,212,245,.18)', cyan:'#3d8bff'},
  green:  {blue:'#22e08a', blue2:'#16a34a', blueg:'rgba(34,224,138,.18)', cyan:'#44ddcc'},
  purple: {blue:'#a855f7', blue2:'#9333ea', blueg:'rgba(168,85,247,.18)', cyan:'#c084fc'},
  orange: {blue:'#f97316', blue2:'#ea580c', blueg:'rgba(249,115,22,.18)',  cyan:'#fbbf24'},
  red:    {blue:'#f04060', blue2:'#dc2626', blueg:'rgba(240,64,96,.18)',   cyan:'#f87171'},
  gold:   {blue:'#f5c842', blue2:'#d97706', blueg:'rgba(245,200,66,.18)',  cyan:'#fde68a'},
};
document.querySelectorAll('.accent-swatch').forEach(function(sw){
  sw.onclick = function(){
    document.querySelectorAll('.accent-swatch').forEach(function(s){ s.classList.remove('on'); });
    sw.classList.add('on');
    var a = ACCENTS[sw.dataset.color];
    if(a){
      document.documentElement.style.setProperty('--blue',  a.blue);
      document.documentElement.style.setProperty('--blue2', a.blue2);
      document.documentElement.style.setProperty('--blueg', a.blueg);
      document.documentElement.style.setProperty('--cyan',  a.cyan);
      // Update tor badge and brand color
      document.getElementById('tor-badge').style.color = a.blue;
      document.getElementById('brand').style.color = a.blue;
    }
  };
});

// ── VPN SIMULATOR ──────────────────────────────────
var VPN_IPS = {
  de:['185.220.101.xx','194.165.xx.xx','89.238.xx.xx'],
  nl:['185.220.103.xx','31.172.xx.xx','176.10.xx.xx'],
  ch:['46.232.xx.xx','81.17.xx.xx','194.42.xx.xx'],
  se:['185.100.86.xx','213.80.xx.xx','46.21.xx.xx'],
  is:['194.150.xx.xx','82.221.xx.xx','109.156.xx.xx'],
  us:['104.245.xx.xx','23.129.xx.xx','199.195.xx.xx'],
  jp:['103.152.xx.xx','45.67.xx.xx','160.19.xx.xx'],
  br:['177.11.xx.xx','45.161.xx.xx','191.252.xx.xx'],
  sg:['103.117.xx.xx','43.229.xx.xx','128.199.xx.xx'],
  au:['203.161.xx.xx','43.240.xx.xx','144.48.xx.xx'],
};
var VPN_PINGS = {de:12,nl:18,ch:22,se:28,is:45,us:95,jp:170,br:210,sg:185,au:220};

var vpnBtn       = document.getElementById('vpn-btn');
var vpnIndicator = document.getElementById('vpn-indicator');
var vpnStatusLbl = document.getElementById('vpn-status-label');
var vpnIpDisplay = document.getElementById('vpn-ip-display');
var vpnStats     = document.getElementById('vpn-stats');
var vpnCountrySel= document.getElementById('vpn-country');

vpnBtn.onclick = function(){
  if(vpnConnected){
    // Disconnect
    clearInterval(vpnTimer);
    vpnConnected = false;
    vpnSeconds   = 0;
    saveVpnState();
    vpnIndicator.className = 'vpn-indicator';
    vpnIndicator.textContent = '🛡️';
    vpnStatusLbl.className = 'vpn-status-label';
    vpnStatusLbl.textContent = 'DESCONECTADO';
    vpnIpDisplay.innerHTML = 'IP real: <span>sin enmascarar</span>';
    vpnStats.style.display = 'none';
    vpnBtn.className = 'vpn-connect-btn';
    vpnBtn.textContent = 'CONECTAR';
    vpnCountrySel.disabled = false;
    // Update info bar
    document.getElementById('ib-ip').textContent = '—';
  } else {
    // Connecting state
    vpnBtn.className = 'vpn-connect-btn connecting';
    vpnBtn.textContent = 'CONECTANDO…';
    vpnCountrySel.disabled = true;
    vpnIndicator.textContent = '⏳';

    setTimeout(function(){
      // Connected
      vpnConnected = true;
      saveVpnState();
      var country  = vpnCountrySel.value;
      var ips      = VPN_IPS[country];
      var fakeIp   = ips[Math.floor(Math.random()*ips.length)];
      var ping     = VPN_PINGS[country] + Math.floor(Math.random()*10);
      var speed    = (100 - ping*0.3 + Math.random()*20).toFixed(0);

      vpnIndicator.className = 'vpn-indicator connected';
      vpnIndicator.textContent = '🔒';
      vpnStatusLbl.className = 'vpn-status-label connected';
      vpnStatusLbl.textContent = 'CONECTADO';
      vpnIpDisplay.innerHTML = 'IP enmascarada: <span>'+fakeIp+'</span>';
      vpnStats.style.display = 'grid';
      document.getElementById('vpn-ping').textContent  = ping;
      document.getElementById('vpn-speed').textContent = speed+' Mbps';

      vpnBtn.className = 'vpn-connect-btn connected';
      vpnBtn.textContent = 'DESCONECTAR';

      // Update info bar IP
      document.getElementById('ib-ip').textContent = fakeIp;

      // Start timer
      vpnSeconds = 0;
      vpnTimer = setInterval(function(){
        vpnSeconds++;
        var h = Math.floor(vpnSeconds/3600);
        var m = Math.floor((vpnSeconds%3600)/60);
        var s = vpnSeconds%60;
        var ts = (h>0?String(h).padStart(2,'0')+':':'') +
                 String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
        var el = document.getElementById('vpn-time');
        if(el) el.textContent = ts;
        if(vpnSeconds % 5 === 0) saveVpnState(); // save every 5s
      }, 1000);

    }, 2200);
  }
};

// ── HISTORY ────────────────────────────────────────
var historyLog = []; // {url, time, timestamp}

// Override navigate to also log to historyLog
var _origNavigate = navigate;
navigate = function(raw, fromHistory){
  if(raw && raw !== '' && raw !== 'home' && !fromHistory){
    historyLog.push({
      url: raw,
      time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'}),
      ts:   Date.now()
    });
    // Keep max 100 entries
    if(historyLog.length > 100) historyLog.shift();
  }
  _origNavigate(raw, fromHistory);
};

function renderHistoryTab(){
  var search  = (document.getElementById('hist-search')||{}).value || '';
  var list    = document.getElementById('hist-list');
  if(!list) return;

  var entries = historyLog.filter(function(h){
    return !search || h.url.toLowerCase().includes(search.toLowerCase());
  }).slice().reverse(); // newest first

  if(entries.length === 0){
    list.innerHTML = '<div class="history-empty">'+(search ? 'Sin resultados para "'+search+'"' : 'El historial aparecerá aquí a medida que navegues.')+'</div>';
    return;
  }

  list.innerHTML = entries.map(function(h, i){
    var icon = h.url.includes('.onion') ? '⬡' : '🌐';
    return '<div class="hist-item" data-url="'+h.url+'">' +
      '<span class="hist-icon">'+icon+'</span>' +
      '<span class="hist-url">'+h.url+'</span>' +
      '<span class="hist-time">'+h.time+'</span>' +
      '<button class="hist-del" data-idx="'+(historyLog.length-1-i)+'" title="Eliminar">✕</button>' +
      '</div>';
  }).join('');

  // Click to navigate
  list.querySelectorAll('.hist-item').forEach(function(item){
    item.onclick = function(e){
      if(e.target.classList.contains('hist-del')) return;
      var url = item.dataset.url;
      cfgPanel.classList.remove('open'); cfgOpen=false;
      navigate(url);
    };
  });

  // Delete individual entry
  list.querySelectorAll('.hist-del').forEach(function(btn){
    btn.onclick = function(e){
      e.stopPropagation();
      var idx = parseInt(btn.dataset.idx);
      historyLog.splice(idx, 1);
      renderHistoryTab();
    };
  });
}

// History search live filter
var histSearchEl = document.getElementById('hist-search');
if(histSearchEl) histSearchEl.oninput = renderHistoryTab;

// Clear all history
document.getElementById('hist-clear').onclick = function(){
  historyLog = [];
  renderHistoryTab();
};

// Restore theme from localStorage
(function(){
  var saved = localStorage.getItem('theme');
  if(saved === 'light'){
    document.body.classList.add('light');
    lightToggle.checked = true;
    darkToggle.checked  = false;
  }
})();

// Add no-scanlines CSS rule dynamically
var scanlinesStyle = document.createElement('style');
scanlinesStyle.textContent = 'body.no-scanlines::after { display: none; }';
document.head.appendChild(scanlinesStyle);


/* ── RESTORE VPN ON LOAD ───────────────────────────── */
(function restoreVPN(){
  if(!loadVpnState()) return; // was off when closed
  // Wait for DOM to be ready with VPN controls
  var attempts = 0;
  var tryRestore = setInterval(function(){
    attempts++;
    var btn = document.getElementById('vpn-btn');
    var sel = document.getElementById('vpn-country');
    var ind = document.getElementById('vpn-indicator');
    var lbl = document.getElementById('vpn-status-label');
    var ipd = document.getElementById('vpn-ip-display');
    var sts = document.getElementById('vpn-stats');
    if(!btn || !sel || attempts > 30){ clearInterval(tryRestore); return; }
    clearInterval(tryRestore);

    // Restore saved country
    var savedCountry = loadVpnCountry();
    sel.value = savedCountry;
    vpnCountrySel = sel;

    // Simulate already-connected state (no animation needed)
    vpnConnected = true;
    vpnSeconds   = loadVpnSeconds();
    var country  = savedCountry;
    var ips      = VPN_IPS[country] || VPN_IPS['de'];
    var fakeIp   = ips[Math.floor(Math.random()*ips.length)];
    var ping     = VPN_PINGS[country] ? VPN_PINGS[country] + Math.floor(Math.random()*8) : 30;
    var speed    = (100 - ping*0.3 + Math.random()*20).toFixed(0);

    ind.className   = 'vpn-indicator connected';
    ind.textContent = '🔒';
    lbl.className   = 'vpn-status-label connected';
    lbl.textContent = 'CONECTADO — restaurado';
    ipd.innerHTML   = 'IP enmascarada: <span>' + fakeIp + '</span>';
    if(sts) sts.style.display = 'grid';

    var pingEl  = document.getElementById('vpn-ping');
    var speedEl = document.getElementById('vpn-speed');
    var timeEl  = document.getElementById('vpn-time');
    if(pingEl)  pingEl.textContent  = ping;
    if(speedEl) speedEl.textContent = speed + ' Mbps';

    btn.className   = 'vpn-connect-btn connected';
    btn.textContent = 'DESCONECTAR';
    sel.disabled    = true;
    document.getElementById('ib-ip').textContent = fakeIp;

    // Resume timer from saved seconds
    vpnTimer = setInterval(function(){
      vpnSeconds++;
      var h=Math.floor(vpnSeconds/3600), m=Math.floor((vpnSeconds%3600)/60), s=vpnSeconds%60;
      var ts=(h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
      var te=document.getElementById('vpn-time');
      if(te) te.textContent=ts;
      if(vpnSeconds % 5 === 0) saveVpnState();
    }, 1000);

    // Show a toast letting the user know VPN was restored
    setTimeout(function(){
      showNotif({
        type:'good', icon:'🛡️',
        title:'VPN RESTAURADO',
        msg:'La sesión VPN anterior fue restaurada automáticamente.',
        duration:4500
      });
    }, 1200);
  }, 100);
})();

/* Save on tab close / navigation */
window.addEventListener('beforeunload', saveVpnState);
