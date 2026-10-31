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
  Users, 
  Percent, 
  CreditCard, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  Download, 
  Megaphone,
  GraduationCap
} from 'lucide-react';
import { FeeManagementModule } from './FeeManagementModule';
import { ExamManagementModule } from './ExamManagementModule';

interface ParentDashboardProps {
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

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
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
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees'>('overview');

  // Overall attendance calculation
  const totalClasses = studentAttendance.reduce((a, c) => a + c.totalClasses, 0);
  const attendedClasses = studentAttendance.reduce((a, c) => a + c.attendedClasses, 0);
  const overallAttendancePct = totalClasses > 0 
    ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) 
    : 84.3;

  const lowAttendanceSubjects = studentAttendance.filter(s => s.percentage < 75);
  const isAttendanceShortage = lowAttendanceSubjects.length > 0;
  const pendingFee = feeRecord ? feeRecord.pendingAmount : 32000;

  return (
    <div className="space-y-8">
      {/* Parent & Child Profile Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-panel border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary/30 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-panel">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-main">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                PARENT / GUARDIAN PORTAL
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">
              Ward / Student: <strong className="text-main">Aarav Sharma</strong> (USN: <span className="text-brand-primary font-mono font-bold">1NC22CS045</span>)
            </p>
            <p className="text-[10px] text-dim">
              Department of Computer Science & Engineering • 6th Semester B.E. • NCET Autonomous
            </p>
          </div>
        </div>

        {/* Read-Only Mode Badge */}
        <div className="px-4 py-2 rounded-2xl bg-panel-hover border border-border text-xs text-dim font-bold flex items-center gap-2">
          <Users size={15} className="text-brand-primary" /> Verified Guardian Read-Only Access
        </div>
      </div>

      {/* Critical Alert Banners */}
      <div className="space-y-3">
        {isAttendanceShortage && (
          <div className="p-4 md:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3.5">
            <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-red-500 uppercase tracking-wide">
                Parent Alert: Low Subject Attendance Warning
              </h4>
              <p className="text-xs text-dim mt-0.5 leading-relaxed">
                Your child <strong className="text-main">Aarav Sharma</strong> currently has <strong className="text-red-500">67.8%</strong> attendance in <span className="text-main font-semibold">Full Stack Web Architecture</span>. As per VTU Autonomous regulations, 75% attendance is required to be permitted for the Semester End Examinations. Please counsel your ward.
              </p>
            </div>
          </div>
        )}

        {pendingFee > 0 && (
          <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <CreditCard size={22} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-amber-500 uppercase tracking-wide">
                  Parent Alert: Pending Semester Fee Balance
                </h4>
                <p className="text-xs text-dim mt-0.5">
                  An outstanding amount of <strong className="text-main">₹{pendingFee.toLocaleString('en-IN')}</strong> for Semester 6 is due on or before <strong className="text-main">May 15, 2026</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('fees')}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shrink-0 hover:scale-105 transition-all shadow-md"
            >
              Review & Pay Fees
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'overview'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Ward Academic Overview
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'attendance'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Attendance Breakdown
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'results'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Examination Results & CGPA
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'fees'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Fee Statements
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Overall Attendance</span>
              <h3 className={`text-3xl font-black mt-1 ${isAttendanceShortage ? 'text-red-500' : 'text-emerald-500'}`}>
                {overallAttendancePct}%
              </h3>
              <p className="text-[10px] text-dim">{attendedClasses} / {totalClasses} Classes Attended</p>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Cumulative CGPA</span>
              <h3 className="text-3xl font-black text-brand-primary mt-1">8.71</h3>
              <p className="text-[10px] text-dim">Distinction Ranking</p>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Pending Fee Balance</span>
              <h3 className={`text-3xl font-black mt-1 ${pendingFee > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {pendingFee > 0 ? `₹${pendingFee.toLocaleString('en-IN')}` : 'Cleared'}
              </h3>
              <p className="text-[10px] text-dim">{pendingFee > 0 ? 'Due: May 15, 2026' : 'No dues pending'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Upcoming Exams</span>
              <h3 className="text-3xl font-black text-main mt-1">{exams.length} Papers</h3>
              <p className="text-[10px] text-dim">Begins May 18, 2026</p>
            </div>
          </div>

          {/* Subject Attendance Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                <Percent size={16} className="text-brand-primary" /> Subject-Wise Attendance Record
              </h3>
              <span className="text-xs text-dim font-medium">Updated weekly</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentAttendance.map(sub => {
                const isShortage = sub.percentage < 75;
                return (
                  <div
                    key={sub.courseId}
                    className={`p-4 rounded-2xl bg-panel border ${
                      isShortage ? 'border-red-500/40' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-brand-primary">{sub.courseCode}</span>
                      <span className={`text-base font-black ${isShortage ? 'text-red-500' : 'text-emerald-500'}`}>
                        {sub.percentage}%
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-main mb-2">{sub.courseName}</h4>
                    <div className="w-full bg-panel-hover rounded-full h-2 overflow-hidden border border-border">
                      <div
                        className={`h-full rounded-full ${isShortage ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Circulars */}
          <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
              <Megaphone size={16} className="text-brand-primary" /> College Circulars for Parents
            </h3>

            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-panel-hover border border-border/80 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-dim mb-1">
                    <span className="font-bold text-brand-primary">{ann.priority.toUpperCase()}</span>
                    <span>{ann.date}</span>
                  </div>
                  <h5 className="font-bold text-main">{ann.title}</h5>
                  <p className="text-dim text-[11px] mt-1">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAttendance.map(sub => (
              <div key={sub.courseId} className="p-5 rounded-2xl bg-panel border border-border shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                    {sub.courseCode}
                  </span>
                  <span className={`text-xl font-black ${sub.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {sub.percentage}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-main">{sub.courseName}</h4>
                <p className="text-xs text-dim">Attended {sub.attendedClasses} out of {sub.totalClasses} classes conducted</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Results Tab */}
      {activeTab === 'results' && (
        <ExamManagementModule
          currentUser={{ ...currentUser, role: 'student', usn: '1NC22CS045', name: 'Aarav Sharma' }}
          exams={exams}
          courses={courses}
          studentResults={studentResults}
          showToast={showToast}
        />
      )}

      {/* 4. Fees Tab */}
      {activeTab === 'fees' && (
        <FeeManagementModule
          currentUser={{ ...currentUser, role: 'student', usn: '1NC22CS045', name: 'Aarav Sharma' }}
          showToast={showToast}
          onFeeUpdated={onRefreshData}
        />
      )}
    </div>
  );
};
