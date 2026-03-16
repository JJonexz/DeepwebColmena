/* =====================================================
   LA COLMENA — threats.js
   Malware, trackers, whitehat hackers, fake downloads
   ===================================================== */

/* ─── NOTIFICATION SYSTEM ──────────────────────────── */
var notifStack = document.getElementById('notif-stack');
var notifQueue = [];

function showNotif(opts) {
  // opts: { type:'warn|danger|info|good', icon, title, msg, btn, btnFn, duration }
  var toast = document.createElement('div');
  toast.className = 'notif-toast ' + (opts.type || 'info');
  toast.innerHTML =
    '<span class="notif-icon">' + opts.icon + '</span>' +
    '<div class="notif-body">' +
      '<div class="notif-title">' + opts.title + '</div>' +
      '<div class="notif-msg">' + opts.msg + '</div>' +
      (opts.btn ? '<button class="notif-btn' + (opts.type === 'danger' ? ' red' : '') + '" id="notif-action-' + Date.now() + '">' + opts.btn + '</button>' : '') +
    '</div>' +
    '<button class="notif-close">✕</button>';
  notifStack.appendChild(toast);

  // Close button
  toast.querySelector('.notif-close').onclick = function() { removeToast(toast); };
  // Action button
  if (opts.btn && opts.btnFn) {
    var abtn = toast.querySelector('.notif-btn');
    if (abtn) abtn.onclick = function() { opts.btnFn(); removeToast(toast); };
  }
  // Auto-remove
  var dur = opts.duration || 7000;
  setTimeout(function() { removeToast(toast); }, dur);
}

