'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  collapsedSidebar: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileSidebar,
  collapsedSidebar,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive page title & breadcrumbs
  const getPageMeta = () => {
    if (pathname === '/dashboard') return { title: 'Dashboard', breadcrumb: 'Overview' };
    if (pathname === '/tasks/create') return { title: 'Create Scraping Task', breadcrumb: 'Tasks' };
    if (pathname.includes('/progress')) return { title: 'Scraping Progress', breadcrumb: 'Tasks' };
    if (pathname.includes('/created')) return { title: 'Task Created', breadcrumb: 'Tasks' };
    if (pathname === '/leads') return { title: 'Lead Discovery Engine', breadcrumb: 'Leads' };
    if (pathname === '/history') return { title: 'Task History', breadcrumb: 'History' };
    if (pathname === '/exports') return { title: 'Exports & Downloads', breadcrumb: 'Data' };
    if (pathname === '/settings') return { title: 'Settings & Preferences', breadcrumb: 'Account' };
    return { title: 'Lead Discovery Platform', breadcrumb: 'App' };
  };

  const { title, breadcrumb } = getPageMeta();

  return (
    <header
      className={`h-16 bg-white border-b border-slate-200/80 fixed top-0 right-0 z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${
        collapsedSidebar ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>{breadcrumb}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-teal-600">{title}</span>
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-none">{title}</h1>
        </div>
      </div>

      {/* Center: Global Search (Desktop) */}
      <div className="hidden lg:flex items-center w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search leads, tasks, keywords..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Task TASK-000124 completed</p>
                    <p className="text-[11px] text-slate-500">100 leads discovered in Puducherry</p>
                    <span className="text-[10px] text-slate-400">10 mins ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs border-t pt-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Verification Engine updated</p>
                    <p className="text-[11px] text-slate-500">Phone pattern matching optimized</p>
                    <span className="text-[10px] text-slate-400">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              MR
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">Muthu Ram</span>
              <span className="text-[10px] text-slate-400 font-medium">Administrator</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b">
                <p className="text-xs font-bold text-slate-900">Muthu Ram</p>
                <p className="text-[11px] text-slate-500 truncate">muthu@leadfinder.io</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profile Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Scraping Defaults
              </button>
              <div className="border-t my-1" />
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
