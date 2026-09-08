'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ListChecks,
  Users,
  Globe,
  ShieldCheck,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { getTasks, getLeads } from '@/lib/api';
import { ScrapingTask, Lead } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ScrapingTask[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    async function load() {
      const [t, l] = await Promise.all([getTasks(), getLeads()]);
      setTasks(t);
      setLeads(l);
      setLoading(false);
    }
    load();
  }, []);

  const handleQuickStart = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (keyword) params.set('keyword', keyword);
    router.push(`/tasks/create?${params.toString()}`);
  };

  // KPI calculations from mock data
  const totalTasks = tasks.length;
  const totalLeads = 2480;
  const websitesCrawled = 1920;
  const verifiedLeads = 1735;

  const kpis = [
    { label: 'Total Tasks', value: totalTasks || 24, icon: ListChecks, color: 'bg-teal-50 text-teal-600', trend: '+3 this week' },
    { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+240 this week' },
    { label: 'Websites Crawled', value: websitesCrawled.toLocaleString(), icon: Globe, color: 'bg-violet-50 text-violet-600', trend: '92% success' },
    { label: 'Verified Leads', value: verifiedLeads.toLocaleString(), icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600', trend: '70% verified' },
  ];

  const recentTasks = tasks.slice(0, 5);
  const recentLeads = leads.filter(l => l.confidence === 'HIGH').slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, Muthu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover businesses, organizations and public contact information.
          </p>
        </div>
        <Link
          href="/tasks/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all duration-200 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Scraping Task
        </Link>
      </div>

      {/* Quick Start Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Find your next leads</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter a location and what you&apos;re looking for to start discovering leads.
          </p>

          <form onSubmit={handleQuickStart} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where? e.g. Puducherry, Chennai"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="What? e.g. CBSE Schools, Hospitals"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all duration-200 shrink-0"
            >
              Start Scraping
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                  <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-semibold">{kpi.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Scraping Tasks</h3>
          <Link
            href="/history"
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Task ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Keyword</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Results</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{task.id}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{task.location}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{task.keyword}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-800 font-bold text-right">{task.resultsCount}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{task.createdAt}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={task.status === 'RUNNING' ? `/tasks/${task.id}/progress` : `/leads?taskId=${task.id}`}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors inline-flex items-center gap-1"
                        >
                          {task.status === 'RUNNING' ? 'View Progress' : 'View Leads'}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Verified Leads</h3>
          <Link
            href="/leads"
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
          >
            View all leads <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentLeads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads?selected=${lead.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                  {lead.organizationName.charAt(0)}
                </div>
                <ConfidenceBadge confidence={lead.confidence} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-teal-700 transition-colors line-clamp-1">
                {lead.organizationName}
              </h4>
              <p className="text-xs text-slate-500 mb-3">{lead.category} · {lead.city}</p>
              <div className="space-y-1.5">
                {lead.phone && (
                  <p className="text-xs text-slate-600 truncate">📞 {lead.phone}</p>
                )}
                {lead.email && (
                  <p className="text-xs text-slate-600 truncate">✉️ {lead.email}</p>
                )}
                {lead.website && (
                  <p className="text-xs text-teal-600 font-medium truncate">🌐 {lead.website}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
