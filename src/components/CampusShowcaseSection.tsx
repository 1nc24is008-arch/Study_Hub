import React, { useState } from 'react';
import { MasonryGallery } from './MasonryGallery';
import { CAMPUS_GALLERY_ITEMS, CampusGalleryItem } from '../data/galleryData';
import { Sparkles, RefreshCw, Layers, MapPin, Cpu, X, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampusShowcaseSectionProps {
  onExploreBranch?: (branchCode: string) => void;
}

export const CampusShowcaseSection: React.FC<CampusShowcaseSectionProps> = ({ onExploreBranch }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [galleryKey, setGalleryKey] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<CampusGalleryItem | null>(null);

  const categories = ['All', 'Laboratories', 'Research & Computing', 'Campus Life', 'Blueprints'];

  const filteredItems = activeCategory === 'All' 
    ? CAMPUS_GALLERY_ITEMS 
    : CAMPUS_GALLERY_ITEMS.filter(item => item.category === activeCategory);

  const handleRefresh = () => {
    // Re-trigger layout & GSAP cinematic entrance animations
    setGalleryKey(prev => prev + 1);
  };

  return (
    <section id="campus-gallery" className="py-12 flex flex-col gap-8 w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
            <Sparkles size={14} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
              Cinematic GSAP Visual Layout
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-main tracking-tight">
            Campus, Labs & <span className="text-brand-primary">Research Showcase</span>
          </h2>
          <p className="text-dim text-sm max-w-2xl leading-relaxed">
            Take a visual tour through NCET's advanced engineering facilities, high-performance computing clusters, VLSI design suites, robotics arenas, and innovation zones.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-soft-bg hover:bg-panel border border-border text-main text-xs font-bold transition-all shadow-sm active:scale-95 group hover:border-brand-primary/40"
            title="Re-animate Gallery with GSAP Stagger"
          >
            <RefreshCw size={14} className="text-brand-primary group-hover:rotate-180 transition-transform duration-500" />
            <span>Re-animate</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-black text-dim uppercase tracking-wider mr-1 flex items-center gap-1.5">
          <Layers size={13} className="text-brand-primary" /> Filters:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setGalleryKey(prev => prev + 1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeCategory === cat
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105'
                : 'bg-panel hover:bg-soft-bg border border-border text-dim hover:text-main'
            }`}
          >
            {cat} {cat === 'All' ? `(${CAMPUS_GALLERY_ITEMS.length})` : ''}
          </button>
        ))}
      </div>

      {/* Masonry Layout Container */}
      <div className="w-full bg-soft-bg/30 p-2 sm:p-4 rounded-3xl border border-border/60">
        <MasonryGallery
          key={galleryKey}
          items={filteredItems}
          animateFrom="bottom"
          blurToFocus={true}
          stagger={0.06}
          scaleOnHover={true}
          hoverScale={0.97}
          colorShiftOnHover={true}
          className="my-2"
          onItemClick={(item) => setSelectedItem(item as CampusGalleryItem)}
        />
      </div>

      {/* Item Detail Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-panel border border-border rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
                <img
                  src={selectedItem.img}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 z-10"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-[10px] font-black uppercase tracking-wider">
                      {selectedItem.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-sm">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedItem.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-dim mb-2">Overview</h4>
                  <p className="text-main text-sm leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.location && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-soft-bg border border-border text-xs text-main font-bold">
                    <MapPin size={16} className="text-brand-primary shrink-0" />
                    <span>Campus Location: {selectedItem.location}</span>
                  </div>
                )}

                {selectedItem.equipment && selectedItem.equipment.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-dim mb-3 flex items-center gap-1.5">
                      <Cpu size={14} className="text-brand-primary" /> Key Equipment & Tech Stack
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.equipment.map((eq, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-soft-bg border border-border text-xs font-semibold text-main">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          <span>{eq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-dim font-bold">NCET Engineering Infrastructure</span>
                  <div className="flex items-center gap-2">
                    {onExploreBranch && selectedItem.department && (
                      <button
                        onClick={() => {
                          const branch = selectedItem.department.includes('CSE') ? 'CSE' 
                            : selectedItem.department.includes('ECE') ? 'ECE'
                            : selectedItem.department.includes('CIVIL') ? 'CIVIL'
                            : selectedItem.department.includes('MECH') ? 'MECH'
                            : selectedItem.department.includes('AI/ML') ? 'AI/ML'
                            : selectedItem.department.includes('ISE') ? 'ISE'
                            : selectedItem.department.includes('Data Science') ? 'DS'
                            : 'First Year';
                          setSelectedItem(null);
                          onExploreBranch(branch);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md shadow-brand-primary/20 active:scale-95 transition-all"
                      >
                        <BookOpen size={13} />
                        <span>View Department Notes</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 rounded-xl bg-soft-bg hover:bg-panel border border-border text-main text-xs font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CampusShowcaseSection;
