'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Phone, 
  MapPin, 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  Headphones, 
  MessageSquareShare,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FloatingActionsProps {
  onOpenChat: () => void;
  isChatOpen: boolean;
}

export default function FloatingActions({ onOpenChat, isChatOpen }: FloatingActionsProps) {
  const { t, isEn } = useLanguage();
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [copiedLine, setCopiedLine] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsContactMenuOpen(false);
      }
    }
    if (isContactMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isContactMenuOpen]);

  const copyLineId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText('8238sdy');
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2500);
  };

  const contactList = [
    {
      id: 'phone',
      label: isEn ? 'Direct Hotline' : 'โทรศัพท์สายด่วน',
      desc: isEn ? '084-042-6571 (Master S)' : '084-042-6571 (ช่างเอส)',
      href: 'tel:0840426571',
      badge: isEn ? 'Call Now' : 'โทรออกทันที',
      bgGradient: 'from-amber-500 to-orange-600',
      icon: Phone,
      color: '#EA580C',
    },
    {
      id: 'line',
      label: isEn ? 'Add LINE to Inquire' : 'แอด LINE สอบถามแบบ',
      desc: 'LINE ID: 8238sdy',
      href: 'https://line.me/ti/p/~8238sdy',
      badge: isEn ? 'Chat on LINE' : 'แชทไลน์',
      bgGradient: 'from-emerald-500 to-green-600',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 10.3c0-4.6-5.4-8.3-12-8.3S0 5.7 0 10.3c0 4.1 4.3 7.6 10.1 8.2.4.1.9.3 1 .7.1.3.1.8 0 1.2l-.4 1.6c-.1.5-.3 1.2 1 .7 1.4-.6 7.4-4.4 10.1-7.5 1.5-1.9 2.2-3.3 2.2-4.9zM7.5 13.5H5.8c-.4 0-.7-.3-.7-.7V8.8c0-.4.3-.7.7-.7s.7.3.7.7v3.3h1c.4 0 .7.3.7.7s-.3.7-.7.7zm2.9-.7c0 .4-.3.7-.7.7s-.7-.3-.7-.7V8.8c0-.4.3-.7.7-.7s.7.3.7.7v4zm5.8 0c0 .3-.2.6-.5.7-.1.1-.3.1-.4.1-.2 0-.4-.1-.5-.2l-2.4-3.3v2.8c0 .4-.3.7-.7.7s-.7-.3-.7-.7V8.8c0-.3.2-.6.5-.7.3-.1.7 0 .9.3l2.4 3.3V8.8c0-.4.3-.7.7-.7s.7.3.7.7v4zm4.1-3.3h-1.8v1.2h1.8c.4 0 .7.3.7.7s-.3.7-.7.7h-2.5c-.4 0-.7-.3-.7-.7V8.8c0-.4.3-.7.7-.7h2.5c.4 0 .7.3.7.7s-.3.7-.7.7z"/>
        </svg>
      ),
      color: '#06C755',
      hasCopy: true,
    },
    {
      id: 'facebook',
      label: isEn ? 'Official Facebook Page' : 'Facebook เพจโรงงาน',
      desc: isEn ? 'Sia Thon Fa Throng Thai' : 'เสี่ยธนท์ ฝาทรงไทย',
      href: 'https://www.facebook.com/seiy.thnth.fa.thrng.thiy?locale=th_TH',
      badge: isEn ? 'Open Page' : 'เปิดเพจ',
      bgGradient: 'from-blue-600 to-indigo-700',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: '#1877F2',
    },
    {
      id: 'maps',
      label: isEn ? 'Workshop Location (GPS)' : 'แผนที่ตั้งโรงงาน (GPS)',
      desc: isEn ? 'Ban Lat, Phetchaburi' : 'อ.บ้านลาด จ.เพชรบุรี',
      href: 'https://maps.app.goo.gl/zjEMkAjqmUyRDRxe7',
      badge: isEn ? 'Open Maps' : 'เปิด Google Maps',
      bgGradient: 'from-red-500 to-rose-700',
      icon: MapPin,
      color: '#EA4335',
    },
  ];

  return (
    <div ref={menuRef} className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2.5 sm:gap-3.5 pointer-events-auto">
      {/* Speech Bubble Pill */}
      {!isChatOpen && !isContactMenuOpen && (
        <div
          onClick={() => {
            setIsContactMenuOpen(false);
            onOpenChat();
          }}
          className="bg-white/95 backdrop-blur-md text-[#2D1B0E] text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-2xl shadow-lg border border-[#C59139]/40 hidden md:flex items-center gap-2 cursor-pointer hover:border-[#C59139] transition-all hover:scale-102 hover:shadow-xl group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="group-hover:text-[#A87424] transition-colors">{t.floating.chatPrompt}</span>
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
        </div>
      )}

      {/* Contact Channels Popup Modal */}
      {isContactMenuOpen && (
        <div className="absolute bottom-[68px] sm:bottom-[78px] right-0 w-[300px] sm:w-[330px] bg-white rounded-3xl p-4 shadow-2xl border-2 border-[#C59139]/40 space-y-3 animate-fadeIn z-50">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F2ECE4]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center text-white shadow-xs">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#2D1B0E]">{isEn ? 'Workshop Contact Channels' : 'ช่องทางติดต่อโรงงาน'}</h3>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isEn ? 'Open Mon - Sat 08:00 - 17:00' : 'เปิดบริการ จ.-ส. 08:00 - 17:00 น.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsContactMenuOpen(false)}
              className="p-1.5 rounded-xl text-[#8C735A] hover:bg-[#FAF5EE] hover:text-[#2D1B0E] transition-colors"
              aria-label={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Cards List */}
          <div className="space-y-2">
            {contactList.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-gradient-to-r hover:from-[#FAF5EE] hover:to-[#F5ECE0] border border-[#EBE3D7] hover:border-[#C59139]/50 transition-all duration-200 group shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${item.bgGradient} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#2D1B0E] group-hover:text-[#A87424] transition-colors truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#7A6450] font-medium truncate">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.hasCopy && (
                      <button
                        onClick={copyLineId}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                        title={isEn ? "Copy LINE ID" : "คัดลอก LINE ID"}
                      >
                        {copiedLine ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{isEn ? 'Copied' : 'คัดลอกแล้ว'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-emerald-600" />
                            <span>{isEn ? 'Copy ID' : 'คัดลอก ID'}</span>
                          </>
                        )}
                      </button>
                    )}
                    <div className="w-7 h-7 rounded-xl bg-white group-hover:bg-[#C59139] group-hover:text-white text-[#8C735A] border border-[#E2D5C5] flex items-center justify-center transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="p-2 rounded-xl bg-[#FAF5EE] border border-[#EADFCF] text-center">
            <span className="text-[10px] text-[#8C735A]">
              {isEn ? 'Free consultation & preliminary estimates for all custom woodwork' : 'ยินดีให้คำปรึกษาและประเมินราคาชิ้นงานฟรีทุกรายการ'}
            </span>
          </div>
        </div>
      )}

      {/* Button 1: Mascot Chatbot Floating Button */}
      <button
        onClick={() => {
          setIsContactMenuOpen(false);
          onOpenChat();
        }}
        className={`relative w-[54px] h-[54px] sm:w-[62px] sm:h-[62px] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 shrink-0 ${
          isChatOpen
            ? 'bg-[#2D1A0E] border-[#C59139] text-white rotate-90'
            : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EE] to-[#EAE0D2] border-[#C59139] hover:border-[#DDA64A]'
        }`}
        style={{
          boxShadow: '0 8px 25px rgba(45, 27, 14, 0.3), 0 2px 10px rgba(197, 145, 57, 0.4)',
        }}
        aria-label={t.floating.chatTitle}
        title={t.floating.chatTitle}
      >
        {isChatOpen ? (
          <X className="w-6 h-6 text-[#F3CE90]" />
        ) : (
          <div className="relative w-full h-full rounded-full overflow-hidden p-1 flex items-center justify-center">
            <Image
              src="/images/Robot_Mascot.png"
              alt={t.chatbot.botName}
              fill
              sizes="62px"
              className="object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm"
              priority
            />
            {/* Online Green Dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10 shadow-xs"></span>
          </div>
        )}
      </button>

      {/* Button 2: Enhanced Eye-Catching Contact Button */}
      <button
        onClick={() => {
          setIsContactMenuOpen(!isContactMenuOpen);
        }}
        className={`group relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shrink-0 border-2 border-white/80 shadow-2xl ${
          isContactMenuOpen 
            ? 'bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#334155] border-[#C59139] rotate-45' 
            : 'bg-gradient-to-tr from-[#0F4C81] via-[#1E6091] to-[#2A9D8F] hover:from-[#0B3C66] hover:to-[#1F7A6E]'
        }`}
        style={{
          boxShadow: isContactMenuOpen 
            ? '0 6px 20px rgba(15, 23, 42, 0.4)'
            : '0 6px 18px rgba(15, 76, 129, 0.35)',
        }}
        aria-label={isEn ? 'Workshop Contact Channels' : 'ช่องทางติดต่อโรงงาน'}
        title={isEn ? 'Contact Channels (Call / LINE / Facebook / Maps)' : 'ช่องทางติดต่อโรงงาน (โทร/LINE/Facebook/แผนที่)'}
      >
        {/* Subtle Soft Glow Aura */}
        {!isContactMenuOpen && (
          <span className="absolute -inset-0.5 rounded-full bg-teal-400/20 blur-[2px] animate-pulse pointer-events-none -z-10"></span>
        )}

        {isContactMenuOpen ? (
          <X className="w-6 h-6 text-gold-300" />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <MessageSquareShare className="w-6 h-6 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform drop-shadow-sm" />
            <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-tighter leading-none mt-0.5 hidden sm:block">
              {isEn ? 'Contact' : 'ติดต่อ'}
            </span>
          </div>
        )}

        {/* Small Active Badge */}
        {!isContactMenuOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-amber-500 to-orange-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            4
          </span>
        )}
      </button>
    </div>
  );
}

