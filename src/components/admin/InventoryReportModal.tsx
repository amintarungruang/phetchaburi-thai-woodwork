'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Filter,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { InventoryItem, CategoryItem } from '@/types';
import { formatThaiDate } from '@/lib/utils';

interface InventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  categories: CategoryItem[];
}

export default function InventoryReportModal({
  isOpen,
  onClose,
  inventory,
  categories,
}: InventoryReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'in_stock' && item.status !== 'in_stock') {
        return false;
      }
      if (selectedStatus === 'low_stock' && (item.status !== 'low_stock' && item.status !== 'out_of_stock')) {
        return false;
      }
      if (selectedStatus === 'out_of_stock' && item.status !== 'out_of_stock') {
        return false;
      }
      return true;
    });
  }, [inventory, selectedCategory, selectedStatus]);

  // Summary counts
  const summary = useMemo(() => {
    const total = filteredItems.length;
    const inStock = filteredItems.filter((i) => i.status === 'in_stock').length;
    const lowStock = filteredItems.filter((i) => i.status === 'low_stock').length;
    const outOfStock = filteredItems.filter((i) => i.status === 'out_of_stock').length;
    const needReorder = lowStock + outOfStock;
    return { total, inStock, lowStock, outOfStock, needReorder };
  }, [filteredItems]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      alert('ไม่มีข้อมูลวัสดุในเงื่อนไขที่เลือก');
      return;
    }

    const rows = filteredItems.map((item, index) => ({
      'ลำดับ': index + 1,
      'ชื่อรายการวัสดุ / ไม้สัก': item.item_name,
      'หมวดหมู่': item.category_name_th || item.category,
      'สเปก / ขนาด / เกรด': item.specification || '-',
      'คงเหลือ': item.quantity,
      'หน่วยนับ': item.unit,
      'เกณฑ์เตือนขั้นต่ำ': item.min_threshold,
      'สถานะสต็อก':
        item.status === 'out_of_stock'
          ? 'หมดสต็อก'
          : item.status === 'low_stock'
          ? 'ใกล้หมด (ต้องสั่งเพิ่ม)'
          : 'พร้อมใช้งาน',
      'อัปเดตสต็อคล่าสุด': item.last_restocked || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 18 },
      { wch: 35 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 22 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานสต็อกวัสดุ');

    const dateStr = new Date().toISOString().split('T')[0];
    const catLabel = selectedCategory === 'all' ? 'ทุกหมวดหมู่' : selectedCategory;
    XLSX.writeFile(workbook, `รายงานสต็อกไม้และวัสดุ_${catLabel}_${dateStr}.xlsx`);
  };

  // Trigger Print to PDF
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentCategoryName =
    selectedCategory === 'all'
      ? 'ทุกหมวดหมู่วัสดุ'
      : categories.find((c) => c.id === selectedCategory)?.name_th || selectedCategory;

  const currentStatusLabel =
    selectedStatus === 'all'
      ? 'ทุกสถานะสต็อก'
      : selectedStatus === 'low_stock'
      ? 'เฉพาะของใกล้หมด / ต้องสั่งเพิ่ม'
      : selectedStatus === 'out_of_stock'
      ? 'เฉพาะสินค้าหมดสต็อก'
      : 'เฉพาะสต็อกปกติพร้อมใช้งาน';

  return (
    <>
      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL DIALOG (Hidden when printing) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/80 backdrop-blur-sm animate-fadeIn print:hidden">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gold-500/30 overflow-hidden">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-wood-900 to-wood-950 text-white flex items-center justify-between border-b border-gold-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-cream-50 leading-tight">
                  พิมพ์รายงานสต็อกไม้และวัสดุ (Inventory Stocktaking Report)
                </h2>
                <p className="text-[11px] text-gold-400">
                  เลือกหมวดหมู่และสถานะเพื่อสรุปยอดคงเหลือ พิมพ์เอกสาร A4 หรือส่งออกเป็นไฟล์ Excel
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

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Filter Section */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-wood-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gold-600" />
                  <span>หมวดหมู่วัสดุ</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">ทุกหมวดหมู่ ({inventory.length} รายการ)</option>
                  {categories.map((c) => {
                    const count = inventory.filter((i) => i.category === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name_th} ({count} รายการ)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-gold-600" />
                  <span>สถานะระดับสต็อก</span>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">ทุกสถานะสต็อก</option>
                  <option value="low_stock">⚠️ ต้องสั่งเพิ่ม (ใกล้หมด & หมดสต็อก)</option>
                  <option value="out_of_stock">❌ เฉพาะหมดสต็อก (0 หน่วย)</option>
                  <option value="in_stock">✅ ปกติพร้อมใช้งาน</option>
                </select>
              </div>
            </div>

            {/* Summary Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-wood-50 border border-wood-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-wood-950 text-xs">สรุปรายการ:</span>
                <span className="text-gold-900 font-bold">{currentCategoryName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-wood-900 text-gold-400 font-bold text-xs">
                  {summary.total} รายการ
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold">
                  พร้อมใช้งาน: {summary.inStock}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">
                  ใกล้หมด: {summary.lowStock}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-900 font-semibold">
                  หมดสต็อก: {summary.outOfStock}
                </span>
              </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-2xl border border-wood-200 overflow-hidden shadow-2xs">
              <div className="p-2.5 bg-wood-100/70 border-b border-wood-200 font-bold text-wood-800 text-xs flex items-center justify-between">
                <span>ตารางพรีวิวรายการสต็อก ({filteredItems.length} รายการ)</span>
                <span className="text-[10px] text-wood-500 font-normal">แสดงผลก่อนพิมพ์ A4</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-wood-50 border-b border-wood-200 text-wood-600 font-bold">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">รายการวัสดุ / ไม้สัก</th>
                      <th className="py-2 px-3">หมวดหมู่</th>
                      <th className="py-2 px-3">สเปก / ขนาด</th>
                      <th className="py-2 px-3 text-right">คงเหลือ</th>
                      <th className="py-2 px-3 text-center">เกณฑ์เตือน</th>
                      <th className="py-2 px-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100">
                    {filteredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-wood-50/50">
                        <td className="py-2 px-3 text-wood-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-wood-950">
                          {item.item_name}
                        </td>
                        <td className="py-2 px-3 text-wood-600">
                          {item.category_name_th || item.category}
                        </td>
                        <td className="py-2 px-3 text-wood-600 max-w-xs truncate">
                          {item.specification || '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-wood-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-center text-wood-500">
                          &le; {item.min_threshold} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {item.status === 'out_of_stock' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              หมดสต็อก
                            </span>
                          ) : item.status === 'low_stock' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              ใกล้หมด
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              พร้อมใช้งาน
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-wood-400 italic">
                          ไม่มีรายการวัสดุตรงตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-wood-50 border-t border-wood-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-wood-300 text-wood-700 hover:bg-wood-100 text-xs font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                disabled={filteredItems.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-wood-300 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ส่งออก Excel (.xlsx)</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={filteredItems.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-wood-300 text-wood-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์รายงานสต็อก (PDF / Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRINTABLE A4 INVENTORY REPORT (Visible ONLY when printing) */}
      {/* ========================================================================= */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[99999]">
        {/* Print Header */}
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
                รายงานสรุปยอดคงเหลือและตรวจสอบสต็อกไม้สักและวัสดุ (Stocktaking & Inventory Balance)
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                ที่ตั้ง: อ.บ้านลาด จ.เพชรบุรี | สายตรง: 084-042-6571 (คุณเอส)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded border border-gray-300">
              ใบรายงานสต็อกวัสดุ
            </div>
            <div className="text-xs font-bold text-gray-900 mt-1">
              หมวดหมู่: {currentCategoryName}
            </div>
            <div className="text-[10px] text-gray-500">
              พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')} น.
            </div>
          </div>
        </div>

        {/* Summary Ribbon */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-300 p-2.5 rounded text-[11px] mb-4">
          <div>
            <span className="font-bold">สรุปภาพรวมสต็อก: </span>
            <span>
              ทั้งหมด <b>{summary.total}</b> รายการ (พร้อมใช้งาน: <b>{summary.inStock}</b>, ใกล้หมด: <b>{summary.lowStock}</b>, หมดสต็อก: <b>{summary.outOfStock}</b>)
            </span>
          </div>
          <div className="font-semibold text-gray-700">
            สถานะที่เลือก: {currentStatusLabel}
          </div>
        </div>

        {/* Materials Table */}
        <table className="w-full text-left text-[11px] border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold">
              <th className="p-2 border-r border-gray-300 w-8 text-center">#</th>
              <th className="p-2 border-r border-gray-300 w-44">รายการวัสดุ / ไม้สัก</th>
              <th className="p-2 border-r border-gray-300 w-28">หมวดหมู่</th>
              <th className="p-2 border-r border-gray-300">สเปก / ขนาด / เกรดไม้</th>
              <th className="p-2 border-r border-gray-300 w-24 text-right">คงเหลือ</th>
              <th className="p-2 border-r border-gray-300 w-20 text-center">เกณฑ์เตือน</th>
              <th className="p-2 border-r border-gray-300 w-24 text-center">สถานะ</th>
              <th className="p-2 w-24 text-center">อัปเดตล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 border-r border-gray-200 text-center font-semibold">{idx + 1}</td>
                <td className="p-2 border-r border-gray-200 font-bold">
                  {item.item_name}
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-700">
                  {item.category_name_th || item.category}
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-600">
                  {item.specification || '-'}
                </td>
                <td className="p-2 border-r border-gray-200 text-right font-mono font-bold">
                  {item.quantity} {item.unit}
                </td>
                <td className="p-2 border-r border-gray-200 text-center text-gray-500">
                  &le; {item.min_threshold} {item.unit}
                </td>
                <td className="p-2 border-r border-gray-200 text-center whitespace-nowrap font-medium">
                  {item.status === 'out_of_stock'
                    ? 'หมดสต็อก (0)'
                    : item.status === 'low_stock'
                    ? '⚠️ ใกล้หมด'
                    : 'ปกติ'}
                </td>
                <td className="p-2 text-center text-gray-600 text-[10px]">
                  {item.last_restocked || '-'}
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500 italic">
                  ไม่มีรายการวัสดุในระบบตามเงื่อนไขที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs">
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้ตรวจนับสต็อก / ผู้ดูแลคลัง</p>
            <p className="text-[10px] text-gray-500 mt-0.5">(........................................................)</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้จัดการโรงงาน / ผู้มีอำนาจสั่งซื้อ</p>
            <p className="text-[10px] text-gray-500 mt-0.5">( คุณเอส )</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
        </div>
      </div>
    </>
  );
}
