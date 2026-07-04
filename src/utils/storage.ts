import { DatabaseState, SubjectClass, Student, AttendanceRecord, AttendanceStatus } from '../types';

const STORAGE_KEY = 'student_attendance_manager_db';

export const DEFAULT_SETTINGS = {
  minAttendancePercent: 75,
  schoolName: 'Greenwood High School',
  academicYear: '2026-2027',
};

export const INITIAL_CLASSES: SubjectClass[] = [
  { id: 'c1', name: 'Computer Science 101', code: 'CS-101', teacherName: 'Prof. Diana Prince', room: 'Lab 3', schedule: 'Mon, Wed 09:00 AM' },
  { id: 'c2', name: 'Mathematics (Calculus)', code: 'MATH-202', teacherName: 'Dr. Bruce Banner', room: 'Room 404', schedule: 'Tue, Thu 11:00 AM' },
  { id: 'c3', name: 'English Literature', code: 'ENG-110', teacherName: 'Prof. Clark Kent', room: 'Room 102', schedule: 'Mon, Fri 01:00 PM' },
  { id: 'c4', name: 'Organic Chemistry', code: 'CHEM-301', teacherName: 'Dr. Tony Stark', room: 'Chemistry Lab', schedule: 'Wed, Fri 10:30 AM' },
];

export const INITIAL_STUDENTS: Student[] = [
  // Class 1: Computer Science
  { id: 's1_1', rollNumber: 'CS-2601', name: 'Peter Parker', email: 'peter.parker@greenwood.edu', classId: 'c1' },
  { id: 's1_2', rollNumber: 'CS-2602', name: 'Gwen Stacy', email: 'gwen.stacy@greenwood.edu', classId: 'c1' },
  { id: 's1_3', rollNumber: 'CS-2603', name: 'Miles Morales', email: 'miles.m@greenwood.edu', classId: 'c1' },
  { id: 's1_4', rollNumber: 'CS-2604', name: 'Harry Osborn', email: 'harry.osborn@greenwood.edu', classId: 'c1' },
  { id: 's1_5', rollNumber: 'CS-2605', name: 'Ned Leeds', email: 'ned.leeds@greenwood.edu', classId: 'c1' },
  { id: 's1_6', rollNumber: 'CS-2606', name: 'Mary Jane Watson', email: 'mj.watson@greenwood.edu', classId: 'c1' },

  // Class 2: Mathematics
  { id: 's2_1', rollNumber: 'MT-2611', name: 'Tony Stark', email: 'tony@greenwood.edu', classId: 'c2' },
  { id: 's2_2', rollNumber: 'MT-2612', name: 'Steve Rogers', email: 'steve@greenwood.edu', classId: 'c2' },
  { id: 's2_3', rollNumber: 'MT-2613', name: 'Natasha Romanoff', email: 'natasha@greenwood.edu', classId: 'c2' },
  { id: 's2_4', rollNumber: 'MT-2614', name: 'Bruce Banner', email: 'bruce@greenwood.edu', classId: 'c2' },
  { id: 's2_5', rollNumber: 'MT-2615', name: 'Thor Odinson', email: 'thor@greenwood.edu', classId: 'c2' },
  { id: 's2_6', rollNumber: 'MT-2616', name: 'Clint Barton', email: 'clint@greenwood.edu', classId: 'c2' },

  // Class 3: English Literature
  { id: 's3_1', rollNumber: 'EN-2621', name: 'Arthur Dent', email: 'arthur.d@greenwood.edu', classId: 'c3' },
  { id: 's3_2', rollNumber: 'EN-2622', name: 'Ford Prefect', email: 'ford.p@greenwood.edu', classId: 'c3' },
  { id: 's3_3', rollNumber: 'EN-2623', name: 'Tricia McMillan', email: 'trillian@greenwood.edu', classId: 'c3' },
  { id: 's3_4', rollNumber: 'EN-2624', name: 'Zaphod Beeblebrox', email: 'zaphod@greenwood.edu', classId: 'c3' },
  
  // Class 4: Organic Chemistry
  { id: 's4_1', rollNumber: 'CH-2631', name: 'Walter White', email: 'heisenberg@greenwood.edu', classId: 'c4' },
  { id: 's4_2', rollNumber: 'CH-2632', name: 'Jesse Pinkman', email: 'jesse@greenwood.edu', classId: 'c4' },
  { id: 's4_3', rollNumber: 'CH-2633', name: 'Skyler White', email: 'skyler@greenwood.edu', classId: 'c4' },
  { id: 's4_4', rollNumber: 'CH-2634', name: 'Gustavo Fring', email: 'pollos@greenwood.edu', classId: 'c4' },
  { id: 's4_5', rollNumber: 'CH-2635', name: 'Saul Goodman', email: 'bettercallsaul@greenwood.edu', classId: 'c4' },
];

