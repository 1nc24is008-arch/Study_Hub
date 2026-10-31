import React, { useState } from 'react';
import { 
  SubjectAttendance, 
  Course, 
  ERPUserProfile 
} from './types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Save, 
  Calendar, 
  BookOpen, 
  CheckCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { ERPStorage, INITIAL_STUDENTS } from '../../data/erpData';

interface AttendanceModuleProps {
  currentUser: ERPUserProfile;
  studentAttendance?: SubjectAttendance[];
  courses?: Course[];
  onAttendanceUpdated?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  currentUser,
  studentAttendance = [],
  courses = [],
  onAttendanceUpdated,
  showToast
}) => {
  const isFacultyOrAdmin = currentUser.role === 'faculty' || currentUser.role === 'admin';

  // Faculty attendance marking state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || 'crs-21cs61'
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Student roster status map: { [studentId]: 'present' | 'absent' | 'leave' }
  const [rosterStatus, setRosterStatus] = useState<Record<string, 'present' | 'absent' | 'leave'>>(
    () => {
      const initial: Record<string, 'present' | 'absent' | 'leave'> = {};
      INITIAL_STUDENTS.forEach((s, idx) => {
        initial[s.id] = idx === 3 ? 'absent' : idx === 7 ? 'leave' : 'present';
      });
      return initial;
    }
  );

  const [saving, setSaving] = useState(false);

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'leave'> = {};
    INITIAL_STUDENTS.forEach(s => {
      updated[s.id] = 'present';
    });
    setRosterStatus(updated);
    showToast('All students marked as Present.', 'info');
  };

  // Toggle individual status
  const handleToggleStatus = (studentId: string, status: 'present' | 'absent' | 'leave') => {
    setRosterStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance
  const handleSaveAttendance = () => {
    setSaving(true);
    setTimeout(() => {
      // Record logs
      Object.entries(rosterStatus).forEach(([sId, status]) => {
        ERPStorage.addAttendanceRecord({
          id: `att-${Date.now()}-${sId}`,
          courseId: selectedCourseId,
          studentId: sId,
          date: attendanceDate,
          status,
          markedByFacultyId: currentUser.id
        });

        // Also update Aarav's summary if included
        if (sId === 'std-001') {
          const currentSummary = ERPStorage.getStudentAttendance('std-001');
          const updated = currentSummary.map(item => {
            if (item.courseId === selectedCourseId) {
              const newTotal = item.totalClasses + 1;
              const newAttended = status === 'present' ? item.attendedClasses + 1 : item.attendedClasses;
              return {
                ...item,
                totalClasses: newTotal,
                attendedClasses: newAttended,
                percentage: Number(((newAttended / newTotal) * 100).toFixed(1))
              };
            }
            return item;
          });
          ERPStorage.saveStudentAttendance('std-001', updated);
        }
      });

      setSaving(false);
      showToast(`Attendance for course recorded successfully on ${attendanceDate}!`, 'success');
      if (onAttendanceUpdated) onAttendanceUpdated();
    }, 600);
  };

  // Student metrics
  const totalClassesAll = studentAttendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalAttendedAll = studentAttendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallPercentage = totalClassesAll > 0 
    ? Number(((totalAttendedAll / totalClassesAll) * 100).toFixed(1)) 
    : 0;

  const lowAttendanceCount = studentAttendance.filter(s => s.percentage < 75).length;

  return (
    <div className="space-y-6">
      {/* Student/Parent View: Attendance Charts & Subject Cards */}
      {!isFacultyOrAdmin && (
        <>
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Overall Attendance</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className={`text-3xl font-black ${
                    overallPercentage >= 75 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {overallPercentage}%
                  </h3>
                  <span className="text-xs text-dim font-bold">
                    ({totalAttendedAll}/{totalClassesAll} classes)
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                overallPercentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                <Percent size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Eligibility Status</span>
                <div className="mt-1 flex items-center gap-2">
                  {lowAttendanceCount === 0 ? (
                    <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle size={16} /> Eligible for SEE Exams
                    </span>
                  ) : (
                    <span className="text-sm font-black text-red-500 flex items-center gap-1.5">
                      <AlertTriangle size={16} /> Shortage in {lowAttendanceCount} Subject(s)
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-dim mt-0.5">VTU mandates 75% minimum per subject</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Academic Term</span>
                <h4 className="text-lg font-black text-main mt-1">Semester 6 (Even)</h4>
                <p className="text-[10px] text-dim">Scheme: VTU Autonomous 2022</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-panel-hover text-dim flex items-center justify-center">
                <Calendar size={24} />
              </div>
            </div>
          </div>

          {/* Low Attendance Warning Alert Banner */}
          {lowAttendanceCount > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4 animate-in fade-in">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-500 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-red-500 uppercase tracking-wide">
                  CRITICAL: Below 75% VTU Attendance Threshold!
                </h4>
                <p className="text-xs text-dim mt-1 leading-relaxed">
                  You are currently falling below 75% attendance in <span className="font-bold text-main">Full Stack Web Architecture (67.8%)</span>. You must attend the next 4 consecutive lectures to attain exam hall-ticket eligibility. Contact your class coordinator if you have medical leave documents.
                </p>
              </div>
            </div>
          )}

          {/* Subject-Wise Attendance Cards with Visual Progress Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                <BookOpen size={16} className="text-brand-primary" /> Subject-Wise Attendance Breakdown
              </h3>
              <span className="text-[11px] text-dim">Updated in real-time by course faculty</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentAttendance.map((sub) => {
                const isShortage = sub.percentage < 75;
                const isOptimal = sub.percentage >= 85;
                return (
                  <div
                    key={sub.courseId}
                    className={`p-5 rounded-2xl bg-panel border transition-all ${
                      isShortage 
                        ? 'border-red-500/40 bg-red-500/[0.02] shadow-sm' 
                        : 'border-border hover:border-brand-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                            {sub.courseCode}
                          </span>
                          {isShortage && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500 text-white flex items-center gap-1">
                              <AlertTriangle size={10} /> Shortage Warning
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-main leading-snug">{sub.courseName}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-black ${
                          isShortage ? 'text-red-500' : isOptimal ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {sub.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-panel-hover rounded-full h-3 overflow-hidden p-0.5 border border-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isShortage 
                            ? 'bg-gradient-to-r from-red-600 to-red-400' 
                            : isOptimal 
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>

                    {/* Stats details */}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-dim">
                      <span>Attended: <strong className="text-main">{sub.attendedClasses}</strong> / {sub.totalClasses} classes</span>
                      <span>Missed: <strong className="text-main">{sub.totalClasses - sub.attendedClasses}</strong></span>
                      <span className={`font-bold ${isShortage ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isShortage ? `Needs +4 classes` : `Safe (+${sub.attendedClasses - Math.ceil(sub.totalClasses * 0.75)} buffer)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Faculty/Admin View: Mark Attendance Tool */}
      {isFacultyOrAdmin && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-main flex items-center gap-2">
                  <CheckCheck size={18} className="text-brand-primary" /> Daily Attendance Marking
                </h3>
                <p className="text-xs text-dim mt-0.5">
                  Record and publish student attendance for today's session.
                </p>
              </div>

              {/* Course & Date Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Select Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Session Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="pt-5">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-3 py-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 text-xs font-bold transition-all"
                  >
                    Mark All Present
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                    <th className="py-3 px-4">USN</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Branch & Sem</th>
                    <th className="py-3 px-4 text-center">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {INITIAL_STUDENTS.map(student => {
                    const status = rosterStatus[student.id] || 'present';
                    return (
                      <tr key={student.id} className="hover:bg-panel-hover/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-primary">
                          {student.usn}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-7 h-7 rounded-full object-cover border border-border"
                            />
                            <span className="font-bold text-main">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-dim">
                          {student.department} • Sem {student.semester}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(student.id, 'present')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                status === 'present'
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-panel-hover text-dim hover:text-emerald-500 border border-border'
                              }`}
                            >
                              <CheckCircle size={13} /> Present
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student.id, 'absent')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                status === 'absent'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-panel-hover text-dim hover:text-red-500 border border-border'
                              }`}
                            >
                              <XCircle size={13} /> Absent
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student.id, 'leave')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                status === 'leave'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'bg-panel-hover text-dim hover:text-amber-500 border border-border'
                              }`}
                            >
                              <Clock size={13} /> Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-dim">
                Present: <strong className="text-emerald-500">{Object.values(rosterStatus).filter(s => s === 'present').length}</strong> | 
                Absent: <strong className="text-red-500">{Object.values(rosterStatus).filter(s => s === 'absent').length}</strong> | 
                Leave: <strong className="text-amber-500">{Object.values(rosterStatus).filter(s => s === 'leave').length}</strong>
              </span>

              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving Records...' : 'Save & Broadcast Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
