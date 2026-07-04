import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Printer, School, User, Calendar, FileCheck, HelpCircle } from 'lucide-react';
import { SubjectClass, Student, AttendanceRecord, AppSettings } from '../types';
import { calculateStudentStats, calculateClassStats } from '../utils/storage';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'class' | 'student';
  classItem: SubjectClass;
  studentItem?: Student;
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
}

export default function PDFReportModal({
  isOpen,
  onClose,
  type,
  classItem,
  studentItem,
  students,
  attendance,
  settings,
}: PDFReportModalProps) {
  
  useEffect(() => {
    // Add overflow hidden to body when open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const classStudents = students.filter(s => s.classId === classItem.id);
  const classRecords = attendance.filter(r => r.classId === classItem.id);
  const uniqueDates = Array.from(new Set(classRecords.map(r => r.date))).sort();

  // Stats calculation
  const classStats = calculateClassStats(classItem.id, students, attendance);
  const studentStats = studentItem ? calculateStudentStats(studentItem, attendance) : null;
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        
        {/* Header - Hidden during print */}
        <div className="no-print flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              Print Preview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generating academic grade sheets optimized for A4/Letter size.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print or Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Sandbox */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900/40">
          
          {/* Printable Container Sheet */}
          <div className="print-container mx-auto max-w-[800px] border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            
            {/* Academic Letterhead */}
            <div className="flex flex-col border-b-2 border-gray-800 pb-6 dark:border-gray-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                  <School className="h-8 w-8" id="report-school-icon" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {settings.schoolName}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Office of Academic Affairs • {settings.academicYear}
                  </p>
                  <p className="text-xxs text-gray-400">
                    Report Compiled: {todayStr}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-l-2 border-emerald-600 pl-4 sm:mt-0 dark:border-emerald-400">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {type === 'class' ? 'Class Enrollment Attendance' : 'Student Performance Report'}
                </h4>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {classItem.name} ({classItem.code})
                </p>
                <p className="text-xxs text-gray-500 dark:text-gray-400">
                  Instructor: {classItem.teacherName}
                </p>
              </div>
            </div>

            {/* Content for CLASS Attendance Report */}
            {type === 'class' && (
              <div className="mt-6 space-y-6">
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-3 gap-4 border border-gray-100 bg-gray-50/50 p-4 rounded-xl dark:border-gray-700 dark:bg-gray-900/30">
                  <div className="text-center">
                    <span className="text-xxs font-bold uppercase tracking-wider text-gray-400">Active Enrollment</span>
                    <p className="font-display text-xl font-bold text-gray-900 dark:text-white">{classStudents.length}</p>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <span className="text-xxs font-bold uppercase tracking-wider text-gray-400">Average Attendance</span>
                    <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{classStats.averagePercentage}%</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xxs font-bold uppercase tracking-wider text-gray-400">Critical Alerts (&lt;{settings.minAttendancePercent}%)</span>
                    <p className="font-display text-xl font-bold text-rose-500">{classStats.lowAttendanceCount}</p>
                  </div>
                </div>

                {/* Main Table Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                    Class Roster & Cumulative Metrics
                  </h4>
                  <table className="w-full border-collapse border border-gray-200 text-left text-xs dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-200 p-2 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Roll No</th>
                        <th className="border border-gray-200 p-2 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Student Name</th>
                        <th className="border border-gray-200 p-2 text-center font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Present</th>
                        <th className="border border-gray-200 p-2 text-center font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Late</th>
                        <th className="border border-gray-200 p-2 text-center font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Excused</th>
                        <th className="border border-gray-200 p-2 text-center font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Absent</th>
                        <th className="border border-gray-200 p-2 text-right font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStats.studentStats.map(({ student, present, late, excused, absent, percentage, total }) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="border border-gray-200 p-2 font-mono dark:border-gray-600">{student.rollNumber}</td>
                          <td className="border border-gray-200 p-2 font-medium dark:border-gray-600">{student.name}</td>
                          <td className="border border-gray-200 p-2 text-center dark:border-gray-600">{present}</td>
                          <td className="border border-gray-200 p-2 text-center dark:border-gray-600">{late}</td>
                          <td className="border border-gray-200 p-2 text-center dark:border-gray-600">{excused}</td>
                          <td className="border border-gray-200 p-2 text-center dark:border-gray-600 text-rose-500">{absent}</td>
                          <td className={`border border-gray-200 p-2 text-right font-bold dark:border-gray-600 ${
                            percentage < settings.minAttendancePercent ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content for SINGLE STUDENT Attendance Report */}
            {type === 'student' && studentItem && studentStats && (
              <div className="mt-6 space-y-6">
                {/* Student Credentials */}
                <div className="grid grid-cols-2 gap-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30 text-xs">
                  <div>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Student Name:</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{studentItem.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Roll Number:</span>
                    <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{studentItem.rollNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Contact Email:</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{studentItem.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Target Core Requirement:</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{settings.minAttendancePercent}% Minimum</p>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="rounded-lg border border-gray-100 bg-emerald-50/40 p-3 dark:border-emerald-900/20 dark:bg-emerald-950/10">
                    <span className="text-xxs font-bold text-emerald-800 dark:text-emerald-400">PRESENT</span>
                    <p className="font-display text-lg font-bold text-emerald-600">{studentStats.present}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-amber-50/40 p-3 dark:border-amber-900/20 dark:bg-amber-950/10">
                    <span className="text-xxs font-bold text-amber-800 dark:text-amber-400">LATE</span>
                    <p className="font-display text-lg font-bold text-amber-600">{studentStats.late}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-indigo-50/40 p-3 dark:border-indigo-900/20 dark:bg-indigo-950/10">
                    <span className="text-xxs font-bold text-indigo-800 dark:text-indigo-400">EXCUSED</span>
                    <p className="font-display text-lg font-bold text-indigo-600">{studentStats.excused}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-rose-50/40 p-3 dark:border-rose-900/20 dark:bg-rose-950/10">
                    <span className="text-xxs font-bold text-rose-800 dark:text-rose-400">ABSENT</span>
                    <p className="font-display text-lg font-bold text-rose-500">{studentStats.absent}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-100/40 p-3 dark:border-gray-700/20 dark:bg-gray-800/20">
                    <span className="text-xxs font-bold text-gray-500">PERCENTAGE</span>
                    <p className={`font-display text-lg font-bold ${
                      studentStats.percentage < settings.minAttendancePercent ? 'text-rose-600' : 'text-emerald-600'
                    }`}>{studentStats.percentage}%</p>
                  </div>
                </div>

                {/* History list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                    Detailed Date-Wise Log
                  </h4>
                  <table className="w-full border-collapse border border-gray-200 text-left text-xs dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-200 p-2 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Session Date</th>
                        <th className="border border-gray-200 p-2 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Status</th>
                        <th className="border border-gray-200 p-2 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-200">Comments / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueDates.map(date => {
                        const rec = classRecords.find(r => r.studentId === studentItem.id && r.date === date);
                        if (!rec) return null;
                        return (
                          <tr key={date} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="border border-gray-200 p-2 font-mono dark:border-gray-600">{date}</td>
                            <td className="border border-gray-200 p-2 dark:border-gray-600">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xxs font-bold ${
                                rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                rec.status === 'late' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                rec.status === 'excused' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {rec.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="border border-gray-200 p-2 text-gray-500 dark:border-gray-600 dark:text-gray-400 italic">
                              {rec.remarks || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Formal Stamp/Signature Footer block */}
            <div className="mt-12 flex items-end justify-between border-t border-gray-200 pt-8 dark:border-gray-700 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-gray-400">Verified System Audit Log</p>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="h-4 w-4" />
                  <span className="font-mono font-medium">STATUS: SIGNED & LOCKED</span>
                </div>
              </div>
              <div className="text-center w-48">
                <div className="border-b border-gray-800 pb-1 dark:border-gray-200 font-serif italic text-gray-600 dark:text-gray-400 text-sm">
                  {classItem.teacherName}
                </div>
                <p className="mt-1 text-xxs uppercase tracking-wider text-gray-400 font-bold">
                  Class Instructor Signature
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
