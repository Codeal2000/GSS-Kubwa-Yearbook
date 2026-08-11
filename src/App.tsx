import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchStudentsFromSupabase, subscribeToStudentsFromSupabase,
  fetchCommentsFromSupabase, subscribeToCommentsFromSupabase,
  fetchUserVotesFromSupabase, recordVoteInSupabase, revokeVoteInSupabase,
  updateStudentVotesInSupabase, addCommentToSupabase, approveCommentInSupabase,
  deleteCommentFromSupabase, updateStudentInSupabase, addStudentToSupabase,
  deleteStudentFromSupabase, seedStudentsToSupabase
} from './lib/supabase';
import { getInitialStudents } from './seedData';
import { Student, CommentItem, UserSession, SUPERLATIVES, getStudentPhotoUrl, handleStudentImageError, handleLogoImageError } from './types';
import { getUserVotesMap, saveUserVotesMap, isWithin24Hours, getVotingConfig, isVotingActive, UserVotesMap } from './utils/votingSystem';
import { Navbar } from './components/Navbar';
import { StudentCard } from './components/StudentCard';
import { SpotlightCard } from './components/SpotlightCard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Pagination } from './components/Pagination';
import { SuperlativeIcon } from './components/SuperlativeIcon';
import { StudentPortalBanner } from './components/StudentPortalBanner';
import heroBanner from './assets/images/yearbook_hero_banner_1785861274504.jpg';
import { 
  GraduationCap, Trophy, Users, Star, 
  Award, Search, Filter, ShieldCheck, Check,
  ArrowRight, ChevronRight, ChevronLeft, Lock, Copy, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedCounter: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1200 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!target) return;
    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCounter = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easeProgress * target);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sync URL search parameters when student selection changes
  const handleSelectStudent = (student: Student | null) => {
    setSelectedStudent(student);
    try {
      const url = new URL(window.location.href);
      if (student) {
        url.searchParams.set('student', student.id);
      } else {
        url.searchParams.delete('student');
        url.searchParams.delete('studentId');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore URL manipulation failures
    }
  };

  // Check deep-link query param (?student=ID) on load / when students load
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('student') || params.get('studentId') || (window.location.hash.startsWith('#student-') ? window.location.hash.replace('#student-', '') : null);
      if (targetId) {
        const match = students.find(s => s.id === targetId || s.examNumber === targetId);
        if (match) {
          setSelectedStudent(match);
        }
      }
    }
  }, [students]);
  
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'birthdays' | 'halloffame'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // User Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('gss_kubwa_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Track user votes map: categoryId -> { studentId, timestamp }
  const [userVoteRecords, setUserVoteRecords] = useState<UserVotesMap>(() => {
    return getUserVotesMap(userSession?.id || 'guest');
  });

  useEffect(() => {
    if (userSession) {
      const localMap = getUserVotesMap(userSession.id);
      setUserVoteRecords(localMap);

      fetchUserVotesFromSupabase(userSession.id).then(remoteMap => {
        if (remoteMap && Object.keys(remoteMap).length > 0) {
          const merged = { ...localMap, ...remoteMap };
          setUserVoteRecords(merged);
          saveUserVotesMap(userSession.id, merged);
        }
      });
    }
  }, [userSession]);

  // Local vote override store
  const [localVotes, setLocalVotes] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem('gss_kubwa_local_votes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Student Portal Classmates Visibility Toggle
  const [showClassmates, setShowClassmates] = useState(false);

  // Load students & comments from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseData() {
      // 1. Fetch Students from Supabase
      const supabaseStudents = await fetchStudentsFromSupabase();
      if (isMounted) {
        if (supabaseStudents && supabaseStudents.length > 0) {
          setStudents(supabaseStudents);
          setLoading(false);
        } else if (supabaseStudents && supabaseStudents.length === 0) {
          // Supabase table is empty, seed initial 714 graduates
          const initial = getInitialStudents();
          setStudents(initial);
          setLoading(false);
          seedStudentsToSupabase(initial).catch(err => console.warn("Supabase background seed notice:", err));
        } else {
          // Supabase offline or initializing, load initial local dataset
          const initial = getInitialStudents();
          setStudents(initial);
          setLoading(false);
        }
      }

      // 2. Fetch Comments from Supabase
      const supabaseComments = await fetchCommentsFromSupabase();
      if (isMounted && supabaseComments && supabaseComments.length > 0) {
        setComments(supabaseComments);
      }
    }

    loadSupabaseData();

    // 3. Setup Supabase Realtime Subscriptions
    const unsubscribeSupabaseStudents = subscribeToStudentsFromSupabase(async () => {
      const updated = await fetchStudentsFromSupabase();
      if (isMounted && updated && updated.length > 0) {
        setStudents(updated);
      }
    });

    const unsubscribeSupabaseComments = subscribeToCommentsFromSupabase(async () => {
      const updated = await fetchCommentsFromSupabase();
      if (isMounted && updated) {
        setComments(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeSupabaseStudents();
      unsubscribeSupabaseComments();
    };
  }, []);

  // Compute total votes for a student
  const getStudentVoteCounts = (student: Student) => {
    const baseVotes = student.votes || {};
    const extraVotes = localVotes[student.id] || {};
    const result: Record<string, number> = {};

    SUPERLATIVES.forEach(cat => {
      const base = baseVotes[cat.id] || 0;
      const extra = extraVotes[cat.id] || 0;
      result[cat.id] = base + extra;
    });

    return result;
  };

  const studentVoteTotalsMap = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((student) => {
      const counts = getStudentVoteCounts(student);
      map[student.id] = Object.values(counts).reduce((a, b) => a + b, 0);
    });
    return map;
  }, [students, localVotes]);

  const getTotalStudentVotes = (student: Student) => {
    return studentVoteTotalsMap[student.id] || 0;
  };

  // Current Month/Day for birthdays tab
  const currentMonthDay = useMemo(() => {
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${today.getDate()} ${months[today.getMonth()]}`;
  }, []);

  // Filter students based on search and active tab
  const filteredStudents = useMemo(() => {
    let list = students.filter(s =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === 'featured') {
      list = list.filter(s => s.featuredOnHome);
      if (list.length === 0) list = students.slice(0, 12);
    } else if (activeTab === 'birthdays') {
      list = list.filter(s => s.birthDate.toLowerCase() === currentMonthDay.toLowerCase());
    } else if (activeTab === 'halloffame') {
      list = [...list].sort((a, b) => {
        if (selectedCategory !== 'all') {
          const catA = getStudentVoteCounts(a)[selectedCategory] || 0;
          const catB = getStudentVoteCounts(b)[selectedCategory] || 0;
          return catB - catA;
        }
        return getTotalStudentVotes(b) - getTotalStudentVotes(a);
      });
      const limit = selectedCategory === 'all' ? 1 : 2;
      list = list.slice(0, limit);
    }

    return list;
  }, [students, searchTerm, activeTab, selectedCategory, currentMonthDay, localVotes]);

  // Birthday matches count
  const birthdayMatches = useMemo(() => {
    return students.filter(s => s.birthDate.toLowerCase() === currentMonthDay.toLowerCase());
  }, [students, currentMonthDay]);

  // Spotlight / Featured Students List
  const spotlightStudents = useMemo(() => {
    const featured = students.filter(s => s.featuredOnHome);
    return featured.length > 0 ? featured : students.slice(0, 10);
  }, [students]);

  // Pending items for admin
  const pendingApprovalsCount = useMemo(() => {
    const pendingProfiles = students.filter(s => Boolean(s.pendingProfileUpdate)).length;
    const pendingComm = comments.filter(c => c.status === 'pending').length;
    return pendingProfiles + pendingComm;
  }, [students, comments]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleTabChange = (tab: 'all' | 'featured' | 'birthdays' | 'halloffame') => {
    setActiveTab(tab);
    scrollToTop();
    requestAnimationFrame(() => scrollToTop());
  };

  useEffect(() => {
    setCurrentPage(1);
    scrollToTop();
  }, [searchTerm, activeTab, selectedCategory]);

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  // Handle Voting (Supports 24-hour Revocation & Changing)
  const handleVote = async (studentId: string, categoryId: string) => {
    if (!userSession) {
      setIsAuthOpen(true);
      return;
    }

    const config = getVotingConfig();
    const activeCheck = isVotingActive(config);
    if (!activeCheck.active) {
      alert(`🔒 Voting Closed: ${activeCheck.reason}`);
      return;
    }

    const targetStudent = students.find(s => s.id === studentId);
    const targetName = targetStudent?.fullName || 'this graduate';

    const existingVote = userVoteRecords[categoryId];

    if (existingVote) {
      const voteAgeMs = Date.now() - existingVote.timestamp;
      const isWithin24h = voteAgeMs <= 24 * 60 * 60 * 1000;

      // CASE A: User clicked to REVOKE vote on the SAME student
      if (existingVote.studentId === studentId) {
        if (!isWithin24h) {
          alert("⚠️ Vote Locked: Your vote in this category was cast over 24 hours ago and can no longer be revoked.");
          return;
        }

        // Revoke! Decrement local vote count
        setLocalVotes(prev => ({
          ...prev,
          [studentId]: {
            ...(prev[studentId] || {}),
            [categoryId]: Math.max(0, (prev[studentId]?.[categoryId] || 0) - 1)
          }
        }));

        const updatedRecords = { ...userVoteRecords };
        delete updatedRecords[categoryId];
        setUserVoteRecords(updatedRecords);
        saveUserVotesMap(userSession.id, updatedRecords);

        // Core query to Supabase
        revokeVoteInSupabase(userSession.id, categoryId);
        updateStudentVotesInSupabase(studentId, categoryId, -1);

        alert(`✅ Vote Revoked: Your vote for ${targetName} in this category has been canceled. You can now vote again whenever you wish!`);
        return;
      } else {
        // CASE B: User clicked to CHANGE vote to a DIFFERENT student
        if (!isWithin24h) {
          alert("⚠️ Vote Locked: Your previous vote in this category was cast over 24 hours ago and cannot be changed.");
          return;
        }

        const oldStudentId = existingVote.studentId;

        // Decrement old student, increment new student
        setLocalVotes(prev => ({
          ...prev,
          [oldStudentId]: {
            ...(prev[oldStudentId] || {}),
            [categoryId]: Math.max(0, (prev[oldStudentId]?.[categoryId] || 0) - 1)
          },
          [studentId]: {
            ...(prev[studentId] || {}),
            [categoryId]: (prev[studentId]?.[categoryId] || 0) + 1
          }
        }));

        const newRecord = { studentId, studentName: targetName, timestamp: Date.now() };
        const updatedRecords = { ...userVoteRecords, [categoryId]: newRecord };
        setUserVoteRecords(updatedRecords);
        saveUserVotesMap(userSession.id, updatedRecords);

        // Core queries to Supabase
        revokeVoteInSupabase(userSession.id, categoryId);
        recordVoteInSupabase(userSession.id, studentId, categoryId, targetName);
        updateStudentVotesInSupabase(oldStudentId, categoryId, -1);
        updateStudentVotesInSupabase(studentId, categoryId, 1);

        alert(`🎉 Vote Changed: Your vote in this category has been transferred to ${targetName}!`);
        return;
      }
    }

    // CASE C: FIRST TIME VOTE in this category
    setLocalVotes(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [categoryId]: (prev[studentId]?.[categoryId] || 0) + 1
      }
    }));

    const newRecord = { studentId, studentName: targetName, timestamp: Date.now() };
    const updatedRecords = { ...userVoteRecords, [categoryId]: newRecord };
    setUserVoteRecords(updatedRecords);
    saveUserVotesMap(userSession.id, updatedRecords);

    // Core query to Supabase
    recordVoteInSupabase(userSession.id, studentId, categoryId, targetName);
    updateStudentVotesInSupabase(studentId, categoryId, 1);

    alert(`🎉 Vote Cast: You voted for ${targetName}! You can change or revoke this vote within 24 hours if you wish.`);
  };

  // Comments handlers
  const handleAddComment = async (studentId: string, text: string) => {
    if (!userSession) {
      setIsAuthOpen(true);
      return;
    }

    const status = userSession.role === 'admin' ? 'approved' : 'pending';

    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      studentId,
      authorId: userSession.id,
      authorName: userSession.fullName,
      authorRole: userSession.role,
      text,
      createdAt: new Date().toLocaleDateString(),
      status
    };

    setComments(prev => [newComment, ...prev]);

    // Core query to Supabase
    addCommentToSupabase({
      studentId,
      authorId: userSession.id,
      authorName: userSession.fullName,
      authorRole: userSession.role,
      text,
      status
    });
  };

  const handleApproveComment = async (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, status: 'approved' } : c));
    
    // Core query to Supabase
    approveCommentInSupabase(commentId);
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));

    // Core query to Supabase
    deleteCommentFromSupabase(commentId);
  };

  // Student Profile Updates
  const handleUpdateStudent = async (id: string, updatedData: Partial<Student>) => {
    // Core query to Supabase first
    const success = await updateStudentInSupabase(id, updatedData);
    if (!success) {
      alert("❌ Supabase update failed. Please check your network connection.");
      return;
    }

    setStudents(prev => prev.map(s => (s.id === id || s.examNumber === id) ? { ...s, ...updatedData } : s));
    if (selectedStudent && (selectedStudent.id === id || selectedStudent.examNumber === id)) {
      setSelectedStudent(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const handleAddStudent = async (newStudent: Partial<Student>) => {
    const id = `4020204${(students.length + 1).toString().padStart(3, '0')}`;
    const fullStudent: Student = {
      id,
      fullName: newStudent.fullName || 'New Graduate',
      examNumber: id,
      photoFilename: newStudent.photoFilename || '1.jpg',
      birthDate: newStudent.birthDate || '1 January',
      votes: newStudent.votes || {},
      quote: newStudent.quote || "Excellence is not a destination, it's a way of life.",
      hobbies: newStudent.hobbies || '',
      careerPath: newStudent.careerPath || '',
      email: newStudent.email || '',
      phone: newStudent.phone || '',
      featuredOnHome: false,
    };

    const success = await addStudentToSupabase(fullStudent);
    if (!success) {
      alert("❌ Failed to add student to Supabase database.");
      return;
    }

    setStudents(prev => [fullStudent, ...prev]);
  };

  const handleDeleteStudent = async (id: string) => {
    const success = await deleteStudentFromSupabase(id);
    if (!success) {
      alert("❌ Failed to delete student from Supabase database.");
      return;
    }

    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudent?.id === id) setSelectedStudent(null);
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    handleUpdateStudent(id, { featuredOnHome: featured });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* Header Navigation */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userSession={userSession}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUserSession(null)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        birthdayCount={birthdayMatches.length}
        totalStudents={students.length}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Hero / Spotlight Section on First View */}
      {activeTab === 'all' && !searchTerm && (
        <section className="relative overflow-hidden bg-white text-slate-900 border-b border-emerald-100 shadow-sm">
          {/* Hero Background Image with Light Emerald Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBanner}
              alt="GSS Kubwa Class of 2026 Celebration"
              className="w-full h-full object-cover object-center opacity-10 scale-105 transform transition duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-emerald-50/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: School Title & Welcome */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 font-extrabold text-xs shadow-sm">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-white shrink-0 p-0.5 border border-emerald-300">
                    <img src="/photos/gsskubwalogo.jpg" alt="Logo" className="w-full h-full object-contain" onError={handleLogoImageError} />
                  </div>
                  <span>Government Secondary School, Kubwa</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  Welcome to the Official <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700">
                    Class of 2026 Yearbook
                  </span>
                </h1>

                <p className="text-slate-700 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-xl">
                  A timeless digital memory book preserving graduate profiles, senior quotes, peer award votes, and personal tributes for our graduating seniors.
                </p>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                  <div className="bg-white border border-emerald-200/80 p-3.5 sm:p-4 rounded-2xl hover:border-emerald-500 transition duration-300 shadow-sm flex items-center gap-3">
                    <img
                      src={getStudentPhotoUrl('1.webp')}
                      alt="Graduates"
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shrink-0 shadow-sm"
                      onError={(e) => handleStudentImageError(e, 'Graduates')}
                    />
                    <div>
                      <p className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
                        <AnimatedCounter target={students.length || 714} />
                      </p>
                      <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide">Graduates</p>
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-200/80 p-3.5 sm:p-4 rounded-2xl hover:border-emerald-500 transition duration-300 shadow-sm flex items-center gap-3">
                    <img
                      src={getStudentPhotoUrl('2.webp')}
                      alt="Peer Awards"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 shadow-sm"
                      onError={(e) => handleStudentImageError(e, 'Peer Awards')}
                    />
                    <div>
                      <p className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
                        <AnimatedCounter target={12} />
                      </p>
                      <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wide">Peer Awards</p>
                    </div>
                  </div>
                </div>

                {/* Navigation CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const element = document.getElementById('graduates-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition duration-200 shadow-md shadow-emerald-700/20 flex items-center gap-2 group"
                  >
                    Browse Graduates
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                  </button>

                  <button
                    onClick={() => handleTabChange('halloffame')}
                    className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold text-xs sm:text-sm rounded-xl transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Vote Peer Awards
                  </button>
                </div>
              </div>

              {/* Right Column: Prominent Featured Spotlight Showcase */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 border-2 border-amber-300/80 p-4 sm:p-5 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 text-slate-950 rounded-xl shadow-sm">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-950 tracking-wide">
                          Graduate Spotlight Showcase
                        </h3>
                        <p className="text-[10px] text-amber-800 font-bold">
                          {spotlightStudents.length > 0 ? spotlightIndex + 1 : 0} of {spotlightStudents.length} Featured Profiles
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : spotlightStudents.length - 1))}
                        className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 transition border border-amber-300 shadow-sm"
                        title="Previous Spotlight"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSpotlightIndex((prev) => (prev < spotlightStudents.length - 1 ? prev + 1 : 0))}
                        className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 transition border border-amber-300 shadow-sm"
                        title="Next Spotlight"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTabChange('featured')}
                        className="ml-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition flex items-center gap-0.5 bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-200"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  {/* Prominent Fully Displayed Spotlight Card */}
                  {spotlightStudents[spotlightIndex] && (
                    <SpotlightCard
                      student={spotlightStudents[spotlightIndex]}
                      totalVotes={getTotalStudentVotes(spotlightStudents[spotlightIndex])}
                      onSelect={handleSelectStudent}
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Peer Awards Sub-Category Filter */}
      {activeTab === 'halloffame' && (
        <div className="bg-white border-b border-emerald-100 py-4 px-4 sm:px-6 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" /> Select Peer Award Leaderboard
            </h3>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x flex-nowrap w-full scroll-smooth pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 font-black'
                    : 'bg-emerald-50/70 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 font-bold'
                }`}
              >
                Overall Most Voted
              </button>

              {SUPERLATIVES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 font-black'
                      : 'bg-emerald-50/70 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 font-bold'
                  }`}
                >
                  <SuperlativeIcon name={cat.iconName} className="w-4 h-4" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <main id="graduates-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* LOGGED IN STUDENT DEDICATED PORTAL VIEW */}
        {userSession?.role === 'student' && (() => {
          const loggedInStudent = students.find(s => s.id === userSession.id);
          if (!loggedInStudent) return null;
          return (
            <StudentPortalBanner
              student={loggedInStudent}
              onEditProfile={() => handleSelectStudent(loggedInStudent)}
              onSelectCategoryVote={(catId) => {
                handleTabChange('halloffame');
                setSelectedCategory(catId);
              }}
              userVotesMap={userVoteRecords}
              showClassmates={showClassmates}
              setShowClassmates={setShowClassmates}
            />
          );
        })()}

        {userSession?.role === 'student' && !showClassmates && activeTab === 'all' && !searchTerm ? (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-8 text-center max-w-xl mx-auto my-6 shadow-xs">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-800">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Classmates Directory Collapsed</h3>
            <p className="text-slate-600 text-xs font-medium mb-4 leading-relaxed">
              Your profile is currently centered at the top. Click below to expand and view the full 714 graduates directory.
            </p>
            <button
              onClick={() => setShowClassmates(true)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-700/20"
            >
              Show All Classmates Directory ({students.length} Graduates)
            </button>
          </div>
        ) : (
          <>
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-extrabold text-slate-700">
                Showing <span className="text-emerald-950 font-black text-sm">{filteredStudents.length}</span> graduates
                {activeTab === 'birthdays' && ` celebrating on ${currentMonthDay}`}
                {activeTab === 'featured' && ` featured on home spotlight`}
                {activeTab === 'halloffame' && (
                  selectedCategory === 'all'
                    ? ` (Overall Most Voted Top Candidate)`
                    : ` (Top 2 Nominees in Selected Category)`
                )}
              </div>
            </div>

            {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-600 font-bold text-xs">Loading Yearbook Archives...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No graduates found</h3>
            <p className="text-slate-600 text-xs mb-5 font-medium">
              {activeTab === 'birthdays'
                ? `No student birthdays recorded for ${currentMonthDay}.`
                : `No results match "${searchTerm}". Check the spelling.`}
            </p>
            <button
              onClick={() => { setSearchTerm(''); handleTabChange('all'); }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-700/20"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <>
            {/* Student Grid */}
            <div className={
              activeTab === 'featured'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            }>
              <AnimatePresence mode="popLayout">
                {paginatedStudents.map((student, index) => {
                  const totalVotes = getTotalStudentVotes(student);
                  const globalRank = activeTab === 'halloffame' ? (currentPage - 1) * itemsPerPage + index + 1 : undefined;
                  const isSpotlight = student.featuredOnHome || activeTab === 'featured';

                  return (
                    <motion.div
                      layout
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isSpotlight ? (
                        <SpotlightCard
                          student={student}
                          totalVotes={totalVotes}
                          onSelect={handleSelectStudent}
                          isCompact={activeTab !== 'featured'}
                        />
                      ) : (
                        <StudentCard
                          student={student}
                          totalVotes={totalVotes}
                          rank={globalRank}
                          onSelect={handleSelectStudent}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredStudents.length}
            />
          </>
        )}
      </>
    )}
  </main>

      {/* Modern Multi-Column Light BBC-Style Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center p-1 shadow-sm">
                <img src="/photos/gsskubwalogo.jpg" alt="Logo" className="w-full h-full object-contain" onError={handleLogoImageError} />
              </div>
              <span className="font-black text-emerald-950 text-base tracking-tight">GSS KUBWA 2026</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed text-[11px]">
              Government Secondary School, Kubwa Digital Yearbook Archive. Preserving memories, friendships, and future milestones.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-950 uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-700">
              <li><button onClick={() => handleTabChange('all')} className="hover:text-emerald-700 transition">All Graduates</button></li>
              <li><button onClick={() => handleTabChange('featured')} className="hover:text-emerald-700 transition">Featured Spotlight</button></li>
              <li><button onClick={() => handleTabChange('halloffame')} className="hover:text-emerald-700 transition">Peer Awards Leaderboard</button></li>
              <li><button onClick={() => handleTabChange('birthdays')} className="hover:text-emerald-700 transition">Birthdays Today</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-950 uppercase text-[11px] tracking-wider mb-3">Student Access</h4>
            <p className="text-[11px] font-medium leading-relaxed text-slate-700 mb-3">
              Log in with your official Exam Number and Date of Birth to sign yearbooks, submit profile updates, and cast peer award votes.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition shadow-md shadow-emerald-700/20"
            >
              Sign In to Account
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-semibold text-slate-700">
          <p>© 2026 Government Secondary School Kubwa. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
            <p>
              Built by{' '}
              <a
                href="https://codeal.tech.blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 hover:text-emerald-950 font-black hover:underline transition"
              >
                Ige Dominion
              </a>
            </p>
            <span className="hidden sm:inline text-slate-400">•</span>
            <p>
              Admin Contact:{' '}
              <a
                href="https://wa.me/2349126055946"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline transition"
              >
                +2349126055946 (WhatsApp)
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentProfileModal
            student={selectedStudent}
            userSession={userSession}
            comments={comments.filter(c => c.studentId === selectedStudent.id)}
            userVotesMap={userVoteRecords}
            onClose={() => handleSelectStudent(null)}
            onVote={(catId) => handleVote(selectedStudent.id, catId)}
            onAddComment={(text) => handleAddComment(selectedStudent.id, text)}
            onDeleteComment={handleDeleteComment}
            onUpdateProfile={(updated) => handleUpdateStudent(selectedStudent.id, updated)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            students={students}
            onClose={() => setIsAuthOpen(false)}
            onLogin={setUserSession}
          />
        )}

        {isAdminPanelOpen && (
          <AdminPanelModal
            students={students}
            comments={comments}
            onClose={() => setIsAdminPanelOpen(false)}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onDeleteComment={handleDeleteComment}
            onApproveComment={handleApproveComment}
            onToggleFeatured={handleToggleFeatured}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
