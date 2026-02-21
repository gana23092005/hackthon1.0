// src/ProfileMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, LogOut, Settings, Bell,
  ChevronDown, Edit2, Save, X, CheckCircle2, Palette
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { updateDocument } from './useFirestore';

const THEMES = [
  { id: 'blue',   label: 'Blue',   color: 'bg-blue-600'   },
  { id: 'green',  label: 'Green',  color: 'bg-green-600'  },
  { id: 'purple', label: 'Purple', color: 'bg-purple-600' },
  { id: 'red',    label: 'Red',    color: 'bg-red-600'    },
];

const NOTIFICATIONS = [
  { id: 1, text: 'TCS Digital drive opens on Aug 10',     time: '2 hrs ago',  unread: true  },
  { id: 2, text: 'Google SDE-1 drive added',              time: '5 hrs ago',  unread: true  },
  { id: 3, text: 'Your application status updated',       time: '1 day ago',  unread: false },
  { id: 4, text: 'New mentorship slot available',         time: '2 days ago', unread: false },
];

const ProfileMenu = ({ onThemeChange }) => {
  const { profile, logout } = useAuth();
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState('profile');  // profile | notifications | settings
  const [editing, setEditing]     = useState(false);
  const [editData, setEditData]   = useState({
    name:   profile?.name  || '',
    phone:  profile?.phone || '',
    branch: profile?.branch || '',
    cgpa:   profile?.cgpa  || '',
  });
  const [saved, setSaved]         = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const menuRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveProfile = async () => {
    await updateDocument('users', profile.uid, editData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const handleTheme = (themeId) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 hover:bg-slate-100 rounded-xl px-2 py-1 transition-all"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
            {profile?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b bg-blue-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow">
                {profile?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-black text-slate-800">{profile?.name}</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'profile',       icon: User,     label: 'Profile'  },
              { id: 'notifications', icon: Bell,     label: `Notifs${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
              { id: 'settings',      icon: Palette,  label: 'Theme'    },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  tab === t.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}>
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="p-4 space-y-3">
              {saved && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs font-bold">
                  <CheckCircle2 size={14} /> Profile saved successfully!
                </div>
              )}
              {[
                { label: 'Full Name', key: 'name',   icon: User  },
                { label: 'Phone',     key: 'phone',  icon: Phone },
                { label: 'Branch',    key: 'branch', icon: Mail  },
                { label: 'CGPA',      key: 'cgpa',   icon: Mail  },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</label>
                  {editing ? (
                    <input type="text" value={editData[f.key]}
                      onChange={e => setEditData(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-1.5 text-sm mt-0.5 outline-none focus:ring-2 focus:ring-blue-100" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{profile?.[f.key] || '—'}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Login ID</label>
                <p className="text-sm font-mono text-slate-500 mt-0.5 break-all">{profile?.email}</p>
              </div>
              <div className="flex gap-2 pt-2">
                {editing ? (
                  <>
                    <button onClick={saveProfile}
                      className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-1">
                      <Save size={13} /> Save
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="flex-1 bg-slate-100 text-slate-600 text-xs py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center justify-center gap-1">
                      <X size={13} /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="flex-1 bg-slate-100 text-slate-600 text-xs py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center justify-center gap-1">
                    <Edit2 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-blue-600 font-bold hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${n.unread ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                      <div>
                        <p className={`text-xs ${n.unread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {tab === 'settings' && (
            <div className="p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Choose Theme Color</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => handleTheme(t.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      selectedTheme === t.id ? 'border-slate-400' : 'border-transparent'
                    }`}>
                    <div className={`w-8 h-8 rounded-full ${t.color}`} />
                    <span className="text-[10px] font-bold text-slate-500">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account</p>
                <p className="text-xs text-slate-500 mb-1"><span className="font-bold">Login ID:</span> {profile?.email}</p>
                <p className="text-xs text-slate-500 mb-1"><span className="font-bold">Role:</span> {profile?.role}</p>
                <p className="text-xs text-slate-500"><span className="font-bold">Joined:</span> {profile?.createdAt?.slice(0, 10)}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t p-3">
            <button
              onClick={() => { if(window.confirm('Are you sure you want to logout?')) logout(); }}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold text-sm transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
