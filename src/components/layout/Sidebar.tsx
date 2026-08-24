import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, AppView } from '../../context/AppContext';
import { 
  LayoutDashboard, Bot, Map, QrCode, Lightbulb, 
  CheckSquare, BookOpen, Clock, BarChart3, ChevronLeft, 
  ChevronRight, Lock, Sparkles, Shield, UserMinus 
} from 'lucide-react';

export const VIEW_TO_PATH: Record<AppView, string> = {
  landing: '/',
  dashboard: '/mission-control',
  assistant: '/ai-assistant',
  map: '/digital-twin-map',
  scancenter: '/scan-center',
  tacit: '/tacit-knowledge',
  verification: '/verification-queue',
  library: '/document-library',
  freshness: '/freshness',
  analytics: '/analytics',
  campaigns: '/retirement-campaigns'
};

export const Sidebar: React.FC = () => {
  const { 
    currentView, setCurrentView, sidebarCollapsed, toggleSidebar, 
    role, stats, setActiveModal 
  } = useApp();
  
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: {
    id: AppView;
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    minRole?: 'operator' | 'sme' | 'supervisor';
    requiresRoleName?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Mission Control',
      path: '/mission-control',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'assistant',
      label: 'AI Knowledge Assistant',
      path: '/ai-assistant',
      icon: <Bot className="w-5 h-5" />,
      badge: 'Live',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    },
    {
      id: 'map',
      label: 'Digital Twin Plant Map',
      path: '/digital-twin-map',
      icon: <Map className="w-5 h-5" />,
      badge: '2D Twin',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'scancenter',
      label: 'Scan & Ingestion Center',
      path: '/scan-center',
      icon: <QrCode className="w-5 h-5" />,
      badge: stats.lowStockPartsCount > 0 ? `${stats.lowStockPartsCount} alerts` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'campaigns',
      label: 'Retirement Campaigns',
      path: '/retirement-campaigns',
      icon: <UserMinus className="w-5 h-5" />,
      badge: stats.activeCampaignsCount > 0 ? `${stats.activeCampaignsCount} SMEs` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    },
    {
      id: 'tacit',
      label: 'Tacit Knowledge Capture',
      path: '/tacit-knowledge',
      icon: <Lightbulb className="w-5 h-5" />,
      minRole: 'sme',
      requiresRoleName: 'SME / Supervisor'
    },
    {
      id: 'verification',
      label: 'Verification Queue',
      path: '/verification-queue',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: stats.pendingCount > 0 ? stats.pendingCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      minRole: 'sme',
      requiresRoleName: 'SME / Supervisor'
    },
    {
      id: 'library',
      label: 'Document Library',
      path: '/document-library',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'freshness',
      label: 'Knowledge Decay & Freshness',
      path: '/freshness',
      icon: <Clock className="w-5 h-5" />,
      badge: stats.staleCount > 0 ? `${stats.staleCount} stale` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      path: '/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      minRole: 'operator'
    }
  ];

  const hasRoleAccess = (minRole?: 'operator' | 'sme' | 'supervisor') => {
    if (!minRole || minRole === 'operator') return true;
    if (minRole === 'sme') return role === 'sme' || role === 'supervisor';
    if (minRole === 'supervisor') return role === 'supervisor';
    return true;
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    const isAllowed = hasRoleAccess(item.minRole);
    if (isAllowed) {
      setCurrentView(item.id);
      navigate(item.path);
    } else {
      // Prompt role switch
      setActiveModal('login_role');
    }
  };

  return (
    <aside 
      className={`h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none z-30 shrink-0 ${
        sidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Section / Nav list */}
      <div className="p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id || location.pathname === item.path;
          const isAllowed = hasRoleAccess(item.minRole);

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                    : isAllowed
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/30 border border-transparent opacity-70'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-teal-400' : isAllowed ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600'}`}>
                  {item.icon}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {!isAllowed && (
                        <Lock className="w-3.5 h-3.5 text-slate-600" title={`Requires ${item.requiresRoleName}`} />
                      )}
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>

              {/* Floating Tooltip when Collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-slate-950 text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap z-50 animate-fade-in pointer-events-none">
                  <span>{item.label}</span>
                  {!isAllowed && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> ({item.requiresRoleName})
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-slate-800 text-teal-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Plant Status indicator & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!sidebarCollapsed && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Plant Health Index</span>
              <span className="font-mono font-bold text-emerald-400">{stats.verificationRate}% Verified</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.verificationRate}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>{stats.freshCount} Fresh</span>
              <span>{stats.staleCount} Stale</span>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

