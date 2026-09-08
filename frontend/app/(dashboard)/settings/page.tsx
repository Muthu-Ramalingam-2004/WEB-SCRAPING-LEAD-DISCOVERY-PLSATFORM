'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  SlidersHorizontal,
  Bell,
  Camera,
  Save,
  Globe,
  Clock,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { useToast } from '@/components/shared/ToastContext';

type SettingsTab = 'profile' | 'scraping' | 'crawling' | 'notifications';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile state
  const [name, setName] = useState('Muthu Ram');
  const [email, setEmail] = useState('muthu@leadfinder.io');

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

  const handleSave = () => {
    showToast('Settings saved', 'Your preferences have been updated.', 'success');
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'scraping', label: 'Scraping Defaults', icon: SlidersHorizontal },
    { key: 'crawling', label: 'Responsible Crawling', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and configure scraping preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Navigation */}
        <nav className="md:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-teal-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-card p-6 md:p-8">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-1">Profile</h2>
                <p className="text-xs text-slate-500">Manage your account information.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  MR
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Change Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {/* Scraping Defaults */}
          {activeTab === 'scraping' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-1">Scraping Defaults</h2>
                <p className="text-xs text-slate-500">Set default values for new scraping tasks. You can override these per task.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Default Max Results</label>
                  <input
                    type="number"
                    value={defaultMaxResults}
                    onChange={(e) => setDefaultMaxResults(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Maximum leads to discover per task</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Default Pages / Site</label>
                  <input
                    type="number"
                    value={defaultMaxPages}
                    onChange={(e) => setDefaultMaxPages(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">How many pages to check per website</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Default Crawl Depth</label>
                  <select
                    value={defaultCrawlDepth}
                    onChange={(e) => setDefaultCrawlDepth(parseInt(e.target.value))}
                    className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  >
                    <option value={1}>1 — Surface</option>
                    <option value={2}>2 — Recommended</option>
                    <option value={3}>3 — Deep</option>
                    <option value={4}>4 — Very deep</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">How deep to follow links from a page</p>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save Defaults
              </button>
            </div>
          )}

          {/* Responsible Crawling */}
          {activeTab === 'crawling' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-1">Responsible Crawling</h2>
                <p className="text-xs text-slate-500">Configure how the crawler interacts with websites. These settings help ensure responsible behavior.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Request Timeout
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={requestTimeout}
                      onChange={(e) => setRequestTimeout(parseInt(e.target.value) || 0)}
                      min={5}
                      max={120}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-16"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">seconds</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">How long to wait before timing out a page</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-slate-400" /> Retry Limit
                  </label>
                  <input
                    type="number"
                    value={retryLimit}
                    onChange={(e) => setRetryLimit(parseInt(e.target.value) || 0)}
                    min={0}
                    max={10}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Number of retries before skipping a page</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" /> Domain Rate Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={domainRateLimit}
                      onChange={(e) => setDomainRateLimit(parseInt(e.target.value) || 0)}
                      min={1}
                      max={30}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-20"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">sec/req</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Minimum seconds between requests to the same domain</p>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-1">Notifications</h2>
                <p className="text-xs text-slate-500">Choose what notifications you want to receive.</p>
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
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save Preferences
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
    <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 mt-0.5 cursor-pointer"
      />
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </label>
  );
}
