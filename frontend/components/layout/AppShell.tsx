'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans flex flex-col transition-colors duration-150">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-white dark:bg-slate-900 h-full z-10 shadow-2xl">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Top Header */}
      <TopHeader
        onOpenMobileSidebar={() => setMobileOpen(true)}
        collapsedSidebar={collapsed}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 pt-16 transition-all duration-300 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-[calc(100vh-4rem)] flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
