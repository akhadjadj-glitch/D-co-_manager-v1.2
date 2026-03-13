// ============================================
// app.js — Main Controller
// ============================================

import { state, gl } from './store.js';
import { uid, gv } from './utils.js';
import { HAS_FIREBASE, initFirebase, subscribeToProject, saveToFirebase, createFirebaseProject, checkProjectExists, uploadPhoto, loadLocalData, saveLocalData } from './firebase.js';
import { rLogin, rHeader, rNavbar, rHome, rProj, rDec, rEl, rLou, rLouD, rRent, rDep, rAcc, rSearch, rViewer, rMenu, rModal } from './ui.js';

// ── Expose state for inline onclick handlers ──
window._store = state;

// ── Init Firebase ──
initFirebase();

// ── Network listeners ──
window.addEventListener('online', () => { state.ONLINE = true; R(); });
window.addEventListener('offline', () => { state.ONLINE = false; R(); });

// ── Save shortcut ──
function sv() { saveToFirebase(R); }

// ── Render ──
function R() {
  const app = document.getElementById('app');
  if (!state.CODE) {
    app.innerHTML = rLogin();
    return;
  }

  let h = rHeader();
  h += '<main class="cnt">';
  if (state.V === 'home') h += rHome();
  else if (state.V === 'proj') h += rProj();
  else if (state.V === 'dec') h += rDec();
  else if (state.V === 'el') h += rEl();
  else if (state.V === 'lou') h += rLou();
  else if (state.V === 'loud') h += rLouD();
  else if (state.V === 'rent') h += rRent();
  else if (state.V === 'dep') h += rDep();
  else if (state.V === 'acc') h += rAcc();
  else if (state.V === 'search') h += rSearch();
  h += '</main>';
  h += rNavbar();
  if (state.M) h += rModal();
  if (state.MN) h += rMenu();
  if (state.VW && state.VWC) h += rViewer();
  app.innerHTML = h;
}

// ── Navigation ──
window.go = function(v, id) {
  state.VW = null; state.VWC = null; state.GSQ = '';
  if (v === 'home') { state.V = 'home'; state.P = null; state.DC = null; state.EL = null; }
  else if (v === 'proj') { state.P = state.D.projets.find(p => p.id === id) || null; state.V = 'proj'; state.DC = null; state.EL = null; }
  else if (v === 'dec') { if (state.P && state.P.decors) state.DC = state.P.decors.find(d => d.id === id) || null; state.V = 'dec'; state.EL = null; state.TB = 'rub'; }
  else if (v === 'el') { if (state.DC && state.DC.elements) state.EL = state.DC.elements.find(e => e.id === id) || null; state.V = 'el'; }
  else if (v === 'lou') { state.V = 'lou'; state.LO = null; }
  else if (v === 'loud') { state.LO = state.D.loueurs.find(l => l.id === id) || null; state.V = 'loud'; }
  else if (v === 'rent') { state.V = 'rent'; state.RTL = 'all'; }
  else if (v === 'dep') { state.V = 'dep'; }
  else if (v === 'acc') { state.V = 'acc'; state.SQ = ''; }
  else if (v === 'search') { state.V = 'search'; }
  R();
};

window.goTo = function(pId, dId, eId) {
  state.P = state.D.projets.find(p => p.id === pId) || null;
  if (dId && state.P && state.P.decors) state.DC = state.P.decors.find(d => d.id === dId) || null;
  if (eId && state.DC && state.DC.elements) state.EL = state.DC.elements.find(e => e.id === eId) || null;
  state.V = eId ? 'el' : (dId ? 'dec' : 'proj');
  R();
};

window.goToRubEl = function(eId) {
  if (state.DC && state.DC.elements) state.EL = state.DC.elements.find(e => e.id === eId) || null;
  state.M = null; state.V = 'el'; R();
};