function removeToast(toast) {
  toast.style.animation = 'toastOut .25s ease forwards';
  setTimeout(function() { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 260);
}

/* ─── WHITEHAT HACKERS ─────────────────────────────── */
var WHITEHAT_PROFILES = [
  { name: 'ph4ntom_guard', avatar: '🎩' },
  { name: 'gr33n_h00die',  avatar: '🧢' },
  { name: 'null_ptr_',     avatar: '🕶️' },
  { name: 'sec_monk_v2',   avatar: '🥷' },
  { name: 'void_watcher',  avatar: '👁️' },
];

var WHITEHAT_MESSAGES = {
  no_vpn: [
    '⚠ Oye, tu <b>VPN está desactivada</b>. Estás exponiendo tu IP real a este servicio.',
    'Activá el VPN antes de navegar por acá. Tu tráfico está siendo monitoreado.',
    'Sin VPN, los operadores del sitio pueden <b>ver tu IP, ISP y ubicación aproximada</b>.',
    'Tenés tu VPN apagada. ¿Sabés que cada request que hacés queda logueado?',
  ],
  on_market: [
    'Este mercado registra fingerprints del navegador. <b>Activá VPN + Tor</b>.',
    'Los mercados como este correlacionan compras con IPs. Protegete.',
  ],
  on_datavault: [
    'Los archivos en DataVault pueden tener <b>tracking beacons</b>. Cuidado al descargar.',
    'Antes de descargar algo de acá, activá el VPN. Los metadatos revelan mucho.',
  ],
  on_forum: [
    'Los foros correlacionan patrones de escritura con IPs. <b>Variá tu estilo</b>.',
  ],
  general: [
    'Recordá: ningún navegador es 100% anónimo sin VPN activa.',
    'La higiene de OPSEC incluye limpiar cookies y rotar identidades.',
    'Usá siempre PGP para comunicaciones sensibles en esta red.',
  ],
};

var whMessenger    = document.getElementById('whitehat-messenger');
var whMessagesDiv  = document.getElementById('wh-messages');
var whNameEl       = document.getElementById('wh-name');
var whitehatShown  = false;

function showWhitehat(context) {
  if (whitehatShown) return;
  var profile = WHITEHAT_PROFILES[Math.floor(Math.random() * WHITEHAT_PROFILES.length)];
  whNameEl.textContent = profile.name;
  document.querySelector('.wh-avatar').textContent = profile.avatar;

  var msgs = WHITEHAT_MESSAGES[context] || WHITEHAT_MESSAGES.no_vpn;
  var msg  = msgs[Math.floor(Math.random() * msgs.length)];
  var general = WHITEHAT_MESSAGES.general[Math.floor(Math.random() * WHITEHAT_MESSAGES.general.length)];

  whMessagesDiv.innerHTML = '';
  whMessenger.classList.remove('hidden');
  whitehatShown = true;

  // Type messages with delay
  setTimeout(function() {
    var d1 = document.createElement('div');
    d1.className = 'wh-msg'; d1.innerHTML = msg;
    whMessagesDiv.appendChild(d1);
    whMessagesDiv.scrollTop = 999;
  }, 300);
  setTimeout(function() {
    var d2 = document.createElement('div');
    d2.className = 'wh-msg'; d2.innerHTML = general;
    whMessagesDiv.appendChild(d2);
    whMessagesDiv.scrollTop = 999;
  }, 1800);

  // Auto-hide after 18s
  setTimeout(function() { hideWhitehat(); }, 18000);
}

function hideWhitehat() {
  whMessenger.classList.add('hidden');
  setTimeout(function() { whitehatShown = false; }, 3000);
}

document.getElementById('wh-close').onclick = hideWhitehat;
document.getElementById('wh-dismiss').onclick = hideWhitehat;
document.getElementById('wh-activate-vpn').onclick = function() {
  hideWhitehat();
  // Open settings to VPN tab
  if (cfgPanel) {
    cfgPanel.classList.add('open');
    cfgOpen = true;
    document.querySelectorAll('.cfg-tab').forEach(function(t) { t.classList.remove('on'); });
    document.querySelectorAll('.cfg-tab-content').forEach(function(c) { c.style.display = 'none'; });
    var vpnTab = document.querySelector('.cfg-tab[data-tab="vpn"]');
    if (vpnTab) vpnTab.classList.add('on');
    var vpnContent = document.getElementById('tab-vpn');
    if (vpnContent) vpnContent.style.display = 'block';
  }
};

/* ─── THREAT OVERLAY ───────────────────────────────── */
var malwareOvl  = document.getElementById('malware-overlay');
var threatBox   = document.getElementById('threat-box');
var threatShown = false;

// Threat types
var THREATS = {
  malware: {
    icon: '☠️',
    title: 'MALWARE DETECTADO',
    desc: 'Un script malicioso intentó ejecutarse en tu dispositivo. Sin VPN, el sitio pudo fingerprear tu navegador y inyectar código en la conexión.',
    logs: [
      '[WARN] Fingerprint del navegador capturado → 87af3c...',
      '[CRIT] Script exploit intentó ejecutar: payload_xss_v3.js',
      '[CRIT] Intentando acceso a: clipboard / geolocation / webcam',
      '[WARN] Cookie de tracking instalada: __utma_session_v2',
      '[CRIT] Conexión establecida con: c2.malicious-relay.onion',
      '[INFO] Datos del navegador enviados al servidor remoto.',
    ],
    primaryBtn:  '🛡 Activar VPN y Limpiar',
    secondaryBtn: 'Ignorar (peligroso)',
  },
  tracker: {
    icon: '👁️',
    title: 'ESTÁS SIENDO RASTREADO',
    istracker: true,
    desc: 'Tu dirección IP, proveedor de internet y ubicación aproximada fueron registrados por este servicio. Sin VPN, tu identidad puede ser correlacionada.',
    data: [
      { k: 'Tu IP real:', v: '201.213.xx.xx' },
      { k: 'ISP detectado:', v: 'Telecentro / Argentina' },
      { k: 'Ubicación aprox.:', v: 'Buenos Aires, AR' },
      { k: 'Fingerprint:', v: 'chrome_win11_1920x1080' },
      { k: 'Cookies:', v: '14 trackers activos' },
      { k: 'Tiempo expuesto:', v: '00:03:42' },
    ],
  },
  datatheft: {
    icon: '💀',
    title: 'ROBO DE DATOS DETECTADO',
    desc: 'Sin VPN, el sitio pudo leer metadatos de tu sesión. Se detectó un intento de exfiltración de datos hacia un servidor externo.',
    logs: [
      '[CRIT] Session token expuesto: eyJ0eXAiOiJKV1QiLC...',
      '[CRIT] LocalStorage leído: 12 entradas capturadas',
      '[WARN] WebRTC leak: IP real filtrada al sitio',
      '[CRIT] DNS leak: consultas enviadas a DNS del ISP',
      '[WARN] Intentando lectura de historial del navegador...',
      '[CRIT] Datos enviados a: data-harvest.onion:8443',
    ],
    primaryBtn:  '🛡 Activar VPN Ahora',
    secondaryBtn: 'Continuar sin protección',
  },
};

function showThreat(type) {
  if (threatShown || vpnConnected) return;
  threatShown = true;
  var t = THREATS[type] || THREATS.malware;

  if (t.istracker) {
    // Build tracker overlay
    threatBox.className = 'tracker-box';
    threatBox.innerHTML =
      '<div class="tracker-icon">' + t.icon + '</div>' +
      '<div class="tracker-title">' + t.title + '</div>' +
      '<div class="tracker-desc">' + t.desc + '</div>' +
      '<div class="tracker-data">' +
        t.data.map(function(d) {
          return '<div class="td-row"><span class="td-key">' + d.k + '</span><span class="td-val">' + d.v + '</span></div>';
        }).join('') +
      '</div>' +
      '<div class="malware-actions">' +
        '<button class="malware-btn primary" id="threat-primary">🛡 Activar VPN</button>' +
        '<button class="malware-btn ghost"   id="threat-secondary">Cerrar</button>' +
      '</div>';
  } else {
    // Build malware overlay
    threatBox.className = 'malware-box';
    var logLines = t.logs || [];
    threatBox.innerHTML =
      '<div class="malware-icon">' + t.icon + '</div>' +
      '<div class="malware-title">' + t.title + '</div>' +
      '<div class="malware-desc">' + t.desc + '</div>' +
      '<div class="malware-log" id="malware-log"></div>' +
      '<div class="malware-actions">' +
        '<button class="malware-btn primary" id="threat-primary">' + (t.primaryBtn || '🛡 Activar VPN') + '</button>' +
        '<button class="malware-btn ghost"   id="threat-secondary">' + (t.secondaryBtn || 'Ignorar') + '</button>' +
      '</div>';

    // Animate log lines
    var logEl = document.getElementById('malware-log');
    logLines.forEach(function(line, i) {
      setTimeout(function() {
        var d = document.createElement('div');
        d.className = 'log-line'; d.textContent = line;
        if (logEl) logEl.appendChild(d);
      }, i * 350);
    });
  }

  malwareOvl.classList.remove('hidden');

  document.getElementById('threat-primary').onclick = function() {
    closeThreat();
    // Open VPN settings
    if (cfgPanel) {
      cfgPanel.classList.add('open'); cfgOpen = true;
      document.querySelectorAll('.cfg-tab').forEach(function(t) { t.classList.remove('on'); });
      document.querySelectorAll('.cfg-tab-content').forEach(function(c) { c.style.display = 'none'; });
      var vpnTab = document.querySelector('.cfg-tab[data-tab="vpn"]');
      if (vpnTab) vpnTab.classList.add('on');
      var vpnContent = document.getElementById('tab-vpn');
      if (vpnContent) vpnContent.style.display = 'block';
    }
  };
  document.getElementById('threat-secondary').onclick = closeThreat;
}

function closeThreat() {
  malwareOvl.classList.add('hidden');
  setTimeout(function() { threatShown = false; }, 5000); // cooldown
}

/* ─── SITE THREAT TRIGGERS ─────────────────────────── */
// Called after a site loads — decides whether to trigger threats
function checkSiteThreats(url) {
  if (vpnConnected) return; // VPN on = no threats

  // Only trigger threats on REAL sites — not on surface/facade pages
  // minigameCleared is populated in browser.js after the user passes the minigame
  // If not cleared yet, user is still on the safe facade page → no threats
  if (typeof minigameCleared === 'undefined' || !minigameCleared.has(url)) return;

  var DANGEROUS_SITES = {
    'marketcore.onion':  { delay: 6000,  threat: 'tracker',   whitehat: 'on_market',   chance: 0.85 },
    'datavault.onion':   { delay: 4000,  threat: 'malware',   whitehat: 'on_datavault',chance: 0.9  },
    'cryptex.onion':     { delay: 8000,  threat: 'datatheft', whitehat: 'no_vpn',      chance: 0.8  },
    'cryptoforum.onion': { delay: 7000,  threat: null,         whitehat: 'on_forum',    chance: 0.7  },
    'ghostchat.onion':   { delay: 5000,  threat: 'tracker',   whitehat: 'no_vpn',      chance: 0.75 },
    'blackboard.onion':  { delay: 6000,  threat: 'datatheft', whitehat: 'no_vpn',      chance: 0.7  },
    'neonews.onion':     { delay: 10000, threat: null,         whitehat: 'no_vpn',      chance: 0.5  },
  };

  var cfg = DANGEROUS_SITES[url];
  if (!cfg) return;

  // Always show VPN warning notification immediately for dangerous sites
  setTimeout(function() {
    if (vpnConnected) return;
    showNotif({
      type: 'warn',
      icon: '⚠️',
      title: 'SIN PROTECCIÓN VPN',
      msg:  'Estás accediendo a <strong>' + url + '</strong> sin VPN activo. Tu IP real es visible.',
      btn:  'Activar VPN',
      btnFn: function() {
        cfgPanel.classList.add('open'); cfgOpen = true;
        document.querySelectorAll('.cfg-tab').forEach(function(t) { t.classList.remove('on'); });
        document.querySelectorAll('.cfg-tab-content').forEach(function(c) { c.style.display = 'none'; });
        var vt = document.querySelector('.cfg-tab[data-tab="vpn"]');
        if (vt) vt.classList.add('on');
        var vc = document.getElementById('tab-vpn');
        if (vc) vc.style.display = 'block';
      },
      duration: 9000,
    });
  }, 1200);

  // Whitehat appears
  setTimeout(function() {
    if (vpnConnected) return;
    if (Math.random() < cfg.chance) showWhitehat(cfg.whitehat);
  }, cfg.delay - 2000);

  // Main threat overlay
  if (cfg.threat) {
    setTimeout(function() {
      if (vpnConnected) return;
      if (Math.random() < cfg.chance) showThreat(cfg.threat);
    }, cfg.delay);
  }
}

/* ─── FAKE DOWNLOADS ───────────────────────────────── */
var dlBar    = document.getElementById('dl-bar');
var dlName   = document.getElementById('dl-name');
var dlPct    = document.getElementById('dl-pct');
var dlWidget = document.getElementById('fake-dl');
var dlTimer  = null;

var FAKE_FILES = [
  { name: 'rat_v4.2_FUD.exe',    content: 'ARCHIVO SIMULADO — EDUCATIVO\n\nEste archivo simula un Remote Access Trojan (RAT).\nEn un entorno real sería malware.\n\nProyecto: La Colmena — Simulador Dark Web\nAutor: Julian Alexis Rios\n\n[SIMULACIÓN INOFENSIVA]' },
  { name: 'keylogger_pro.exe',   content: 'ARCHIVO SIMULADO — EDUCATIVO\n\nEste archivo simula un keylogger.\nCaptura ficticia de teclas — INOFENSIVO.\n\nProyecto: La Colmena\n[SOLO CON FINES EDUCATIVOS]' },
  { name: 'DATOS_FILTRADOS.zip', content: 'ARCHIVO SIMULADO — EDUCATIVO\n\nEste .zip simula una filtración de datos.\nContenido: ficticias credenciales, emails, registros.\nNINGÚN DATO REAL INCLUIDO.\n\nProyecto: La Colmena — Julian Alexis Rios' },
  { name: 'exploit_kit.tar.gz',  content: 'ARCHIVO SIMULADO — EDUCATIVO\n\nEste archivo simula un exploit kit.\nVulnerabilidades: CVE-XXXX-XXXX (ficticio)\n\nProyecto: La Colmena\n[SIMULACIÓN INOFENSIVA]' },
  { name: 'credentials_dump.txt',content: 'ARCHIVO SIMULADO — EDUCATIVO\n\nCredenciales ficticias:\nuser@example.com:password123 (FALSO)\nadmin@test.com:abc123 (FALSO)\n\nNINGUN DATO REAL — Solo educativo\nProyecto: La Colmena — Julian Alexis Rios' },
];

window.fakeDownload = function(fileObj) {
  var file = fileObj || FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)];

  dlName.innerHTML = '<span>' + file.name + '</span>';
  dlBar.style.width = '0%';
  dlPct.textContent = '0%';
  dlWidget.classList.remove('hidden');

  var pct = 0;
  clearInterval(dlTimer);
  dlTimer = setInterval(function() {
    pct += Math.random() * 8 + 2;
    if (pct >= 100) {
      pct = 100;
      clearInterval(dlTimer);
      dlBar.style.width = '100%';
      dlPct.textContent = '100%';

      // Actually trigger real download (harmless .txt)
      var blob = new Blob([file.content], { type: 'text/plain' });
      var a    = document.createElement('a');
      a.href   = URL.createObjectURL(blob);
      a.download = file.name + '.txt'; // Always .txt to be safe
      a.click();
      URL.revokeObjectURL(a.href);

      // Show virus warning after download
      setTimeout(function() {
        dlWidget.classList.add('hidden');
        if (!vpnConnected) {
          showNotif({
            type: 'danger',
            icon: '☣️',
            title: '¡ARCHIVO SOSPECHOSO DESCARGADO!',
            msg:  '"' + file.name + '" fue descargado sin VPN activo. El servidor registró tu IP durante la descarga.',
            btn:  'Ver detalles',
            btnFn: function() { showThreat('malware'); },
            duration: 10000,
          });
        }
      }, 800);
    }
    dlBar.style.width = Math.min(pct, 100) + '%';
    dlPct.textContent = Math.floor(Math.min(pct, 100)) + '%';
  }, 80);
};

