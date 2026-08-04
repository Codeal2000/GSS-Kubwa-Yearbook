import React from 'react';
import { 
  GraduationCap, Search, Users, PartyPopper, Trophy, 
  Sparkles, LogIn, LogOut, ShieldCheck, UserCheck, Settings
} from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: 'all' | 'featured' | 'birthdays' | 'halloffame';
  setActiveTab: (tab: 'all' | 'featured' | 'birthdays' | 'halloffame') => void;
  userSession: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdminPanel: () => void;
  birthdayCount: number;
  totalStudents: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  userSession,
  onOpenAuth,
  onLogout,
  onOpenAdminPanel,
  birthdayCount,
  totalStudents
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3.5">
          
          {/* Logo & School Title */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('all')}>
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  GSS KUBWA <span className="text-indigo-600">2026</span>
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  Digital Yearbook Archive • <span className="text-indigo-600 font-bold">{totalStudents} Graduates</span>
                </p>
              </div>
            </div>

            {/* Mobile Auth Button */}
            <div className="md:hidden flex items-center gap-2">
              {userSession ? (
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Log In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search graduates by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* User Auth Info & Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {userSession?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Settings className="w-4 h-4 text-indigo-400" /> Admin Control
              </button>
            )}

            {userSession ? (
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 pr-3 rounded-xl border border-slate-200">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${userSession.role === 'admin' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                  {userSession.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{userSession.fullName}</p>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">
                    {userSession.role === 'admin' ? 'Administrator' : 'Logged Student'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 p-1 text-slate-400 hover:text-slate-700 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" /> Student / Admin Login
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> All Graduates
          </button>

          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Featured Spotlight
          </button>

          <button
            onClick={() => setActiveTab('birthdays')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'birthdays'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PartyPopper className="w-4 h-4 text-amber-500" /> Birthdays Today
            {birthdayCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 font-black rounded-full">
                {birthdayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('halloffame')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'halloffame'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" /> Superlatives & Hall of Fame
          </button>
        </div>
      </div>
    </header>
  );
};
