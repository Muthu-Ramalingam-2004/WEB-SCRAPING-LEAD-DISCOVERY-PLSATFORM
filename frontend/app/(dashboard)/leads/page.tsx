'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  MapPin,
  X,
  ShieldCheck,
  ShieldAlert,
  Shield,
  User,
  Building2,
  Share2,
  Link as LinkIcon,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getLeads } from '@/lib/api';
import { Lead } from '@/types';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { CopyButton } from '@/components/shared/CopyButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { useToast } from '@/components/shared/ToastContext';

function LeadsContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function load() {
      const filters: Record<string, string> = {};
      const taskId = searchParams.get('taskId');
      if (taskId) filters.taskId = taskId;
      const data = await getLeads(filters);
      setLeads(data);
      setLoading(false);

      // Auto-select from URL
      const selId = searchParams.get('selected');
      if (selId) {
        const match = data.find((l) => l.id === selId);
        if (match) setSelectedLead(match);
      }
    }
    load();
  }, [searchParams]);

  const filtered = leads.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.organizationName.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageLeads = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageLeads.map((l) => l.id)));
    }
  };

  const handleExport = () => {
    showToast('Export started', `Exporting ${selectedIds.size || filtered.length} leads as CSV...`, 'info');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)]">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedLead ? 'mr-0' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Review, verify and export your discovered leads.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search leads by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-slate-500 mb-2 font-semibold">
          Showing {pageLeads.length} of {filtered.length} leads
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </p>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Your discovered leads will appear here after scraping tasks complete."
            actionLabel="Create Scraping Task"
            actionHref="/tasks/create"
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm min-w-[900px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
                    <th className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === pageLeads.length && pageLeads.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Website</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${
                        selectedLead?.id === lead.id ? 'bg-teal-50/50' : ''
                      }`}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                            {lead.organizationName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 text-sm truncate max-w-[200px]">
                            {lead.organizationName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">{lead.category}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">{lead.city}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-700 font-medium">{lead.phone}</span>
                          <CopyButton text={lead.phone} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-700 truncate max-w-[140px]">{lead.email}</span>
                          <CopyButton text={lead.email} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <a
                          href={`https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium truncate max-w-[120px] inline-flex items-center gap-1"
                        >
                          {lead.website}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-3 py-3"><ConfidenceBadge confidence={lead.confidence} /></td>
                      <td className="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap">{lead.scrapedDate}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <div className="w-full md:w-[420px] shrink-0 bg-white border-l border-slate-200 overflow-y-auto h-full animate-in slide-in-from-right shadow-floating">
          {/* Drawer Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-5 py-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{selectedLead.organizationName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <ConfidenceBadge confidence={selectedLead.confidence} />
                <span className="text-xs text-slate-500">{selectedLead.category}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h3>
              <div className="space-y-3">
                <DrawerField icon={Phone} label="Phone" value={selectedLead.phone} source={selectedLead.sources.phone} copiable />
                <DrawerField icon={Mail} label="Email" value={selectedLead.email} source={selectedLead.sources.email} copiable />
                {selectedLead.whatsapp && (
                  <DrawerField icon={MessageCircle} label="WhatsApp" value={selectedLead.whatsapp} source={selectedLead.sources.whatsapp} copiable />
                )}
              </div>
            </div>

            {/* Organization */}
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Organization</h3>
              <div className="space-y-3">
                <DrawerField icon={Building2} label="Name" value={selectedLead.organizationName} />
                <DrawerField icon={Building2} label="Category" value={selectedLead.category} />
                <DrawerField icon={MapPin} label="Address" value={selectedLead.address} source={selectedLead.sources.address} />
                <DrawerField icon={MapPin} label="City" value={selectedLead.city} />
                <DrawerField icon={MapPin} label="State" value={selectedLead.state} />
                {selectedLead.pincode && <DrawerField icon={MapPin} label="Pincode" value={selectedLead.pincode} />}
              </div>
            </div>

            {/* Contact Person */}
            {selectedLead.contactPerson && (
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Contact Person</h3>
                <div className="space-y-3">
                  <DrawerField icon={User} label="Name" value={selectedLead.contactPerson.name} />
                  <DrawerField icon={User} label="Designation" value={selectedLead.contactPerson.designation} />
                </div>
              </div>
            )}

            {/* Online Presence */}
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Online Presence</h3>
              <div className="space-y-3">
                <DrawerField icon={Globe} label="Website" value={selectedLead.website} link={`https://${selectedLead.website}`} source={selectedLead.sources.website} />
                {selectedLead.socialLinks.map((sl) => (
                  <DrawerField
                    key={sl.platform}
                    icon={Share2}
                    label={sl.platform.charAt(0).toUpperCase() + sl.platform.slice(1)}
                    value={sl.url}
                    link={sl.url}
                  />
                ))}
              </div>
            </div>

            {/* Source Evidence */}
            {Object.keys(selectedLead.sources).length > 0 && (
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Source Evidence</h3>
                <div className="space-y-2">
                  {Object.entries(selectedLead.sources).map(([key, src]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{src.field}</span>
                        {src.verified && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 mb-1">{src.value}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5" />
                          {src.sourceUrl.replace('https://', '')}
                        </p>
                        <a
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-teal-600 hover:text-teal-800 shrink-0 flex items-center gap-0.5"
                        >
                          Open Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper field component for the drawer
function DrawerField({
  icon: Icon,
  label,
  value,
  link,
  source,
  copiable,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  link?: string;
  source?: { verified: boolean; sourceUrl: string } | undefined;
  copiable?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium truncate"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm text-slate-800 font-medium truncate">{value}</p>
          )}
          {source?.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          {copiable && <CopyButton text={value} />}
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <LeadsContent />
    </Suspense>
  );
}
