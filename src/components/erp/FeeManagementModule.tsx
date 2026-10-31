import React, { useState } from 'react';
import { FeeRecord, FeePayment, ERPUserProfile } from './types';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Building2, 
  History, 
  Send, 
  X, 
  Printer, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ERPStorage, INITIAL_STUDENTS } from '../../data/erpData';

interface FeeManagementModuleProps {
  currentUser: ERPUserProfile;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onFeeUpdated?: () => void;
}

export const FeeManagementModule: React.FC<FeeManagementModuleProps> = ({
  currentUser,
  showToast,
  onFeeUpdated
}) => {
  const isAdmin = currentUser.role === 'admin';
  const studentId = currentUser.role === 'student' ? currentUser.id : 'std-001';

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => ERPStorage.getFeeRecords());
  const [activeTab, setActiveTab] = useState<'myFees' | 'defaulters' | 'collectionReport'>(
    isAdmin ? 'defaulters' : 'myFees'
  );

  // Current student fee
  const currentStudentFee = feeRecords.find(f => f.studentId === studentId) || feeRecords[0];

  // Pay Now Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(currentStudentFee?.pendingAmount || 32000);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('aarav.sharma@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // Admin collection metrics
  const totalExpectedAll = feeRecords.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollectedAll = feeRecords.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPendingAll = feeRecords.reduce((acc, f) => acc + f.pendingAmount, 0);
  const collectionPercentage = totalExpectedAll > 0 
    ? ((totalCollectedAll / totalExpectedAll) * 100).toFixed(1) 
    : '0';

  const defaulters = feeRecords.filter(f => f.pendingAmount > 0);

  // Handle Mock Payment Submission
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      showToast('Please enter a valid amount greater than ₹0.', 'error');
      return;
    }
    if (payAmount > currentStudentFee.pendingAmount) {
      showToast(`Amount cannot exceed the pending balance of ₹${currentStudentFee.pendingAmount.toLocaleString('en-IN')}`, 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const methodName = paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking (SBI)';
      const updatedRecord = ERPStorage.addFeePayment(studentId, payAmount, methodName);
      
      setFeeRecords(ERPStorage.getFeeRecords());
      setIsProcessing(false);
      setShowPayModal(false);
      showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} successful! Receipt generated.`, 'success');
      
      // Auto open newly generated receipt
      if (updatedRecord.payments.length > 0) {
        setSelectedReceipt(updatedRecord.payments[0]);
      }
      if (onFeeUpdated) onFeeUpdated();
    }, 1200);
  };

  const handleSendReminder = (studentName: string) => {
    showToast(`Fee reminder SMS & Email notification sent to ${studentName}!`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Tab bar for Admin */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('defaulters')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'defaulters'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-panel text-dim hover:text-main'
            }`}
          >
            Fee Defaulters List ({defaulters.length})
          </button>
          <button
            onClick={() => setActiveTab('collectionReport')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'collectionReport'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-panel text-dim hover:text-main'
            }`}
          >
            Collection Analytics Report
          </button>
          <button
            onClick={() => setActiveTab('myFees')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'myFees'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-panel text-dim hover:text-main'
            }`}
          >
            Student Fee Portal Preview
          </button>
        </div>
      )}

      {/* Admin View: Defaulters List */}
      {isAdmin && activeTab === 'defaulters' && (
        <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-main flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Pending Fee Defaulters Console
              </h3>
              <p className="text-xs text-dim mt-0.5">
                Students with unpaid semester fee balances past due dates.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Outstanding</span>
              <p className="text-xl font-black text-red-500">
                ₹{totalPendingAll.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">USN</th>
                  <th className="py-3 px-3">Term</th>
                  <th className="py-3 px-3 text-right">Total Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending Dues</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {defaulters.map(def => {
                  const s = INITIAL_STUDENTS.find(item => item.id === def.studentId) || INITIAL_STUDENTS[0];
                  return (
                    <tr key={def.id} className="hover:bg-panel-hover/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-main">{s.name}</td>
                      <td className="py-3 px-3 font-mono text-brand-primary font-bold">{s.usn}</td>
                      <td className="py-3 px-3 text-dim">{def.term}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{def.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right text-emerald-500 font-bold">₹{def.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right text-red-500 font-black">₹{def.pendingAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-dim">{def.dueDate}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleSendReminder(s.name)}
                          className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 border border-amber-500/20 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Send size={11} /> Send Notice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin View: Collection Report */}
      {isAdmin && activeTab === 'collectionReport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Invoiced</span>
              <h3 className="text-2xl font-black text-main mt-1">₹{totalExpectedAll.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-dim">Academic Year 2025-26</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Collected</span>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">₹{totalCollectedAll.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-dim">Direct Bank & Gateway</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Pending Outstanding</span>
              <h3 className="text-2xl font-black text-red-500 mt-1">₹{totalPendingAll.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-dim">{defaulters.length} Accounts Pending</p>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-dim">Recovery Rate</span>
              <h3 className="text-2xl font-black text-brand-primary mt-1">{collectionPercentage}%</h3>
              <p className="text-[10px] text-dim">Target: 95% by May 30</p>
            </div>
          </div>
        </div>
      )}

      {/* Student/Parent View: Fee Structure & Payment Portal */}
      {(!isAdmin || activeTab === 'myFees') && currentStudentFee && (
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Total Invoiced Fee</span>
                <h3 className="text-2xl font-black text-main mt-1">
                  ₹{currentStudentFee.totalAmount.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-dim">{currentStudentFee.term}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-panel-hover text-dim flex items-center justify-center">
                <Building2 size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Amount Cleared</span>
                <h3 className="text-2xl font-black text-emerald-500 mt-1">
                  ₹{currentStudentFee.paidAmount.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified In Accounts Ledger
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dim">Pending Balance</span>
                <h3 className={`text-2xl font-black mt-1 ${
                  currentStudentFee.pendingAmount > 0 ? 'text-red-500' : 'text-emerald-500'
                }`}>
                  ₹{currentStudentFee.pendingAmount.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-dim">Due by {currentStudentFee.dueDate}</p>
              </div>
              <div>
                {currentStudentFee.pendingAmount > 0 ? (
                  <button
                    onClick={() => {
                      setPayAmount(currentStudentFee.pendingAmount);
                      setShowPayModal(true);
                    }}
                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CreditCard size={14} /> Pay Now
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                    No Dues
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pending Banner Alert if pending */}
          {currentStudentFee.pendingAmount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                <span className="text-xs text-dim">
                  A pending balance of <strong className="text-main">₹{currentStudentFee.pendingAmount.toLocaleString('en-IN')}</strong> is due on or before <strong className="text-main">{currentStudentFee.dueDate}</strong> to avoid late fee penalties.
                </span>
              </div>
              <button
                onClick={() => {
                  setPayAmount(currentStudentFee.pendingAmount);
                  setShowPayModal(true);
                }}
                className="px-4 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold shrink-0 hover:scale-105 transition-all shadow-md"
              >
                Clear Balance
              </button>
            </div>
          )}

          {/* Fee Breakdown Structure Table */}
          <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
              <FileText size={16} className="text-brand-primary" /> Itemized Semester Fee Structure
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                    <th className="py-2.5">Fee Component</th>
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 font-bold text-main">Tuition Fee</td>
                    <td className="py-2.5 text-dim">Academic instruction, lectures, and semester curriculum</td>
                    <td className="py-2.5 text-right font-medium">₹{currentStudentFee.tuitionFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-main">Laboratory & Software Fee</td>
                    <td className="py-2.5 text-dim">Cloud lab environments, AWS workstations, practical kits</td>
                    <td className="py-2.5 text-right font-medium">₹{currentStudentFee.labFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-main">Autonomous Examination Fee</td>
                    <td className="py-2.5 text-dim">Question papers, answer scripts, valuation, and SEE grade sheets</td>
                    <td className="py-2.5 text-right font-medium">₹{currentStudentFee.examFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-main">Library & Digital Repository</td>
                    <td className="py-2.5 text-dim">IEEE e-journal subscriptions, textbook lending, digital study hub</td>
                    <td className="py-2.5 text-right font-medium">₹{currentStudentFee.libraryFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-main">Campus Development Fee</td>
                    <td className="py-2.5 text-dim">High speed campus Wi-Fi, smart classrooms, sports & recreation</td>
                    <td className="py-2.5 text-right font-medium">₹{currentStudentFee.developmentFee.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-black text-xs text-main">
                    <td colSpan={2} className="py-3 uppercase">Total Invoiced Amount</td>
                    <td className="py-3 text-right text-brand-primary font-black text-sm">
                      ₹{currentStudentFee.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment History & Downloadable Receipts */}
          <div className="p-6 rounded-2xl bg-panel border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
              <History size={16} className="text-brand-primary" /> Payment Transactions & Receipts
            </h3>

            {currentStudentFee.payments.length === 0 ? (
              <p className="text-xs text-dim py-4 text-center">No payment transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-dim">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Receipt #</th>
                      <th className="py-2.5">Transaction ID</th>
                      <th className="py-2.5">Payment Method</th>
                      <th className="py-2.5 text-right">Amount Paid</th>
                      <th className="py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentStudentFee.payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-panel-hover/50">
                        <td className="py-2.5 text-dim">{pay.paymentDate}</td>
                        <td className="py-2.5 font-mono font-bold text-brand-primary">{pay.receiptNumber}</td>
                        <td className="py-2.5 font-mono text-dim">{pay.transactionId}</td>
                        <td className="py-2.5 text-main font-medium">{pay.method}</td>
                        <td className="py-2.5 text-right font-black text-emerald-500">₹{pay.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => setSelectedReceipt(pay)}
                            className="px-3 py-1 rounded-lg bg-panel-hover hover:bg-brand-primary hover:text-white border border-border text-xs font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            <Download size={12} /> Download Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mock "Pay Now" Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleProcessPayment}
            className="bg-panel border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-brand-primary" />
                <h3 className="text-sm font-black uppercase text-main">NCET Fee Payment Gateway</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-dim hover:text-main p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">
                Payment Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-main">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  max={currentStudentFee.pendingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-panel-hover border border-border rounded-xl py-2.5 pl-8 pr-4 text-base font-black text-main outline-none focus:border-brand-primary"
                />
              </div>
              <span className="text-[10px] text-dim mt-1 block">
                Pending Balance: ₹{currentStudentFee.pendingAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-dim block">
                Choose Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                      : 'border-border bg-panel-hover text-dim hover:text-main'
                  }`}
                >
                  <QrCode size={18} /> UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                      : 'border-border bg-panel-hover text-dim hover:text-main'
                  }`}
                >
                  <CreditCard size={18} /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                      : 'border-border bg-panel-hover text-dim hover:text-main'
                  }`}
                >
                  <Building2 size={18} /> Net Banking
                </button>
              </div>
            </div>

            {/* Dynamic fields */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-xl bg-panel-hover border border-border space-y-3 text-center">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl border border-gray-300 flex items-center justify-center">
                  <QrCode size={72} className="text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-main">Scan QR with GPay / PhonePe / Paytm</p>
                  <p className="text-[10px] text-dim">Or pay using VPA:</p>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1 w-full text-center bg-panel border border-border rounded-lg py-1.5 text-xs font-mono font-bold text-brand-primary outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-black uppercase text-dim block mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4532 •••• •••• 9821"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-panel-hover border border-border rounded-xl py-2 px-3 text-xs font-mono text-main outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-dim block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="08/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-panel-hover border border-border rounded-xl py-2 px-3 text-xs text-main outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-dim block mb-1">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-panel-hover border border-border rounded-xl py-2 px-3 text-xs text-main outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-2 text-xs">
                <label className="text-[10px] font-black uppercase text-dim block">Popular Banks</label>
                <div className="grid grid-cols-2 gap-2">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                    <div key={bank} className="p-2.5 rounded-lg border border-border bg-panel-hover text-main font-bold cursor-pointer hover:border-brand-primary text-xs flex items-center gap-2">
                      <Building2 size={14} className="text-brand-primary" /> {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 rounded-xl bg-panel-hover text-dim text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Processing Transaction...' : `Confirm & Pay ₹${payAmount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Styled Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-panel border border-border rounded-3xl max-w-xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-black uppercase text-main">Nagarjuna College of Engg & Tech</h3>
                <p className="text-[10px] text-dim uppercase tracking-widest">Accounts & Finance Cell • Official E-Receipt</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-dim hover:text-main p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Payment Status</span>
                <h4 className="text-lg font-black text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 size={18} /> SUCCESSFUL
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-dim">Receipt Number</span>
                <p className="text-xs font-mono font-black text-main">{selectedReceipt.receiptNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-dim">Student Name:</span> <strong className="text-main block">{currentUser.name || 'Aarav Sharma'}</strong></div>
              <div><span className="text-dim">USN:</span> <strong className="text-brand-primary font-mono block">{currentUser.usn || '1NC22CS045'}</strong></div>
              <div><span className="text-dim">Transaction Reference:</span> <strong className="text-main font-mono block">{selectedReceipt.transactionId}</strong></div>
              <div><span className="text-dim">Payment Date:</span> <strong className="text-main block">{selectedReceipt.paymentDate}</strong></div>
              <div><span className="text-dim">Payment Mode:</span> <strong className="text-main block">{selectedReceipt.method}</strong></div>
              <div><span className="text-dim">Term / Academic Year:</span> <strong className="text-main block">Semester 6 (2025-2026)</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-panel-hover border border-border flex items-center justify-between">
              <span className="text-xs font-bold text-main uppercase">Amount Received</span>
              <span className="text-2xl font-black text-brand-primary">
                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-dim">Computer generated official digital receipt. No signature required.</span>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-md"
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
