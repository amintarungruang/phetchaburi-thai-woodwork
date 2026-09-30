'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  PackagePlus,
  Truck,
  FileText,
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { InventoryItem } from '@/types';
import { formatThaiDate } from '@/lib/utils';

interface InventoryReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function InventoryReorderModal({
  isOpen,
  onClose,
  item,
}: InventoryReorderModalProps) {
  const [orderQty, setOrderQty] = useState<number>(20);
  const [vendorName, setVendorName] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('ขอสเปกไม้สักทองคัดเกรด ไร้กระพี้ แห้งสนิท');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync default quantity when item opens
  React.useEffect(() => {
    if (item) {
      const suggest = Math.max(item.min_threshold * 2, 10);
      setOrderQty(suggest);
      setVendorName('');
      setUnitPrice('');
      setIsUrgent(item.status === 'out_of_stock');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const today = new Date();
  const poNumber = `PO-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${item.id.replace(/\D/g, '').slice(-4) || '1001'}`;
  const totalEstimatedCost = unitPrice && Number(unitPrice) > 0 ? Number(unitPrice) * orderQty : null;

  // Copy to LINE format
  const handleCopyLine = () => {
    const text = `📦 ใบสั่งซื้อไม้สักและวัสดุ (เลขที่ ${poNumber})
โรงงานช่างไม้ฝาทรงไทยเมืองเพชร
-----------------------------------
เรียน: ${vendorName || 'ร้านค้าไม้ / ซัพพลายเออร์'}
${isUrgent ? '🚨 **ขอสั่งซื้อด่วนพิเศษ (งานผลิตกำลังรอไม้)**' : '📋 ขอสั่งซื้อวัสดุตามรายการดังนี้:'}

• รายการ: ${item.item_name}
• หมวดหมู่: ${item.category_name_th || item.category}
• สเปก/ขนาด: ${item.specification || 'ตามมาตรฐานโรงงาน'}
• จำนวนที่สั่ง: ${orderQty} ${item.unit}
${unitPrice ? `• ราคาต่อหน่วยที่ตกลง: ${Number(unitPrice).toLocaleString()} บาท/${item.unit}` : ''}
${totalEstimatedCost ? `• ยอดรวมประมาณการ: ${totalEstimatedCost.toLocaleString()} บาท` : ''}
${notes ? `• หมายเหตุ: ${notes}` : ''}

📍 สถานที่ส่งมอบ: โรงงานช่างไม้ฝาทรงไทยเมืองเพชร อ.บ้านลาด จ.เพชรบุรี
📞 ผู้สั่งซื้อ: 084-042-6571 (คุณเอส)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL DIALOG (Hidden when printing) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/80 backdrop-blur-sm animate-fadeIn print:hidden">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gold-500/30 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-wood-900 to-wood-950 text-white flex items-center justify-between border-b border-gold-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-cream-50 leading-tight">
                  ใบขอสั่งซื้อ / สั่งไม้เพิ่ม (Purchase Order Reorder)
                </h2>
                <p className="text-[11px] text-gold-400 font-mono">
                  เลขที่เอกสาร: {poNumber}
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

          {/* Form Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Target Item Highlight */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-wood-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-wide">
                  วัสดุที่ต้องการสั่งซื้อ
                </span>
                <h3 className="text-base font-bold text-wood-950 mt-0.5">
                  {item.item_name}
                </h3>
                <p className="text-xs text-wood-600 mt-0.5">
                  {item.specification || 'ไม่มีรายละเอียดสเปก'}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0 bg-white p-2.5 rounded-xl border border-wood-200">
                <div className="text-[10px] text-wood-500">สต็อกคงเหลือปัจจุบัน</div>
                <div className={`text-base font-bold font-mono ${item.quantity <= item.min_threshold ? 'text-amber-600' : 'text-wood-900'}`}>
                  {item.quantity} {item.unit}
                </div>
                <div className="text-[10px] text-wood-400">เกณฑ์เตือน: &le; {item.min_threshold} {item.unit}</div>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-wood-900 mb-1">
                  จำนวนที่ต้องการสั่งซื้อ * ({item.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-mono font-bold text-sm text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-wood-900 mb-1">
                  ราคาต่อหน่วยโดยประมาณ (บาท/{item.unit})
                </label>
                <input
                  type="number"
                  placeholder="ระบุราคาต่อหน่วย (ถ้ามี)"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-mono text-xs text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-wood-900 mb-1">
                  ชื่อร้านค้าไม้ / ซัพพลายเออร์
                </label>
                <input
                  type="text"
                  placeholder="เช่น โรงเลื่อยไม้สัก หรือ ร้านค้าส่ง..."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white text-xs text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-wood-200 bg-wood-50 hover:bg-amber-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-wood-900 text-xs">
                    🚨 สั่งด่วนพิเศษ (งานผลิตกำลังรอวัสดุ)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-wood-900 mb-1">
                หมายเหตุข้อกำหนดการส่งมอบ
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ระบุสเปกเพิ่มเติม เช่น ไม้สักทองคัดเกรด ไร้ตาไม้ ไร้กระพี้..."
                className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white text-xs text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs"
              />
            </div>

            {/* Delivery Destination Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-wood-800 flex items-start gap-2.5 text-[11px]">
              <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">สถานที่จัดส่ง: </span>
                <span>โรงงานช่างไม้ฝาทรงไทยเมืองเพชร อ.บ้านลาด จ.เพชรบุรี | ติดต่อ: คุณเอส 084-042-6571</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-wood-50 border-t border-wood-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-wood-300 text-wood-700 hover:bg-wood-100 text-xs font-semibold transition-colors"
            >
              ปิด
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleCopyLine}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05B34C] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                title="คัดลอกข้อความเพื่อส่งผ่าน LINE ให้ร้านค้าไม้"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกเรียบร้อย!' : 'คัดลอกส่ง LINE'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบสั่งซื้อ (A4 PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRINTABLE A4 PURCHASE ORDER SLIP (Visible ONLY when printing) */}
      {/* ========================================================================= */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[99999]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/wood-logo.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold font-serif leading-tight">
                โรงงานช่างไม้ฝาทรงไทยเมืองเพชร
              </h1>
              <p className="text-xs text-gray-700">
                ผู้เชี่ยวชาญงานไม้สักทองแท้ ประตู หน้าต่าง ฝาปะกน และเรือนไทยเพชรบุรี
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                ที่ตั้ง: อ.บ้านลาด จ.เพชรบุรี | สายตรง: 084-042-6571 (คุณเอส)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded border border-gray-300">
              ใบขอสั่งซื้อวัสดุ (Purchase Order)
            </div>
            <div className="text-xs font-mono font-bold text-gray-900 mt-1">
              เลขที่: {poNumber}
            </div>
            <div className="text-[10px] text-gray-500">
              วันที่สั่งซื้อ: {formatThaiDate(today.toISOString().split('T')[0])}
            </div>
          </div>
        </div>

        {/* Vendor & Delivery Box */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-300 p-3 rounded text-[11px] mb-4">
          <div>
            <div className="font-bold text-gray-900 uppercase">สั่งซื้อถึง (ซัพพลายเออร์):</div>
            <div className="font-semibold text-sm mt-0.5">{vendorName || 'ร้านค้าไม้ / ซัพพลายเออร์ผู้จัดจำหน่าย'}</div>
            <div className="text-gray-600 mt-0.5">ความเร่งด่วน: {isUrgent ? '🚨 ด่วนที่สุด (งานผลิตกำลังรอ)' : 'ปกติ'}</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 uppercase">สถานที่ส่งมอบสินค้า:</div>
            <div className="font-semibold mt-0.5">โรงงานช่างไม้ฝาทรงไทยเมืองเพชร</div>
            <div className="text-gray-600">อ.บ้านลาด จ.เพชรบุรี | โทร. 084-042-6571 (คุณเอส)</div>
          </div>
        </div>

        {/* Purchase Items Table */}
        <table className="w-full text-left text-xs border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold">
              <th className="p-2 border-r border-gray-300 w-10 text-center">#</th>
              <th className="p-2 border-r border-gray-300">รายการวัสดุ / ไม้สัก</th>
              <th className="p-2 border-r border-gray-300">สเปก / ขนาด / เกรดไม้</th>
              <th className="p-2 border-r border-gray-300 w-24 text-center">จำนวนสั่งซื้อ</th>
              <th className="p-2 border-r border-gray-300 w-28 text-right">ราคา/หน่วย (บาท)</th>
              <th className="p-2 w-32 text-right">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 border-r border-gray-200 text-center font-semibold">1</td>
              <td className="p-3 border-r border-gray-200 font-bold">
                <div>{item.item_name}</div>
                <div className="text-[10px] text-gray-500 font-normal">หมวดหมู่: {item.category_name_th || item.category}</div>
              </td>
              <td className="p-3 border-r border-gray-200 text-gray-700">
                <div>{item.specification || '-'}</div>
                {notes && <div className="text-[10px] text-gray-500 mt-1">ข้อกำหนด: {notes}</div>}
              </td>
              <td className="p-3 border-r border-gray-200 text-center font-mono font-bold text-sm">
                {orderQty} {item.unit}
              </td>
              <td className="p-3 border-r border-gray-200 text-right font-mono">
                {unitPrice ? Number(unitPrice).toLocaleString() : '-'}
              </td>
              <td className="p-3 text-right font-mono font-bold">
                {totalEstimatedCost ? totalEstimatedCost.toLocaleString() : '-'}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-300 font-bold">
              <td colSpan={5} className="p-2.5 text-right border-r border-gray-300">
                ยอดรวมประมาณการสั่งซื้อสุทธิ:
              </td>
              <td className="p-2.5 text-right font-mono text-sm">
                {totalEstimatedCost ? `${totalEstimatedCost.toLocaleString()} บาท` : 'ตามใบแจ้งหนี้'}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Terms */}
        <div className="border border-gray-300 rounded p-3 text-[10px] text-gray-600 space-y-1 mb-10">
          <p className="font-bold text-gray-900">เงื่อนไขการส่งมอบและการชำระเงิน:</p>
          <p>1. ไม้สักทองและวัสดุทั้งหมดต้องผ่านการคัดเกรดตามมาตรฐานที่ระบุ หากพบมีกระพี้ ตาไม้เสีย หรือความชื้นเกินเกณฑ์ ทางโรงงานขอสงวนสิทธิ์ส่งคืน</p>
          <p>2. จัดส่งสินค้าถึงโรงงานช่างไม้ฝาทรงไทยเมืองเพชร อ.บ้านลาด จ.เพชรบุรี ภายในกำหนดเวลา</p>
          <p>3. ชำระเงินตามเงื่อนไขที่ตกลงร่วมกันหลังตรวจรับสินค้าเรียบร้อย</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้ขอสั่งซื้อ / ผู้ดูแลสต็อก</p>
            <p className="text-[10px] text-gray-500 mt-0.5">(........................................................)</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้อนุมัติสั่งซื้อ / เจ้าของโรงงาน</p>
            <p className="text-[10px] text-gray-500 mt-0.5">( คุณเอส )</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
        </div>
      </div>
    </>
  );
}
