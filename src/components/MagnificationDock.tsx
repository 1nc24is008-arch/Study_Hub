/**
 * MagnificationDock Component
 * 
 * A premium macOS-inspired dock component with fluid magnification effects, 
 * spring physics, and tooltips. Built with Framer Motion.
 */

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'framer-motion';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  badge?: React.ReactNode;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  badge?: React.ReactNode;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  badge
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-panel/90 dark:bg-panel/95 hover:bg-panel border-border border shadow-lg hover:border-brand-primary/50 cursor-pointer text-main hover:text-brand-primary transition-colors group ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {badge && (
        <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-brand-primary text-[9px] font-black text-white shadow-md">
          {badge}
        </span>
      )}
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.9 }}
          transition={{ duration: 0.18 }}
          className={`${className} absolute -top-9 left-1/2 w-fit whitespace-nowrap rounded-lg border border-border bg-panel/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-main shadow-xl pointer-events-none z-50 flex items-center gap-1`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-panel/95" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return (
    <div className={`flex items-center justify-center text-main group-hover:text-brand-primary group-hover:scale-110 transition-transform duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function MagnificationDock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 48
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div 
      style={{ height: panelHeight, scrollbarWidth: 'none' }} 
      className="flex max-w-full items-end justify-center overflow-visible select-none"
    >
      <div
        onMouseMove={(e: React.MouseEvent) => {
          mouseX.set(e.clientX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`${className} flex items-end w-fit gap-2 sm:gap-2.5 rounded-3xl border-border border bg-panel/85 dark:bg-panel/90 backdrop-blur-xl pb-2 px-3 sm:px-4 shadow-2xl relative overflow-visible`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            badge={item.badge}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </div>
    </div>
  );
}

export default MagnificationDock;
