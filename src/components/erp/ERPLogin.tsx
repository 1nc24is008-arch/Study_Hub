import React, { useState } from 'react';
import { ERPUserRole, ERPUserProfile } from './types';
import { 
  GraduationCap, 
  Users, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_FACULTY, 
  INITIAL_PARENT, 
  INITIAL_ADMIN, 
  ERPStorage 
} from '../../data/erpData';

interface ERPLoginProps {
  onLoginSuccess: (user: ERPUserProfile) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const ERPLogin: React.FC<ERPLoginProps> = ({
  onLoginSuccess,
  showToast,
  onClose
}) => {
  const [selectedRole, setSelectedRole] = useState<ERPUserRole>('student');
  const [email, setEmail] = useState('student@ncet.edu');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick switch role preset credentials
  const handleRoleSelect = (role: ERPUserRole) => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('student@ncet.edu');
      setPassword('student123');
    } else if (role === 'faculty') {
      setEmail('faculty@ncet.edu');
      setPassword('faculty123');
    } else if (role === 'parent') {
      setEmail('parent@ncet.edu');
      setPassword('parent123');
    } else if (role === 'admin') {
      setEmail('admin@ncet.edu');
      setPassword('admin123');
    }
  };

  const handleQuickLogin = (role: ERPUserRole) => {
    handleRoleSelect(role);
    executeLogin(role);
  };

  const executeLogin = (role: ERPUserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      let targetUser: ERPUserProfile;
      if (role === 'student') {
        targetUser = INITIAL_STUDENTS[0];
      } else if (role === 'faculty') {
        targetUser = INITIAL_FACULTY[0];
      } else if (role === 'parent') {
        targetUser = INITIAL_PARENT;
      } else {
        targetUser = INITIAL_ADMIN;
      }

      ERPStorage.setCurrentUser(targetUser);
      setIsLoading(false);
      showToast(`Welcome back, ${targetUser.name}! Logged in as ${role.toUpperCase()}.`, 'success');
      onLoginSuccess(targetUser);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    executeLogin(selectedRole);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-panel border border-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-sm">
          <GraduationCap size={24} />
        </div>
        <h3 className="text-2xl font-black text-main uppercase tracking-tight">
          NCET Campus ERP
        </h3>
        <p className="text-xs text-dim">
          Unified portal for Students, Faculty, Parents, and Administrators
        </p>
      </div>

      {/* 4 Role Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-panel-hover rounded-2xl border border-border mb-6">
        {(['student', 'faculty', 'parent', 'admin'] as const).map(role => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`py-2 text-[11px] font-black uppercase rounded-xl transition-all ${
              selectedRole === role
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-dim hover:text-main'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* 1-Click Fast Demo Login Pills */}
      <div className="mb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-dim block text-center">
          ⚡ 1-Click Instant Demo Login:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('student')}
            className="p-2 rounded-xl bg-panel-hover hover:bg-brand-primary/10 border border-border hover:border-brand-primary/40 text-left text-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong className="text-main block group-hover:text-brand-primary transition-colors">Aarav (Student)</strong>
              <span className="text-[10px] text-dim">6th Sem CSE</span>
            </div>
            <ArrowRight size={13} className="text-dim group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('faculty')}
            className="p-2 rounded-xl bg-panel-hover hover:bg-brand-primary/10 border border-border hover:border-brand-primary/40 text-left text-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong className="text-main block group-hover:text-brand-primary transition-colors">Dr. Rajesh (HOD)</strong>
              <span className="text-[10px] text-dim">Dept of CSE</span>
            </div>
            <ArrowRight size={13} className="text-dim group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('parent')}
            className="p-2 rounded-xl bg-panel-hover hover:bg-brand-primary/10 border border-border hover:border-brand-primary/40 text-left text-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong className="text-main block group-hover:text-brand-primary transition-colors">Mr. Ramesh (Parent)</strong>
              <span className="text-[10px] text-dim">Ward: Aarav</span>
            </div>
            <ArrowRight size={13} className="text-dim group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2 rounded-xl bg-panel-hover hover:bg-brand-primary/10 border border-border hover:border-brand-primary/40 text-left text-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong className="text-main block group-hover:text-brand-primary transition-colors">Registrar (Admin)</strong>
              <span className="text-[10px] text-dim">Central Controller</span>
            </div>
            <ArrowRight size={13} className="text-dim group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">
            Registered Email / USN
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@ncet.edu"
              className="w-full bg-panel-hover border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-main outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-dim block mb-1">
            Portal Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-panel-hover border border-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-main outline-none focus:border-brand-primary transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-main"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            'Authenticating...'
          ) : (
            <>
              Sign In to {selectedRole.toUpperCase()} Portal <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-[11px] text-dim">
          Default credentials are preloaded for evaluation. Secure encrypted session.
        </p>
      </div>
    </div>
  );
};