document.getElementById('dl-cancel').onclick = function() {
  clearInterval(dlTimer);
  dlWidget.classList.add('hidden');
};

/* ─── HOOK INTO NAVIGATE ───────────────────────────── */
// Wrap the existing navigate to trigger threat checks
var _origNavigateInner = navigate;
navigate = function(raw, fromHistory) {
  _origNavigateInner(raw, fromHistory);
  // After short delay (page load), check threats
  var clean = (raw||'').trim().toLowerCase().replace(/^https?:\/\//,'').split('?')[0];
  if (clean && clean !== '' && clean !== 'home') {
    setTimeout(function() { checkSiteThreats(clean); }, 500);
  }
};

/* ─── VPN CONNECTED NOTIFICATIONS ──────────────────── */
// When VPN connects, dismiss threats and show success
var _origVpnBtnClick = null;
window.addEventListener('load', function() {
  // Monitor vpnConnected changes via observer on the status label
  var vpnBtnEl = document.getElementById('vpn-btn');
  if (vpnBtnEl) {
    var originalClick = vpnBtnEl.onclick;
    vpnBtnEl.onclick = function() {
      if (originalClick) originalClick.call(this);
      setTimeout(function() {
        if (vpnConnected) {
          showNotif({
            type: 'good',
            icon: '🛡️',
            title: 'VPN ACTIVADO',
            msg:   'Tu conexión ahora está cifrada y tu IP real está enmascarada. Navegación segura.',
            duration: 5000,
          });
          malwareOvl.classList.add('hidden');
          hideWhitehat();
        } else {
          showNotif({
            type: 'warn',
            icon: '⚠️',
            title: 'VPN DESACTIVADO',
            msg:   'Tu IP real vuelve a ser visible. Evitá acceder a sitios sensibles sin protección.',
            duration: 5000,
          });
        }
      }, 2500);
    };
  }
});
