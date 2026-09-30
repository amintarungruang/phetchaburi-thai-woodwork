'use client';

import React from 'react';
import Image from 'next/image';
import { Layers, Compass, Hammer, Trees, Sparkles, Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ThaiHouseFeature() {
  const { t } = useLanguage();

  const highlightIcons = [Layers, Compass, Hammer, Trees];
  const highlights = t.thaiHouse.highlights.map((h, index) => ({
    icon: highlightIcons[index] || Layers,
    title: h.title,
    desc: h.desc,
  }));

  return (
    <section className="py-14 sm:py-20 bg-modern-grid border-b border-[#EAE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Thai House Model Presentation Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden modern-card p-5 sm:p-7 group bg-white border border-[#E8DFD5] shadow-md">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C59139]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E0D0BE] text-[#A87424] text-xs font-semibold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C59139]" />
                <span>{t.thaiHouse.modelBadge}</span>
              </div>

              {/* House Model Image with 3D Float Effect */}
              <div className="relative h-64 sm:h-80 md:h-96 w-full flex items-center justify-center my-2">
                <Image
                  src="/images/thai-house-model.png"
                  alt={t.thaiHouse.modelBadge}
                  fill
                  className="object-contain group-hover:scale-103 transition-transform duration-500 drop-shadow-lg"
                  priority
                />
              </div>

              {/* Card Footer Tag */}
              <div className="mt-4 pt-3.5 border-t border-[#F0E6D8] flex items-center justify-between text-xs text-[#8C735A]">
                <span>{t.thaiHouse.modelCaption}</span>
                <span className="font-semibold text-[#A87424]">{t.thaiHouse.modelCustom}</span>
              </div>
            </div>
          </div>

          {/* Right: Real Craftsmanship Strengths */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
                {t.hero.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1A0E] mt-1 leading-tight font-sans">
                {t.thaiHouse.titleLine1} <br />
                <span className="text-[#A87424]">{t.thaiHouse.titleLine2}</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#5C4A3A] leading-relaxed font-light">
              {t.thaiHouse.desc}
            </p>

            {/* 4 Feature Items */}
            <div className="space-y-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E8DFD5] hover:border-[#C59139]/60 transition-all flex items-start gap-3 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#C59139] border border-[#E0D0BE] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#2D1A0E]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#7A6450] mt-0.5 font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#A87424] hover:text-[#2D1B0E] transition-colors group"
              >
                <span>{t.thaiHouse.catalogLink}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="text-[#D8C7B5] hidden sm:inline">•</span>
              <a
                href="tel:0840426571"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2D1B0E] hover:text-[#A87424] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C59139]" />
                <span>{t.thaiHouse.callLink}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