export function generateSampleAttendance(): AttendanceRecord[] {
  const attendance: AttendanceRecord[] = [];
  const classes = INITIAL_CLASSES;
  
  // Generate dates for the past 14 days (excluding Sundays)
  const dates: string[] = [];
  const today = new Date(); // 2026-07-04
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0) { // Skip Sundays
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  // Generate records
  INITIAL_STUDENTS.forEach(student => {
    dates.forEach(date => {
      // Different attendance weights per student for varied statistics
      let r = Math.random();
      let status: AttendanceStatus = 'present';
      
      // Peter Parker (high attendance)
      if (student.name === 'Peter Parker') {
        status = r < 0.90 ? 'present' : r < 0.95 ? 'late' : 'absent';
      } 
      // Jesse Pinkman (struggling / low attendance)
      else if (student.name === 'Jesse Pinkman') {
        status = r < 0.50 ? 'present' : r < 0.60 ? 'late' : r < 0.75 ? 'excused' : 'absent';
      }
      // Clint Barton (often late/absent)
      else if (student.name === 'Clint Barton') {
        status = r < 0.65 ? 'present' : r < 0.85 ? 'late' : 'absent';
      }
      // General case
      else {
        status = r < 0.85 ? 'present' : r < 0.92 ? 'late' : r < 0.96 ? 'excused' : 'absent';
      }

      attendance.push({
        id: `${student.classId}_${student.id}_${date}`,
        classId: student.classId,
        studentId: student.id,
        date,
        status,
        remarks: status === 'absent' && Math.random() > 0.7 ? 'Informed ahead of time' : undefined
      });
    });
  });

  return attendance;
}

export function getInitialState(): DatabaseState {
  return {
    classes: INITIAL_CLASSES,
    students: INITIAL_STUDENTS,
    attendance: generateSampleAttendance(),
    pinConfig: {
      isEnabled: true,
      pin: '1234', // default PIN to make lock testing intuitive
    },
    settings: DEFAULT_SETTINGS,
  };
}

export function loadDatabase(): DatabaseState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      const defaultState = getInitialState();
      saveDatabase(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(serialized);
    // Sanity check of contents
    if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
      return parsed;
    }
    throw new Error('Invalid storage format');
  } catch (error) {
    console.error('Failed to load local storage, loading default state', error);
    const defaultState = getInitialState();
    saveDatabase(defaultState);
    return defaultState;
  }
}

export function saveDatabase(state: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage', error);
  }
}

/**
 * EXPORTING UTILITIES
 */

