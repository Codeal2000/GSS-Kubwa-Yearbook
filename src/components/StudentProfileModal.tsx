import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Calendar, Briefcase, Heart, Mail, Phone, Sparkles, 
  MessageSquare, Trash2, Edit2, Check, Share2, LogIn, Send, User, Upload
} from 'lucide-react';
import { Student, SUPERLATIVES, UserSession, CommentItem, getStudentPhotoUrl, handleStudentImageError } from '../types';
import { SuperlativeIcon } from './SuperlativeIcon';

interface StudentProfileModalProps {
  student: Student;
  userSession: UserSession | null;
  comments: CommentItem[];
  userVotesMap: Record<string, boolean>; // superlativeId -> boolean
  onClose: () => void;
  onVote: (category: string) => void;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdateProfile: (updatedData: Partial<Student>) => void;
  onOpenAuth: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  userSession,
  comments,
  userVotesMap,
  onClose,
  onVote,
  onAddComment,
  onDeleteComment,
  onUpdateProfile,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'voting' | 'comments'>('profile');
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editQuote, setEditQuote] = useState(student.quote || '');
  const [editHobbies, setEditHobbies] = useState(student.hobbies || '');
  const [editCareerPath, setEditCareerPath] = useState(student.careerPath || '');
  const [editEmail, setEditEmail] = useState(student.email || '');
  const [editPhone, setEditPhone] = useState(student.phone || '');
  const [editPhotoFilename, setEditPhotoFilename] = useState(student.photoFilename || '');

  const canEdit = userSession?.role === 'admin' || (userSession?.role === 'student' && userSession.id === student.id);

  const handleSaveEdit = () => {
    onUpdateProfile({
      quote: editQuote,
      hobbies: editHobbies,
      careerPath: editCareerPath,
      email: editEmail,
      phone: editPhone,
      photoFilename: editPhotoFilename
    });
    setIsEditing(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  const handleShare = () => {
    const shareText = `Check out ${student.fullName}'s profile on the GSS Kubwa Class of 2026 Digital Yearbook!`;
    if (navigator.share) {
      navigator.share({
        title: `${student.fullName} - GSS Kubwa 2026`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Student Photo */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-white/20 shadow-xl shrink-0">
              <img
                src={getStudentPhotoUrl(student.photoFilename)}
                alt={student.fullName}
                className="w-full h-full object-cover"
                onError={(e) => handleStudentImageError(e, student.fullName)}
              />
            </div>

            {/* Title & Info (Registration ID is strictly hidden) */}
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-bold border border-indigo-400/30 mb-2">
                Class of 2026 Graduate
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                {student.fullName}
              </h2>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-indigo-100/90 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  Birthday: {student.birthDate}
                </span>
                {student.careerPath && (
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                    {student.careerPath}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Share & Edit */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/10">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}

            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied!' : 'Share Profile'}
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>

          <button
            onClick={() => setActiveTab('voting')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'voting'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Cast Superlatives
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Signatures & Comments ({comments.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* PROFILE EDIT MODE */}
          {isEditing ? (
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" /> Edit Student Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quote</label>
                  <input
                    type="text"
                    value={editQuote}
                    onChange={(e) => setEditQuote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter senior quote..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Future Career Path</label>
                  <input
                    type="text"
                    value={editCareerPath}
                    onChange={(e) => setEditCareerPath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g., Software Engineer, Doctor..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hobbies & Passions</label>
                  <input
                    type="text"
                    value={editHobbies}
                    onChange={(e) => setEditHobbies(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g., Basketball, Chess, Graphic Design..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduate Photo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editPhotoFilename}
                      onChange={(e) => setEditPhotoFilename(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. 1.jpg or paste image URL"
                    />
                    <label className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              if (uploadEvent.target?.result) {
                                setEditPhotoFilename(uploadEvent.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Upload an image file from your laptop, or type filename (e.g. 1.jpg).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Public Email (Optional)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Public Phone (Optional)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : null}

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && !isEditing && (
            <div className="space-y-5">
              {/* Senior Quote Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center relative">
                <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">Senior Quote</p>
                <p className="text-slate-800 italic text-sm font-medium leading-relaxed">
                  "{student.quote || 'Excellence is not a destination, it is a way of life.'}"
                </p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hobbies */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                    <Heart className="w-4 h-4" /> Hobbies & Interests
                  </div>
                  <p className="text-slate-700 text-xs font-medium">
                    {student.hobbies || 'Not specified yet.'}
                  </p>
                </div>

                {/* Career Path */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                    <Briefcase className="w-4 h-4" /> Future Career Goal
                  </div>
                  <p className="text-slate-700 text-xs font-medium">
                    {student.careerPath || 'Exploring future opportunities.'}
                  </p>
                </div>

                {/* Optional Public Email */}
                {student.email && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                      <Mail className="w-4 h-4" /> Public Email
                    </div>
                    <a href={`mailto:${student.email}`} className="text-indigo-600 hover:underline text-xs font-medium">
                      {student.email}
                    </a>
                  </div>
                )}

                {/* Optional Public Phone */}
                {student.phone && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                      <Phone className="w-4 h-4" /> Public Phone
                    </div>
                    <a href={`tel:${student.phone}`} className="text-slate-700 hover:text-indigo-600 text-xs font-medium">
                      {student.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VOTING (SUPERLATIVES) */}
          {activeTab === 'voting' && (
            <div className="space-y-4">
              {!userSession && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs">
                  <span className="font-semibold">Log in to cast your votes on superlative categories!</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shrink-0 flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Log In
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPERLATIVES.map((cat) => {
                  const voteCount = student.votes?.[cat.id] || 0;
                  const hasVoted = Boolean(userVotesMap[cat.id]);

                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        hasVoted
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          hasVoted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <SuperlativeIcon name={cat.iconName} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{cat.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-tight">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                          {voteCount}
                        </span>

                        <button
                          onClick={() => onVote(cat.id)}
                          disabled={!userSession || hasVoted}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            hasVoted
                              ? 'bg-emerald-600 text-white cursor-default'
                              : userSession
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {hasVoted ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS & YEARBOOK SIGNATURES */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comment Input Box */}
              {userSession ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a message, signature, or wish for this graduate..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </form>
              ) : (
                <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                  <span>Log in to leave a signature or message for {student.fullName}.</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                  >
                    Log In
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400 italic">
                    No yearbook signatures yet. Be the first to leave a message!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-900">{comment.authorName}</span>
                          {comment.authorRole === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md">
                              ADMIN
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{comment.text}</p>
                      </div>

                      {(userSession?.role === 'admin' || userSession?.id === comment.authorId) && (
                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition shrink-0"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
