import {
  ERPUserProfile,
  Course,
  AttendanceRecord,
  SubjectAttendance,
  ExamScheduleItem,
  StudentMarksRecord,
  SemesterResult,
  FeeRecord,
  Grievance,
  Announcement,
  FacultyScheduleItem
} from '../components/erp/types';

// ==========================================
// 1. Initial Mock Users (10+ Students, 4 Faculty, 1 Parent, 1 Admin)
// ==========================================

export const INITIAL_STUDENTS: ERPUserProfile[] = [
  {
    id: 'std-001',
    name: 'Aarav Sharma',
    email: 'student@ncet.edu',
    role: 'student',
    usn: '1NC22CS045',
    department: 'CSE',
    semester: 6,
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-002',
    name: 'Priya Kulkarni',
    email: 'priya.k@ncet.edu',
    role: 'student',
    usn: '1NC22CS092',
    department: 'CSE',
    semester: 6,
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-003',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@ncet.edu',
    role: 'student',
    usn: '1NC22AI018',
    department: 'AI/ML',
    semester: 6,
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-004',
    name: 'Sneha Venkatesh',
    email: 'sneha.v@ncet.edu',
    role: 'student',
    usn: '1NC23IS034',
    department: 'ISE',
    semester: 4,
    phone: '+91 98765 43213',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-005',
    name: 'Mohammed Faisal',
    email: 'faisal.m@ncet.edu',
    role: 'student',
    usn: '1NC23EC056',
    department: 'ECE',
    semester: 4,
    phone: '+91 98765 43214',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-006',
    name: 'Ananya Hegde',
    email: 'ananya.h@ncet.edu',
    role: 'student',
    usn: '1NC21CV012',
    department: 'CIVIL',
    semester: 8,
    phone: '+91 98765 43215',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-007',
    name: 'Karthik Raja',
    email: 'karthik.r@ncet.edu',
    role: 'student',
    usn: '1NC22ME029',
    department: 'MECH',
    semester: 6,
    phone: '+91 98765 43216',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-008',
    name: 'Divya Nair',
    email: 'divya.n@ncet.edu',
    role: 'student',
    usn: '1NC24CS102',
    department: 'CSE',
    semester: 2,
    phone: '+91 98765 43217',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-009',
    name: 'Varun Tej',
    email: 'varun.t@ncet.edu',
    role: 'student',
    usn: '1NC23AI041',
    department: 'AI/ML',
    semester: 4,
    phone: '+91 98765 43218',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-010',
    name: 'Meera Iyer',
    email: 'meera.i@ncet.edu',
    role: 'student',
    usn: '1NC22IS077',
    department: 'ISE',
    semester: 6,
    phone: '+91 98765 43219',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-011',
    name: 'Harish Babu',
    email: 'harish.b@ncet.edu',
    role: 'student',
    usn: '1NC21EC088',
    department: 'ECE',
    semester: 8,
    phone: '+91 98765 43220',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_FACULTY: ERPUserProfile[] = [
  {
    id: 'fac-001',
    name: 'Dr. Rajesh Sharma',
    email: 'faculty@ncet.edu',
    role: 'faculty',
    department: 'CSE',
    designation: 'Professor & HOD, Computer Science',
    phone: '+91 94481 12345',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-002',
    name: 'Prof. Ananya Roy',
    email: 'ananya.roy@ncet.edu',
    role: 'faculty',
    department: 'ISE',
    designation: 'Associate Professor, Cyber Security & AI',
    phone: '+91 94481 67890',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-003',
    name: 'Prof. Vikram Patil',
    email: 'vikram.p@ncet.edu',
    role: 'faculty',
    department: 'ECE',
    designation: 'Associate Professor, VLSI & Embedded Systems',
    phone: '+91 94481 11223',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-004',
    name: 'Dr. Suresh Gowda',
    email: 'suresh.g@ncet.edu',
    role: 'faculty',
    department: 'CIVIL',
    designation: 'Professor, Structural Dynamics & CAD',
    phone: '+91 94481 99887',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PARENT: ERPUserProfile = {
  id: 'par-001',
  name: 'Mr. Ramesh Sharma',
  email: 'parent@ncet.edu',
  role: 'parent',
  studentId: 'std-001',
  phone: '+91 98450 11223',
  department: 'CSE',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_ADMIN: ERPUserProfile = {
  id: 'adm-001',
  name: 'Registrar Admin Office',
  email: 'admin@ncet.edu',
  role: 'admin',
  department: 'Academic Administration',
  designation: 'Chief Academic Controller',
  phone: '+91 80 2234 5678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

// ==========================================
// 2. Initial Courses (Core & Electives)
// ==========================================

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-21cs61',
    code: '21CS61',
    name: 'Cloud Computing & Distributed Systems',
    department: 'CSE',
    semester: 6,
    credits: 4,
    isElective: false,
    facultyId: 'fac-001',
    facultyName: 'Dr. Rajesh Sharma',
    maxSeats: 70,
    enrolledSeats: 64,
    schedule: 'Mon, Wed, Fri (10:00 AM - 11:00 AM)',
    room: 'LH-302',
    syllabusTopics: ['Cloud virtualization', 'Microservices architecture', 'AWS & GCP APIs', 'Fault tolerance']
  },
  {
    id: 'crs-21cs62',
    code: '21CS62',
    name: 'Advanced Database Management Systems',
    department: 'CSE',
    semester: 6,
    credits: 4,
    isElective: false,
    facultyId: 'fac-001',
    facultyName: 'Dr. Rajesh Sharma',
    maxSeats: 70,
    enrolledSeats: 62,
    schedule: 'Tue, Thu (09:00 AM - 10:30 AM)',
    room: 'LH-302',
    syllabusTopics: ['Query optimization', 'NoSQL architectures', 'Concurrency control', 'Distributed transactions']
  },
  {
    id: 'crs-21cs63',
    code: '21CS63',
    name: 'Full Stack Web Architecture',
    department: 'CSE',
    semester: 6,
    credits: 3,
    isElective: false,
    facultyId: 'fac-002',
    facultyName: 'Prof. Ananya Roy',
    maxSeats: 70,
    enrolledSeats: 66,
    schedule: 'Mon, Wed (02:00 PM - 03:30 PM)',
    room: 'Computer Lab 3',
    syllabusTopics: ['React 19 & Next.js', 'REST & GraphQL', 'State Management', 'CI/CD Pipelines']
  },
  {
    id: 'crs-21csl66',
    code: '21CSL66',
    name: 'Cloud & Full Stack Development Lab',
    department: 'CSE',
    semester: 6,
    credits: 2,
    isElective: false,
    facultyId: 'fac-001',
    facultyName: 'Dr. Rajesh Sharma',
    maxSeats: 35,
    enrolledSeats: 32,
    schedule: 'Thursday (01:30 PM - 04:30 PM)',
    room: 'Cloud Lab 2',
    syllabusTopics: ['Docker containerization', 'Serverless deployment', 'API testing', 'Security audits']
  },
  {
    id: 'crs-21cse641',
    code: '21CSE641',
    name: 'Machine Learning & Neural Networks',
    department: 'CSE',
    semester: 6,
    credits: 3,
    isElective: true,
    facultyId: 'fac-002',
    facultyName: 'Prof. Ananya Roy',
    maxSeats: 45,
    enrolledSeats: 39,
    schedule: 'Tue, Fri (11:15 AM - 12:45 PM)',
    room: 'Smart Room 104',
    syllabusTopics: ['Supervised Learning', 'Backpropagation', 'Convolutional Nets', 'Model evaluation']
  },
  {
    id: 'crs-21cse642',
    code: '21CSE642',
    name: 'Cyber Security & Ethical Hacking',
    department: 'ISE',
    semester: 6,
    credits: 3,
    isElective: true,
    facultyId: 'fac-002',
    facultyName: 'Prof. Ananya Roy',
    maxSeats: 45,
    enrolledSeats: 42,
    schedule: 'Mon, Thu (11:15 AM - 12:45 PM)',
    room: 'Cyber Lab 1',
    syllabusTopics: ['Penetration testing', 'Cryptography', 'Packet inspection', 'Vulnerability scanning']
  },
  {
    id: 'crs-21oee651',
    code: '21OEE651',
    name: 'Internet of Things (IoT) & Smart Sensors',
    department: 'ECE',
    semester: 6,
    credits: 3,
    isElective: true,
    facultyId: 'fac-003',
    facultyName: 'Prof. Vikram Patil',
    maxSeats: 40,
    enrolledSeats: 28,
    schedule: 'Wed, Fri (03:30 PM - 05:00 PM)',
    room: 'IoT Innovation Lab',
    syllabusTopics: ['ESP32 & Raspberry Pi', 'MQTT Protocols', 'Sensor interfacing', 'Edge intelligence']
  },
  {
    id: 'crs-21oee652',
    code: '21OEE652',
    name: 'Sustainable Smart Cities & Green Infra',
    department: 'CIVIL',
    semester: 6,
    credits: 3,
    isElective: true,
    facultyId: 'fac-004',
    facultyName: 'Dr. Suresh Gowda',
    maxSeats: 40,
    enrolledSeats: 24,
    schedule: 'Tue, Thu (03:30 PM - 05:00 PM)',
    room: 'Seminar Hall B',
    syllabusTopics: ['Green building rating', 'BIM modeling', 'Urban water reuse', 'Energy auditing']
  }
];

// ==========================================
// 3. Initial Subject-Wise Attendance
// ==========================================

export const INITIAL_STUDENT_ATTENDANCE: Record<string, SubjectAttendance[]> = {
  'std-001': [
    {
      courseId: 'crs-21cs61',
      courseCode: '21CS61',
      courseName: 'Cloud Computing & Distributed Systems',
      totalClasses: 36,
      attendedClasses: 32,
      percentage: 88.9
    },
    {
      courseId: 'crs-21cs62',
      courseCode: '21CS62',
      courseName: 'Advanced Database Management Systems',
      totalClasses: 32,
      attendedClasses: 28,
      percentage: 87.5
    },
    {
      courseId: 'crs-21cs63',
      courseCode: '21CS63',
      courseName: 'Full Stack Web Architecture',
      totalClasses: 28,
      attendedClasses: 19,
      // Warning trigger (< 75%)
      percentage: 67.8
    },
    {
      courseId: 'crs-21csl66',
      courseCode: '21CSL66',
      courseName: 'Cloud & Full Stack Lab',
      totalClasses: 14,
      attendedClasses: 13,
      percentage: 92.8
    },
    {
      courseId: 'crs-21cse641',
      courseCode: '21CSE641',
      courseName: 'Machine Learning & Neural Networks (Elective)',
      totalClasses: 30,
      attendedClasses: 25,
      percentage: 83.3
    }
  ]
};

// Course registration for students
export const INITIAL_STUDENT_REGISTRATIONS: Record<string, string[]> = {
  'std-001': ['crs-21cs61', 'crs-21cs62', 'crs-21cs63', 'crs-21csl66', 'crs-21cse641'],
  'std-002': ['crs-21cs61', 'crs-21cs62', 'crs-21cs63', 'crs-21csl66', 'crs-21cse642'],
  'std-003': ['crs-21cs61', 'crs-21cse641', 'crs-21oee651'],
};

// ==========================================
// 4. Initial Exam Timetable & Marks
// ==========================================

export const INITIAL_EXAM_SCHEDULE: ExamScheduleItem[] = [
  {
    id: 'ex-01',
    courseId: 'crs-21cs61',
    courseCode: '21CS61',
    courseName: 'Cloud Computing & Distributed Systems',
    semester: 6,
    examType: 'Semester End Exam (SEE)',
    date: '2026-05-18',
    time: '09:30 AM - 12:30 PM',
    room: 'Examination Hall 1 (Block B)',
    maxMarks: 100
  },
  {
    id: 'ex-02',
    courseId: 'crs-21cs62',
    courseCode: '21CS62',
    courseName: 'Advanced Database Management Systems',
    semester: 6,
    examType: 'Semester End Exam (SEE)',
    date: '2026-05-21',
    time: '09:30 AM - 12:30 PM',
    room: 'Examination Hall 1 (Block B)',
    maxMarks: 100
  },
  {
    id: 'ex-03',
    courseId: 'crs-21cs63',
    courseCode: '21CS63',
    courseName: 'Full Stack Web Architecture',
    semester: 6,
    examType: 'Semester End Exam (SEE)',
    date: '2026-05-25',
    time: '09:30 AM - 12:30 PM',
    room: 'Examination Hall 2 (Block B)',
    maxMarks: 100
  },
  {
    id: 'ex-04',
    courseId: 'crs-21cse641',
    courseCode: '21CSE641',
    courseName: 'Machine Learning & Neural Networks',
    semester: 6,
    examType: 'Semester End Exam (SEE)',
    date: '2026-05-28',
    time: '09:30 AM - 12:30 PM',
    room: 'Smart Room 104',
    maxMarks: 100
  },
  {
    id: 'ex-05',
    courseId: 'crs-21csl66',
    courseCode: '21CSL66',
    courseName: 'Cloud & Full Stack Development Lab',
    semester: 6,
    examType: 'Lab Practical',
    date: '2026-06-02',
    time: '01:30 PM - 04:30 PM',
    room: 'Cloud Lab 2',
    maxMarks: 50
  }
];

export const INITIAL_STUDENT_RESULTS: Record<string, SemesterResult[]> = {
  'std-001': [
    {
      semester: 5,
      sgpa: 8.78,
      totalCredits: 22,
      earnedCredits: 22,
      status: 'Pass',
      records: [
        {
          id: 'res-501',
          studentId: 'std-001',
          courseId: '21CS51',
          courseCode: '21CS51',
          courseName: 'Automata Theory & Compiler Design',
          semester: 5,
          internalMarks: 44,
          externalMarks: 86,
          totalMarks: 90,
          maxMarks: 100,
          grade: 'O (Outstanding)',
          gradePoints: 10,
          credits: 4
        },
        {
          id: 'res-502',
          studentId: 'std-001',
          courseId: '21CS52',
          courseCode: '21CS52',
          courseName: 'Computer Networks',
          semester: 5,
          internalMarks: 42,
          externalMarks: 78,
          totalMarks: 84,
          maxMarks: 100,
          grade: 'A+ (Excellent)',
          gradePoints: 9,
          credits: 4
        },
        {
          id: 'res-503',
          studentId: 'std-001',
          courseId: '21CS53',
          courseCode: '21CS53',
          courseName: 'Software Engineering & Agile',
          semester: 5,
          internalMarks: 45,
          externalMarks: 75,
          totalMarks: 82,
          maxMarks: 100,
          grade: 'A+ (Excellent)',
          gradePoints: 9,
          credits: 3
        },
        {
          id: 'res-504',
          studentId: 'std-001',
          courseId: '21CS54',
          courseCode: '21CS54',
          courseName: 'Unix System Programming',
          semester: 5,
          internalMarks: 38,
          externalMarks: 70,
          totalMarks: 76,
          maxMarks: 100,
          grade: 'A (Very Good)',
          gradePoints: 8,
          credits: 3
        },
        {
          id: 'res-505',
          studentId: 'std-001',
          courseId: '21CSL56',
          courseCode: '21CSL56',
          courseName: 'Networks & Security Lab',
          semester: 5,
          internalMarks: 48,
          externalMarks: 46,
          totalMarks: 94,
          maxMarks: 100,
          grade: 'O (Outstanding)',
          gradePoints: 10,
          credits: 2
        }
      ]
    },
    {
      semester: 4,
      sgpa: 8.64,
      totalCredits: 22,
      earnedCredits: 22,
      status: 'Pass',
      records: [
        {
          id: 'res-401',
          studentId: 'std-001',
          courseId: '21CS41',
          courseCode: '21CS41',
          courseName: 'Design & Analysis of Algorithms',
          semester: 4,
          internalMarks: 46,
          externalMarks: 80,
          totalMarks: 88,
          maxMarks: 100,
          grade: 'A+ (Excellent)',
          gradePoints: 9,
          credits: 4
        },
        {
          id: 'res-402',
          studentId: 'std-001',
          courseId: '21CS42',
          courseCode: '21CS42',
          courseName: 'Operating Systems Architecture',
          semester: 4,
          internalMarks: 40,
          externalMarks: 79,
          totalMarks: 83,
          maxMarks: 100,
          grade: 'A+ (Excellent)',
          gradePoints: 9,
          credits: 4
        }
      ]
    }
  ]
};

// ==========================================
// 5. Initial Fee Structure & History
// ==========================================

export const INITIAL_FEE_RECORDS: FeeRecord[] = [
  {
    id: 'fee-001',
    studentId: 'std-001',
    term: 'Semester 6 (Academic Year 2025-26)',
    academicYear: '2025-2026',
    tuitionFee: 85000,
    examFee: 3500,
    labFee: 6500,
    libraryFee: 2000,
    developmentFee: 5000,
    totalAmount: 102000,
    paidAmount: 70000,
    pendingAmount: 32000,
    dueDate: '2026-05-15',
    status: 'partial',
    payments: [
      {
        id: 'pay-001',
        amount: 70000,
        paymentDate: '2026-01-12',
        transactionId: 'TXN-NCET-9920148',
        method: 'UPI / HDFC Gateway',
        receiptNumber: 'REC-2026-0812'
      }
    ]
  },
  {
    id: 'fee-002',
    studentId: 'std-002',
    term: 'Semester 6 (Academic Year 2025-26)',
    academicYear: '2025-2026',
    tuitionFee: 85000,
    examFee: 3500,
    labFee: 6500,
    libraryFee: 2000,
    developmentFee: 5000,
    totalAmount: 102000,
    paidAmount: 102000,
    pendingAmount: 0,
    dueDate: '2026-05-15',
    status: 'paid',
    payments: [
      {
        id: 'pay-002',
        amount: 102000,
        paymentDate: '2026-01-10',
        transactionId: 'TXN-NCET-8831902',
        method: 'Net Banking (SBI)',
        receiptNumber: 'REC-2026-0799'
      }
    ]
  },
  {
    id: 'fee-003',
    studentId: 'std-003',
    term: 'Semester 6 (Academic Year 2025-26)',
    academicYear: '2025-2026',
    tuitionFee: 90000,
    examFee: 3500,
    labFee: 8000,
    libraryFee: 2000,
    developmentFee: 5000,
    totalAmount: 108500,
    paidAmount: 0,
    pendingAmount: 108500,
    dueDate: '2026-04-30',
    status: 'pending',
    payments: []
  },
  {
    id: 'fee-004',
    studentId: 'std-005',
    term: 'Semester 4 (Academic Year 2025-26)',
    academicYear: '2025-2026',
    tuitionFee: 80000,
    examFee: 3500,
    labFee: 6000,
    libraryFee: 2000,
    developmentFee: 5000,
    totalAmount: 96500,
    paidAmount: 40000,
    pendingAmount: 56500,
    dueDate: '2026-04-20',
    status: 'partial',
    payments: [
      {
        id: 'pay-003',
        amount: 40000,
        paymentDate: '2026-02-01',
        transactionId: 'TXN-NCET-4439121',
        method: 'Debit Card (ICICI)',
        receiptNumber: 'REC-2026-1102'
      }
    ]
  }
];

// ==========================================
// 6. Initial Grievances
// ==========================================

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'grv-001',
    ticketId: 'NCET-GRV-2026-042',
    studentId: 'std-001',
    studentName: 'Aarav Sharma',
    studentUSN: '1NC22CS045',
    department: 'CSE',
    category: 'Examination',
    subject: 'Request for IA-2 Marks Re-evaluation in Advanced DBMS',
    description: 'During the review session of IA-2, question 4b on B+ Tree Indexing was marked 0 despite matching the textbook answer. Requesting reverification.',
    attachmentName: 'ia2_answer_script_page4.pdf',
    attachmentUrl: '#',
    status: 'In Review',
    createdAt: '2026-04-10T11:30:00Z',
    updatedAt: '2026-04-11T14:15:00Z',
    responses: [
      {
        id: 'resp-001',
        authorRole: 'admin',
        authorName: 'Academic Exam Cell',
        message: 'Your answer script copy has been retrieved from the vault and forwarded to the course instructor Prof. Rajesh Sharma for formal inspection.',
        timestamp: '2026-04-11T14:15:00Z'
      }
    ]
  },
  {
    id: 'grv-002',
    ticketId: 'NCET-GRV-2026-039',
    studentId: 'std-001',
    studentName: 'Aarav Sharma',
    studentUSN: '1NC22CS045',
    department: 'CSE',
    category: 'Infrastructure',
    subject: 'High speed internet instability in Cloud Lab 2',
    description: 'Workstations 14 to 22 in Cloud Lab 2 experience frequent drops when cloning Docker images during afternoon practical hours.',
    attachmentName: 'lab_network_ping_log.txt',
    attachmentUrl: '#',
    status: 'Resolved',
    createdAt: '2026-03-22T09:00:00Z',
    updatedAt: '2026-03-24T16:00:00Z',
    responses: [
      {
        id: 'resp-002',
        authorRole: 'admin',
        authorName: 'Campus IT Infrastructure Team',
        message: 'A faulty 24-port Gigabit switch on Rack 3 was replaced on March 24. Bandwidth tests confirm steady 1 Gbps uplink across all stations.',
        timestamp: '2026-03-24T16:00:00Z'
      }
    ]
  },
  {
    id: 'grv-003',
    ticketId: 'NCET-GRV-2026-044',
    studentId: 'std-004',
    studentName: 'Sneha Venkatesh',
    studentUSN: '1NC23IS034',
    department: 'ISE',
    category: 'Hostel & Mess',
    subject: 'Request for extended library and study room hours during exam prep',
    description: 'Can the 3rd floor Central Library reading wing remain accessible until 11:30 PM for hostel boarders for the upcoming semester finals?',
    status: 'Submitted',
    createdAt: '2026-04-12T17:45:00Z',
    updatedAt: '2026-04-12T17:45:00Z',
    responses: []
  }
];

// ==========================================
// 7. Initial Announcements
// ==========================================

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-001',
    title: 'VTU Final Semester End Examination (SEE) Schedule Released',
    content: 'The official exam timetable for May/June 2026 Semester End Exams is now published. Hall tickets will be downloadable via the ERP portal starting May 10.',
    target: 'all',
    priority: 'urgent',
    authorRole: 'admin',
    authorName: 'Office of the Controller of Examinations',
    date: '2026-04-12',
    readBy: []
  },
  {
    id: 'anc-002',
    title: 'Elective Course Registration Deadline: April 25, 2026',
    content: 'All 6th and 4th semester students must finalize their elective course registrations before the deadline. Maximum credit limit per semester is 24 credits.',
    target: 'department',
    targetDepartment: 'CSE',
    priority: 'urgent',
    authorRole: 'faculty',
    authorName: 'Dr. Rajesh Sharma (HOD CSE)',
    date: '2026-04-10',
    readBy: []
  },
  {
    id: 'anc-003',
    title: 'Annual Tech Fest "Innovista 2026" Hackathon Registrations Open',
    content: 'Participate in the 36-hour flagship hackathon organized by NCET Innovation Club with cash prizes up to INR 2,00,000.',
    target: 'all',
    priority: 'normal',
    authorRole: 'admin',
    authorName: 'Student Affairs & Dean Office',
    date: '2026-04-05',
    readBy: []
  },
  {
    id: 'anc-004',
    title: 'Cloud Computing (21CS61) Guest Lecture by Senior AWS Solutions Architect',
    content: 'Mandatory session this Friday at 10:00 AM in Seminar Hall 1 covering enterprise Kubernetes in production.',
    target: 'course',
    targetCourseId: 'crs-21cs61',
    priority: 'normal',
    authorRole: 'faculty',
    authorName: 'Dr. Rajesh Sharma',
    date: '2026-04-02',
    readBy: []
  }
];

