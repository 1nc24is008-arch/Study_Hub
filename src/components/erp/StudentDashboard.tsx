import React, { useState } from 'react';
import { 
  ERPUserProfile, 
  Course, 
  SubjectAttendance, 
  ExamScheduleItem, 
  SemesterResult, 
  Announcement, 
  FeeRecord 
} from './types';
import { 
  GraduationCap, 
  Percent, 
  CreditCard, 
  Calendar, 
  BookOpen, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  LifeBuoy, 
  Megaphone, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AttendanceModule } from './AttendanceModule';
import { CourseRegistrationModule } from './CourseRegistrationModule';
import { ExamManagementModule } from './ExamManagementModule';
import { FeeManagementModule } from './FeeManagementModule';
import { GrievanceModule } from './GrievanceModule';
import { AnnouncementsModule } from './AnnouncementsModule';

interface StudentDashboardProps {
  currentUser: ERPUserProfile;
  courses: Course[];
  studentAttendance: SubjectAttendance[];
  exams: ExamScheduleItem[];
  studentResults: SemesterResult[];
  announcements: Announcement[];
  feeRecord?: FeeRecord;
  onRefreshData?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  courses,
  studentAttendance,
  exams,
  studentResults,
  announcements,
  feeRecord,
  onRefreshData,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'courses' | 'exams' | 'fees' | 'grievances' | 'announcements'
  >('overview');

