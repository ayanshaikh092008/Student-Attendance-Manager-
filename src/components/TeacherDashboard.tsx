import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BookOpen, AlertTriangle, Play, Plus, BookMarked, HelpCircle,
  Search, ShieldAlert, ArrowRight, ClipboardList, Trash2, Mail, ExternalLink, Calendar, PlusCircle, XCircle
} from 'lucide-react';
import { SubjectClass, Student, AttendanceRecord, AppSettings } from '../types';
import { calculateClassStats, calculateStudentStats } from '../utils/storage';

interface TeacherDashboardProps {
  classes: SubjectClass[];
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  onSelectClass: (classId: string) => void;
  onCreateClass: (newClass: Omit<SubjectClass, 'id'>) => void;
  onDeleteClass: (classId: string) => void;
}

export default function TeacherDashboard({
  classes,
  students,
  attendance,
  settings,
  onSelectClass,
  onCreateClass,
  onDeleteClass,
}: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  
  // New Class Form State
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassCode, setNewClassCode] = useState<string>('');
  const [newClassTeacher, setNewClassTeacher] = useState<string>('');
  const [newClassRoom, setNewClassRoom] = useState<string>('');
  const [newClassSchedule, setNewClassSchedule] = useState<string>('');

  // 1. Calculations for high-level summary cards
  const totalClassesCount = classes.length;
  const totalStudentsCount = students.length;

  let overallPercentageSum = 0;
  let activeClassesCount = 0;
  let totalLowAttendanceCount = 0;

  // Compile stats per class
  const classesWithStats = classes.map(c => {
    const stats = calculateClassStats(c.id, students, attendance);
    if (stats.studentStats.length > 0) {
      overallPercentageSum += stats.averagePercentage;
      activeClassesCount++;
    }
    totalLowAttendanceCount += stats.lowAttendanceCount;
    return {
      ...c,
      studentCount: students.filter(s => s.classId === c.id).length,
      averagePercentage: stats.averagePercentage,
      lowAttendanceCount: stats.lowAttendanceCount,
    };
  });

  const overallAveragePercent = activeClassesCount > 0 
    ? Math.round(overallPercentageSum / activeClassesCount) 
    : 100;

  // 2. Identify all students under threshold across all classes for alert desk
  const lowAttendanceStudents = students.map(student => {
    const stats = calculateStudentStats(student, attendance);
    const classItem = classes.find(c => c.id === student.classId);
    return {
      student,
      stats,
      classItem
    };
  })
  .filter(item => item.stats.total > 0 && item.stats.percentage < settings.minAttendancePercent)
  .sort((a, b) => a.stats.percentage - b.stats.percentage);

  // Filter classes based on query
  const filteredClasses = classesWithStats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassCode) return;

    onCreateClass({
      name: newClassName,
      code: newClassCode,
      teacherName: newClassTeacher || 'Instructor',
      room: newClassRoom,
      schedule: newClassSchedule,
    });

    // Reset fields & close
    setNewClassName('');
    setNewClassCode('');
    setNewClassTeacher('');
    setNewClassRoom('');
    setNewClassSchedule('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Teacher Workspace
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor class roll logs, add new sections, and audit students under attendance risk.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Class Subject</span>
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Card: Total Subjects */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-400">Classes Managed</p>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {totalClassesCount}
            </h3>
          </div>
        </div>

        {/* Card: Active Students */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-400">Total Enrolled</p>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {totalStudentsCount}
            </h3>
          </div>
        </div>

        {/* Card: Combined Attendance Percent */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-400">Overall Attendance</p>
            <h3 className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {overallAveragePercent}%
            </h3>
          </div>
        </div>

        {/* Card: Low Attendance Alerts */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-400">Below {settings.minAttendancePercent}% Target</p>
            <h3 className="font-display text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {totalLowAttendanceCount} Students
            </h3>
          </div>
        </div>

      </div>

      {/* Main Grid: Class Catalog & Low Attendance Desk */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Column Left/Center: Classes List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Class Search Bar */}
          <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-white px-3.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes by name, subject code, or instructor..."
              className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>

          {/* Classes Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {filteredClasses.map((classItem) => (
              <div 
                key={classItem.id}
                className="group relative rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xxs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded">
                        {classItem.code}
                      </span>
                      <h4 className="font-display text-base font-bold text-gray-900 dark:text-white mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {classItem.name}
                      </h4>
                    </div>
                    
                    {/* Delete Class */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${classItem.name}"? This will also remove enrolled students.`)) {
                          onDeleteClass(classItem.id);
                        }
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Metadata fields */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <p>Instructor: <strong className="font-semibold text-gray-700 dark:text-gray-300">{classItem.teacherName}</strong></p>
                    {classItem.schedule && <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {classItem.schedule}</p>}
                    <p>Room/Location: {classItem.room || 'Lab — Virtual'}</p>
                  </div>
                </div>

                {/* Foot Indicators & Navigation Link */}
                <div className="mt-6 border-t border-gray-50 pt-4 dark:border-gray-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block text-xxs font-semibold text-gray-400 uppercase">Enrolled</span>
                      <span className="font-display text-sm font-bold text-gray-800 dark:text-gray-200">{classItem.studentCount} students</span>
                    </div>
                    <div className="border-l border-gray-200 h-6 dark:border-gray-800" />
                    <div>
                      <span className="block text-xxs font-semibold text-gray-400 uppercase">Avg. Attendance</span>
                      <span className={`font-display text-sm font-bold ${
                        classItem.averagePercentage < settings.minAttendancePercent ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>{classItem.averagePercentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClass(classItem.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm cursor-pointer"
                    title="Open Roster & Record Attendance"
                  >
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredClasses.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center dark:border-gray-800">
                <ClipboardList className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 font-semibold">No classes match your search criteria.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-xxs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Create a new Class Subject Now
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Column Right: Low Attendance Watch Desk */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col h-fit max-h-[550px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
            <div>
              <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                <span>Attendance Alerts</span>
              </h4>
              <p className="text-xxs text-gray-400">
                Active roster members falling below target.
              </p>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xxs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              {lowAttendanceStudents.length} Flagged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {lowAttendanceStudents.map(({ student, stats, classItem }) => (
              <div 
                key={student.id}
                className="group p-3 rounded-xl border border-rose-50 bg-rose-50/20 hover:border-rose-100 dark:border-rose-950/20 dark:bg-rose-950/10 flex items-center justify-between transition-colors"
              >
                <div>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {student.name}
                  </h5>
                  <p className="text-xxs text-gray-400 font-mono mt-0.5">
                    {student.rollNumber} • {classItem?.code || 'CS'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-display font-extrabold text-rose-600 dark:text-rose-400">
                    {stats.percentage}%
                  </span>
                  <span className="text-xxs text-gray-400 font-medium">
                    {stats.present}/{stats.total} sessions
                  </span>
                </div>
              </div>
            ))}

            {lowAttendanceStudents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <Users className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-xxs font-semibold text-emerald-800 dark:text-emerald-400">Perfect Standing!</p>
                <p className="text-xxs max-w-[180px] mt-1">All enrolled students are meeting or exceeding the {settings.minAttendancePercent}% threshold.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add New Class Modal overlay */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                  Add New Class Subject
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitNewClass} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Class / Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Advanced Web Programming"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    placeholder="e.g. CS-402"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Instructor / Teacher Name
                  </label>
                  <input
                    type="text"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                    placeholder="e.g. Dr. Ada Lovelace"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Room / Lab
                    </label>
                    <input
                      type="text"
                      value={newClassRoom}
                      onChange={(e) => setNewClassRoom(e.target.value)}
                      placeholder="e.g. Lab 4"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Schedule
                    </label>
                    <input
                      type="text"
                      value={newClassSchedule}
                      onChange={(e) => setNewClassSchedule(e.target.value)}
                      placeholder="e.g. Mon, Wed 10:30 AM"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
