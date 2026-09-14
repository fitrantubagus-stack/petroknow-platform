import React, { useEffect, useRef, Component, ErrorInfo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp, AppView } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/layout/LandingPage';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { DigitalTwinMapView } from './components/digitaltwin/DigitalTwinMapView';
import { ScanCenterView } from './components/scanner/ScanCenterView';
import { RetirementCampaignView } from './components/campaigns/RetirementCampaignView';
import { TacitKnowledgeView } from './components/tacit/TacitKnowledgeView';
import { VerificationQueueView } from './components/verification/VerificationQueueView';
import { DocumentLibraryView } from './components/library/DocumentLibraryView';
import { FreshnessManagerView } from './components/freshness/FreshnessManagerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ContactView } from './components/contact/ContactView';

// Modals
import { AboutDevsModal } from './components/modals/AboutDevsModal';
import { LoginModal } from './components/modals/LoginModal';
import { EquipmentDetailModal } from './components/modals/EquipmentDetailModal';
import { SparePartDetailModal } from './components/modals/SparePartDetailModal';
import { KnowledgeDetailModal } from './components/modals/KnowledgeDetailModal';
import { DocDetailModal } from './components/modals/DocDetailModal';
import { CaseStudyModal } from './components/modals/CaseStudyModal';

const PATH_TO_VIEW_MAP: Record<string, AppView> = {
  '/': 'landing',
  '/contact': 'contact',
  '/mission-control': 'dashboard',
  '/dashboard': 'dashboard',
  '/app': 'dashboard',
  '/missioncontrol': 'dashboard',
  '/ai-assistant': 'assistant',
  '/assistant': 'assistant',
  '/digital-twin-map': 'map',
  '/map': 'map',
  '/scan-center': 'scancenter',
  '/scanner': 'scancenter',
  '/retirement-campaigns': 'campaigns',
  '/campaigns': 'campaigns',
  '/tacit-knowledge': 'tacit',
  '/tacit': 'tacit',
  '/verification-queue': 'verification',
  '/verification': 'verification',
  '/document-library': 'library',
  '/library': 'library',
  '/freshness': 'freshness',
  '/analytics': 'analytics'
};

const VIEW_TO_PATH_MAP: Record<AppView, string> = {
  landing: '/',
  contact: '/contact',
  dashboard: '/mission-control',
  assistant: '/ai-assistant',
  map: '/digital-twin-map',
  scancenter: '/scan-center',
  campaigns: '/retirement-campaigns',
  tacit: '/tacit-knowledge',
  verification: '/verification-queue',
  library: '/document-library',
  freshness: '/freshness',
  analytics: '/analytics'
};

// Route wrapper that renders with the app layout (Navbar + Sidebar)
const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950/70">
          {children}
        </main>
      </div>
    </div>
  );
};

const SmartFallbackRoute: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  if (path.includes('mission-control') || path.includes('missioncontrol') || path.includes('dashboard')) {
    return <Navigate to="/mission-control" replace />;
  }
  if (path.includes('assistant') || path.includes('ai')) {
    return <Navigate to="/ai-assistant" replace />;
  }
  if (path.includes('map') || path.includes('twin')) {
    return <Navigate to="/digital-twin-map" replace />;
  }
  return <Navigate to="/" replace />;
};

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, setActiveModal, closeMobileSidebar } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // Sync URL changes to AppContext view
  useEffect(() => {
    closeMobileSidebar();
    const cleanPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const view = PATH_TO_VIEW_MAP[cleanPath];
    if (view && view !== currentView) {
      setCurrentView(view);
    } else if (cleanPath === '/login') {
      setActiveModal('login_role');
      navigate('/mission-control', { replace: true });
    }
  }, [location.pathname]);

  // Sync programmatic view changes to URL (only when intentionally changed by user action)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const targetPath = VIEW_TO_PATH_MAP[currentView];
    const cleanPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (targetPath && cleanPath !== targetPath) {
      navigate(targetPath);
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Routes>
        {/* Landing Page (Public View) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactView />} />

        {/* Authenticated Workspace Pages */}
        <Route 
          path="/mission-control" 
          element={
            <AppLayoutWrapper>
              <DashboardView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <AppLayoutWrapper>
              <AiAssistantView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/digital-twin-map" 
          element={
            <AppLayoutWrapper>
              <DigitalTwinMapView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/scan-center" 
          element={
            <AppLayoutWrapper>
              <ScanCenterView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/retirement-campaigns" 
          element={
            <AppLayoutWrapper>
              <RetirementCampaignView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/tacit-knowledge" 
          element={
            <AppLayoutWrapper>
              <TacitKnowledgeView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/verification-queue" 
          element={
            <AppLayoutWrapper>
              <VerificationQueueView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/document-library" 
          element={
            <AppLayoutWrapper>
              <DocumentLibraryView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/freshness" 
          element={
            <AppLayoutWrapper>
              <FreshnessManagerView />
            </AppLayoutWrapper>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <AppLayoutWrapper>
              <AnalyticsView />
            </AppLayoutWrapper>
          } 
        />

        {/* Route Aliases */}
        <Route path="/dashboard" element={<Navigate to="/mission-control" replace />} />
        <Route path="/app" element={<Navigate to="/mission-control" replace />} />
        <Route path="/missioncontrol" element={<Navigate to="/mission-control" replace />} />
        <Route path="/map" element={<Navigate to="/digital-twin-map" replace />} />
        <Route path="/assistant" element={<Navigate to="/ai-assistant" replace />} />
        <Route path="/scanner" element={<Navigate to="/scan-center" replace />} />
        <Route path="/library" element={<Navigate to="/document-library" replace />} />
        <Route path="/campaigns" element={<Navigate to="/retirement-campaigns" replace />} />
        <Route path="/tacit" element={<Navigate to="/tacit-knowledge" replace />} />
        <Route path="/verification" element={<Navigate to="/verification-queue" replace />} />

        {/* Fallback */}
        <Route path="*" element={<SmartFallbackRoute />} />
      </Routes>

      {/* Global Modals rendered on top of any active route */}
      <AboutDevsModal />
      <LoginModal />
      <EquipmentDetailModal />
      <SparePartDetailModal />
      <KnowledgeDetailModal />
      <DocDetailModal />
      <CaseStudyModal />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PetroKnow ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleResetStorage = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('petroknow_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
    window.location.href = '/mission-control';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none">
          <div className="max-w-lg w-full p-8 rounded-2xl bg-slate-900/95 border border-teal-500/30 shadow-2xl shadow-teal-500/10 space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">PetroKnow Diagnostic Notice</h1>
                <p className="text-xs text-teal-400 font-mono">WORKSPACE RUNTIME RECOVERY</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The application encountered a component exception. You can reload the mission control workspace or perform a clean cache flush without losing system definitions.
            </p>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 break-words max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Workspace</span>
              </button>
              <button
                onClick={this.handleResetStorage}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache & Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

