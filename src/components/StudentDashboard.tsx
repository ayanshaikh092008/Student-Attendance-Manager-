import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, AlertTriangle, Calendar, Printer, BarChart2, CheckCircle, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { SubjectClass, Student, AttendanceRecord, AppSettings } from '../types';
import { calculateStudentStats } from '../utils/storage';
import PDFReportModal from './PDFReportModal';

interface StudentDashboardProps {
  classes: SubjectClass[];
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
}

export default function StudentDashboard({
  classes,
  students,
  attendance,
  settings,
}: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Filter students matching search
  const matchedStudents = searchQuery.trim() === '' 
    ? [] 
    : students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
  };

  // If a student is selected, compile their stats
  const studentStats = selectedStudent ? calculateStudentStats(selectedStudent, attendance) : null;
  const studentClass = selectedStudent ? classes.find(c => c.id === selectedStudent.classId) : null;
  const hasLowAttendance = studentStats ? studentStats.percentage < settings.minAttendancePercent : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Title & Introduction */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Student Portal
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter your name or roll number to lookup subject-wise logs, percentage trends, and export report slips.
        </p>
      </div>

      {/* Roster Search Input */}
      <div className="relative mb-8 max-w-xl mx-auto sm:mx-0">
        <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-white px-3.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll number (e.g. Peter Parker or CS-2601)..."
            className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>

        {/* Suggestion autocomplete overlay */}
        <AnimatePresence>
          {matchedStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {matchedStudents.map((student) => {
                  const sClass = classes.find(c => c.id === student.classId);
                  return (
                    <li key={student.id}>
                      <button
                        onClick={() => handleSelectStudent(student)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xxs font-mono text-gray-400">{student.rollNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xxs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                            {sClass?.name || 'Class Roster'}
                          </span>
                          <span className="block text-xxs font-mono text-gray-400 mt-0.5">Select profile <ArrowRight className="inline-block h-3 w-3" /></span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Student Report Display */}
      {selectedStudent && studentStats && studentClass ? (
        <motion.div
          key={selectedStudent.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Card: Student Identity & Total Progress gauge */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Identity Card */}
            <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xxs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Roster Record
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs font-mono font-medium text-gray-400 mt-0.5">
                      Roll Number: {selectedStudent.rollNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>

                {/* Sub-details */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold">Registered Subject</span>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{studentClass.name}</p>
                    <p className="text-xxs font-mono text-gray-400">{studentClass.code} • Room {studentClass.room || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Registered Email</span>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{selectedStudent.email || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Attendance warning card */}
              {hasLowAttendance && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400">
                      Critically Low Attendance Alert
                    </h4>
                    <p className="text-xxs text-rose-600/90 dark:text-rose-400/80 mt-1">
                      Your attendance rate ({studentStats.percentage}%) has fallen below the school's threshold ({settings.minAttendancePercent}%). Please coordinate with instructor <strong className="font-semibold">{studentClass.teacherName}</strong> immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gauge Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xxs font-bold uppercase tracking-wider text-gray-400">Cumulative Attendance</span>
              
              {/* SVG Radial Progress Circle */}
              <div className="relative mt-4 h-32 w-32 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-gray-100 dark:stroke-gray-800 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`fill-none transition-all duration-1000 ${
                      hasLowAttendance ? 'stroke-rose-500' : 'stroke-emerald-600 dark:stroke-emerald-400'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - studentStats.percentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="font-display text-2xl font-extrabold text-gray-900 dark:text-white">
                    {studentStats.percentage}%
                  </p>
                  <p className="text-xxs font-semibold text-gray-400">
                    Goal: {settings.minAttendancePercent}%
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 rounded-full border border-gray-100 bg-gray-50/50 px-3 py-1 text-xxs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                <span>{studentStats.present} Logged Attendances</span>
                <span>•</span>
                <span>{studentStats.total} Sessions Total</span>
              </div>
            </div>

          </div>

          {/* Grid Layout: Detailed logs & Counters */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Counts Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Roster Summary</h4>
              
              <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Present Days</span>
                </div>
                <span className="font-display text-base font-bold text-gray-900 dark:text-white">{studentStats.present}</span>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Late Days (Arrived Late)</span>
                </div>
                <span className="font-display text-base font-bold text-gray-900 dark:text-white">{studentStats.late}</span>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Excused Absence</span>
                </div>
                <span className="font-display text-base font-bold text-gray-900 dark:text-white">{studentStats.excused}</span>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Unexcused Absent Days</span>
                </div>
                <span className="font-display text-base font-bold text-rose-500">{studentStats.absent}</span>
              </div>
            </div>

            {/* Daily History logs */}
            <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col">
              <h4 className="font-display text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Historical Attendance Logs
              </h4>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2.5">
                {attendance
                  .filter(r => r.studentId === selectedStudent.id)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between border-b border-gray-50 pb-2.5 last:border-0 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {record.remarks && (
                            <p className="text-xxs text-gray-400 dark:text-gray-500 italic">
                              Remarks: {record.remarks}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-bold ${
                        record.status === 'present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        record.status === 'late' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                        record.status === 'excused' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {record.status === 'present' && <CheckCircle className="h-3 w-3" />}
                        {record.status === 'absent' && <XCircle className="h-3 w-3" />}
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                  ))}

                {attendance.filter(r => r.studentId === selectedStudent.id).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <Calendar className="h-10 w-10 mb-2" />
                    <p className="text-xs">No attendance entries have been recorded for your profile yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Printable Report card modal overlay */}
          <PDFReportModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            type="student"
            classItem={studentClass}
            studentItem={selectedStudent}
            students={students}
            attendance={attendance}
            settings={settings}
          />
        </motion.div>
      ) : (
        // Prompt state when no student is searched/selected
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <User className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-gray-900 dark:text-white">
            Find Your Attendance Profile
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
            Start typing your name or academic registration code above to generate your live attendance ledger.
          </p>
        </div>
      )}

    </div>
  );
}
