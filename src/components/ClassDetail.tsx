import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Users, Calendar, BarChart2, CheckCircle, XCircle, AlertCircle, HelpCircle,
  Plus, Trash2, Mail, Check, X, FileSpreadsheet, Printer, Save, FileJson, Clock, UserCheck, AlertTriangle
} from 'lucide-react';
import { SubjectClass, Student, AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import { calculateClassStats, downloadClassCSV } from '../utils/storage';
import PDFReportModal from './PDFReportModal';

interface ClassDetailProps {
  classItem: SubjectClass;
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  onBack: () => void;
  onAddStudent: (student: Omit<Student, 'id' | 'classId'>) => void;
  onRemoveStudent: (studentId: string) => void;
  onSaveAttendance: (date: string, records: { studentId: string; status: AttendanceStatus; remarks?: string }[]) => void;
}

export default function ClassDetail({
  classItem,
  students,
  attendance,
  settings,
  onBack,
  onAddStudent,
  onRemoveStudent,
  onSaveAttendance,
}: ClassDetailProps) {
  const [activeTab, setActiveTab] = useState<'mark' | 'roster' | 'logs'>('mark');
  
  // Date-picker defaults to today (2026-07-04)
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // State for recording active attendance
  // Pre-load existing records if any exist for this class on this date, otherwise default to "present"
  const classStudents = students.filter(s => s.classId === classItem.id);
  const classRecordsForDate = attendance.filter(r => r.classId === classItem.id && r.date === attendanceDate);

  const getInitialDraftRecords = () => {
    return classStudents.map(student => {
      const existing = classRecordsForDate.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: (existing?.status || 'present') as AttendanceStatus,
        remarks: existing?.remarks || '',
      };
    });
  };

  // Keep a local draft of attendance list being marked
  const [draftRecords, setDraftRecords] = useState(getInitialDraftRecords());
  const [lastSavedDate, setLastSavedDate] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  // Re-sync draft records if the selected date changes or students change
  React.useEffect(() => {
    setDraftRecords(getInitialDraftRecords());
    setNotification('');
  }, [attendanceDate, students, attendance]);

  // Roster enrollment Form State
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentRoll, setNewStudentRoll] = useState<string>('');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [rosterError, setRosterError] = useState<string>('');

  // PDF Report State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Statistics specific to this class
  const classStats = calculateClassStats(classItem.id, students, attendance);

  // Bulk marking utilities
  const handleMarkAll = (status: AttendanceStatus) => {
    setDraftRecords(prev => prev.map(r => ({ ...r, status })));
  };

  const handleUpdateStatus = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const handleUpdateRemarks = (studentId: string, remarks: string) => {
    setDraftRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, remarks } : r));
  };

  const handleSaveDraft = () => {
    onSaveAttendance(attendanceDate, draftRecords.map(r => ({
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks ? r.remarks.trim() : undefined
    })));
    
    setLastSavedDate(attendanceDate);
    setNotification(`Successfully recorded attendance for ${draftRecords.length} students on ${attendanceDate}!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddRosterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setRosterError('');

    if (!newStudentName.trim() || !newStudentRoll.trim()) {
      setRosterError('Name and Roll Number are required.');
      return;
    }

    // Check for roll number duplication in this class
    if (students.some(s => s.classId === classItem.id && s.rollNumber.toLowerCase() === newStudentRoll.trim().toLowerCase())) {
      setRosterError('A student with this Roll Number already exists in this class.');
      return;
    }

    onAddStudent({
      name: newStudentName.trim(),
      rollNumber: newStudentRoll.trim(),
      email: newStudentEmail.trim() || undefined
    });

    setNewStudentName('');
    setNewStudentRoll('');
    setNewStudentEmail('');
    setNotification(`Successfully enrolled ${newStudentName}!`);
    setTimeout(() => setNotification(''), 2000);
  };

  // Find all unique dates logged for this class
  const loggedDates = Array.from(new Set(
    attendance.filter(r => r.classId === classItem.id).map(r => r.date)
  )).sort((a, b) => b.localeCompare(a)); // sort descending (latest first)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back button & Roster identity block */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="flex h-9 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Classes</span>
        </button>
        
        <div className="flex flex-wrap gap-2">
          {/* Detailed spreadsheet CSV Export */}
          <button
            onClick={() => downloadClassCSV(classItem, students, attendance)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
            title="Download CSV report for Microsoft Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* High fidelity PDF print */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Class Profile Title card */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col justify-between sm:flex-row sm:items-center gap-6">
        <div>
          <span className="font-mono text-xxs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
            {classItem.code} • Subject Class
          </span>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {classItem.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <p>Teacher: <span className="text-gray-700 dark:text-gray-300">{classItem.teacherName}</span></p>
            {classItem.room && <p>• Room: <span className="text-gray-700 dark:text-gray-300">{classItem.room}</span></p>}
            {classItem.schedule && <p>• Schedule: <span className="text-gray-700 dark:text-gray-300">{classItem.schedule}</span></p>}
          </div>
        </div>

        {/* Rapid summary widgets */}
        <div className="flex gap-4 border-t border-gray-100 pt-4 sm:border-0 sm:pt-0">
          <div className="rounded-xl border border-gray-50 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-850">
            <span className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Enrolled Size</span>
            <span className="font-display text-base font-extrabold text-gray-900 dark:text-white">{classStudents.length} Students</span>
          </div>
          <div className="rounded-xl border border-gray-50 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-850">
            <span className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Avg. Attendance</span>
            <span className={`font-display text-base font-extrabold ${
              classStats.averagePercentage < settings.minAttendancePercent ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}>{classStats.averagePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="mb-6 flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mark'
              ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Mark Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Roster Manager ({classStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Logs Spreadsheet ({loggedDates.length} days)</span>
        </button>
      </div>

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{notification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tab View Panels */}
      <div>
        
        {/* Tab 1: MARK ATTENDANCE WORKSPACE */}
        {activeTab === 'mark' && (
          <div className="space-y-6">
            
            {/* Session Settings Header */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              
              {/* Date Input */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Select Session Date:
                </label>
                <div className="relative flex h-10 items-center rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-gray-700 outline-none dark:text-white dark:[color-scheme:dark]"
                  />
                </div>
                {classRecordsForDate.length > 0 && (
                  <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xxs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    Already Logged
                  </span>
                )}
              </div>

              {/* Bulk Actions & Save */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleMarkAll('present')}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xxs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('absent')}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xxs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Mark All Absent
                </button>
                <div className="border-l border-gray-200 h-6 dark:border-gray-800" />
                <button
                  onClick={handleSaveDraft}
                  disabled={draftRecords.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Attendance</span>
                </button>
              </div>

            </div>

            {/* Attendance Matrix Roster Grid */}
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 uppercase tracking-wider font-bold dark:border-gray-800 dark:bg-gray-900">
                      <th className="px-6 py-4 font-bold">Roll Number</th>
                      <th className="px-6 py-4 font-bold">Student Name</th>
                      <th className="px-6 py-4 text-center font-bold">Status Selector</th>
                      <th className="px-6 py-4 font-bold">Notes / Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {draftRecords.map((record) => (
                      <tr 
                        key={record.studentId}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        {/* Roll number */}
                        <td className="px-6 py-4 font-mono font-medium text-gray-500 dark:text-gray-400">
                          {record.rollNumber}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {record.name}
                        </td>

                        {/* Custom visual radio selector buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                            
                            {/* PRESENT button */}
                            <button
                              onClick={() => handleUpdateStatus(record.studentId, 'present')}
                              className={`rounded-lg px-2.5 py-1.5 text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                record.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              <Check className="h-3 w-3" />
                              <span>Present</span>
                            </button>

                            {/* LATE button */}
                            <button
                              onClick={() => handleUpdateStatus(record.studentId, 'late')}
                              className={`rounded-lg px-2.5 py-1.5 text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                record.status === 'late'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>Late</span>
                            </button>

                            {/* EXCUSED button */}
                            <button
                              onClick={() => handleUpdateStatus(record.studentId, 'excused')}
                              className={`rounded-lg px-2.5 py-1.5 text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                record.status === 'excused'
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              <HelpCircle className="h-3 w-3" />
                              <span>Excused</span>
                            </button>

                            {/* ABSENT button */}
                            <button
                              onClick={() => handleUpdateStatus(record.studentId, 'absent')}
                              className={`rounded-lg px-2.5 py-1.5 text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                record.status === 'absent'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              <X className="h-3 w-3" />
                              <span>Absent</span>
                            </button>

                          </div>
                        </td>

                        {/* Notes input */}
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={record.remarks}
                            onChange={(e) => handleUpdateRemarks(record.studentId, e.target.value)}
                            placeholder="Sick leave, parent note, late bus etc..."
                            className="w-full rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-1.5 text-xs focus:border-emerald-500 focus:bg-white outline-none dark:border-gray-800 dark:bg-gray-850 dark:text-white dark:focus:bg-gray-900"
                          />
                        </td>
                      </tr>
                    ))}

                    {draftRecords.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          <Users className="mx-auto h-10 w-10 mb-2" />
                          <p className="text-xs">No students are currently enrolled in this subject class.</p>
                          <button
                            onClick={() => setActiveTab('roster')}
                            className="mt-2 text-xxs font-bold text-emerald-600 hover:underline cursor-pointer"
                          >
                            Open Roster manager to enroll students
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: ROSTER ENROLLMENT AND MANAGER */}
        {activeTab === 'roster' && (
          <div className="grid gap-8 md:grid-cols-3">
            
            {/* Add Student Enrollment Form */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm h-fit">
              <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">
                Enroll New Student
              </h3>
              
              <form onSubmit={handleAddRosterStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Wanda Maximoff"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Academic Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentRoll}
                    onChange={(e) => setNewStudentRoll(e.target.value)}
                    placeholder="e.g. CS-2609"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. wanda@greenwood.edu"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {rosterError && (
                  <p className="text-xxs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{rosterError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Class Roster</span>
                </button>
              </form>
            </div>

            {/* Enrolled Students Table list */}
            <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 uppercase tracking-wider font-bold dark:border-gray-800 dark:bg-gray-900">
                      <th className="px-6 py-4 font-bold">Roll Number</th>
                      <th className="px-6 py-4 font-bold">Student Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 text-right font-bold">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {classStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/30">
                        <td className="px-6 py-4 font-mono font-semibold text-gray-500 dark:text-gray-400">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {student.email || '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Wipe "${student.name}" from class logs? All historical attendance records will be removed.`)) {
                                onRemoveStudent(student.id);
                              }
                            }}
                            className="rounded p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 cursor-pointer"
                            title="De-enroll Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          <Users className="mx-auto h-10 w-10 mb-2" />
                          <p className="text-xs">Roster is empty. Enroll students using the sidebar pane form.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: ATTENDANCE SPREADSHEET MATRIX */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            
            {/* Spreadsheet card container */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">
                    Enrollment Attendance Matrix
                  </h3>
                  <p className="text-xxs text-gray-500 dark:text-gray-400">
                    Horizontal calendar audit. Excel-compatible cell mapping.
                  </p>
                </div>
                
                {/* Legend badges */}
                <div className="flex flex-wrap gap-2 text-xxs font-bold">
                  <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                    P: Present
                  </span>
                  <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                    L: Late
                  </span>
                  <span className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                    E: Excused
                  </span>
                  <span className="flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                    A: Absent
                  </span>
                </div>
              </div>

              {/* Scrollable table window */}
              <div className="overflow-x-auto border border-gray-100 rounded-xl dark:border-gray-800">
                <table className="w-full text-left text-xxs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold dark:bg-gray-950 dark:border-gray-800">
                      <th className="px-4 py-3 font-bold border-r border-gray-100 dark:border-gray-800 sticky left-0 bg-gray-50 dark:bg-gray-950 z-10 w-28">Roll Number</th>
                      <th className="px-4 py-3 font-bold border-r border-gray-100 dark:border-gray-800 sticky left-28 bg-gray-50 dark:bg-gray-950 z-10 w-36">Student Name</th>
                      {loggedDates.slice().reverse().map(date => (
                        <th key={date} className="px-3 py-3 text-center border-r border-gray-100 dark:border-gray-800 font-mono font-medium">{date}</th>
                      ))}
                      <th className="px-4 py-3 text-right font-bold bg-emerald-50/20 dark:bg-emerald-950/10">Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {classStudents.map((student) => {
                      const classRecords = attendance.filter(r => r.classId === classItem.id && r.studentId === student.id);
                      let present = 0, late = 0, excused = 0, absent = 0;
                      classRecords.forEach(r => {
                        if (r.status === 'present') present++;
                        else if (r.status === 'late') late++;
                        else if (r.status === 'excused') excused++;
                        else if (r.status === 'absent') absent++;
                      });
                      const total = present + late + excused + absent;
                      const percentage = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 100;

                      return (
                        <tr key={student.id} className="hover:bg-gray-50/20">
                          {/* Roll No */}
                          <td className="px-4 py-2.5 font-mono font-semibold border-r border-gray-50 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 z-10">
                            {student.rollNumber}
                          </td>
                          {/* Name */}
                          <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white border-r border-gray-50 dark:border-gray-800 sticky left-28 bg-white dark:bg-gray-900 z-10">
                            {student.name}
                          </td>
                          {/* Attendance Cells */}
                          {loggedDates.slice().reverse().map(date => {
                            const rec = classRecords.find(r => r.date === date);
                            if (!rec) return <td key={date} className="px-3 py-2.5 text-center border-r border-gray-50 text-gray-300 dark:border-gray-800 dark:text-gray-700 font-bold">—</td>;
                            
                            return (
                              <td 
                                key={date} 
                                className={`px-3 py-2.5 text-center border-r border-gray-50 dark:border-gray-800 font-bold ${
                                  rec.status === 'present' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/20' :
                                  rec.status === 'late' ? 'text-amber-500 bg-amber-50/20' :
                                  rec.status === 'excused' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/20' :
                                  'text-rose-500 bg-rose-50/20'
                                }`}
                                title={`Remarks: ${rec.remarks || 'None'}`}
                              >
                                {rec.status === 'present' ? 'P' :
                                 rec.status === 'late' ? 'L' :
                                 rec.status === 'excused' ? 'E' : 'A'}
                              </td>
                            );
                          })}
                          {/* Rate percentage */}
                          <td className={`px-4 py-2.5 text-right font-bold bg-emerald-50/10 dark:bg-emerald-950/5 ${
                            percentage < settings.minAttendancePercent ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}

                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan={loggedDates.length + 3} className="px-6 py-12 text-center text-gray-400">
                          <Users className="mx-auto h-10 w-10 mb-2" />
                          <p className="text-xs">Roster is empty. Register students to view logs grid.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* High fidelity printable window overlay */}
      <PDFReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type="class"
        classItem={classItem}
        students={students}
        attendance={attendance}
        settings={settings}
      />

    </div>
  );
}
