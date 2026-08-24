import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import { ChandraAsriLogo } from '../common/ChandraAsriLogo';
import { 
  Cpu, Search, ShieldCheck, Wrench, Microscope, 
  ChevronDown, Bell, RotateCcw, Sparkles, ExternalLink, 
  AlertTriangle, Check, Layers, Compass 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentView, setCurrentView, role, setRole, currentUser, 
    stats, resetToInitialData, setActiveModal, globalSearchQuery, 
    setGlobalSearchQuery, sendChatMessage 
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      setCurrentView('assistant');
      sendChatMessage(globalSearchQuery.trim());
      setGlobalSearchQuery('');
    }
  };

  const getRoleIcon = (r: Role) => {
    switch (r) {
      case 'operator':
        return <Wrench className="w-3.5 h-3.5 text-teal-400" />;
      case 'sme':
        return <Microscope className="w-3.5 h-3.5 text-cyan-400" />;
      case 'supervisor':
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const roleColors: Record<Role, { badge: string; text: string }> = {
    operator: { badge: 'bg-teal-500/20 border-teal-500/40 text-teal-300', text: 'Operator' },
    sme: { badge: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', text: 'Senior SME' },
    supervisor: { badge: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', text: 'Supervisor' }
  };

  const totalAlerts = stats.pendingCount + stats.staleCount + stats.lowStockPartsCount + stats.knowledgeGapsCount;

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 sm:px-6">
      {/* Brand & Landing Toggle */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => setCurrentView('landing')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          {/* PetroKnow Emblem */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 p-0.5 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-teal-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-100 font-sans">
                Petro<span className="text-teal-400">Know</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 border border-slate-700">
                PROTOTYPE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 -mt-0.5 hidden sm:inline">AI Manufacturing Knowledge Hub</span>
          </div>

          {/* Company Sponsor Globe */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
            <ChandraAsriLogo size={22} showWordmark={true} />
          </div>
        </div>

        {/* Public Landing Shortcut if inside app */}
        {currentView !== 'landing' && (
          <button
            onClick={() => setCurrentView('landing')}
            className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800/60 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Public Overview</span>
          </button>
        )}
      </div>

      {/* Global AI Search Bar (Active across app) */}
      {currentView !== 'landing' && (
        <form 
          onSubmit={handleGlobalSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-6"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Ask AI or search equipment (e.g., compressor vibration, EQ-CMP-204)..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-20 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-semibold border border-teal-500/30 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Ask</span>
            </button>
          </div>
        </form>
      )}

      {/* Right Controls: Role Switcher, Alerts, Reset & User */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data (Discreet helper) */}
        <button
          onClick={resetToInitialData}
          title="Reset all prototype state to initial demo seed"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Notifications & System Alerts Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            title="System alerts & pending actions"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold flex items-center justify-center shadow">
                {totalAlerts}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-fade-in text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200">System Attention Alerts</span>
                <span className="text-[10px] text-slate-400 font-mono">{totalAlerts} pending items</span>
              </div>
              <div className="space-y-1.5">
                {stats.pendingCount > 0 && (
                  <div 
                    onClick={() => { setCurrentView('verification'); setNotificationsOpen(false); }}
                    className="cursor-pointer p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center justify-between"
                  >
                    <span className="text-amber-300 font-medium">Pending Verifications</span>
                    <span className="font-mono font-bold text-amber-400">{stats.pendingCount} entries</span>
                  </div>
                )}
                {stats.staleCount > 0 && (
                  <div 
                    onClick={() => { setCurrentView('freshness'); setNotificationsOpen(false); }}
                    className="cursor-pointer p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center justify-between"
                  >
                    <span className="text-rose-300 font-medium">Stale Knowledge Entries</span>
                    <span className="font-mono font-bold text-rose-400">{stats.staleCount} overdue</span>
                  </div>
                )}
                {stats.lowStockPartsCount > 0 && (
                  <div 
                    onClick={() => { setCurrentView('scancenter'); setNotificationsOpen(false); }}
                    className="cursor-pointer p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center justify-between"
                  >
                    <span className="text-cyan-300 font-medium">Low Stock Spare Parts</span>
                    <span className="font-mono font-bold text-cyan-400">{stats.lowStockPartsCount} alerts</span>
                  </div>
                )}
                {stats.knowledgeGapsCount > 0 && (
                  <div 
                    onClick={() => { setCurrentView('analytics'); setNotificationsOpen(false); }}
                    className="cursor-pointer p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center justify-between"
                  >
                    <span className="text-indigo-300 font-medium">Unresolved Knowledge Gaps</span>
                    <span className="font-mono font-bold text-indigo-400">{stats.knowledgeGapsCount} items</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${roleColors[role].badge}`}
          >
            {getRoleIcon(role)}
            <span className="text-xs font-bold font-sans hidden sm:inline">{roleColors[role].text}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-2 z-50 animate-fade-in text-xs space-y-1">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Switch Active Role</span>
              </div>
              {(['operator', 'sme', 'supervisor'] as Role[]).map((r) => {
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                      isActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(r)}
                      <div>
                        <p className="font-bold text-xs">{INITIAL_USERS[r].title}</p>
                        <p className="text-[10px] text-slate-400">{INITIAL_USERS[r].name}</p>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-teal-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div 
          onClick={() => setActiveModal('login_role')}
          className="cursor-pointer flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
          title="Click to switch user persona"
        >
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40"
          />
        </div>
      </div>
    </header>
  );
};
