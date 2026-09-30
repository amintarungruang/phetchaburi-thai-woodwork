'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, X, ZoomIn, PhoneCall, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Layers, Sparkles, Grid } from 'lucide-react';
import { Project, CategoryItem } from '@/types';
import { getProjects, getCategories } from '@/lib/store';
import { useLanguage } from '@/context/LanguageContext';

const getCategoryName = (cat: CategoryItem, isEn: boolean) => {
  if (!isEn) return cat.name_th;
  switch (cat.id) {
    case 'gable': return 'Gables & Facades';
    case 'door': return 'Doors & Frames';
    case 'wall': return 'Wall Panels';
    case 'pavilion': return 'Pavilions & Gazebos';
    default: return cat.name_th;
  }
};

export default function PortfolioGallery() {
  const { t, isEn } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);

  const loadData = async () => {
    const [projectList, catList] = await Promise.all([
      getProjects(),
      getCategories('project')
    ]);
    setProjects(projectList);
    setCategories(catList);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  const filteredProjects = projects.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Display initial 6 or all
  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  const handleViewAllClick = () => {
    if (selectedCategory !== 'all' || searchQuery !== '') {
      setSelectedCategory('all');
      setSearchQuery('');
      setShowAll(true);
    } else {
      setShowAll(!showAll);
    }
  };

  const openLightbox = (project: Project) => {
    setActiveProject(project);
    setLightboxImgIdx(0);
  };

  const closeLightbox = () => {
    setActiveProject(null);
  };

  return (
    <section id="portfolio" className="py-14 sm:py-20 bg-modern-grid border-b border-[#EAE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
            {t.portfolio.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mt-1 font-sans">
            {t.portfolio.title}
          </h2>
          <p className="text-xs sm:text-sm sm:text-base text-[#7A6450] mt-1.5 font-light">
            {t.portfolio.desc}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10">
          {/* Category Tabs: responsive wrapping / smooth scroll without scrollbar cutting text */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setShowAll(false);
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#2D1A0E] text-white shadow-xs'
                  : 'bg-white text-[#5C4A3A] border border-[#E2D5C5] hover:bg-[#FAF5EE]'
              }`}
            >
              {t.portfolio.allTab}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowAll(false);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#2D1A0E] text-white shadow-xs'
                    : 'bg-white text-[#5C4A3A] border border-[#E2D5C5] hover:bg-[#FAF5EE]'
                }`}
              >
                {getCategoryName(cat, isEn)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8C735A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.portfolio.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAll(true);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl border border-[#E2D5C5] bg-white text-xs sm:text-sm text-[#2D1B0E] placeholder-[#8C735A]/70 focus:outline-none focus:ring-2 focus:ring-[#C59139] shadow-xs"
            />
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E2D5C5] space-y-3">
            <p className="text-[#8C735A] text-sm">{t.portfolio.noResults}</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setShowAll(true);
              }}
              className="btn-gold px-5 py-2 rounded-xl text-xs font-bold"
            >
              {t.portfolio.viewAllButton}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {displayedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openLightbox(project)}
                className="modern-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden bg-[#2D1B0E]">
                  <Image
                    src={project.image_url || project.gallery_urls?.[0] || '/images/thai-house-model.png'}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={Boolean((project.image_url || '').startsWith('data:'))}
                  />
                  <div className="absolute top-3 left-3 bg-[#2D1A0E]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                    {project.category_name_th}
                  </div>

                  {project.is_featured && (
                    <div className="absolute top-3 right-3 bg-[#C59139] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>{isEn ? 'Featured' : 'งานเด่น'}</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/95 text-[#2D1A0E] opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-[#2D1B0E] group-hover:text-[#A87424] transition-colors leading-snug font-sans">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#6B5745] mt-2 line-clamp-2 leading-relaxed font-light">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-[#F2ECE4] space-y-1.5 text-xs text-[#5C4A3A]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C735A]">{t.portfolio.woodType}:</span>
                      <span className="font-semibold text-[#2D1B0E]">{project.wood_type}</span>
                    </div>
                    {project.dimensions_info && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C735A]">{t.portfolio.dimensions}:</span>
                        <span className="font-semibold text-[#5C4A3A]">{project.dimensions_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleViewAllClick}
            className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Grid className="w-4 h-4" />
            <span>
              {selectedCategory !== 'all'
                ? isEn
                  ? `View All Projects (${projects.length})`
                  : `ดูผลงานทั้งหมดทุกหมวด (${projects.length} ชิ้นงาน)`
                : showAll
                ? t.portfolio.showLessButton
                : isEn
                ? `View All Projects (${projects.length})`
                : `ดูผลงานทั้งหมด (${projects.length} ชิ้นงาน)`}
            </span>
            {selectedCategory === 'all' && showAll ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Lightbox Modal */}
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D1B0E]/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E2D5C5]">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-[#2D1A0E] hover:bg-[#FAF5EE] transition-colors shadow-sm touch-target flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-7 bg-[#2D1B0E] relative h-72 sm:h-96 md:h-full min-h-[320px] flex items-center justify-center">
                  <Image
                    src={activeProject.gallery_urls?.[lightboxImgIdx] || activeProject.image_url || '/images/thai-house-model.png'}
                    alt={activeProject.title}
                    fill
                    className="object-contain p-2"
                    unoptimized={Boolean(
                      (activeProject.gallery_urls?.[lightboxImgIdx] || activeProject.image_url || '').startsWith('data:')
                    )}
                  />
                  {activeProject.gallery_urls && activeProject.gallery_urls.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setLightboxImgIdx((prev) =>
                            prev === 0 ? activeProject.gallery_urls.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 text-[#2D1B0E]"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setLightboxImgIdx((prev) =>
                            prev === activeProject.gallery_urls.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 text-[#2D1B0E]"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="md:col-span-5 p-6 sm:p-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    <h3 className="text-xl font-bold text-[#2D1B0E] leading-snug font-sans">
                      {activeProject.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4A3A] leading-relaxed font-light">
                      {activeProject.description}
                    </p>

                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8DFD5] space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-[#2D1B0E]">{t.portfolio.woodType}:</span>{' '}
                        <span className="text-[#5C4A3A]">{activeProject.wood_type}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#2D1B0E]">{t.portfolio.dimensions}:</span>{' '}
                        <span className="text-[#5C4A3A]">{activeProject.dimensions_info}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="tel:0840426571"
                    className="w-full btn-gold flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm shadow-md transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t.portfolio.callForPrice} (084-042-6571)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
