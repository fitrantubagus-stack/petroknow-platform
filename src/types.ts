export type Role = 'operator' | 'sme' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  avatar?: string;
}

export type KnowledgeStatus = 'verified' | 'pending' | 'needs_edit' | 'rejected';

export type FreshnessState = 'fresh' | 'aging' | 'stale';

export interface FreshnessScore {
  score: number; // 0 - 100%
  state: FreshnessState;
  daysSinceVerification: number;
  maxFreshDays: number;
  daysRemaining: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: 'SOP' | 'Troubleshooting' | 'Tacit Experience' | 'Emergency Procedure' | 'Maintenance Guide' | 'Safety Protocol';
  content: string;
  keySteps?: string[];
  situation: string;
  author: string;
  authorRole: string;
  submitDate: string; // YYYY-MM-DD
  verifier?: string;
  lastVerifiedDate?: string; // YYYY-MM-DD
  verificationNotes?: string;
  decayDaysThreshold: number; // e.g. 180 days
  status: KnowledgeStatus;
  linkedEquipmentIds: string[];
  linkedPartNumbers: string[];
  tags: string[];
  sourceDocId?: string;
  isTacit: boolean;
  viewsCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface EquipmentNode {
  id: string;
  code: string; // e.g. "EQ-CMP-204"
  name: string;
  area: string; // e.g. "Zone A - Ethylene Cracker Unit"
  category: 'Compressor' | 'Reactor' | 'Storage Tank' | 'Pump' | 'Valve' | 'Heat Exchanger' | 'Column';
  description: string;
  status: 'operational' | 'maintenance' | 'warning' | 'standby';
  x: number; // Percentage on 2D map (0 - 100)
  y: number; // Percentage on 2D map (0 - 100)
  temp: string;
  pressure: string;
  flowRate: string;
  linkedKnowledgeIds: string[];
  linkedPartNumbers: string[];
  lastInspected: string;
  healthStatus?: 'healthy' | 'warning' | 'critical';
}

export interface SparePart {
  id: string;
  partNumber: string; // e.g. "PRT-MEC-3112"
  name: string;
  category: 'Mechanical Seal' | 'Gasket' | 'Bearing' | 'Valve Trim' | 'Filter Cartridge' | 'Sensor' | 'O-Ring Kit' | 'Impeller';
  compatibleEquipmentIds: string[];
  currentStock: number;
  minThreshold: number;
  unit: string;
  binLocation: string; // e.g. "Warehouse B-04-12"
  leadTimeDays: number;
  lastRestocked: string;
  costUsd: number;
  specifications: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  docNumber: string; // e.g. "SOP-PET-2024-089"
  category: string;
  source: 'Scanned' | 'Uploaded' | 'Manual Entry';
  status: 'Indexed' | 'Processing' | 'Needs Review';
  uploadDate: string;
  fileType: 'PDF' | 'IMAGE' | 'DOCX';
  fileSize: string;
  extractedSnippet?: string;
  linkedKnowledgeId?: string;
  uploader: string;
}

export interface KnowledgeGap {
  id: string;
  question: string;
  askedBy: string;
  askedDate: string;
  category: string;
  relatedEquipmentId?: string;
  status: 'unassigned' | 'assigned' | 'resolved';
  assignedTo?: string;
  resolvedEntryId?: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  actionType: 'verify' | 'reject' | 'submit_tacit' | 'scan_ocr' | 'scan_qr' | 'scan_barcode' | 'gap_logged' | 'reverify' | 'feedback' | 'role_switch';
  title: string;
  detail: string;
  targetId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  imageLabel?: string;
  matchedEntry?: KnowledgeEntry;
  matchScore?: number; // 0 - 100
  confidenceStatus?: 'verified' | 'pending' | 'unverified';
  sources?: {
    id: string;
    title: string;
    snippet: string;
    category: string;
    status: KnowledgeStatus;
    docNumber?: string;
  }[];
  feedback?: 'up' | 'down';
  isGapOffer?: boolean;
  rawQuery?: string;
}

export interface PlantStats {
  totalEntries: number;
  verifiedCount: number;
  pendingCount: number;
  staleCount: number;
  agingCount: number;
  freshCount: number;
  questionsAnsweredToday: number;
  knowledgeGapsCount: number;
  avgConfidenceScore: number;
  verificationRate: number;
  lowStockPartsCount: number;
  activeCampaignsCount?: number;
}

export interface CriticalTopic {
  topicId: string;
  topicTitle: string;
  category: KnowledgeEntry['category'];
  equipmentId?: string;
  importance: 'Critical' | 'High' | 'Medium';
  notes?: string;
}

export interface RetirementCampaign {
  id: string;
  smeName: string;
  smeEmail: string;
  smeRoleTitle: string;
  department: string;
  targetDepartureDate: string; // YYYY-MM-DD
  avatar?: string;
  criticalTopics: CriticalTopic[];
  notes?: string;
  createdAt: string;
  status: 'Active' | 'Completed' | 'Archived';
}

export interface TacitPrefill {
  title?: string;
  category?: KnowledgeEntry['category'];
  situation?: string;
  linkedEquipmentIds?: string[];
  campaignId?: string;
  topicId?: string;
}
