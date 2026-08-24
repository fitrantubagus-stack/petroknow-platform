import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Role, User, KnowledgeEntry, EquipmentNode, SparePart, DocumentItem, 
  KnowledgeGap, ActivityItem, ChatMessage, PlantStats,
  RetirementCampaign, CriticalTopic, TacitPrefill 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_EQUIPMENT, INITIAL_SPARE_PARTS, 
  INITIAL_KNOWLEDGE_ENTRIES, INITIAL_DOCUMENTS, INITIAL_KNOWLEDGE_GAPS, 
  INITIAL_ACTIVITY_FEED, INITIAL_RETIREMENT_CAMPAIGNS 
} from '../data/initialData';
import { calculateFreshness, SIMULATED_CURRENT_DATE } from '../utils/freshness';
import { searchKnowledgeBase } from '../utils/searchEngine';

export type AppView = 
  | 'landing' 
  | 'dashboard' 
  | 'assistant' 
  | 'map' 
  | 'scancenter' 
  | 'tacit' 
  | 'verification' 
  | 'library' 
  | 'freshness' 
  | 'analytics'
  | 'campaigns';

export type ActiveModal = 
  | 'about_devs' 
  | 'login_role' 
  | 'equipment_detail' 
  | 'sparepart_detail' 
  | 'knowledge_detail' 
  | 'doc_detail' 
  | null;

interface AppContextType {
  // Navigation & Role
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: Role;
  setRole: (role: Role) => void;
  currentUser: User;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Modals & Active selections
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  selectedEquipmentId: string | null;
  selectedPartNumber: string | null;
  selectedKnowledgeId: string | null;
  selectedDocId: string | null;
  openEquipment: (id: string) => void;
  openSparePart: (partNumber: string) => void;
  openKnowledge: (id: string) => void;
  openDoc: (id: string) => void;
  closeModal: () => void;

  // Global Search state for header
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Collections
  knowledgeEntries: KnowledgeEntry[];
  equipmentList: EquipmentNode[];
  spareParts: SparePart[];
  documents: DocumentItem[];
  knowledgeGaps: KnowledgeGap[];
  activityFeed: ActivityItem[];
  chatMessages: ChatMessage[];
  topQueries: { query: string; count: number; lastAsked: string }[];
  campaigns: RetirementCampaign[];
  tacitPrefill: TacitPrefill | null;
  setTacitPrefill: (prefill: TacitPrefill | null) => void;

  // Mutators & Operations
  addTacitKnowledge: (data: {
    title: string;
    category: KnowledgeEntry['category'];
    situation: string;
    content: string;
    keySteps?: string[];
    linkedEquipmentIds: string[];
    linkedPartNumbers?: string[];
    tags: string[];
  }) => KnowledgeEntry;

  ingestScannedDocument: (data: {
    title: string;
    docNumber: string;
    category: string;
    extractedText: string;
    keySteps?: string[];
    linkedEquipmentId?: string;
    fileType: 'PDF' | 'IMAGE' | 'DOCX';
    fileSize: string;
  }) => { doc: DocumentItem; entry: KnowledgeEntry };

  verifyKnowledgeEntry: (id: string, action: 'approve' | 'request_edit' | 'reject', notes?: string) => void;
  reverifyKnowledgeEntry: (id: string) => void;
  sendChatMessage: (text: string, imageInfo?: { url: string; label: string }) => Promise<void>;
  rateChatAnswer: (messageId: string, rating: 'up' | 'down') => void;
  logKnowledgeGap: (question: string, relatedEquipmentId?: string, impact?: 'High' | 'Medium' | 'Low') => KnowledgeGap;
  assignKnowledgeGap: (gapId: string, assignedTo: string) => void;
  resolveKnowledgeGap: (gapId: string, newEntryId: string) => void;
  restockPart: (partNumber: string, amount: number) => void;
  addCampaign: (data: Omit<RetirementCampaign, 'id' | 'createdAt' | 'status'>) => RetirementCampaign;
  updateCampaign: (id: string, updates: Partial<RetirementCampaign>) => void;
  deleteCampaign: (id: string) => void;
  computeCampaignProgress: (campaign: RetirementCampaign) => {
    progressPercent: number;
    totalTopics: number;
    capturedTopics: number;
    daysRemaining: number;
    isUrgent: boolean;
    topicStatuses: {
      topic: CriticalTopic;
      isCaptured: boolean;
      matchingEntry?: KnowledgeEntry;
    }[];
  };
  resetToInitialData: () => void;

