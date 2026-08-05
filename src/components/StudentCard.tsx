import React from 'react';
import { Calendar, Briefcase, TrendingUp } from 'lucide-react';
import { Student, getStudentPhotoUrl, handleStudentImageError } from '../types';

interface StudentCardProps {
  student: Student;
  totalVotes: number;
  rank?: number;
  onSelect: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  totalVotes,
  rank,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(student)}
      className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-3.5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden backdrop-blur-md text-white"
    >
      {/* Featured Badge */}
      {student.featuredOnHome && (
        <div className="absolute top-2 right-2 z-10 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
          Featured
        </div>
      )}

      <div>
        {/* Photo Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-950 ring-1 ring-slate-800 group-hover:ring-emerald-500/50 transition duration-300">
          <img
            src={getStudentPhotoUrl(student.photoFilename)}
            alt={student.fullName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={(e) => handleStudentImageError(e, student.fullName)}
          />

          {rank !== undefined && rank <= 3 && (
            <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md ${
              rank === 1 ? 'bg-amber-400 text-slate-950' :
              rank === 2 ? 'bg-slate-300 text-slate-950' :
              'bg-amber-700 text-white'
            }`}>
              #{rank} Leader
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-white text-sm sm:text-base leading-snug mb-1 line-clamp-1 group-hover:text-emerald-400 transition">
          {student.fullName}
        </h3>

        {/* Hobbies / Career path preview if present */}
        {student.careerPath ? (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mb-2 line-clamp-1">
            <Briefcase className="w-3 h-3 text-emerald-400" /> {student.careerPath}
          </p>
        ) : (
          <p className="text-xs text-slate-400 line-clamp-1 italic mb-2">
            "{student.quote || 'Class of 2026'}"
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 mt-auto text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{student.birthDate}</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20 text-[11px]">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>{totalVotes} Votes</span>
        </div>
      </div>
    </div>
  );
};
