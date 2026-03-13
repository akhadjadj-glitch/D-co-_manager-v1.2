// ============================================
// ui.js — All rendering functions
// ============================================

import { state, RUB, STAT, STATD, TPROJ, TDEP, gs, gsd, gr, gt, gl, getRentItems, getAlerts, search, getDecorPortfolioGroups } from './store.js';
import { fd, fm, money, escHtml } from './utils.js';
import { HAS_FIREBASE } from './firebase.js';

// ── SVG Icon system ──
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  chevDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  chevUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  chevLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18l-2 13H5L3 3z"/><path d="M3 3l-1.5 9h21L21 3"/><path d="M7.5 12v9"/><path d="M16.5 12v9"/><path d="M4.5 21h15"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  duplicate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};

export function icon(name, cls = '') {
  return `<span class="ico ${cls}">${ICONS[name] || ''}</span>`;
}

// ── Login Screen ──
export function rLogin() {
  return `
  <div class="login-screen">
    <div class="login-glow"></div>
    <div class="login-content">
      <div class="login-brand">
        <div class="login-logo">${icon('film')}</div>
        <h1 class="login-title">Décor Pro</h1>
        <p class="login-sub">Gestion de décors collaborative${HAS_FIREBASE ? '' : ' · mode local'}</p>
      </div>
      <div class="login-box">
        <div class="login-tabs">
          <button class="login-tab ${state.LTAB === 'join' ? 'on' : ''}" onclick="setLTab('join')">Rejoindre</button>
          <button class="login-tab ${state.LTAB === 'create' ? 'on' : ''}" onclick="setLTab('create')">Créer</button>
        </div>
        ${state.LTAB === 'join' ? `
          <p class="login-hint">Entrez le code projet partagé par votre équipe</p>
          <div class="fld"><input id="join-code" class="code-input" placeholder="ABC123" maxlength="6" autocapitalize="characters"></div>
          <button class="btn primary" onclick="joinProject()">Rejoindre le projet</button>
        ` : `
          <p class="login-hint">${HAS_FIREBASE ? 'Créez un nouveau projet et partagez le code' : "Démarrez l'application en local sur cet appareil"}</p>
          <button class="btn primary" onclick="createProject()">${HAS_FIREBASE ? 'Créer un projet' : 'Ouvrir le mode local'}</button>
          <div class="login-info">${HAS_FIREBASE ? "Un code unique sera généré. Partagez-le avec vos collaborateurs." : "Vos données seront conservées dans le navigateur."}</div>
        `}
      </div>
    </div>
  </div>`;
}

// ── Header ──
export function rHeader() {
  const syncClass = HAS_FIREBASE ? (state.SYNCING ? 'syncing' : (state.ONLINE ? 'online' : 'offline')) : 'offline';
  const syncText = HAS_FIREBASE ? (state.SYNCING ? 'Sync...' : (state.ONLINE ? 'Connecté' : 'Hors-ligne')) : 'Local';

  let h = `<header class="hdr">
    <div class="hdr-top">
      <div class="logo">${icon('film')}<span>Décor Pro</span></div>
      <div class="hdr-right">
        <div class="sync-badge ${syncClass}"><span class="sync-dot"></span>${syncText}</div>
        <button class="icon-btn" onclick="menu(true)">${icon('menu')}</button>
      </div>
    </div>
    <div class="search-bar">
      ${icon('search', 'search-icon')}
      <input placeholder="Rechercher…" value="${escHtml(state.GSQ)}" oninput="setGSQ(this.value)" onfocus="go('search')">
    </div>
  </header>`;

  if (state.V !== 'home' && state.V !== 'search') h += rBread();
  return h;
}

// ── Breadcrumb ──
function rBread() {
  let h = '<nav class="bread">';
  h += `<span onclick="go('home')">${icon('home')}</span><i>›</i>`;
  if (state.P) h += `<span onclick="go('proj','${state.P.id}')" ${state.V === 'proj' ? 'class="current"' : ''}>${escHtml(state.P.nom)}</span>`;
  if (state.DC) h += `<i>›</i><span onclick="go('dec','${state.DC.id}')" ${state.V === 'dec' ? 'class="current"' : ''}>${escHtml(state.DC.nom)}</span>`;
  if (state.EL) h += `<i>›</i><span class="current">${escHtml(state.EL.nom)}</span>`;
  if (state.V === 'lou' || state.V === 'loud') h += '<span class="current">Loueurs</span>';
  if (state.V === 'rent') h += '<span class="current">Locations</span>';
  if (state.V === 'dep') h += '<span class="current">Dépenses</span>';
  if (state.V === 'acc') h += '<span class="current">Accessoires</span>';
  h += '</nav>';
  return h;
}

// ── Navbar ──
export function rNavbar() {
  const items = [
    { v: 'home', ico: 'home', label: 'Accueil' },
    { v: 'acc',  ico: 'box',  label: 'Accessoires' },
    { v: 'rent', ico: 'box',  label: 'Locations' },
    { v: 'lou',  ico: 'store', label: 'Loueurs' },
  ];
  let h = '<nav class="navbar">';
  for (const it of items) {
    const active = (state.V === it.v || (it.v === 'lou' && state.V === 'loud')) ? ' active' : '';
    h += `<button class="nav-item${active}" onclick="go('${it.v}')">${icon(it.ico, 'nav-icon')}<span class="nav-label">${it.label}</span></button>`;
  }
  h += '</nav>';
  return h;
}