// ── UI state ──
window.modal = function(m, id) { state.M = m; state.RB = id || null; state.PENDING_FILES = []; state.EDIT = null; state.MORE = false; R(); };
window.edit = function(t, o) { state.M = 'edit_' + t; state.EDIT = o; state.MORE = true; R(); };
window.menu = function(v) { state.MN = v; R(); };
window.setTab = function(t) { state.TB = t; R(); };
window.setGSQ = function(q) { state.GSQ = q; R(); };
window.setSQ = function(q) { state.SQ = q; R(); };
window.toggleMore = function() { state.MORE = !state.MORE; R(); };
window.setLTab = function(t) { state.LTAB = t; R(); };
window.setRentTab = function(v) { state.RTL = v; R(); };
window.setTB = function(v) { state.TB = v; R(); };

// ── Photo viewer ──
window.openPh = function(c, i) { state.VWC = c; state.VWI = i; state.VW = true; R(); };
window.closePh = function() { state.VW = null; state.VWC = null; R(); };
window.navPh = function(d) { if (state.VWC) { state.VWI += d; if (state.VWI < 0) state.VWI = state.VWC.length - 1; if (state.VWI >= state.VWC.length) state.VWI = 0; R(); } };
window.openRubPh = function(rubId, idx) {
  const phs = [];
  if (state.DC && state.DC.elements) for (const e of state.DC.elements) {
    if (e.rubrique === rubId && e.photos) for (const ph of e.photos) phs.push({ data: ph, nom: e.nom });
  }
  if (phs.length) window.openPh(phs, idx);
};
window.openPortfolioGroup = function(rubId, idx) {
  const phs = [];
  if (state.DC && state.DC.elements) for (const e of state.DC.elements) {
    if (e.rubrique === rubId && e.photos) for (const ph of e.photos) phs.push({ data: ph, nom: e.nom });
  }
  if (phs.length) window.openPh(phs, idx || 0);
};
window.setStat = function(s) { if (state.EL) { state.EL.statut = s; sv(); R(); } };
window.toggleUrg = function() { if (state.EL) { state.EL.urgent = !state.EL.urgent; sv(); R(); } };

// ── Photo upload helpers ──
window.prvPh = function(e) {
  const files = e.target.files;
  state.PENDING_FILES = Array.from(files);
  const pr = document.getElementById('phpr'), pl = document.getElementById('phpl');
  if (pr && pl && state.PENDING_FILES.length) {
    pr.innerHTML = `<span style="color:var(--accent);font-size:13px">${state.PENDING_FILES.length} photo(s) sélectionnée(s)</span>`;
    pl.style.display = 'none';
  }
};

window.addPh = function() {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = 'image/*'; i.multiple = true;
  i.onchange = function(e) {
    const files = e.target.files;
    let uploaded = 0;
    const total = files.length;
    for (let j = 0; j < files.length; j++) {
      uploadPhoto(files[j]).then(url => {
        if (url) { if (!state.EL.photos) state.EL.photos = []; state.EL.photos.push(url); }
        uploaded++;
        if (uploaded === total) { sv(); R(); }
      });
    }
  };
  i.click();
};

window.delPh = function() {
  if (!confirm('Supprimer cette photo ?')) return;
  if (state.EL && state.EL.photos) {
    state.EL.photos.splice(state.VWI, 1);
    sv();
    if (state.VWI >= state.EL.photos.length) state.VWI = Math.max(0, state.EL.photos.length - 1);
    if (!state.EL.photos.length) { state.VW = null; state.VWC = null; }
    R();
  } else { state.VW = null; state.VWC = null; R(); }
};

// ── Login / Join ──
window.joinProject = function() {
  if (!HAS_FIREBASE) { alert("Mode rejoindre disponible uniquement avec Firebase."); return; }
  const code = document.getElementById('join-code').value.toUpperCase().trim();
  if (code.length !== 6) return alert('Le code doit contenir 6 caractères');
  checkProjectExists(code).then(exists => {
    if (exists) { state.CODE = code; localStorage.setItem('dp_code', code); subscribeToProject(code, R); }
    else alert('Projet introuvable.');
  });
};

