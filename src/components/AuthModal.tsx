import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, UserCheck, Key, User, GraduationCap, Check, Search } from 'lucide-react';
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
  
  // Admin form
  const [adminEmail, setAdminEmail] = useState('admin@gsskubwa.edu.ng');
  const [adminPassword, setAdminPassword] = useState('admin2026');
  const [adminError, setAdminError] = useState('');

  // Student form
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customStudentName, setCustomStudentName] = useState('');

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
    if (selectedStudentId) {
      const target = students.find(s => s.id === selectedStudentId);
      if (target) {
        onLogin({
          id: target.id,
          fullName: target.fullName,
          role: 'student',
          examNumber: target.examNumber,
        });
        onClose();
        return;
      }
    }

    if (customStudentName.trim()) {
      onLogin({
        id: `student_${Date.now()}`,
        fullName: customStudentName.trim(),
        role: 'student',
      });
      onClose();
    }
  };

  const filteredStudentsForSelect = students.filter(s =>
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto"
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Sign In to Yearbook</h3>
            <p className="text-xs text-slate-500 mt-1">
              Log in to cast superlative votes, leave signatures, and update your profile.
            </p>
          </div>

          {/* Toggle Role */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              onClick={() => setAuthType('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authType === 'student'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Student Login
            </button>
            <button
              onClick={() => setAuthType('admin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authType === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Login
            </button>
          </div>

          {/* STUDENT AUTH FORM */}
          {authType === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Graduate Profile
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {filteredStudentsForSelect.map((student) => (
                    <button
                      type="button"
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setCustomStudentName(student.fullName);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition ${
                        selectedStudentId === student.id
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{student.fullName}</span>
                      {selectedStudentId === student.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-extrabold uppercase">Or enter name</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Full Name..."
                  value={customStudentName}
                  onChange={(e) => {
                    setCustomStudentName(e.target.value);
                    setSelectedStudentId('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedStudentId && !customStudentName.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Log In as Student
              </button>
            </form>
          ) : (
            /* ADMIN AUTH FORM */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {/* Credentials Callout Card */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs">
                <div className="font-bold flex items-center gap-1 mb-1">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Admin Credentials:
                </div>
                <div className="font-mono text-[11px] space-y-0.5">
                  <p>Email: <span className="font-bold">admin@gsskubwa.edu.ng</span></p>
                  <p>Password: <span className="font-bold">admin2026</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full mt-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition"
                >
                  1-Click Login as Admin
                </button>
              </div>

              {adminError && (
                <p className="text-red-600 text-xs font-semibold">{adminError}</p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Log In as Admin
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
