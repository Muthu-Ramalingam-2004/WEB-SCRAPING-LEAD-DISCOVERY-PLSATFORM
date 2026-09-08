export type TaskStatus = 'COMPLETED' | 'RUNNING' | 'FAILED' | 'PAUSED' | 'PENDING';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DataFieldKey = 
  | 'name'
  | 'phone'
  | 'email'
  | 'website'
  | 'address'
  | 'whatsapp'
  | 'contactPerson'
  | 'designation'
  | 'socialLinks';

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitter' | 'website';
  url: string;
}

export interface SourceEvidence {
  field: string;
  value: string;
  sourceUrl: string;
  sourcePageTitle?: string;
  extractedAt: string;
  verified: boolean;
}

export interface ContactPerson {
  name: string;
  designation: string;
  email?: string;
  phone?: string;
}

export interface Lead {
  id: string;
  taskId: string;
  organizationName: string;
  category: string;
  location: string;
  city: string;
  state: string;
  pincode?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  whatsapp?: string;
  contactPerson?: ContactPerson;
  socialLinks: SocialLink[];
  confidence: ConfidenceLevel;
  verified: boolean;
  scrapedDate: string;
  sources: Record<string, SourceEvidence>; // keyed by field name (e.g. 'phone', 'email', 'address')
}

export interface ScrapingTask {
  id: string;
  location: string;
  keyword: string;
  searchRadiusKm?: number;
  maxResults: number;
  maxPagesPerWebsite: number;
  crawlDepth: number;
  requiredFields: DataFieldKey[];
  resultsCount: number;
  websitesCount: number;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  duration?: string;
}

export interface FailedWebsite {
  url: string;
  domain: string;
  reason: 'Timeout' | 'Access denied' | 'DNS Error' | 'SSL Error' | 'Rate Limited' | 'Page Not Found';
  timestamp: string;
}

export interface ActivityTimelineItem {
  id: string;
  status: 'completed' | 'in_progress' | 'pending';
  title: string;
  description?: string;
  timestamp?: string;
}

export interface ScrapingProgress {
  taskId: string;
  location: string;
  keyword: string;
  status: TaskStatus;
  percentage: number;
  resultsDiscovered: number;
  websitesFound: number;
  websitesCrawled: number;
  phonesFound: number;
  emailsFound: number;
  addressesFound: number;
  duplicatesRemoved: number;
  currentWebsite: string;
  currentPage: string;
  pagesCrawledForCurrentSite: number;
  maxPagesForCurrentSite: number;
  timeline: ActivityTimelineItem[];
  failedWebsites: FailedWebsite[];
}

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  taskId: string;
  taskTitle: string;
  format: 'CSV' | 'EXCEL';
  rows: number;
  createdAt: string;
  downloadUrl: string;
}

export interface ScrapingDefaults {
  maxResults: number;
  maxPagesPerWebsite: number;
  crawlDepth: number;
  requestTimeoutSeconds: number;
  retryLimit: number;
  domainRateLimit: number;
}
