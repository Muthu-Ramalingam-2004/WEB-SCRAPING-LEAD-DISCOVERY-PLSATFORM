'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  SlidersHorizontal,
  Bell,
  Camera,
  Save,
  Clock,
  RotateCcw,
  Gauge,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/shared/ToastContext';
import { useUser } from '@/components/shared/UserContext';
import {
  updateUserProfile,
  updateScrapingDefaults,
  updateCrawlingSettings,
  updateNotificationSettings,
  uploadUserAvatar,
} from '@/lib/api';

type SettingsTab = 'profile' | 'scraping' | 'crawling' | 'notifications';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { user, setUser, getAvatarUrl, getDisplayName, getInitials } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Scraping defaults
  const [defaultMaxResults, setDefaultMaxResults] = useState(100);
  const [defaultMaxPages, setDefaultMaxPages] = useState(20);
  const [defaultCrawlDepth, setDefaultCrawlDepth] = useState(2);

  // Crawling
  const [requestTimeout, setRequestTimeout] = useState(30);
  const [retryLimit, setRetryLimit] = useState(3);
  const [domainRateLimit, setDomainRateLimit] = useState(2);

  // Notifications
  const [taskComplete, setTaskComplete] = useState(true);
  const [taskFailed, setTaskFailed] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Saving & Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingScraping, setSavingScraping] = useState(false);
  const [savingCrawling, setSavingCrawling] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Sync state when user object loads/changes
  useEffect(() => {
    if (user) {
      setName(user.full_name || user.username || '');
      setEmail(user.email || '');
      setDefaultMaxResults(user.default_max_results ?? 100);
      setDefaultMaxPages(user.default_max_pages ?? 20);
      setDefaultCrawlDepth(user.default_crawl_depth ?? 2);
      setRequestTimeout(user.request_timeout ?? 30);
      setRetryLimit(user.retry_limit ?? 3);
      setDomainRateLimit(user.domain_rate_limit ?? 2);
      setTaskComplete(user.task_complete_notify ?? true);
      setTaskFailed(user.task_failed_notify ?? true);
      setWeeklyReport(user.weekly_report_notify ?? false);
    }
  }, [user]);

  // 1. PROFILE SAVE
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showToast('Validation Error', 'Full Name cannot be empty.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Validation Error', 'Email Address cannot be empty.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateUserProfile({ full_name: name.trim(), email: email.trim() });
      setUser(updated);
      showToast('Profile Saved', 'Your profile details have been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // PHOTO UPLOAD
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showToast('Invalid File', 'Please select a valid image (JPG, JPEG, PNG, WEBP).', 'error');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('File Too Large', 'Image size must be less than 5MB.', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const updated = await uploadUserAvatar(file);
      setUser(updated);
      showToast('Photo Updated', 'Your profile photo has been updated successfully.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // 2. SCRAPING DEFAULTS SAVE
  const handleSaveScraping = async () => {
    setSavingScraping(true);
    try {
      const updated = await updateScrapingDefaults({
        default_max_results: defaultMaxResults,
        default_max_pages: defaultMaxPages,
        default_crawl_depth: defaultCrawlDepth,
      });
      setUser(updated);
      showToast('Scraping Defaults Saved', 'Your default scraping configuration has been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Failed to update scraping defaults.', 'error');
    } finally {
      setSavingScraping(false);
    }
  };

  // 3. RESPONSIBLE CRAWLING SAVE
  const handleSaveCrawling = async () => {
    setSavingCrawling(true);
    try {
      const updated = await updateCrawlingSettings({
        request_timeout: requestTimeout,
        retry_limit: retryLimit,
        domain_rate_limit: domainRateLimit,
      });
      setUser(updated);
      showToast('Crawling Settings Saved', 'Your responsible crawling settings have been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Failed to update crawling settings.', 'error');
    } finally {
      setSavingCrawling(false);
    }
  };

  // 4. NOTIFICATIONS SAVE
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const updated = await updateNotificationSettings({
        task_complete_notify: taskComplete,
        task_failed_notify: taskFailed,
        weekly_report_notify: weeklyReport,
      });
      setUser(updated);
      showToast('Notification Preferences Saved', 'Your notification settings have been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Failed to update notification preferences.', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'scraping', label: 'Scraping Defaults', icon: SlidersHorizontal },
    { key: 'crawling', label: 'Responsible Crawling', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Profile Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account and configure scraping preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Navigation */}
        <nav className="md:w-56 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Profile</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your account information.</p>
              </div>

              {/* Avatar & Photo Upload */}
              <div className="flex items-center gap-4">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()!}
                    alt={getDisplayName()}
                    className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-teal-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {getInitials()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Change Photo
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={savingProfile}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={savingProfile}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Scraping Defaults */}
          {activeTab === 'scraping' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Scraping Defaults</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Set default values for new scraping tasks. You can override these per task.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Default Max Results</label>
                  <input
                    type="number"
                    value={defaultMaxResults}
                    onChange={(e) => setDefaultMaxResults(parseInt(e.target.value) || 0)}
                    min={1}
                    disabled={savingScraping}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Maximum leads to discover per task</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Default Pages / Site</label>
                  <input
                    type="number"
                    value={defaultMaxPages}
                    onChange={(e) => setDefaultMaxPages(parseInt(e.target.value) || 0)}
                    min={1}
                    disabled={savingScraping}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">How many pages to check per website</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Default Crawl Depth</label>
                  <select
                    value={defaultCrawlDepth}
                    onChange={(e) => setDefaultCrawlDepth(parseInt(e.target.value))}
                    disabled={savingScraping}
                    className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  >
                    <option value={1}>1 — Surface</option>
                    <option value={2}>2 — Recommended</option>
                    <option value={3}>3 — Deep</option>
                    <option value={4}>4 — Very deep</option>
                  </select>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">How deep to follow links from a page</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveScraping}
                disabled={savingScraping}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {savingScraping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Defaults
                  </>
                )}
              </button>
            </div>
          )}

          {/* Responsible Crawling */}
          {activeTab === 'crawling' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Responsible Crawling</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure how the crawler interacts with websites. These settings help ensure responsible behavior.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Request Timeout
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={requestTimeout}
                      onChange={(e) => setRequestTimeout(parseInt(e.target.value) || 0)}
                      min={5}
                      max={120}
                      disabled={savingCrawling}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-16 disabled:opacity-60"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-semibold">seconds</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">How long to wait before timing out a page</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Retry Limit
                  </label>
                  <input
                    type="number"
                    value={retryLimit}
                    onChange={(e) => setRetryLimit(parseInt(e.target.value) || 0)}
                    min={0}
                    max={10}
                    disabled={savingCrawling}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Number of retries before skipping a page</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Domain Rate Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={domainRateLimit}
                      onChange={(e) => setDomainRateLimit(parseInt(e.target.value) || 0)}
                      min={1}
                      max={30}
                      disabled={savingCrawling}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-20 disabled:opacity-60"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-semibold">sec/req</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Minimum seconds between requests to the same domain</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCrawling}
                disabled={savingCrawling}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {savingCrawling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose what notifications you want to receive.</p>
              </div>

              <div className="space-y-4">
                <NotificationToggle
                  label="Task Completed"
                  description="Get notified when a scraping task finishes successfully."
                  checked={taskComplete}
                  onChange={setTaskComplete}
                />
                <NotificationToggle
                  label="Task Failed"
                  description="Get notified when a scraping task encounters errors."
                  checked={taskFailed}
                  onChange={setTaskFailed}
                />
                <NotificationToggle
                  label="Weekly Report"
                  description="Receive a weekly summary of your scraping activity."
                  checked={weeklyReport}
                  onChange={setWeeklyReport}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {savingNotifications ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Preferences
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500/20 mt-0.5 cursor-pointer"
      />
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
    </label>
  );
}
