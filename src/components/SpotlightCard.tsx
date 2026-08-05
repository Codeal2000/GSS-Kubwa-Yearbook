import React from 'react';
import { Sparkles, Calendar, Briefcase, TrendingUp, Quote, Heart, Award } from 'lucide-react';
import { Student, getStudentPhotoUrl, handleStudentImageError } from '../types';

interface SpotlightCardProps {
  student: Student;
  totalVotes: number;
  onSelect: (student: Student) => void;
  isCompact?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  student,
  totalVotes,
  onSelect,
  isCompact = false,
}) => {
  if (isCompact) {
    return (
      <div
        onClick={() => onSelect(student)}
        className="group relative bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 border-2 border-amber-300/80 hover:border-amber-400 rounded-3xl p-4 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-500/15 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
      >
        {/* Glow Tag */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3 h-3 text-slate-950 animate-pulse" />
            Spotlight
          </span>
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
            {totalVotes} Votes
          </span>
        </div>

        {/* Student Photo & Overview */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-emerald-950 ring-2 ring-amber-400/80 shadow-md shrink-0">
            <img
              src={getStudentPhotoUrl(student.photoFilename)}
              alt={student.fullName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => handleStudentImageError(e, student.fullName)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-950 text-sm sm:text-base leading-snug truncate group-hover:text-amber-700 transition">
              {student.fullName}
            </h4>
            {student.careerPath ? (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5 truncate">
                <Briefcase className="w-3 h-3 text-amber-600 shrink-0" /> {student.careerPath}
              </p>
            ) : (
              <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                Class of 2026
              </p>
            )}
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-emerald-600 shrink-0" /> {student.birthDate}
            </p>
          </div>
        </div>

        {/* Quote Highlight */}
        {student.quote && (
          <div className="bg-white/80 border border-amber-200/60 rounded-xl p-2.5 text-xs italic text-slate-700 line-clamp-2 relative">
            <Quote className="w-3 h-3 text-amber-400 inline inline-block mr-1 opacity-75" />
            "{student.quote}"
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(student)}
      className="group relative bg-gradient-to-br from-amber-50 via-white to-emerald-50/40 border-2 border-amber-300/90 hover:border-amber-400 rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden text-slate-900"
    >
      {/* Top Banner Tag */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1.5 z-10">
        <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
        Featured Spotlight
      </div>

      <div>
        {/* Main Photo & Header Area */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4 pt-2">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 ring-4 ring-amber-300/80 shadow-xl shrink-0 group-hover:ring-amber-400 transition duration-300">
            <img
              src={getStudentPhotoUrl(student.photoFilename)}
              alt={student.fullName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => handleStudentImageError(e, student.fullName)}
            />
            <div className="absolute inset-0 ring-1 ring-black/10 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-tight mb-1 group-hover:text-amber-700 transition">
              {student.fullName}
            </h3>

            {student.careerPath ? (
              <p className="text-xs sm:text-sm text-emerald-800 font-bold flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{student.careerPath}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium mb-2">GSS Kubwa Graduate</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {student.birthDate}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                {totalVotes} Peer Votes
              </span>
            </div>
          </div>
        </div>

        {/* Featured Student Quote Highlight */}
        {student.quote ? (
          <div className="relative bg-white/90 border border-amber-200/80 rounded-2xl p-3.5 mb-3 shadow-inner text-xs sm:text-sm italic text-slate-800 leading-relaxed">
            <Quote className="w-4 h-4 text-amber-400 absolute top-3 left-3 opacity-40" />
            <p className="pl-5 font-serif">"{student.quote}"</p>
          </div>
        ) : (
          <div className="relative bg-white/90 border border-emerald-100 rounded-2xl p-3 mb-3 text-xs italic text-slate-600">
            <p className="font-serif">"Empowered to excel and lead the future — Class of 2026."</p>
          </div>
        )}

        {/* Hobbies / Memory Preview */}
        {student.hobbies && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Passions: <strong className="text-slate-900">{student.hobbies}</strong></span>
          </div>
        )}
      </div>

      {/* Footer Callout */}
      <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold">
        <span className="text-amber-800 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-600" /> Spotlight Profile
        </span>
        <span className="text-emerald-700 group-hover:translate-x-1 transition duration-200">
          View Full Profile &rarr;
        </span>
      </div>
    </div>
  );
};