export function downloadJSONBackup(state: DatabaseState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `student_attendance_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

export function convertClassToCSV(classItem: SubjectClass, students: Student[], attendance: AttendanceRecord[]): string {
  const classStudents = students.filter(s => s.classId === classItem.id);
  
  // Find all unique dates logged for this class, sorted chronologically
  const classRecords = attendance.filter(r => r.classId === classItem.id);
  const uniqueDates = Array.from(new Set(classRecords.map(r => r.date))).sort();
  
  // Header: Roll Number, Name, Email, [Dates...], Present Count, Absent Count, Attendance %
  const headers = ['Roll Number', 'Name', 'Email', ...uniqueDates, 'Total Present', 'Total Late', 'Total Excused', 'Total Absent', 'Attendance Rate (%)'];
  
  const rows = classStudents.map(student => {
    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let absentCount = 0;
    
    const dateStatuses = uniqueDates.map(date => {
      const rec = classRecords.find(r => r.studentId === student.id && r.date === date);
      if (!rec) return '-';
      
      switch (rec.status) {
        case 'present':
          presentCount++;
          return 'Present';
        case 'late':
          lateCount++;
          return 'Late';
        case 'excused':
          excusedCount++;
          return 'Excused';
        case 'absent':
          absentCount++;
          return 'Absent';
        default:
          return '-';
      }
    });
    
    const totalClasses = presentCount + lateCount + excusedCount + absentCount;
    const rate = totalClasses > 0 
      ? Math.round(((presentCount + (lateCount * 0.5)) / totalClasses) * 100) 
      : 0;

    return [
      student.rollNumber,
      student.name,
      student.email || '',
      ...dateStatuses,
      presentCount.toString(),
      lateCount.toString(),
      excusedCount.toString(),
      absentCount.toString(),
      `${rate}%`
    ];
  });
  
  const csvContent = [
    [classItem.name, `Subject Code: ${classItem.code}`, `Teacher: ${classItem.teacherName}`, `Room: ${classItem.room || '-'}`],
    [],
    headers,
    ...rows
  ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  
  return csvContent;
}

export function downloadClassCSV(classItem: SubjectClass, students: Student[], attendance: AttendanceRecord[]): void {
  const csvContent = convertClassToCSV(classItem, students, attendance);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  const safeClassName = classItem.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadAnchor.setAttribute('download', `attendance_${safeClassName}_report.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

/**
 * Calculations and Analytics helpers
 */

export interface StudentStats {
  student: Student;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

export function calculateStudentStats(student: Student, attendance: AttendanceRecord[]): StudentStats {
  const studentRecords = attendance.filter(r => r.studentId === student.id);
  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;
  
  studentRecords.forEach(r => {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'late') late++;
    else if (r.status === 'excused') excused++;
  });
  
  const total = present + absent + late + excused;
  // Late counts as 0.5 or 1 depending on rule; standard is late is present but noted, let's treat Late as 0.5 of a full day and Excused as ignored or partial. Let's make: Present = 1, Late = 0.5, Excused = 1 (or excused doesn't count against, or counts as present). Let's use standard: Present = 1, Late = 1 (but flagged) or 0.5, Excused = 1. Let's count Late as 0.5, Excused as 1 for percentages, or let's do: (Present + Late + Excused) / Total.
  // Actually, standard school attendance percentage is: (Present + Late + Excused) / Total. Let's make: (Present + Late + Excused) / Total * 100
  const percentage = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 100;
  
  return {
    student,
    present,
    absent,
    late,
    excused,
    total,
    percentage
  };
}

export function calculateClassStats(classId: string, students: Student[], attendance: AttendanceRecord[]) {
  const classStudents = students.filter(s => s.classId === classId);
  if (classStudents.length === 0) return { averagePercentage: 0, studentStats: [], lowAttendanceCount: 0 };
  
  let totalPercentageSum = 0;
  let lowAttendanceCount = 0;
  const studentStats = classStudents.map(student => {
    const stats = calculateStudentStats(student, attendance);
    totalPercentageSum += stats.percentage;
    if (stats.total > 0 && stats.percentage < 75) {
      lowAttendanceCount++;
    }
    return stats;
  });
  
  const averagePercentage = Math.round(totalPercentageSum / classStudents.length);
  
  return {
    averagePercentage,
    studentStats,
    lowAttendanceCount
  };
}
