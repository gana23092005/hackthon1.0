// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, UserCircle, Users, Bell, LogOut,
  Download, FileText, TrendingUp, BarChart2,
  BriefcaseBusiness, CheckCircle2, Clock, Star,
  Briefcase, BookOpen, Calendar, ExternalLink, X, Loader,
  Zap, Target, Award, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useCollection, addDocument, updateDocument } from './useFirestore';
import { seedAll } from './seedFirestore';
import CriteriaEngine from './CriteriaEngine';
import PlacementBot from './PlacementBot';
import LoginPage from './LoginPage';
import ProfileMenu from './ProfileMenu';

const STATUS_STEPS = ['Applied', 'Aptitude', 'Interview', 'Selected'];
const STATUS_COLOR = {
  Applied:   'bg-sky-100 text-sky-700',
  Aptitude:  'bg-amber-100 text-amber-700',
  Interview: 'bg-violet-100 text-violet-700',
  Selected:  'bg-emerald-100 text-emerald-700',
};

const Badge = ({ label, color }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</span>
);

const SectionTitle = ({ icon: Icon, title, color = 'text-stone-700' }) => (
  <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
    <Icon size={20} className={color} /> {title}
  </h3>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-3">
      <Loader size={26} className="animate-spin text-stone-400" />
      <p className="text-xs text-stone-400 font-medium">Fetching live data...</p>
    </div>
  </div>
);

const KPICard = ({ label, value, color, bg, border, icon: Icon, suffix = '' }) => (
  <div className={`${bg} ${border} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-3xl font-black ${color}`}>{value}{suffix}</p>
        <p className="text-sm text-stone-500 font-semibold mt-1">{label}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bg} ${border} border-2 flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
    </div>
  </div>
);

const App = () => {
  const { user, profile } = useAuth();
  if (!user || !profile) return <LoginPage />;
  return <Dashboard />;
};

