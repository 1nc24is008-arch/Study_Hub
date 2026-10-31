import React, { useState } from 'react';
import { 
  ERPUserProfile, 
  Course, 
  ExamScheduleItem, 
  Announcement, 
  FeeRecord, 
  Grievance 
} from './types';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  LifeBuoy, 
  Megaphone, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_FACULTY } from '../../data/erpData';
import { AttendanceModule } from './AttendanceModule';
import { ExamManagementModule } from './ExamManagementModule';
import { FeeManagementModule } from './FeeManagementModule';
import { GrievanceModule } from './GrievanceModule';
import { AnnouncementsModule } from './AnnouncementsModule';
import { CourseRegistrationModule } from './CourseRegistrationModule';

interface AdminDashboardProps {
  currentUser: ERPUserProfile;
  courses: Course[];
  exams: ExamScheduleItem[];
  announcements: Announcement[];
  feeRecords: FeeRecord[];
  grievances: Grievance[];
  onRefreshData?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  courses,
  exams,
  announcements,
  feeRecords,
  grievances,
  onRefreshData,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'users' | 'courses' | 'fees' | 'exams' | 'grievances' | 'announcements'
  >('analytics');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');

  // Stats
  const totalStudents = 1480;
  const totalFaculty = 94;
  const totalCourses = courses.length;
  const totalFeeCollected = feeRecords.reduce((acc, f) => acc + f.paidAmount, 0);
  const openGrievancesCount = grievances.filter(g => g.status !== 'Resolved').length;

  // Filtered users
  const allUsersList = [
    ...INITIAL_STUDENTS,
    ...INITIAL_FACULTY
  ];

