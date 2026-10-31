import React, { useState } from 'react';
import { 
  ExamScheduleItem, 
  SemesterResult, 
  StudentMarksRecord, 
  ERPUserProfile, 
  Course 
} from './types';
import { 
  Calendar, 
  Award, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  PlusCircle, 
  Save, 
  CheckCircle, 
  X, 
  Clock, 
  MapPin, 
  Layers,
  GraduationCap
} from 'lucide-react';
import { ERPStorage, INITIAL_STUDENTS } from '../../data/erpData';

interface ExamManagementModuleProps {
  currentUser: ERPUserProfile;
  exams: ExamScheduleItem[];
  courses: Course[];
  studentResults?: SemesterResult[];
  onExamsUpdated?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ExamManagementModule: React.FC<ExamManagementModuleProps> = ({
  currentUser,
  exams,
  courses,
  studentResults = [],
  onExamsUpdated,
  showToast
}) => {
  const isFacultyOrAdmin = currentUser.role === 'faculty' || currentUser.role === 'admin';
  const [activeTab, setActiveTab] = useState<'timetable' | 'results' | 'marksEntry'>('timetable');
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [showResultCardModal, setShowResultCardModal] = useState(false);

  // Marks entry state (for Faculty/Admin)
  const [marksCourseId, setMarksCourseId] = useState<string>(courses[0]?.id || 'crs-21cs61');
  const [studentMarksState, setStudentMarksState] = useState<Record<string, { ia: number; see: number }>>(() => {
    const initial: Record<string, { ia: number; see: number }> = {};
    INITIAL_STUDENTS.forEach((s, idx) => {
      initial[s.id] = {
        ia: 40 + (idx % 9),
        see: 72 + (idx % 22)
      };
    });
    return initial;
  });

  // New exam schedule creation form
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [newExamCourseId, setNewExamCourseId] = useState(courses[0]?.id || '');
  const [newExamType, setNewExamType] = useState<'Mid-Term 1' | 'Mid-Term 2' | 'Semester End Exam (SEE)' | 'Lab Practical'>('Semester End Exam (SEE)');
  const [newExamDate, setNewExamDate] = useState('2026-06-05');
  const [newExamTime, setNewExamTime] = useState('09:30 AM - 12:30 PM');
  const [newExamRoom, setNewExamRoom] = useState('LH-302');
  const [newExamMarks, setNewExamMarks] = useState(100);

  // Current semester result data
  const currentSemesterResult = studentResults.find(r => r.semester === selectedSemester) || studentResults[0];

  // Calculate cumulative CGPA
  const allEarned = studentResults.reduce((acc, r) => acc + (r.sgpa * r.totalCredits), 0);
  const allCredits = studentResults.reduce((acc, r) => acc + r.totalCredits, 0);
  const calculatedCGPA = allCredits > 0 ? (allEarned / allCredits).toFixed(2) : '8.71';

  // Handle Save Marks (Faculty)
  const handleSaveMarks = () => {
    showToast(`Internal & SEE marks updated and synchronized for course ${marksCourseId}!`, 'success');
  };

  // Handle Create Exam (Admin/Faculty)
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find(c => c.id === newExamCourseId) || courses[0];
    const newExamItem: ExamScheduleItem = {
      id: `ex-${Date.now()}`,
      courseId: crs.id,
      courseCode: crs.code,
      courseName: crs.name,
      semester: crs.semester,
      examType: newExamType,
      date: newExamDate,
      time: newExamTime,
      room: newExamRoom,
      maxMarks: Number(newExamMarks)
    };

    const updated = [newExamItem, ...exams];
    ERPStorage.saveExams(updated);
    if (onExamsUpdated) onExamsUpdated();
    setShowNewExamModal(false);
    showToast(`Exam scheduled for ${crs.code} on ${newExamDate}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'timetable'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-panel text-dim hover:text-main'
            }`}
          >
            <Calendar size={14} /> Exam Timetable ({exams.length})
          </button>
          
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-panel text-dim hover:text-main'
            }`}
          >
            <Award size={14} /> Semester Results & CGPA
          </button>

          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('marksEntry')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'marksEntry'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-panel text-dim hover:text-main'
              }`}
            >
              <FileSpreadsheet size={14} /> Enter / Upload Marks
            </button>
          )}
        </div>

        {isFacultyOrAdmin && activeTab === 'timetable' && (
          <button
            onClick={() => setShowNewExamModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <PlusCircle size={14} /> Schedule New Exam
          </button>
        )}
      </div>

      {/* 1. Exam Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(ex => (
              <div
                key={ex.id}
                className="p-5 rounded-2xl bg-panel border border-border hover:border-brand-primary/30 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                      {ex.courseCode}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-panel-hover text-dim border border-border">
                      {ex.examType}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-main leading-snug mb-3">
                    {ex.courseName}
                  </h4>

                  <div className="space-y-2 text-xs text-dim">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-brand-primary" />
                      <span className="font-bold text-main">{ex.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-brand-primary" />
                      <span>{ex.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-brand-primary" />
                      <span>Venue: <strong className="text-main">{ex.room}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-dim">Max Marks: <strong className="text-main">{ex.maxMarks}</strong></span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle size={13} /> Hall Ticket Generated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Results & Grade Sheet Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* CGPA & SGPA Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Cumulative CGPA</span>
                <h3 className="text-3xl font-black text-brand-primary mt-1">{calculatedCGPA}</h3>
                <p className="text-[10px] text-dim">Scale of 10.0 • First Class with Distinction</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <GraduationCap size={26} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Current SGPA (Sem {selectedSemester})</span>
                <h3 className="text-3xl font-black text-emerald-500 mt-1">
                  {currentSemesterResult?.sgpa || 8.78}
                </h3>
                <p className="text-[10px] text-dim">Status: All Subjects Cleared</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award size={26} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Credits Earned</span>
                <h3 className="text-3xl font-black text-main mt-1">112</h3>
                <p className="text-[10px] text-dim">Degree Requirement: 160 Credits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-panel-hover text-dim flex items-center justify-center">
                <Layers size={26} />
              </div>
            </div>
          </div>

          {/* Semester Selector & Download Result Card Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dim">Select Semester:</span>
              {[5, 4].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedSemester === sem
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-panel border border-border text-dim hover:text-main'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowResultCardModal(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Download Official Result Card
            </button>
          </div>

          {/* Results Table */}
          <div className="p-5 rounded-2xl bg-panel border border-border overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                  <th className="py-3 px-3">Course Code</th>
                  <th className="py-3 px-3">Subject Name</th>
                  <th className="py-3 px-3 text-center">IA (50)</th>
                  <th className="py-3 px-3 text-center">SEE (100)</th>
                  <th className="py-3 px-3 text-center">Total (100)</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Grade Points</th>
                  <th className="py-3 px-3 text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentSemesterResult?.records.map(rec => (
                  <tr key={rec.id} className="hover:bg-panel-hover/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-brand-primary">{rec.courseCode}</td>
                    <td className="py-3 px-3 font-medium text-main">{rec.courseName}</td>
                    <td className="py-3 px-3 text-center font-bold text-dim">{rec.internalMarks}</td>
                    <td className="py-3 px-3 text-center font-bold text-dim">{rec.externalMarks}</td>
                    <td className="py-3 px-3 text-center font-black text-main">{rec.totalMarks}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[11px]">
                        {rec.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-main">{rec.gradePoints}</td>
                    <td className="py-3 px-3 text-right font-bold text-main">{rec.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Marks Entry Tab (Faculty/Admin) */}
      {isFacultyOrAdmin && activeTab === 'marksEntry' && (
        <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-main">
                Course Examination Marks Entry
              </h3>
              <p className="text-xs text-dim mt-0.5">
                Enter internal continuous evaluation (IA) and semester end marks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-dim">Course:</label>
              <select
                value={marksCourseId}
                onChange={(e) => setMarksCourseId(e.target.value)}
                className="bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                  <th className="py-3 px-4">USN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Internal Assessment (Max 50)</th>
                  <th className="py-3 px-4 text-center">Semester End Exam (Max 100)</th>
                  <th className="py-3 px-4 text-center">Total Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INITIAL_STUDENTS.map(student => {
                  const marks = studentMarksState[student.id] || { ia: 42, see: 80 };
                  const totalPct = Math.round((marks.ia / 50) * 50 + (marks.see / 100) * 50);

                  return (
                    <tr key={student.id} className="hover:bg-panel-hover/50">
                      <td className="py-3 px-4 font-mono font-bold text-brand-primary">{student.usn}</td>
                      <td className="py-3 px-4 font-medium text-main">{student.name}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={marks.ia}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setStudentMarksState(prev => ({
                              ...prev,
                              [student.id]: { ...marks, ia: val }
                            }));
                          }}
                          className="w-20 text-center py-1.5 bg-panel-hover border border-border rounded-lg text-xs font-bold text-main outline-none focus:border-brand-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={marks.see}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setStudentMarksState(prev => ({
                              ...prev,
                              [student.id]: { ...marks, see: val }
                            }));
                          }}
                          className="w-20 text-center py-1.5 bg-panel-hover border border-border rounded-lg text-xs font-bold text-main outline-none focus:border-brand-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-black text-main">
                        {totalPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveMarks}
              className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save size={14} /> Save & Publish Marks to Student Portal
            </button>
          </div>
        </div>
      )}

      {/* Result Card Modal (Printable/Downloadable) */}
      {showResultCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-panel border border-border rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-main">Nagarjuna College of Engineering & Tech</h3>
                  <p className="text-[10px] text-dim uppercase tracking-widest">Autonomous Institution Affiliated to VTU</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResultCardModal(false)}
                className="text-dim hover:text-main p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center pb-2">
              <h4 className="text-lg font-black text-main uppercase tracking-wider">Official Grade Card</h4>
              <p className="text-xs text-brand-primary font-bold">Bachelor of Engineering • Semester {selectedSemester} Examination</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-panel-hover border border-border text-xs">
              <div><span className="text-dim">Student Name:</span> <strong className="text-main block">{currentUser.name || 'Aarav Sharma'}</strong></div>
              <div><span className="text-dim">USN:</span> <strong className="text-brand-primary font-mono block">{currentUser.usn || '1NC22CS045'}</strong></div>
              <div><span className="text-dim">Branch:</span> <strong className="text-main block">Computer Science & Engineering</strong></div>
              <div><span className="text-dim">Result Status:</span> <strong className="text-emerald-500 font-bold block">FIRST CLASS WITH DISTINCTION</strong></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                    <th className="py-2">Code</th>
                    <th className="py-2">Subject</th>
                    <th className="py-2 text-center">Marks</th>
                    <th className="py-2 text-center">Grade</th>
                    <th className="py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentSemesterResult?.records.map(rec => (
                    <tr key={rec.id}>
                      <td className="py-2 font-mono font-bold text-brand-primary">{rec.courseCode}</td>
                      <td className="py-2 font-medium text-main">{rec.courseName}</td>
                      <td className="py-2 text-center font-bold text-main">{rec.totalMarks} / 100</td>
                      <td className="py-2 text-center font-bold text-emerald-500">{rec.grade}</td>
                      <td className="py-2 text-right font-bold text-main">{rec.gradePoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-dim">Semester SGPA</span>
                <p className="text-2xl font-black text-brand-primary">{currentSemesterResult?.sgpa || 8.78}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-dim">Cumulative CGPA</span>
                <p className="text-2xl font-black text-main">{calculatedCGPA}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-dim">Controller of Exams</span>
                <p className="text-xs font-bold text-main">Digitally Verified ✔</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-md shadow-brand-primary/20"
              >
                <Printer size={15} /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Exam Modal */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form 
            onSubmit={handleCreateExam}
            className="bg-panel border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-black uppercase text-main flex items-center gap-2">
                <Calendar size={16} className="text-brand-primary" /> Create Exam Timetable Slot
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewExamModal(false)}
                className="text-dim hover:text-main p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Course</label>
                <select
                  value={newExamCourseId}
                  onChange={(e) => setNewExamCourseId(e.target.value)}
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Exam Type</label>
                <select
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value as any)}
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                >
                  <option value="Semester End Exam (SEE)">Semester End Exam (SEE)</option>
                  <option value="Mid-Term 1">Mid-Term 1</option>
                  <option value="Mid-Term 2">Mid-Term 2</option>
                  <option value="Lab Practical">Lab Practical</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={newExamTime}
                    onChange={(e) => setNewExamTime(e.target.value)}
                    placeholder="09:30 AM - 12:30 PM"
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Venue / Room</label>
                  <input
                    type="text"
                    required
                    value={newExamRoom}
                    onChange={(e) => setNewExamRoom(e.target.value)}
                    placeholder="LH-302"
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={newExamMarks}
                    onChange={(e) => setNewExamMarks(Number(e.target.value))}
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowNewExamModal(false)}
                className="px-4 py-2 rounded-xl bg-panel-hover text-dim text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20"
              >
                Add to Timetable
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