// ── Home ──
export function rHome() {
  const D = state.D;
  let np = D.projets.length, nd = 0, ne = 0, td = 0;
  for (const p of D.projets) { nd += p.decors ? p.decors.length : 0; if (p.decors) for (const d of p.decors) ne += d.elements ? d.elements.length : 0; }
  for (const dep of D.depenses) td += parseFloat(dep.montant) || 0;
  const al = getAlerts();

  let h = `<div class="project-code-card">
    <div class="pcc-left"><span class="pcc-label">Code projet</span><span class="pcc-code">${state.CODE}</span></div>
    <button class="btn-ghost" onclick="copyCode()">${icon('copy')} Copier</button>
  </div>`;

  h += `<div class="stats-row">
    <div class="stat-card"><strong>${np}</strong><small>Projets</small></div>
    <div class="stat-card"><strong>${nd}</strong><small>Décors</small></div>
    <div class="stat-card"><strong>${ne}</strong><small>Éléments</small></div>
    <div class="stat-card"><strong>${fm(td).replace('€', '').trim()}</strong><small>Budget</small></div>
  </div>`;

  if (al.urgents.length || al.retards.length || al.nonPrets.length || al.aujourdhui.length || al.demain.length) {
    h += '<div class="alerts-row">';
    if (al.urgents.length) h += `<button class="alert-chip danger" onclick="go('acc')">${icon('alert')} ${al.urgents.length} urgent</button>`;
    if (al.retards.length) h += `<button class="alert-chip danger" onclick="go('acc')">${icon('zap')} ${al.retards.length} retard</button>`;
    if (al.nonPrets.length) h += `<button class="alert-chip warn" onclick="go('acc')">${icon('box')} ${al.nonPrets.length} non prêts</button>`;
    if (al.aujourdhui.length) h += `<button class="alert-chip info" onclick="go('acc')">${icon('film')} ${al.aujourdhui.length} aujourd'hui</button>`;
    if (al.demain.length) h += `<button class="alert-chip cool" onclick="go('acc')">📅 ${al.demain.length} demain</button>`;
    h += '</div>';
  }

  h += `<div class="section-head"><span>Mes projets</span><button class="btn-text" onclick="modal('np')">${icon('plus')} Nouveau</button></div>`;

  if (!D.projets.length) {
    h += `<div class="empty-state">${icon('film', 'empty-icon')}<p>Aucun projet</p><small>Créez votre premier projet</small></div>`;
  } else {
    for (let i = 0; i < D.projets.length; i++) {
      const p = D.projets[i], t = gt(p.type), ndc = p.decors ? p.decors.length : 0;
      h += `<div class="card" onclick="go('proj','${p.id}')">
        <div class="card-avatar">${t.i}</div>
        <div class="card-body"><h3>${escHtml(p.nom)}</h3><p>${ndc} décors${p.production ? ' · ' + escHtml(p.production) : ''}</p></div>
        <button class="icon-btn sm" onclick="event.stopPropagation();edit('projet',window._store.D.projets[${i}])">${icon('edit')}</button>
      </div>`;
    }
  }

  h += `<button class="fab" onclick="modal('np')">${icon('plus')}</button>`;
  return h;
}

// ── Project view ──
export function rProj() {
  if (!state.P) return '';
  const P = state.P, t = gt(P.type), nd = P.decors ? P.decors.length : 0;
  let td = 0;
  for (const dep of state.D.depenses) if (dep.projetId === P.id) td += parseFloat(dep.montant) || 0;

  let h = `<div class="page-head">
    <div class="page-head-icon">${t.i}</div>
    <div><h1 class="page-title">${escHtml(P.nom)}</h1><p class="page-sub">${escHtml(P.production || t.l)} · ${nd} décors</p></div>
  </div>`;

  if (td > 0) h += `<div class="total-card"><span>Budget projet</span><strong>${fm(td)}</strong></div>`;

  h += `<div class="actions-row">
    <button class="btn primary sm" onclick="modal('nd')">${icon('plus')} Décor</button>
    <button class="btn ghost sm" onclick="edit('projet',window._store.P)">${icon('edit')} Modifier</button>
    <button class="btn danger-ghost sm" onclick="delP()">${icon('trash')}</button>
  </div>`;

  h += '<div class="section-head"><span>Décors</span></div>';
  if (!P.decors || !P.decors.length) {
    h += `<div class="empty-state">${icon('film', 'empty-icon')}<p>Aucun décor</p></div>`;
  } else {
    for (let i = 0; i < P.decors.length; i++) {
      const d = P.decors[i], st = gsd(d.statut), nel = d.elements ? d.elements.length : 0;
      h += `<div class="card" onclick="go('dec','${d.id}')">
        <div class="card-avatar">${d.interieur ? '🏠' : '🌳'}</div>
        <div class="card-body"><h3>${escHtml(d.nom)}</h3><p><span class="badge" style="--bc:${st.c}">${st.l}</span> ${nel} él.</p></div>
        <button class="icon-btn sm" onclick="event.stopPropagation();window._store.DC=window._store.P.decors[${i}];edit('decor',window._store.DC)">${icon('edit')}</button>
      </div>`;
    }
  }
  h += `<button class="fab" onclick="modal('nd')">${icon('plus')}</button>`;
  return h;
}

// ── Decor view ──
export function rDec() {
  if (!state.DC) return '';
  const DC = state.DC, st = gsd(DC.statut);

  let h = `<div class="page-head">
    <h1 class="page-title">${escHtml(DC.nom)}</h1>
    <p class="page-sub"><span class="badge" style="--bc:${st.c}">${st.l}</span>${DC.adresse ? ' · 📍 ' + escHtml(DC.adresse) : ''}</p>
  </div>`;

  h += `<div class="tabs-bar">
    <button class="tab ${state.TB === 'rub' ? 'on' : ''}" onclick="setTab('rub')">Rubriques</button>
    <button class="tab ${state.TB === 'portfolio' ? 'on' : ''}" onclick="setTab('portfolio')">Portfolio</button>
    <button class="tab ${state.TB === 'info' ? 'on' : ''}" onclick="setTab('info')">Infos</button>
  </div>`;

  if (state.TB === 'rub') {
    h += '<div class="rub-grid">';
    for (const r of RUB) {
      let cnt = 0, urg = 0, phs = 0;
      if (DC.elements) for (const e of DC.elements) {
        if (e.rubrique === r.id) { cnt++; if (e.urgent) urg++; if (e.photos) phs += e.photos.length; }
      }
      h += `<div class="rub-card ${urg ? 'urgent' : ''}" onclick="modal('rub','${r.id}')" style="--rc:${r.c}">
        <div class="rub-icon">${r.emoji}</div>
        <h4>${r.n}</h4><p>${cnt} él.${phs ? ' · ' + phs + ' 📷' : ''}</p>
        ${cnt ? `<span class="rub-count">${cnt}</span>` : ''}
      </div>`;
    }
    h += '</div>';
  } else if (state.TB === 'portfolio') {
    const groups = getDecorPortfolioGroups();
    if (!groups.length) {
      h += `<div class="empty-state">${icon('image', 'empty-icon')}<p>Aucune photo</p><small>Ajoutez des photos aux éléments</small></div>`;
    } else {
      for (const group of groups) {
        const rb = group.rubrique;
        h += `<div class="section-head"><span>${rb.emoji} ${rb.n}</span><small>${group.photos.length} photo(s)</small></div>`;
        h += '<div class="photo-grid">';
        for (let p = 0; p < group.photos.length; p++) {
          h += `<div class="photo-grid-item" onclick="openPortfolioGroup('${rb.id}',${p})">
            <img src="${group.photos[p].data}" loading="lazy">
            <span class="photo-grid-label">${escHtml(group.photos[p].nom)}</span>
          </div>`;
        }
        h += '</div>';
      }
    }
  } else if (state.TB === 'info') {
    h += '<div class="info-box">';
    h += `<div class="info-row"><span>Type</span><span>${DC.interieur ? 'Intérieur' : 'Extérieur'} · ${DC.studio ? 'Studio' : 'Naturel'}</span></div>`;
    if (DC.dateInstallation) h += `<div class="info-row"><span>Installation</span><span>${fd(DC.dateInstallation)}</span></div>`;
    if (DC.dateTournage) h += `<div class="info-row"><span>Tournage</span><span>${fd(DC.dateTournage)}</span></div>`;
    if (DC.elements) h += `<div class="info-row"><span>Éléments</span><span>${DC.elements.length}</span></div>`;
    if (DC.notes) h += `<div class="info-row"><span>Notes</span><span>${escHtml(DC.notes)}</span></div>`;
    h += '</div>';
    h += `<div class="actions-row">
      <button class="btn primary sm" onclick="edit('decor',window._store.DC)">${icon('edit')} Modifier</button>
      <button class="btn danger-ghost sm" onclick="delD()">${icon('trash')} Supprimer</button>
    </div>`;
  }

  h += `<button class="fab" onclick="modal('ne')">${icon('plus')}</button>`;
  return h;
}

