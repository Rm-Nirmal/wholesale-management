import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
  onOpenCommand: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onOpenCommand }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Dynamic Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          onOpenCommand={onOpenCommand}
        />

        {/* Scrollable Workspace Panels */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 focus:outline-none">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
