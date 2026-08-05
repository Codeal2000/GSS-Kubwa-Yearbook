import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, UserCheck, Key, Lock, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Student, UserSession } from '../types';

interface AuthModalProps {
  students: Student[];
  onClose: () => void;
  onLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  students,
  onClose,
  onLogin,
}) => {
  const [authType, setAuthType] = useState<'student' | 'admin'>('student');
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@gsskubwa.edu.ng');
  const [adminPassword, setAdminPassword] = useState('admin2026');
  const [adminError, setAdminError] = useState('');

  // Secure Student form state (Exam Number + Date of Birth)
  const [examNumberInput, setExamNumberInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [studentError, setStudentError] = useState('');
  const [showSampleCredentials, setShowSampleCredentials] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@gsskubwa.edu.ng' && adminPassword === 'admin2026') {
      onLogin({
        id: 'admin_root',
        fullName: 'Yearbook Administrator',
        role: 'admin',
        email: adminEmail,
      });
      onClose();
    } else {
      setAdminError('Invalid credentials. Use admin@gsskubwa.edu.ng / admin2026');
    }
  };

  const handleQuickAdminLogin = () => {
    onLogin({
      id: 'admin_root',
      fullName: 'Yearbook Administrator',
      role: 'admin',
      email: 'admin@gsskubwa.edu.ng',
    });
    onClose();
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const normExam = examNumberInput.trim().toLowerCase();
    const normDob = birthDateInput.trim().toLowerCase();

    if (!normExam || !normDob) {
      setStudentError('Please enter both your Full Exam Number and Date of Birth.');
      return;
    }

    // Match student strictly by examNumber and birthDate
    const target = students.find(s => {
      const sExam = (s.examNumber || '').trim().toLowerCase();
      const sDob = (s.birthDate || '').trim().toLowerCase();
      return sExam === normExam && sDob === normDob;
    });

    if (target) {
      onLogin({
        id: target.id,
        fullName: target.fullName,
        role: 'student',
        examNumber: target.examNumber,
      });
      onClose();
    } else {
      setStudentError('Invalid Exam Number or Date of Birth. Please check your official registration credentials.');
    }
  };

  const sampleStudents = students.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-md bg-slate-900 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto text-white"
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* School Header Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 p-1.5 shadow-lg shadow-emerald-900/40">
              <img
                src="/photos/gsskubwalogo.jpg"
                alt="GSS Kubwa Logo"
                className="w-full h-full object-contain rounded-xl"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">GSS KUBWA 2026</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Official Digital Yearbook Authentication
            </p>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setAuthType('student'); setStudentError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authType === 'student'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Student Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthType('admin'); setAdminError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authType === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </button>
          </div>

          {/* SECURE STUDENT AUTH FORM */}
          {authType === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-2xl text-[11px] text-emerald-300 leading-relaxed flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Secure Student Access:</strong> Enter your full registration Exam Number and Date of Birth to access your profile and cast votes.
                </span>
              </div>

              {studentError && (
                <div className="bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Exam Number
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GSS/KUB/2026/001"
                    value={examNumberInput}
                    onChange={(e) => setExamNumberInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 March"
                    value={birthDateInput}
                    onChange={(e) => setBirthDateInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 active:scale-98"
              >
                Log In to Student Account
              </button>

              {/* Sample Credentials Helper Accordion */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSampleCredentials(!showSampleCredentials)}
                  className="w-full text-left text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between py-1"
                >
                  <span>Need help finding exam credentials?</span>
                  {showSampleCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showSampleCredentials && (
                  <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-[10px] text-slate-300">
                    <p className="font-bold text-slate-400 text-[10px] uppercase">Sample Student Credentials:</p>
                    {sampleStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setExamNumberInput(s.examNumber);
                          setBirthDateInput(s.birthDate);
                        }}
                        className="w-full text-left p-1.5 hover:bg-slate-900 rounded border border-transparent hover:border-emerald-800/60 flex items-center justify-between font-mono"
                      >
                        <span className="truncate font-semibold text-white">{s.fullName}</span>
                        <span className="text-emerald-400 shrink-0 ml-2">{s.examNumber} ({s.birthDate})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* ADMIN AUTH FORM */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-xl text-amber-300 text-xs">
                <div className="font-bold flex items-center gap-1 mb-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Admin Credentials:
                </div>
                <div className="font-mono text-[11px] space-y-0.5">
                  <p>Email: <span className="font-bold text-white">admin@gsskubwa.edu.ng</span></p>
                  <p>Password: <span className="font-bold text-white">admin2026</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full mt-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shadow-md"
                >
                  1-Click Login as Admin
                </button>
              </div>

              {adminError && (
                <p className="text-rose-400 text-xs font-semibold">{adminError}</p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/30"
              >
                Log In to Admin Portal
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
