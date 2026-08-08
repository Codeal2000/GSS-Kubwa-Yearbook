import React from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Clock, CheckCircle, Award, Sparkles, Eye, EyeOff, Lock } from 'lucide-react';
import { Student, SUPERLATIVES, getStudentPhotoUrl, handleStudentImageError } from '../types';
import { SuperlativeIcon } from './SuperlativeIcon';
import { UserVotesMap } from '../utils/votingSystem';

interface StudentPortalBannerProps {
  student: Student;
  onEditProfile: () => void;
  onSelectCategoryVote: (catId: string) => void;
  userVotesMap: UserVotesMap | Record<string, boolean>;
  showClassmates: boolean;
  setShowClassmates: (show: boolean) => void;
}

export const StudentPortalBanner: React.FC<StudentPortalBannerProps> = ({
  student,
  onEditProfile,
  onSelectCategoryVote,
  userVotesMap,
  showClassmates,
  setShowClassmates,
}) => {
  const displayPhoto = student.pendingProfileUpdate?.photoFilename || student.photoFilename;
  const isPending = Boolean(student.pendingProfileUpdate?.photoFilename);

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 mb-8 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Student Avatar & Quick Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-400/40 shadow-lg">
              <img
                src={getStudentPhotoUrl(displayPhoto)}
                alt={student.fullName}
                className="w-full h-full object-cover"
                onError={(e) => handleStudentImageError(e, student.fullName)}
              />
            </div>
            {isPending && (
              <span className="absolute -bottom-2 inset-x-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase text-center py-0.5 rounded-full shadow-md tracking-wider">
                Pending Review
              </span>
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> My Student Account
              </span>
              <span className="text-xs font-mono text-emerald-200/80">Exam No: {student.examNumber}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {student.fullName}
            </h2>

            <p className="text-xs text-emerald-100/90 italic max-w-xl line-clamp-2">
              "{student.quote || 'GSS Kubwa Class of 2026'}"
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={onEditProfile}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit My Profile & Photo
              </button>

              <button
                onClick={() => setShowClassmates(!showClassmates)}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {showClassmates ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showClassmates ? 'Hide Classmates List' : 'Browse Other Classmates'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Status Notice */}
        <div className="w-full lg:w-auto bg-slate-950/40 border border-emerald-500/20 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile Active & Verified</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
            {isPending
              ? 'Your photo update has been submitted and is currently pending Admin Review.'
              : 'Your profile details and photo are live on the official 2026 yearbook site.'}
          </p>
        </div>

      </div>

      {/* Peer Awards Voting Shortcuts Bar */}
      <div className="mt-6 pt-6 border-t border-emerald-700/40">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> Cast Your Votes in Peer Award Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {SUPERLATIVES.map((cat) => {
            const hasVoted = Boolean(userVotesMap[cat.id]);
            const count = student.votes?.[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategoryVote(cat.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 text-[11px] font-bold ${
                  hasVoted
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-emerald-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <SuperlativeIcon name={cat.iconName} className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-mono text-emerald-300">{count} votes</span>
                </div>
                <span className="truncate text-[11px] font-semibold">{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
