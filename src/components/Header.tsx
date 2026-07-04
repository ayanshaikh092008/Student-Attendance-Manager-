import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, GraduationCap, Settings, School, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  activeTab: 'student' | 'teacher';
  setActiveTab: (tab: 'student' | 'teacher') => void;
  onOpenSettings: () => void;
  isUnlocked: boolean;
  onLockTeacher: () => void;
}

export default function Header({ 
  settings, 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  isUnlocked,
  onLockTeacher
}: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500">
            <School className="h-5 w-5" id="header-school-icon" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
              {settings.schoolName}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Attendance Manager • {settings.academicYear}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Role Toggle Selector */}
          <div className="relative flex rounded-full bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('student')}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                activeTab === 'student'
                  ? 'text-emerald-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {activeTab === 'student' && (
                <motion.div
                  layoutId="active-role-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-gray-700"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <User className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10 hidden sm:inline">Student View</span>
              <span className="relative z-10 sm:hidden">Student</span>
            </button>

            <button
              onClick={() => setActiveTab('teacher')}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                activeTab === 'teacher'
                  ? 'text-emerald-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {activeTab === 'teacher' && (
                <motion.div
                  layoutId="active-role-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-gray-700"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <GraduationCap className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10 hidden sm:inline">Teacher View</span>
              <span className="relative z-10 sm:hidden">Teacher</span>
              {activeTab === 'teacher' && isUnlocked && (
                <ShieldCheck className="relative z-10 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            title="System Settings & Backups"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
