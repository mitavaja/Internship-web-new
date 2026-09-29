import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarCheck,
  CalendarOff,
  Award,
  FileCheck2,
  Video,
  MessageSquare,
  FileText,
  CreditCard,
  UserCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks & Projects', href: '/tasks', icon: CheckSquare },
  { name: 'Attendance & Check-in', href: '/attendance', icon: CalendarCheck },
  { name: 'Live Mentorship', href: '/meetings', icon: Video },
  { name: 'Messages & Chat', href: '/messages', icon: MessageSquare },
  { name: 'Leave Requests', href: '/leaves', icon: CalendarOff },
  { name: 'Results & Grades', href: '/results', icon: Award },
  { name: 'My Certificate', href: '/certificates', icon: FileCheck2 },
  { name: 'Study Resources', href: '/documents', icon: FileText },
  { name: 'Fee & Invoices', href: '/payments', icon: CreditCard },
  { name: 'My Profile', href: '/profile', icon: UserCircle },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { profile } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
              M
            </div>
            <div>
              <div className="font-extrabold text-slate-900 leading-tight">MAINDOT</div>
              <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Intern Portal
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose && onClose()}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Enrolled Track Footer Card */}
        {profile?.internshipId && (
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enrolled Track</span>
            </div>
            <p className="text-xs font-extrabold text-slate-800 line-clamp-1">
              {profile.internshipId.title}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Duration: {profile.internshipId.durationWeeks} Weeks
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
