'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t, isEn } = useLanguage();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <footer className="bg-[#2D1B0E] text-[#E0D0C0] border-t border-[#4A311D] pt-12 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#4A311D]/80">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Image
                  src="/images/wood-logo.png"
                  alt={isEn ? "Thai Heritage Woodcraft" : "ฝาทรงไทย ไม้สัก เพชรบุรี"}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-base text-white font-sans">
                {t.navbar.brandTitle} <span className="text-[#BD9154]">{t.navbar.brandSubtitle}</span>
              </span>
            </div>
            <p className="text-[#C5B5A5] leading-relaxed font-light">
              {t.footer.about}
            </p>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm font-sans">{t.footer.customServicesTitle}</h4>
            <ul className="space-y-1.5 text-[#C5B5A5] font-light">
              {t.footer.customServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm font-sans">{t.footer.contactTitle}</h4>
            <ul className="space-y-2 text-[#C5B5A5] font-light">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#BD9154] shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/zjEMkAjqmUyRDRxe7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors"
                >
                  {t.footer.address}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#BD9154] shrink-0" />
                <a href="tel:0840426571" className="hover:text-gold-400 transition-colors font-semibold text-white">
                  {t.footer.callUs}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 text-[#06C755] font-black text-[10px] flex items-center justify-center shrink-0">LINE</span>
                <a 
                  href="https://line.me/ti/p/~8238sdy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 transition-colors"
                >
                  LINE ID: <span className="font-semibold text-white">8238sdy</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 text-[#1877F2] font-black text-[10px] flex items-center justify-center shrink-0">FB</span>
                <a 
                  href="https://www.facebook.com/seiy.thnth.fa.thrng.thiy?locale=th_TH" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors"
                >
                  Facebook: เสี่ยธนท์ ฝาทรงไทย
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#BD9154] shrink-0" />
                <span>{t.footer.openHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[#A89888] gap-3">
          <p>© {new Date().getFullYear()} {t.footer.rightsReserved}</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-gold-400 transition-colors flex items-center gap-1 underline underline-offset-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>{t.footer.privacyPolicy}</span>
            </button>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </footer>
  );
}
