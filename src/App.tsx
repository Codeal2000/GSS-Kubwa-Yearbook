import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, increment, setDoc, deleteDoc, addDoc 
} from 'firebase/firestore';
import { getInitialStudents, seedStudentsToFirestore } from './seedData';
import { Student, CommentItem, UserSession, SUPERLATIVES, getStudentPhotoUrl } from './types';
import { Navbar } from './components/Navbar';
import { StudentCard } from './components/StudentCard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Pagination } from './components/Pagination';
import { SuperlativeIcon } from './components/SuperlativeIcon';
import { 
  Sparkles, Trophy, Users, Star, PartyPopper, 
  Award, HeartHandshake, Search, Filter, ShieldCheck, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <section className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mb-4">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Government Secondary School, Kubwa
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                Celebrating the Extraordinary <span className="text-indigo-600">Class of 2026</span>
              </h1>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                Explore the official digital yearbook archive. Discover graduate profiles, vote in 12 superlative categories, and leave personal signatures and memories.
              </p>

              {/* Action Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{students.length}</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Graduates</p>
                  </div>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">12 Categories</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Superlatives</p>
                  </div>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Signatures</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Yearbook Tributes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Images Spotlight Preview */}
            <div className="w-full md:w-auto grid grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-lg">
              {students.slice(0, 6).map((student, i) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer relative group shadow-xs"
                >
                  <img
                    src={getStudentPhotoUrl(student.photoFilename)}
                    alt={student.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e: any) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=4f46e5&color=ffffff`;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-2 text-white">
                    <p className="text-[10px] font-bold line-clamp-1">{student.fullName.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hall of Fame Sub-Category Filter */}
      {activeTab === 'halloffame' && (
        <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Select Superlative Leaderboard
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <SuperlativeIcon name={cat.iconName} className="w-3.5 h-3.5" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900">{filteredStudents.length}</span> graduates
            {activeTab === 'birthdays' && ` celebrating on ${currentMonthDay}`}
            {activeTab === 'featured' && ` featured on home spotlight`}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold text-xs">Loading Yearbook Archives...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No graduates found</h3>
            <p className="text-slate-500 text-xs mb-5">
              {activeTab === 'birthdays'
                ? `No student birthdays recorded for ${currentMonthDay}.`
                : `No results match "${searchTerm}". Check the spelling.`}
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
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

            {/* Pagination Controls (No Endless Scrolls) */}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <p className="font-semibold">
          GSS Kubwa Class of 2026 Digital Yearbook • All Rights Reserved
        </p>
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
