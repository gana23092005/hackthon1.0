// src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            localStorage.setItem(`profile_${firebaseUser.uid}`, JSON.stringify(data));
          }
        } catch {
          const cached = localStorage.getItem(`profile_${firebaseUser.uid}`);
          if (cached) setProfile(JSON.parse(cached));
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (email, password, name, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = {
      uid: cred.user.uid, name, email, role,
      cgpa: role === 'student' ? 7.5 : null,
      branch: role === 'student' ? 'MCA' : null,
      backlogs: role === 'student' ? 0 : null,
      skills: role === 'student' ? ['React', 'SQL'] : [],
      applications: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userProfile);
    if (role === 'student') {
  await setDoc(doc(db, 'students', cred.user.uid), userProfile);
}
    localStorage.setItem(`profile_${cred.user.uid}`, JSON.stringify(userProfile));
    setProfile(userProfile);
    return cred;
  };

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
