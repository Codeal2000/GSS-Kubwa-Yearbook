import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, ShieldCheck, Plus, Trash2, Edit2, Star, Search, 
  MessageSquare, Users, Image as ImageIcon, Save, Check, Upload, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Student, CommentItem, getStudentPhotoUrl, handleStudentImageError } from '../types';
import { convertFileToWebp, ensureWebpFilename } from '../utils/imageUtils';

interface AdminPanelModalProps {
  students: Student[];
  comments: CommentItem[];
  onClose: () => void;
  onAddStudent: (newStudent: Partial<Student>) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteComment: (commentId: string) => void;
  onApproveComment: (commentId: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  students,
  comments,
  onClose,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteComment,
  onApproveComment,
  onToggleFeatured,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'featured' | 'students' | 'add' | 'comments'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Student Form State
  const [addName, setAddName] = useState('');
  const [addPhoto, setAddPhoto] = useState('1.jpg');
  const [addBirthDate, setAddBirthDate] = useState('15 March');
  const [addQuote, setAddQuote] = useState('Excellence is not a destination, it is a way of life.');
  const [addHobbies, setAddHobbies] = useState('');
  const [addCareer, setAddCareer] = useState('');

  // Edit Student Inline State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editCareer, setEditCareer] = useState('');

  const pendingProfileStudents = students.filter(s => Boolean(s.pendingProfileUpdate));
  const pendingComments = comments.filter(c => c.status === 'pending');
  const totalPendingCount = pendingProfileStudents.length + pendingComments.length;

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredStudents = students.filter(s => s.featuredOnHome);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    onAddStudent({
      fullName: addName.trim(),
      photoFilename: ensureWebpFilename(addPhoto.trim()) || '1.webp',
      birthDate: addBirthDate.trim() || '1 January',
      quote: addQuote.trim(),
      hobbies: addHobbies.trim(),
      careerPath: addCareer.trim(),
      votes: {
        tech_guru: 0,
        most_creative: 0,
        class_scholar: 0,
        most_famous: 0,
        best_smile: 0,
        next_ceo: 0,
        style_icon: 0,
        class_comedian: 0,
        sports_mvp: 0,
        quiet_achiever: 0,
        world_traveler: 0,
        unsung_hero: 0
      }
    });

    setAddName('');
    setAddHobbies('');
    setAddCareer('');
    setActiveTab('students');
  };