  // Real-time computed plant stats
  stats: PlantStats;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'petroknow_v1_app_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or defaults
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [role, setRoleState] = useState<Role>('operator');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('petroknow_sidebar_collapsed') === 'true';
  });

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState<string | null>(null);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Collections
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_kb`);
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_ENTRIES;
  });

  const [equipmentList, setEquipmentList] = useState<EquipmentNode[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_eq`);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_parts`);
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_docs`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gaps`);
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_GAPS;
  });

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_acts`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_FEED;
  });

  const [campaigns, setCampaigns] = useState<RetirementCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_RETIREMENT_CAMPAIGNS;
  });

  const [tacitPrefill, setTacitPrefill] = useState<TacitPrefill | null>(null);

  const [topQueries, setTopQueries] = useState<{ query: string; count: number; lastAsked: string }[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_queries`);
    return saved ? JSON.parse(saved) : [
      { query: 'compressor valve flutter temperature', count: 18, lastAsked: '10m ago' },
      { query: 'reactor loop catalyst grade transition', count: 14, lastAsked: '1h ago' },
      { query: 'cryogenic ethylene storage boil off gas', count: 9, lastAsked: '3h ago' },
      { query: 'slurry pump mechanical seal plan 53b', count: 8, lastAsked: '5h ago' },
      { query: 'emergency reactor runaway quench procedure', count: 6, lastAsked: '1d ago' }
    ];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome-01',
      sender: 'assistant',
      text: "Hello, I'm the PetroKnow AI Assistant. Ask any question regarding plant SOPs, troubleshooting codes, equipment tags, or attach a photo of a gauge/alarm.",
      timestamp: 'Just now'
    }
  ]);

  // Persist collections whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_kb`, JSON.stringify(knowledgeEntries));
      localStorage.setItem(`${STORAGE_KEY}_eq`, JSON.stringify(equipmentList));
      localStorage.setItem(`${STORAGE_KEY}_parts`, JSON.stringify(spareParts));
      localStorage.setItem(`${STORAGE_KEY}_docs`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_gaps`, JSON.stringify(knowledgeGaps));
      localStorage.setItem(`${STORAGE_KEY}_acts`, JSON.stringify(activityFeed));
      localStorage.setItem(`${STORAGE_KEY}_queries`, JSON.stringify(topQueries));
      localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [knowledgeEntries, equipmentList, spareParts, documents, knowledgeGaps, activityFeed, topQueries, campaigns]);

  const currentUser = useMemo(() => INITIAL_USERS[role] || INITIAL_USERS.operator, [role]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('petroknow_sidebar_collapsed', String(next));
      return next;
    });
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    logActivity({
      actionType: 'role_switch',
      title: 'Switched Active Role',
      detail: `Role switched to ${INITIAL_USERS[newRole]?.title} (${newRole.toUpperCase()})`
    });
  };

  const logActivity = (act: Omit<ActivityItem, 'id' | 'timestamp' | 'user' | 'role'>) => {
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      user: currentUser.name,
      role: currentUser.role,
      ...act
    };
    setActivityFeed(prev => [newAct, ...prev.slice(0, 40)]);
  };

  // Modal actions
  const openEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveModal('equipment_detail');
  };

  const openSparePart = (partNumber: string) => {
    setSelectedPartNumber(partNumber);
    setActiveModal('sparepart_detail');
  };

  const openKnowledge = (id: string) => {
    setSelectedKnowledgeId(id);
    setActiveModal('knowledge_detail');
  };

  const openDoc = (id: string) => {
    setSelectedDocId(id);
    setActiveModal('doc_detail');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Add Tacit Knowledge
  const addTacitKnowledge = (data: {
    title: string;
    category: KnowledgeEntry['category'];
    situation: string;
    content: string;
    keySteps?: string[];
    linkedEquipmentIds: string[];
    linkedPartNumbers?: string[];
    tags: string[];
  }) => {
    const id = `KB-TAC-${Date.now().toString().slice(-4)}`;
    const newEntry: KnowledgeEntry = {
      id,
      title: data.title,
      category: data.category,
      situation: data.situation,
      content: data.content,
      keySteps: data.keySteps || [],
      author: currentUser.name,
      authorRole: currentUser.title,
      submitDate: SIMULATED_CURRENT_DATE,
      lastVerifiedDate: '', // Empty until verified
      decayDaysThreshold: 120,
      status: 'pending',
      linkedEquipmentIds: data.linkedEquipmentIds,
      linkedPartNumbers: data.linkedPartNumbers || [],
      tags: ['tacit knowledge', ...data.tags],
      isTacit: true,
      viewsCount: 1,
      helpfulCount: 0,
      notHelpfulCount: 0
    };

    setKnowledgeEntries(prev => [newEntry, ...prev]);

    // Link entry to equipment
    setEquipmentList(prev => prev.map(eq => {
      if (data.linkedEquipmentIds.includes(eq.id) && !eq.linkedKnowledgeIds.includes(id)) {
        return { ...eq, linkedKnowledgeIds: [...eq.linkedKnowledgeIds, id] };
      }
      return eq;
    }));

    logActivity({
      actionType: 'submit_tacit',
      title: 'Submitted Tacit Knowledge',
      detail: `New tacit experience "${data.title}" submitted by ${currentUser.name} — queued for expert review.`,
      targetId: id
    });

    return newEntry;
  };

  // Ingest Scanned Document via OCR
  const ingestScannedDocument = (data: {
    title: string;
    docNumber: string;
    category: string;
    extractedText: string;
    keySteps?: string[];
    linkedEquipmentId?: string;
    fileType: 'PDF' | 'IMAGE' | 'DOCX';
    fileSize: string;
  }) => {
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    const kbId = `KB-OCR-${Date.now().toString().slice(-4)}`;

    const newDoc: DocumentItem = {
      id: docId,
      title: `${data.docNumber}: ${data.title}`,
      docNumber: data.docNumber,
      category: data.category,
      source: 'Scanned',
      status: 'Needs Review',
      uploadDate: SIMULATED_CURRENT_DATE,
      fileType: data.fileType,
      fileSize: data.fileSize,
      extractedSnippet: data.extractedText.slice(0, 250) + '...',
      linkedKnowledgeId: kbId,
      uploader: `${currentUser.name} (OCR System)`
    };

    const newKb: KnowledgeEntry = {
      id: kbId,
      title: `[OCR Draft] ${data.title}`,
      category: 'SOP',
      situation: `Extracted automatically from paper/digital document "${data.docNumber}". Requires SME validation of parameters.`,
      content: data.extractedText,
      keySteps: data.keySteps || ['Verify scanned step tolerances', 'Cross-check tag numbers against P&ID'],
      author: `${currentUser.name} via OCR`,
      authorRole: currentUser.title,
      submitDate: SIMULATED_CURRENT_DATE,
      lastVerifiedDate: '',
      decayDaysThreshold: 90,
      status: 'pending',
      linkedEquipmentIds: data.linkedEquipmentId ? [data.linkedEquipmentId] : [],
      linkedPartNumbers: [],
      tags: ['scanned document', 'ocr', data.category.toLowerCase()],
      sourceDocId: docId,
      isTacit: false,
      viewsCount: 1,
      helpfulCount: 0,
      notHelpfulCount: 0
    };

    setDocuments(prev => [newDoc, ...prev]);
    setKnowledgeEntries(prev => [newKb, ...prev]);

    if (data.linkedEquipmentId) {
      setEquipmentList(prev => prev.map(eq => {
        if (eq.id === data.linkedEquipmentId && !eq.linkedKnowledgeIds.includes(kbId)) {
          return { ...eq, linkedKnowledgeIds: [...eq.linkedKnowledgeIds, kbId] };
        }
        return eq;
      }));
    }

    logActivity({
      actionType: 'scan_ocr',
      title: 'Scanned SOP Ingested via OCR',
      detail: `Paper document ${data.docNumber} processed and routed to Verification Queue as draft entry ${kbId}.`,
      targetId: kbId
    });

    return { doc: newDoc, entry: newKb };
  };

  // Verification actions
  const verifyKnowledgeEntry = (id: string, action: 'approve' | 'request_edit' | 'reject', notes?: string) => {
    let updatedStatus: KnowledgeEntry['status'] = 'verified';
    if (action === 'request_edit') updatedStatus = 'needs_edit';
    if (action === 'reject') updatedStatus = 'rejected';

    let targetTitle = '';

    setKnowledgeEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        targetTitle = entry.title;
        return {
          ...entry,
          status: updatedStatus,
          verifier: `${currentUser.name} (${currentUser.title})`,
          lastVerifiedDate: action === 'approve' ? SIMULATED_CURRENT_DATE : entry.lastVerifiedDate,
          verificationNotes: notes || entry.verificationNotes
        };
      }
      return entry;
    }));

    // If linked document, update document status
    setDocuments(prev => prev.map(doc => {
      if (doc.linkedKnowledgeId === id) {
        return {
          ...doc,
          status: action === 'approve' ? 'Indexed' : 'Needs Review'
        };
      }
      return doc;
    }));

    logActivity({
      actionType: action === 'approve' ? 'verify' : 'reject',
      title: action === 'approve' ? 'Knowledge Verified & Approved' : `Knowledge Review: ${action.replace('_', ' ').toUpperCase()}`,
      detail: `${currentUser.name} ${action === 'approve' ? 'approved' : action} "${targetTitle || id}". Entry is now ${action === 'approve' ? 'live & citable in AI' : 'flagged'}.`,
      targetId: id
    });
  };

  // Re-verify a stale entry to reset decay
  const reverifyKnowledgeEntry = (id: string) => {
    let entryTitle = '';
    setKnowledgeEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        entryTitle = entry.title;
        return {
          ...entry,
          lastVerifiedDate: SIMULATED_CURRENT_DATE,
          verifier: `${currentUser.name} (${currentUser.title})`,
          status: 'verified'
        };
      }
      return entry;
    }));

    logActivity({
      actionType: 'reverify',
      title: 'Knowledge Freshness Renewed',
      detail: `${currentUser.name} re-verified "${entryTitle || id}". Freshness score reset to 100%.`,
      targetId: id
    });
  };

  // Log a Knowledge Gap
  const logKnowledgeGap = (question: string, relatedEquipmentId?: string, impact: 'High' | 'Medium' | 'Low' = 'Medium') => {
    const gapId = `GAP-${Date.now().toString().slice(-4)}`;
    const newGap: KnowledgeGap = {
      id: gapId,
      question,
      askedBy: currentUser.name,
      askedDate: SIMULATED_CURRENT_DATE,
      category: relatedEquipmentId ? 'Equipment Operational Query' : 'General Plant Process',
      relatedEquipmentId,
      status: 'unassigned',
      impact
    };

    setKnowledgeGaps(prev => [newGap, ...prev]);

    logActivity({
      actionType: 'gap_logged',
      title: 'Knowledge Gap Registered',
      detail: `Unanswered question logged for SME investigation: "${question.slice(0, 70)}..."`,
      targetId: gapId
    });

    return newGap;
  };

  const assignKnowledgeGap = (gapId: string, assignedTo: string) => {
    setKnowledgeGaps(prev => prev.map(g => g.id === gapId ? { ...g, status: 'assigned', assignedTo } : g));
  };

  const resolveKnowledgeGap = (gapId: string, newEntryId: string) => {
    setKnowledgeGaps(prev => prev.map(g => g.id === gapId ? { ...g, status: 'resolved', resolvedEntryId: newEntryId } : g));
  };

  // Restock Spare Part
  const restockPart = (partNumber: string, amount: number) => {
    setSpareParts(prev => prev.map(p => {
      if (p.partNumber === partNumber) {
        return {
          ...p,
          currentStock: p.currentStock + amount,
          lastRestocked: SIMULATED_CURRENT_DATE
        };
      }
      return p;
    }));

    logActivity({
      actionType: 'verify',
      title: 'Spare Part Restocked',
      detail: `Added +${amount} units to part ${partNumber}. Stock level replenished.`,
      targetId: partNumber
    });
  };

  // Chat message submission
  const sendChatMessage = async (text: string, imageInfo?: { url: string; label: string }) => {
    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: 'Just now',
      imageUrl: imageInfo?.url,
      imageLabel: imageInfo?.label
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Track query for analytics
    const cleanedQuery = (imageInfo?.label ? `${imageInfo.label} ${text}` : text).toLowerCase().trim();
    setTopQueries(prev => {
      const idx = prev.findIndex(q => q.query.toLowerCase() === cleanedQuery || cleanedQuery.includes(q.query.toLowerCase()));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], count: updated[idx].count + 1, lastAsked: 'Just now' };
        return updated.sort((a, b) => b.count - a.count);
      } else if (cleanedQuery.length > 5) {
        return [{ query: cleanedQuery.slice(0, 45), count: 1, lastAsked: 'Just now' }, ...prev.slice(0, 9)];
      }
      return prev;
    });

    // Run real deterministic retrieval search against current knowledge entries
    const searchTargetText = imageInfo?.label ? `${imageInfo.label} ${text}` : text;
    const matches = searchKnowledgeBase(searchTargetText, knowledgeEntries, equipmentList, false);

    // Simulate short, authentic processing delay
    await new Promise(res => setTimeout(res, 450));

    const assistantMsgId = `msg-ai-${Date.now()}`;

    if (matches.length > 0) {
      const topMatch = matches[0];
      const matchScore = topMatch.score;
      const entry = topMatch.entry;

      // Increment views count on entry
      setKnowledgeEntries(prev => prev.map(k => k.id === entry.id ? { ...k, viewsCount: k.viewsCount + 1 } : k));

      let confidenceStatus: 'verified' | 'pending' | 'unverified' = 'verified';
      if (entry.status === 'pending') confidenceStatus = 'pending';
      if (matchScore < 45) confidenceStatus = 'unverified';

      // Build rich cited response
      let answerText = `**${entry.title}**\n\n${entry.situation}\n\n`;

      if (entry.keySteps && entry.keySteps.length > 0) {
        answerText += `**Standard Execution Steps:**\n` + entry.keySteps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n';
      }

      answerText += `*Source verified by ${entry.verifier || entry.author} (Last verified: ${entry.lastVerifiedDate || entry.submitDate}).*`;

      const aiMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: answerText,
        timestamp: 'Just now',
        matchedEntry: entry,
        matchScore,
        confidenceStatus,
        sources: matches.slice(0, 3).map(m => ({
          id: m.entry.id,
          title: m.entry.title,
          snippet: m.snippet,
          category: m.entry.category,
          status: m.entry.status,
          docNumber: m.entry.sourceDocId
        }))
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } else {
      // No match found -> Offer to log as knowledge gap
      const noMatchMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: `No verified standard operating procedure or tacit wisdom matched your query: *" ${text} "*. \n\nIn high-reliability petrochemical operations, unverified guesses are prohibited. Would you like to log this as a formal Knowledge Gap for an SME review?`,
        timestamp: 'Just now',
        confidenceStatus: 'unverified',
        isGapOffer: true,
        rawQuery: text
      };
      setChatMessages(prev => [...prev, noMatchMsg]);
    }
  };

  const rateChatAnswer = (messageId: string, rating: 'up' | 'down') => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        if (msg.matchedEntry) {
          setKnowledgeEntries(kPrev => kPrev.map(k => {
            if (k.id === msg.matchedEntry!.id) {
              return {
                ...k,
                helpfulCount: rating === 'up' ? k.helpfulCount + 1 : k.helpfulCount,
                notHelpfulCount: rating === 'down' ? k.notHelpfulCount + 1 : k.notHelpfulCount
              };
            }
            return k;
          }));
        }
        return { ...msg, feedback: rating };
      }
      return msg;
    }));

    logActivity({
      actionType: 'feedback',
      title: 'AI Answer Feedback Logged',
      detail: `Operator rated AI response as ${rating === 'up' ? 'Helpful (Accurate)' : 'Unhelpful (Needs Improvement)'}.`
    });
  };

  const addCampaign = (data: Omit<RetirementCampaign, 'id' | 'createdAt' | 'status'>): RetirementCampaign => {
    const newCampaign: RetirementCampaign = {
      ...data,
      id: `CAMP-${new Date().getFullYear()}-${String(campaigns.length + 1).padStart(3, '0')}`,
      createdAt: SIMULATED_CURRENT_DATE,
      status: 'Active'
    };

    setCampaigns(prev => [newCampaign, ...prev]);

    logActivity({
      actionType: 'submit_tacit',
      title: 'Retirement Campaign Launched',
      detail: `Initiated tacit knowledge capture campaign for ${newCampaign.smeName} (${newCampaign.criticalTopics.length} critical topics).`,
      targetId: newCampaign.id
    });

    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<RetirementCampaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const computeCampaignProgress = (campaign: RetirementCampaign) => {
    const today = new Date(SIMULATED_CURRENT_DATE).getTime();
    const depDate = new Date(campaign.targetDepartureDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((depDate - today) / (1000 * 60 * 60 * 24)));
    const totalTopics = campaign.criticalTopics.length;

    const topicStatuses = campaign.criticalTopics.map(topic => {
      // Find matching verified knowledge entry
      const matchingEntry = knowledgeEntries.find(k => {
        const isVerified = k.status === 'verified';
        if (!isVerified) return false;

        const topicLower = topic.topicTitle.toLowerCase();
        const kTitleLower = k.title.toLowerCase();
        const kSituationLower = (k.situation || '').toLowerCase();
        const authorLower = k.author.toLowerCase();
        const smeLower = campaign.smeName.toLowerCase();

        const matchesSme = authorLower.includes(smeLower) || smeLower.includes(authorLower);
        const matchesEquipment = topic.equipmentId && k.linkedEquipmentIds.includes(topic.equipmentId);
        const titleMatch = kTitleLower.includes(topicLower.slice(0, 12)) || topicLower.includes(kTitleLower.slice(0, 12));
        const tagOrSituationMatch = k.tags.some(t => topicLower.includes(t.toLowerCase())) || kSituationLower.includes(topicLower.slice(0, 10));

        return (matchesSme && (matchesEquipment || titleMatch)) || (matchesEquipment && titleMatch) || (titleMatch && tagOrSituationMatch);
      });

      return {
        topic,
        isCaptured: !!matchingEntry,
        matchingEntry
      };
    });

    const capturedTopics = topicStatuses.filter(t => t.isCaptured).length;
    const progressPercent = totalTopics > 0 ? Math.round((capturedTopics / totalTopics) * 100) : 0;
    const isUrgent = daysRemaining < 14 && progressPercent < 70;

    return {
      progressPercent,
      totalTopics,
      capturedTopics,
      daysRemaining,
      isUrgent,
      topicStatuses
    };
  };

  const resetToInitialData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_kb`);
    localStorage.removeItem(`${STORAGE_KEY}_eq`);
    localStorage.removeItem(`${STORAGE_KEY}_parts`);
    localStorage.removeItem(`${STORAGE_KEY}_docs`);
    localStorage.removeItem(`${STORAGE_KEY}_gaps`);
    localStorage.removeItem(`${STORAGE_KEY}_acts`);
    localStorage.removeItem(`${STORAGE_KEY}_queries`);
    localStorage.removeItem(`${STORAGE_KEY}_campaigns`);

    setKnowledgeEntries(INITIAL_KNOWLEDGE_ENTRIES);
    setEquipmentList(INITIAL_EQUIPMENT);
    setSpareParts(INITIAL_SPARE_PARTS);
    setDocuments(INITIAL_DOCUMENTS);
    setKnowledgeGaps(INITIAL_KNOWLEDGE_GAPS);
    setActivityFeed(INITIAL_ACTIVITY_FEED);
    setCampaigns(INITIAL_RETIREMENT_CAMPAIGNS);
    setCurrentView('dashboard');
  };

  // Real-time computed plant stats
  const stats: PlantStats = useMemo(() => {
    const totalEntries = knowledgeEntries.length;
    const verifiedCount = knowledgeEntries.filter(e => e.status === 'verified').length;
    const pendingCount = knowledgeEntries.filter(e => e.status === 'pending').length;

    let staleCount = 0;
    let agingCount = 0;
    let freshCount = 0;

    knowledgeEntries.forEach(entry => {
      if (entry.status === 'verified') {
        const fresh = calculateFreshness(entry);
        if (fresh.state === 'stale') staleCount++;
        else if (fresh.state === 'aging') agingCount++;
        else freshCount++;
      }
    });

    const lowStockPartsCount = spareParts.filter(p => p.currentStock <= p.minThreshold).length;
    const knowledgeGapsCount = knowledgeGaps.filter(g => g.status !== 'resolved').length;
    const questionsAnsweredToday = chatMessages.filter(m => m.sender === 'user').length + 28;
    const verificationRate = totalEntries > 0 ? Math.round((verifiedCount / totalEntries) * 100) : 0;
    const avgConfidenceScore = 94.6;
    const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;

    return {
      totalEntries,
      verifiedCount,
      pendingCount,
      staleCount,
      agingCount,
      freshCount,
      questionsAnsweredToday,
      knowledgeGapsCount,
      avgConfidenceScore,
      verificationRate,
      lowStockPartsCount,
      activeCampaignsCount
    };
  }, [knowledgeEntries, spareParts, knowledgeGaps, chatMessages, campaigns]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        role,
        setRole,
        currentUser,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        activeModal,
        setActiveModal,
        selectedEquipmentId,
        selectedPartNumber,
        selectedKnowledgeId,
        selectedDocId,
        openEquipment,
        openSparePart,
        openKnowledge,
        openDoc,
        closeModal,
        globalSearchQuery,
        setGlobalSearchQuery,
        knowledgeEntries,
        equipmentList,
        spareParts,
        documents,
        knowledgeGaps,
        activityFeed,
        chatMessages,
        topQueries,
        campaigns,
        tacitPrefill,
        setTacitPrefill,
        addTacitKnowledge,
        ingestScannedDocument,
        verifyKnowledgeEntry,
        reverifyKnowledgeEntry,
        sendChatMessage,
        rateChatAnswer,
        logKnowledgeGap,
        assignKnowledgeGap,
        resolveKnowledgeGap,
        restockPart,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        computeCampaignProgress,
        resetToInitialData,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
