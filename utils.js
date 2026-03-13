// ============================================
// utils.js — Fonctions utilitaires
// ============================================

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export function fd(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
}

export function fm(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
}

export function money(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export function gv(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

export function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
