import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import EquipmentList from './pages/EquipmentList';
import MaintenanceKanban from './pages/MaintenanceKanban';
import CalendarView from './pages/CalendarView';
import Reporting from './pages/Reporting';
import { Wrench, LayoutGrid, Calendar, Package, BarChart2 } from 'lucide-react';

function App() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navigation Bar - Odoo Style */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-purple-600 p-2 rounded-lg">
                    <Wrench className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">GearGuard</h1>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-4 items-center">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${isActive('/')}`}>
                  <Package className="h-4 w-4" />
                  Equipment
                </Link>
                <Link to="/kanban" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${isActive('/kanban')}`}>
                  <LayoutGrid className="h-4 w-4" />
                  Maintenance Board
                </Link>
                <Link to="/calendar" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${isActive('/calendar')}`}>
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
                <Link to="/reporting" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${isActive('/reporting')}`}>
                  <BarChart2 className="h-4 w-4" />
                  Reporting
                </Link>
              </div>
            </div>
            {/* Mobile Menu Button could go here */}
             <div className="flex items-center sm:hidden">
                 {/* Mobile menu toggle placeholder */}
             </div>
          </div>
        </div>
      </nav>
        
      {/* Mobile Navigation (Bottom Bar) - Visible only on small screens */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around py-2">
           <Link to="/" className={`flex flex-col items-center p-2 rounded-md ${location.pathname === '/' ? 'text-purple-600' : 'text-gray-500'}`}>
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Equipment</span>
           </Link>
           <Link to="/kanban" className={`flex flex-col items-center p-2 rounded-md ${location.pathname === '/kanban' ? 'text-purple-600' : 'text-gray-500'}`}>
              <LayoutGrid className="h-5 w-5" />
              <span className="text-xs mt-1">Board</span>
           </Link>
           <Link to="/calendar" className={`flex flex-col items-center p-2 rounded-md ${location.pathname === '/calendar' ? 'text-purple-600' : 'text-gray-500'}`}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">Calendar</span>
           </Link>
           <Link to="/reporting" className={`flex flex-col items-center p-2 rounded-md ${location.pathname === '/reporting' ? 'text-purple-600' : 'text-gray-500'}`}>
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs mt-1">Reports</span>
           </Link>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mb-16 sm:mb-0">
        <Routes>
          <Route path="/" element={<EquipmentList />} />
          <Route path="/kanban" element={<MaintenanceKanban />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/reporting" element={<Reporting />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