// ==========================================
// 8. Faculty Teaching Schedule
// ==========================================

export const FACULTY_SCHEDULE: Record<string, FacultyScheduleItem[]> = {
  'fac-001': [
    {
      id: 'fsch-1',
      day: 'Monday',
      time: '10:00 AM - 11:00 AM',
      courseCode: '21CS61',
      courseName: 'Cloud Computing & Distributed Systems',
      semester: 6,
      branch: 'CSE',
      room: 'LH-302'
    },
    {
      id: 'fsch-2',
      day: 'Tuesday',
      time: '09:00 AM - 10:30 AM',
      courseCode: '21CS62',
      courseName: 'Advanced Database Management Systems',
      semester: 6,
      branch: 'CSE',
      room: 'LH-302'
    },
    {
      id: 'fsch-3',
      day: 'Wednesday',
      time: '10:00 AM - 11:00 AM',
      courseCode: '21CS61',
      courseName: 'Cloud Computing & Distributed Systems',
      semester: 6,
      branch: 'CSE',
      room: 'LH-302'
    },
    {
      id: 'fsch-4',
      day: 'Thursday',
      time: '01:30 PM - 04:30 PM',
      courseCode: '21CSL66',
      courseName: 'Cloud & Full Stack Development Lab',
      semester: 6,
      branch: 'CSE',
      room: 'Cloud Lab 2'
    },
    {
      id: 'fsch-5',
      day: 'Friday',
      time: '10:00 AM - 11:00 AM',
      courseCode: '21CS61',
      courseName: 'Cloud Computing & Distributed Systems',
      semester: 6,
      branch: 'CSE',
      room: 'LH-302'
    }
  ]
};

