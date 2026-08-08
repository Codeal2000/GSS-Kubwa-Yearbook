import React from 'react';
import { Database, ShieldAlert, ArrowRight, Server, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface MaintenanceBannerProps {
  onAdminLoginClick?: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ onAdminLoginClick }) => {
  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-900 text-white shadow-xl relative overflow-hidden border-b-4 border-amber-300">
      {/* Background Decorative Patterns */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Main Notice */}
          <div className="flex items-start sm:items-center gap-4 text-left w-full lg:w-auto">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
              <Database className="w-7 h-7 text-amber-200 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 bg-amber-900/60 text-amber-200 border border-amber-300/40 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm">
                  <Server className="w-3 h-3 text-amber-300" /> System Notice & Infrastructure Upgrade
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950/70 text-emerald-300 rounded-full text-[10px] font-bold">
                  System Upgrade in Progress
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Temporary Platform Pause — Infrastructure Upgrade
              </h2>

              <p className="text-xs sm:text-sm text-amber-50/95 font-medium max-w-3xl leading-relaxed">
                We are currently migrating to a more robust cloud infrastructure to serve you better with faster load speeds, instant image rendering, and smooth voting for the GSS Kubwa 2026 Yearbook. Interactive features are temporarily paused while systems are being upgraded.
              </p>
            </div>
          </div>

          {/* Action & Status Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <div className="w-full sm:w-auto bg-slate-950/40 border border-amber-300/30 rounded-2xl p-3.5 text-xs space-y-1 text-amber-100">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>Backend Sync Status</span>
              </div>
              <p className="text-[11px] text-amber-50/80">
                All uploaded photos & student profiles are safe and queued for sync.
              </p>
            </div>

            {onAdminLoginClick && (
              <button
                onClick={onAdminLoginClick}
                className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-amber-50 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-black/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