// ── Element view ──
export function rEl() {
  if (!state.EL) return '';
  const EL = state.EL, st = gs(EL.statut), rb = gr(EL.rubrique);

  let h = '';
  if (EL.photos && EL.photos.length) {
    h += `<div class="photo-hero" onclick="openPh(window._store.EL.photos.map(p=>({data:p})),0)"><img src="${EL.photos[0]}" loading="lazy"></div>`;
    h += '<div class="photo-strip">';
    for (let i = 0; i < EL.photos.length; i++)
      h += `<div class="photo-thumb ${i === 0 ? 'active' : ''}" onclick="openPh(window._store.EL.photos.map(p=>({data:p})),${i})"><img src="${EL.photos[i]}" loading="lazy"></div>`;
    h += `<button class="photo-thumb photo-add" onclick="addPh()">${icon('plus')}</button></div>`;
  } else {
    h += `<div class="photo-hero empty" onclick="addPh()">${icon('camera', 'hero-cam-icon')}<span>Ajouter photos</span></div>`;
  }

  h += `<h1 class="page-title">${escHtml(EL.nom)}${EL.urgent ? ' <span class="urgent-dot"></span>' : ''}</h1>`;
  h += '<div class="chips">';
  if (rb) h += `<span class="chip" style="--cc:${rb.c}">${rb.emoji} ${rb.n}</span>`;
  if (EL.scene) h += `<span class="chip">🎬 Sc.${escHtml(EL.scene)}</span>`;
  if (EL.role) h += `<span class="chip" style="--cc:#ec4899">👤 ${escHtml(EL.role)}</span>`;
  if (EL.dateJeu) h += `<span class="chip">📅 ${fd(EL.dateJeu)}</span>`;
  h += '</div>';

  h += `<div class="actions-row">
    <button class="btn primary sm" onclick="edit('element',window._store.EL)">${icon('edit')} Modifier</button>
    <button class="btn ${EL.urgent ? 'danger-ghost' : 'ghost'} sm" onclick="toggleUrg()">${icon('zap')} Urgent</button>
    <button class="btn ghost sm" onclick="dupEl()">${icon('duplicate')}</button>
    <button class="btn danger-ghost sm" onclick="delE()">${icon('trash')}</button>
  </div>`;

  h += `<div class="fld"><label>Statut</label><select onchange="setStat(this.value)" class="select-status" style="--sc:${st.c}">`;
  for (const s of STAT) h += `<option value="${s.id}" ${s.id === EL.statut ? 'selected' : ''}>${s.l}</option>`;
  h += '</select></div>';

  h += '<div class="info-box">';
  if (EL.description) h += `<p class="el-desc">${escHtml(EL.description)}</p>`;
  if (EL.dimensions) h += `<div class="info-row"><span>Dimensions</span><span>${escHtml(EL.dimensions)}</span></div>`;
  if (EL.couleur) h += `<div class="info-row"><span>Couleur</span><span>${escHtml(EL.couleur)}</span></div>`;
  if (EL.matiere) h += `<div class="info-row"><span>Matière</span><span>${escHtml(EL.matiere)}</span></div>`;
  if (EL.quantite && EL.quantite > 1) h += `<div class="info-row"><span>Quantité</span><span>${EL.quantite}</span></div>`;
  h += '</div>';

  const lo = EL.loueurId ? gl(EL.loueurId) : null;
  if (lo) {
    h += `<div class="supplier-card">
      ${icon('store', 'supplier-icon')}
      <div><strong>${escHtml(lo.nom)}</strong>
      ${lo.telephone ? `<br><a href="tel:${lo.telephone}" class="supplier-phone">${icon('phone')} ${escHtml(lo.telephone)}</a>` : ''}
      </div>
    </div>`;
  }

  if (EL.coutLocation || EL.coutReel || EL.dateDepart || EL.dateRetour) {
    h += `<div class="info-box accent"><div class="info-box-title">${icon('box')} Location</div>`;
    if (EL.dateDepart) h += `<div class="info-row"><span>Départ</span><span>${fd(EL.dateDepart)}</span></div>`;
    if (EL.dateRetour) h += `<div class="info-row"><span>Retour</span><span>${fd(EL.dateRetour)}</span></div>`;
    if (EL.coutLocation) h += `<div class="info-row"><span>Estimé</span><span>${fm(EL.coutLocation)}</span></div>`;
    if (EL.coutReel) h += `<div class="info-row"><span>Réel</span><span class="text-success">${fm(EL.coutReel)}</span></div>`;
    h += '</div>';
  }
  return h;
}

