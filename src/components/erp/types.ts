export type ERPUserRole = 'student' | 'faculty' | 'parent' | 'admin';

export interface ERPUserProfile {
  id: string;
  name: string;
  email: string;
  role: ERPUserRole;
  avatar?: string;
  usn?: string;
  department: string;
  semester?: number;
  phone?: string;
  studentId?: string; // For parents linking to student
  designation?: string; // For faculty/admin
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  isElective: boolean;
  facultyId: string;
  facultyName: string;
  maxSeats: number;
  enrolledSeats: number;
  schedule: string;
  room: string;
  syllabusTopics: string[];
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  markedByFacultyId: string;
}

export interface SubjectAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export interface ExamScheduleItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  semester: number;
  examType: 'Mid-Term 1' | 'Mid-Term 2' | 'Semester End Exam (SEE)' | 'Lab Practical';
  date: string;
  time: string;
  room: string;
  maxMarks: number;
}

export interface StudentMarksRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  semester: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  gradePoints: number;
  credits: number;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  status: 'Pass' | 'Fail';
  records: StudentMarksRecord[];
}

export interface FeePayment {
  id: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  method: string;
  receiptNumber: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  term: string;
  academicYear: string;
  tuitionFee: number;
  examFee: number;
  labFee: number;
  libraryFee: number;
  developmentFee: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending';
  payments: FeePayment[];
}

export interface GrievanceResponse {
  id: string;
  authorRole: 'student' | 'admin' | 'faculty';
  authorName: string;
  message: string;
  timestamp: string;
}

export interface Grievance {
  id: string;
  ticketId: string;
  studentId: string;
  studentName: string;
  studentUSN: string;
  department: string;
  category: 'Academic' | 'Hostel & Mess' | 'Fees & Accounts' | 'Examination' | 'Infrastructure' | 'Harassment/Ragging' | 'Other';
  subject: string;
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'Submitted' | 'In Review' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  responses: GrievanceResponse[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'department' | 'course';
  targetDepartment?: string;
  targetCourseId?: string;
  priority: 'normal' | 'urgent';
  authorRole: 'admin' | 'faculty';
  authorName: string;
  date: string;
  readBy: string[]; // List of user IDs who acknowledged/read
}

export interface FacultyScheduleItem {
  id: string;
  day: string;
  time: string;
  courseCode: string;
  courseName: string;
  semester: number;
  branch: string;
  room: string;
}
