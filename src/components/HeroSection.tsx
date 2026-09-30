'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Video with natural warm teakwood overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.08]"
        >
          <source src="/video/thai-wood.mp4" type="video/mp4" />
        </video>
        {/* Soft Warm Teak Wood Tint Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D1B0E]/70 via-[#2D1B0E]/55 to-[#2D1B0E]/80 backdrop-brightness-95" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Quality Badge */}
        <div className="inline-flex items-center px-5 sm:px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#E5C492]/50 text-[#F5DEB3] text-xs sm:text-sm font-medium mb-8 sm:mb-10 shadow-sm tracking-wide">
          <span>{t.hero.badge}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-wide text-white leading-tight sm:leading-snug lg:leading-[1.22] mb-7 sm:mb-9 drop-shadow-md font-sans">
          <span className="block mb-2 sm:mb-3">{t.hero.titleLine1}</span>
          <span className="block text-white drop-shadow-md">{t.hero.titleLine2}</span>
        </h1>

        {/* Subtitle with relaxed multi-line spacing */}
        <div className="text-sm sm:text-base lg:text-lg text-[#F0E6D8] max-w-2xl font-light mb-9 sm:mb-12 drop-shadow-xs px-2 space-y-1.5 sm:space-y-2 leading-relaxed sm:leading-relaxed">
          <p>{t.hero.subtitleLine1 || t.hero.subtitle}</p>
          {t.hero.subtitleLine2 && <p>{t.hero.subtitleLine2}</p>}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/estimator"
            className="w-full sm:w-auto btn-gold flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all active:scale-95"
          >
            <span>{t.hero.ctaEstimate}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="/#portfolio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/20 transition-all active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-[#F5DEB3]" />
            <span>{t.hero.ctaPortfolio}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
