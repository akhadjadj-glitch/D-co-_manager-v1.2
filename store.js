// ============================================
// store.js — State & Data Constants
// ============================================

// ── Rubriques ──
export const RUB = [
  { id: 'mobilier',     n: 'Mobilier',      i: 'sofa',       emoji: '🪑', c: '#6366f1' },
  { id: 'accessoires',  n: 'Accessoires',    i: 'masks',      emoji: '🎭', c: '#ec4899' },
  { id: 'regie',        n: 'Régie',          i: 'building',   emoji: '🏢', c: '#14b8a6' },
  { id: 'luminaires',   n: 'Luminaires',     i: 'lightbulb',  emoji: '💡', c: '#f59e0b' },
  { id: 'deco',         n: 'Déco',           i: 'frame',      emoji: '🖼️', c: '#8b5cf6' },
  { id: 'textiles',     n: 'Textiles',       i: 'scissors',   emoji: '🧵', c: '#ef4444' },
  { id: 'graphiques',   n: 'Graphiques',     i: 'clipboard',  emoji: '📋', c: '#06b6d4' },
  { id: 'consommables', n: 'Consommables',   i: 'package',    emoji: '📦', c: '#64748b' },
];

// ── Statuts éléments ──
export const STAT = [
  { id: 'a_sourcer',    l: 'À sourcer',   c: '#64748b' },
  { id: 'en_recherche', l: 'En recherche', c: '#f59e0b' },
  { id: 'valide',       l: 'Validé',       c: '#3b82f6' },
  { id: 'reserve',      l: 'Réservé',      c: '#6366f1' },
  { id: 'loue',         l: 'Loué',         c: '#ec4899' },
  { id: 'livre',        l: 'Livré',        c: '#14b8a6' },
  { id: 'installe',     l: 'Installé',     c: '#10b981' },
  { id: 'restitue',     l: 'Restitué',     c: '#22c55e' },
];

// ── Statuts décors ──
export const STATD = [
  { id: 'a_preparer',   l: 'À préparer',   c: '#64748b' },
  { id: 'en_cours',     l: 'En cours',      c: '#f59e0b' },
  { id: 'pret',         l: 'Prêt',          c: '#10b981' },
  { id: 'en_tournage',  l: 'En tournage',   c: '#6366f1' },
  { id: 'termine',      l: 'Terminé',       c: '#22c55e' },
];

// ── Types projets ──
export const TPROJ = [
  { id: 'film',  l: 'Film',  i: '🎬' },
  { id: 'serie', l: 'Série', i: '📺' },
  { id: 'pub',   l: 'Pub',   i: '📢' },
  { id: 'clip',  l: 'Clip',  i: '🎵' },
  { id: 'autre', l: 'Autre', i: '📁' },
];

// ── Types dépenses ──
export const TDEP = [
  { id: 'location',     l: 'Location' },
  { id: 'achat',        l: 'Achat' },
  { id: 'transport',    l: 'Transport' },
  { id: 'fabrication',  l: 'Fabrication' },
  { id: 'autre',        l: 'Autre' },
];

// ── Helpers lookup ──
export function gs(id)  { return STAT.find(s => s.id === id) || STAT[0]; }
export function gsd(id) { return STATD.find(s => s.id === id) || STATD[0]; }
export function gr(id)  { return RUB.find(r => r.id === id) || null; }
export function gt(id)  { return TPROJ.find(t => t.id === id) || TPROJ[0]; }

// ── Application State ──
export const state = {
  CODE: localStorage.getItem('dp_code') || null,
  D: { projets: [], loueurs: [], depenses: [] },
  V: 'home',        // current view
  P: null,           // current project
  DC: null,          // current decor
  EL: null,          // current element
  LO: null,          // current loueur
  RB: null,          // current rubrique id
  M: null,           // current modal
  MN: false,         // menu open
  TB: 'rub',         // tab in decor view
  VW: null,          // viewer open
  VWC: null,         // viewer collection
  VWI: 0,            // viewer index
  SQ: '',            // accessoires search
  GSQ: '',           // global search
  EDIT: null,        // editing object
  MORE: false,       // show more fields
  RTL: 'all',        // rent tab
  LTAB: 'join',      // login tab
  ONLINE: navigator.onLine,
  SYNCING: false,
  UNSUB: null,
  PENDING_FILES: [],
};

export function gl(id) {
  return state.D.loueurs.find(l => l.id === id) || null;
}

// ── Computed helpers ──
export function isRentedElement(e) {
  if (!e) return false;
  return !!(e.loueurId || e.coutLocation || e.coutReel || e.dateDepart || e.dateRetour ||
    e.statut === 'loue' || e.statut === 'reserve' || e.statut === 'livre' || e.statut === 'restitue');
}

export function getRentItems() {
  const items = [];
  for (const p of state.D.projets) {
    if (!p.decors) continue;
    for (const d of p.decors) {
      if (!d.elements) continue;
      for (const e of d.elements) {
        if (isRentedElement(e)) items.push({ e, d, p, l: e.loueurId ? gl(e.loueurId) : null });
      }
    }
  }
  return items;
}

export function getAlerts() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const a = { urgents: [], retards: [], nonPrets: [], aujourdhui: [], demain: [] };

  for (const p of state.D.projets) {
    if (!p.decors) continue;
    for (const d of p.decors) {
      if (!d.elements) continue;
      for (const e of d.elements) {
        if (e.urgent) a.urgents.push({ e, d, p });
        if (e.dateJeu) {
          const dj = new Date(e.dateJeu); dj.setHours(0, 0, 0, 0);
          if (dj.getTime() === today.getTime()) a.aujourdhui.push({ e, d, p });
          else if (dj.getTime() === tomorrow.getTime()) a.demain.push({ e, d, p });
          if (dj <= tomorrow && e.statut !== 'installe' && e.statut !== 'livre') a.nonPrets.push({ e, d, p });
        }
        if (e.dateRetour) {
          const dr = new Date(e.dateRetour); dr.setHours(0, 0, 0, 0);
          if (dr < today && e.statut !== 'restitue') a.retards.push({ e, d, p });
        }
      }
    }
  }
  return a;
}

export function search(q) {
  if (!q || q.length < 2) return [];
  q = q.toLowerCase();
  const r = [];
  for (const p of state.D.projets) {
    if (p.nom.toLowerCase().includes(q)) r.push({ t: 'projet', item: p });
    if (p.decors) for (const d of p.decors) {
      if (d.nom.toLowerCase().includes(q)) r.push({ t: 'decor', item: d, p });
      if (d.elements) for (const e of d.elements) {
        if (e.nom.toLowerCase().includes(q) || (e.tags && e.tags.toLowerCase().includes(q)))
          r.push({ t: 'element', item: e, d, p });
      }
    }
  }
  for (const l of state.D.loueurs) {
    if (l.nom.toLowerCase().includes(q)) r.push({ t: 'loueur', item: l });
  }
  return r.slice(0, 15);
}

export function getDecorPortfolioGroups() {
  const groups = [];
  for (const r of RUB) {
    const arr = [];
    if (state.DC && state.DC.elements) {
      for (const e of state.DC.elements) {
        if (e.rubrique === r.id && e.photos && e.photos.length) {
          for (const ph of e.photos) arr.push({ data: ph, nom: e.nom, rubrique: r.n });
        }
      }
    }
    if (arr.length) groups.push({ rubrique: r, photos: arr });
  }
  return groups;
}
