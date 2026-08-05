import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, increment, setDoc, deleteDoc, addDoc 
} from 'firebase/firestore';
import { getInitialStudents, seedStudentsToFirestore } from './seedData';
import { Student, CommentItem, UserSession, SUPERLATIVES, getStudentPhotoUrl, handleStudentImageError } from './types';
import { Navbar } from './components/Navbar';
import { StudentCard } from './components/StudentCard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Pagination } from './components/Pagination';
import { SuperlativeIcon } from './components/SuperlativeIcon';
import heroBanner from './assets/images/yearbook_hero_banner_1785861274504.jpg';
import { 
  GraduationCap, Trophy, Users, Star, 
  Award, HeartHandshake, Search, Filter, ShieldCheck, Check,
  ArrowRight, ChevronRight, BookOpen
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
      // Ease out quad
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
  
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'birthdays' | 'halloffame'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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

  // Track votes cast by current user: studentId -> categoryId -> true
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('gss_kubwa_user_votes_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Local vote override store to ensure instant UI responsiveness
  const [localVotes, setLocalVotes] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem('gss_kubwa_local_votes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save session & votes to local storage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('gss_kubwa_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('gss_kubwa_user_session');
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('gss_kubwa_user_votes_map', JSON.stringify(userVotes));
  }, [userVotes]);

  useEffect(() => {
    localStorage.setItem('gss_kubwa_local_votes', JSON.stringify(localVotes));
  }, [localVotes]);

  // Load students from Firestore or fallback to local dataset
  useEffect(() => {
    let unsubscribeStudents = () => {};
    let unsubscribeComments = () => {};

    try {
      const qStudents = query(collection(db, 'students'), orderBy('fullName'));
      unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
        if (!snapshot.empty) {
          const studentList: Student[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              fullName: data.fullName || '',
              examNumber: data.examNumber || docSnap.id,
              photoFilename: data.photoFilename || '',
              birthDate: data.birthDate || '',
              votes: data.votes || {},
              quote: data.quote || "Excellence is not a destination, it's a way of life. GSS Kubwa Class of 2026!",
              hobbies: data.hobbies || '',
              careerPath: data.careerPath || '',
              email: data.email || '',
              phone: data.phone || '',
              featuredOnHome: Boolean(data.featuredOnHome),
            };
          });
          setStudents(studentList);
        } else {
          // Initialize local 714 students dataset if empty
          const initial = getInitialStudents();
          setStudents(initial);
          // Silently seed Firestore in background for future sessions
          seedStudentsToFirestore().catch(err => console.warn("Background seed notice:", err));
        }
        setLoading(false);
      }, (err) => {
        console.warn("Firestore offline or restricted, using local 714 graduate dataset:", err);
        setStudents(getInitialStudents());
        setLoading(false);
      });

      // Load comments
      const qComments = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      unsubscribeComments = onSnapshot(qComments, (snapshot) => {
        if (!snapshot.empty) {
          const commentList: CommentItem[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              studentId: data.studentId || '',
              authorId: data.authorId || '',
              authorName: data.authorName || 'Anonymous',
              authorRole: data.authorRole || 'student',
              text: data.text || '',
              createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently'
            };
          });
          setComments(commentList);
        }
      }, (err) => {
        console.warn("Comments snapshot notice:", err);
      });

    } catch (err) {
      console.error("Firestore connection failed:", err);
      setStudents(getInitialStudents());
      setLoading(false);
    }

    return () => {
      unsubscribeStudents();
      unsubscribeComments();
    };
  }, []);

  // Compute total votes for a student (combining remote + local extra votes)
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

  const getTotalStudentVotes = (student: Student) => {
    const counts = getStudentVoteCounts(student);
    return Object.values(counts).reduce((a, b) => a + b, 0);
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
      if (list.length === 0) list = students.slice(0, 12); // Fallback if no featured chosen
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
      }).slice(0, 30);
    }

    return list;
  }, [students, searchTerm, activeTab, selectedCategory, currentMonthDay, localVotes]);

  // Birthday matches count
  const birthdayMatches = useMemo(() => {
    return students.filter(s => s.birthDate.toLowerCase() === currentMonthDay.toLowerCase());
  }, [students, currentMonthDay]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, selectedCategory]);

  // Handle Voting (1 vote per user per category per student)
  const handleVote = async (studentId: string, categoryId: string) => {
    if (!userSession) {
      setIsAuthOpen(true);
      return;
    }

    const currentStudentVotes = userVotes[studentId] || {};
    if (currentStudentVotes[categoryId]) {
      alert("You have already voted for this category on this student!");
      return;
    }

    // Update local state immediately for instant feedback
    setLocalVotes(prev => {
      const studentLocal = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: {
          ...studentLocal,
          [categoryId]: (studentLocal[categoryId] || 0) + 1
        }
      };
    });

    setUserVotes(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [categoryId]: true
      }
    }));

    // Async update to Firestore
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`votes.${categoryId}`]: increment(1)
      });

      // Record vote history in Firestore
      const voteDocId = `${userSession.id}_${studentId}_${categoryId}`;
      await setDoc(doc(db, 'user_votes', voteDocId), {
        userId: userSession.id,
        studentId,
        categoryId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore vote update saved locally:", err);
    }
  };

  // Comments handlers
  const handleAddComment = async (studentId: string, text: string) => {
    if (!userSession) {
      setIsAuthOpen(true);
      return;
    }

    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      studentId,
      authorId: userSession.id,
      authorName: userSession.fullName,
      authorRole: userSession.role,
      text,
      createdAt: new Date().toLocaleDateString()
    };

    setComments(prev => [newComment, ...prev]);

    try {
      await addDoc(collection(db, 'comments'), {
        studentId,
        authorId: userSession.id,
        authorName: userSession.fullName,
        authorRole: userSession.role,
        text,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore comment saved locally:", e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (e) {
      console.warn("Firestore comment deletion:", e);
    }
  };

  // Student Profile Updates
  const handleUpdateStudent = async (id: string, updatedData: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => prev ? { ...prev, ...updatedData } : null);
    }
    try {
      await updateDoc(doc(db, 'students', id), updatedData);
    } catch (e) {
      console.warn("Firestore update:", e);
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

    setStudents(prev => [fullStudent, ...prev]);

    try {
      await setDoc(doc(db, 'students', id), fullStudent);
    } catch (e) {
      console.warn("Firestore create:", e);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudent?.id === id) setSelectedStudent(null);
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (e) {
      console.warn("Firestore delete:", e);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    handleUpdateStudent(id, { featuredOnHome: featured });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/20 flex flex-col">
      {/* Header Navigation */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUserSession(null)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        birthdayCount={birthdayMatches.length}
        totalStudents={students.length}
      />

      {/* Hero / Spotlight Section on First View */}
      {activeTab === 'all' && !searchTerm && (
        <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
          {/* Background Large Hero Image with Glassmorphic Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBanner}
              alt="GSS Kubwa Class of 2026 Celebration"
              className="w-full h-full object-cover object-center opacity-30 scale-105 transform transition duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Welcoming Information Card */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 font-bold text-xs shadow-md">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Government Secondary School, Kubwa</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Welcome to the Official <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-amber-200">
                    Class of 2026 Yearbook
                  </span>
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
                  A timeless digital memory book preserving graduate profiles, senior quotes, peer award votes, and personal tributes for our graduating seniors.
                </p>

                {/* Glassmorphic Stats Bar with Animated Counters */}
                <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 rounded-2xl hover:bg-white/20 hover:border-white/30 transition duration-300 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-2">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-lg sm:text-xl font-black text-white">
                      <AnimatedCounter target={students.length || 714} />
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Graduates</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 rounded-2xl hover:bg-white/20 hover:border-white/30 transition duration-300 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-2">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <p className="text-lg sm:text-xl font-black text-white">
                      <AnimatedCounter target={12} />
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Peer Awards</p>
                  </div>
                </div>

                {/* Navigation CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const element = document.getElementById('graduates-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
                  >
                    Browse Graduates
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                  </button>

                  <button
                    onClick={() => setActiveTab('halloffame')}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition duration-200 flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Vote Peer Awards
                  </button>
                </div>
              </div>

              {/* Right Column: Featured Spotlight Glassmorphic Showcase */}
              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-5 rounded-3xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
                        Graduate Spotlight
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('featured')}
                      className="text-[11px] font-bold text-indigo-300 hover:text-white transition flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {students.slice(0, 6).map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="group relative rounded-2xl overflow-hidden bg-slate-800/80 border border-white/15 aspect-[4/5] cursor-pointer shadow-md hover:-translate-y-1 hover:border-amber-400/60 transition duration-300"
                      >
                        <img
                          src={getStudentPhotoUrl(student.photoFilename)}
                          alt={student.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => handleStudentImageError(e, student.fullName)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-2 flex flex-col justify-end">
                          <p className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-amber-300 transition">
                            {student.fullName.split(' ')[0]}
                          </p>
                          <p className="text-[8px] text-slate-300 line-clamp-1 font-semibold">
                            {student.careerPath || 'Class of 2026'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Peer Awards Sub-Category Filter */}
      {activeTab === 'halloffame' && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 py-4 px-4 sm:px-6 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Select Peer Award Leaderboard
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Overall Most Voted
              </button>

              {SUPERLATIVES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <SuperlativeIcon name={cat.iconName} className="w-3.5 h-3.5 text-amber-400" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <main id="graduates-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold text-slate-400">
            Showing <span className="text-white font-extrabold">{filteredStudents.length}</span> graduates
            {activeTab === 'birthdays' && ` celebrating on ${currentMonthDay}`}
            {activeTab === 'featured' && ` featured on home spotlight`}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-semibold text-xs">Loading Yearbook Archives...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-xl backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No graduates found</h3>
            <p className="text-slate-400 text-xs mb-5">
              {activeTab === 'birthdays'
                ? `No student birthdays recorded for ${currentMonthDay}.`
                : `No results match "${searchTerm}". Check the spelling.`}
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/30"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <>
            {/* Student Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              <AnimatePresence mode="popLayout">
                {paginatedStudents.map((student, index) => {
                  const totalVotes = getTotalStudentVotes(student);
                  const globalRank = activeTab === 'halloffame' ? (currentPage - 1) * itemsPerPage + index + 1 : undefined;

                  return (
                    <motion.div
                      layout
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <StudentCard
                        student={student}
                        totalVotes={totalVotes}
                        rank={globalRank}
                        onSelect={setSelectedStudent}
                      />
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
      </main>

      {/* Modern Multi-Column Dark Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">GSS KUBWA 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Government Secondary School, Kubwa Digital Yearbook Archive. Honoring memories, friendships, and future milestones.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => { setActiveTab('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-indigo-400 transition">All Graduates</button></li>
              <li><button onClick={() => { setActiveTab('featured'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-indigo-400 transition">Featured Spotlight</button></li>
              <li><button onClick={() => { setActiveTab('halloffame'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-indigo-400 transition">Peer Awards Leaderboard</button></li>
              <li><button onClick={() => { setActiveTab('birthdays'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-indigo-400 transition">Birthdays Today</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Graduation Highlights</h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <p>📍 Location: GSS Kubwa Campus, Abuja</p>
              <p>🎓 Class Count: {students.length} Registered Graduates</p>
              <p>🏆 Award Categories: 12 Peer Award Titles</p>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Student Access</h4>
            <p className="text-[11px] leading-relaxed mb-3">
              Log in with your official index or graduate account to sign yearbooks, submit quotes, and cast peer award votes.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition shadow-md shadow-indigo-600/20"
            >
              Sign In to Account
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 Government Secondary School Kubwa. All Rights Reserved.</p>
          <p className="text-slate-500">Class of 2026 Official Digital Archive</p>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentProfileModal
            student={selectedStudent}
            userSession={userSession}
            comments={comments.filter(c => c.studentId === selectedStudent.id)}
            userVotesMap={userVotes[selectedStudent.id] || {}}
            onClose={() => setSelectedStudent(null)}
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
            onToggleFeatured={handleToggleFeatured}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