window.createProject = function() {
  if (!HAS_FIREBASE) {
    state.CODE = 'LOCAL';
    localStorage.setItem('dp_code', 'LOCAL');
    state.D = loadLocalData();
    if (!state.D.projets) state.D = { projets: [], loueurs: [], depenses: [] };
    state.V = 'home';
    R();
    return;
  }
  const code = (function() { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]; return c; })();
  state.CODE = code;
  localStorage.setItem('dp_code', code);
  state.D = { projets: [], loueurs: [], depenses: [] };
  createFirebaseProject().then(() => subscribeToProject(code, R));
};

window.leaveProject = function() {
  if (!confirm('Quitter ce projet ?')) return;
  if (state.UNSUB) state.UNSUB();
  state.CODE = null;
  localStorage.removeItem('dp_code');
  if (!HAS_FIREBASE) saveLocalData(state.D);
  state.D = { projets: [], loueurs: [], depenses: [] };
  state.MN = false;
  R();
};

window.copyCode = function() {
  navigator.clipboard.writeText(state.CODE).then(() => alert('Code copié: ' + state.CODE));
};

// ── CRUD: Projets ──
window.saveP = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); state.D.projets.push({ id: uid(), nom: n, type: gv('f2') || 'film', production: gv('f3'), realisateur: gv('f4'), chefDeco: gv('f5'), notes: gv('f6'), decors: [] }); sv(); state.M = null; R(); };
window.updateP = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); state.EDIT.nom = n; state.EDIT.type = gv('f2'); state.EDIT.production = gv('f3'); state.EDIT.realisateur = gv('f4'); state.EDIT.chefDeco = gv('f5'); state.EDIT.notes = gv('f6'); sv(); state.M = null; R(); };
window.delP = function() { if (!confirm('Supprimer ?')) return; state.D.projets = state.D.projets.filter(p => p.id !== state.P.id); sv(); state.P = null; state.V = 'home'; R(); };

// ── CRUD: Décors ──
window.saveDC = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); if (!state.P.decors) state.P.decors = []; state.P.decors.push({ id: uid(), nom: n, adresse: gv('f2'), interieur: gv('f3') === '1', studio: gv('f4') === '1', statut: gv('f5') || 'a_preparer', dateInstallation: gv('f6'), dateTournage: gv('f7'), notes: gv('f8'), elements: [] }); sv(); state.M = null; R(); };
window.updateDC = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); state.EDIT.nom = n; state.EDIT.adresse = gv('f2'); state.EDIT.interieur = gv('f3') === '1'; state.EDIT.studio = gv('f4') === '1'; state.EDIT.statut = gv('f5'); state.EDIT.dateInstallation = gv('f6'); state.EDIT.dateTournage = gv('f7'); state.EDIT.notes = gv('f8'); sv(); state.M = null; R(); };
window.delD = function() { if (!confirm('Supprimer ?')) return; state.P.decors = state.P.decors.filter(d => d.id !== state.DC.id); sv(); state.DC = null; state.V = 'proj'; R(); };

