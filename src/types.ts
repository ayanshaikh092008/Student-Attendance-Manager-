/**
 * Type definitions for Student Attendance Manager
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface SubjectClass {
  id: string;
  name: string; // e.g., "Mathematics 101"
  code: string; // e.g., "MATH-101"
  teacherName: string;
  room?: string;
  schedule?: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email?: string;
  classId: string; // Links student to their class/subject
}

export interface AttendanceRecord {
  id: string; // generated as `${classId}_${studentId}_${date}` for fast lookup
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export interface TeacherPinConfig {
  isEnabled: boolean;
  pin: string; // 4-digit PIN e.g., "1234"
}

export interface AppSettings {
  minAttendancePercent: number; // default: 75
  schoolName: string; // e.g., "Greenwood Academy"
  academicYear: string; // e.g., "2026-2027"
}

export interface DatabaseState {
  classes: SubjectClass[];
  students: Student[];
  attendance: AttendanceRecord[];
  pinConfig: TeacherPinConfig;
  settings: AppSettings;
}
