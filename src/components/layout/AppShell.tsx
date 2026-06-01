import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { Menu, X } from 'lucide-react';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar — hidden on mobile, shown as overlay when toggled */}
        <div
          className={`fixed inset-0 z-40 lg:static lg:z-auto transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-w-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden mb-4 p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
