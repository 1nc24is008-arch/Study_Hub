import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Announcement } from './types';

interface NotificationBellProps {
  announcements: Announcement[];
  currentUserId: string;
  lowAttendanceWarning?: boolean;
  pendingFeeWarning?: boolean;
  onMarkRead: (id: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  announcements,
  currentUserId,
  lowAttendanceWarning,
  pendingFeeWarning,
  onMarkRead
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = announcements.filter(a => !a.readBy.includes(currentUserId)).length 
    + (lowAttendanceWarning ? 1 : 0) 
    + (pendingFeeWarning ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-panel border border-border hover:border-brand-primary/40 text-main transition-all flex items-center justify-center group"
        title="Notifications"
      >
        <Bell size={18} className="text-main group-hover:text-brand-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md shadow-red-500/30">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-panel border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-panel-hover/50">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-brand-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-main">Notifications</h4>
                <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-dim hover:text-main p-1 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
              {/* Critical warnings */}
              {lowAttendanceWarning && (
                <div className="p-3.5 bg-red-500/10 border-l-4 border-red-500 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">Attendance Alert</p>
                    <p className="text-[11px] text-dim leading-relaxed">
                      Your attendance in <span className="font-semibold text-main">Full Stack Web Architecture</span> is 67.8% (below the required 75%).
                    </p>
                  </div>
                </div>
              )}

              {pendingFeeWarning && (
                <div className="p-3.5 bg-amber-500/10 border-l-4 border-amber-500 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Fee Due Reminder</p>
                    <p className="text-[11px] text-dim leading-relaxed">
                      Pending balance of ₹32,000 for Semester 6 is due by May 15, 2026.
                    </p>
                  </div>
                </div>
              )}

              {announcements.length === 0 && !lowAttendanceWarning && !pendingFeeWarning ? (
                <div className="p-8 text-center text-dim text-xs">
                  <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                  You are completely caught up! No unread notifications.
                </div>
              ) : (
                announcements.map((ann) => {
                  const isRead = ann.readBy.includes(currentUserId);
                  return (
                    <div
                      key={ann.id}
                      onClick={() => onMarkRead(ann.id)}
                      className={`p-3.5 hover:bg-panel-hover/50 cursor-pointer transition-colors ${
                        isRead ? 'opacity-70' : 'bg-brand-primary/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          ann.priority === 'urgent'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        }`}>
                          {ann.priority}
                        </span>
                        <span className="text-[10px] text-dim">{ann.date}</span>
                      </div>
                      <h5 className="text-xs font-bold text-main leading-snug mb-1">{ann.title}</h5>
                      <p className="text-[11px] text-dim line-clamp-2 leading-relaxed">{ann.content}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[9px] text-dim font-medium">
                        <span>By: {ann.authorName}</span>
                        {!isRead && <span className="text-brand-primary font-bold">● Unread</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
