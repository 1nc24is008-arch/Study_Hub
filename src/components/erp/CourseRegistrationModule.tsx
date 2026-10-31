import React, { useState } from 'react';
import { Course, ERPUserProfile } from './types';
import { 
  BookCheck, 
  Layers, 
  User, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  PlusCircle, 
  FileText, 
  X, 
  Printer 
} from 'lucide-react';
import { ERPStorage } from '../../data/erpData';

interface CourseRegistrationModuleProps {
  currentUser: ERPUserProfile;
  courses: Course[];
  onCoursesUpdated?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const MAX_CREDIT_LIMIT = 24;

export const CourseRegistrationModule: React.FC<CourseRegistrationModuleProps> = ({
  currentUser,
  courses,
  onCoursesUpdated,
  showToast
}) => {
  // Student enrolled courses
  const studentId = currentUser.role === 'student' ? currentUser.id : 'std-001';
  const [registeredCourseIds, setRegisteredCourseIds] = useState<string[]>(() =>
    ERPStorage.getStudentRegistrations(studentId)
  );

  const [activeTab, setActiveTab] = useState<'all' | 'electives' | 'enrolled'>('all');
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Filtered courses
  const coreCourses = courses.filter(c => !c.isElective);
  const electiveCourses = courses.filter(c => c.isElective);

  const registeredCourses = courses.filter(c => registeredCourseIds.includes(c.id));
  const currentTotalCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);

  // Register an elective
  const handleRegisterCourse = (course: Course) => {
    if (registeredCourseIds.includes(course.id)) {
      showToast(`You are already registered for ${course.name}.`, 'info');
      return;
    }

    if (currentTotalCredits + course.credits > MAX_CREDIT_LIMIT) {
      showToast(
        `Cannot register! Exceeds maximum semester credit limit of ${MAX_CREDIT_LIMIT} credits (Current: ${currentTotalCredits}, Course: ${course.credits}).`,
        'error'
      );
      return;
    }

    if (course.enrolledSeats >= course.maxSeats) {
      showToast(`Registration failed: No seats remaining for ${course.name}!`, 'error');
      return;
    }

    // Update course seats
    const updatedCourses = courses.map(c => {
      if (c.id === course.id) {
        return { ...c, enrolledSeats: c.enrolledSeats + 1 };
      }
      return c;
    });

    const nextRegistered = [...registeredCourseIds, course.id];
    setRegisteredCourseIds(nextRegistered);
    ERPStorage.saveStudentRegistrations(studentId, nextRegistered);
    ERPStorage.saveCourses(updatedCourses);
    if (onCoursesUpdated) onCoursesUpdated();

    showToast(`Successfully registered for elective: ${course.name} (${course.credits} Credits)!`, 'success');
  };

