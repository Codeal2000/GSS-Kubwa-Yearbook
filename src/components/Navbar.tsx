import React from 'react';
import { 
  Search, Users, Trophy, Cake, Star,
  LogIn, LogOut, ShieldCheck, UserCheck, Settings, Award
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
  pendingApprovalsCount?: number;
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
  totalStudents,
  pendingApprovalsCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-3">
          
          {/* Logo & School Title */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('all')}>
              <div className="w-11 h-11 bg-slate-900 border border-emerald-500/40 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-md shadow-emerald-950/50 group-hover:border-emerald-400 transition">
                <img
                  src="/photos/gsskubwalogo.jpg"
                  alt="GSS Kubwa Logo"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none flex items-center gap-1.5">
                  GSS KUBWA <span className="text-emerald-400">2026</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                  Digital Yearbook • <span className="text-emerald-400 font-bold">{totalStudents} Graduates</span>
                </p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-2">
              {userSession?.role === 'admin' && (
                <button
                  onClick={onOpenAdminPanel}
                  className="relative p-2 text-slate-200 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold transition"
                  title="Admin Console"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  {pendingApprovalsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-black text-slate-950">
                      !
                    </span>
                  )}
                </button>
              )}
              {userSession ? (
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search graduate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>

          {/* User Auth Info & Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {userSession?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="relative px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Settings className="w-4 h-4 text-emerald-400" /> Admin Console
                {pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {userSession ? (
              <div className="flex items-center gap-2.5 bg-slate-900/90 p-1.5 pr-3 rounded-xl border border-slate-800">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${userSession.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  {userSession.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white line-clamp-1">{userSession.fullName}</p>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                    {userSession.role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-1 p-1 text-slate-400 hover:text-white transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/30"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-800/80 no-scrollbar touch-pan-x flex-nowrap w-full scroll-smooth">
          <button
            onClick={() => setActiveTab('all')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> All Graduates
          </button>

          <button
            onClick={() => setActiveTab('featured')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            Featured Spotlight
          </button>

          <button
            onClick={() => setActiveTab('birthdays')}
            className={`shrink-0 relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'birthdays'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Cake className="w-3.5 h-3.5 text-rose-400" /> Birthdays Today
            {birthdayCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white font-extrabold rounded-full">
                {birthdayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('halloffame')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'halloffame'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Peer Awards & Hall of Fame
          </button>
        </div>
      </div>
    </header>
  );
};
