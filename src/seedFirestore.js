// src/seedFirestore.js
// ─────────────────────────────────────────────────────────────────────────────
// Run this ONCE to populate your Firestore database with initial data.
// Import and call seedAll() from your App.jsx temporarily, then remove it.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const skillPool = ['React', 'Node.js', 'Python', 'SQL', 'Java', 'PowerBI', 'Data Structures', 'Communication', 'C++', 'MongoDB'];

const studentsData = Array.from({ length: 20 }, (_, i) => ({
  id: `student_${i + 1}`,
  name: `Student ${i + 1}`,
  email: `student${i + 1}@college.edu`,
  cgpa: parseFloat((Math.random() * (10 - 6) + 6).toFixed(2)),
  backlogs: Math.floor(Math.random() * 2),
  branch: ['CSE', 'MCA', 'IT'][Math.floor(Math.random() * 3)],
  skills: skillPool.slice(0, Math.floor(Math.random() * 4) + 2),
  status: ['Applied', 'Aptitude', 'Interview', 'Selected'][Math.floor(Math.random() * 4)],
  marks10: parseFloat((Math.random() * 30 + 70).toFixed(1)),
  marks12: parseFloat((Math.random() * 35 + 65).toFixed(1)),
  projects: ['Portfolio Website', 'Expense Tracker', 'Chat App', 'ML Model'][Math.floor(Math.random() * 4)],
  phone: `98${Math.floor(Math.random() * 90000000 + 10000000)}`,
  role: 'student',
}));

const drivesData = [
  { id: 'drive_1', company: 'TCS Digital',  role: 'SDE',       package: '7.5 LPA',  minCgpa: 7.0, maxBacklogs: 0, branches: ['CSE', 'MCA'], reqSkills: ['Java', 'SQL'],               date: '2025-08-10' },
  { id: 'drive_2', company: 'Google',        role: 'SDE-1',     package: '32 LPA',   minCgpa: 8.5, maxBacklogs: 0, branches: ['CSE', 'IT'],  reqSkills: ['Python', 'Data Structures'], date: '2025-08-18' },
  { id: 'drive_3', company: 'Accenture',     role: 'Associate', package: '6.5 LPA',  minCgpa: 6.5, maxBacklogs: 1, branches: ['All'],         reqSkills: ['Communication', 'SQL'],     date: '2025-08-22' },
  { id: 'drive_4', company: 'Infosys',       role: 'Analyst',   package: '5.5 LPA',  minCgpa: 6.0, maxBacklogs: 1, branches: ['All'],         reqSkills: ['Python', 'SQL'],            date: '2025-09-01' },
];

const alumniData = [
  { id: 'alumni_1', name: 'Priya Sharma', batch: '2022', company: 'Google',    role: 'SDE-2',           avatar: 'PS', available: true,  email: 'priya@alumni.edu' },
  { id: 'alumni_2', name: 'Arjun Mehta',  batch: '2021', company: 'Microsoft', role: 'Senior Engineer',  avatar: 'AM', available: true,  email: 'arjun@alumni.edu' },
  { id: 'alumni_3', name: 'Divya Nair',   batch: '2023', company: 'Accenture', role: 'Analyst',          avatar: 'DN', available: false, email: 'divya@alumni.edu' },
  { id: 'alumni_4', name: 'Rohan Verma',  batch: '2020', company: 'Amazon',    role: 'SDE-3',            avatar: 'RV', available: true,  email: 'rohan@alumni.edu' },
];

const referralsData = [
  { id: 'ref_1', alumniId: 'alumni_1', alumniName: 'Priya Sharma', company: 'Google',    role: 'SDE Intern',      package: '2 LPA/month', skills: ['Python', 'Data Structures'], postedOn: '2025-07-20', deadline: '2025-08-05' },
  { id: 'ref_2', alumniId: 'alumni_2', alumniName: 'Arjun Mehta',  company: 'Microsoft', role: 'Cloud Associate',  package: '18 LPA',      skills: ['Azure', 'SQL'],              postedOn: '2025-07-22', deadline: '2025-08-10' },
  { id: 'ref_3', alumniId: 'alumni_4', alumniName: 'Rohan Verma',  company: 'Amazon',    role: 'SDE-1',            package: '24 LPA',      skills: ['Java', 'Data Structures'],   postedOn: '2025-07-25', deadline: '2025-08-15' },
];

const mentorshipData = [
  { id: 'slot_1', alumniId: 'alumni_1', alumniName: 'Priya Sharma', type: 'Mock Interview', date: '2025-08-03', time: '4:00 PM', duration: '45 min', booked: false, bookedBy: null },
  { id: 'slot_2', alumniId: 'alumni_1', alumniName: 'Priya Sharma', type: 'Resume Review',  date: '2025-08-05', time: '5:00 PM', duration: '30 min', booked: false, bookedBy: null },
  { id: 'slot_3', alumniId: 'alumni_2', alumniName: 'Arjun Mehta',  type: 'Mock Interview', date: '2025-08-04', time: '6:00 PM', duration: '60 min', booked: false, bookedBy: null },
  { id: 'slot_4', alumniId: 'alumni_4', alumniName: 'Rohan Verma',  type: 'Career Guidance',date: '2025-08-06', time: '3:00 PM', duration: '30 min', booked: false, bookedBy: null },
];

// Seeds a collection only if it's empty (safe to call multiple times)
const seedCollection = async (collectionName, data) => {
  const snap = await getDocs(collection(db, collectionName));
  if (!snap.empty) { console.log(`⏭ ${collectionName} already seeded`); return; }
  for (const item of data) {
    await setDoc(doc(db, collectionName, item.id), item);
  }
  console.log(`✅ Seeded ${collectionName} (${data.length} docs)`);
};

export const seedAll = async () => {
  console.log('🌱 Seeding Firestore...');
  await seedCollection('students',         studentsData);
  await seedCollection('drives',           drivesData);
  await seedCollection('alumni',           alumniData);
  await seedCollection('referrals',        referralsData);
  await seedCollection('mentorshipSlots',  mentorshipData);
  console.log('🎉 Seeding complete!');
};

