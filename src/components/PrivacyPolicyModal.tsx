'use client';

import React from 'react';
import { ShieldCheck, X, Lock, Eye, FileText, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { t, isEn } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-wood-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-cream-50 font-serif">
                {t.privacyPolicy.title}
              </h2>
              <p className="text-xs text-gold-300 font-light">
                {isEn 
                  ? 'Thai Heritage Woodcraft • Phetchaburi Teak (in compliance with PDPA)' 
                  : 'โรงงานฝาทรงไทย ไม้สัก เพชรบุรี (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล PDPA)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-wood-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-wood-800 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-wood-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-600" />
              <span>{isEn ? '1. Purpose of Data Collection' : '1. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล'}</span>
            </h3>
            <p className="text-wood-600">
              {isEn 
                ? 'Thai Heritage Woodcraft prioritizes the privacy and security of your personal data. Information you provide via chatbot, estimator, or website forms (e.g. name, phone number, LINE ID, project dimensions) is used for:'
                : 'โรงงานฝาทรงไทย ไม้สัก เพชรบุรี ให้ความสำคัญสูงสุดต่อการคุ้มครองข้อมูลส่วนบุคคลของท่าน ข้อมูลที่ท่านกรอกผ่านระบบแชทบอท, ระบบคำนวณราคา หรือการติดต่อทางหน้าเว็บไซต์ (เช่น ชื่อ, เบอร์โทรศัพท์, LINE ID, รายละเอียดแบบงานที่ต้องการ) จะถูกนำมาใช้เพื่อ:'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-wood-700 pl-2">
              <li>{isEn ? 'Direct follow-up consultations and accurate project quoting' : 'การติดต่อกลับเพื่อประเมินราคาและปรึกษาแบบงานไม้สัก'}</li>
              <li>{isEn ? 'Order confirmation, production scheduling, delivery & installation' : 'การยืนยันคำสั่งซื้อ จัดคิวผลิต และนัดหมายการจัดส่ง/ติดตั้งหน้างาน'}</li>
              <li>{isEn ? 'Providing product details and care recommendations' : 'การให้บริการข้อมูลเพิ่มเติมเกี่ยวกับผลิตภัณฑ์ของโรงงาน'}</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-wood-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-600" />
              <span>{isEn ? '2. Data Security & Storage' : '2. มาตรการรักษาความปลอดภัยของข้อมูล'}</span>
            </h3>
            <p className="text-wood-600">
              {isEn
                ? 'Your data is protected using standard encryption protocols. We have a strict policy never to sell, distribute, or share your personal information with third parties.'
                : 'ข้อมูลของท่านจะถูกจัดเก็บในระบบฐานข้อมูลที่มีการเข้ารหัสความปลอดภัยมาตรฐานสูง (SSL 256-bit Encryption) ทางโรงงานไม่มีนโยบายส่งต่อ เผยแพร่ หรือจำหน่ายข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกโดยเด็ดขาด'}
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-wood-950 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold-600" />
              <span>{isEn ? '3. Use of Cookies' : '3. การใช้งานคุกกี้ (Cookies)'}</span>
            </h3>
            <p className="text-wood-600">
              {isEn ? 'Our website uses cookies for:' : 'เว็บไซต์ของเราใช้คุกกี้เพื่อ:'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-wood-700 pl-2">
              <li>{isEn ? 'Strictly Necessary Cookies: For security and site functionality' : 'คุกกี้ที่จำเป็น (Strictly Necessary): เพื่อความปลอดภัยและจดจำการทำงานของระบบ'}</li>
              <li>{isEn ? 'Functional Storage: To cache gallery previews and remember language preferences' : 'คุกกี้การทำงาน (Functional Storage): เพื่อให้เว็บไซต์สามารถโหลดข้อมูลผลงานได้อย่างรวดเร็ว (Instant Cache)'}</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-wood-950 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-600" />
              <span>{isEn ? '4. Data Subject Rights & Workshop Contact' : '4. สิทธิของเจ้าของข้อมูลและการติดต่อ'}</span>
            </h3>
            <p className="text-wood-600">
              {isEn 
                ? 'You have the right to request access to, correction of, or deletion of your personal data at any time by contacting us:' 
                : 'ท่านมีสิทธิ์ในการขอตรวจสอบ แก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่านออกจากระบบได้ตลอดเวลา โดยสามารถติดต่อผู้ดูแลข้อมูลของโรงงานได้ที่:'}
            </p>
            <div className="p-3.5 rounded-2xl bg-wood-50 border border-wood-200 text-xs space-y-1 text-wood-800">
              <div><strong>{isEn ? 'Thai Heritage Woodcraft • Phetchaburi Teak' : 'โรงงานฝาทรงไทย ไม้สัก เพชรบุรี'}</strong></div>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-600" /> {isEn ? 'Ban Lat District, Phetchaburi Province 76150' : 'อ.บ้านลาด จ.เพชรบุรี 76150'}</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold-600" /> {isEn ? 'Tel: 084-042-6571 (Master Artisan S)' : 'โทร: 084-042-6571 (ช่างเอส)'}</div>
              <div>LINE ID: 8238sdy</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-wood-50 border-t border-wood-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl btn-gold text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t.privacyPolicy.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}