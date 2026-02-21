// src/useFirestore.js
// All Firestore reads/writes in one place. Falls back to localStorage if offline.

import { useState, useEffect } from 'react';
import {
  collection, getDocs, addDoc, updateDoc,
  doc, onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Generic localStorage helpers ────────────────────────────────────────────
const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ─── useCollection — real-time listener with localStorage fallback ────────────
export const useCollection = (collectionName) => {
  const [data, setData]     = useState(() => lsGet(collectionName, []));
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let unsub;
    try {
      const q = query(collection(db, collectionName));
      unsub = onSnapshot(q,
        (snap) => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setData(docs);
          lsSet(collectionName, docs);   // update localStorage cache
          setLoading(false);
        },
        (err) => {
          console.warn(`Firestore offline for ${collectionName}, using localStorage`, err);
          setError(err.message);
          setLoading(false);
          // data already set from localStorage initial state above
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    return () => unsub?.();
  }, [collectionName]);

  return { data, loading, error };
};

// ─── addDocument — add to Firestore + update localStorage cache ───────────────
export const addDocument = async (collectionName, data) => {
  const payload = { ...data, createdAt: serverTimestamp() };
  try {
    const ref = await addDoc(collection(db, collectionName), payload);
    // Update localStorage cache
    const cached = lsGet(collectionName, []);
    lsSet(collectionName, [...cached, { id: ref.id, ...data }]);
    return ref.id;
  } catch (err) {
    // Offline fallback — save only to localStorage
    console.warn('Firestore write failed, saving to localStorage only', err);
    const cached = lsGet(collectionName, []);
    const tempId = `local_${Date.now()}`;
    lsSet(collectionName, [...cached, { id: tempId, ...data, _offline: true }]);
    return tempId;
  }
};

// ─── updateDocument — update a Firestore doc + localStorage cache ─────────────
export const updateDocument = async (collectionName, docId, updates) => {
  try {
    await updateDoc(doc(db, collectionName, docId), updates);
    // Update localStorage cache
    const cached = lsGet(collectionName, []);
    lsSet(collectionName, cached.map(item => item.id === docId ? { ...item, ...updates } : item));
  } catch (err) {
    console.warn('Firestore update failed, updating localStorage only', err);
    const cached = lsGet(collectionName, []);
    lsSet(collectionName, cached.map(item => item.id === docId ? { ...item, ...updates } : item));
  }
};

