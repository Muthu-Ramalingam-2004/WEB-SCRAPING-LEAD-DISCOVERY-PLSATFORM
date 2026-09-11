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
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

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
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserProfileData {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  default_max_results: number;
  default_max_pages: number;
  default_crawl_depth: number;
  request_timeout: number;
  retry_limit: number;
  domain_rate_limit: number;
  task_complete_notify: boolean;
  task_failed_notify: boolean;
  weekly_report_notify: boolean;
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
 * Centralized fetch helper with timeout protection.
 * Includes a 12-second timeout to prevent hanging on slow/cold-starting backend or DB.
 */
const REQUEST_TIMEOUT_MS = 12000;

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
}

export async function requestApi(path: string, options: { method?: string; body?: any; isFormData?: boolean } = {}): Promise<any> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const primaryUrl = `${API_BASE_URL}${cleanPath}`;
  // No fallback URL in production; always use primaryUrl

  const method = options.method || 'GET';
  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    body: options.isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  };

  let response: Response | null = null;
  try {
    response = await fetchWithTimeout(primaryUrl, fetchOptions);
  } catch (err) {
    // If primary request fails, surface a generic connection error
    throw new Error('Unable to connect to backend server.');
  }

  if (!response) {
    throw new Error('Unable to connect to backend server.');
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

/**
 * Health check function to verify if FastAPI backend is online.
 */
export async function checkBackendHealth(): Promise<{ online: boolean; message?: string }> {
  try {
    const res = await requestApi('/api/health');
    if (res && res.status === 'ok') {
      return { online: true };
    }
    return { online: false, message: 'Backend health check returned invalid status.' };
  } catch (err: any) {
    return { online: false, message: err.message || 'Unable to connect to backend server.' };
  }
}

async function authFetch(path: string, payload: any): Promise<any> {
  return requestApi(path, { method: 'POST', body: payload });
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

export async function getCurrentUser(): Promise<UserProfileData> {
  return requestApi('/api/users/me');
}

export async function updateUserProfile(payload: { full_name?: string; email?: string }): Promise<UserProfileData> {
  return requestApi('/api/users/me/profile', { method: 'PUT', body: payload });
}

export async function updateScrapingDefaults(payload: { default_max_results: number; default_max_pages: number; default_crawl_depth: number }): Promise<UserProfileData> {
  return requestApi('/api/users/me/scraping-defaults', { method: 'PUT', body: payload });
}

export async function updateCrawlingSettings(payload: { request_timeout: number; retry_limit: number; domain_rate_limit: number }): Promise<UserProfileData> {
  return requestApi('/api/users/me/crawling', { method: 'PUT', body: payload });
}

export async function updateNotificationSettings(payload: { task_complete_notify: boolean; task_failed_notify: boolean; weekly_report_notify: boolean }): Promise<UserProfileData> {
  return requestApi('/api/users/me/notifications', { method: 'PUT', body: payload });
}

export async function uploadUserAvatar(file: File): Promise<UserProfileData> {
  const formData = new FormData();
  formData.append('file', file);
  return requestApi('/api/users/me/avatar', { method: 'POST', body: formData, isFormData: true });
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
  return requestApi('/api/tasks', { method: 'POST', body: payload });
}

export async function getTasks(): Promise<ScrapingTask[]> {
  try {
    return await requestApi('/api/tasks');
  } catch (err) {
    return [...mockTasks];
  }
}

export async function getTaskById(taskId: string): Promise<ScrapingTask | null> {
  try {
    return await requestApi(`/api/tasks/${taskId}`);
  } catch (err) {
    return mockTasks.find((t) => t.id === taskId) || null;
  }
}

export async function getTaskProgress(taskId: string): Promise<ScrapingProgress> {
  const task = await getTaskById(taskId);
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
  try {
    const queryParams = new URLSearchParams();
    if (filters?.taskId) queryParams.append('taskId', filters.taskId);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.confidence) queryParams.append('confidence', filters.confidence);
    
    const queryString = queryParams.toString();
    const path = `/api/leads${queryString ? `?${queryString}` : ''}`;
    return await requestApi(path);
  } catch (err) {
    let result = [...mockLeads];
    if (filters?.taskId) result = result.filter((l) => l.taskId === filters.taskId);
    if (filters?.location) result = result.filter((l) => l.location.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters?.category) result = result.filter((l) => l.category.toLowerCase().includes(filters.category!.toLowerCase()));
    if (filters?.confidence) result = result.filter((l) => l.confidence === filters.confidence);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.organizationName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.website.toLowerCase().includes(q)
      );
    }
    return result;
  }
}

export async function getLeadById(leadId: string): Promise<Lead | null> {
  try {
    return await requestApi(`/api/leads/${leadId}`);
  } catch (err) {
    return mockLeads.find((l) => l.id === leadId) || null;
  }
}

export async function triggerFileDownload(url: string, fallbackFileName: string): Promise<string> {
  const cleanUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(cleanUrl, { headers });
  } catch (err) {
    // If download fails, surface a generic connection error
    throw new Error('Unable to connect to backend server.');
  }

  if (!response.ok) {
    let errMsg = 'Failed to download export file.';
    try {
      const errData = await response.json();
      errMsg = extractErrorMessage(errData);
    } catch (e) {}
    throw new Error(errMsg);
  }

  let fileName = fallbackFileName;
  const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }

  const blob = await response.blob();
  if (typeof window !== 'undefined') {
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 300);
  }

  return fileName;
}

export async function exportLeadsToCsv(taskId?: string): Promise<{ downloadUrl: string; fileName: string }> {
  const path = taskId ? `/api/tasks/${taskId}/export/csv` : '/api/exports/csv';
  const fileName = await triggerFileDownload(path, `leads_export_${taskId || 'all'}_${Date.now()}.csv`);
  return { downloadUrl: `${API_BASE_URL}${path}`, fileName };
}

export async function exportLeadsToExcel(taskId?: string): Promise<{ downloadUrl: string; fileName: string }> {
  const path = taskId ? `/api/tasks/${taskId}/export/excel` : '/api/exports/excel';
  const fileName = await triggerFileDownload(path, `leads_export_${taskId || 'all'}_${Date.now()}.xlsx`);
  return { downloadUrl: `${API_BASE_URL}${path}`, fileName };
}

export async function getExportHistory(): Promise<ExportHistoryItem[]> {
  try {
    const history = await requestApi('/api/exports/history');
    return history;
  } catch (err) {
    return [...mockExportHistory];
  }
}

export async function downloadExportHistoryItem(id: string, fallbackFileName: string): Promise<string> {
  const path = `/api/exports/download/${id}`;
  return triggerFileDownload(path, fallbackFileName || `export_${id}.csv`);
}
