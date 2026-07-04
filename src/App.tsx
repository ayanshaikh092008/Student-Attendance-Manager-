import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { loadDatabase, saveDatabase, getInitialState } from './utils/storage';
import { DatabaseState, SubjectClass, Student, AttendanceRecord, AttendanceStatus, AppSettings, TeacherPinConfig } from './types';
import Header from './components/Header';
import PasscodeLock from './components/PasscodeLock';
import SettingsModal from './components/SettingsModal';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassDetail from './components/ClassDetail';
import { ShieldAlert, BookOpen, User, HelpCircle, School, ChevronRight } from 'lucide-react';

export default function App() {
  // Global Database state
  const [dbState, setDbState] = useState<DatabaseState>(() => loadDatabase());
  
  // Navigation & UI focus states
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Security Locks
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showPinChallenge, setShowPinChallenge] = useState<boolean>(false);

  // Synchronize with local storage on state change
  const updateDbState = (updater: (prev: DatabaseState) => DatabaseState) => {
    setDbState(prev => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // Intercept tab changes to check pin lock
  const handleTabChange = (tab: 'student' | 'teacher') => {
    if (tab === 'teacher' && dbState.pinConfig.isEnabled && !isUnlocked) {
      setShowPinChallenge(true);
    } else {
      setActiveTab(tab);
      // Reset selected class when returning to student
      if (tab === 'student') {
        setSelectedClassId(null);
      }
    }
  };

  const handlePinSuccess = () => {
    setIsUnlocked(true);
    setShowPinChallenge(false);
    setActiveTab('teacher');
  };

  const handlePinCancel = () => {
    setShowPinChallenge(false);
    setActiveTab('student');
  };

  // Lock teacher mode when locking or tab changes back to student
  const handleLockTeacher = () => {
    setIsUnlocked(false);
  };

  useEffect(() => {
    if (activeTab === 'student') {
      // Auto-lock when entering student view to preserve security
      setIsUnlocked(false);
    }
  }, [activeTab]);

  // Actions: Class Administration
  const handleCreateClass = (newClassData: Omit<SubjectClass, 'id'>) => {
    updateDbState(prev => {
      const newClassId = `c_${Date.now()}`;
      const newClass: SubjectClass = {
        ...newClassData,
        id: newClassId
      };
      return {
        ...prev,
        classes: [...prev.classes, newClass]
      };
    });
  };

  const handleDeleteClass = (classId: string) => {
    updateDbState(prev => {
      return {
        ...prev,
        classes: prev.classes.filter(c => c.id !== classId),
        students: prev.students.filter(s => s.classId !== classId),
        attendance: prev.attendance.filter(r => r.classId !== classId)
      };
    });
    // Return to main dashboard if deleting active class details
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
  };

  // Actions: Student Roster Administration
  const handleAddStudent = (studentData: Omit<Student, 'id' | 'classId'>) => {
    if (!selectedClassId) return;
    updateDbState(prev => {
      const newStudent: Student = {
        ...studentData,
        id: `s_${Date.now()}`,
        classId: selectedClassId
      };
      return {
        ...prev,
        students: [...prev.students, newStudent]
      };
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    updateDbState(prev => {
      return {
        ...prev,
        students: prev.students.filter(s => s.id !== studentId),
        attendance: prev.attendance.filter(r => r.studentId !== studentId)
      };
    });
  };

  // Actions: Record Session Attendance
  const handleSaveAttendance = (
    date: string, 
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) => {
    if (!selectedClassId) return;
    updateDbState(prev => {
      // Filter out pre-existing records for this class and date to prevent duplicate slots
      const cleanAttendance = prev.attendance.filter(
        r => !(r.classId === selectedClassId && r.date === date)
      );

      // Map incoming registers to DB schemas
      const newRecords: AttendanceRecord[] = records.map(rec => ({
        id: `${selectedClassId}_${rec.studentId}_${date}`,
        classId: selectedClassId,
        studentId: rec.studentId,
        date,
        status: rec.status,
        remarks: rec.remarks
      }));

      return {
        ...prev,
        attendance: [...cleanAttendance, ...newRecords]
      };
    });
  };

  // Actions: System Backup & State Resets
  const handleSaveSettings = (nextSettings: AppSettings) => {
    updateDbState(prev => ({
      ...prev,
      settings: nextSettings
    }));
  };

  const handleSavePinConfig = (nextPinConfig: TeacherPinConfig) => {
    updateDbState(prev => ({
      ...prev,
      pinConfig: nextPinConfig
    }));
    if (!nextPinConfig.isEnabled) {
      setIsUnlocked(true);
    }
  };

  const handleImportBackup = (nextState: DatabaseState) => {
    setDbState(nextState);
    saveDatabase(nextState);
    setIsUnlocked(false);
  };

  const handleResetSampleData = () => {
    const freshSample = getInitialState();
    setDbState(freshSample);
    saveDatabase(freshSample);
    setIsUnlocked(false);
    setSelectedClassId(null);
  };

  const handleClearAllData = () => {
    const blankState: DatabaseState = {
      classes: [],
      students: [],
      attendance: [],
      pinConfig: { isEnabled: false, pin: '1234' },
      settings: {
        minAttendancePercent: 75,
        schoolName: 'New Greenwood Academy',
        academicYear: '2026-2027'
      }
    };
    setDbState(blankState);
    saveDatabase(blankState);
    setIsUnlocked(true); // Bypass pin if disabled
    setSelectedClassId(null);
  };

  const activeClass = dbState.classes.find(c => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 antialiased selection:bg-emerald-600/10 dark:bg-gray-950 dark:text-gray-100 font-sans">
      
      {/* App Bar Navigation */}
      <Header
        settings={dbState.settings}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isUnlocked={isUnlocked}
        onLockTeacher={handleLockTeacher}
      />

      {/* Main Sandbox Dashboard container */}
      <main className="relative pb-16">
        
        {/* Switch Views with micro-animations */}
        <AnimatePresence mode="wait">
          
          {/* STUDENT LOOKUP MODULE */}
          {activeTab === 'student' && (
            <motion.div
              key="student-portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudentDashboard
                classes={dbState.classes}
                students={dbState.students}
                attendance={dbState.attendance}
                settings={dbState.settings}
              />
            </motion.div>
          )}

          {/* TEACHER WORKSPACE MODULE */}
          {activeTab === 'teacher' && (
            <motion.div
              key="teacher-portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!selectedClassId ? (
                // Primary dashboard: subject lists & stats
                <TeacherDashboard
                  classes={dbState.classes}
                  students={dbState.students}
                  attendance={dbState.attendance}
                  settings={dbState.settings}
                  onSelectClass={setSelectedClassId}
                  onCreateClass={handleCreateClass}
                  onDeleteClass={handleDeleteClass}
                />
              ) : (
                activeClass && (
                  // Detailed view: class list, marking, calendar, export matrices
                  <ClassDetail
                    classItem={activeClass}
                    students={dbState.students}
                    attendance={dbState.attendance}
                    settings={dbState.settings}
                    onBack={() => setSelectedClassId(null)}
                    onAddStudent={handleAddStudent}
                    onRemoveStudent={handleRemoveStudent}
                    onSaveAttendance={handleSaveAttendance}
                  />
                )
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Tactile PIN Lock Screen modal */}
      <AnimatePresence>
        {showPinChallenge && (
          <PasscodeLock
            correctPin={dbState.pinConfig.pin}
            onSuccess={handlePinSuccess}
            onCancel={handlePinCancel}
          />
        )}
      </AnimatePresence>

      {/* System Configurations Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={dbState.settings}
            pinConfig={dbState.pinConfig}
            dbState={dbState}
            onSaveSettings={handleSaveSettings}
            onSavePinConfig={handleSavePinConfig}
            onImportBackup={handleImportBackup}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