// ── Loueurs list ──
export function rLou() {
  const D = state.D;
  let h = `<div class="page-head"><h1 class="page-title">${icon('store')} Loueurs</h1><p class="page-sub">${D.loueurs.length} contacts</p></div>`;
  if (!D.loueurs.length) {
    h += `<div class="empty-state">${icon('store', 'empty-icon')}<p>Aucun loueur</p></div>`;
  } else {
    for (let i = 0; i < D.loueurs.length; i++) {
      const l = D.loueurs[i];
      h += `<div class="card" onclick="go('loud','${l.id}')">
        <div class="card-avatar">🏪</div>
        <div class="card-body"><h3>${escHtml(l.nom)}</h3><p>${escHtml(l.specialite || 'Loueur')}</p></div>
        <div class="card-actions">
          ${l.telephone ? `<a href="tel:${l.telephone}" class="icon-btn sm success" onclick="event.stopPropagation()">${icon('phone')}</a>` : ''}
          <button class="icon-btn sm" onclick="event.stopPropagation();edit('loueur',window._store.D.loueurs[${i}])">${icon('edit')}</button>
        </div>
      </div>`;
    }
  }
  h += `<button class="fab" onclick="modal('nl')">${icon('plus')}</button>`;
  return h;
}

// ── Loueur detail ──
export function rLouD() {
  if (!state.LO) return '';
  const LO = state.LO;
  const rented = getRentItems().filter(x => x.l && x.l.id === LO.id);

  let h = `<div class="page-head"><h1 class="page-title">${icon('store')} ${escHtml(LO.nom)}</h1>`;
  if (LO.specialite) h += `<p class="page-sub">${escHtml(LO.specialite)}</p>`;
  h += '</div>';

  h += '<div class="actions-row">';
  if (LO.telephone) h += `<a href="tel:${LO.telephone}" class="btn primary sm" style="text-decoration:none">${icon('phone')} Appeler</a>`;
  if (LO.email) h += `<a href="mailto:${LO.email}" class="btn ghost sm" style="text-decoration:none">${icon('mail')} Email</a>`;
  h += `<button class="btn ghost sm" onclick="edit('loueur',window._store.LO)">${icon('edit')}</button></div>`;

  h += '<div class="info-box">';
  if (LO.contact) h += `<div class="info-row"><span>Contact</span><span>${escHtml(LO.contact)}</span></div>`;
  if (LO.telephone) h += `<div class="info-row"><span>Téléphone</span><span>${escHtml(LO.telephone)}</span></div>`;
  if (LO.adresse) h += `<div class="info-row"><span>Adresse</span><span>${escHtml(LO.adresse)}</span></div>`;
  if (LO.notes) h += `<div class="info-row"><span>Notes</span><span>${escHtml(LO.notes)}</span></div>`;
  h += '</div>';

  h += `<div class="section-head"><span>Objets loués</span><button class="btn-text" onclick="go('rent')">Voir tout</button></div>`;
  if (!rented.length) {
    h += `<div class="empty-state sm">${icon('box', 'empty-icon')}<p>Aucun objet lié</p></div>`;
  } else {
    for (const x of rented) {
      h += `<div class="list-item" onclick="goTo('${x.p.id}','${x.d.id}','${x.e.id}')">
        <div><h4>${escHtml(x.e.nom)}</h4><p>${escHtml(x.p.nom)} · ${escHtml(x.d.nom)}</p></div>
        <strong>${money(x.e.coutReel || x.e.coutLocation) ? fm(x.e.coutReel || x.e.coutLocation) : '—'}</strong>
      </div>`;
    }
  }
  h += `<button class="btn danger-ghost" style="width:100%;margin-top:16px" onclick="delL()">${icon('trash')} Supprimer</button>`;
  return h;
}

// ── Rent view ──
export function rRent() {
  const items = getRentItems();
  let h = `<div class="page-head"><h1 class="page-title">${icon('box')} Locations</h1><p class="page-sub">${items.length} objet(s)</p></div>`;

  h += `<div class="tabs-bar">
    <button class="tab ${state.RTL === 'all' ? 'on' : ''}" onclick="setRentTab('all')">Tous</button>
    <button class="tab ${state.RTL === 'decor' ? 'on' : ''}" onclick="setRentTab('decor')">Par décor</button>
    <button class="tab ${state.RTL === 'loueur' ? 'on' : ''}" onclick="setRentTab('loueur')">Par loueur</button>
  </div>`;

  if (!items.length) {
    h += `<div class="empty-state">${icon('box', 'empty-icon')}<p>Aucun objet loué</p><small>Renseignez un loueur ou des dates dans les fiches</small></div>`;
    return h;
  }

  if (state.RTL === 'all') {
    items.sort((a, b) => money(b.e.coutReel || b.e.coutLocation) - money(a.e.coutReel || a.e.coutLocation));
    for (const x of items) {
      const st = gs(x.e.statut);
      h += `<div class="card" onclick="goTo('${x.p.id}','${x.d.id}','${x.e.id}')">
        ${x.e.photos && x.e.photos.length ? `<img class="card-thumb" src="${x.e.photos[0]}" loading="lazy">` : `<div class="card-avatar">📦</div>`}
        <div class="card-body"><h3>${escHtml(x.e.nom)}</h3><p>${escHtml(x.d.nom)} · ${x.l ? escHtml(x.l.nom) : 'Sans loueur'}${x.e.dateRetour ? ' · retour ' + fd(x.e.dateRetour) : ''}</p></div>
        <span class="badge" style="--bc:${st.c}">${st.l}</span>
      </div>`;
    }
  } else if (state.RTL === 'decor') {
    const map = {};
    for (const x of items) { const key = x.p.id + '__' + x.d.id; if (!map[key]) map[key] = { title: x.p.nom + ' · ' + x.d.nom, items: [] }; map[key].items.push(x); }
    for (const key in map) {
      h += `<div class="section-head"><span>${escHtml(map[key].title)}</span><small>${map[key].items.length}</small></div>`;
      for (const x of map[key].items) {
        h += `<div class="list-item" onclick="goTo('${x.p.id}','${x.d.id}','${x.e.id}')"><div><h4>${escHtml(x.e.nom)}</h4><p>${x.l ? escHtml(x.l.nom) : 'Sans loueur'}${x.e.dateDepart ? ' · départ ' + fd(x.e.dateDepart) : ''}</p></div><strong>${money(x.e.coutReel || x.e.coutLocation) ? fm(x.e.coutReel || x.e.coutLocation) : '—'}</strong></div>`;
      }
    }
  } else {
    const map2 = {};
    for (const x of items) { const key = x.l ? x.l.id : 'none'; if (!map2[key]) map2[key] = { title: x.l ? x.l.nom : 'Sans loueur', items: [], l: x.l }; map2[key].items.push(x); }
    for (const key in map2) {
      h += `<div class="section-head"><span>${escHtml(map2[key].title)}</span><small>${map2[key].items.length}</small></div>`;
      if (map2[key].l) h += `<button class="btn ghost sm" style="margin-bottom:8px" onclick="go('loud','${map2[key].l.id}')">${icon('store')} Fiche loueur</button>`;
      for (const x of map2[key].items) {
        h += `<div class="list-item" onclick="goTo('${x.p.id}','${x.d.id}','${x.e.id}')"><div><h4>${escHtml(x.e.nom)}</h4><p>${escHtml(x.p.nom)} · ${escHtml(x.d.nom)}</p></div><strong>${money(x.e.coutReel || x.e.coutLocation) ? fm(x.e.coutReel || x.e.coutLocation) : '—'}</strong></div>`;
      }
    }
  }
  return h;
}

