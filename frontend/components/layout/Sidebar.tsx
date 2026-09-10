'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  History,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Sparkles,
} from 'lucide-react';

import { useUser } from '@/components/shared/UserContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Task', href: '/tasks/create', icon: PlusCircle, highlight: true },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Task History', href: '/history', icon: History },
  { label: 'Exports', href: '/exports', icon: Download },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, getAvatarUrl, getDisplayName, getInitials } = useUser();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
            <Globe2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight tracking-tight">
                Lead Finder <span className="text-teal-600 dark:text-teal-400 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                Scraping Platform
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}

              {item.highlight && !collapsed && (
                <span className="ml-auto flex items-center gap-1 text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  NEW
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 dark:bg-teal-400 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 shadow-xs ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()!}
              alt={getDisplayName()}
              className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm border border-teal-500/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {getInitials()}
            </div>
          )}

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{getDisplayName()}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
