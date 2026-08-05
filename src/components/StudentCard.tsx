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
      className="group bg-white hover:bg-emerald-50/40 border border-emerald-100/90 hover:border-emerald-400 rounded-2xl p-3.5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden text-slate-900"
    >
      {/* Featured Badge */}
      {student.featuredOnHome && (
        <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
          Featured
        </div>
      )}

      <div>
        {/* Photo Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-emerald-50/50 ring-1 ring-emerald-100 group-hover:ring-emerald-400 transition duration-300">
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
              rank === 2 ? 'bg-slate-200 text-slate-900' :
              'bg-emerald-800 text-white'
            }`}>
              #{rank} Leader
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-1 line-clamp-1 group-hover:text-emerald-700 transition">
          {student.fullName}
        </h3>

        {/* Hobbies / Career path preview if present */}
        {student.careerPath ? (
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mb-2 line-clamp-1">
            <Briefcase className="w-3 h-3 text-emerald-600" /> {student.careerPath}
          </p>
        ) : (
          <p className="text-xs text-slate-500 line-clamp-1 italic mb-2">
            "{student.quote || 'Class of 2026'}"
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2.5 border-t border-emerald-100 mt-auto text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{student.birthDate}</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span>{totalVotes} Votes</span>
        </div>
      </div>
    </div>
  );
};
