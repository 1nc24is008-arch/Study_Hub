import React, { useState } from 'react';
import { 
  ERPUserProfile, 
  Course, 
  ExamScheduleItem, 
  Announcement, 
  FacultyScheduleItem 
} from './types';
import { 
  CheckCheck, 
  FileSpreadsheet, 
  Megaphone, 
  BookOpen, 
  Clock, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AttendanceModule } from './AttendanceModule';
import { ExamManagementModule } from './ExamManagementModule';
import { AnnouncementsModule } from './AnnouncementsModule';
import { FACULTY_SCHEDULE, INITIAL_STUDENTS } from '../../data/erpData';

interface FacultyDashboardProps {
  currentUser: ERPUserProfile;
  courses: Course[];
  exams: ExamScheduleItem[];
  announcements: Announcement[];
  onRefreshData?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  currentUser,
  courses,
  exams,
  announcements,
  onRefreshData,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'markAttendance' | 'uploadMarks' | 'postAnnouncement' | 'courses'
  >('overview');

  // Filter courses assigned to this faculty member
  const assignedCourses = courses.filter(c => c.facultyId === currentUser.id || c.facultyName.includes(currentUser.name.split(' ')[1] || 'Sharma'));
  const todaySchedule = FACULTY_SCHEDULE[currentUser.id] || FACULTY_SCHEDULE['fac-001'];

  return (
    <div className="space-y-8">
      {/* Faculty Profile Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-panel border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-main">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                FACULTY ID: {currentUser.id.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">
              {currentUser.designation || 'Professor & Head of Department'} • Department of <strong className="text-main">{currentUser.department}</strong>
            </p>
            <p className="text-[10px] text-dim">
              Nagarjuna College of Engineering & Tech • VTU Autonomous Scheme Evaluator
            </p>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('markAttendance')}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckCheck size={14} /> Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('uploadMarks')}
            className="px-3.5 py-2 rounded-xl bg-panel-hover hover:border-brand-primary/40 border border-border text-xs font-bold text-main transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-brand-primary" /> Upload Marks
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 custom-scrollbar">
        {[
          { key: 'overview', label: 'Faculty Control Center', icon: Sparkles },
          { key: 'markAttendance', label: 'Mark Attendance', icon: CheckCheck },
          { key: 'uploadMarks', label: 'Enter & Upload Marks', icon: FileSpreadsheet },
          { key: 'postAnnouncement', label: 'Broadcast Announcement', icon: Megaphone },
          { key: 'courses', label: 'Assigned Curriculum', icon: BookOpen }
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

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Faculty Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Assigned Courses</span>
              <h3 className="text-3xl font-black text-main mt-1">{assignedCourses.length || 3}</h3>
              <p className="text-[10px] text-dim">Theory & Lab Modules</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Enrolled Students</span>
              <h3 className="text-3xl font-black text-brand-primary mt-1">162</h3>
              <p className="text-[10px] text-dim">Across 6th & 4th Sem CSE</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Today's Lectures</span>
              <h3 className="text-3xl font-black text-emerald-500 mt-1">{todaySchedule.length}</h3>
              <p className="text-[10px] text-dim">Active Class Roster</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Pending IA Evaluations</span>
              <h3 className="text-3xl font-black text-amber-500 mt-1">1 Course</h3>
              <p className="text-[10px] text-dim">IA-2 Valuation Open</p>
            </div>
          </div>

          {/* Quick Actions Action Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('markAttendance')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black uppercase text-main group-hover:text-brand-primary transition-colors">
                  Mark Attendance
                </h4>
                <p className="text-xs text-dim mt-0.5">Record Present/Absent/Leave for today's batches</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <CheckCheck size={18} />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('uploadMarks')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black uppercase text-main group-hover:text-brand-primary transition-colors">
                  Upload Exam Marks
                </h4>
                <p className="text-xs text-dim mt-0.5">Submit Internal IA-1, IA-2 and practical grades</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <FileSpreadsheet size={18} />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('postAnnouncement')}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/40 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black uppercase text-main group-hover:text-brand-primary transition-colors">
                  Post Announcement
                </h4>
                <p className="text-xs text-dim mt-0.5">Broadcast syllabus notes or class updates</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <Megaphone size={18} />
              </div>
            </div>
          </div>

          {/* Today's Classes & Timetable Schedule */}
          <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                <Calendar size={16} className="text-brand-primary" /> Today's Lecture & Lab Schedule
              </h3>
              <span className="text-[11px] text-dim">Academic Session: 2025-26</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                    <th className="py-2.5 px-3">Day & Time</th>
                    <th className="py-2.5 px-3">Course Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3">Branch & Sem</th>
                    <th className="py-2.5 px-3">Venue</th>
                    <th className="py-2.5 px-3 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {todaySchedule.map(item => (
                    <tr key={item.id} className="hover:bg-panel-hover/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-main">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-brand-primary" /> {item.day}, {item.time}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-primary">{item.courseCode}</td>
                      <td className="py-2.5 px-3 font-medium text-main">{item.courseName}</td>
                      <td className="py-2.5 px-3 text-dim">{item.branch} • Sem {item.semester}</td>
                      <td className="py-2.5 px-3 text-dim">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {item.room}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setActiveTab('markAttendance')}
                          className="px-3 py-1 rounded-lg bg-brand-primary text-white text-[11px] font-bold shadow-sm hover:scale-105 transition-all inline-flex items-center gap-1"
                        >
                          <CheckCheck size={12} /> Take Attendance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab: Mark Attendance */}
      {activeTab === 'markAttendance' && (
        <AttendanceModule
          currentUser={currentUser}
          courses={courses}
          showToast={showToast}
          onAttendanceUpdated={onRefreshData}
        />
      )}

      {/* Sub-Tab: Upload Marks */}
      {activeTab === 'uploadMarks' && (
        <ExamManagementModule
          currentUser={currentUser}
          exams={exams}
          courses={courses}
          showToast={showToast}
          onExamsUpdated={onRefreshData}
        />
      )}

      {/* Sub-Tab: Broadcast Announcement */}
      {activeTab === 'postAnnouncement' && (
        <AnnouncementsModule
          currentUser={currentUser}
          announcements={announcements}
          courses={courses}
          onAnnouncementsUpdated={onRefreshData}
          showToast={showToast}
        />
      )}

      {/* Sub-Tab: Assigned Courses */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedCourses.map(course => (
            <div key={course.id} className="p-5 rounded-2xl bg-panel border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                  {course.code}
                </span>
                <span className="text-xs font-black text-main bg-panel-hover px-2.5 py-1 rounded-lg border border-border">
                  {course.credits} Credits
                </span>
              </div>
              <h4 className="text-base font-bold text-main leading-snug">{course.name}</h4>
              <p className="text-xs text-dim">Enrolled Students: {course.enrolledSeats} / {course.maxSeats}</p>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-dim">Room: {course.room}</span>
                <button
                  onClick={() => setActiveTab('markAttendance')}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  Manage Roster <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