  const filteredUsers = allUsersList.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.usn && u.usn.toLowerCase().includes(q)) || 
        u.department.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-panel border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-md">
            <ShieldCheck size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-main">Central Administrative Console</h2>
              <span className="text-[10px] font-bold bg-brand-primary text-white px-2.5 py-0.5 rounded-full shadow-sm">
                FULL PERMISSIONS
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">
              Nagarjuna College of Engineering & Technology • Academic Year 2025-26 Operations
            </p>
            <p className="text-[10px] text-dim">
              System Administrator: {currentUser.name} • {currentUser.email}
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Megaphone size={14} /> Broadcast Circular
          </button>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Students */}
        <div 
          onClick={() => setActiveTab('users')}
          className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Students</span>
          <h3 className="text-3xl font-black text-main mt-1">{totalStudents}</h3>
          <p className="text-[10px] text-dim flex items-center gap-1 mt-0.5">
            <span className="text-emerald-500 font-bold">+12%</span> vs last intake
          </p>
        </div>

        {/* 2. Faculty */}
        <div 
          onClick={() => setActiveTab('users')}
          className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Teaching Faculty</span>
          <h3 className="text-3xl font-black text-main mt-1">{totalFaculty}</h3>
          <p className="text-[10px] text-dim mt-0.5">8 Engineering Depts</p>
        </div>

        {/* 3. Courses */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Active Courses</span>
          <h3 className="text-3xl font-black text-brand-primary mt-1">{totalCourses}</h3>
          <p className="text-[10px] text-dim mt-0.5">Core & Electives</p>
        </div>

        {/* 4. Fee Collected */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Fee Collected</span>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">₹{(totalFeeCollected / 1000).toFixed(0)}k+</h3>
          <p className="text-[10px] text-dim mt-0.5">82.4% Recovery Rate</p>
        </div>

        {/* 5. Open Grievances */}
        <div 
          onClick={() => setActiveTab('grievances')}
          className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Open Grievances</span>
          <h3 className={`text-3xl font-black mt-1 ${openGrievancesCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {openGrievancesCount}
          </h3>
          <p className="text-[10px] text-dim mt-0.5">{grievances.length} Total Registered</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 custom-scrollbar">
        {[
          { key: 'analytics', label: 'Campus Analytics', icon: TrendingUp },
          { key: 'users', label: 'User Directory', icon: Users },
          { key: 'courses', label: 'Course Catalog', icon: BookOpen },
          { key: 'fees', label: 'Fee Defaulters & Ledger', icon: CreditCard },
          { key: 'exams', label: 'Exam Schedules & Marks', icon: Calendar },
          { key: 'grievances', label: 'Grievance Redressal', icon: LifeBuoy },
          { key: 'announcements', label: 'Announcements', icon: Megaphone }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-102'
                  : 'bg-panel border border-border text-dim hover:text-main hover:border-brand-primary/40'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Analytics Charts Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Student Distribution */}
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-main tracking-wider">
                Department Student Strength
              </h4>
              <div className="space-y-3 text-xs">
                {[
                  { dept: 'Computer Science (CSE)', count: 480, pct: 32, color: 'bg-cyan-500' },
                  { dept: 'Information Science (ISE)', count: 240, pct: 16, color: 'bg-indigo-500' },
                  { dept: 'Artificial Intelligence (AI/ML)', count: 240, pct: 16, color: 'bg-purple-500' },
                  { dept: 'Electronics & Comm (ECE)', count: 220, pct: 15, color: 'bg-rose-500' },
                  { dept: 'Civil Engineering (CIVIL)', count: 160, pct: 11, color: 'bg-amber-500' },
                  { dept: 'Mechanical Engineering (MECH)', count: 140, pct: 10, color: 'bg-orange-500' }
                ].map(item => (
                  <div key={item.dept} className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-main">{item.dept}</span>
                      <span className="text-dim">{item.count} students ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-panel-hover rounded-full h-2 overflow-hidden border border-border">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct * 2.5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Health Metric */}
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-main tracking-wider">
                Campus Attendance Compliance
              </h4>
              <div className="p-4 rounded-xl bg-panel-hover border border-border text-center space-y-2">
                <span className="text-4xl font-black text-emerald-500">86.2%</span>
                <p className="text-xs text-dim">Campus-Wide Attendance Average</p>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-dim">Students Eligible (&gt; 75%):</span>
                  <strong className="text-emerald-500 font-mono">1,392 (94.0%)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Critical Shortage (&lt; 75%):</span>
                  <strong className="text-red-500 font-mono">88 (6.0%)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Medical Leaves Acknowledged:</span>
                  <strong className="text-brand-primary font-mono">42</strong>
                </div>
              </div>
            </div>

            {/* Fee Recovery Progress */}
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-main tracking-wider">
                Semester Fee Invoicing & Receipts
              </h4>
              <div className="p-4 rounded-xl bg-panel-hover border border-border text-center space-y-2">
                <span className="text-4xl font-black text-brand-primary">82.4%</span>
                <p className="text-xs text-dim">Fees Collected to Date</p>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-dim">Total Fees Invoiced:</span>
                  <strong className="text-main font-mono">₹4,09,000</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Total Dues Collected:</span>
                  <strong className="text-emerald-500 font-mono">₹2,12,000</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Outstanding Defaulter Amount:</span>
                  <strong className="text-red-500 font-mono">₹1,97,000</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Directory Tab */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-main">
                Campus User Directory
              </h3>
              <p className="text-xs text-dim mt-0.5">
                Browse verified Student and Faculty profiles with department affiliations.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="text"
                  placeholder="Search name, USN, dept..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-panel-hover border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-main outline-none focus:border-brand-primary"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="bg-panel-hover border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-main outline-none focus:border-brand-primary"
              >
                <option value="all">All Roles</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">USN / Faculty ID</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-panel-hover/50">
                    <td className="py-2.5 px-3 font-bold text-main">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover border border-border"
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-primary font-bold">
                      {user.usn || user.id.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'faculty' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-dim">{user.department}</td>
                    <td className="py-2.5 px-3 text-dim">{user.email}</td>
                    <td className="py-2.5 px-3 text-dim font-mono">{user.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Courses Tab */}
      {activeTab === 'courses' && (
        <CourseRegistrationModule
          currentUser={currentUser}
          courses={courses}
          onCoursesUpdated={onRefreshData}
          showToast={showToast}
        />
      )}

      {/* 4. Fees Tab */}
      {activeTab === 'fees' && (
        <FeeManagementModule
          currentUser={currentUser}
          showToast={showToast}
          onFeeUpdated={onRefreshData}
        />
      )}

      {/* 5. Exams Tab */}
      {activeTab === 'exams' && (
        <ExamManagementModule
          currentUser={currentUser}
          exams={exams}
          courses={courses}
          showToast={showToast}
          onExamsUpdated={onRefreshData}
        />
      )}

      {/* 6. Grievances Tab */}
      {activeTab === 'grievances' && (
        <GrievanceModule
          currentUser={currentUser}
          showToast={showToast}
          onGrievanceUpdated={onRefreshData}
        />
      )}

      {/* 7. Announcements Tab */}
      {activeTab === 'announcements' && (
        <AnnouncementsModule
          currentUser={currentUser}
          announcements={announcements}
          courses={courses}
          showToast={showToast}
          onAnnouncementsUpdated={onRefreshData}
        />
      )}
    </div>
  );
};
