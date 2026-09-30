'use client';

import React from 'react';
import Image from 'next/image';
import { MessageSquareText, Wind, Layers, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CraftsmanshipSection() {
  const { t } = useLanguage();

  const stepIcons = [MessageSquareText, Wind, Layers, Truck];
  const steps = t.craftsmanship.steps.map((s, index) => ({
    step: s.step,
    title: s.title,
    desc: s.desc,
    badge: s.badge,
    icon: stepIcons[index] || MessageSquareText,
  }));

  return (
    <section className="relative py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#EAE1D5] overflow-hidden">
      {/* Left Background: Subtle Thai Kanok Motif Watermark */}
      <div 
        className="absolute -left-16 sm:-left-10 top-1/2 -translate-y-1/2 w-[300px] sm:w-[440px] h-[450px] pointer-events-none z-0 opacity-10 sm:opacity-15 select-none"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 20%, transparent 100%)'
        }}
      >
        <svg viewBox="0 0 400 400" fill="none" className="w-full h-full text-[#A87424]" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 40 C220 100, 300 120, 360 200 C300 280, 220 300, 200 360 C180 300, 100 280, 40 200 C100 120, 180 100, 200 40 Z" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
          <circle cx="200" cy="200" r="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <path d="M200 80 C208 130, 270 140, 320 200 C270 260, 208 270, 200 320 C192 270, 130 260, 80 200 C130 140, 192 130, 200 80 Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>

      {/* Right Background: Faded Authentic Phetchaburi Gable (หน้าจั่วเพชรบุรี) */}
      <div 
        className="absolute -right-8 sm:-right-4 lg:right-4 top-1/2 -translate-y-1/2 w-[280px] sm:w-[420px] lg:w-[500px] h-[480px] sm:h-[620px] pointer-events-none z-0 opacity-15 sm:opacity-20 mix-blend-multiply select-none"
        style={{
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 25%, rgba(0,0,0,0.3) 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 25%, rgba(0,0,0,0.3) 75%, transparent 100%)'
        }}
      >
        <Image
          src="/images/phetchaburi-gable.png"
          alt="หน้าจั่วเพชรบุรี"
          fill
          sizes="(max-width: 768px) 300px, 500px"
          className="object-contain object-right"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
            {t.craftsmanship.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mt-1 font-sans">
            {t.craftsmanship.title}
          </h2>
          <p className="text-xs sm:text-sm sm:text-base text-[#7A6450] mt-2 font-light">
            {t.craftsmanship.desc}
          </p>
        </div>

        {/* 4 Practical Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-3xl p-5 sm:p-6 bg-white/92 backdrop-blur-xs border border-[#E8DFD5] hover:border-[#C59139] hover:bg-white transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] border border-[#E0D0BE] flex items-center justify-center text-[#C59139] group-hover:bg-[#C59139] group-hover:text-white transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-[#D4C3AF] group-hover:text-[#C59139] transition-colors font-serif">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#2D1B0E] mb-2 font-sans">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B5745] leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3.5 mt-5 border-t border-[#EAE1D5] flex items-center gap-1.5 text-[11px] text-[#A87424] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C59139] shrink-0" />
                  <span>{item.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
