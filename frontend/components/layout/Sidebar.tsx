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

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
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
              <span className="font-bold text-slate-900 text-sm leading-tight tracking-tight">
                Lead Finder <span className="text-teal-600 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Scraping Platform
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}

              {item.highlight && !collapsed && (
                <span className="ml-auto flex items-center gap-1 text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  NEW
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            MR
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Muthu Ram</p>
              <p className="text-[11px] text-slate-500 truncate">muthu@leadfinder.io</p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
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
