import { mockTasks } from '@/data/mock-tasks';
import { mockLeads } from '@/data/mock-leads';
import { mockProgressData } from '@/data/mock-progress';
import { mockExportHistory } from '@/data/mock-exports';
import { ScrapingTask, Lead, ScrapingProgress, ExportHistoryItem, DataFieldKey } from '@/types';

/**
 * Service API Abstraction Layer
 * Structured for smooth transition to FastAPI REST API endpoints.
 */

// Centralized API configuration for future backend integration
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export interface UserCreatePayload {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  email: string;
  new_password: string;
  confirm_password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export function extractErrorMessage(errData: any): string {
  if (!errData) return 'An error occurred. Please try again.';
  if (typeof errData === 'string') return errData;
  if (typeof errData.detail === 'string') return errData.detail;
  if (Array.isArray(errData.detail) && errData.detail.length > 0) {
    const firstErr = errData.detail[0];
    if (typeof firstErr === 'string') return firstErr;
    if (firstErr.msg) return firstErr.msg;
  }
  if (errData.message && typeof errData.message === 'string') return errData.message;
  return 'An error occurred. Please try again.';
}

/**
 * Centralized fetch helper with automatic fallback between 127.0.0.1 and localhost
 * handles network connection failures gracefully.
 */
async function authFetch(path: string, payload: any): Promise<any> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const primaryUrl = `${API_BASE_URL}${cleanPath}`;
  const fallbackUrl = primaryUrl.includes('127.0.0.1')
    ? primaryUrl.replace('127.0.0.1', 'localhost')
    : primaryUrl.replace('localhost', '127.0.0.1');

  let response: Response | null = null;

  try {
    response = await fetch(primaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (primaryErr) {
    // Primary URL connection failed -> try fallback URL (e.g. 127.0.0.1 vs localhost)
    try {
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (fallbackErr) {
      throw new Error(
        'Unable to connect to backend server. Please ensure the backend is running on http://127.0.0.1:8000.'
      );
    }
  }

  if (!response) {
    throw new Error(
      'Unable to connect to backend server. Please ensure the backend is running on http://127.0.0.1:8000.'
    );
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch (jsonErr) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data;
}

export async function registerUser(payload: UserCreatePayload): Promise<UserResponse> {
  return authFetch('/api/auth/register', payload);
}

export async function loginUser(payload: UserLoginPayload): Promise<TokenResponse> {
  return authFetch('/api/auth/login', payload);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return authFetch('/api/auth/change-password', payload);
}

export interface CreateTaskPayload {
  location: string;
  keyword: string;
  searchRadiusKm?: number;
  maxResults: number;
  maxPagesPerWebsite: number;
  crawlDepth: number;
  requiredFields: DataFieldKey[];
  acknowledgedResponsibleCrawling: boolean;
}

export async function createScrapingTask(payload: CreateTaskPayload): Promise<ScrapingTask> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 600));

  const newTask: ScrapingTask = {
    id: `TASK-${Math.floor(100000 + Math.random() * 900000)}`,
    location: payload.location,
    keyword: payload.keyword,
    searchRadiusKm: payload.searchRadiusKm || 25,
    maxResults: payload.maxResults,
    maxPagesPerWebsite: payload.maxPagesPerWebsite,
    crawlDepth: payload.crawlDepth,
    requiredFields: payload.requiredFields,
    resultsCount: 0,
    websitesCount: 0,
    status: 'RUNNING',
    createdAt: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  mockTasks.unshift(newTask);
  return newTask;
}

export async function getTasks(): Promise<ScrapingTask[]> {
  await new Promise((res) => setTimeout(res, 300));
  return [...mockTasks];
}

export async function getTaskById(taskId: string): Promise<ScrapingTask | null> {
  await new Promise((res) => setTimeout(res, 200));
  return mockTasks.find((t) => t.id === taskId) || null;
}

export async function getTaskProgress(taskId: string): Promise<ScrapingProgress> {
  await new Promise((res) => setTimeout(res, 200));
  const task = mockTasks.find((t) => t.id === taskId);
  if (task) {
    return {
      ...mockProgressData,
      taskId: task.id,
      location: task.location,
      keyword: task.keyword,
      status: task.status,
    };
  }
  return mockProgressData;
}

export async function getLeads(filters?: {
  taskId?: string;
  search?: string;
  location?: string;
  category?: string;
  confidence?: string;
}): Promise<Lead[]> {
  await new Promise((res) => setTimeout(res, 300));
  let result = [...mockLeads];

  if (filters?.taskId) {
    result = result.filter((l) => l.taskId === filters.taskId);
  }
  if (filters?.location) {
    result = result.filter((l) => l.location.toLowerCase().includes(filters.location!.toLowerCase()));
  }
  if (filters?.category) {
    result = result.filter((l) => l.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }
  if (filters?.confidence) {
    result = result.filter((l) => l.confidence === filters.confidence);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.organizationName.toLowerCase().includes(query) ||
        l.city.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query) ||
        l.phone.includes(query) ||
        l.website.toLowerCase().includes(query)
    );
  }

  return result;
}

export async function getLeadById(leadId: string): Promise<Lead | null> {
  await new Promise((res) => setTimeout(res, 200));
  return mockLeads.find((l) => l.id === leadId) || null;
}

export async function exportLeadsToCsv(taskId?: string): Promise<{ downloadUrl: string; fileName: string }> {
  await new Promise((res) => setTimeout(res, 500));
  return {
    downloadUrl: '#',
    fileName: `leads_export_${taskId || 'all'}_${Date.now()}.csv`,
  };
}

export async function exportLeadsToExcel(taskId?: string): Promise<{ downloadUrl: string; fileName: string }> {
  await new Promise((res) => setTimeout(res, 500));
  return {
    downloadUrl: '#',
    fileName: `leads_export_${taskId || 'all'}_${Date.now()}.xlsx`,
  };
}

export async function getExportHistory(): Promise<ExportHistoryItem[]> {
  await new Promise((res) => setTimeout(res, 200));
  return [...mockExportHistory];
}