// ── Depenses ──
export function rDep() {
  let deps = state.D.depenses.slice();
  if (state.P) deps = deps.filter(d => d.projetId === state.P.id);
  deps.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  let total = 0, estim = 0;
  for (const d of deps) { total += parseFloat(d.montant) || 0; estim += parseFloat(d.estime) || 0; }

  let h = `<div class="page-head"><h1 class="page-title">${icon('dollar')} ${state.P ? 'Budget ' + escHtml(state.P.nom) : 'Dépenses'}</h1><p class="page-sub">${deps.length} dépenses</p></div>`;
  h += `<div class="total-card"><span>Total</span><strong>${fm(total)}</strong></div>`;
  if (estim > 0) {
    const diff = total - estim;
    h += `<div class="info-box" style="display:flex;justify-content:space-between"><span>Estimé: ${fm(estim)}</span><span class="${diff > 0 ? 'text-danger' : 'text-success'}">Écart: ${fm(diff)}</span></div>`;
  }

  if (!deps.length) {
    h += `<div class="empty-state">${icon('dollar', 'empty-icon')}<p>Aucune dépense</p></div>`;
  } else {
    for (const d of deps) {
      h += `<div class="list-item" onclick="editDep('${d.id}')"><div><h4>${escHtml(d.description || 'Dépense')}</h4><p>${fd(d.date)}${d.fournisseur ? ' · ' + escHtml(d.fournisseur) : ''}</p></div><strong class="text-success">${fm(d.montant)}</strong></div>`;
    }
  }
  h += `<button class="fab" onclick="modal('ndep')">${icon('plus')}</button>`;
  return h;
}

// ── Accessoires ──
export function rAcc() {
  let items = [];
  for (const p of state.D.projets) {
    if (!p.decors) continue;
    for (const d of p.decors) {
      if (!d.elements) continue;
      for (const e of d.elements) {
        if (e.rubrique === 'accessoires') items.push({ e, d, p });
      }
    }
  }
  if (state.SQ) { const q = state.SQ.toLowerCase(); items = items.filter(x => x.e.nom.toLowerCase().includes(q) || (x.e.role && x.e.role.toLowerCase().includes(q))); }

  let h = `<div class="page-head"><h1 class="page-title">${icon('box')} Accessoires de jeu</h1><p class="page-sub">${items.length} accessoires</p></div>`;
  h += `<div class="search-bar compact">${icon('search', 'search-icon')}<input placeholder="Rechercher…" value="${escHtml(state.SQ)}" oninput="setSQ(this.value)"></div>`;

  if (!items.length) {
    h += `<div class="empty-state">${icon('box', 'empty-icon')}<p>Aucun accessoire</p></div>`;
  } else {
    for (const x of items) {
      const st = gs(x.e.statut);
      h += `<div class="card ${x.e.urgent ? 'urgent' : ''}" onclick="goTo('${x.p.id}','${x.d.id}','${x.e.id}')">
        ${x.e.photos && x.e.photos.length ? `<img class="card-thumb" src="${x.e.photos[0]}" loading="lazy">` : `<div class="card-avatar">🎭</div>`}
        <div class="card-body"><h3>${escHtml(x.e.nom)}${x.e.urgent ? ' <span class="urgent-dot"></span>' : ''}</h3><p>${x.e.role ? '👤 ' + escHtml(x.e.role) + ' · ' : ''}${x.e.dateJeu ? '📅 ' + fd(x.e.dateJeu) : ''}</p></div>
        <span class="badge" style="--bc:${st.c}">${st.l}</span>
      </div>`;
    }
  }
  return h;
}

// ── Search ──
export function rSearch() {
  const results = search(state.GSQ);
  let h = '<div class="page-head"><h1 class="page-title">Recherche</h1></div>';
  if (!state.GSQ || state.GSQ.length < 2) {
    h += `<div class="empty-state">${icon('search', 'empty-icon')}<p>Tapez au moins 2 caractères</p></div>`;
  } else if (!results.length) {
    h += `<div class="empty-state">${icon('search', 'empty-icon')}<p>Aucun résultat pour "${escHtml(state.GSQ)}"</p></div>`;
  } else {
    h += `<p class="page-sub">${results.length} résultat(s)</p>`;
    for (const r of results) {
      if (r.t === 'projet') h += `<div class="card" onclick="go('proj','${r.item.id}')"><div class="card-avatar">📁</div><div class="card-body"><h3>${escHtml(r.item.nom)}</h3><p>Projet</p></div></div>`;
      else if (r.t === 'decor') h += `<div class="card" onclick="goTo('${r.p.id}','${r.item.id}')"><div class="card-avatar">🎭</div><div class="card-body"><h3>${escHtml(r.item.nom)}</h3><p>Décor · ${escHtml(r.p.nom)}</p></div></div>`;
      else if (r.t === 'element') h += `<div class="card" onclick="goTo('${r.p.id}','${r.d.id}','${r.item.id}')">
        ${r.item.photos && r.item.photos.length ? `<img class="card-thumb" src="${r.item.photos[0]}" loading="lazy">` : '<div class="card-avatar">📦</div>'}
        <div class="card-body"><h3>${escHtml(r.item.nom)}</h3><p>${escHtml(r.d.nom)} · ${escHtml(r.p.nom)}</p></div></div>`;
      else if (r.t === 'loueur') h += `<div class="card" onclick="go('loud','${r.item.id}')"><div class="card-avatar">🏪</div><div class="card-body"><h3>${escHtml(r.item.nom)}</h3><p>Loueur</p></div></div>`;
    }
  }
  return h;
}

