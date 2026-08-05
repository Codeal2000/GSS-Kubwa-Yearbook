import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Calendar, Briefcase, Heart, Mail, Phone, Award, 
  MessageSquare, Trash2, Edit2, Check, Share2, LogIn, Send, User, Upload, Clock, AlertCircle
} from 'lucide-react';
import { Student, SUPERLATIVES, UserSession, CommentItem, getStudentPhotoUrl, handleStudentImageError } from '../types';
import { SuperlativeIcon } from './SuperlativeIcon';
import { convertFileToWebp, ensureWebpFilename } from '../utils/imageUtils';

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
  const [updateFeedback, setUpdateFeedback] = useState('');
  const [commentFeedback, setCommentFeedback] = useState('');

  // Edit form state
  const [editQuote, setEditQuote] = useState(student.quote || '');
  const [editHobbies, setEditHobbies] = useState(student.hobbies || '');
  const [editCareerPath, setEditCareerPath] = useState(student.careerPath || '');
  const [editEmail, setEditEmail] = useState(student.email || '');
  const [editPhone, setEditPhone] = useState(student.phone || '');
  const [editPhotoFilename, setEditPhotoFilename] = useState(student.photoFilename || '');

  const canEdit = userSession?.role === 'admin' || (userSession?.role === 'student' && userSession.id === student.id);

  const handleSaveEdit = () => {
    const formattedPhoto = ensureWebpFilename(editPhotoFilename);
    const photoChanged = formattedPhoto !== (student.photoFilename || '');

    if (userSession?.role === 'admin') {
      onUpdateProfile({
        quote: editQuote,
        hobbies: editHobbies,
        careerPath: editCareerPath,
        email: editEmail,
        phone: editPhone,
        photoFilename: formattedPhoto,
        pendingProfileUpdate: undefined
      });
      setUpdateFeedback('Profile updated successfully.');
    } else {
      // Student role - senior quotes, career paths, hobbies, contact info update immediately. Only photo changes need approval.
      if (photoChanged) {
        onUpdateProfile({
          quote: editQuote,
          hobbies: editHobbies,
          careerPath: editCareerPath,
          email: editEmail,
          phone: editPhone,
          pendingProfileUpdate: {
            photoFilename: formattedPhoto,
            submittedAt: new Date().toLocaleDateString(),
            submittedBy: userSession?.fullName || student.fullName
          }
        });
        setUpdateFeedback('Profile info updated immediately! Your new photo has been submitted for Admin Review.');
      } else {
        onUpdateProfile({
          quote: editQuote,
          hobbies: editHobbies,
          careerPath: editCareerPath,
          email: editEmail,
          phone: editPhone,
        });
        setUpdateFeedback('Profile updated successfully.');
      }
    }
    setIsEditing(false);
    setTimeout(() => setUpdateFeedback(''), 6000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
    
    if (userSession?.role === 'student') {
      setCommentFeedback('Your signature/comment has been submitted for Admin Review and will be visible once approved.');
      setTimeout(() => setCommentFeedback(''), 6000);
    }
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

  // Filter comments for public display: approved OR authored by current user OR user is admin
  const visibleComments = comments.filter(c => {
    if (userSession?.role === 'admin') return true;
    if (c.status === 'approved') return true;
    if (userSession && c.authorId === userSession.id) return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh] text-white"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shrink-0 border-b border-emerald-900/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Student Photo */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-950 ring-4 ring-emerald-500/30 shadow-xl shrink-0">
              <img
                src={getStudentPhotoUrl(student.photoFilename)}
                alt={student.fullName}
                className="w-full h-full object-cover"
                onError={(e) => handleStudentImageError(e, student.fullName)}
              />
            </div>

            {/* Title & Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-2">
                Class of 2026 Graduate
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                {student.fullName}
              </h2>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-emerald-100/90 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
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
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" /> Edit Profile
              </button>
            )}

            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied!' : 'Share Profile'}
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {updateFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 p-3 px-6 text-xs text-emerald-300 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{updateFeedback}</span>
          </div>
        )}

        {student.pendingProfileUpdate && canEdit && (
          <div className="bg-amber-950/60 border-b border-amber-800/80 p-3 px-6 text-xs text-amber-300 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Pending Admin Approval for your new profile photo (submitted on {student.pendingProfileUpdate.submittedAt}).
            </span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/90 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>

          <button
            onClick={() => setActiveTab('voting')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'voting'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" /> Peer Awards Voting
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Signatures ({visibleComments.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* PROFILE EDIT MODE */}
          {isEditing ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/60 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" /> Edit Graduate Information
              </h3>

              {userSession?.role === 'student' && (
                <p className="text-[11px] text-amber-300 bg-amber-950/50 border border-amber-800/40 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Note: Profile picture and info changes require Admin Approval before appearing publicly.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Senior Quote</label>
                  <input
                    type="text"
                    value={editQuote}
                    onChange={(e) => setEditQuote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Enter senior quote..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Future Career Path</label>
                  <input
                    type="text"
                    value={editCareerPath}
                    onChange={(e) => setEditCareerPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g., Software Engineer, Doctor..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hobbies & Passions</label>
                  <input
                    type="text"
                    value={editHobbies}
                    onChange={(e) => setEditHobbies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g., Basketball, Chess..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Graduate Photo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editPhotoFilename}
                      onChange={(e) => setEditPhotoFilename(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      placeholder="e.g. 1.jpg or image URL"
                    />
                    <label className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
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
                              setEditPhotoFilename(webpDataUrl);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                if (uploadEvent.target?.result) {
                                  setEditPhotoFilename(uploadEvent.target.result as string);
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Public Email (Optional)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Public Phone (Optional)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30"
                >
                  {userSession?.role === 'admin' ? 'Save Changes' : 'Submit for Admin Review'}
                </button>
              </div>
            </div>
          ) : null}

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && !isEditing && (
            <div className="space-y-5">
              {/* Senior Quote Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center relative">
                <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 mb-2">Senior Quote</p>
                <p className="text-slate-200 italic text-sm sm:text-base font-medium leading-relaxed">
                  "{student.quote || 'Excellence is not a destination, it is a way of life.'}"
                </p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hobbies */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                    <Heart className="w-4 h-4" /> Hobbies & Passions
                  </div>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {student.hobbies || 'Not specified yet.'}
                  </p>
                </div>

                {/* Career Path */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" /> Future Career Goal
                  </div>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {student.careerPath || 'Exploring future opportunities.'}
                  </p>
                </div>

                {/* Optional Public Email */}
                {student.email && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                      <Mail className="w-4 h-4" /> Public Email
                    </div>
                    <a href={`mailto:${student.email}`} className="text-emerald-300 hover:underline text-xs font-mono">
                      {student.email}
                    </a>
                  </div>
                )}

                {/* Optional Public Phone */}
                {student.phone && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                      <Phone className="w-4 h-4" /> Public Phone
                    </div>
                    <a href={`tel:${student.phone}`} className="text-slate-300 hover:text-emerald-300 text-xs font-mono">
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
                <div className="bg-amber-950/50 border border-amber-800/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-amber-200 text-xs">
                  <span className="font-semibold">Log in with your Exam Number to vote on peer awards!</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shrink-0 flex items-center gap-1 shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
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
                          ? 'bg-emerald-950/60 border-emerald-500/60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          hasVoted ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-400 border border-slate-800'
                        }`}>
                          <SuperlativeIcon name={cat.iconName} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{cat.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-tight">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-2 py-1 rounded-lg">
                          {voteCount}
                        </span>

                        <button
                          onClick={() => onVote(cat.id)}
                          disabled={!userSession || hasVoted}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            hasVoted
                              ? 'bg-emerald-600 text-white cursor-default'
                              : userSession
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
              {commentFeedback && (
                <div className="bg-amber-950/60 border border-amber-800/60 p-3 rounded-xl text-amber-300 text-xs flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{commentFeedback}</span>
                </div>
              )}

              {/* Comment Input Box */}
              {userSession ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a message or wish for this graduate..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                  <span>Log in with your Exam Number to leave a signature for {student.fullName}.</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {visibleComments.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400 italic">
                    No approved yearbook signatures yet. Be the first to leave a message!
                  </p>
                ) : (
                  visibleComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-white">{comment.authorName}</span>
                          {comment.authorRole === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md">
                              ADMIN
                            </span>
                          )}
                          {comment.status === 'pending' && (
                            <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-[9px] rounded-md flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Pending Admin Review
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>

                      {(userSession?.role === 'admin' || userSession?.id === comment.authorId) && (
                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition shrink-0"
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
