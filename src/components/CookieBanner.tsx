'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { useLanguage } from '@/context/LanguageContext';

export default function CookieBanner() {
  const { t, isEn } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('woodwork_cookie_consent');
      if (!consent) {
        // Show after a brief delay for smooth appearance
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('woodwork_cookie_consent', 'accepted');
    } catch {}
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    try {
      localStorage.setItem('woodwork_cookie_consent', 'necessary');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner && !showPrivacyModal) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-auto z-40 max-w-lg animate-fadeIn">
          <div className="bg-wood-950/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-gold-500/40 space-y-3.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-cream-50 font-serif flex items-center gap-1.5">
                    <span>{t.cookieBanner.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 font-mono">PDPA</span>
                  </h4>
                </div>
              </div>
              <button
                onClick={handleNecessaryOnly}
                className="text-wood-400 hover:text-white p-1 rounded-lg transition-colors"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] sm:text-xs text-cream-200/90 leading-relaxed font-light">
              {t.cookieBanner.desc}{' '}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gold-400 hover:text-gold-300 underline font-medium inline-block"
              >
                {t.cookieBanner.learnMore}
              </button>
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={handleAcceptAll}
                className="flex-1 min-w-[120px] btn-gold py-2 px-3 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.cookieBanner.acceptAll}</span>
              </button>
              <button
                onClick={handleNecessaryOnly}
                className="px-3 py-2 rounded-xl bg-wood-900 hover:bg-wood-800 text-cream-200 border border-wood-700 text-xs font-semibold transition-all"
              >
                {t.cookieBanner.necessaryOnly}
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="px-3 py-2 rounded-xl text-gold-400 hover:text-gold-300 text-xs font-semibold hover:bg-white/5 transition-all flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? 'Details' : 'รายละเอียด'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  );
}