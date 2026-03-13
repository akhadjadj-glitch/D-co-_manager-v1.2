// ============================================
// firebase.js — Firebase Config & Sync
// ============================================

import { state } from './store.js';
import { uid, fileToDataUrl } from './utils.js';

// ── Firebase Config — REMPLACEZ PAR VOS VALEURS ──
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

export let HAS_FIREBASE = false;
let db = null;
let storage = null;

function hasRealConfig() {
  return firebaseConfig && firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith('VOTRE_') &&
    firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('VOTRE_');
}

export function initFirebase() {
  try {
    if (window.firebase && hasRealConfig()) {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      storage = firebase.storage();
      HAS_FIREBASE = true;
      db.enablePersistence().catch(err => console.log('Persistence error:', err));
    }
  } catch (err) {
    console.log('Firebase indisponible, mode local', err);
    HAS_FIREBASE = false;
  }
}

// ── Local storage fallback ──
export function loadLocalData() {
  try {
    return JSON.parse(localStorage.getItem('decorpro_local_data') || '{"projets":[],"loueurs":[],"depenses":[]}');
  } catch {
    return { projets: [], loueurs: [], depenses: [] };
  }
}

export function saveLocalData(data) {
  localStorage.setItem('decorpro_local_data', JSON.stringify(data || state.D || { projets: [], loueurs: [], depenses: [] }));
}

// ── Firebase sync ──
export function subscribeToProject(code, onUpdate) {
  if (!HAS_FIREBASE) {
    state.SYNCING = false;
    state.D = loadLocalData();
    state.CODE = code || 'LOCAL';
    onUpdate();
    return;
  }

  if (state.UNSUB) state.UNSUB();
  state.SYNCING = true;
  onUpdate();

  state.UNSUB = db.collection('projects').doc(code).onSnapshot(
    (doc) => {
      state.SYNCING = false;
      if (doc.exists) {
        const data = doc.data();
        state.D.projets = data.projets || [];
        state.D.loueurs = data.loueurs || [];
        state.D.depenses = data.depenses || [];

        // Re-bind references
        if (state.P) {
          const pid = state.P.id;
          state.P = state.D.projets.find(p => p.id === pid) || null;
        }
        if (state.DC && state.P && state.P.decors) {
          const did = state.DC.id;
          state.DC = state.P.decors.find(d => d.id === did) || null;
        }
        if (state.EL && state.DC && state.DC.elements) {
          const eid = state.EL.id;
          state.EL = state.DC.elements.find(e => e.id === eid) || null;
        }
        onUpdate();
      }
    },
    (err) => {
      console.error('Firestore error:', err);
      state.SYNCING = false;
      onUpdate();
    }
  );
}

export function saveToFirebase(onUpdate) {
  if (!HAS_FIREBASE) { saveLocalData(state.D); state.SYNCING = false; return; }
  if (!state.CODE) return;
  state.SYNCING = true;
  onUpdate();

  db.collection('projects').doc(state.CODE).set({
    projets: state.D.projets,
    loueurs: state.D.loueurs,
    depenses: state.D.depenses,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    state.SYNCING = false;
    onUpdate();
  }).catch((err) => {
    console.error('Save error:', err);
    state.SYNCING = false;
    onUpdate();
  });
}

export function createFirebaseProject(onUpdate) {
  if (!HAS_FIREBASE) return Promise.resolve();
  return db.collection('projects').doc(state.CODE).set({
    projets: [], loueurs: [], depenses: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

export function checkProjectExists(code) {
  if (!HAS_FIREBASE) return Promise.resolve(false);
  return db.collection('projects').doc(code).get().then(doc => doc.exists);
}

// ── Photo upload ──
export function uploadPhoto(file, onProgress) {
  if (!HAS_FIREBASE || !state.CODE) {
    return fileToDataUrl(file);
  }

  return new Promise((resolve) => {
    const path = 'projects/' + state.CODE + '/photos/' + uid() + '_' + file.name;
    const ref = storage.ref(path);
    const task = ref.put(file);
    task.on('state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(pct);
      },
      (err) => { console.error('Upload error:', err); resolve(null); },
      () => { task.snapshot.ref.getDownloadURL().then(url => resolve(url)); }
    );
  });
}