  // Drop an elective
  const handleDropCourse = (course: Course) => {
    if (!course.isElective) {
      showToast(`Core course ${course.code} is mandatory and cannot be dropped.`, 'error');
      return;
    }

    const updatedCourses = courses.map(c => {
      if (c.id === course.id) {
        return { ...c, enrolledSeats: Math.max(0, c.enrolledSeats - 1) };
      }
      return c;
    });

    const nextRegistered = registeredCourseIds.filter(id => id !== course.id);
    setRegisteredCourseIds(nextRegistered);
    ERPStorage.saveStudentRegistrations(studentId, nextRegistered);
    ERPStorage.saveCourses(updatedCourses);
    if (onCoursesUpdated) onCoursesUpdated();

    showToast(`Dropped ${course.name} from your semester registrations.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Credit Counter & Status */}
      <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-dim">Semester Credit Allocation</span>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-3xl font-black text-main">
              {currentTotalCredits} <span className="text-sm font-bold text-dim">/ {MAX_CREDIT_LIMIT} Credits</span>
            </h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              currentTotalCredits > 20 
                ? 'bg-amber-500/10 text-amber-500' 
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {MAX_CREDIT_LIMIT - currentTotalCredits} Credits Remaining
            </span>
          </div>
          <p className="text-xs text-dim mt-1">
            VTU Autonomous regulations permit up to 24 credits per semester including core and electives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary hover:text-white text-brand-primary border border-brand-primary/30 text-xs font-bold transition-all flex items-center gap-2"
          >
            <FileText size={15} /> View Registration Summary Slip
          </button>
        </div>
      </div>

      {/* Credit Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-dim">
          <span>Registered Credits: {currentTotalCredits}</span>
          <span>Max Allowed: {MAX_CREDIT_LIMIT}</span>
        </div>
        <div className="w-full bg-panel-hover rounded-full h-3 overflow-hidden p-0.5 border border-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              currentTotalCredits >= 24 
                ? 'bg-amber-500' 
                : 'bg-brand-primary'
            }`}
            style={{ width: `${(currentTotalCredits / MAX_CREDIT_LIMIT) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'all' 
              ? 'bg-brand-primary text-white shadow-md' 
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('electives')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'electives' 
              ? 'bg-brand-primary text-white shadow-md' 
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Electives Only ({electiveCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'enrolled' 
              ? 'bg-brand-primary text-white shadow-md' 
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Enrolled ({registeredCourses.length})
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'all' 
          ? courses 
          : activeTab === 'electives' 
            ? electiveCourses 
            : registeredCourses
        ).map(course => {
          const isRegistered = registeredCourseIds.includes(course.id);
          const seatsAvailable = course.maxSeats - course.enrolledSeats;
          const isFull = seatsAvailable <= 0;

          return (
            <div
              key={course.id}
              className={`p-5 rounded-2xl bg-panel border transition-all flex flex-col justify-between ${
                isRegistered 
                  ? 'border-brand-primary/50 shadow-sm shadow-brand-primary/5' 
                  : 'border-border hover:border-brand-primary/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                      {course.code}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      course.isElective 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {course.isElective ? 'Professional Elective' : 'Core Compulsory'}
                    </span>
                  </div>

                  <span className="text-xs font-black text-main bg-panel-hover px-2.5 py-1 rounded-lg border border-border">
                    {course.credits} Credits
                  </span>
                </div>

                <h4 className="text-base font-bold text-main leading-snug mb-2">
                  {course.name}
                </h4>

                <div className="space-y-1.5 text-xs text-dim my-3">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-brand-primary" />
                    <span>Faculty: <strong className="text-main">{course.facultyName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-brand-primary" />
                    <span>Schedule: {course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-brand-primary" />
                    <span>Room: {course.room}</span>
                  </div>
                </div>

                {/* Topics Pills */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {course.syllabusTopics.map((topic, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-panel-hover text-dim border border-border">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action and Seat Indicator */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isFull ? 'bg-red-500' : seatsAvailable < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[11px] font-bold text-dim">
                      {isFull ? (
                        <span className="text-red-500">All Seats Filled</span>
                      ) : (
                        <span>{seatsAvailable} seats remaining</span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-dim">Capacity: {course.enrolledSeats}/{course.maxSeats}</span>
                </div>

                <div>
                  {isRegistered ? (
                    course.isElective ? (
                      <button
                        onClick={() => handleDropCourse(course)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Trash2 size={13} /> Drop Elective
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                        <CheckCircle2 size={13} /> Mandatory Core
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => handleRegisterCourse(course)}
                      disabled={isFull}
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <PlusCircle size={14} /> Register Elective
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Summary Slip Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-panel border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookCheck size={20} className="text-brand-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-main">
                  Semester Course Registration Confirmation Slip
                </h3>
              </div>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="text-dim hover:text-main p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-panel-hover border border-border text-xs space-y-1">
              <div className="flex justify-between"><span className="text-dim">Student Name:</span> <strong className="text-main">{currentUser.name}</strong></div>
              <div className="flex justify-between"><span className="text-dim">USN:</span> <strong className="text-brand-primary font-mono">{currentUser.usn || '1NC22CS045'}</strong></div>
              <div className="flex justify-between"><span className="text-dim">Department & Semester:</span> <strong className="text-main">{currentUser.department} • Semester 6</strong></div>
              <div className="flex justify-between"><span className="text-dim">Academic Year:</span> <strong className="text-main">2025-2026 (Even Semester)</strong></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                    <th className="py-2">Code</th>
                    <th className="py-2">Course Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registeredCourses.map(c => (
                    <tr key={c.id}>
                      <td className="py-2 font-mono font-bold text-brand-primary">{c.code}</td>
                      <td className="py-2 font-medium text-main">{c.name}</td>
                      <td className="py-2 text-dim">{c.isElective ? 'Elective' : 'Core'}</td>
                      <td className="py-2 text-right font-bold text-main">{c.credits}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-black text-xs text-main">
                    <td colSpan={3} className="py-3 uppercase">Total Registered Semester Credits</td>
                    <td className="py-3 text-right text-brand-primary font-black text-sm">{currentTotalCredits} / 24</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Verified by NCET Academic Registration Portal
              </span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-panel-hover hover:bg-panel border border-border text-xs font-bold text-main flex items-center gap-2 transition-all"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
