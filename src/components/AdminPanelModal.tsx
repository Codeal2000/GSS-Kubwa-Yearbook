import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, ShieldCheck, Plus, Trash2, Edit2, Star, Search, 
  MessageSquare, Users, Image as ImageIcon, Save, Check, Upload, Clock, CheckCircle, XCircle, FileArchive, RefreshCw,
  ChevronDown, ChevronUp, Eye, Info, Award
} from 'lucide-react';
import JSZip from 'jszip';
import { Student, CommentItem, getStudentPhotoUrl, handleStudentImageError } from '../types';
import { convertFileToWebp, ensureWebpFilename } from '../utils/imageUtils';
import { uploadStudentPhotoToStorage } from '../lib/supabase';
import { getVotingConfig, saveVotingConfig } from '../utils/votingSystem';

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
  const [activeTab, setActiveTab] = useState<'approvals' | 'featured' | 'students' | 'add' | 'bulkPhotos' | 'comments' | 'votingControls'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');

  // Voting Controls State
  const [votingClosed, setVotingClosed] = useState(() => getVotingConfig().isVotingClosed);
  const [votingDeadline, setVotingDeadline] = useState(() => getVotingConfig().votingDeadline);
  const [votingSaveMessage, setVotingSaveMessage] = useState('');

  // Bulk ZIP State
  const [zipProcessing, setZipProcessing] = useState(false);
  const [zipStatus, setZipStatus] = useState('');
  const [processedCount, setProcessedCount] = useState(0);

  // Add Student Form State
  const [addName, setAddName] = useState('');
  const [addPhoto, setAddPhoto] = useState('1.jpg');
  const [addBirthDate, setAddBirthDate] = useState('15 March');
  const [addQuote, setAddQuote] = useState('Excellence is not a destination, it is a way of life.');
  const [addHobbies, setAddHobbies] = useState('');
  const [addCareer, setAddCareer] = useState('');

  // Expanded Student Info State
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Edit Student Inline State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editExamNumber, setEditExamNumber] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editHobbies, setEditHobbies] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const pendingProfileStudents = students.filter(s => Boolean(s.pendingProfileUpdate));
  const pendingComments = comments.filter(c => c.status === 'pending');
  const totalPendingCount = pendingProfileStudents.length + pendingComments.length;

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredStudents = students.filter(s => s.featuredOnHome);

  const handleProcessZipFile = async (file: File) => {
    setZipProcessing(true);
    setZipStatus('Reading ZIP archive...');
    try {
      const zip = await JSZip.loadAsync(file);
      let matchedCount = 0;
      const fileNames = Object.keys(zip.files);
      setZipStatus(`Found ${fileNames.length} items in archive. Extracting student photos...`);

      for (let i = 0; i < fileNames.length; i++) {
        const fname = fileNames[i];
        const zipEntry = zip.files[fname];
        if (zipEntry.dir) continue;

        const cleanName = fname.split('/').pop() || '';
        if (!cleanName.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        setZipStatus(`Processing ${cleanName} (${i + 1}/${fileNames.length})...`);
        const fileBlob = await zipEntry.async('blob');
        const imgFile = new File([fileBlob], cleanName, { type: fileBlob.type || 'image/jpeg' });
        const webpDataUrl = await convertFileToWebp(imgFile);

        const nameWithoutExt = cleanName.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase().trim();

        // Match student by filename, index, or full name
        const target = students.find(s => {
          const sPhoto = (s.photoFilename || '').toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '').trim();
          if (sPhoto === nameWithoutExt) return true;
          
          const sNum = (s.photoFilename || '').replace(/\D/g, '');
          if (sNum && sNum === nameWithoutExt.replace(/\D/g, '')) return true;

          const sNameNorm = s.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const fNameNorm = nameWithoutExt.replace(/[^a-z0-9]/g, '');
          return sNameNorm.length > 3 && fNameNorm.length > 3 && (sNameNorm.includes(fNameNorm) || fNameNorm.includes(sNameNorm));
        });

        if (target) {
          onUpdateStudent(target.id, { photoFilename: webpDataUrl, pendingProfileUpdate: undefined });
          matchedCount++;
        } else {
          // Index fallback if name is a pure number (e.g., 1.jpg -> student 1)
          const num = parseInt(nameWithoutExt, 10);
          if (!isNaN(num) && num >= 1 && num <= students.length) {
            const studentByIdx = students[num - 1];
            if (studentByIdx) {
              onUpdateStudent(studentByIdx.id, { photoFilename: webpDataUrl, pendingProfileUpdate: undefined });
              matchedCount++;
            }
          }
        }
      }
      setProcessedCount(matchedCount);
      setZipStatus(`Success! Unzipped and attached photos to ${matchedCount} student profiles.`);
    } catch (err: any) {
      setZipStatus(`Error reading zip file: ${err.message || 'Invalid archive'}`);
    } finally {
      setZipProcessing(false);
    }
  };

  const handleMultipleFiles = async (files: FileList) => {
    setZipProcessing(true);
    let matchedCount = 0;
    setZipStatus(`Processing ${files.length} image files...`);

    for (let i = 0; i < files.length; i++) {
      const imgFile = files[i];
      if (!imgFile.type.startsWith('image/') && !imgFile.name.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

      const cleanName = imgFile.name;
      setZipStatus(`Converting ${cleanName} (${i + 1}/${files.length})...`);
      const webpDataUrl = await convertFileToWebp(imgFile);
      const nameWithoutExt = cleanName.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase().trim();

      const target = students.find(s => {
        const sPhoto = (s.photoFilename || '').toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '').trim();
        if (sPhoto === nameWithoutExt) return true;
        const numOnly = nameWithoutExt.replace(/\D/g, '');
        if (numOnly && s.photoFilename.replace(/\D/g, '') === numOnly) return true;
        return false;
      });

      if (target) {
        onUpdateStudent(target.id, { photoFilename: webpDataUrl, pendingProfileUpdate: undefined });
        matchedCount++;
      } else {
        const num = parseInt(nameWithoutExt, 10);
        if (!isNaN(num) && num >= 1 && num <= students.length) {
          const studentByIdx = students[num - 1];
          if (studentByIdx) {
            onUpdateStudent(studentByIdx.id, { photoFilename: webpDataUrl, pendingProfileUpdate: undefined });
            matchedCount++;
          }
        }
      }
    }
    setProcessedCount(matchedCount);
    setZipStatus(`Success! Directly processed and assigned ${matchedCount} photos.`);
    setZipProcessing(false);
  };

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
    setEditExamNumber(student.examNumber || student.id);
    setEditBirthDate(student.birthDate || '');
    setEditPhoto(student.photoFilename || '');
    setEditQuote(student.quote || '');
    setEditCareer(student.careerPath || '');
    setEditHobbies(student.hobbies || '');
    setEditEmail(student.email || '');
    setEditPhone(student.phone || '');
  };

  const saveInlineEdit = (id: string) => {
    onUpdateStudent(id, {
      fullName: editName,
      examNumber: editExamNumber,
      birthDate: editBirthDate,
      photoFilename: editPhoto,
      quote: editQuote,
      careerPath: editCareer,
      hobbies: editHobbies,
      email: editEmail,
      phone: editPhone,
      pendingProfileUpdate: undefined
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-4xl bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh] text-slate-900"
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 shrink-0 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Admin Management Console</h2>
              <p className="text-xs text-emerald-200">Review edits, batch upload zip photos, and manage graduates.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-emerald-100 bg-emerald-50/60 px-6 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" /> Review Queue
            {totalPendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-black rounded-full shadow-sm">
                {totalPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bulkPhotos')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bulkPhotos'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <FileArchive className="w-4 h-4 text-emerald-600" /> Batch Zip / Photo Import
          </button>

          <button
            onClick={() => setActiveTab('featured')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'featured'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            Featured ({featuredStudents.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Users className="w-4 h-4" /> All Graduates ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" /> Add Graduate
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" /> Comments ({comments.length})
          </button>

          <button
            onClick={() => setActiveTab('votingControls')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'votingControls'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" /> Voting Settings
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 0: PENDING APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900">
                <h3 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Photo & Comment Moderation Queue
                </h3>
                <p>
                  Senior quotes, career paths, hobbies, and contact info update immediately for students. As Administrator, you only review and approve photo changes and peer comments.
                </p>
              </div>

              {/* Pending Profile Updates Section */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Pending Photo Changes ({pendingProfileStudents.length})</span>
                  {pendingProfileStudents.length > 0 && (
                    <button
                      onClick={() => {
                        pendingProfileStudents.forEach(s => handleApproveProfile(s));
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve All ({pendingProfileStudents.length})
                    </button>
                  )}
                </h4>

                {pendingProfileStudents.length === 0 ? (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No student photo updates awaiting review.
                  </div>
                ) : (
                  pendingProfileStudents.map((student) => {
                    const update = student.pendingProfileUpdate!;
                    const targetStudent = student;
                    return (
                      <div key={student.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={getStudentPhotoUrl(update.photoFilename || student.photoFilename)}
                              alt={student.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-emerald-200"
                              onError={(e) => handleStudentImageError(e, student.fullName)}
                            />
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{student.fullName}</h5>
                              <p className="text-[10px] text-slate-500">Exam No: {student.examNumber} • Submitted: {update.submittedAt}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveProfile(targetStudent)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve Photo
                            </button>
                            <button
                              onClick={() => handleRejectProfile(student.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold rounded-xl text-xs transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>

                        {/* Proposed Changes Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {update.quote && (
                            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[10px] text-emerald-800 font-bold block">Proposed Quote:</span>
                              <span className="text-slate-800 italic">"{update.quote}"</span>
                            </div>
                          )}
                          {update.careerPath && (
                            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[10px] text-emerald-800 font-bold block">Proposed Career Path:</span>
                              <span className="text-slate-800 font-medium">{update.careerPath}</span>
                            </div>
                          )}
                          {update.hobbies && (
                            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[10px] text-emerald-800 font-bold block">Proposed Hobbies:</span>
                              <span className="text-slate-800">{update.hobbies}</span>
                            </div>
                          )}
                          {update.photoFilename && (
                            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[10px] text-emerald-800 font-bold block">Proposed Photo Asset:</span>
                              <span className="text-slate-800 font-mono text-[10px] truncate block">{update.photoFilename}</span>
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
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Pending Tributes & Comments ({pendingComments.length})</span>
                </h4>

                {pendingComments.length === 0 ? (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No comments awaiting moderation.
                  </div>
                ) : (
                  pendingComments.map((comment) => {
                    const recipient = students.find(s => s.id === comment.studentId);
                    return (
                      <div key={comment.id} className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-500">writing for</span>
                            <span className="font-bold text-xs text-emerald-700">{recipient?.fullName || 'Graduate'}</span>
                            <span className="text-[10px] text-slate-400">• {comment.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">"{comment.text}"</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveComment(comment.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold rounded-xl text-xs transition flex items-center gap-1"
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

          {/* TAB: BULK ZIP & PHOTO IMPORT */}
          {activeTab === 'bulkPhotos' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-950">
                <h3 className="font-bold text-sm text-emerald-900 mb-1 flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-emerald-600" /> Batch Upload Zip Archive of Graduate Photos
                </h3>
                <p className="leading-relaxed">
                  Upload a single <strong>.ZIP file</strong> containing all student photos (or select multiple image files at once). 
                  Our system automatically extracts and attaches each image to the corresponding graduate profile based on file names (e.g., <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-emerald-800">1.jpg</code> attaches to Student #1, or matching by full student name/exam number).
                </p>
              </div>

              {/* Upload Dropzone Box */}
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-3xl p-8 text-center hover:bg-emerald-50 hover:border-emerald-500 transition duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-700 shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                
                <h4 className="font-extrabold text-base text-slate-900 mb-1">
                  Upload ZIP Archive or Multiple Photos
                </h4>
                <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
                  Drag and drop your <strong>.zip file</strong> containing student photos here, or click below to browse files from your computer.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-md shadow-emerald-700/20 flex items-center gap-2">
                    <FileArchive className="w-4 h-4" /> Select .ZIP Archive
                    <input
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessZipFile(file);
                      }}
                    />
                  </label>

                  <label className="px-5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs cursor-pointer transition shadow-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-700" /> Select Image Files
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleMultipleFiles(e.target.files);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Status Box */}
              {(zipStatus || zipProcessing) && (
                <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                  zipProcessing ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  {zipProcessing ? (
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{zipProcessing ? 'Processing Batch Upload...' : 'Batch Import Complete'}</p>
                    <p className="text-xs mt-0.5">{zipStatus}</p>
                  </div>
                </div>
              )}

              {/* Automatic Matching Rules */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">How Automatic Photo Matching Works</h5>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                  <li><strong>By Student Number:</strong> Files named <code className="bg-slate-100 px-1 rounded font-mono">1.jpg</code>, <code className="bg-slate-100 px-1 rounded font-mono">2.png</code>, etc., directly map to Student #1, #2, and so forth.</li>
                  <li><strong>By Name:</strong> Files containing student names (e.g. <code className="bg-slate-100 px-1 rounded font-mono">chinedu_okonkwo.jpg</code>) match student profile names automatically.</li>
                  <li><strong>Format Support:</strong> Automatically converts JPG, PNG, and WebP files to compressed WebP data format for high speed loading.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 1: FEATURED HOME IMAGES */}
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-950">
                <h3 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Configure Spotlight Graduates
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredStudents.slice(0, 24).map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 rounded-xl border transition relative flex flex-col items-center text-center ${
                      student.featuredOnHome
                        ? 'bg-amber-50 border-amber-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                      <img
                        src={getStudentPhotoUrl(student.photoFilename)}
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => handleStudentImageError(e, student.fullName)}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 line-clamp-1 mb-2">
                      {student.fullName}
                    </span>
                    <button
                      onClick={() => onToggleFeatured(student.id, !student.featuredOnHome)}
                      className={`w-full py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                        student.featuredOnHome
                          ? 'bg-amber-500 text-white font-extrabold shadow-sm'
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                {filteredStudents.slice(0, 50).map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const isEditing = editingStudentId === student.id;

                  return (
                    <div key={student.id} className="divide-y divide-slate-100">
                      <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/30 transition">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={getStudentPhotoUrl(student.photoFilename)}
                            alt={student.fullName}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                            onError={(e) => handleStudentImageError(e, student.fullName)}
                          />
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{student.fullName}</h4>
                            <p className="text-[10px] text-emerald-800 font-semibold line-clamp-1">
                              Exam / Student No: <span className="font-bold font-mono text-slate-900">{student.examNumber || student.id}</span> • DOB: <span className="font-bold text-slate-900">{student.birthDate}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              isExpanded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title="Toggle Full Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {isExpanded ? 'Hide Record' : 'Full Record'}
                          </button>

                          {isEditing ? (
                            <button
                              onClick={() => saveInlineEdit(student.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                startInlineEdit(student);
                                setExpandedStudentId(student.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg transition"
                              title="Edit All Fields"
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
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED FULL RECORD INSPECTION / EDIT DRAWER */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-800 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h5 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Complete Student Profile Record
                            </h5>
                            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                              ID: {student.id}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Full Student Name</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Exam / Student Number</label>
                                <input
                                  type="text"
                                  value={editExamNumber}
                                  onChange={(e) => setEditExamNumber(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Date of Birth (DOB)</label>
                                <input
                                  type="text"
                                  value={editBirthDate}
                                  onChange={(e) => setEditBirthDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Photo Filename Asset / Upload</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editPhoto}
                                    onChange={(e) => setEditPhoto(e.target.value)}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                                    placeholder="1.webp or image data"
                                  />
                                  <label className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition shrink-0 flex items-center gap-1 shadow-xs">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Browse</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const webpDataUrl = await convertFileToWebp(file);
                                            const finalUrl = await uploadStudentPhotoToStorage(file, webpDataUrl);
                                            setEditPhoto(finalUrl);
                                          } catch (err) {
                                            console.error("Failed to convert/upload image:", err);
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Future Career Goal</label>
                                <input
                                  type="text"
                                  value={editCareer}
                                  onChange={(e) => setEditCareer(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Hobbies & Passions</label>
                                <input
                                  type="text"
                                  value={editHobbies}
                                  onChange={(e) => setEditHobbies(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Email Address</label>
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Phone Number</label>
                                <input
                                  type="text"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Senior Quote</label>
                                <textarea
                                  rows={2}
                                  value={editQuote}
                                  onChange={(e) => setEditQuote(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveInlineEdit(student.id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                                >
                                  Save All Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Full Student Number</span>
                                <span className="font-bold text-slate-900 font-mono text-xs">{student.examNumber || student.id}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Date of Birth (DOB)</span>
                                <span className="font-bold text-slate-900 text-xs">{student.birthDate || 'Not set'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Photo File Asset</span>
                                <span className="font-bold text-slate-900 font-mono text-xs truncate block">{student.photoFilename || 'None'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Career Path</span>
                                <span className="font-bold text-slate-900 text-xs">{student.careerPath || 'None specified'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Hobbies & Passions</span>
                                <span className="font-bold text-slate-900 text-xs">{student.hobbies || 'None specified'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Email / Phone</span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {student.email || student.phone ? `${student.email || ''} ${student.phone || ''}` : 'None registered'}
                                </span>
                              </div>
                              <div className="sm:col-span-2 md:col-span-3 bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">Senior Quote</span>
                                <p className="italic text-slate-800 text-xs font-medium">"{student.quote || 'No quote specified.'}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW GRADUATE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateStudent} className="space-y-4 max-w-xl mx-auto bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Birth Date</label>
                  <input
                    type="text"
                    value={addBirthDate}
                    onChange={(e) => setAddBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g. 15 March"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduate Photo Asset</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={addPhoto}
                      onChange={(e) => setAddPhoto(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      placeholder="1.jpg"
                    />
                    <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
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
                              const finalUrl = await uploadStudentPhotoToStorage(file, webpDataUrl);
                              setAddPhoto(finalUrl);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = async (uploadEvent) => {
                                if (uploadEvent.target?.result) {
                                  const dataUrl = uploadEvent.target.result as string;
                                  const finalUrl = await uploadStudentPhotoToStorage(file, dataUrl);
                                  setAddPhoto(finalUrl);
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Future Career Path</label>
                  <input
                    type="text"
                    value={addCareer}
                    onChange={(e) => setAddCareer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5"
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
                  <div key={comment.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900">{comment.authorName}</span>
                        {comment.status === 'pending' && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold rounded">
                            Pending
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700">{comment.text}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {comment.status === 'pending' && (
                        <button
                          onClick={() => onApproveComment(comment.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
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

          {/* TAB 5: VOTING CONTROL SETTINGS */}
          {activeTab === 'votingControls' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Peer Award Voting Controls
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage voting duration, set closing deadlines, or close access across all categories. Voters have 24 hours from casting a vote to revoke or change it.
                </p>
              </div>

              {votingSaveMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{votingSaveMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Close Voting Across All Categories</h4>
                    <p className="text-xs text-slate-500">
                      When enabled, all voting and vote modifications are suspended across the entire platform.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVotingClosed(!votingClosed)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      votingClosed
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {votingClosed ? '🔒 Voting Closed' : '✅ Voting Active'}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-sm font-bold text-slate-900">
                    Set Voting Deadline (Automatic Closure)
                  </label>
                  <p className="text-xs text-slate-500">
                    Optionally pick a deadline. Once this date and time passes, voting will close automatically.
                  </p>
                  <input
                    type="datetime-local"
                    value={votingDeadline}
                    onChange={(e) => setVotingDeadline(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  {votingDeadline && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      Voting deadline set for: {new Date(votingDeadline).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveVotingConfig({
                        isVotingClosed: votingClosed,
                        votingDeadline: votingDeadline
                      });
                      setVotingSaveMessage('Voting controls updated and published successfully!');
                      setTimeout(() => setVotingSaveMessage(''), 4000);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-900/10 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Voting Settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