// ── Viewer ──
export function rViewer() {
  if (!state.VWC || !state.VWC.length) return '';
  const ph = state.VWC[state.VWI];
  return `<div class="viewer">
    <div class="viewer-hdr">
      <button class="icon-btn light" onclick="closePh()">${icon('x')}</button>
      <span class="viewer-count">${state.VWI + 1} / ${state.VWC.length}</span>
      <button class="icon-btn light danger" onclick="delPh()">${icon('trash')}</button>
    </div>
    ${state.VWC.length > 1 ? `<button class="viewer-nav l" onclick="navPh(-1)">${icon('chevLeft')}</button><button class="viewer-nav r" onclick="navPh(1)">${icon('chevRight')}</button>` : ''}
    <div class="viewer-body"><img src="${ph.data || ph}"></div>
    ${ph.nom ? `<div class="viewer-ftr">${escHtml(ph.nom)}</div>` : ''}
  </div>`;
}

// ── Menu ──
export function rMenu() {
  return `<div class="side-menu">
    <div class="menu-bg" onclick="menu(false)"></div>
    <div class="menu-panel">
      <div class="menu-head">
        <span class="menu-title">${icon('settings')} Menu</span>
        <button class="icon-btn" onclick="menu(false)">${icon('x')}</button>
      </div>
      <div class="menu-code-box"><small>Code projet</small><strong>${state.CODE}</strong></div>
      <nav class="menu-nav">
        <button onclick="go('home');menu(false)">${icon('home')} Accueil</button>
        <button onclick="go('acc');menu(false)">${icon('box')} Accessoires</button>
        <button onclick="go('rent');menu(false)">${icon('box')} Locations</button>
        <button onclick="go('dep');menu(false)">${icon('dollar')} Dépenses</button>
        <button onclick="go('lou');menu(false)">${icon('store')} Loueurs</button>
      </nav>
      <div class="menu-divider"></div>
      <button class="menu-danger" onclick="leaveProject()">${icon('logout')} Quitter le projet</button>
      <div class="menu-footer"><p>Décor Pro v9.0</p><p>${state.D.projets.length} projets</p></div>
    </div>
  </div>`;
}

