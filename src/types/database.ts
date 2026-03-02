export type Role = 'official' | 'citizen';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export type AssetType = 'Road' | 'Bridge' | 'Streetlight' | 'Water Supply' | 'Hospital';
export type Condition = 'Good' | 'Moderate' | 'Poor';
export type AssetStatus = 'Active' | 'Under Maintenance' | 'Closed';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface InfrastructureAsset {
  _id: string;
  assetId: string;
  type: AssetType;
  location: string;
  zone: string;
  latitude?: number;
  longitude?: number;
  condition: Condition;
  lastMaintenanceDate: string | null;
  status: AssetStatus;
  complaintCount: number;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  assetId: string | { _id: string; assetId: string; type: string; location: string; zone: string; condition: string; status: string };
  citizenId: string;
  citizenName: string;
  description: string;
  status: ComplaintStatus;
  photos?: string[];
  voiceNoteUrl?: string | null;
  feedback?: { rating: number; comment: string; submittedAt: string } | null;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardAnalytics {
  totalAssets: number;
  assetsByCondition: { Good: number; Moderate: number; Poor: number };
  totalComplaints: number;
  highPriorityAssetCount: number;
  cityHealthIndex: number;
  pendingComplaints: number;
}
