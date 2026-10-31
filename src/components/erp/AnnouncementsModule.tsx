import React, { useState } from 'react';
import { Announcement, ERPUserProfile, Course } from './types';
import { 
  Megaphone, 
  Send, 
  PlusCircle, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Bell 
} from 'lucide-react';
import { ERPStorage } from '../../data/erpData';

interface AnnouncementsModuleProps {
  currentUser: ERPUserProfile;
  announcements: Announcement[];
  courses: Course[];
  onAnnouncementsUpdated?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({
  currentUser,
  announcements,
  courses,
  onAnnouncementsUpdated,
  showToast
}) => {
  const isFacultyOrAdmin = currentUser.role === 'faculty' || currentUser.role === 'admin';
  const [filterTarget, setFilterTarget] = useState<'all' | 'department' | 'course'>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'all' | 'department' | 'course'>('all');
  const [targetDepartment, setTargetDepartment] = useState(currentUser.department || 'CSE');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?.id || 'crs-21cs61');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);

  // Filtered announcements
  const filtered = announcements.filter(a => {
    if (filterTarget === 'all') return true;
    return a.target === filterTarget;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both a title and announcement content.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newAnn: Announcement = {
        id: `anc-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        target,
        targetDepartment: target === 'department' ? targetDepartment : undefined,
        targetCourseId: target === 'course' ? targetCourseId : undefined,
        priority,
        authorRole: currentUser.role === 'admin' ? 'admin' : 'faculty',
        authorName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        readBy: [currentUser.id]
      };

      ERPStorage.addAnnouncement(newAnn);
      setSubmitting(false);
      setShowNewModal(false);
      setTitle('');
      setContent('');
      showToast(`Announcement published and broadcasted to ${target.toUpperCase()}!`, 'success');
      if (onAnnouncementsUpdated) onAnnouncementsUpdated();
    }, 500);
  };

  const handleMarkRead = (id: string) => {
    ERPStorage.markAnnouncementRead(id, currentUser.id);
    if (onAnnouncementsUpdated) onAnnouncementsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-tight text-main flex items-center gap-2">
            <Megaphone size={18} className="text-brand-primary" /> Campus Announcements & Circulars
          </h3>
          <p className="text-xs text-dim mt-0.5">
            Official broadcasts from the Examination Cell, Dean, and Department Faculty.
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <PlusCircle size={15} /> Post Announcement
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setFilterTarget('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterTarget === 'all'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          All Circulars ({announcements.length})
        </button>
        <button
          onClick={() => setFilterTarget('department')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterTarget === 'department'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Department Circulars
        </button>
        <button
          onClick={() => setFilterTarget('course')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterTarget === 'course'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-panel text-dim hover:text-main'
          }`}
        >
          Course Specific
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-dim bg-panel rounded-2xl border border-border text-xs">
            No announcements found under this filter.
          </div>
        ) : (
          filtered.map(item => {
            const isRead = item.readBy.includes(currentUser.id);
            return (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                className={`p-5 rounded-2xl bg-panel border transition-all ${
                  isRead ? 'border-border' : 'border-brand-primary/40 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                      item.priority === 'urgent'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-panel-hover text-dim border border-border">
                      Target: {item.target.toUpperCase()} {item.targetDepartment ? `(${item.targetDepartment})` : ''}
                    </span>
                  </div>

                  <span className="text-xs text-dim">{item.date}</span>
                </div>

                <h4 className="text-base font-bold text-main leading-snug mb-2">
                  {item.title}
                </h4>

                <p className="text-xs text-dim leading-relaxed mb-4">
                  {item.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-dim">
                  <span>Authorized by: <strong className="text-main">{item.authorName}</strong></span>
                  {!isRead && (
                    <span className="text-brand-primary font-bold text-xs">● New (Unread)</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Announcement Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-panel border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-black uppercase text-main flex items-center gap-2">
                <Megaphone size={16} className="text-brand-primary" /> Broadcast New Circular
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-dim hover:text-main p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Audience Target</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'department', 'course'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTarget(t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        target === t
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-border bg-panel-hover text-dim'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {target === 'department' && (
                <div>
                  <label className="text-[10px] font-black uppercase text-dim block mb-1">Target Department</label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  >
                    {['CSE', 'ISE', 'AI/ML', 'ECE', 'CIVIL', 'MECH'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {target === 'course' && (
                <div>
                  <label className="text-[10px] font-black uppercase text-dim block mb-1">Target Course</label>
                  <select
                    value={targetCourseId}
                    onChange={(e) => setTargetCourseId(e.target.value)}
                    className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Priority</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-main">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === 'normal'}
                      onChange={() => setPriority('normal')}
                    /> Normal
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-500">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === 'urgent'}
                      onChange={() => setPriority('urgent')}
                    /> Urgent Flag
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Lab Practical Valuations"
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs text-main outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Circular Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter complete circular notice or instruction..."
                  className="w-full bg-panel-hover border border-border rounded-xl p-3 text-xs text-main outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl bg-panel-hover text-dim text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={13} /> {submitting ? 'Publishing...' : 'Broadcast Circular'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