  // Overall attendance calculation
  const totalClasses = studentAttendance.reduce((a, c) => a + c.totalClasses, 0);
  const attendedClasses = studentAttendance.reduce((a, c) => a + c.attendedClasses, 0);
  const overallAttendancePct = totalClasses > 0 
    ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) 
    : 84.3;

  const lowAttendanceSubjects = studentAttendance.filter(s => s.percentage < 75);
  const isAttendanceShortage = lowAttendanceSubjects.length > 0;

  // CGPA calculation
  const cgpa = '8.71';
  const pendingFee = feeRecord ? feeRecord.pendingAmount : 32000;

  return (
    <div className="space-y-8">
      {/* Student Profile Header Bar */}
      <div className="p-6 md:p-8 rounded-3xl bg-panel border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-main">{currentUser.name}</h2>
              <span className="text-[10px] font-mono font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                {currentUser.usn || '1NC22CS045'}
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">
              Bachelor of Engineering in <strong className="text-main">{currentUser.department}</strong> • Semester {currentUser.semester || 6}
            </p>
            <p className="text-[10px] text-dim">
              Academic Advisor: Dr. Rajesh Sharma • Nagarjuna College of Engineering & Tech (VTU Autonomous)
            </p>
          </div>
        </div>

        {/* Quick Quick Switch Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('fees')}
            className="px-3.5 py-2 rounded-xl bg-panel-hover hover:border-brand-primary/40 border border-border text-xs font-bold text-main transition-all flex items-center gap-1.5"
          >
            <CreditCard size={14} className="text-brand-primary" /> Fees Status
          </button>
          <button
            onClick={() => setActiveTab('grievances')}
            className="px-3.5 py-2 rounded-xl bg-panel-hover hover:border-brand-primary/40 border border-border text-xs font-bold text-main transition-all flex items-center gap-1.5"
          >
            <LifeBuoy size={14} className="text-brand-primary" /> Grievance Portal
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 custom-scrollbar">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: Sparkles },
          { key: 'attendance', label: 'Attendance & Tracking', icon: Percent },
          { key: 'courses', label: 'Courses & Electives', icon: BookOpen },
          { key: 'exams', label: 'Exams & Results', icon: Calendar },
          { key: 'fees', label: 'Fee Management', icon: CreditCard },
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

      {/* Main Content Area based on Active Sub-Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Stat Metric Cards (attendance %, CGPA, pending fees, upcoming exams) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Attendance % */}
            <div 
              onClick={() => setActiveTab('attendance')}
              className={`p-5 rounded-2xl bg-panel border transition-all cursor-pointer group shadow-sm ${
                isAttendanceShortage ? 'border-red-500/40 hover:border-red-500' : 'border-border hover:border-brand-primary/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Overall Attendance</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isAttendanceShortage ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <Percent size={16} />
                </div>
              </div>
              <h3 className={`text-3xl font-black ${
                isAttendanceShortage ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {overallAttendancePct}%
              </h3>
              <p className="text-[10px] text-dim mt-1 flex items-center justify-between">
                <span>{attendedClasses} / {totalClasses} Classes</span>
                {isAttendanceShortage && (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <AlertTriangle size={11} /> 1 Shortage
                  </span>
                )}
              </p>
            </div>

            {/* 2. CGPA */}
            <div 
              onClick={() => setActiveTab('exams')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Cumulative CGPA</span>
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-brand-primary">{cgpa}</h3>
              <p className="text-[10px] text-dim mt-1">
                Semester 5 SGPA: <strong className="text-main">8.78</strong>
              </p>
            </div>

            {/* 3. Pending Fees */}
            <div 
              onClick={() => setActiveTab('fees')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Fee Balance</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  pendingFee > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <CreditCard size={16} />
                </div>
              </div>
              <h3 className={`text-3xl font-black ${
                pendingFee > 0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {pendingFee > 0 ? `₹${pendingFee.toLocaleString('en-IN')}` : 'Cleared'}
              </h3>
              <p className="text-[10px] text-dim mt-1">
                {pendingFee > 0 ? 'Due by May 15, 2026' : 'All semester dues paid'}
              </p>
            </div>

            {/* 4. Upcoming Exams */}
            <div 
              onClick={() => setActiveTab('exams')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Upcoming Exams</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-main">{exams.length}</h3>
              <p className="text-[10px] text-dim mt-1">
                Starts: <strong className="text-main">{exams[0]?.date || 'May 18, 2026'}</strong>
              </p>
            </div>
          </div>

          {/* Critical Warnings / Banners */}
          {isAttendanceShortage && (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-red-500 uppercase tracking-wide">
                    Low Attendance Warning (Below 75%)
                  </h4>
                  <p className="text-xs text-dim mt-0.5">
                    Your attendance in <strong>Full Stack Web Architecture</strong> is currently at <strong>67.8%</strong>. Minimum 75% is required by VTU to appear for final semester examinations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-red-600 transition-all"
              >
                Inspect Attendance
              </button>
            </div>
          )}

          {/* Quick Enrolled Courses & Today's Routine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registered Courses Snapshot */}
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-primary" /> Enrolled Semester Courses ({courses.length})
                </h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-2.5">
                {courses.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-panel-hover border border-border/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-brand-primary">{c.code}</span>
                        <span className="text-xs font-bold text-main">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-dim mt-0.5 block">Instructor: {c.facultyName}</span>
                    </div>
                    <span className="text-[11px] font-black text-main bg-panel px-2.5 py-1 rounded-lg border border-border">
                      {c.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Circulars / Notifications */}
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                  <Megaphone size={16} className="text-brand-primary" /> Recent Circulars & Notices
                </h3>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-2.5">
                {announcements.slice(0, 3).map(ann => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-panel-hover border border-border/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        ann.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {ann.priority.toUpperCase()}
                      </span>
                      <span className="text-dim">{ann.date}</span>
                    </div>
                    <h5 className="text-xs font-bold text-main leading-snug">{ann.title}</h5>
                    <p className="text-[11px] text-dim line-clamp-1">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <AttendanceModule
          currentUser={currentUser}
          studentAttendance={studentAttendance}
          courses={courses}
          showToast={showToast}
          onAttendanceUpdated={onRefreshData}
        />
      )}

      {/* Sub-Tab 3: Courses & Electives */}
      {activeTab === 'courses' && (
        <CourseRegistrationModule
          currentUser={currentUser}
          courses={courses}
          onCoursesUpdated={onRefreshData}
          showToast={showToast}
        />
      )}

      {/* Sub-Tab 4: Exams & Results */}
      {activeTab === 'exams' && (
        <ExamManagementModule
          currentUser={currentUser}
          exams={exams}
          courses={courses}
          studentResults={studentResults}
          onExamsUpdated={onRefreshData}
          showToast={showToast}
        />
      )}

      {/* Sub-Tab 5: Fees */}
      {activeTab === 'fees' && (
        <FeeManagementModule
          currentUser={currentUser}
          showToast={showToast}
          onFeeUpdated={onRefreshData}
        />
      )}

      {/* Sub-Tab 6: Grievances */}
      {activeTab === 'grievances' && (
        <GrievanceModule
          currentUser={currentUser}
          showToast={showToast}
          onGrievanceUpdated={onRefreshData}
        />
      )}

      {/* Sub-Tab 7: Announcements */}
      {activeTab === 'announcements' && (
        <AnnouncementsModule
          currentUser={currentUser}
          announcements={announcements}
          courses={courses}
          onAnnouncementsUpdated={onRefreshData}
          showToast={showToast}
        />
      )}
    </div>
  );
};