const Dashboard = () => {
  const { profile, logout } = useAuth();
  const defaultTab = profile.role === 'TPO' ? 'TPO' : profile.role === 'alumni' ? 'Alumni' : 'Student';
  const [activeRole, setActiveRole] = useState(defaultTab);
  const [filters, setFilters] = useState({ minCgpa: 6.0, maxBacklogs: 0, branch: 'All' });

  const { data: students,        loading: loadingStudents  } = useCollection('students');
  const { data: drives,          loading: loadingDrives    } = useCollection('drives');
  const { data: alumniList,      loading: loadingAlumni    } = useCollection('alumni');
  const { data: referrals,       loading: loadingReferrals } = useCollection('referrals');
  const { data: mentorshipSlots, loading: loadingSlots     } = useCollection('mentorshipSlots');

  useEffect(() => { seedAll(); }, []);

  const [resumeData, setResumeData] = useState({
    name: profile.name || '', email: profile.email || '',
    phone: '', branch: profile.branch || '',
    cgpa: profile.cgpa || '', marks10: '', marks12: '',
    skills: (profile.skills || []).join(', '), projects: '', github: '',
  });
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [showPostForm, setShowPostForm]       = useState(false);
  const [newReferral, setNewReferral]         = useState({ company: '', role: '', package: '', skills: '' });
  const [referralSuccess, setReferralSuccess] = useState(false);

  const filteredStudents = useMemo(() => students.filter(s =>
    s.cgpa >= filters.minCgpa &&
    s.backlogs <= filters.maxBacklogs &&
    (filters.branch === 'All' || s.branch === filters.branch)
  ), [students, filters]);

  const eligibleDrives = useMemo(() => drives.filter(d =>
    (profile.cgpa || 0) >= d.minCgpa &&
    (profile.backlogs || 0) <= d.maxBacklogs &&
    (d.branches?.includes('All') || d.branches?.includes(profile.branch))
  ), [drives, profile]);

  const resumeSkills = resumeData.skills
    ? resumeData.skills.split(',').map(s => s.trim().toLowerCase())
    : (profile.skills || []).map(s => s.toLowerCase());

  const skillGaps = useMemo(() => drives.flatMap(drive => {
    const missing = (drive.reqSkills || []).filter(sk => !resumeSkills.includes(sk.toLowerCase()));
    return missing.length ? [{ company: drive.company, role: drive.role, missingSkills: missing }] : [];
  }), [drives, resumeSkills]);

  const bookSlot = async (slot) => {
    if (slot.booked) return;
    await updateDocument('mentorshipSlots', slot.id, { booked: true, bookedBy: profile.email });
  };

  const postReferral = async () => {
    if (!newReferral.company || !newReferral.role) { alert('Please fill Company and Role.'); return; }
    await addDocument('referrals', {
      alumniName: profile.name, company: newReferral.company, role: newReferral.role,
      package: newReferral.package, skills: newReferral.skills.split(',').map(s => s.trim()),
      postedOn: new Date().toISOString().slice(0, 10), deadline: '2025-09-30',
    });
    setNewReferral({ company: '', role: '', package: '', skills: '' });
    setShowPostForm(false); setReferralSuccess(true);
    setTimeout(() => setReferralSuccess(false), 3000);
  };

  const generateResumePDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text(resumeData.name || 'Student Name', pageWidth / 2, 16, { align: 'center' });
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`${resumeData.email}  |  ${resumeData.phone}  |  ${resumeData.branch}`, pageWidth / 2, 26, { align: 'center' });
      doc.text(resumeData.github || '', pageWidth / 2, 33, { align: 'center' });
      doc.setTextColor(0, 0, 0); let y = 50;
      const sec = (t) => { doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59); doc.text(t,14,y); doc.setDrawColor(30,41,59); doc.line(14,y+1,pageWidth-14,y+1); doc.setTextColor(0,0,0); y+=9; };
      const body = (t) => { doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text(t,14,y); y+=7; };
      sec('Academic Details');
      body(`CGPA: ${resumeData.cgpa}  |  10th: ${resumeData.marks10}%  |  12th: ${resumeData.marks12}%`);
      body(`Branch: ${resumeData.branch}`); y += 4;
      sec('Technical Skills');
      const sl = doc.splitTextToSize(resumeData.skills || 'Not provided', pageWidth - 28);
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text(sl, 14, y); y += sl.length * 7 + 4;
      sec('Projects');
      const pl = doc.splitTextToSize(resumeData.projects || 'Not provided', pageWidth - 28);
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text(pl, 14, y);
      doc.setFontSize(8); doc.setTextColor(150,150,150);
      doc.text('Generated by PlacementPro — Intelligent Campus Recruitment Ecosystem', pageWidth/2, 285, { align:'center' });
      doc.save(`${resumeData.name || 'Resume'}_PlacementPro.pdf`);
      setResumeGenerated(true); setTimeout(() => setResumeGenerated(false), 4000);
    });
  };

  const applyToDrive = async (drive) => {
    const already = (profile.applications || []).find(a => a.driveId === drive.id);
    if (already) { alert('Already applied to this drive!'); return; }
    const updated = [...(profile.applications || []), { driveId: drive.id, company: drive.company, role: drive.role, status: 'Applied' }];
    await updateDocument('users', profile.uid, { applications: updated });
    alert(`✅ Applied to ${drive.company} successfully!`);
  };

  const SidebarItem = ({ icon: Icon, label, id, badge }) => (
    <button onClick={() => setActiveRole(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
        activeRole === id
          ? 'bg-stone-800 text-white shadow-md'
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
      }`}>
      <Icon size={18} className={activeRole === id ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-600'} />
      <span className="font-semibold text-sm flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeRole === id ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-600'}`}>{badge}</span>
      )}
    </button>
  );

  const pageTitles = {
    TPO: 'TPO Command Center',
    Student: 'Student Portal',
    Alumni: 'Alumni Connect',
    Analytics: 'Analytics & Insights',
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#f5f3ee' }}>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-stone-200 p-5 fixed h-full flex flex-col z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center shadow-md">
            <GraduationCap size={18} className="text-amber-400" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-stone-800 leading-none">PlacementPro</h1>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5">Career Ecosystem</p>
          </div>
        </div>

        {/* Profile chip */}
        <div className="mb-6 px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center font-black text-xs shadow">
              {profile.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-stone-700 truncate">{profile.name}</p>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">{profile.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest px-4 mb-3">Navigation</p>
          {profile.role === 'TPO' && (
            <>
              <SidebarItem icon={LayoutDashboard} label="Command Center" id="TPO" />
              <SidebarItem icon={BarChart2}       label="Analytics"       id="Analytics" />
            </>
          )}
          {profile.role === 'student' && (
            <SidebarItem icon={UserCircle} label="Student Portal" id="Student"
              badge={eligibleDrives.length > 0 ? eligibleDrives.length : null} />
          )}
          {profile.role === 'alumni' && (
            <SidebarItem icon={Users} label="Alumni Connect" id="Alumni" />
          )}
        </nav>

        {/* Live badge */}
        <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-xs text-emerald-700 font-semibold">Firebase Live Sync</p>
        </div>

        {/* Logout */}
        <div className="border-t border-stone-100 pt-3">
          <button onClick={() => { if(window.confirm('Are you sure you want to logout?')) logout(); }}
            className="flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 w-full rounded-xl font-semibold text-sm transition-all">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64">
        {/* Topbar */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-stone-800 tracking-tight">{pageTitles[activeRole]}</h2>
            <p className="text-xs text-stone-400 font-medium mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs text-stone-500 font-medium">All systems operational</span>
            </div>
            <ProfileMenu onThemeChange={(t) => console.log(t)} />
          </div>
        </header>

        <div className="p-8 space-y-6">

          {/* ── TPO ── */}
          {activeRole === 'TPO' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <KPICard label="Total Students" value={students.length}                                        color="text-stone-700"   bg="bg-stone-50"   border="border-stone-200" icon={Users}  />
                <KPICard label="Placed"         value={students.filter(s=>s.status==='Selected').length}       color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200" icon={Award}  />
                <KPICard label="Active Drives"  value={drives.length}                                          color="text-violet-700"  bg="bg-violet-50"  border="border-violet-200"  icon={Zap}    />
                <KPICard label="Placement Rate" value={students.length ? Math.round(students.filter(s=>s.status==='Selected').length/students.length*100) : 0} suffix="%" color="text-amber-700" bg="bg-amber-50" border="border-amber-200" icon={Target} />
              </div>

              <CriteriaEngine onFilterChange={setFilters} students={students} />

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-stone-700">Eligible Candidates</h3>
                    <span className="bg-stone-200 text-stone-700 text-xs font-black px-2.5 py-1 rounded-full">{filteredStudents.length} students</span>
                  </div>
                  <button onClick={() => alert('CSV Export triggered!')}
                    className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm">
                    <Download size={13} /> Export CSV
                  </button>
                </div>
                {loadingStudents ? <LoadingSpinner /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100">
                        <tr>
                          {['Name','Branch','CGPA','Backlogs','Status','Email'].map(h => (
                            <th key={h} className="px-5 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {filteredStudents.slice(0, 10).map(s => (
                          <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-stone-700">{s.name}</td>
                            <td className="px-5 py-3.5"><span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-0.5 rounded-md">{s.branch}</span></td>
                            <td className="px-5 py-3.5 font-black text-stone-800 font-mono">{s.cgpa}</td>
                            <td className="px-5 py-3.5 text-stone-500">{s.backlogs}</td>
                            <td className="px-5 py-3.5"><Badge label={s.status} color={STATUS_COLOR[s.status] || 'bg-stone-100 text-stone-600'} /></td>
                            <td className="px-5 py-3.5 text-stone-400 text-xs">{s.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredStudents.length > 10 && (
                      <div className="p-3 text-center text-xs text-stone-400 border-t">Showing 10 of {filteredStudents.length} students</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <SectionTitle icon={Calendar} title="Interview Scheduler" />
                {loadingDrives ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-3 gap-3">
                    {drives.map((drive, i) => (
                      <div key={i} onClick={() => alert(`Scheduling interviews for ${drive.company} on ${drive.date}`)}
                        className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer group">
                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-100 transition-all">
                          <span className="text-lg font-black text-stone-600 group-hover:text-amber-700">{drive.company?.[0]}</span>
                        </div>
                        <p className="text-sm font-bold text-stone-700">{drive.company}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{drive.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STUDENT ── */}
          {activeRole === 'Student' && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="bg-stone-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-stone-400 text-sm font-medium">Welcome back,</p>
                    <h3 className="text-2xl font-black mt-1 text-white">{profile.name} 👋</h3>
                    <p className="text-stone-400 text-sm mt-2">
                      {eligibleDrives.length} drives eligible · {skillGaps.length} skill gaps identified
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-amber-400">{profile.cgpa || '—'}</div>
                    <div className="text-stone-400 text-xs font-medium mt-1">Current CGPA</div>
                  </div>
                </div>
              </div>

              {/* Application Tracker */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <SectionTitle icon={CheckCircle2} title="My Application Tracker" color="text-emerald-600" />
                {(profile.applications || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Target size={22} className="text-stone-300" />
                    </div>
                    <p className="text-sm font-semibold text-stone-400">No applications yet</p>
                    <p className="text-xs text-stone-300 mt-1">Apply from the Live Feed below!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(profile.applications || []).map((app, idx) => {
                      const stepIdx = STATUS_STEPS.indexOf(app.status);
                      return (
                        <div key={idx} className="border border-stone-100 rounded-xl p-4 hover:border-amber-300 transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center font-black text-stone-600">{app.company?.[0]}</div>
                              <div>
                                <p className="font-bold text-stone-800">{app.company}</p>
                                <p className="text-xs text-stone-400">{app.role}</p>
                              </div>
                            </div>
                            <Badge label={app.status} color={STATUS_COLOR[app.status] || 'bg-stone-100 text-stone-600'} />
                          </div>
                          <div className="flex items-center">
                            {STATUS_STEPS.map((step, i) => (
                              <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stepIdx ? 'bg-stone-800 border-stone-800 text-amber-400' : 'bg-white border-stone-200 text-stone-300'}`}>
                                    {i < stepIdx ? '✓' : i + 1}
                                  </div>
                                  <span className={`text-[9px] mt-1 font-semibold ${i <= stepIdx ? 'text-stone-700' : 'text-stone-300'}`}>{step}</span>
                                </div>
                                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-4 ${i < stepIdx ? 'bg-stone-800' : 'bg-stone-200'}`} />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Skill Gap */}
              <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                <SectionTitle icon={TrendingUp} title="Skill Gap Intelligence" color="text-amber-600" />
                <p className="text-xs text-stone-400 mb-4 flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" /> Updates live as you edit skills in Resume Wizard below
                </p>
                {loadingDrives ? <LoadingSpinner /> : skillGaps.length === 0 ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <p className="text-sm text-emerald-700 font-semibold">Your resume matches all available drive requirements!</p>
                  </div>
                ) : skillGaps.map((gap, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm mb-3">
                    <p className="font-bold text-stone-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center text-amber-800 font-black text-xs">{gap.company?.[0]}</span>
                      {gap.company} — {gap.role}
                    </p>
                    <p className="text-stone-500 mt-2 flex items-center gap-1 flex-wrap">Missing:
                      {gap.missingSkills.map(sk => (
                        <span key={sk} className="inline-block bg-rose-100 text-rose-600 font-bold text-xs px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                    </p>
                    <p className="text-xs text-amber-700 mt-2 font-medium">→ Add these to your resume skills to become eligible</p>
                  </div>
                ))}
              </div>

              {/* Downloads */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <SectionTitle icon={Download} title="My Downloads" />
                {!resumeData.name ? (
                  <div className="text-center py-6">
                    <FileText size={28} className="text-stone-200 mx-auto mb-2" />
                    <p className="text-sm text-stone-400">No downloads yet. Generate your resume below!</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center">
                        <FileText size={18} className="text-stone-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-700">{resumeData.name}_PlacementPro.pdf</p>
                        <p className="text-xs text-stone-400">Resume · Generated today</p>
                      </div>
                    </div>
                    <button onClick={() => generateResumePDF()}
                      className="bg-stone-800 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-stone-700 transition-all flex items-center gap-1.5">
                      <Download size={13} /> Download
                    </button>
                  </div>
                )}
              </div>

              {/* Resume Wizard */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <SectionTitle icon={FileText} title="Resume Wizard" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label:'Full Name',          key:'name',    type:'text'   },
                    { label:'Email',              key:'email',   type:'email'  },
                    { label:'Phone',              key:'phone',   type:'text'   },
                    { label:'Branch',             key:'branch',  type:'text'   },
                    { label:'CGPA',               key:'cgpa',    type:'number' },
                    { label:'10th Marks (%)',     key:'marks10', type:'number' },
                    { label:'12th Marks (%)',     key:'marks12', type:'number' },
                    { label:'GitHub / Portfolio', key:'github',  type:'text'   },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-stone-400 mb-1.5">{f.label}</label>
                      <input type={f.type} value={resumeData[f.key]}
                        onChange={e => setResumeData(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all bg-stone-50" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">Technical Skills (comma separated) — powers Skill Gap Analysis ⚡</label>
                    <input type="text" value={resumeData.skills}
                      onChange={e => setResumeData(p => ({ ...p, skills: e.target.value }))}
                      placeholder="e.g. React, Python, SQL, Java, Node.js"
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all bg-stone-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">Project Description</label>
                    <textarea rows={3} value={resumeData.projects}
                      onChange={e => setResumeData(p => ({ ...p, projects: e.target.value }))}
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all resize-none bg-stone-50" />
                  </div>
                </div>
                <button onClick={() => generateResumePDF()}
                  className="mt-5 bg-stone-800 hover:bg-stone-700 text-white w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg">
                  <FileText size={17} /> Generate Standardized College PDF
                </button>
                {resumeGenerated && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2"><CheckCircle2 size={17} /> Resume generated for {resumeData.name}!</div>
                    <button onClick={() => generateResumePDF()} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1">
                      <Download size={12} /> Download Again
                    </button>
                  </div>
                )}
              </div>

              {/* Live Drive Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                    Live Drive Feed
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">{eligibleDrives.length} eligible drives</span>
                </div>
                {loadingDrives ? <LoadingSpinner /> : eligibleDrives.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-sm">No eligible drives right now.</div>
                ) : eligibleDrives.map(drive => (
                  <div key={drive.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center hover:border-amber-400 hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center font-black text-stone-600 text-lg">{drive.company?.[0]}</div>
                      <div>
                        <h4 className="font-bold text-stone-800">{drive.company}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{drive.role} · {drive.package} · Min CGPA {drive.minCgpa}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {(drive.reqSkills || []).map(sk => (
                            <span key={sk} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${resumeSkills.includes(sk.toLowerCase()) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>{sk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => applyToDrive(drive)}
                      className="bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-stone-900 transition-all shadow-sm">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALUMNI ── */}
          {activeRole === 'Alumni' && (
            <div className="space-y-6">
              {referralSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={20} /> Referral posted to Firebase! ✅
                </div>
              )}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <SectionTitle icon={Users} title="Alumni Network" color="text-violet-600" />
                {loadingAlumni ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {alumniList.map(a => (
                      <div key={a.id} className="border border-stone-100 rounded-2xl p-4 text-center hover:border-violet-300 hover:bg-violet-50/40 transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 font-black flex items-center justify-center mx-auto mb-2 text-lg">{a.avatar}</div>
                        <p className="font-bold text-stone-800 text-sm">{a.name}</p>
                        <p className="text-xs text-stone-400">{a.role}</p>
                        <p className="text-xs font-semibold text-violet-600 mt-0.5">{a.company}</p>
                        <div className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${a.available ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                          {a.available ? '● Available' : '● Busy'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <SectionTitle icon={Briefcase} title="Job Referral Board" color="text-violet-600" />
                  <button onClick={() => setShowPostForm(f => !f)}
                    className="bg-stone-800 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-stone-700 transition-all flex items-center gap-1.5">
                    {showPostForm ? <><X size={13} /> Cancel</> : '+ Post Referral'}
                  </button>
                </div>
                {showPostForm && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-4 space-y-3">
                    <p className="text-sm font-bold text-stone-700">New Job Referral → saves to Firebase</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[['Company *','company'],['Role *','role'],['Package','package'],['Skills (comma separated)','skills']].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold text-stone-500 block mb-1">{label}</label>
                          <input type="text" value={newReferral[key]}
                            onChange={e => setNewReferral(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full border border-stone-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-100 bg-white" />
                        </div>
                      ))}
                    </div>
                    <button onClick={postReferral}
                      className="bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-stone-700 transition-all">
                      Submit to Database
                    </button>
                  </div>
                )}
                {loadingReferrals ? <LoadingSpinner /> : (
                  <div className="space-y-3">
                    {referrals.map(ref => (
                      <div key={ref.id} className="border border-stone-100 rounded-2xl p-4 flex justify-between items-start hover:border-violet-300 transition-all">
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 bg-stone-100 text-stone-600 font-black rounded-xl flex items-center justify-center">{ref.company?.[0]}</div>
                          <div>
                            <p className="font-bold text-stone-800">{ref.company} — {ref.role}</p>
                            <p className="text-xs text-stone-400 mt-0.5">By {ref.alumniName} · {ref.package} · Deadline: {ref.deadline}</p>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {(Array.isArray(ref.skills) ? ref.skills : []).map(sk => (
                                <span key={sk} className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full">{sk}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => alert(`Applying to ${ref.company}!`)}
                          className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-violet-600 transition-all flex items-center gap-1">
                          <ExternalLink size={11} /> Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <SectionTitle icon={BookOpen} title="Mentorship & Mock Interview Slots" color="text-teal-600" />
                {loadingSlots ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mentorshipSlots.map(slot => (
                      <div key={slot.id} className={`border rounded-2xl p-4 flex justify-between items-center transition-all ${slot.booked ? 'bg-stone-50 border-stone-100 opacity-70' : 'border-stone-100 hover:border-teal-300 hover:bg-teal-50/30'}`}>
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{slot.alumniName}</p>
                          <p className="text-xs text-teal-600 font-semibold">{slot.type}</p>
                          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Clock size={10} /> {slot.date} at {slot.time} · {slot.duration}</p>
                          {slot.booked && slot.bookedBy && <p className="text-[10px] text-stone-400 mt-0.5">Booked by: {slot.bookedBy}</p>}
                        </div>
                        <button onClick={() => bookSlot(slot)} disabled={slot.booked}
                          className={`text-xs px-3 py-2 rounded-xl font-bold transition-all ${slot.booked ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'}`}>
                          {slot.booked ? '✓ Booked' : 'Book Slot'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeRole === 'Analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard label="Total Students" value={students.length}                                        color="text-stone-700"   bg="bg-stone-50"   border="border-stone-200"   icon={Users}  />
                <KPICard label="Selected"       value={students.filter(s=>s.status==='Selected').length}       color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200" icon={Award}  />
                <KPICard label="In Interview"   value={students.filter(s=>s.status==='Interview').length}      color="text-violet-700"  bg="bg-violet-50"  border="border-violet-200"  icon={Target} />
                <KPICard label="Active Drives"  value={drives.length}                                          color="text-amber-700"   bg="bg-amber-50"   border="border-amber-200"   icon={Zap}    />
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <SectionTitle icon={BarChart2} title="Placement Rate by Branch" />
                {['CSE','MCA','IT'].map(branch => {
                  const total  = students.filter(s => s.branch === branch).length;
                  const placed = students.filter(s => s.branch === branch && s.status === 'Selected').length;
                  const pct    = total ? Math.round((placed / total) * 100) : 0;
                  return (
                    <div key={branch} className="mb-5">
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-stone-700 font-bold">{branch}</span>
                        <span className="text-stone-400">{placed}/{total} placed <span className="text-stone-800 font-black">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-stone-800 h-3 rounded-full transition-all duration-700" style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                  <SectionTitle icon={Star} title="CGPA Distribution" color="text-amber-500" />
                  <div className="grid grid-cols-2 gap-3">
                    {[['6–7',6,7],['7–8',7,8],['8–9',8,9],['9–10',9,10]].map(([label,lo,hi]) => {
                      const count = students.filter(s => s.cgpa >= lo && s.cgpa < hi).length;
                      return (
                        <div key={label} className="text-center bg-amber-50 rounded-2xl p-4 border border-amber-100">
                          <p className="text-2xl font-black text-amber-700">{count}</p>
                          <p className="text-xs font-semibold text-stone-500 mt-1">CGPA {label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                  <SectionTitle icon={CheckCircle2} title="Application Funnel" color="text-emerald-600" />
                  <div className="space-y-4">
                    {STATUS_STEPS.map(status => {
                      const count = students.filter(s => s.status === status).length;
                      const pct   = students.length ? Math.round(count/students.length*100) : 0;
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span className="text-stone-600">{status}</span>
                            <span className="text-stone-400">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2.5">
                            <div className="bg-stone-700 h-2.5 rounded-full transition-all" style={{ width:`${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <PlacementBot />
    </div>
  );
};

export default App;
