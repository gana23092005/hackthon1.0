// ─── STUDENTS ────────────────────────────────────────────────────────────────
const skillPool = ['React', 'Node.js', 'Python', 'SQL', 'Java', 'PowerBI', 'Data Structures', 'Communication', 'C++', 'MongoDB'];

export const students = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  email: `student${i + 1}@college.edu`,
  cgpa: parseFloat((Math.random() * (10 - 6) + 6).toFixed(2)),
  backlogs: Math.floor(Math.random() * 2),
  branch: ['CSE', 'MCA', 'IT'][Math.floor(Math.random() * 3)],
  skills: skillPool.slice(0, Math.floor(Math.random() * 4) + 2),
  status: ['Applied', 'Aptitude', 'Interview', 'Selected'][Math.floor(Math.random() * 4)],
  marks10: parseFloat((Math.random() * (100 - 70) + 70).toFixed(1)),
  marks12: parseFloat((Math.random() * (100 - 65) + 65).toFixed(1)),
  projects: ['Portfolio Website', 'Expense Tracker', 'Chat App', 'ML Model'][Math.floor(Math.random() * 4)],
  phone: `98${Math.floor(Math.random() * 90000000 + 10000000)}`,
  appliedDrives: [1, 2, 3].slice(0, Math.floor(Math.random() * 3) + 1),
}));

// Current logged-in student (Student 1 profile)
export const currentStudent = {
  id: 1,
  name: 'Gana R.',
  email: 'gana.r@college.edu',
  cgpa: 7.8,
  backlogs: 0,
  branch: 'MCA',
  skills: ['React', 'Node.js', 'Python', 'SQL'],
  marks10: 88.4,
  marks12: 81.2,
  projects: 'Expense Tracker App',
  phone: '9876543210',
  applications: [
    { driveId: 1, company: 'TCS Digital', role: 'SDE', status: 'Interview' },
    { driveId: 3, company: 'Accenture', role: 'Associate', status: 'Applied' },
  ],
};

// ─── DRIVES ──────────────────────────────────────────────────────────────────
export const upcomingDrives = [
  { id: 1, company: 'TCS Digital',  role: 'SDE',       package: '7.5 LPA',  minCgpa: 7.0, maxBacklogs: 0, branches: ['CSE', 'MCA'], reqSkills: ['Java', 'SQL'],               date: '2025-08-10' },
  { id: 2, company: 'Google',       role: 'SDE-1',     package: '32 LPA',   minCgpa: 8.5, maxBacklogs: 0, branches: ['CSE', 'IT'],  reqSkills: ['Python', 'Data Structures'], date: '2025-08-18' },
  { id: 3, company: 'Accenture',    role: 'Associate', package: '6.5 LPA',  minCgpa: 6.5, maxBacklogs: 1, branches: ['All'],         reqSkills: ['Communication', 'SQL'],     date: '2025-08-22' },
  { id: 4, company: 'Infosys',      role: 'Analyst',   package: '5.5 LPA',  minCgpa: 6.0, maxBacklogs: 1, branches: ['All'],         reqSkills: ['Python', 'SQL'],            date: '2025-09-01' },
];

// ─── ALUMNI ──────────────────────────────────────────────────────────────────
export const alumni = [
  { id: 1, name: 'Priya Sharma',   batch: '2022', company: 'Google',     role: 'SDE-2',          avatar: 'PS', available: true  },
  { id: 2, name: 'Arjun Mehta',    batch: '2021', company: 'Microsoft',  role: 'Senior Engineer', avatar: 'AM', available: true  },
  { id: 3, name: 'Divya Nair',     batch: '2023', company: 'Accenture',  role: 'Analyst',         avatar: 'DN', available: false },
  { id: 4, name: 'Rohan Verma',    batch: '2020', company: 'Amazon',     role: 'SDE-3',           avatar: 'RV', available: true  },
];

export const referrals = [
  { id: 1, alumniId: 1, alumniName: 'Priya Sharma', company: 'Google',    role: 'SDE Intern',      package: '2 LPA/month', skills: ['Python', 'Data Structures'], postedOn: '2025-07-20', deadline: '2025-08-05' },
  { id: 2, alumniId: 2, alumniName: 'Arjun Mehta',  company: 'Microsoft', role: 'Cloud Associate', package: '18 LPA',      skills: ['Azure', 'SQL'],              postedOn: '2025-07-22', deadline: '2025-08-10' },
  { id: 3, alumniId: 4, alumniName: 'Rohan Verma',  company: 'Amazon',    role: 'SDE-1',           package: '24 LPA',      skills: ['Java', 'Data Structures'],   postedOn: '2025-07-25', deadline: '2025-08-15' },
];

export const mentorshipSlots = [
  { id: 1, alumniId: 1, alumniName: 'Priya Sharma', type: 'Mock Interview', date: '2025-08-03', time: '4:00 PM', duration: '45 min', booked: false },
  { id: 2, alumniId: 1, alumniName: 'Priya Sharma', type: 'Resume Review',  date: '2025-08-05', time: '5:00 PM', duration: '30 min', booked: true  },
  { id: 3, alumniId: 2, alumniName: 'Arjun Mehta',  type: 'Mock Interview', date: '2025-08-04', time: '6:00 PM', duration: '60 min', booked: false },
  { id: 4, alumniId: 4, alumniName: 'Rohan Verma',  type: 'Career Guidance',date: '2025-08-06', time: '3:00 PM', duration: '30 min', booked: false },
];

// ─── PLACEMENT BOT QA ────────────────────────────────────────────────────────
export const botQA = [
  { keywords: ['cutoff', 'cgpa', 'minimum'],         answer: 'Cutoffs vary by company. TCS Digital requires 7.0 CGPA, Google requires 8.5, and Accenture requires 6.5. Check the Live Feed for full details.' },
  { keywords: ['interview', 'when', 'schedule', 'date'], answer: 'TCS Digital interviews are on Aug 10, Google on Aug 18, and Accenture on Aug 22. Your personal schedule is in the Application Tracker.' },
  { keywords: ['venue', 'location', 'where'],        answer: 'All drives are held in the Main Seminar Hall (Block A, 2nd Floor) unless notified otherwise. Check your email for any last-minute changes.' },
  { keywords: ['apply', 'how', 'register'],          answer: 'Go to the Student Portal → Live Feed → click "Apply Now" on any eligible drive. You must meet the CGPA and backlog criteria to apply.' },
  { keywords: ['resume', 'cv'],                      answer: 'Use the Resume Wizard in the Student Portal to generate a college-branded PDF resume instantly. Fill in your skills, marks, and project details.' },
  { keywords: ['backlog', 'arrear'],                 answer: 'Most companies allow 0 backlogs. Accenture and Infosys allow 1 active backlog. Clear your backlogs before the drive date to stay eligible.' },
  { keywords: ['result', 'selected', 'status'],      answer: 'Check your Application Tracker in the Student Portal. Statuses update in real-time: Applied → Aptitude → Interview → Selected.' },
  { keywords: ['hello', 'hi', 'hey'],                answer: 'Hi! 👋 I\'m PlacementBot, your 24/7 career assistant. Ask me about cutoffs, interview dates, venues, how to apply, or anything placement-related!' },
];
