import React, { useState, useEffect } from 'react';
import { 
  ERPUserProfile, 
  ERPUserRole, 
  Course, 
  SubjectAttendance, 
  ExamScheduleItem, 
  SemesterResult, 
  FeeRecord, 
  Grievance, 
  Announcement 
} from './types';
import { 
  ERPStorage, 
  INITIAL_STUDENTS, 
  INITIAL_FACULTY, 
  INITIAL_PARENT, 
  INITIAL_ADMIN 
} from '../../data/erpData';
import { StudentDashboard } from './StudentDashboard';
import { FacultyDashboard } from './FacultyDashboard';
import { ParentDashboard } from './ParentDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ERPLogin } from './ERPLogin';
import { NotificationBell } from './NotificationBell';
import { 
  GraduationCap, 
  ArrowLeft, 
  LogOut, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Repeat 
} from 'lucide-react';

interface ERPPortalProps {
  onBackToHub: () => void;
}

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const ERPPortal: React.FC<ERPPortalProps> = ({ onBackToHub }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<ERPUserProfile | null>(() => {
    return ERPStorage.getCurrentUser();
  });

  // State collections
  const [courses, setCourses] = useState<Course[]>(() => ERPStorage.getCourses());
  const [exams, setExams] = useState<ExamScheduleItem[]>(() => ERPStorage.getExams());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => ERPStorage.getAnnouncements());
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => ERPStorage.getFeeRecords());
  const [grievances, setGrievances] = useState<Grievance[]>(() => ERPStorage.getGrievances());
  const [studentAttendance, setStudentAttendance] = useState<SubjectAttendance[]>(() => {
    return ERPStorage.getStudentAttendance(currentUser?.id || 'std-001');
  });
  const [studentResults, setStudentResults] = useState<SemesterResult[]>(() => {
    return ERPStorage.getStudentResults(currentUser?.id || 'std-001');
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Refresh all state from localStorage
  const refreshAllData = () => {
    setCourses(ERPStorage.getCourses());
    setExams(ERPStorage.getExams());
    setAnnouncements(ERPStorage.getAnnouncements());
    setFeeRecords(ERPStorage.getFeeRecords());
    setGrievances(ERPStorage.getGrievances());
    if (currentUser) {
      const sId = currentUser.role === 'student' ? currentUser.id : 'std-001';
      setStudentAttendance(ERPStorage.getStudentAttendance(sId));
      setStudentResults(ERPStorage.getStudentResults(sId));
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser]);

  // Handle Role Quick Switch (without full re-login)
  const handleSwitchRole = (role: ERPUserRole) => {
    let targetUser: ERPUserProfile;
    if (role === 'student') targetUser = INITIAL_STUDENTS[0];
    else if (role === 'faculty') targetUser = INITIAL_FACULTY[0];
    else if (role === 'parent') targetUser = INITIAL_PARENT;
    else targetUser = INITIAL_ADMIN;

    setCurrentUser(targetUser);
    ERPStorage.setCurrentUser(targetUser);
    showToast(`Switched view to ${role.toUpperCase()} portal.`, 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    ERPStorage.clearCurrentUser();
    showToast('Logged out of ERP portal.', 'info');
  };

  // Find fee record for current user
  const currentStudentId = currentUser?.role === 'student' ? currentUser.id : 'std-001';
  const currentFeeRecord = feeRecords.find(f => f.studentId === currentStudentId);

  // Check warnings for notification bell
  const lowAttendanceWarning = studentAttendance.some(s => s.percentage < 75);
  const pendingFeeWarning = (currentFeeRecord?.pendingAmount || 0) > 0;

  return (
    <div className="min-h-screen flex flex-col bg-soft-bg text-main">
      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-panel border-emerald-500/40 text-emerald-500'
                : toast.type === 'error'
                  ? 'bg-panel border-red-500/40 text-red-500'
                  : 'bg-panel border-brand-primary/40 text-brand-primary'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <Info size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-bold text-main leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Top ERP Navigation Bar */}
      <header className="sticky top-0 z-40 w-full h-[76px] px-6 md:px-10 flex items-center justify-between glass-nav">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-panel hover:bg-panel-hover border border-border text-xs font-bold text-main transition-all group"
            title="Return to Study Materials Hub"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Study Hub</span>
          </button>

          <div className="h-6 w-[1px] bg-border hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <GraduationCap size={18} />
            </div>
            <div>
              <h1 className="text-sm font-black text-main tracking-tight uppercase">
                <span className="text-brand-primary">NCET</span> Campus ERP
              </h1>
              <p className="text-[9px] text-dim font-bold uppercase tracking-widest hidden sm:block">
                Autonomous Integrated Academic System
              </p>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher Pill Dropdown / Selector */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-panel-hover rounded-xl border border-border text-xs">
              <span className="text-[10px] text-dim px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <Repeat size={10} /> Role:
              </span>
              {(['student', 'faculty', 'parent', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => handleSwitchRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    currentUser.role === role
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-dim hover:text-main'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <NotificationBell
              announcements={announcements}
              currentUserId={currentUser.id}
              lowAttendanceWarning={currentUser.role === 'student' && lowAttendanceWarning}
              pendingFeeWarning={currentUser.role === 'student' && pendingFeeWarning}
              onMarkRead={(id) => {
                ERPStorage.markAnnouncementRead(id, currentUser.id);
                refreshAllData();
              }}
            />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-main leading-tight line-clamp-1">{currentUser.name}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-dim hover:text-red-500 hover:bg-red-500/10 border border-border transition-all"
              title="Sign Out of ERP"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onBackToHub}
            className="px-4 py-2 rounded-xl bg-panel border border-border text-xs font-bold text-main hover:border-brand-primary/40 transition-all"
          >
            Back to Study Materials Hub
          </button>
        )}
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 md:p-10">
        {!currentUser ? (
          <div className="py-12 flex items-center justify-center">
            <ERPLogin
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                refreshAllData();
              }}
              showToast={showToast}
            />
          </div>
        ) : currentUser.role === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            courses={courses}
            studentAttendance={studentAttendance}
            exams={exams}
            studentResults={studentResults}
            announcements={announcements}
            feeRecord={currentFeeRecord}
            onRefreshData={refreshAllData}
            showToast={showToast}
          />
        ) : currentUser.role === 'faculty' ? (
          <FacultyDashboard
            currentUser={currentUser}
            courses={courses}
            exams={exams}
            announcements={announcements}
            onRefreshData={refreshAllData}
            showToast={showToast}
          />
        ) : currentUser.role === 'parent' ? (
          <ParentDashboard
            currentUser={currentUser}
            courses={courses}
            studentAttendance={studentAttendance}
            exams={exams}
            studentResults={studentResults}
            announcements={announcements}
            feeRecord={currentFeeRecord}
            onRefreshData={refreshAllData}
            showToast={showToast}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            courses={courses}
            exams={exams}
            announcements={announcements}
            feeRecords={feeRecords}
            grievances={grievances}
            onRefreshData={refreshAllData}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
};
