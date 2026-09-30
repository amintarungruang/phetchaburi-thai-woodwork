'use client';

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Copy,
  Check,
  Phone,
  Calendar,
  Building,
  ShieldCheck
} from 'lucide-react';
import { Lead } from '@/types';
import { formatThaiDate } from '@/lib/utils';

interface LeadQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export default function LeadQuotationModal({ isOpen, onClose, lead }: LeadQuotationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

  const quoteNo = `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${lead.id.slice(-4).toUpperCase()}`;
  const todayFormatted = formatThaiDate(new Date().toISOString());

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLineSummary = () => {
    const text = `📋 [ใบเสนอราคาเบื้องต้น] โรงงานฝาทรงไทยเมืองเพชร
━━━━━━━━━━━━━━━━━━━━
📄 เลขที่เอกสาร: ${quoteNo}
👤 เรียนคุณ: ${lead.customer_name}
📞 เบอร์ติดต่อ: ${lead.phone_number}
🪵 รายการงาน: ${lead.interest_type}
📐 สเปก/ขนาด: ${lead.dimensions || 'ตามสเปกมาตรฐานไม้สักทอง'}
💰 ช่วงราคาประเมิน: ${lead.budget_range || 'รอสรุปตามแบบ'}
📝 รายละเอียด: ${lead.notes || 'งานไม้สักทองคัดเกรด อบแห้งได้มาตรฐาน'}
━━━━━━━━━━━━━━━━━━━━
💡 เงื่อนไข: มัดจำ 50% เมื่อเริ่มงาน / ชำระ 50% วันส่งมอบ
✨ รับประกันคุณภาพโครงสร้างไม้สักแท้ 1 ปี
📞 สอบถามเพิ่มเติม: 084-042-6571 (คุณเอส)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Screen Preview Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm print:hidden animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-gold-500/40 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-cream-50 leading-tight">
                  ใบเสนอราคา / ใบประเมินราคา (Quotation)
                </h2>
                <p className="text-[11px] text-gold-400">
                  สำหรับส่งมอบให้ลูกค้า: <span className="text-white font-bold">{lead.customer_name}</span> ({quoteNo})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-cream-300 hover:text-white hover:bg-wood-800 transition-colors"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paper Preview Card */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#F5F2EC]">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-wood-200 text-xs text-wood-900 space-y-6 max-w-2xl mx-auto">
              
              {/* Top Banner */}
              <div className="flex items-start justify-between border-b-2 border-gold-600 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/wood-logo.png"
                    alt="Logo"
                    className="w-14 h-14 object-contain shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base font-serif text-wood-950 leading-tight">
                      โรงงานช่างไม้ฝาทรงไทยเมืองเพชร
                    </h3>
                    <p className="text-[11px] text-wood-700 mt-0.5">
                      เชี่ยวชาญงานฝาเรือนไทย โครงจั่วเพชรบุรี ประตูแกะสลัก และงานไม้สักแท้
                    </p>
                    <p className="text-[10px] text-wood-500">
                      อ.บ้านลาด จ.เพชรบุรี | โทร: 084-042-6571 (คุณเอส)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-lg bg-wood-900 text-gold-400 font-bold text-xs uppercase tracking-wider">
                    ใบเสนอราคา
                  </span>
                  <div className="text-[11px] font-bold text-wood-900 mt-2">เลขที่: {quoteNo}</div>
                  <div className="text-[10px] text-wood-500">วันที่: {todayFormatted}</div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="p-3.5 rounded-xl bg-wood-50/80 border border-wood-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-wood-950">เรียนลูกค้า: </span>
                  <span className="text-gold-900 font-semibold">{lead.customer_name}</span>
                </div>
                <div>
                  <span className="font-bold text-wood-950">เบอร์โทรศัพท์: </span>
                  <span className="font-mono text-emerald-800 font-bold">{lead.phone_number}</span>
                </div>
                <div>
                  <span className="font-bold text-wood-950">LINE ID: </span>
                  <span>{lead.line_id || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-wood-950">สถานะเอกสาร: </span>
                  <span className="text-emerald-700 font-semibold">ข้อเสนอราคามาตรฐานโรงงาน</span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="rounded-xl border border-wood-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-wood-100 text-wood-800 font-bold border-b border-wood-200">
                    <tr>
                      <th className="p-3 w-12 text-center">ลำดับ</th>
                      <th className="p-3">รายการงานไม้สั่งทำ & สเปก</th>
                      <th className="p-3 w-36 text-right">ช่วงราคาประเมิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100">
                    <tr>
                      <td className="p-3 text-center font-bold text-wood-500">1</td>
                      <td className="p-3 space-y-1">
                        <div className="font-bold text-wood-950 text-sm">{lead.interest_type}</div>
                        {lead.dimensions && (
                          <div className="text-[11px] text-wood-600 font-medium">
                            • สเปก/ขนาด: <span className="text-wood-900 font-semibold">{lead.dimensions}</span>
                          </div>
                        )}
                        {lead.notes && (
                          <div className="text-[11px] text-wood-500 italic">
                            • รายละเอียดเพิ่มเติม: {lead.notes}
                          </div>
                        )}
                        <div className="text-[10px] text-emerald-700 font-medium pt-1">
                          ✓ ไม้สักทองแท้คัดเกรด อบแห้งได้มาตรฐาน ปลวกไม่กิน
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-base text-gold-900 align-top">
                        {lead.budget_range || 'ประเมินตามแบบ'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms & Guarantees */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-[11px] text-wood-800">
                <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>เงื่อนไขการรับประกันและการชำระเงิน:</span>
                </div>
                <p>1. มัดจำ 50% เมื่องานเริ่มขึ้นรูปในโรงงาน และชำระส่วนที่เหลือ 50% ในวันส่งมอบหรือติดตั้งหน้างาน</p>
                <p>2. การผลิตดำเนินการโดยช่างไม้ผู้เชี่ยวชาญจากเพชรบุรี รับประกันความคงทนและลายไทยดั้งเดิม</p>
                <p>3. ใบเสนอราคานี้มีผลบังคับใช้ 30 วันนับจากวันที่ออกเอกสาร</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-wood-200 text-center text-xs">
                <div>
                  <div className="border-b border-wood-400 w-44 mx-auto mb-2 pt-6"></div>
                  <p className="font-bold text-wood-900">ผู้เสนอราคา (โรงงานฝาทรงไทย)</p>
                  <p className="text-[10px] text-wood-500 mt-0.5">( คุณเอส - ช่างไม้เมืองเพชร )</p>
                  <p className="text-[10px] text-wood-500">โทร 084-042-6571</p>
                </div>
                <div>
                  <div className="border-b border-wood-400 w-44 mx-auto mb-2 pt-6"></div>
                  <p className="font-bold text-wood-900">ผู้อนุมัติสั่งทำ (ลูกค้า)</p>
                  <p className="text-[10px] text-wood-500 mt-0.5">( {lead.customer_name} )</p>
                  <p className="text-[10px] text-wood-500">วันที่ ...... / ...... / ..........</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-white border-t border-wood-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleCopyLineSummary}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-wood-300 bg-wood-50 hover:bg-wood-100 text-wood-800 text-xs font-bold transition-all active:scale-95"
              title="คัดลอกข้อความสรุปเพื่อนำไปส่งในแชท LINE"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">คัดลอกข้อความสรุปแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-wood-600" />
                  <span>คัดลอกสรุปส่ง LINE</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-wood-300 text-wood-700 hover:bg-wood-100 text-xs font-semibold transition-colors"
              >
                ปิด
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสนอราคา (PDF / Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRINTABLE A4 QUOTATION (Visible ONLY when printing) */}
      {/* ========================================================================= */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-[99999]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/images/wood-logo.png"
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold font-serif leading-tight">
                โรงงานช่างไม้ฝาทรงไทยเมืองเพชร
              </h1>
              <p className="text-xs text-gray-700 mt-0.5">
                สถาปัตยกรรมไม้สักแท้ หน้าจั่วทรงไทย ฝาปะกน ประตูแกะสลัก วงกบ และศาลาทรงไทย
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                ที่ตั้งโรงงาน: อ.บ้านลาด จ.เพชรบุรี | โทรศัพท์สายตรง: 084-042-6571 (คุณเอส)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-bold uppercase tracking-wider bg-gray-100 px-4 py-1 rounded border border-black inline-block">
              ใบเสนอราคา
            </div>
            <div className="text-xs font-bold mt-2">เลขที่: {quoteNo}</div>
            <div className="text-xs text-gray-600">วันที่: {todayFormatted}</div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="border border-gray-300 p-4 rounded mb-6 text-xs grid grid-cols-2 gap-2 bg-gray-50">
          <div>
            <span className="font-bold">เรียนลูกค้า: </span>
            <span className="text-sm font-semibold">{lead.customer_name}</span>
          </div>
          <div>
            <span className="font-bold">เบอร์โทรศัพท์: </span>
            <span>{lead.phone_number}</span>
          </div>
          <div>
            <span className="font-bold">LINE ID: </span>
            <span>{lead.line_id || '-'}</span>
          </div>
          <div>
            <span className="font-bold">เงื่อนไข: </span>
            <span>ราคางานสั่งทำพร้อมติดตั้ง</span>
          </div>
        </div>

        {/* Quotation Table */}
        <table className="w-full text-left text-xs border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold">
              <th className="p-3 border-r border-gray-300 w-12 text-center">ลำดับ</th>
              <th className="p-3 border-r border-gray-300">รายการงาน & สเปกไม้</th>
              <th className="p-3 w-40 text-right">ราคาประเมิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 border-r border-gray-200 text-center font-bold">1</td>
              <td className="p-3 border-r border-gray-200 space-y-1">
                <div className="font-bold text-sm">{lead.interest_type}</div>
                {lead.dimensions && (
                  <div className="text-xs text-gray-700">
                    • ขนาด/สเปก: <b>{lead.dimensions}</b>
                  </div>
                )}
                {lead.notes && (
                  <div className="text-[11px] text-gray-600 italic">
                    • หมายเหตุ: {lead.notes}
                  </div>
                )}
                <div className="text-[10px] text-gray-600">
                  • คัดไม้สักทองแท้ อบแห้งได้มาตรฐาน แข็งแรง ทนทาน ลวดลายประณีต
                </div>
              </td>
              <td className="p-3 text-right font-bold text-base align-top">
                {lead.budget_range || 'ตามตกลง'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Terms */}
        <div className="border border-gray-300 p-4 rounded text-xs bg-gray-50 mb-10 space-y-1">
          <div className="font-bold mb-1">เงื่อนไขการสั่งผลิตและการรับประกัน:</div>
          <p>1. มัดจำ 50% เมื่องานเริ่มขึ้นรูปในโรงงาน และชำระส่วนที่เหลือ 50% ในวันส่งมอบหรือติดตั้งหน้างาน</p>
          <p>2. ผลิตโดยช่างไม้ผู้เชี่ยวชาญจากเพชรบุรี รับประกันความคงทนและลายไทยดั้งเดิม</p>
          <p>3. ใบเสนอราคานี้มีผลบังคับใช้ 30 วันนับจากวันที่ออกเอกสาร</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-16 text-center text-xs">
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-bold">ลงชื่อผู้เสนอราคา (โรงงานฝาทรงไทย)</p>
            <p className="text-[11px] text-gray-600 mt-0.5">( คุณเอส )</p>
            <p className="text-[10px] text-gray-500">โทร 084-042-6571</p>
          </div>
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-bold">ลงชื่อผู้อนุมัติสั่งทำ (ลูกค้า)</p>
            <p className="text-[11px] text-gray-600 mt-0.5">( {lead.customer_name} )</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
        </div>
      </div>
    </>
  );
}