// ── CRUD: Éléments ──
window.saveEl = function() {
  const n = gv('f1'); if (!n) return alert('Nom requis');
  const btn = document.getElementById('save-el-btn'); if (btn) btn.disabled = true;
  if (!state.DC.elements) state.DC.elements = [];
  const el = { id: uid(), nom: n, rubrique: gv('f2') || 'mobilier', statut: gv('f3') || 'a_sourcer', description: gv('f4'), dimensions: gv('f5'), quantite: gv('f6') || 1, couleur: gv('f7'), matiere: gv('f8'), tags: gv('f9'), scene: gv('f10'), role: gv('f11'), dateJeu: gv('f12'), continuity: gv('f13'), loueurId: gv('f14'), coutLocation: gv('f15'), coutReel: gv('f16'), dateDepart: gv('f17'), dateRetour: gv('f18'), photos: [] };

  if (!state.PENDING_FILES.length) { state.DC.elements.push(el); sv(); state.M = null; state.PENDING_FILES = []; R(); return; }

  let uploaded = 0;
  const total = state.PENDING_FILES.length;
  const status = document.getElementById('upload-status');
  if (status) status.innerHTML = `<div class="upload-progress"><span>Upload 0/${total}</span><div class="upload-bar"><div class="upload-fill" style="width:0%"></div></div></div>`;

  for (const file of state.PENDING_FILES) {
    uploadPhoto(file).then(url => {
      if (url) el.photos.push(url);
      uploaded++;
      if (status) status.innerHTML = `<div class="upload-progress"><span>Upload ${uploaded}/${total}</span><div class="upload-bar"><div class="upload-fill" style="width:${Math.round(uploaded / total * 100)}%"></div></div></div>`;
      if (uploaded === total) { state.DC.elements.push(el); sv(); state.M = null; state.PENDING_FILES = []; R(); }
    });
  }
};
window.updateEl = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); const E = state.EDIT; E.nom = n; E.rubrique = gv('f2'); E.statut = gv('f3'); E.description = gv('f4'); E.dimensions = gv('f5'); E.quantite = gv('f6'); E.couleur = gv('f7'); E.matiere = gv('f8'); E.tags = gv('f9'); E.scene = gv('f10'); E.role = gv('f11'); E.dateJeu = gv('f12'); E.continuity = gv('f13'); E.loueurId = gv('f14'); E.coutLocation = gv('f15'); E.coutReel = gv('f16'); E.dateDepart = gv('f17'); E.dateRetour = gv('f18'); sv(); state.M = null; R(); };
window.dupEl = function() { if (!confirm('Dupliquer ?')) return; const c = JSON.parse(JSON.stringify(state.EL)); c.id = uid(); c.nom += ' (copie)'; state.DC.elements.push(c); sv(); alert('Dupliqué !'); R(); };
window.delE = function() { if (!confirm('Supprimer ?')) return; state.DC.elements = state.DC.elements.filter(e => e.id !== state.EL.id); sv(); state.EL = null; state.V = 'dec'; R(); };

// ── CRUD: Loueurs ──
window.saveLo = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); state.D.loueurs.push({ id: uid(), nom: n, specialite: gv('f2'), contact: gv('f3'), telephone: gv('f4'), email: gv('f5'), adresse: gv('f6'), notes: gv('f7') }); sv(); state.M = null; R(); };
window.updateLo = function() { const n = gv('f1'); if (!n) return alert('Nom requis'); state.EDIT.nom = n; state.EDIT.specialite = gv('f2'); state.EDIT.contact = gv('f3'); state.EDIT.telephone = gv('f4'); state.EDIT.email = gv('f5'); state.EDIT.adresse = gv('f6'); state.EDIT.notes = gv('f7'); sv(); state.M = null; R(); };
window.delL = function() { if (!confirm('Supprimer ?')) return; state.D.loueurs = state.D.loueurs.filter(l => l.id !== state.LO.id); sv(); state.LO = null; state.V = 'lou'; R(); };

// ── CRUD: Dépenses ──
window.saveDep = function() { const m = gv('f4'); if (!m) return alert('Montant requis'); state.D.depenses.push({ id: uid(), projetId: state.P ? state.P.id : null, type: gv('f1'), description: gv('f2'), estime: parseFloat(gv('f3')) || 0, montant: parseFloat(m), date: gv('f5'), fournisseur: gv('f6') }); sv(); state.M = null; R(); };
window.updateDep = function() { const m = gv('f4'); if (!m) return alert('Montant requis'); state.EDIT.type = gv('f1'); state.EDIT.description = gv('f2'); state.EDIT.estime = parseFloat(gv('f3')) || 0; state.EDIT.montant = parseFloat(m); state.EDIT.date = gv('f5'); state.EDIT.fournisseur = gv('f6'); sv(); state.M = null; R(); };
window.delDep = function() { if (!confirm('Supprimer ?')) return; state.D.depenses = state.D.depenses.filter(d => d.id !== state.EDIT.id); sv(); state.M = null; R(); };
window.editDep = function(id) { state.EDIT = state.D.depenses.find(d => d.id === id) || null; state.M = 'edit_depense'; R(); };

// ── Init ──
if (state.CODE) {
  if (!HAS_FIREBASE && state.CODE !== 'LOCAL') state.CODE = 'LOCAL';
  subscribeToProject(state.CODE, R);
} else {
  R();
}