// ── Modal ──
export function rModal() {
  let c = '';
  const M = state.M, EDIT = state.EDIT, MORE = state.MORE;

  if (M === 'np') {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('film')} Nouveau projet</h2>`;
    c += `<div class="fld"><label>Nom du projet *</label><input id="f1" placeholder="Ex: Mon Film"></div>`;
    c += '<div class="fld"><label>Type</label><select id="f2">';
    for (const t of TPROJ) c += `<option value="${t.id}">${t.i} ${t.l}</option>`;
    c += '</select></div>';
    c += `<button class="toggle-more" onclick="toggleMore()">${icon(MORE ? 'chevUp' : 'chevDown')} ${MORE ? 'Moins' : "Plus d'options"}</button>`;
    c += `<div class="form-extra ${MORE ? '' : 'hidden'}">
      <div class="fld"><label>Production</label><input id="f3"></div>
      <div class="fld-row"><div class="fld"><label>Réalisateur</label><input id="f4"></div><div class="fld"><label>Chef déco</label><input id="f5"></div></div>
      <div class="fld"><label>Notes</label><textarea id="f6"></textarea></div>
    </div>`;
    c += `<button class="btn primary" onclick="saveP()">Créer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'edit_projet' && EDIT) {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('edit')} Modifier projet</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1" value="${escHtml(EDIT.nom)}"></div>`;
    c += '<div class="fld"><label>Type</label><select id="f2">';
    for (const t of TPROJ) c += `<option value="${t.id}" ${t.id === EDIT.type ? 'selected' : ''}>${t.i} ${t.l}</option>`;
    c += '</select></div>';
    c += `<div class="fld"><label>Production</label><input id="f3" value="${escHtml(EDIT.production || '')}"></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Réalisateur</label><input id="f4" value="${escHtml(EDIT.realisateur || '')}"></div><div class="fld"><label>Chef déco</label><input id="f5" value="${escHtml(EDIT.chefDeco || '')}"></div></div>`;
    c += `<div class="fld"><label>Notes</label><textarea id="f6">${escHtml(EDIT.notes || '')}</textarea></div>`;
    c += `<button class="btn primary" onclick="updateP()">Enregistrer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'nd') {
    c = `<div class="modal-bar"></div><h2 class="modal-title">🎭 Nouveau décor</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1" placeholder="Ex: Appartement Marie"></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Type</label><select id="f3"><option value="1">🏠 Int.</option><option value="0">🌳 Ext.</option></select></div><div class="fld"><label>Nature</label><select id="f4"><option value="0">Naturel</option><option value="1">Studio</option></select></div></div>`;
    c += `<button class="toggle-more" onclick="toggleMore()">${icon(MORE ? 'chevUp' : 'chevDown')} ${MORE ? 'Moins' : 'Plus'}</button>`;
    c += `<div class="form-extra ${MORE ? '' : 'hidden'}">
      <div class="fld"><label>Adresse</label><input id="f2"></div>
      <div class="fld"><label>Statut</label><select id="f5">`;
    for (const s of STATD) c += `<option value="${s.id}">${s.l}</option>`;
    c += `</select></div>
      <div class="fld-row"><div class="fld"><label>Installation</label><input type="date" id="f6"></div><div class="fld"><label>Tournage</label><input type="date" id="f7"></div></div>
      <div class="fld"><label>Notes</label><textarea id="f8"></textarea></div>
    </div>`;
    c += `<button class="btn primary" onclick="saveDC()">Créer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'edit_decor' && EDIT) {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('edit')} Modifier décor</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1" value="${escHtml(EDIT.nom)}"></div>`;
    c += `<div class="fld"><label>Adresse</label><input id="f2" value="${escHtml(EDIT.adresse || '')}"></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Type</label><select id="f3"><option value="1" ${EDIT.interieur ? 'selected' : ''}>🏠 Int.</option><option value="0" ${!EDIT.interieur ? 'selected' : ''}>🌳 Ext.</option></select></div><div class="fld"><label>Nature</label><select id="f4"><option value="0" ${!EDIT.studio ? 'selected' : ''}>Naturel</option><option value="1" ${EDIT.studio ? 'selected' : ''}>Studio</option></select></div></div>`;
    c += '<div class="fld"><label>Statut</label><select id="f5">';
    for (const s of STATD) c += `<option value="${s.id}" ${s.id === EDIT.statut ? 'selected' : ''}>${s.l}</option>`;
    c += '</select></div>';
    c += `<div class="fld-row"><div class="fld"><label>Installation</label><input type="date" id="f6" value="${EDIT.dateInstallation || ''}"></div><div class="fld"><label>Tournage</label><input type="date" id="f7" value="${EDIT.dateTournage || ''}"></div></div>`;
    c += `<div class="fld"><label>Notes</label><textarea id="f8">${escHtml(EDIT.notes || '')}</textarea></div>`;
    c += `<button class="btn primary" onclick="updateDC()">Enregistrer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'ne') {
    const rb = state.RB ? gr(state.RB) : null;
    c = `<div class="modal-bar"></div><h2 class="modal-title">📦 Nouvel élément</h2>`;
    c += `<div class="drop-zone" onclick="document.getElementById('phi').click()"><div id="phpr"></div><div id="phpl">${icon('camera')} Ajouter photos</div><input type="file" accept="image/*" multiple id="phi" style="display:none" onchange="prvPh(event)"></div>`;
    c += '<div id="upload-status"></div>';
    c += `<div class="fld"><label>Nom *</label><input id="f1" placeholder="Ex: Vase bleu"></div>`;
    c += '<div class="fld-row"><div class="fld"><label>Rubrique</label><select id="f2">';
    for (const r of RUB) c += `<option value="${r.id}" ${rb && rb.id === r.id ? 'selected' : ''}>${r.emoji} ${r.n}</option>`;
    c += '</select></div><div class="fld"><label>Statut</label><select id="f3">';
    for (const s of STAT) c += `<option value="${s.id}">${s.l}</option>`;
    c += '</select></div></div>';
    c += `<button class="toggle-more" onclick="toggleMore()">${icon(MORE ? 'chevUp' : 'chevDown')} ${MORE ? 'Moins' : "Plus d'options"}</button>`;
    c += `<div class="form-extra ${MORE ? '' : 'hidden'}">
      <div class="fld"><label>Description</label><textarea id="f4"></textarea></div>
      <div class="fld-row"><div class="fld"><label>Dimensions</label><input id="f5"></div><div class="fld"><label>Quantité</label><input type="number" id="f6" value="1"></div></div>
      <div class="fld-row"><div class="fld"><label>Couleur</label><input id="f7"></div><div class="fld"><label>Matière</label><input id="f8"></div></div>
      <div class="fld"><label>Tags</label><input id="f9" placeholder="vintage, bois..."></div>
      <div class="accessoire-section"><div class="accessoire-title">🎭 Accessoire</div>
        <div class="fld-row"><div class="fld"><label>Scène</label><input id="f10"></div><div class="fld"><label>Personnage</label><input id="f11"></div></div>
        <div class="fld"><label>Date jeu</label><input type="date" id="f12"></div>
        <div class="fld"><label>Continuité</label><input id="f13"></div>
      </div>`;
    if (state.D.loueurs.length) {
      c += '<div class="fld"><label>Loueur</label><select id="f14"><option value="">Aucun</option>';
      for (const l of state.D.loueurs) c += `<option value="${l.id}">${escHtml(l.nom)}</option>`;
      c += '</select></div>';
    }
    c += `<div class="fld-row"><div class="fld"><label>Estimé €</label><input type="number" id="f15"></div><div class="fld"><label>Réel €</label><input type="number" id="f16"></div></div>
      <div class="fld-row"><div class="fld"><label>Départ</label><input type="date" id="f17"></div><div class="fld"><label>Retour</label><input type="date" id="f18"></div></div>
    </div>`;
    c += `<button class="btn primary" id="save-el-btn" onclick="saveEl()">Ajouter</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'edit_element' && EDIT) {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('edit')} Modifier élément</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1" value="${escHtml(EDIT.nom)}"></div>`;
    c += '<div class="fld-row"><div class="fld"><label>Rubrique</label><select id="f2">';
    for (const r of RUB) c += `<option value="${r.id}" ${r.id === EDIT.rubrique ? 'selected' : ''}>${r.emoji} ${r.n}</option>`;
    c += '</select></div><div class="fld"><label>Statut</label><select id="f3">';
    for (const s of STAT) c += `<option value="${s.id}" ${s.id === EDIT.statut ? 'selected' : ''}>${s.l}</option>`;
    c += '</select></div></div>';
    c += `<div class="fld"><label>Description</label><textarea id="f4">${escHtml(EDIT.description || '')}</textarea></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Dimensions</label><input id="f5" value="${escHtml(EDIT.dimensions || '')}"></div><div class="fld"><label>Quantité</label><input type="number" id="f6" value="${EDIT.quantite || 1}"></div></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Couleur</label><input id="f7" value="${escHtml(EDIT.couleur || '')}"></div><div class="fld"><label>Matière</label><input id="f8" value="${escHtml(EDIT.matiere || '')}"></div></div>`;
    c += `<div class="fld"><label>Tags</label><input id="f9" value="${escHtml(EDIT.tags || '')}"></div>`;
    c += `<div class="accessoire-section"><div class="accessoire-title">🎭 Accessoire</div>
      <div class="fld-row"><div class="fld"><label>Scène</label><input id="f10" value="${escHtml(EDIT.scene || '')}"></div><div class="fld"><label>Personnage</label><input id="f11" value="${escHtml(EDIT.role || '')}"></div></div>
      <div class="fld"><label>Date jeu</label><input type="date" id="f12" value="${EDIT.dateJeu || ''}"></div>
      <div class="fld"><label>Continuité</label><input id="f13" value="${escHtml(EDIT.continuity || '')}"></div>
    </div>`;
    if (state.D.loueurs.length) {
      c += '<div class="fld"><label>Loueur</label><select id="f14"><option value="">Aucun</option>';
      for (const l of state.D.loueurs) c += `<option value="${l.id}" ${l.id === EDIT.loueurId ? 'selected' : ''}>${escHtml(l.nom)}</option>`;
      c += '</select></div>';
    }
    c += `<div class="fld-row"><div class="fld"><label>Estimé €</label><input type="number" id="f15" value="${EDIT.coutLocation || ''}"></div><div class="fld"><label>Réel €</label><input type="number" id="f16" value="${EDIT.coutReel || ''}"></div></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Départ</label><input type="date" id="f17" value="${EDIT.dateDepart || ''}"></div><div class="fld"><label>Retour</label><input type="date" id="f18" value="${EDIT.dateRetour || ''}"></div></div>`;
    c += `<button class="btn primary" onclick="updateEl()">Enregistrer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'nl') {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('store')} Nouveau loueur</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1"></div>`;
    c += `<div class="fld"><label>Spécialité</label><input id="f2"></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Contact</label><input id="f3"></div><div class="fld"><label>Téléphone</label><input type="tel" id="f4"></div></div>`;
    c += `<div class="fld"><label>Email</label><input type="email" id="f5"></div>`;
    c += `<button class="toggle-more" onclick="toggleMore()">${icon(MORE ? 'chevUp' : 'chevDown')} ${MORE ? 'Moins' : 'Plus'}</button>`;
    c += `<div class="form-extra ${MORE ? '' : 'hidden'}"><div class="fld"><label>Adresse</label><input id="f6"></div><div class="fld"><label>Notes</label><textarea id="f7"></textarea></div></div>`;
    c += `<button class="btn primary" onclick="saveLo()">Ajouter</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'edit_loueur' && EDIT) {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('edit')} Modifier loueur</h2>`;
    c += `<div class="fld"><label>Nom *</label><input id="f1" value="${escHtml(EDIT.nom)}"></div>`;
    c += `<div class="fld"><label>Spécialité</label><input id="f2" value="${escHtml(EDIT.specialite || '')}"></div>`;
    c += `<div class="fld-row"><div class="fld"><label>Contact</label><input id="f3" value="${escHtml(EDIT.contact || '')}"></div><div class="fld"><label>Téléphone</label><input type="tel" id="f4" value="${escHtml(EDIT.telephone || '')}"></div></div>`;
    c += `<div class="fld"><label>Email</label><input type="email" id="f5" value="${escHtml(EDIT.email || '')}"></div>`;
    c += `<div class="fld"><label>Adresse</label><input id="f6" value="${escHtml(EDIT.adresse || '')}"></div>`;
    c += `<div class="fld"><label>Notes</label><textarea id="f7">${escHtml(EDIT.notes || '')}</textarea></div>`;
    c += `<button class="btn primary" onclick="updateLo()">Enregistrer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'ndep') {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('dollar')} Nouvelle dépense</h2>`;
    c += `<div class="fld"><label>Description *</label><input id="f2"></div>`;
    c += '<div class="fld-row"><div class="fld"><label>Montant € *</label><input type="number" step="0.01" id="f4"></div><div class="fld"><label>Type</label><select id="f1">';
    for (const t of TDEP) c += `<option value="${t.id}">${t.l}</option>`;
    c += '</select></div></div>';
    c += `<div class="fld-row"><div class="fld"><label>Date</label><input type="date" id="f5" value="${new Date().toISOString().split('T')[0]}"></div><div class="fld"><label>Fournisseur</label><input id="f6"></div></div>`;
    c += `<button class="toggle-more" onclick="toggleMore()">${icon(MORE ? 'chevUp' : 'chevDown')} ${MORE ? 'Moins' : 'Estimé'}</button>`;
    c += `<div class="fld ${MORE ? '' : 'hidden'}"><label>Estimé €</label><input type="number" step="0.01" id="f3"></div>`;
    c += `<button class="btn primary" onclick="saveDep()">Ajouter</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'edit_depense' && EDIT) {
    c = `<div class="modal-bar"></div><h2 class="modal-title">${icon('edit')} Modifier dépense</h2>`;
    c += `<div class="fld"><label>Description</label><input id="f2" value="${escHtml(EDIT.description || '')}"></div>`;
    c += '<div class="fld-row"><div class="fld"><label>Montant €</label><input type="number" step="0.01" id="f4" value="' + (EDIT.montant || '') + '"></div><div class="fld"><label>Type</label><select id="f1">';
    for (const t of TDEP) c += `<option value="${t.id}" ${t.id === EDIT.type ? 'selected' : ''}>${t.l}</option>`;
    c += '</select></div></div>';
    c += `<div class="fld-row"><div class="fld"><label>Date</label><input type="date" id="f5" value="${EDIT.date || ''}"></div><div class="fld"><label>Fournisseur</label><input id="f6" value="${escHtml(EDIT.fournisseur || '')}"></div></div>`;
    c += `<div class="fld"><label>Estimé €</label><input type="number" step="0.01" id="f3" value="${EDIT.estime || ''}"></div>`;
    c += `<button class="btn primary" onclick="updateDep()">Enregistrer</button><button class="btn danger" onclick="delDep()">Supprimer</button><button class="btn ghost" onclick="modal(null)">Annuler</button>`;
  }
  else if (M === 'rub') {
    const rb = gr(state.RB);
    if (!rb) return '';
    const els = [];
    if (state.DC && state.DC.elements) for (const e of state.DC.elements) if (e.rubrique === rb.id) els.push(e);
    c = `<div class="modal-bar"></div>
      <div class="rub-modal-head"><div class="rub-modal-icon" style="background:${rb.c}20">${rb.emoji}</div><div><h3>${rb.n}</h3><small>${els.length} éléments</small></div></div>`;

    const phs = [];
    for (const e of els) if (e.photos) for (const ph of e.photos) phs.push({ data: ph, nom: e.nom });
    if (phs.length) {
      c += '<div class="rub-photo-strip">';
      for (let i = 0; i < phs.length; i++) c += `<img src="${phs[i].data}" onclick="event.stopPropagation();openRubPh('${state.RB}',${i})" loading="lazy">`;
      c += '</div>';
    }

    if (!els.length) {
      c += `<div class="empty-state sm">${icon('box', 'empty-icon')}<p>Aucun élément</p></div>`;
    } else {
      c += '<div class="rub-el-list">';
      for (const e of els) {
        const st = gs(e.statut);
        c += `<div class="card ${e.urgent ? 'urgent' : ''}" onclick="goToRubEl('${e.id}')">
          <div class="card-avatar" style="font-size:18px">${e.photos && e.photos.length ? `<img src="${e.photos[0]}" style="width:40px;height:40px;object-fit:cover;border-radius:8px">` : '📦'}</div>
          <div class="card-body"><h3>${escHtml(e.nom)}${e.urgent ? ' <span class="urgent-dot"></span>' : ''}</h3><span class="badge" style="--bc:${st.c}">${st.l}</span></div>
        </div>`;
      }
      c += '</div>';
    }
    c += `<button class="btn primary" style="margin-top:12px" onclick="modal('ne')">Ajouter un élément</button>`;
  }

  return `<div class="modal-overlay" onclick="modal(null)"><div class="modal-panel" onclick="event.stopPropagation()">${c}</div></div>`;
}
