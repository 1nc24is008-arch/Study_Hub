/**
 * MasonryGallery - A high-performance, GSAP-powered Masonry layout component.
 * Features:
 * - Responsive column mapping
 * - GSAP animations for entry and updates
 * - Blur-to-focus and directional entrance effects
 * - Interactive hover states (scale, color shift)
 * - Automatic image preloading for smooth layout calculations
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hook to handle media queries for responsive columns */
const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    const match = queries.findIndex(q => window.matchMedia(q).matches);
    return values[match] !== undefined ? values[match] : defaultValue;
  };

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => window.matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => window.matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

/** Hook to measure element size via ResizeObserver */
const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

/** Utility to ensure images are loaded before layout/animation */
const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

export interface MasonryItem {
  id: string;
  img: string;
  url?: string;
  height: number;
  title?: string;
  category?: string;
  department?: string;
  description?: string;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MasonryGalleryProps {
  /** Array of items to display in the gallery */
  items: MasonryItem[];
  /** GSAP easing function */
  ease?: string;
  /** Duration of movement animations */
  duration?: number;
  /** Stagger delay between item animations */
  stagger?: number;
  /** Direction from which items enter the screen */
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  /** Whether to scale items down on hover */
  scaleOnHover?: boolean;
  /** Scale factor for hover state */
  hoverScale?: number;
  /** Whether to apply a blur-to-focus entry effect */
  blurToFocus?: boolean;
  /** Whether to show a color overlay on hover */
  colorShiftOnHover?: boolean;
  /** CSS class for the container */
  className?: string;
  /** CSS class for individual item containers */
  itemClassName?: string;
  /** Callback when an item is clicked */
  onItemClick?: (item: MasonryItem) => void;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  className,
  itemClassName,
  onItemClick
}) => {
  const columns = useMedia(
    ['(min-width: 1500px)', '(min-width: 1000px)', '(min-width: 600px)', '(min-width: 400px)'],
    [4, 3, 2, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  // Initial animation calculations
  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'] as const;
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return {
        x: containerRect.width / 2 - item.w / 2,
        y: containerRect.height / 2 - item.h / 2
      };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  // Preload logic
  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  // Layout calculation
  const { grid, containerHeight } = useMemo(() => {
    if (!width) return { grid: [] as GridItem[], containerHeight: 0 };

    const colHeights = new Array(columns).fill(0);
    const gap = 20; // Elegant gap for premium feel
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const gridItems = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = (child.height / 400) * columnWidth; // Maintain aspect ratio
      const y = colHeights[col];
      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });

    return { grid: gridItems, containerHeight: Math.max(...colHeights) };
  }, [columns, items, width]);

  // Animation logic
  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return;

    grid.forEach((item, index) => {
      const element = document.querySelector(`[data-key="${item.id}"]`);
      if (!element) return;

      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          element,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(20px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 1.2,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      } else {
        gsap.to(element, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    if (grid.length > 0) hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (_id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: hoverScale,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.35, duration: 0.4 });
    }
  };

  const handleMouseLeave = (_id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.4 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height: containerHeight || 500, minHeight: '400px' }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className={cn(
            'absolute overflow-hidden cursor-pointer rounded-2xl border border-border bg-panel shadow-md hover:shadow-2xl transition-shadow group',
            itemClassName
          )}
          style={{
            willChange: 'transform, width, height, opacity, filter',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)'
          }}
          onClick={() => {
            if (onItemClick) {
              onItemClick(item);
            } else if (item.url) {
              window.open(item.url, '_blank', 'noopener');
            }
          }}
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 bg-gradient-to-tr from-brand-primary/40 to-indigo-500/30 opacity-0 pointer-events-none transition-opacity" />
            )}
          </div>

          {/* Department / Category Pill */}
          {item.department && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                {item.department}
              </span>
            </div>
          )}

          {/* Title & Caption Gradient Overlay */}
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-black tracking-tight leading-tight mb-1 drop-shadow-sm">
                {item.title}
              </p>
              {item.description && (
                <p className="text-white/80 text-[11px] line-clamp-2 leading-snug drop-shadow-sm font-medium">
                  {item.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MasonryGallery;
