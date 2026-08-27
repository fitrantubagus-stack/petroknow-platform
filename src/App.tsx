import React, { useEffect } from 'react';
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

const PATH_TO_VIEW_MAP: Record<string, AppView> = {
  '/': 'landing',
  '/contact': 'contact',
  '/mission-control': 'dashboard',
  '/ai-assistant': 'assistant',
  '/digital-twin-map': 'map',
  '/scan-center': 'scancenter',
  '/retirement-campaigns': 'campaigns',
  '/tacit-knowledge': 'tacit',
  '/verification-queue': 'verification',
  '/document-library': 'library',
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

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, setActiveModal } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync URL changes to AppContext view
  useEffect(() => {
    const view = PATH_TO_VIEW_MAP[location.pathname];
    if (view && view !== currentView) {
      setCurrentView(view);
    } else if (location.pathname === '/login') {
      setActiveModal('login_role');
      navigate('/mission-control', { replace: true });
    }
  }, [location.pathname]);

  // Sync programmatic view changes to URL
  useEffect(() => {
    const targetPath = VIEW_TO_PATH_MAP[currentView];
    if (targetPath && location.pathname !== targetPath) {
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals rendered on top of any active route */}
      <AboutDevsModal />
      <LoginModal />
      <EquipmentDetailModal />
      <SparePartDetailModal />
      <KnowledgeDetailModal />
      <DocDetailModal />
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

