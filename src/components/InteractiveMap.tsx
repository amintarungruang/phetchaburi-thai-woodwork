'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { MapPin, Navigation, Compass, Info } from 'lucide-react';
import { InstallationPin, Project, CategoryItem } from '@/types';
import { getPins, getProjects, getCategories } from '@/lib/store';
import { useLanguage } from '@/context/LanguageContext';

// Dynamic import Leaflet inner map
const DynamicMapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] bg-[#FAF7F2] rounded-3xl flex flex-col items-center justify-center text-[#8C735A] gap-3">
      <Compass className="w-8 h-8 animate-spin text-[#C59139]" />
      <span className="text-xs sm:text-sm font-medium">Loading Map...</span>
    </div>
  ),
});

export default function InteractiveMap() {
  const { t, isEn } = useLanguage();
  const [pins, setPins] = useState<InstallationPin[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedPin, setSelectedPin] = useState<InstallationPin | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadMapData = async () => {
    const [installationPins, projectItems, catList] = await Promise.all([
      getPins(),
      getProjects(),
      getCategories('map')
    ]);

    setCategories(catList);

    // Map projects with lat/lng to pins
    const projectPins: InstallationPin[] = projectItems
      .filter((p) => p.lat && p.lng)
      .map((p) => {
        let pinCategory: string = 'residence';
        if (p.title.includes('วัด') || p.location_name.includes('วัด')) {
          pinCategory = 'temple';
        } else if (p.title.includes('รีสอร์ต') || p.location_name.includes('รีสอร์ต') || p.title.includes('โรงแรม')) {
          pinCategory = 'resort';
        }

        return {
          id: `proj-pin-${p.id}`,
          title: p.title,
          category: pinCategory,
          category_name_th: p.category_name_th,
          province: p.location_name.includes('เพชรบุรี') ? 'เพชรบุรี' : 'ผลงานติดตั้ง',
          location_name: p.location_name,
          lat: p.lat!,
          lng: p.lng!,
          image_url: p.image_url || p.gallery_urls?.[0] || '',
          gallery_urls: p.gallery_urls,
          description: p.description,
          wood_details: p.wood_type,
          completed_year: p.installation_year,
        };
      });

    // Combine and deduplicate by title
    const combinedPins = [...installationPins];
    for (const pp of projectPins) {
      if (!combinedPins.some((ip) => ip.title === pp.title)) {
        combinedPins.push(pp);
      }
    }

    setPins(combinedPins);
    if (combinedPins.length > 0 && !selectedPin) {
      setSelectedPin(combinedPins[0]);
    }
  };

  useEffect(() => {
    loadMapData();
    window.addEventListener('woodwork_store_updated', loadMapData);
    return () => window.removeEventListener('woodwork_store_updated', loadMapData);
  }, []);

  const filteredPins = pins.filter((p) =>
    selectedCategory === 'all' ? true : p.category === selectedCategory
  );

  return (
    <section id="map" className="py-16 sm:py-24 bg-modern-grid border-b border-[#EAE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
            {t.map.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mt-1 font-sans">
            {t.map.title}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6450] mt-2 font-light">
            {t.map.desc}
          </p>
        </div>

        {/* Category Filters for Map */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#2D1A0E] text-white shadow-xs'
                : 'bg-white text-[#5C4A3A] border border-[#E2D5C5] hover:bg-[#FAF5EE]'
            }`}
          >
            <span>{t.common.all} ({pins.length})</span>
          </button>
          {categories.map((tab) => {
            const count = pins.filter(p => p.category === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-[#2D1A0E] text-white shadow-xs'
                    : 'bg-white text-[#5C4A3A] border border-[#E2D5C5] hover:bg-[#FAF5EE]'
                }`}
              >
                <span>{tab.name_th} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Map Box */}
          <div className="lg:col-span-8 modern-card rounded-3xl p-2 shadow-sm min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] h-full relative overflow-hidden flex flex-col">
            <div className="w-full flex-1 min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] h-full relative rounded-2xl overflow-hidden">
              <DynamicMapInner
                pins={filteredPins}
                selectedPin={selectedPin}
                onSelectPin={(pin) => setSelectedPin(pin)}
              />
            </div>
          </div>

          {/* Selected Pin Details Showcase */}
          <div className="lg:col-span-4 modern-card rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            {selectedPin ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4] text-xs">
                  <span className="bg-[#FAF5EE] text-[#A87424] font-bold px-3 py-1 rounded-full border border-[#E0D0BE]">
                    {selectedPin.category_name_th}
                  </span>
                  <span className="text-[#8C735A] font-medium">จ. {selectedPin.province}</span>
                </div>

                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#2D1B0E]">
                  <Image
                    src={selectedPin.image_url || selectedPin.gallery_urls?.[0] || '/images/thai-house-model.png'}
                    alt={selectedPin.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#2D1B0E]">{selectedPin.title}</h3>
                  <p className="text-xs text-[#7A6450] mt-1 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-[#C59139]" />
                    <span>{selectedPin.location_name}</span>
                  </p>
                  <p className="text-xs text-[#5C4A3A] mt-2 leading-relaxed font-light">
                    {selectedPin.description}
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD5] text-xs space-y-1">
                  <div className="font-semibold text-[#2D1B0E]">{t.map.woodDetail}:</div>
                  <div className="text-[#5C4A3A] font-light">{selectedPin.wood_details}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C735A]">
                {t.map.zoomHint}
              </div>
            )}

            <div className="pt-4 border-t border-[#F2ECE4]">
              <a
                href="https://maps.google.com/?q=โรงงานฝาทรงไทยเมืองเพชร"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-gold py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>{isEn ? 'Open in Google Maps' : 'เปิดเส้นทางนำทาง Google Maps'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Note for Private Properties */}
        <div className="mt-4 sm:mt-5 flex items-start sm:items-center gap-2 text-xs text-[#7A6450] bg-[#FAF7F2] py-2.5 px-4 rounded-2xl border border-[#E8DFD5] shadow-2xs">
          <Info className="w-4 h-4 text-[#C59139] shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed font-light">
            {t.map.privateLocationNote}
          </p>
        </div>
      </div>
    </section>
  );
}
