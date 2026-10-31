import React, { useState } from 'react';
import { Grievance, ERPUserProfile } from './types';
import { 
  LifeBuoy, 
  Send, 
  Paperclip, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  PlusCircle, 
  X, 
  ShieldAlert 
} from 'lucide-react';
import { ERPStorage } from '../../data/erpData';

interface GrievanceModuleProps {
  currentUser: ERPUserProfile;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onGrievanceUpdated?: () => void;
}

export const GrievanceModule: React.FC<GrievanceModuleProps> = ({
  currentUser,
  showToast,
  onGrievanceUpdated
}) => {
  const isAdmin = currentUser.role === 'admin';
  const studentId = currentUser.role === 'student' ? currentUser.id : 'std-001';

  const [grievances, setGrievances] = useState<Grievance[]>(() => ERPStorage.getGrievances());
  const [selectedTicket, setSelectedTicket] = useState<Grievance | null>(null);

  // Form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [category, setCategory] = useState<Grievance['category']>('Academic');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin response state
  const [adminReplyText, setAdminReplyText] = useState('');
  const [targetStatus, setTargetStatus] = useState<'Submitted' | 'In Review' | 'Resolved'>('In Review');

  // Filter list based on role
  const displayGrievances = isAdmin 
    ? grievances 
    : grievances.filter(g => g.studentId === studentId);

  // Handle Submit New Grievance
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please fill out both the subject and description.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const ticketId = `NCET-GRV-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newGrievance: Grievance = {
        id: `grv-${Date.now()}`,
        ticketId,
        studentId,
        studentName: currentUser.name || 'Aarav Sharma',
        studentUSN: currentUser.usn || '1NC22CS045',
        department: currentUser.department || 'CSE',
        category,
        subject: subject.trim(),
        description: description.trim(),
        attachmentName: attachmentName ? attachmentName : undefined,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      };

      ERPStorage.addGrievance(newGrievance);
      setGrievances(ERPStorage.getGrievances());
      setSubmitting(false);
      setShowNewModal(false);
      setSubject('');
      setDescription('');
      setAttachmentName('');
      showToast(`Grievance ticket created successfully! Ticket ID: ${ticketId}`, 'success');
      if (onGrievanceUpdated) onGrievanceUpdated();
    }, 600);
  };

  // Handle Admin Status & Response
  const handleAdminUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const updated = ERPStorage.updateGrievanceStatus(
      selectedTicket.ticketId,
      targetStatus,
      adminReplyText.trim() ? adminReplyText.trim() : undefined
    );

    if (updated) {
      setGrievances(ERPStorage.getGrievances());
      setSelectedTicket(updated);
      setAdminReplyText('');
      showToast(`Ticket ${selectedTicket.ticketId} updated to ${targetStatus}!`, 'success');
      if (onGrievanceUpdated) onGrievanceUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Action */}
      <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-tight text-main flex items-center gap-2">
            <LifeBuoy size={18} className="text-brand-primary" /> Student Grievance & Redressal Cell
          </h3>
          <p className="text-xs text-dim mt-0.5">
            Transparent confidential resolution mechanism for academic, hostel, fee, and infrastructural concerns.
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <PlusCircle size={15} /> Lodge New Grievance
          </button>
        )}
      </div>

      {/* Grid: Tickets List & Active Ticket Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-dim pb-1">
            <span>{isAdmin ? 'All Student Tickets' : 'My Submitted Tickets'} ({displayGrievances.length})</span>
          </div>

          {displayGrievances.length === 0 ? (
            <div className="p-8 text-center text-dim bg-panel rounded-2xl border border-border text-xs">
              No grievances filed. Click "Lodge New Grievance" above if you have any issues.
            </div>
          ) : (
            displayGrievances.map(item => {
              const isSelected = selectedTicket?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedTicket(item);
                    setTargetStatus(item.status);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5 shadow-md shadow-brand-primary/5'
                      : 'border-border bg-panel hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-brand-primary">
                      {item.ticketId}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : item.status === 'In Review'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-main leading-snug line-clamp-1 mb-1">
                    {item.subject}
                  </h4>
                  <p className="text-[11px] text-dim line-clamp-2 mb-2">{item.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-dim border-t border-border/60 pt-2">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Thread & Timeline Column */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black text-brand-primary">{selectedTicket.ticketId}</span>
                    <span className="text-[10px] bg-panel-hover text-dim px-2 py-0.5 rounded border border-border font-bold">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-main leading-snug">{selectedTicket.subject}</h3>
                  <p className="text-[11px] text-dim mt-1">
                    Filed by <strong className="text-main">{selectedTicket.studentName}</strong> ({selectedTicket.studentUSN} • {selectedTicket.department})
                  </p>
                </div>

                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  selectedTicket.status === 'Resolved'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : selectedTicket.status === 'In Review'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* Status Tracking Timeline: Submitted > In Review > Resolved */}
              <div className="py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dim block mb-3">
                  Resolution Progress Workflow
                </span>
                <div className="relative flex items-center justify-between max-w-md mx-auto">
                  {/* Connecting Line */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-border -z-0" />
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-brand-primary transition-all duration-500 -z-0"
                    style={{
                      width: selectedTicket.status === 'Resolved' ? '85%' : selectedTicket.status === 'In Review' ? '45%' : '5%'
                    }}
                  />

                  {/* Stage 1: Submitted */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-black shadow-md">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-main mt-1">Submitted</span>
                  </div>

                  {/* Stage 2: In Review */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      selectedTicket.status === 'In Review' || selectedTicket.status === 'Resolved'
                        ? 'bg-brand-primary text-white'
                        : 'bg-panel-hover text-dim border border-border'
                    }`}>
                      {selectedTicket.status === 'Resolved' ? '✓' : '2'}
                    </div>
                    <span className="text-[10px] font-bold text-main mt-1">In Review</span>
                  </div>

                  {/* Stage 3: Resolved */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      selectedTicket.status === 'Resolved'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-panel-hover text-dim border border-border'
                    }`}>
                      {selectedTicket.status === 'Resolved' ? '✓' : '3'}
                    </div>
                    <span className="text-[10px] font-bold text-main mt-1">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Description & Attachment */}
              <div className="p-4 rounded-xl bg-panel-hover border border-border text-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-dim block">Grievance Details</span>
                <p className="text-main leading-relaxed">{selectedTicket.description}</p>
                {selectedTicket.attachmentName && (
                  <div className="flex items-center gap-2 pt-2 text-[11px] text-brand-primary font-medium">
                    <Paperclip size={13} />
                    <span>Attachment: {selectedTicket.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Responses Thread */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-dim block">
                  Communication Thread & Action Notes ({selectedTicket.responses.length})
                </span>

                {selectedTicket.responses.length === 0 ? (
                  <p className="text-xs text-dim italic">No responses recorded yet. Assigned committee is reviewing.</p>
                ) : (
                  selectedTicket.responses.map(resp => (
                    <div
                      key={resp.id}
                      className="p-3.5 rounded-xl bg-panel-hover/80 border border-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-brand-primary">{resp.authorName} ({resp.authorRole.toUpperCase()})</strong>
                        <span className="text-dim">{new Date(resp.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-main leading-relaxed">{resp.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Admin Action: Change Status & Post Reply */}
              {isAdmin && (
                <form onSubmit={handleAdminUpdate} className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 space-y-3">
                  <h4 className="text-xs font-black uppercase text-main">Redressal Action Console</h4>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-dim">Update Status:</label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as any)}
                      className="bg-panel border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-main outline-none focus:border-brand-primary"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-dim block mb-1">Official Response Message</label>
                    <textarea
                      rows={3}
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Enter official investigation update or resolution note for the student..."
                      className="w-full bg-panel border border-border rounded-xl p-3 text-xs text-main outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
                    >
                      <Send size={13} /> Update Status & Send Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[350px] p-8 flex flex-col items-center justify-center rounded-2xl bg-panel border border-border text-center text-dim text-xs">
              <MessageSquare size={36} className="text-brand-primary/40 mb-3" />
              <p className="font-bold text-main text-sm mb-1">Select a Ticket to View Details</p>
              <p>Click on any grievance from the list on the left to inspect timeline and updates.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Grievance Modal (Student) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSubmitGrievance}
            className="bg-panel border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-black uppercase text-main flex items-center gap-2">
                <LifeBuoy size={16} className="text-brand-primary" /> Lodge Student Grievance
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
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-brand-primary"
                >
                  <option value="Academic">Academic (Lectures, IA Marks, Syllabus)</option>
                  <option value="Examination">Examination & Result Discrepancy</option>
                  <option value="Fees & Accounts">Fees, Dues & Scholarships</option>
                  <option value="Hostel & Mess">Hostel, Mess & Transport</option>
                  <option value="Infrastructure">Infrastructure & Lab Equipment</option>
                  <option value="Harassment/Ragging">Anti-Ragging / Harassment Cell</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with IA-2 DBMS answer paper valuation"
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs text-main outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details, dates, course codes, or locations to assist the redressal committee..."
                  className="w-full bg-panel-hover border border-border rounded-xl p-3 text-xs text-main outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dim block mb-1">Supporting Document Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachmentName(f.name);
                  }}
                  className="w-full bg-panel-hover border border-border rounded-xl px-3 py-2 text-xs text-dim file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-brand-primary file:text-white"
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
                <Send size={13} /> {submitting ? 'Lodging Ticket...' : 'Submit Grievance'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