// ==========================================
// LocalStorage Persistence Service
// ==========================================

const STORAGE_KEYS = {
  AUTH_USER: 'ncet_erp_current_user',
  COURSES: 'ncet_erp_courses',
  ATTENDANCE_SUMMARY: 'ncet_erp_attendance_summary',
  REGISTRATIONS: 'ncet_erp_student_registrations',
  EXAMS: 'ncet_erp_exams',
  RESULTS: 'ncet_erp_results',
  FEES: 'ncet_erp_fees',
  GRIEVANCES: 'ncet_erp_grievances',
  ANNOUNCEMENTS: 'ncet_erp_announcements',
  ATTENDANCE_LOGS: 'ncet_erp_attendance_logs'
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage for key ${key}:`, e);
  }
}

export const ERPStorage = {
  getCurrentUser(): ERPUserProfile {
    return getStoredItem<ERPUserProfile>(STORAGE_KEYS.AUTH_USER, INITIAL_STUDENTS[0]);
  },
  setCurrentUser(user: ERPUserProfile): void {
    setStoredItem(STORAGE_KEYS.AUTH_USER, user);
  },
  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  getCourses(): Course[] {
    return getStoredItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },
  saveCourses(courses: Course[]): void {
    setStoredItem(STORAGE_KEYS.COURSES, courses);
  },

  getStudentRegistrations(studentId: string): string[] {
    const all = getStoredItem<Record<string, string[]>>(STORAGE_KEYS.REGISTRATIONS, INITIAL_STUDENT_REGISTRATIONS);
    return all[studentId] || ['crs-21cs61', 'crs-21cs62', 'crs-21cs63'];
  },
  saveStudentRegistrations(studentId: string, courseIds: string[]): void {
    const all = getStoredItem<Record<string, string[]>>(STORAGE_KEYS.REGISTRATIONS, INITIAL_STUDENT_REGISTRATIONS);
    all[studentId] = courseIds;
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, all);
  },

  getStudentAttendance(studentId: string): SubjectAttendance[] {
    const all = getStoredItem<Record<string, SubjectAttendance[]>>(STORAGE_KEYS.ATTENDANCE_SUMMARY, INITIAL_STUDENT_ATTENDANCE);
    return all[studentId] || INITIAL_STUDENT_ATTENDANCE['std-001'];
  },
  saveStudentAttendance(studentId: string, summary: SubjectAttendance[]): void {
    const all = getStoredItem<Record<string, SubjectAttendance[]>>(STORAGE_KEYS.ATTENDANCE_SUMMARY, INITIAL_STUDENT_ATTENDANCE);
    all[studentId] = summary;
    setStoredItem(STORAGE_KEYS.ATTENDANCE_SUMMARY, all);
  },

  getAttendanceLogs(): AttendanceRecord[] {
    return getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_LOGS, []);
  },
  addAttendanceRecord(record: AttendanceRecord): void {
    const logs = ERPStorage.getAttendanceLogs();
    logs.unshift(record);
    setStoredItem(STORAGE_KEYS.ATTENDANCE_LOGS, logs);
  },

  getExams(): ExamScheduleItem[] {
    return getStoredItem<ExamScheduleItem[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAM_SCHEDULE);
  },
  saveExams(exams: ExamScheduleItem[]): void {
    setStoredItem(STORAGE_KEYS.EXAMS, exams);
  },

  getStudentResults(studentId: string): SemesterResult[] {
    const all = getStoredItem<Record<string, SemesterResult[]>>(STORAGE_KEYS.RESULTS, INITIAL_STUDENT_RESULTS);
    return all[studentId] || INITIAL_STUDENT_RESULTS['std-001'];
  },
  saveStudentResults(studentId: string, results: SemesterResult[]): void {
    const all = getStoredItem<Record<string, SemesterResult[]>>(STORAGE_KEYS.RESULTS, INITIAL_STUDENT_RESULTS);
    all[studentId] = results;
    setStoredItem(STORAGE_KEYS.RESULTS, all);
  },

  getFeeRecords(): FeeRecord[] {
    return getStoredItem<FeeRecord[]>(STORAGE_KEYS.FEES, INITIAL_FEE_RECORDS);
  },
  saveFeeRecords(records: FeeRecord[]): void {
    setStoredItem(STORAGE_KEYS.FEES, records);
  },
  getStudentFee(studentId: string): FeeRecord | undefined {
    const all = ERPStorage.getFeeRecords();
    return all.find(f => f.studentId === studentId);
  },
  addFeePayment(studentId: string, amount: number, method: string): FeeRecord {
    const all = ERPStorage.getFeeRecords();
    const idx = all.findIndex(f => f.studentId === studentId);
    if (idx !== -1) {
      const rec = all[idx];
      const newPaid = rec.paidAmount + amount;
      const newPending = Math.max(0, rec.totalAmount - newPaid);
      const newPayment = {
        id: `pay-${Date.now()}`,
        amount,
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: `TXN-NCET-${Math.floor(1000000 + Math.random() * 9000000)}`,
        method,
        receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      rec.paidAmount = newPaid;
      rec.pendingAmount = newPending;
      rec.status = newPending === 0 ? 'paid' : 'partial';
      rec.payments.unshift(newPayment);
      all[idx] = rec;
      ERPStorage.saveFeeRecords(all);
      return rec;
    }
    throw new Error('Student fee record not found');
  },

  getGrievances(): Grievance[] {
    return getStoredItem<Grievance[]>(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCES);
  },
  saveGrievances(grievances: Grievance[]): void {
    setStoredItem(STORAGE_KEYS.GRIEVANCES, grievances);
  },
  addGrievance(grievance: Grievance): void {
    const all = ERPStorage.getGrievances();
    all.unshift(grievance);
    ERPStorage.saveGrievances(all);
  },
  updateGrievanceStatus(ticketId: string, status: 'Submitted' | 'In Review' | 'Resolved', adminReply?: string): Grievance | null {
    const all = ERPStorage.getGrievances();
    const item = all.find(g => g.ticketId === ticketId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      if (adminReply) {
        item.responses.push({
          id: `resp-${Date.now()}`,
          authorRole: 'admin',
          authorName: 'College Administration Grievance Redressal',
          message: adminReply,
          timestamp: new Date().toISOString()
        });
      }
      ERPStorage.saveGrievances(all);
      return item;
    }
    return null;
  },

  getAnnouncements(): Announcement[] {
    return getStoredItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  saveAnnouncements(list: Announcement[]): void {
    setStoredItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  },
  addAnnouncement(announcement: Announcement): void {
    const all = ERPStorage.getAnnouncements();
    all.unshift(announcement);
    ERPStorage.saveAnnouncements(all);
  },
  markAnnouncementRead(id: string, userId: string): void {
    const all = ERPStorage.getAnnouncements();
    const item = all.find(a => a.id === id);
    if (item && !item.readBy.includes(userId)) {
      item.readBy.push(userId);
      ERPStorage.saveAnnouncements(all);
    }
  }
};
