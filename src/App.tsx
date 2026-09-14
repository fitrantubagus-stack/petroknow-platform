import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp, AppView } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/layout/LandingPage';

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

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;

