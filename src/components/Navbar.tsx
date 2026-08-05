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
  const handleTabClick = (tabId: 'all' | 'featured' | 'birthdays' | 'halloffame') => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-3">
          
          {/* Logo & School Title */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('all')}>
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-sm group-hover:border-emerald-500 transition">
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
                <h1 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight leading-none flex items-center gap-1.5">
                  GSS KUBWA <span className="text-emerald-600">2026</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1">
                  Digital Yearbook • <span className="text-emerald-700 font-bold">{totalStudents} Graduates</span>
                </p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-2">
              {userSession?.role === 'admin' && (
                <button
                  onClick={onOpenAdminPanel}
                  className="relative p-2 text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold transition hover:bg-emerald-100"
                  title="Admin Console"
                >
                  <Settings className="w-4 h-4 text-emerald-700" />
                  {pendingApprovalsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                      !
                    </span>
                  )}
                </button>
              )}
              {userSession ? (
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="text"
              placeholder="Search graduate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* User Auth Info & Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {userSession?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="relative px-3 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 text-emerald-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Settings className="w-4 h-4 text-emerald-700" /> Admin Console
                {pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white font-black text-[10px] rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {userSession ? (
              <div className="flex items-center gap-2.5 bg-white p-1.5 pr-3 rounded-xl border border-emerald-200 shadow-sm">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${userSession.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  {userSession.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{userSession.fullName}</p>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700">
                    {userSession.role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-1 p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-emerald-100 no-scrollbar touch-pan-x flex-nowrap w-full">
          <button
            onClick={() => handleTabClick('all')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-emerald-900/80 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> All Graduates
          </button>

          <button
            onClick={() => handleTabClick('featured')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-emerald-900/80 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            Featured Spotlight
          </button>

          <button
            onClick={() => handleTabClick('birthdays')}
            className={`shrink-0 relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'birthdays'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-emerald-900/80 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <Cake className="w-3.5 h-3.5 text-rose-500" /> Birthdays Today
            {birthdayCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white font-extrabold rounded-full">
                {birthdayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('halloffame')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'halloffame'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-emerald-900/80 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Peer Awards & Hall of Fame
          </button>
        </div>
      </div>
    </header>
  );
};