  const startInlineEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditName(student.fullName);
    setEditQuote(student.quote || '');
    setEditCareer(student.careerPath || '');
  };

  const saveInlineEdit = (id: string) => {
    onUpdateStudent(id, {
      fullName: editName,
      quote: editQuote,
      careerPath: editCareer,
    });
    setEditingStudentId(null);
  };

  const handleApproveProfile = (student: Student) => {
    if (!student.pendingProfileUpdate) return;
    const updates = student.pendingProfileUpdate;
    onUpdateStudent(student.id, {
      quote: updates.quote !== undefined ? updates.quote : student.quote,
      hobbies: updates.hobbies !== undefined ? updates.hobbies : student.hobbies,
      careerPath: updates.careerPath !== undefined ? updates.careerPath : student.careerPath,
      photoFilename: updates.photoFilename !== undefined ? updates.photoFilename : student.photoFilename,
      email: updates.email !== undefined ? updates.email : student.email,
      phone: updates.phone !== undefined ? updates.phone : student.phone,
      pendingProfileUpdate: undefined
    });
  };

  const handleRejectProfile = (studentId: string) => {
    onUpdateStudent(studentId, { pendingProfileUpdate: undefined });
  };

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
        className="relative w-full max-w-4xl bg-slate-900 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh] text-white"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 shrink-0 flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Admin Management Console</h2>
              <p className="text-xs text-emerald-400">Review student profile edits, moderate comments, and manage graduates.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/90 px-6 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" /> Review & Approvals
            {totalPendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-black rounded-full shadow-sm">
                {totalPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('featured')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'featured'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Featured Spotlight ({featuredStudents.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> All Graduates ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Add New Graduate
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Comments ({comments.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 0: PENDING APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-emerald-950/50 border border-emerald-800/60 p-4 rounded-2xl text-xs text-emerald-300">
                <h3 className="font-bold text-white mb-1 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Photo & Comment Moderation Queue
                </h3>
                <p>
                  Senior quotes, career paths, hobbies, and contact info update immediately for students. As Administrator, you only review and approve photo changes and peer comments.
                </p>
              </div>

              {/* Pending Profile Updates Section */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Pending Photo Changes ({pendingProfileStudents.length})</span>
                </h4>

                {pendingProfileStudents.length === 0 ? (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                    No student photo updates awaiting review.
                  </div>
                ) : (
                  pendingProfileStudents.map((student) => {
                    const update = student.pendingProfileUpdate!;
                    const targetStudent = student;
                    return (
                      <div key={student.id} className="bg-slate-950 p-4 rounded-2xl border border-amber-900/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={getStudentPhotoUrl(update.photoFilename || student.photoFilename)}
                              alt={student.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
                              onError={(e) => handleStudentImageError(e, student.fullName)}
                            />
                            <div>
                              <h5 className="font-bold text-sm text-white">{student.fullName}</h5>
                              <p className="text-[10px] text-slate-400">Exam No: {student.examNumber} • Submitted: {update.submittedAt}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveProfile(targetStudent)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve Photo
                            </button>
                            <button
                              onClick={() => handleRejectProfile(student.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-xs transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>

                        {/* Proposed Changes Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {update.quote && (
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-emerald-400 font-bold block">Proposed Quote:</span>
                              <span className="text-slate-200 italic">"{update.quote}"</span>
                            </div>
                          )}
                          {update.careerPath && (
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-emerald-400 font-bold block">Proposed Career Path:</span>
                              <span className="text-slate-200 font-medium">{update.careerPath}</span>
                            </div>
                          )}
                          {update.hobbies && (
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-emerald-400 font-bold block">Proposed Hobbies:</span>
                              <span className="text-slate-200">{update.hobbies}</span>
                            </div>
                          )}
                          {update.photoFilename && (
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-emerald-400 font-bold block">Proposed Photo Asset:</span>
                              <span className="text-slate-200 font-mono text-[10px] truncate block">{update.photoFilename}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pending Comments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Pending Tributes & Comments ({pendingComments.length})</span>
                </h4>

                {pendingComments.length === 0 ? (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                    No comments awaiting moderation.
                  </div>
                ) : (
                  pendingComments.map((comment) => {
                    const recipient = students.find(s => s.id === comment.studentId);
                    return (
                      <div key={comment.id} className="bg-slate-950 p-4 rounded-2xl border border-amber-900/40 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-white">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400">writing for</span>
                            <span className="font-bold text-xs text-emerald-400">{recipient?.fullName || 'Graduate'}</span>
                            <span className="text-[10px] text-slate-500">• {comment.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800">"{comment.text}"</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveComment(comment.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-xs transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}
          
          {/* TAB 1: FEATURED HOME IMAGES */}
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300">
                <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Configure Spotlight Graduates
                </h3>
                <p>
                  Click the star icon on any graduate below to pin or unpin their photo on the "Featured Spotlight" tab.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students to feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredStudents.slice(0, 24).map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 rounded-xl border transition relative flex flex-col items-center text-center ${
                      student.featuredOnHome
                        ? 'bg-amber-950/40 border-amber-500/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 mb-2 border border-slate-800">
                      <img
                        src={getStudentPhotoUrl(student.photoFilename)}
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => handleStudentImageError(e, student.fullName)}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white line-clamp-1 mb-2">
                      {student.fullName}
                    </span>
                    <button
                      onClick={() => onToggleFeatured(student.id, !student.featuredOnHome)}
                      className={`w-full py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                        student.featuredOnHome
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {student.featuredOnHome ? 'Featured' : 'Feature'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search graduates by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden">
                {filteredStudents.slice(0, 30).map((student) => (
                  <div key={student.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={getStudentPhotoUrl(student.photoFilename)}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800"
                        onError={(e) => handleStudentImageError(e, student.fullName)}
                      />
                      
                      {editingStudentId === student.id ? (
                        <div className="flex flex-col gap-1 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editCareer}
                            onChange={(e) => setEditCareer(e.target.value)}
                            placeholder="Career Path..."
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white line-clamp-1">{student.fullName}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            Exam No: {student.examNumber} • {student.careerPath || student.quote || 'Class of 2026'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {editingStudentId === student.id ? (
                        <button
                          onClick={() => saveInlineEdit(student.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startInlineEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${student.fullName}?`)) {
                            onDeleteStudent(student.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW GRADUATE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateStudent} className="space-y-4 max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Create New Graduate Record
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Birth Date</label>
                  <input
                    type="text"
                    value={addBirthDate}
                    onChange={(e) => setAddBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g. 15 March"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Graduate Photo Asset</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={addPhoto}
                      onChange={(e) => setAddPhoto(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      placeholder="1.jpg"
                    />
                    <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Browse
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const webpDataUrl = await convertFileToWebp(file);
                              setAddPhoto(webpDataUrl);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                if (uploadEvent.target?.result) {
                                  setAddPhoto(uploadEvent.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Future Career Path</label>
                  <input
                    type="text"
                    value={addCareer}
                    onChange={(e) => setAddCareer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g. Civil Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Senior Quote</label>
                <input
                  type="text"
                  value={addQuote}
                  onChange={(e) => setAddQuote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save New Graduate
              </button>
            </form>
          )}

          {/* TAB 4: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500">No comments posted yet across profiles.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-white">{comment.authorName}</span>
                        {comment.status === 'pending' && (
                          <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold rounded">
                            Pending
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300">{comment.text}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {comment.status === 'pending' && (
                        <button
                          onClick={() => onApproveComment(comment.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        title="Moderate / Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
