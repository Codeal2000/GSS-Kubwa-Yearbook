import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, ShieldCheck, Plus, Trash2, Edit2, Star, Search, 
  MessageSquare, Users, Image as ImageIcon, Save, Check
} from 'lucide-react';
import { Student, CommentItem } from '../types';

interface AdminPanelModalProps {
  students: Student[];
  comments: CommentItem[];
  onClose: () => void;
  onAddStudent: (newStudent: Partial<Student>) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteComment: (commentId: string) => void;
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
  onToggleFeatured,
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'students' | 'add' | 'comments'>('featured');
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

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredStudents = students.filter(s => s.featuredOnHome);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    onAddStudent({
      fullName: addName.trim(),
      photoFilename: addPhoto.trim() || '1.jpg',
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
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Admin Management Console</h2>
              <p className="text-xs text-slate-400">Specify home page images, manage student records, and moderate comments.</p>
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('featured')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'featured'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" /> Featured Home Images ({featuredStudents.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Manage Students ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-500" /> Add New Graduate
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Comments Moderation ({comments.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: FEATURED HOME IMAGES */}
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-900">
                <h3 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" /> Configure First Page Spotlight Images
                </h3>
                <p>
                  Click the star icon on any graduate below to pin or unpin their profile picture on the "Featured Spotlight" home view.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students to feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredStudents.slice(0, 24).map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 rounded-xl border transition relative flex flex-col items-center text-center ${
                      student.featuredOnHome
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                      <img
                        src={`/photos/${student.photoFilename}`}
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=4f46e5&color=ffffff`;
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-2">
                      {student.fullName}
                    </span>
                    <button
                      onClick={() => onToggleFeatured(student.id, !student.featuredOnHome)}
                      className={`w-full py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                        student.featuredOnHome
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden">
                {filteredStudents.slice(0, 30).map((student) => (
                  <div key={student.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={`/photos/${student.photoFilename}`}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                        onError={(e: any) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=4f46e5&color=ffffff`;
                        }}
                      />
                      
                      {editingStudentId === student.id ? (
                        <div className="flex flex-col gap-1 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={editCareer}
                            onChange={(e) => setEditCareer(e.target.value)}
                            placeholder="Career Path..."
                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{student.fullName}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {student.careerPath || student.quote || 'Class of 2026'}
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
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
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
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
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
            <form onSubmit={handleCreateStudent} className="space-y-4 max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> Create New Graduate Record
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Birth Date</label>
                  <input
                    type="text"
                    value={addBirthDate}
                    onChange={(e) => setAddBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. 15 March"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Photo Filename / URL</label>
                  <input
                    type="text"
                    value={addPhoto}
                    onChange={(e) => setAddPhoto(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="1.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Future Career Path</label>
                  <input
                    type="text"
                    value={addCareer}
                    onChange={(e) => setAddCareer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Civil Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senior Quote</label>
                <input
                  type="text"
                  value={addQuote}
                  onChange={(e) => setAddQuote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save New Graduate
              </button>
            </form>
          )}

          {/* TAB 4: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No comments posted yet across profiles.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700">{comment.text}</p>
                    </div>

                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition shrink-0"
                      title="Moderate / Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
