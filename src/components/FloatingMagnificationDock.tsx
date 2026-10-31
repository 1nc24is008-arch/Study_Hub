import React, { useState } from 'react';
import { MagnificationDock, DockItemData } from './MagnificationDock';
import { 
  Home, 
  Search, 
  Book, 
  Calculator, 
  GraduationCap, 
  Sparkles, 
  MessageCircle, 
  Moon, 
  Sun, 
  User, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingMagnificationDockProps {
  onHomeClick: () => void;
  onBranchesClick: () => void;
  onSearchClick: () => void;
  onGalleryClick: () => void;
  onCalculatorClick: () => void;
  onERPClick: () => void;
  onAIChatClick: () => void;
  onThemeToggle: () => void;
  onAuthClick: () => void;
  theme: 'light' | 'dark';
  userDisplayName?: string | null;
  isAdmin?: boolean;
}

export const FloatingMagnificationDock: React.FC<FloatingMagnificationDockProps> = ({
  onHomeClick,
  onBranchesClick,
  onSearchClick,
  onGalleryClick,
  onCalculatorClick,
  onERPClick,
  onAIChatClick,
  onThemeToggle,
  onAuthClick,
  theme,
  userDisplayName,
  isAdmin
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const dockItems: DockItemData[] = [
    {
      icon: <Home size={19} />,
      label: 'Home',
      onClick: onHomeClick
    },
    {
      icon: <Book size={19} />,
      label: 'Branches & Syllabus',
      onClick: onBranchesClick
    },
    {
      icon: <Search size={19} />,
      label: 'Search Materials',
      onClick: onSearchClick
    },
    {
      icon: <Sparkles size={19} className="text-amber-500" />,
      label: 'Campus Showcase',
      onClick: onGalleryClick
    },
    {
      icon: <Calculator size={19} className="text-emerald-500" />,
      label: 'VTU CGPA Calc',
      onClick: onCalculatorClick
    },
    {
      icon: <GraduationCap size={20} className="text-brand-primary" />,
      label: 'Campus ERP',
      onClick: onERPClick,
      badge: 'ERP'
    },
    {
      icon: <MessageCircle size={19} className="text-indigo-500" />,
      label: 'AI Study Assistant',
      onClick: onAIChatClick
    },
    {
      icon: theme === 'light' ? <Moon size={19} /> : <Sun size={19} className="text-amber-400" />,
      label: theme === 'light' ? 'Dark Theme' : 'Light Theme',
      onClick: onThemeToggle
    },
    {
      icon: <User size={19} className={isAdmin ? 'text-brand-primary' : ''} />,
      label: userDisplayName ? `${userDisplayName} (${isAdmin ? 'Admin' : 'Student'})` : 'Access Portal',
      onClick: onAuthClick,
      badge: isAdmin ? 'Admin' : undefined
    }
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto select-none">
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="flex items-end gap-1.5"
          >
            {/* Magnification Dock */}
            <MagnificationDock
              items={dockItems}
              panelHeight={60}
              baseItemSize={44}
              magnification={66}
              distance={170}
              className="border-border/80 shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
            />

            {/* Quick Minimize Toggle Button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="h-9 w-9 rounded-full bg-panel/85 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-dim hover:text-main hover:border-brand-primary/40 transition-all self-end mb-2.5 active:scale-95"
              title="Minimize Quick Dock"
            >
              <ChevronDown size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-panel/90 backdrop-blur-md border border-border shadow-xl text-xs font-bold text-main hover:text-brand-primary hover:border-brand-primary/40 transition-all active:scale-95 group"
          >
            <GraduationCap size={15} className="text-brand-primary" />
            <span>macOS Quick Dock</span>
            <ChevronUp size={14} className="text-dim group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingMagnificationDock;
