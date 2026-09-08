'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPinned,
  MessageCircle,
  User,
  Briefcase,
  Share2,
  Shield,
  Info,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { createScrapingTask, CreateTaskPayload } from '@/lib/api';
import { DataFieldKey } from '@/types';
import { useToast } from '@/components/shared/ToastContext';

const dataFields: { key: DataFieldKey; label: string; description: string; icon: React.ElementType; defaultSelected: boolean }[] = [
  { key: 'name', label: 'Organization Name', description: 'Official business or organization name', icon: Building2, defaultSelected: true },
  { key: 'phone', label: 'Phone Number', description: 'Primary contact phone number', icon: Phone, defaultSelected: true },
  { key: 'email', label: 'Email Address', description: 'Public email address for inquiries', icon: Mail, defaultSelected: true },
  { key: 'website', label: 'Website URL', description: 'Official website domain', icon: Globe, defaultSelected: true },
  { key: 'address', label: 'Physical Address', description: 'Street address, city and pincode', icon: MapPinned, defaultSelected: true },
  { key: 'whatsapp', label: 'WhatsApp Number', description: 'WhatsApp contact if available', icon: MessageCircle, defaultSelected: true },
  { key: 'contactPerson', label: 'Contact Person', description: 'Key person name if listed publicly', icon: User, defaultSelected: false },
  { key: 'designation', label: 'Designation', description: 'Role or title of the contact person', icon: Briefcase, defaultSelected: false },
  { key: 'socialLinks', label: 'Social Media Links', description: 'Facebook, Instagram, LinkedIn, YouTube', icon: Share2, defaultSelected: true },
];

function CreateTaskFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [searchRadius, setSearchRadius] = useState('25');
  const [maxResults, setMaxResults] = useState(100);
  const [maxPages, setMaxPages] = useState(20);
  const [crawlDepth, setCrawlDepth] = useState(2);
  const [selectedFields, setSelectedFields] = useState<DataFieldKey[]>(
    dataFields.filter((f) => f.defaultSelected).map((f) => f.key)
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleField = (key: DataFieldKey) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      showToast('Location is required', 'Please enter a location to search.', 'error');
      return;
    }
    if (!keyword.trim()) {
      showToast('Keyword is required', 'Please enter what you\'re looking for.', 'error');
      return;
    }
    if (!acknowledged) {
      showToast('Acknowledgement required', 'Please acknowledge the responsible crawling terms.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTaskPayload = {
        location: location.trim(),
        keyword: keyword.trim(),
        searchRadiusKm: parseInt(searchRadius),
        maxResults,
        maxPagesPerWebsite: maxPages,
        crawlDepth,
        requiredFields: selectedFields,
        acknowledgedResponsibleCrawling: acknowledged,
      };
      const task = await createScrapingTask(payload);
      router.push(`/tasks/${task.id}/created?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}`);
    } catch {
      showToast('Task creation failed', 'Something went wrong. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create Scraping Task</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tell us where to search and what you&apos;re looking for.
        </p>
      </div>

      {/* SECTION 1: Search Intent */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Search Intent</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Define where you want to search and what type of organizations.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Puducherry, Chennai, Madurai"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="keyword" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Keyword / Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. CBSE Schools, Hospitals, Restaurants"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 max-w-xs">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Search Radius <span className="text-slate-400 dark:text-slate-500 font-medium normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* SECTION 2: Scraping Controls */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Scraping Controls</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Configure how deep the crawler should search.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Maximum Results
            </label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              max={1000}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Max leads to discover (1–1000)</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Max Pages / Website
            </label>
            <input
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              max={100}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pages to crawl per website (1–100)</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Crawl Depth
            </label>
            <div className="relative">
              <select
                value={crawlDepth}
                onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
              >
                <option value={1}>1 — Surface only</option>
                <option value={2}>2 — Recommended</option>
                <option value={3}>3 — Deep</option>
                <option value={4}>4 — Very deep</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">How deep to follow links</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Required Data */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Required Data</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Select the types of information you want to extract.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataFields.map((field) => {
            const Icon = field.icon;
            const isSelected = selectedFields.includes(field.key);
            return (
              <button
                key={field.key}
                type="button"
                onClick={() => toggleField(field.key)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isSelected ? 'text-teal-900 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {field.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{field.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Responsible Crawling */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Responsible Crawling</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">We respect website access restrictions and rate limits.</p>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 mb-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-1">How we crawl responsibly</p>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              Only publicly accessible pages will be processed. The crawler respects reasonable rate limits, robots.txt directives, and access restrictions. No authentication is bypassed.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500/20 mt-0.5 shrink-0 cursor-pointer"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
            I understand that protected pages, authentication-required content and CAPTCHA challenges will not be bypassed.
          </span>
        </label>
      </section>

      {/* SECTION 5: Task Summary & Submit */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-5">Task Summary</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Location</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{location || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Keyword</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{keyword || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Max Results</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{maxResults}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Pages / Site</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{maxPages}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Data Fields</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFields.length} selected</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !location.trim() || !keyword.trim() || !acknowledged}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all duration-200"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                START SCRAPING
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CreateTaskPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-4" /><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-96" /></div>}>
      <CreateTaskFormContent />
    </Suspense>
  );
}
