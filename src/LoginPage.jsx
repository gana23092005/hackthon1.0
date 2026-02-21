// src/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';

const ROLES = [
  { id: 'TPO',     label: 'TPO Admin',  emoji: '🎓', desc: 'Manage drives & students'   },
  { id: 'student', label: 'Student',    emoji: '📚', desc: 'Apply & track applications' },
  { id: 'alumni',  label: 'Alumni',     emoji: '🏆', desc: 'Mentor & post referrals'    },
];

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i, size: Math.random() * 4 + 2,
  x: Math.random() * 100, y: Math.random() * 100,
  duration: Math.random() * 10 + 8, delay: Math.random() * 5,
}));

const LoginPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode]         = useState('login');
  const [role, setRole]         = useState('student');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'register' && !name) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name, role);
    } catch (err) {
      setError(
        err.code === 'auth/user-not-found'       ? 'No account found with this email.' :
        err.code === 'auth/wrong-password'        ? 'Incorrect password.' :
        err.code === 'auth/email-already-in-use' ? 'Email already registered. Please login.' :
        err.code === 'auth/weak-password'         ? 'Password must be at least 6 characters.' :
        err.code === 'auth/invalid-credential'    ? 'Invalid email or password.' :
        err.code === 'auth/invalid-email'         ? 'Please enter a valid email.' :
        'Something went wrong. Please try again.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b4b 45%, #0a0a1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden', padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes floatUp { 0%{transform:translateY(100vh) scale(0);opacity:0} 10%{opacity:1} 90%{opacity:0.6} 100%{transform:translateY(-100px) scale(1);opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes borderPulse { 0%,100%{border-color:rgba(124,58,237,0.3)} 50%{border-color:rgba(124,58,237,0.8)} }
        .particle { position:absolute; border-radius:50%; pointer-events:none; animation:floatUp linear infinite; }
        .card-animate { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .input-glow { transition:all 0.3s; }
        .input-glow:focus { border-color:rgba(124,58,237,0.8) !important; box-shadow:0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.1) !important; background:rgba(124,58,237,0.08) !important; }
        .role-card { transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); cursor:pointer; }
        .role-card:hover { transform:translateY(-4px) scale(1.02); }
        .submit-btn { transition:all 0.3s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 12px 40px rgba(124,58,237,0.6) !important; }
        .submit-btn:active:not(:disabled) { transform:translateY(-1px); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .tab-pill { transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .tab-pill:hover { color:white !important; }
        .feature-tag { animation: glow 3s ease infinite; }
      `}</style>

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, bottom: '-20px',
          background: `rgba(${p.id % 2 === 0 ? '124,58,237' : '37,99,235'},${0.2 + Math.random() * 0.3})`,
          animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
        }} />
      ))}

      {/* Background orbs */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', top:'-200px', left:'-200px', animation:'glow 5s ease infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', bottom:'-150px', right:'-150px', animation:'glow 5s ease infinite 2.5s', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', top:'40%', right:'10%', animation:'glow 4s ease infinite 1s', pointerEvents:'none' }} />

      {/* Left side branding — visible on wider screens */}
      <div style={{
        display:'none', flexDirection:'column', justifyContent:'center',
        paddingRight:60, maxWidth:400,
        opacity: mounted ? 1 : 0, transition:'opacity 0.8s ease 0.3s',
      }} className="left-panel">
      </div>

      {/* Main Card */}
      <div className={mounted ? 'card-animate' : ''} style={{
        width:'100%', maxWidth:460,
        background:'rgba(255,255,255,0.04)',
        backdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:28, padding:'40px 36px',
        position:'relative', zIndex:10,
        boxShadow:'0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        opacity: mounted ? 1 : 0,
      }}>

        {/* Top accent line */}
        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:2, background:'linear-gradient(90deg, transparent, #7c3aed, #2563eb, transparent)', borderRadius:2 }} />

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:72, height:72, borderRadius:22,
            background:'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            marginBottom:18, boxShadow:'0 12px 32px rgba(124,58,237,0.5)',
            position:'relative',
          }}>
            <span style={{ fontSize:32 }}>🎓</span>
            <div style={{ position:'absolute', inset:-2, borderRadius:24, background:'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(37,99,235,0.5))', zIndex:-1, filter:'blur(8px)' }} />
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, color:'white', margin:'0 0 6px', letterSpacing:-1.5 }}>
            PlacementPro
          </h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:0, fontWeight:400, letterSpacing:0.3 }}>
            Intelligent Campus Recruitment Ecosystem
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:'rgba(0,0,0,0.3)', borderRadius:14, padding:4, marginBottom:28, border:'1px solid rgba(255,255,255,0.06)' }}>
          {[{id:'login',label:'Sign In'},{id:'register',label:'Create Account'}].map(m => (
            <button key={m.id} className="tab-pill" onClick={() => { setMode(m.id); setError(''); }} style={{
              flex:1, padding:'11px 0', borderRadius:11, border:'none', cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
              background: mode === m.id ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
              color: mode === m.id ? 'white' : 'rgba(255,255,255,0.35)',
              boxShadow: mode === m.id ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Role selector */}
        {mode === 'register' && (
          <div style={{ marginBottom:24 }}>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:12 }}>Select your role</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {ROLES.map(r => (
                <button key={r.id} className="role-card" onClick={() => setRole(r.id)} style={{
                  padding:'14px 8px', borderRadius:14,
                  border:`2px solid ${role === r.id ? 'rgba(124,58,237,0.8)' : 'rgba(255,255,255,0.07)'}`,
                  background: role === r.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                  cursor:'pointer', textAlign:'center',
                  boxShadow: role === r.id ? '0 4px 20px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{r.emoji}</div>
                  <p style={{ color: role === r.id ? '#c4b5fd' : 'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, margin:0 }}>{r.label}</p>
                  <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, margin:'3px 0 0', lineHeight:1.3 }}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'register' && (
            <div style={{ position:'relative' }}>
              <User size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', zIndex:1 }} />
              <input className="input-glow" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{
                width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:12, padding:'13px 16px 13px 42px', color:'white', fontSize:14,
                outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box',
              }} />
            </div>
          )}
          <div style={{ position:'relative' }}>
            <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', zIndex:1 }} />
            <input className="input-glow" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{
              width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:12, padding:'13px 16px 13px 42px', color:'white', fontSize:14,
              outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box',
            }} />
          </div>
          <div style={{ position:'relative' }}>
            <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', zIndex:1 }} />
            <input className="input-glow" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{
              width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:12, padding:'13px 16px 13px 42px', color:'white', fontSize:14,
              outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box',
            }} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, padding:'10px 14px' }}>
            <AlertCircle size={14} style={{ color:'#f87171', flexShrink:0 }} />
            <span style={{ color:'#fca5a5', fontSize:12, fontWeight:500 }}>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{
          marginTop:22, width:'100%', padding:'15px 0', borderRadius:14, border:'none',
          background:'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          color:'white', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow:'0 8px 24px rgba(124,58,237,0.4)',
          letterSpacing:0.3,
        }}>
          {loading
            ? <><Loader size={17} style={{ animation:'spin 1s linear infinite' }} /> Authenticating...</>
            : mode === 'login' ? '→ Sign in to PlacementPro' : '→ Create Your Account'}
        </button>

        {/* Feature tags */}
        <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:20, flexWrap:'wrap' }}>
          {['🔒 Firebase Auth', '☁️ Cloud Sync', '📱 PWA Ready'].map(tag => (
            <span key={tag} className="feature-tag" style={{
              color:'rgba(255,255,255,0.2)', fontSize:10, fontWeight:600, letterSpacing:0.5,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
