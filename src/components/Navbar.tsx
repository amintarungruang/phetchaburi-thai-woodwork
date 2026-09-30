'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (pathname === '/') {
        const sections = ['home', 'portfolio', 'feed', 'map', 'schedule'];
        const scrollPos = window.scrollY + 200;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const navLinks = [
    { id: 'home', name: t.navbar.home, href: '/' },
    { id: 'portfolio', name: t.navbar.portfolio, href: '/#portfolio' },
    { id: 'feed', name: t.navbar.feed, href: '/#feed' },
    { id: 'map', name: t.navbar.map, href: '/#map' },
    { id: 'schedule', name: t.navbar.schedule, href: '/#schedule' },
    { id: 'estimator', name: t.navbar.estimator, href: '/estimator' },
  ];

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (link.href === '/estimator') {
      return pathname === '/estimator';
    }
    if (pathname === '/estimator') return false;
    return activeSection === link.id;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E8DFD5] py-2.5 sm:py-3'
          : 'bg-white/90 backdrop-blur-xs border-b border-[#E8DFD5]/60 py-3 sm:py-3.5'
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 lg:gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <Image
              src="/images/wood-logo.png"
              alt={t.navbar.brandTitle}
              width={44}
              height={44}
              className="object-contain hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold tracking-tight text-[#2D1B0E] flex items-center gap-1.5 leading-none font-sans whitespace-nowrap">
              <span>{t.navbar.brandTitle}</span>
              <span className="text-[#C59139]">{t.navbar.brandSubtitle}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#7A6450] font-medium tracking-wide mt-1 whitespace-nowrap">
              {t.navbar.brandTagline}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#FAF7F2] p-1.5 rounded-full border border-[#E8DFD5] shadow-2xs shrink-0">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#2D1A0E] text-white shadow-xs'
                    : 'text-[#6E5A47] hover:text-[#2D1A0E] hover:bg-white/60'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Desktop: Contact Button FIRST, then Language Toggle AFTER with distinct separation */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
          {/* Call Button */}
          <a
            href="tel:0840426571"
            className="btn-gold flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl text-xs xl:text-sm font-bold shadow-sm whitespace-nowrap transition-transform active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.navbar.callButton}</span>
          </a>

          {/* Language Switcher - Placed after call button with clear separation */}
          <div className="inline-flex items-center bg-[#FAF5EE] p-1 rounded-xl border border-[#D5C2AF] shadow-2xs">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('th');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                language === 'th'
                  ? 'bg-[#2D1A0E] text-white shadow-xs'
                  : 'text-[#7A6450] hover:text-[#2D1A0E] hover:bg-white/70'
              }`}
              title="ภาษาไทย"
            >
              TH
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('en');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                language === 'en'
                  ? 'bg-[#2D1A0E] text-white shadow-xs'
                  : 'text-[#7A6450] hover:text-[#2D1A0E] hover:bg-white/70'
              }`}
              title="English"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          {/* Call Quick Action */}
          <a
            href="tel:0840426571"
            className="btn-gold p-2 sm:p-2.5 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition-transform"
            aria-label={t.navbar.callButton}
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* Language Switcher - Hidden on phone screen (< sm) to prevent squeezing the menu, accessible inside mobile drawer */}
          <div className="hidden sm:inline-flex items-center bg-[#FAF5EE] p-0.5 rounded-lg border border-[#D5C2AF] shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('th');
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer select-none ${
                language === 'th' ? 'bg-[#2D1A0E] text-white' : 'text-[#7A6450]'
              }`}
            >
              TH
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('en');
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer select-none ${
                language === 'en' ? 'bg-[#2D1A0E] text-white' : 'text-[#7A6450]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 sm:p-2.5 rounded-xl text-[#2D1B0E] bg-[#FAF5EE] border border-[#E8DFD5] hover:bg-[#F2EAE0] focus:outline-none flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-all"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#2D1B0E]" /> : <Menu className="w-5 h-5 text-[#2D1B0E]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8DFD5] px-4 pt-3 pb-6 space-y-2 mt-2 shadow-xl animate-fadeIn">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#2D1A0E] text-white'
                    : 'text-[#2D1B0E] hover:bg-[#FAF5EE]'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#E8DFD5] space-y-2.5">
            <div className="flex items-center justify-between px-3 py-2 bg-[#FAF5EE] rounded-xl border border-[#E2D5C5]">
              <div className="flex items-center gap-1.5 text-xs text-[#7A6450] font-medium">
                <Globe className="w-4 h-4 text-[#C59139]" />
                <span>{t.navbar.langSwitch}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLanguage('th');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    language === 'th' ? 'bg-[#2D1A0E] text-white shadow-xs' : 'text-[#7A6450] bg-white border border-[#E2D5C5]'
                  }`}
                >
                  ไทย (TH)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLanguage('en');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    language === 'en' ? 'bg-[#2D1A0E] text-white shadow-xs' : 'text-[#7A6450] bg-white border border-[#E2D5C5]'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <a
              href="tel:0840426571"
              className="btn-gold flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>{t.navbar.callArtisanFull}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
