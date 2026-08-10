/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Upload, Search, Mail, Download, Trash2, ChevronRight, FileText, Book, FileCheck, Layers, Info, Instagram, Send, MessageCircle, ExternalLink, Calculator, Plus, X, Lock, Eye, EyeOff, User, LogOut, Key, Quote, PlusCircle, Flame, History, School, GraduationCap, Github, Moon, Sun, Sparkles } from 'lucide-react';
import { auth, db, storage } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { AIChatBot } from './components/AIChatBot';
import { ParallaxStars } from './components/ParallaxStars';
import { LightBeamButton } from './components/LightBeamButton';
import { CardSwap, Card } from './components/CardSwap';

// --- Types ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We throw a standardized error that the app can catch
  throw new Error(JSON.stringify(errInfo));
}

interface Material {
  id: string;
  title: string;
  description: string;
  branch: string;
  semester: string;
  type: string;
  file_url: string;
  storage_path: string;
  createdAt: any;
}

// --- Constants ---
const MATERIAL_TYPES = ['Notes', 'Syllabus', 'Model Paper', 'Lab Manual', 'Exam Time Table', 'Academic Calendar', 'Other'];
const BRANCHES = ['CSE', 'AI/ML', 'DS', 'ISE', 'ECE', 'MECH', 'CIVIL', 'First Year'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const QUOTES = [
  { text: "Engineering is the art of making things work.", author: "General Wisdom" },
  { text: "Science is about knowing; engineering is about doing.", author: "Henry Petroski" },
  { text: "Engineers turn dreams into reality.", author: "Hayao Miyazaki" },
  { text: "The best way to learn engineering is to solve real problems.", author: "Engineering Life" }
];

// --- Components ---

const ResourceSkeleton = () => (
  <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-3 animate-pulse shadow-sm">
    <div className="flex gap-2">
      <div className="h-4 w-12 bg-soft-bg rounded-full"></div>
      <div className="h-4 w-16 bg-soft-bg rounded-full"></div>
      <div className="h-4 w-14 bg-soft-bg rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-soft-bg rounded-md"></div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-soft-bg rounded"></div>
      <div className="h-3 w-5/6 bg-soft-bg rounded"></div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="h-8 w-24 bg-soft-bg rounded-md"></div>
      <div className="h-6 w-6 bg-soft-bg rounded-lg"></div>
    </div>
  </div>
);

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  materialTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  materialTitle: string 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 w-full max-w-sm border-red-500/30 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6">
          <Trash2 size={24} />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Confirm Erasure</h3>
        <p className="text-white/60 text-sm mb-8">
          Are you sure you want to permanently delete <span className="text-white font-bold">"{materialTitle}"</span>? This action cannot be reversed within the node network.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CursorTrail = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dotsRef = useRef<{ x: number; y: number }[]>(Array(20).fill({ x: 0, y: 0 }));
  const requestRef = useRef<number>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const COLORS = [
    '#38bdf8', // Cyber Cyan
    '#818cf8', // Indigo
    '#c084fc', // Purple
    '#f472b6', // Pink
    '#fb7185', // Rose
    '#fb923c', // Orange
    '#fbbf24', // Amber
    '#34d399', // Emerald
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pos = { x: e.clientX, y: e.clientY };
      setMousePos(pos);
      mousePosRef.current = pos;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const easing = 0.35;
      let x = mousePosRef.current.x;
      let y = mousePosRef.current.y;

      dotsRef.current = dotsRef.current.map((dot) => {
        const newX = dot.x + (x - dot.x) * easing;
        const newY = dot.y + (y - dot.y) * easing;
        x = newX;
        y = newY;
        return { x: newX, y: newY };
      });

      const dotElements = document.querySelectorAll('.cursor-dot');
      dotElements.forEach((el, i) => {
        const dot = dotsRef.current[i];
        if (dot && el instanceof HTMLElement) {
          el.style.left = `${dot.x}px`;
          el.style.top = `${dot.y}px`;
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[80]">
      {Array.from({ length: 20 }).map((_, i) => {
        const colorIndex = i;
        return (
          <div
            key={i}
            className="cursor-dot absolute rounded-full select-none"
            style={{
              width: `${16 - i * 0.7}px`,
              height: `${16 - i * 0.7}px`,
              opacity: 1 - i * 0.045,
              backgroundColor: COLORS[colorIndex % COLORS.length],
              boxShadow: `0 0 ${20 - i}px ${COLORS[colorIndex % COLORS.length]}88`,
              transform: 'translate(-50%, -50%)',
              filter: `blur(${i * 0.3}px)`,
              transition: 'background-color 0.3s ease',
              animation: `cursor-glow 2s infinite alternate ${i * 0.1}s`
            }}
          />
        );
      })}
      <style>{`
        @keyframes cursor-glow {
          from { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          to { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const QuoteSection = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-12 px-6 flex flex-col items-center text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="max-w-[600px] bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10"
        >
          <Quote size={24} className="text-brand-primary/40 mb-4 mx-auto" />
          <p className="text-lg text-main font-medium italic mb-2 select-none leading-relaxed">
            "{QUOTES[quoteIndex].text}"
          </p>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
            — {QUOTES[quoteIndex].author}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Section = ({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`glass-panel ${className}`}
    >
      {children}
    </motion.section>
  );
};

const AuthModal = ({ isOpen, onClose, setNotification }: { isOpen: boolean; onClose: () => void; setNotification: (n: { msg: string; type: 'success' | 'error' } | null) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminKey, setAdminKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    if (!email) {
      setNotification({ msg: 'Please enter your email address first!', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification({ msg: 'Password reset link sent to your email!', type: 'success' });
    } catch (err: any) {
      setNotification({ msg: err.message || 'Failed to send reset email', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setNotification({ msg: `Welcome back! Accessing ${role} portal...`, type: 'success' });
      } else {
        if (role === 'admin') {
          if (adminKey !== 'NCET_ADMIN_2026') {
            throw new Error('Invalid Admin Secret Key. Access denied.');
          }
          if (email !== '1nc24is008@ncetmail.com') {
            throw new Error('Unauthorized Email. Only the owner can register as an admin.');
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userPath = `users/${userCredential.user.uid}`;
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          displayName: fullName,
          role: role,
          createdAt: serverTimestamp()
        }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, userPath);
          throw err;
        });
        setNotification({ msg: `Account created! Welcome, ${role}.`, type: 'success' });
      }
      
      // Clear fields on success
      setEmail('');
      setPassword('');
      setFullName('');
      setAdminKey('');
      
      onClose();
    } catch (err: any) {
      setNotification({ msg: err.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel p-8 w-full max-w-md relative border border-border shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-dim hover:text-main transition-colors">
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center gap-4 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-2 shadow-sm">
            {role === 'admin' ? <Key size={28} /> : <User size={28} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-main uppercase tracking-tight">{isLogin ? 'Welcome Back' : 'Create Student ID'}</h2>
            <p className="text-dim text-[10px] uppercase tracking-widest font-black mt-1">
              Portal Access: <span className="text-brand-primary">{role === 'admin' ? 'Administrator' : 'NCET Student'}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-soft-bg rounded-xl mb-6 border border-border">
          <button 
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === 'student' ? 'bg-panel text-brand-primary shadow-sm' : 'text-dim hover:text-main'}`}
          >
            Student
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-panel text-brand-primary shadow-sm' : 'text-dim hover:text-main'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input 
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-soft-bg border border-border rounded-xl p-3.5 text-main outline-none focus:border-brand-primary transition-all text-sm placeholder:text-dim/40"
            />
          )}

          {role === 'admin' && !isLogin && (
            <div className="relative group">
              <input 
                type="password"
                placeholder="Admin Secret Key"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-3.5 text-brand-primary outline-none focus:border-brand-primary transition-all text-sm placeholder:text-brand-primary/40"
              />
              <Info size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/40" />
            </div>
          )}

          <input 
            type="email"
            placeholder="Official Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-soft-bg border border-border rounded-xl p-3.5 text-main outline-none focus:border-brand-primary transition-all text-sm placeholder:text-dim/40"
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-soft-bg border border-border rounded-xl p-3.5 text-main outline-none focus:border-brand-primary transition-all text-sm pr-10 placeholder:text-dim/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-main"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isLogin && (
            <div className="flex justify-end -mt-2">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] text-brand-primary hover:underline font-black uppercase tracking-widest"
              >
                Reset Access Path
              </button>
            </div>
          )}

          <LightBeamButton 
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Initializing Connection...' : (isLogin ? `Authorize ${role}` : 'Register Link')}
          </LightBeamButton>

          <p className="text-center text-[10px] text-dim mt-2 uppercase tracking-widest font-bold">
            {isLogin ? "New user?" : "Existing user?"}{' '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-primary hover:underline"
            >
              {isLogin ? 'Register Hub Link' : 'Return to Login'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const GPACalculator = ({ mode, setMode }: { mode: 'SGPA' | 'CGPA'; setMode: (m: 'SGPA' | 'CGPA') => void }) => {
  // SGPA State
  const [subjects, setSubjects] = useState([{ id: 1, credits: '', grade: '' }]);
  const [sgpaResult, setSgpaResult] = useState<number | null>(null);

  // CGPA State
  const [semesters, setSemesters] = useState([{ id: 1, sgpa: '' }]);
  const [cgpaResult, setCgpaResult] = useState<number | null>(null);

  const addSubject = () => setSubjects([...subjects, { id: Date.now(), credits: '', grade: '' }]);
  const removeSubject = (id: number) => setSubjects(subjects.filter(s => s.id !== id));
  
  const addSemester = () => setSemesters([...semesters, { id: Date.now(), sgpa: '' }]);
  const removeSemester = (id: number) => setSemesters(semesters.filter(s => s.id !== id));

  const calculateSGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach(s => {
      const c = parseFloat(s.credits);
      const g = parseFloat(s.grade);
      if (!isNaN(c) && !isNaN(g)) {
        totalCredits += c;
        totalPoints += c * g;
      }
    });
    setSgpaResult(totalCredits > 0 ? totalPoints / totalCredits : null);
  };

  const calculateCGPA = () => {
    let totalSgpa = 0;
    let count = 0;
    semesters.forEach(s => {
      const val = parseFloat(s.sgpa);
      if (!isNaN(val)) {
        totalSgpa += val;
        count++;
      }
    });
    setCgpaResult(count > 0 ? totalSgpa / count : null);
  };

  const downloadResult = () => {
    // Simulated PDF download
    const result = mode === 'SGPA' ? sgpaResult : cgpaResult;
    alert(`Generating official PDF result for your ${mode}: ${result?.toFixed(2)} Hub credits...`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 p-1 bg-soft-bg rounded-xl border border-border w-fit">
        <button 
          onClick={() => setMode('SGPA')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'SGPA' ? 'bg-brand-primary text-white shadow-lg' : 'text-dim hover:text-main'}`}
        >
          SGPA
        </button>
        <button 
          onClick={() => setMode('CGPA')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'CGPA' ? 'bg-brand-primary text-white shadow-lg' : 'text-dim hover:text-main'}`}
        >
          CGPA
        </button>
      </div>

      {mode === 'SGPA' ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_1fr_40px] gap-3 text-[10px] font-black text-dim uppercase tracking-widest px-2">
            <span>Credits</span>
            <span>Grade Points</span>
            <span></span>
          </div>
          {subjects.map((s, idx) => (
            <div key={s.id} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center">
              <input 
                type="number" 
                placeholder="e.g. 4"
                value={s.credits}
                onChange={(e) => {
                  const newSubjects = [...subjects];
                  newSubjects[idx].credits = e.target.value;
                  setSubjects(newSubjects);
                }}
                className="bg-soft-bg border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm shadow-sm"
              />
              <select 
                value={s.grade}
                onChange={(e) => {
                  const newSubjects = [...subjects];
                  newSubjects[idx].grade = e.target.value;
                  setSubjects(newSubjects);
                }}
                className="bg-soft-bg border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer shadow-sm"
              >
                <option value="">Grade</option>
                <option value="10">S/O (10)</option>
                <option value="9">A (9)</option>
                <option value="8">B (8)</option>
                <option value="7">C (7)</option>
                <option value="6">D (6)</option>
                <option value="4">E (4)</option>
                <option value="0">F (0)</option>
              </select>
              <button 
                onClick={() => removeSubject(s.id)}
                className="text-dim hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-3 mt-2">
            <button 
              onClick={addSubject}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-border text-dim text-xs font-black uppercase tracking-widest hover:bg-soft-bg transition-all"
            >
              <Plus size={14} /> Add Subject
            </button>
            <button 
              onClick={calculateSGPA}
              className="flex-1 bg-brand-primary text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20"
            >
              Calculate
            </button>
          </div>
          {sgpaResult !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-dim text-[10px] uppercase font-black tracking-widest mb-1">Authenticated SGPA</p>
                <h3 className="text-4xl font-black text-brand-primary tracking-tighter">{sgpaResult.toFixed(2)}</h3>
              </div>
              <button 
                onClick={downloadResult}
                className="p-4 rounded-xl bg-brand-primary text-white hover:brightness-110 transition-all shadow-xl shadow-brand-primary/30"
                title="Download Result Sheet"
              >
                <Download size={22} />
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_40px] gap-3 text-[10px] font-black text-dim uppercase tracking-widest px-2">
            <span>Semester SGPA</span>
            <span></span>
          </div>
          {semesters.map((s, idx) => (
            <div key={s.id} className="grid grid-cols-[1fr_40px] gap-3 items-center">
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g. 8.5"
                value={s.sgpa}
                onChange={(e) => {
                  const newSems = [...semesters];
                  newSems[idx].sgpa = e.target.value;
                  setSemesters(newSems);
                }}
                className="bg-soft-bg border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm shadow-sm"
              />
              <button 
                onClick={() => removeSemester(s.id)}
                className="text-dim hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-3 mt-2">
            <button 
              onClick={addSemester}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-border text-dim text-xs font-black uppercase tracking-widest hover:bg-soft-bg transition-all"
            >
              <Plus size={14} /> Add Semester
            </button>
            <button 
              onClick={calculateCGPA}
              className="flex-1 bg-brand-primary text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20"
            >
              Calculate
            </button>
          </div>
          {cgpaResult !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-dim text-[10px] uppercase font-black tracking-widest mb-1">Authenticated CGPA</p>
                <h3 className="text-4xl font-black text-brand-primary tracking-tighter">{cgpaResult.toFixed(2)}</h3>
              </div>
              <button 
                onClick={downloadResult}
                className="p-4 rounded-xl bg-brand-primary text-white hover:brightness-110 transition-all shadow-xl shadow-brand-primary/30"
                title="Download Result Sheet"
              >
                <Download size={22} />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', branch: '', semester: '', query: '' });
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [calcMode, setCalcMode] = useState<'SGPA' | 'CGPA'>('SGPA');
  const [showCalculator, setShowCalculator] = useState(false);
  const [browsingPath, setBrowsingPath] = useState<string[]>([]);
  const [selectedUploadType, setSelectedUploadType] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const [activeDiscover, setActiveDiscover] = useState<string | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  const getPastelStyles = (type: string) => {
    switch (type) {
      case 'Notes': return { 
        bg: 'bg-indigo-50/50 dark:bg-indigo-500/10', 
        text: 'text-indigo-600 dark:text-indigo-300', 
        border: 'border-indigo-100 dark:border-indigo-500/20' 
      };
      case 'Exam Time Table': return { 
        bg: 'bg-blue-50/50 dark:bg-blue-500/10', 
        text: 'text-blue-600 dark:text-blue-300', 
        border: 'border-blue-100 dark:border-blue-500/20' 
      };
      case 'Academic Calendar': return { 
        bg: 'bg-amber-50/50 dark:bg-amber-500/10', 
        text: 'text-amber-600 dark:text-amber-300', 
        border: 'border-amber-100 dark:border-amber-500/20' 
      };
      case 'Syllabus': return { 
        bg: 'bg-rose-50/50 dark:bg-rose-500/10', 
        text: 'text-rose-600 dark:text-rose-300', 
        border: 'border-rose-100 dark:border-rose-500/20' 
      };
      case 'Model Paper': return { 
        bg: 'bg-emerald-50/50 dark:bg-emerald-500/10', 
        text: 'text-emerald-600 dark:text-emerald-300', 
        border: 'border-emerald-100 dark:border-emerald-500/20' 
      };
      case 'Lab Manual': return { 
        bg: 'bg-teal-50/50 dark:bg-teal-500/10', 
        text: 'text-teal-600 dark:text-teal-300', 
        border: 'border-teal-100 dark:border-teal-500/20' 
      };
      default: return { 
        bg: 'bg-soft-bg', 
        text: 'text-dim', 
        border: 'border-border' 
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Simple admin check: if email matches the owner's
        const isMaster = user.email === '1nc24is008@ncetmail.com';
        setIsAdmin(isMaster);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    // 1. Real-time materials listener
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribeMaterials = onSnapshot(q, (snapshot) => {
      const mats: Material[] = [];
      snapshot.forEach((doc) => {
        mats.push({ id: doc.id, ...doc.data() } as Material);
      });
      setMaterials(mats);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials');
      setLoading(false);
    });

    return () => unsubscribeMaterials();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    let branch = formData.get('branch') as string;
    let semester = formData.get('semester') as string;

    if (type === 'Exam Time Table' || type === 'Academic Calendar') {
      branch = 'All';
      semester = 'All';
    }

    if (!file) {
      setNotification({ msg: 'Please select a file', type: 'error' });
      setUploading(false);
      return;
    }

    try {
      // 1. Upload file to Firebase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `materials/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      const path = 'materials';
      await addDoc(collection(db, path), {
        title,
        description,
        branch,
        semester,
        type,
        file_url: downloadURL,
        storage_path: storageRef.fullPath,
        createdAt: serverTimestamp(),
        uploaderUid: currentUser?.uid
      });
      
      setNotification({ msg: 'Material published to hub!', type: 'success' });
      form.reset();
      setSelectedUploadType('');
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes('permission-denied')) {
        setNotification({ msg: 'Permission Denied: Admin access required.', type: 'error' });
      } else {
        setNotification({ msg: 'Upload failed. Check console.', type: 'error' });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (mat: Material) => {
    if (!isAdmin) return;
    setDeletingMaterial(mat);
  };

  const confirmDelete = async () => {
    if (!deletingMaterial || !isAdmin) return;
    
    const matToDelete = deletingMaterial;
    setDeletingMaterial(null);

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'materials', matToDelete.id)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `materials/${matToDelete.id}`);
        throw err;
      });
      
      // 2. Delete from Storage
      if (matToDelete.storage_path) {
        const fileRef = ref(storage, matToDelete.storage_path);
        await deleteObject(fileRef);
      }
      
      setNotification({ msg: 'Record expunged from database.', type: 'success' });
    } catch (err) {
      console.error('Delete failed:', err);
      setNotification({ msg: 'Erasure cycle failed. System breach detected?', type: 'error' });
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSubmittingSuggestion(true);
    // Simulate API call
    setTimeout(() => {
      setNotification({ msg: 'Thank you! Your request has been sent to the admin.', type: 'success' });
      setSuggestion('');
      setSubmittingSuggestion(false);
    }, 1000);
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      m.description.toLowerCase().includes(filters.query.toLowerCase());
    
    return (
      matchesSearch &&
      (!filters.type || m.type === filters.type) &&
      (!filters.branch || m.branch === filters.branch || m.branch === 'All') &&
      (!filters.semester || m.semester === filters.semester || m.semester === 'All')
    );
  });

  return (
    <div className="min-h-screen font-sans selection:bg-brand-primary selection:text-white flex flex-col">
      <CursorTrail />

      {/* Global Theme Toggle (Right Side Top Corner below Login) - Compact Size */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="fixed top-[95px] right-10 z-[60] w-9 h-9 rounded-xl bg-panel border-r-2 border-brand-primary shadow-lg flex items-center justify-center text-dim-text hover:text-brand-primary transition-all transition-colors"
        title="Institutional Theme Protocol"
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </motion.button>

      <AuthModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        setNotification={setNotification}
      />

      <DeleteConfirmationModal 
        isOpen={!!deletingMaterial}
        onClose={() => setDeletingMaterial(null)}
        onConfirm={confirmDelete}
        materialTitle={deletingMaterial?.title || ''}
      />

      {/* Global Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-xl border font-bold text-sm shadow-2xl backdrop-blur-md flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {notification.type === 'success' ? <FileCheck size={18} /> : <Info size={18} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 w-full h-[80px] px-10 flex justify-between items-center glass-nav z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setBrowsingPath([]);
            }}
            className="text-2xl font-black text-main tracking-tighter uppercase hover:scale-105 transition-transform"
          >
            <span className="text-brand-primary">Digital</span>Hub
          </button>
          {isAdmin && (
            <span className="hidden sm:block text-[9px] bg-brand-primary text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md">
              ADMIN ACCESS
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Search', 'Calculator', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === 'Calculator') {
                  setShowCalculator(true);
                  setTimeout(() => {
                    const el = document.getElementById('calculator');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                } else {
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-main text-sm font-black hover:text-brand-primary transition-all uppercase tracking-wider"
            >
              {item}
            </button>
          ))}
          {currentUser ? (
            <div className="flex items-center gap-4 border-l border-border pl-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-main font-bold">{currentUser.displayName || 'Hub User'}</span>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isAdmin ? 'text-brand-primary' : 'text-dim'}`}>
                  {isAdmin ? 'Principal/Admin' : 'Verified Student'}
                </span>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 text-red-500 hover:bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
            >
              STUDENT LOGIN
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pt-[100px] pb-10 px-10 flex flex-col gap-8 max-w-[1700px] mx-auto w-full">
        
        {/* Top Section: Admin Banner + Hero (Full Width but constrained content) */}
        <div className="flex flex-col gap-8">
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-main uppercase tracking-tight">Admin Management</h3>
                  <p className="text-[10px] text-brand-primary/70 font-bold uppercase tracking-widest">Global Synchronization Active</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-main">{materials.length}</span>
                  <span className="text-[8px] text-dim uppercase tracking-tighter">Resources</span>
                </div>
                <div className="w-[1px] h-8 bg-border" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-brand-primary">Online</span>
                  <span className="text-[8px] text-dim uppercase tracking-tighter">Network Status</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hero + AI Grid */}
          <ParallaxStars className="rounded-[2.5rem] p-8 md:p-12 border border-border bg-panel/30 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center relative z-10">
              {/* Hero */}
              <section id="home" className="py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-brand-primary animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-dim text-[10px] uppercase tracking-[0.2em] font-bold">
                    {isAdmin ? 'Staff Operations' : 'Student Access Point'}
                  </span>
                </div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-5xl md:text-6xl font-bold gradient-text mb-4 leading-[1.1]"
                >
                  {isAdmin ? 'Manage Your Hub ⚙️' : 'Digital Study Hub ✨'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-dim text-lg leading-relaxed max-w-[420px]"
                >
                  {isAdmin 
                    ? "Your control center for the Digital Hub. Keep our community strong by uploading and managing the best study resources for every student."
                    : "Your all-in-one resource for NCET engineering. Access previous year question papers, high-quality notes, and lab manuals to help you succeed in every semester."
                  }
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-8 relative max-w-[480px] group"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary w-5 h-5 group-focus-within:scale-110 transition-transform" />
                  <input
                    type="text"
                    placeholder="Search for subjects, topics, or files..."
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    className="w-full bg-panel border border-border rounded-2xl py-5 pl-12 pr-40 text-main outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-xl shadow-brand-primary/5"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <LightBeamButton 
                      onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-2.5"
                    >
                      Search
                    </LightBeamButton>
                  </div>
                </motion.div>
              </section>

              {/* AI Assistant */}
              <div className="w-full">
                <AIChatBot />
              </div>
            </div>
          </ParallaxStars>
        </div>

        <div className="h-4" id="hub-content" />

        {/* Featured Showcase Section */}
        <div className="py-20 flex flex-col lg:flex-row items-center gap-16 overflow-visible">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
               <Sparkles size={14} className="text-brand-primary" />
               <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Featured NCET Resource</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-main leading-none">
              Streamlining Your <span className="text-brand-primary">Academics</span>
            </h2>
            <p className="text-dim text-lg leading-relaxed max-w-xl">
              Dive into our specialized toolkits for NCET engineering students. We focus on VTU syllabus precision, ensuring you have the exact resources needed for every internal and semester exam.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-main">2022+</span>
                <span className="text-[10px] text-dim font-bold uppercase tracking-widest">Scheme Ready</span>
              </div>
              <div className="w-[1px] h-12 bg-border"></div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-main">100%</span>
                <span className="text-[10px] text-dim font-bold uppercase tracking-widest">Syllabus Sync</span>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-[500px] h-[450px] flex items-center justify-center">
            <CardSwap
              width={420}
              height={320}
              cardDistance={35}
              verticalDistance={35}
              delay={5000}
              pauseOnHover={true}
              skewAmount={4}
            >
              {[
                {
                  title: "NCET Archive Hub",
                  desc: "Comprehensive database of VTU previous year question papers and model answers.",
                  img: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800&auto=format&fit=crop",
                  tag: "VTU-ARCHIVE"
                },
                {
                  title: "Laboratory Blueprint",
                  desc: "Digital laboratory manuals with verified code outputs for CSE, ISE, and ECE branches.",
                  img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
                  tag: "LAB-READY"
                },
                {
                  title: "Placement Strategy",
                  desc: "Technical interview roadmaps, aptitude modules, and company-specific coding grids.",
                  img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
                  tag: "CAREER-PRO"
                },
                {
                  title: "Premium Modules",
                  desc: "Condensed handwritten notes and faculty-vetted summaries for core engineering subjects.",
                  img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
                  tag: "STUDY-SYB"
                }
              ].map((item, idx) => (
                <Card key={idx} className="p-0 overflow-hidden group/card shadow-2xl shadow-black/20">
                  <div className="relative h-full w-full flex flex-col">
                    <div className="flex-1 overflow-hidden relative">
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-6 left-6 px-3 py-1 rounded-lg bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.tag}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-2xl font-black mb-2 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>

        {/* Lower Grid: Main Content (Left) + Sidebars (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* Left Column: Branches + Resources */}
          <div className="flex flex-col gap-8">
            {/* Browse Branches Section (Multi-level Navigation) */}
            <Section id="branches" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="section-title">
                <Book size={16} />
                <span>
                  {browsingPath.length === 0 ? 'Explore Branches' : 
                   browsingPath.length === 1 ? `Semester in ${browsingPath[0]}` :
                   `${browsingPath[0]} - ${browsingPath[1]}th Sem Materials`}
                </span>
              </div>
              {browsingPath.length > 0 && (
                <button 
                  onClick={() => setBrowsingPath(prev => prev.slice(0, -1))}
                  className="text-xs font-bold text-cyber-cyan hover:underline flex items-center gap-1"
                >
                  <ChevronRight size={12} className="rotate-180" /> Back
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {browsingPath.length === 0 && (
                <motion.div 
                  key="branches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                      {BRANCHES.map((branch) => (
                        <motion.button
                          key={branch}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBrowsingPath([branch])}
                          className="p-4 rounded-xl border border-border bg-panel text-sm font-black text-main hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                        >
                          {branch}
                        </motion.button>
                      ))}
                </motion.div>
              )}

              {browsingPath.length === 1 && (
                <motion.div 
                  key="semesters"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                      {SEMESTERS.map((sem) => (
                        <motion.button
                          key={sem}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBrowsingPath([browsingPath[0], sem])}
                          className="p-4 rounded-xl border border-border bg-panel text-sm font-black text-main hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                        >
                          {sem}{sem === '1' ? 'st' : sem === '2' ? 'nd' : sem === '3' ? 'rd' : 'th'} Sem
                        </motion.button>
                      ))}
                </motion.div>
              )}

              {browsingPath.length === 2 && (
                <motion.div 
                  key="listing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4"
                >
                  {materials.filter(m => 
                    (m.branch === browsingPath[0] || m.branch === 'All') && 
                    (m.semester === browsingPath[1] || m.semester === 'All')
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materials
                        .filter(m => 
                          (m.branch === browsingPath[0] || m.branch === 'All') && 
                          (m.semester === browsingPath[1] || m.semester === 'All')
                        )
                        .map(mat => {
                          const styles = getPastelStyles(mat.type);
                          return (
                            <div key={mat.id} className={`${styles.bg} border ${styles.border} rounded-xl overflow-hidden flex flex-col group hover:shadow-md transition-all`}>
                              <div className={`px-4 py-2 border-b ${styles.border} flex justify-between items-center bg-panel/50`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>{mat.type}</span>
                                <span className="text-[10px] text-dim font-medium">{mat.createdAt?.seconds ? new Date(mat.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                              </div>
                              <div className="p-4 flex flex-col gap-2">
                                <h4 className="text-sm font-bold text-main group-hover:text-brand-primary transition-colors">{mat.title}</h4>
                                <p className="text-xs text-dim line-clamp-1">{mat.description}</p>
                                <div className="flex justify-between items-center gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      if (currentUser) {
                                        window.open(mat.file_url, '_blank');
                                      } else {
                                        setIsLoginOpen(true);
                                        setNotification({ msg: 'Please Login to download study materials', type: 'error' });
                                      }
                                    }}
                                    className={`flex-1 ${styles.bg} ${styles.text} text-center py-2 rounded-lg text-xs font-bold hover:brightness-95 transition-all border ${styles.border}`}
                                  >
                                    Download
                                  </button>
                                  {isAdmin && (
                                    <button 
                                      onClick={() => handleDelete(mat)}
                                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                      <Layers className="mx-auto w-8 h-8 text-white/10 mb-2" />
                      <p className="text-sm text-white/30">No materials added for this semester yet.</p>
                      {isAdmin && (
                        <button 
                          onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                          className="mt-4 text-xs font-bold text-cyber-cyan hover:underline"
                        >
                          + Upload first material
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* Find Resources */}
          <Section id="search" className="p-6 flex flex-col">
            <div className="section-title mb-6">
              <Search size={16} />
              <span>Available Resources</span>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="w-full bg-soft-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-main outline-none focus:border-brand-primary transition-all shadow-sm placeholder:text-dim/40"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="flex-1 min-w-[120px] bg-panel border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                >
                  <option value="">All Types</option>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  className="flex-1 min-w-[120px] bg-panel border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                >
                  <option value="">All Branches</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="flex-1 min-w-[120px] bg-panel border border-border rounded-lg p-3 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}th Sem</option>)}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-dim uppercase font-black tracking-widest leading-none">Catalog</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-brand-primary">{filteredMaterials.length} Items Indexed</span>
                    <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse"></div>
                  </div>
                </div>
                
                {(filters.type || filters.branch || filters.semester || filters.query) && (
                  <button 
                    onClick={() => setFilters({ type: '', branch: '', semester: '', query: '' })}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                    title="Reset All Filters"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
              {loading ? (
                Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)
              ) : filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => (
                  <motion.div
                    key={mat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-panel border border-border rounded-xl overflow-hidden flex flex-col group hover:shadow-lg transition-all"
                  >
                    {(() => {
                      const styles = getPastelStyles(mat.type);
                      return (
                        <>
                          <div className={`px-4 py-2 border-b ${styles.border} flex justify-between items-center bg-panel/50 shadow-sm relative z-10`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${styles.text}`}>{mat.type}</span>
                            <div className="flex gap-2">
                              <span className="text-[8px] font-bold bg-panel/80 px-2 py-0.5 rounded-full text-dim border border-border">{mat.branch}</span>
                              <span className="text-[8px] font-bold bg-panel/80 px-2 py-0.5 rounded-full text-dim border border-border">{mat.semester}th Sem</span>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col gap-3">
                            <h4 className="text-base font-bold text-main group-hover:text-brand-primary transition-colors leading-snug">{mat.title}</h4>
                            <p className="text-xs text-dim line-clamp-2 h-8">{mat.description}</p>
                            
                            <div className="flex justify-between items-center mt-2">
                              <button
                                onClick={() => {
                                  if (currentUser) {
                                    window.open(mat.file_url, '_blank');
                                  } else {
                                    setIsLoginOpen(true);
                                    setNotification({ msg: 'Please Login to access materials', type: 'error' });
                                  }
                                }}
                                className={`flex-1 ${styles.bg} ${styles.text} py-2.5 rounded-lg font-black text-xs hover:brightness-95 transition-all flex items-center justify-center gap-2 border ${styles.border} shadow-sm`}
                              >
                                <Download size={14} /> DOWNLOAD PDF
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDelete(mat)}
                                  className="ml-2 p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Material"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                  <Layers className="mx-auto text-white/10 w-10 h-10 mb-2" />
                  <p className="text-white/40 text-sm">No materials found matching your criteria.</p>
                </div>
              )}
            </div>
          </Section>

          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Section id="calculator" className="p-6 relative">
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="section-title mb-6">
                  <Calculator size={16} />
                  <span>GPA Calculator</span>
                </div>
                <GPACalculator mode={calcMode} setMode={setCalcMode} />
              </Section>
            </motion.div>
          )}
        </div>

        {/* Right Column: Admin Upload + User Suggestions */}
        <div className="flex flex-col gap-8">
          {isAdmin ? (
            <Section id="upload" className="p-8 bg-panel border border-border shadow-xl shadow-brand-primary/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                  <PlusCircle size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-main font-black uppercase tracking-tight">Resource Management</span>
                  <span className="text-[9px] text-brand-primary uppercase tracking-widest font-black mt-1">Institutional Repository Control</span>
                </div>
              </div>
              
              <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Enter resource title (e.g. M1 Calculus Notes)"
                    className="w-full bg-soft-bg border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm"
                  />
                </div>

                <select
                  name="type"
                  required
                  value={selectedUploadType}
                  onChange={(e) => setSelectedUploadType(e.target.value)}
                  className="w-full bg-soft-bg border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                >
                  <option value="">Select Resource Type</option>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <div className="relative group">
                  <input
                    type="file"
                    name="file"
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-full bg-soft-bg border border-border rounded-xl p-4 text-dim text-sm text-center group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2">
                    <Download size={16} /> Choose PDF
                  </div>
                </div>
                
                {selectedUploadType !== 'Exam Time Table' && selectedUploadType !== 'Academic Calendar' && selectedUploadType !== '' && (
                  <>
                    <select
                      name="branch"
                      required
                      className="w-full bg-panel border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                    >
                      <option value="">Branch Allocation</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>

                    <select
                      name="semester"
                      required
                      className="w-full bg-panel border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm cursor-pointer hover:bg-panel-hover"
                    >
                      <option value="">Semester Level</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}th Sem</option>)}
                    </select>
                  </>
                )}

                {(selectedUploadType === 'Exam Time Table' || selectedUploadType === 'Academic Calendar') && (
                  <div className="col-span-2 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl text-brand-primary text-[10px] uppercase font-black tracking-widest text-center shadow-sm">
                    Strategic Note: This asset will be synchronized across all institutional levels.
                  </div>
                )}

                <div className="col-span-2">
                  <textarea
                    name="description"
                    placeholder="Provide a brief academic overview of this resource..."
                    rows={3}
                    className="w-full bg-soft-bg border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={uploading}
                  className="col-span-2 bg-brand-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/20 disabled:opacity-50 mt-2"
                >
                  {uploading ? 'Processing Transaction...' : 'Publish to Digital Hub'}
                </motion.button>
              </form>
            </Section>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Notice Board */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 border border-border relative overflow-hidden group shadow-lg shadow-brand-primary/5"
              >
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/5">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-main uppercase tracking-tight">Academic Notices</h3>
                    <p className="text-[10px] text-dim uppercase tracking-widest font-black">Latest System Feed</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  {[
                    { title: 'Even Sem Results Published', date: 'Just now', tag: 'Result', url: 'https://nceteresults.contineo.in/even/' },
                    { title: 'New 6th Sem Notes Uploaded', date: '2h ago', tag: 'New' },
                    { title: 'Syllabus Updated for 2026', date: '6h ago', tag: 'Update' },
                  ].map((notice, idx) => (
                    <a 
                      key={idx} 
                      href={notice.url || '#'} 
                      target={notice.url ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-soft-bg border border-border group/notice hover:border-brand-primary/30 transition-all block cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${notice.tag === 'Result' ? 'bg-green-500 text-white' : notice.tag === 'Important' ? 'bg-red-500 text-white' : 'bg-brand-primary text-white'}`}>
                          {notice.tag}
                        </span>
                        <span className="text-[9px] text-dim uppercase font-black">{notice.date}</span>
                      </div>
                      <p className="text-xs text-dim font-bold group-hover/notice:text-brand-primary transition-colors leading-relaxed">{notice.title}</p>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Contact Details Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 border border-border shadow-lg shadow-brand-primary/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-soft-bg border border-border flex items-center justify-center text-dim shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-main uppercase tracking-tight">Institutional Desk</h3>
                    <p className="text-[10px] text-dim uppercase tracking-widest font-black">Official Correspondance</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <a href="mailto:support@ncet.hub" className="flex items-center gap-4 group p-3 rounded-xl hover:bg-soft-bg transition-all border border-transparent hover:border-border">
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary transition-all group-hover:text-white shadow-sm">
                      <Mail size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-dim font-black uppercase tracking-tighter">Support Email</span>
                      <span className="text-xs text-main font-bold group-hover:text-brand-primary transition-colors">support@ncet.hub</span>
                    </div>
                  </a>

                  <a href="#" className="flex items-center gap-4 group p-3 rounded-xl hover:bg-soft-bg transition-all border border-transparent hover:border-border">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 transition-all group-hover:text-white shadow-sm">
                      <MessageCircle size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-dim font-black uppercase tracking-tighter">WhatsApp Link</span>
                      <span className="text-xs text-main font-bold group-hover:text-emerald-500 transition-colors">+91 98765 43210</span>
                    </div>
                  </a>
                </div>
              </motion.div>

              <Section id="suggestions" className="p-6 border-border shadow-lg shadow-brand-primary/5">
                <div className="section-title mb-6">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/5">
                    <MessageCircle size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-main font-black uppercase tracking-tight leading-none text-sm">Request Assets</span>
                    <span className="text-[9px] text-dim uppercase tracking-widest mt-1 font-black">Institutional Inquiry</span>
                  </div>
                </div>
                <p className="text-xs text-dim mb-6 font-medium leading-relaxed">
                  Missing a critical module or lab manual? Request specific academic assets directly from the management team.
                </p>
              <form onSubmit={handleSuggestionSubmit} className="flex flex-col gap-4">
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Describe the asset required (e.g. 5th Sem Design of Machines Lab)..."
                  rows={4}
                  required
                  className="w-full bg-soft-bg border border-border rounded-xl p-4 text-main outline-none focus:border-brand-primary transition-all text-sm resize-none"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submittingSuggestion}
                  className="bg-brand-primary text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                >
                  {submittingSuggestion ? 'Dispatching...' : 'Submit Inquiry'}
                </motion.button>
              </form>
            </Section>
            
            <QuoteSection />
          </div>
          )}
        </div>
      </div>
    </main>

      {/* Comprehensive Footer */}
      <footer className="mt-20 border-t border-border pt-16 pb-8 px-10 bg-panel">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
            {/* Column 1: Nagarjuna Updates */}
            <div className="flex flex-col gap-4">
              <div className="bg-soft-bg p-3 border-l-4 border-brand-primary mb-2 shadow-sm">
                <h3 className="text-sm font-black text-main uppercase tracking-wider">Academic Updates</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { name: 'Nagarjuna Results', url: 'https://nceteresults.contineo.in/even/' },
                  { name: 'Exam Time Table', type: 'Exam Time Table' },
                  { name: 'Academic Calendar', type: 'Academic Calendar' },
                  { name: 'Circulars & Notifications', type: 'Other' }
                ].map((item) => (
                  <li key={item.name} className="group/item">
                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 text-main hover:text-brand-primary text-sm font-black transition-all py-2 px-3 hover:bg-panel-hover rounded-xl"
                      >
                        <ChevronRight size={14} className="text-brand-primary/30 group-hover:text-brand-primary group-hover/item:translate-x-1 transition-all" /> 
                        <span className="relative overflow-hidden">
                          {item.name}
                          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-primary/20 transition-all group-hover:w-full"></span>
                        </span>
                      </a>
                    ) : (
                      <button 
                        onClick={() => {
                          setFilters({ ...filters, type: item.type || '', branch: '', semester: '' });
                          document.getElementById('hub-content')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex items-center gap-3 text-main hover:text-brand-primary text-sm font-black transition-all py-2 px-3 hover:bg-panel-hover rounded-xl w-full text-left"
                      >
                        <ChevronRight size={14} className="text-brand-primary/30 group-hover:text-brand-primary group-hover/item:translate-x-1 transition-all" />
                        <span className="relative overflow-hidden">
                          {item.name}
                          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-primary/20 transition-all group-hover:w-full"></span>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col gap-4">
              <div className="bg-soft-bg p-3 border-l-4 border-brand-primary mb-2 shadow-sm">
                <h3 className="text-sm font-black text-main uppercase tracking-wider">Hub Access</h3>
              </div>
              <ul className="flex flex-col gap-1">
                {['Upload Notes', 'Institutional Syllabus', 'SGPA Assistant', 'CGPA Assistant', 'Sample Papers'].map((link) => (
                  <li key={link} className="group/item">
                    <button 
                      onClick={() => {
                        if (link === 'Upload Notes') {
                          if (isAdmin) {
                            document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            document.getElementById('suggestions')?.scrollIntoView({ behavior: 'smooth' });
                          }
                          return;
                        }
                        if (link.includes('Syllabus')) setFilters({ ...filters, type: 'Syllabus' });
                        if (link.includes('Papers')) setFilters({ ...filters, type: 'Model Paper' });
                        
                        if (link.includes('SGPA')) setCalcMode('SGPA');
                        if (link.includes('CGPA')) setCalcMode('CGPA');
                        
                        if (link.includes('Assistant') || link.includes('Calculator')) {
                          setShowCalculator(true);
                          setTimeout(() => {
                            document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        } else {
                          document.getElementById('hub-content')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group flex items-center gap-3 text-main hover:text-brand-primary text-sm font-black transition-all py-2 px-3 hover:bg-panel-hover rounded-xl w-full text-left"
                    >
                      <ChevronRight size={14} className="text-brand-primary/30 group-hover:text-brand-primary group-hover/item:translate-x-1 transition-all" />
                      <span className="relative overflow-hidden">
                        {link}
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-primary/20 transition-all group-hover:w-full"></span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: About Hub */}
            <div className="flex flex-col gap-4">
              <div className="bg-soft-bg p-3 border-l-4 border-brand-primary mb-2 shadow-sm">
                <h3 className="text-sm font-black text-main uppercase tracking-wider">Transparency</h3>
              </div>
              <ul className="flex flex-col gap-1">
                {['FAQ Registry', 'About Platform', 'System Disclaimer', 'Institutional Contact', 'Privacy Protocol'].map((link) => (
                  <li key={link} className="group/item">
                    <a href="#" className="group flex items-center gap-3 text-main hover:text-brand-primary text-sm font-black transition-all py-2 px-3 hover:bg-panel-hover rounded-xl">
                      <ChevronRight size={14} className="text-brand-primary/30 group-hover:text-brand-primary group-hover/item:translate-x-1 transition-all" />
                      <span className="relative overflow-hidden">
                        {link}
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-primary/20 transition-all group-hover:w-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Follow Us */}
            <div className="flex flex-col gap-4">
              <div className="bg-soft-bg p-3 border-l-4 border-brand-primary mb-2 shadow-sm">
                <h3 className="text-sm font-black text-main uppercase tracking-wider">Social Links</h3>
              </div>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-11 h-11 rounded-2xl bg-panel border border-border flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md hover:-translate-y-1 hover:shadow-emerald-200/20">
                  <MessageCircle size={22} />
                </a>
                <a href="#" className="w-11 h-11 rounded-2xl bg-panel border border-border flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-md hover:-translate-y-1 hover:shadow-blue-200/20">
                  <Send size={22} />
                </a>
                <a href="#" className="w-11 h-11 rounded-2xl bg-panel border border-border flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md hover:-translate-y-1 hover:shadow-rose-200/20">
                  <Instagram size={22} />
                </a>
              </div>
            </div>
          </div>

          {/* Discover More Section */}
          <div className="glass-panel p-0 overflow-hidden mb-12 border-brand-primary/10 shadow-xl shadow-brand-primary/5">
            <div className="p-5 border-b border-border bg-soft-bg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-sm"></div>
                <h3 className="text-sm font-black text-main uppercase tracking-[0.2em]">Institutional Discovery</h3>
              </div>
              <span className="text-[10px] font-black text-dim uppercase">System_VER_2.0.4</span>
            </div>
            
            <div className="flex flex-col">
              {/* Semester Notes */}
              <button 
                onClick={() => document.getElementById('hub-content')?.scrollIntoView({ behavior: 'smooth' })}
                className="p-6 flex justify-between items-center hover:bg-panel-hover transition-all border-b border-border group text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-brand-primary/60 mb-1 uppercase tracking-widest">Repository-01</span>
                  <span className="text-sm text-dim font-bold group-hover:text-brand-primary transition-colors">Course Specific Academic Assets</span>
                </div>
                <ChevronRight size={18} className="text-dim/50 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </button>

              {/* Live Circulars / Readmission */}
              <div className="border-b border-border">
                <button 
                  onClick={() => setActiveDiscover(activeDiscover === 'circulars' ? null : 'circulars')}
                  className="w-full p-6 flex justify-between items-center hover:bg-panel-hover transition-all group text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-brand-primary/60 mb-1 uppercase tracking-widest">Bulletin-04</span>
                    <span className="text-sm text-dim font-bold group-hover:text-brand-primary transition-colors">Digital Circulars & Updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Live</span>
                    </div>
                    <ChevronRight size={18} className={`text-dim/50 group-hover:text-brand-primary transition-all ${activeDiscover === 'circulars' ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {activeDiscover === 'circulars' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-panel px-6 pb-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { title: 'Even Sem Results 2026', status: 'Verify Status', color: 'text-brand-primary' },
                          { title: 'Exam Registration (Final Call)', status: 'Closes Apr 20', color: 'text-amber-600' },
                          { title: 'Internal Assessment Grid', status: 'Review Manifest', color: 'text-dim/60' }
                        ].map((c, i) => (
                          <div key={i} className="flex flex-col p-4 rounded-xl bg-soft-bg border border-border group/link cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm">
                            <span className="text-xs text-main font-black mb-2 leading-tight">{c.title}</span>
                            <span className={`text-[10px] font-black ${c.color} uppercase tracking-widest mt-auto`}>{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CS Software Resources */}
              <button 
                onClick={() => {
                  setFilters({ ...filters, query: 'Software', type: 'Other' });
                  document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 flex justify-between items-center hover:bg-panel-hover transition-all border-b border-border group text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-brand-primary/60 mb-1 uppercase tracking-widest">Logic-09</span>
                  <span className="text-sm text-main font-bold group-hover:text-brand-primary transition-colors">Engineering Software Toolkits</span>
                </div>
                <ChevronRight size={18} className="text-dim/50 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </button>

              {/* Placement Roadmaps */}
              <div>
                <button 
                  onClick={() => setActiveDiscover(activeDiscover === 'placement' ? null : 'placement')}
                  className="w-full p-6 flex justify-between items-center hover:bg-panel-hover transition-all group text-left"
                >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-brand-primary/60 mb-1 uppercase tracking-widest">Career-24</span>
                  <span className="text-sm text-dim font-bold group-hover:text-brand-primary transition-colors">Placement Strategy Roadmaps</span>
                </div>
                <ChevronRight size={18} className={`text-dim/50 group-hover:text-brand-primary transition-all ${activeDiscover === 'placement' ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDiscover === 'placement' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-panel px-6 pb-6"
                    >
                      <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-6 px-1">Institutional Success Protocol</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {['TCS', 'Infosys', 'Wipro'].map((comp) => (
                            <div key={comp} className="flex flex-col gap-4 p-4 bg-panel rounded-xl border border-border shadow-sm">
                              <span className="text-sm font-black text-main uppercase tracking-tight">{comp} Logic</span>
                              <div className="flex flex-col gap-2">
                                {['Quantitative Analysis', 'Logic Synthesis', 'Executive Interview'].map((step, idx) => (
                                  <div key={step} className="flex items-start gap-3 text-[10px] text-dim font-bold">
                                    <span className="text-brand-primary font-black mt-0.5">{idx + 1}.</span>
                                    <span className="leading-tight">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-dim border-t border-border pt-10 font-black uppercase tracking-widest">
            <div className="flex items-center gap-8">
              <p>© 2026 Institutional Digital Hub</p>
              <button 
                onClick={() => {
                  if (currentUser) {
                    signOut(auth);
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className="hover:text-brand-primary transition-colors border-l border-border pl-8"
              >
                {currentUser ? 'Terminate Session' : 'Institutional Access'}
              </button>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p>System Administrator: <span className="text-brand-primary">mgmt@digitalhub.inst</span></p>
              <p className="normal-case tracking-normal text-dim font-medium">Standardizing Academic Excellence across Engineering Faculties.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
