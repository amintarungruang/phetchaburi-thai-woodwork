'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  X,
  FileText,
  CheckCircle,
  Download,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, LeadStatus } from '@/types';
import { formatThaiDate } from '@/lib/utils';

interface LeadsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
}

const STATUS_LABELS: Record<LeadStatus, { label: string; textClass: string; bgClass: string }> = {
  new: { label: 'ลูกค้าใหม่ (รอดำเนินการ)', textClass: 'text-red-700', bgClass: 'bg-red-50' },
  contacted: { label: 'ติดต่อแล้ว / รอยืนยันแบบ', textClass: 'text-amber-700', bgClass: 'bg-amber-50' },
  quoted: { label: 'ส่งใบเสนอราคาแล้ว', textClass: 'text-sky-700', bgClass: 'bg-sky-50' },
  in_production: { label: 'มัดจำแล้ว / เริ่มผลิต', textClass: 'text-indigo-700', bgClass: 'bg-indigo-50' },
  completed: { label: 'ส่งมอบ & ติดตั้งเสร็จ', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50' },
};

export default function LeadsReportModal({ isOpen, onClose, leads }: LeadsReportModalProps) {
  // Filter States
  const [dateRangeType, setDateRangeType] = useState<'all' | 'today' | '7days' | 'month' | 'last_month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Extract unique categories from current leads
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.interest_type && l.interest_type.trim()) {
        set.add(l.interest_type.trim());
      }
    });
    return Array.from(set);
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate dates for ranges
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    return leads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      const leadDateStr = lead.created_at ? lead.created_at.split('T')[0] : '';

      // 1. Date filter
      if (dateRangeType === 'today') {
        if (leadDateStr !== todayStr) return false;
      } else if (dateRangeType === '7days') {
        if (leadDate < sevenDaysAgo) return false;
      } else if (dateRangeType === 'month') {
        if (leadDate.getFullYear() !== currentYear || leadDate.getMonth() !== currentMonth) return false;
      } else if (dateRangeType === 'last_month') {
        if (leadDate.getFullYear() !== lastMonthYear || leadDate.getMonth() !== lastMonth) return false;
      } else if (dateRangeType === 'custom') {
        if (customStart && leadDateStr < customStart) return false;
        if (customEnd && leadDateStr > customEnd) return false;
      }

      // 2. Category / Interest Type filter
      if (selectedCategory !== 'all') {
        if (lead.interest_type !== selectedCategory) return false;
      }

      // 3. Status filter
      if (selectedStatus !== 'all') {
        if (lead.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [leads, dateRangeType, customStart, customEnd, selectedCategory, selectedStatus]);

  // Summary counts
  const summary = useMemo(() => {
    const total = filteredLeads.length;
    const newCount = filteredLeads.filter((l) => l.status === 'new').length;
    const inProdCount = filteredLeads.filter((l) => l.status === 'in_production').length;
    const completedCount = filteredLeads.filter((l) => l.status === 'completed').length;
    return { total, newCount, inProdCount, completedCount };
  }, [filteredLeads]);

  // Date Range Label Description
  const dateRangeLabel = useMemo(() => {
    if (dateRangeType === 'all') return 'ข้อมูลทั้งหมดทุกช่วงเวลา';
    if (dateRangeType === 'today') return `ประจำวันที่ ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    if (dateRangeType === '7days') return 'ช่วง 7 วันล่าสุด';
    if (dateRangeType === 'month') return `ประจำเดือน ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`;
    if (dateRangeType === 'last_month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return `ประจำเดือน ${d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`;
    }
    if (dateRangeType === 'custom') {
      return `ตั้งแต่วันที่ ${customStart || 'เริ่มต้น'} ถึง ${customEnd || 'ปัจจุบัน'}`;
    }
    return '';
  }, [dateRangeType, customStart, customEnd]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredLeads.length === 0) {
      alert('ไม่มีข้อมูลตามเงื่อนไขที่เลือก');
      return;
    }

    const rows = filteredLeads.map((l, index) => ({
      'ลำดับ': index + 1,
      'วันที่ติดต่อ': formatThaiDate(l.created_at),
      'ชื่อลูกค้า': l.customer_name,
      'เบอร์โทรศัพท์': l.phone_number,
      'LINE ID': l.line_id || '-',
      'ประเภทงานที่สนใจ': l.interest_type || '-',
      'ขนาด/สเปก': l.dimensions || '-',
      'ช่วงงบประมาณ': l.budget_range || '-',
      'สถานะ': STATUS_LABELS[l.status]?.label || l.status,
      'บันทึกรายละเอียด': l.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for readability
    worksheet['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 18 }, // วันที่
      { wch: 24 }, // ชื่อลูกค้า
      { wch: 15 }, // เบอร์โทร
      { wch: 14 }, // LINE
      { wch: 25 }, // ประเภทงาน
      { wch: 20 }, // ขนาด/สเปก
      { wch: 18 }, // งบ
      { wch: 22 }, // สถานะ
      { wch: 35 }, // รายละเอียด
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานข้อมูลลูกค้า');

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `รายงานลูกค้า_โรงงานฝาทรงไทย_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // Trigger Print dialog
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Interactive Modal (Screen View) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm print:hidden animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-gold-500/40 overflow-hidden">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0 shadow-inner">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-cream-50 leading-tight">
                  พิมพ์รายงานสรุปข้อมูลลูกค้า (Leads Report & Export)
                </h2>
                <p className="text-[11px] text-gold-400">
                  กำหนดช่วงเวลาและประเภทงานก่อนกดพิมพ์ PDF หรือดาวน์โหลดเป็นไฟล์ Excel
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

          {/* Modal Body: Filters & Settings */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Filter Section Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-wood-200 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-wood-950 text-xs border-b border-wood-200 pb-2">
                <Filter className="w-4 h-4 text-gold-600" />
                <span>ตัวกรองข้อมูลสำหรับออกรายงาน</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. ช่วงเวลา */}
                <div>
                  <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-600" />
                    <span>ช่วงเวลา (Date Range) *</span>
                  </label>
                  <select
                    value={dateRangeType}
                    onChange={(e) => setDateRangeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                  >
                    <option value="all">ทั้งหมดทุกช่วงเวลา</option>
                    <option value="today">วันนี้ (Today)</option>
                    <option value="7days">7 วันล่าสุด (Last 7 Days)</option>
                    <option value="month">เดือนนี้ (This Month)</option>
                    <option value="last_month">เดือนที่แล้ว (Last Month)</option>
                    <option value="custom">กำหนดช่วงวันที่เอง (Custom)</option>
                  </select>
                </div>

                {/* 2. ประเภทงานที่สนใจ */}
                <div>
                  <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-gold-600" />
                    <span>ประเภทงาน (Work Type)</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                  >
                    <option value="all">ทุกประเภทงาน (All Types)</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. สถานะงาน */}
                <div>
                  <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-gold-600" />
                    <span>สถานะไปป์ไลน์ (Status)</span>
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                  >
                    <option value="all">ทุกสถานะ (All Status)</option>
                    <option value="new">ลูกค้าใหม่ (รอดำเนินการ)</option>
                    <option value="contacted">ติดต่อแล้ว / รอยืนยันแบบ</option>
                    <option value="quoted">ส่งใบเสนอราคาแล้ว</option>
                    <option value="in_production">มัดจำแล้ว / เริ่มผลิต</option>
                    <option value="completed">ส่งมอบ & ติดตั้งเสร็จ</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Inputs (shown only if custom selected) */}
              {dateRangeType === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-wood-200 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-semibold text-wood-700 mb-1">จากวันที่:</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-wood-700 mb-1">ถึงวันที่:</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Filter Summary Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-wood-50 border border-wood-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-wood-950 text-xs">ผลการกรอง:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-wood-900 text-gold-400 font-bold text-xs">
                  {summary.total} รายการ
                </span>
                <span className="text-[11px] text-wood-600 hidden sm:inline">({dateRangeLabel})</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold">
                  ใหม่: {summary.newCount}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-semibold">
                  เริ่มผลิต: {summary.inProdCount}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                  สำเร็จ: {summary.completedCount}
                </span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="rounded-2xl border border-wood-200 overflow-hidden shadow-2xs">
              <div className="p-2.5 bg-wood-100/70 border-b border-wood-200 font-bold text-wood-800 text-xs flex items-center justify-between">
                <span>ตารางพรีวิวข้อมูลที่จะพิมพ์/ส่งออก ({filteredLeads.length} แถว)</span>
                <span className="text-[10px] text-wood-500 font-normal">แสดงตัวอย่างก่อนพิมพ์</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-wood-50 border-b border-wood-200 text-wood-600 font-bold uppercase">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">วันที่</th>
                      <th className="py-2 px-3">ชื่อลูกค้า</th>
                      <th className="py-2 px-3">เบอร์โทร / LINE</th>
                      <th className="py-2 px-3">ประเภทงาน & สเปก</th>
                      <th className="py-2 px-3">งบประเมิน</th>
                      <th className="py-2 px-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100">
                    {filteredLeads.map((lead, idx) => (
                      <tr key={lead.id} className="hover:bg-wood-50/50">
                        <td className="py-2 px-3 text-wood-500">{idx + 1}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-wood-600">
                          {formatThaiDate(lead.created_at)}
                        </td>
                        <td className="py-2 px-3 font-bold text-wood-950 whitespace-nowrap">
                          {lead.customer_name}
                        </td>
                        <td className="py-2 px-3 text-wood-600 whitespace-nowrap">
                          <div>{lead.phone_number}</div>
                          {lead.line_id && <div className="text-[10px] text-emerald-600">ID: {lead.line_id}</div>}
                        </td>
                        <td className="py-2 px-3 text-wood-800">
                          <div className="font-semibold text-gold-900">{lead.interest_type}</div>
                          {lead.dimensions && <div className="text-[10px] text-wood-500">{lead.dimensions}</div>}
                        </td>
                        <td className="py-2 px-3 font-bold text-wood-900 whitespace-nowrap">
                          {lead.budget_range || '-'}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              STATUS_LABELS[lead.status]?.bgClass || 'bg-wood-100'
                            } ${STATUS_LABELS[lead.status]?.textClass || 'text-wood-800'}`}
                          >
                            {STATUS_LABELS[lead.status]?.label.split(' ')[0] || lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-wood-400 italic">
                          ไม่พบข้อมูลที่ตรงกับเงื่อนไขตัวกรองที่คุณเลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-wood-50 border-t border-wood-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-wood-300 text-wood-700 hover:bg-wood-100 text-xs font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Export to Excel */}
              <button
                onClick={handleExportExcel}
                disabled={filteredLeads.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-wood-300 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ส่งออก Excel (.xlsx)</span>
              </button>

              {/* Print / Save as PDF */}
              <button
                onClick={handlePrint}
                disabled={filteredLeads.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-wood-300 text-wood-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์รายงาน (PDF / Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRINTABLE A4 TEMPLATE (Visible ONLY when printing: window.print) */}
      {/* ========================================================================= */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[99999]">
        {/* Print Document Header */}
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
                สถาปัตยกรรมไม้สักทองแท้ หน้าจั่ว ฝาปะกน ลูกฟัก ประตู วงกบ และศาลาทรงไทย
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                ที่อยู่: อ.บ้านลาด จ.เพชรบุรี | โทรสายด่วน: 084-042-6571 (คุณเอส)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded border border-gray-300">
              รายงานสรุปข้อมูลลูกค้า
            </div>
            <div className="text-[10px] text-gray-600 mt-1">
              วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-gray-600">
              เวลา: {new Date().toLocaleTimeString('th-TH')} น.
            </div>
          </div>
        </div>

        {/* Filter Criteria Info */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-200 p-2.5 rounded text-[11px] mb-4">
          <div>
            <span className="font-bold text-gray-800">ช่วงเวลา: </span>
            <span>{dateRangeLabel}</span>
          </div>
          <div>
            <span className="font-bold text-gray-800">ประเภทงาน: </span>
            <span>{selectedCategory === 'all' ? 'ทุกประเภทงาน' : selectedCategory}</span>
          </div>
          <div>
            <span className="font-bold text-gray-800">สถานะที่เลือก: </span>
            <span>{selectedStatus === 'all' ? 'ทุกสถานะ' : STATUS_LABELS[selectedStatus as LeadStatus]?.label}</span>
          </div>
        </div>

        {/* Printable Data Table */}
        <table className="w-full text-left text-[11px] border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold">
              <th className="p-2 border-r border-gray-300 w-8 text-center">#</th>
              <th className="p-2 border-r border-gray-300 w-24">วันที่ติดต่อ</th>
              <th className="p-2 border-r border-gray-300 w-36">ชื่อลูกค้า</th>
              <th className="p-2 border-r border-gray-300 w-32">เบอร์โทร / LINE</th>
              <th className="p-2 border-r border-gray-300">ประเภทงาน & สเปก</th>
              <th className="p-2 border-r border-gray-300 w-28 text-right">งบประเมิน</th>
              <th className="p-2 w-28 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, idx) => (
              <tr key={lead.id} className="border-b border-gray-200">
                <td className="p-2 border-r border-gray-200 text-center font-semibold">{idx + 1}</td>
                <td className="p-2 border-r border-gray-200 whitespace-nowrap">{formatThaiDate(lead.created_at)}</td>
                <td className="p-2 border-r border-gray-200 font-bold">{lead.customer_name}</td>
                <td className="p-2 border-r border-gray-200">
                  <div>{lead.phone_number}</div>
                  {lead.line_id && <div className="text-[10px] text-gray-600">LINE: {lead.line_id}</div>}
                </td>
                <td className="p-2 border-r border-gray-200">
                  <div className="font-semibold">{lead.interest_type}</div>
                  {lead.dimensions && <div className="text-[10px] text-gray-600">สเปก: {lead.dimensions}</div>}
                  {lead.notes && <div className="text-[10px] text-gray-500 italic mt-0.5">โน้ต: {lead.notes}</div>}
                </td>
                <td className="p-2 border-r border-gray-200 text-right font-bold whitespace-nowrap">
                  {lead.budget_range || '-'}
                </td>
                <td className="p-2 text-center whitespace-nowrap font-medium">
                  {STATUS_LABELS[lead.status]?.label.split(' ')[0] || lead.status}
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 italic">
                  ไม่มีข้อมูลลูกค้าตามเงื่อนไขที่กำหนด
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary Footer */}
        <div className="flex items-start justify-between text-xs border-t border-gray-300 pt-3 mb-10">
          <div>
            <span className="font-bold">สรุปยอดรวม: </span>
            <span>ทั้งหมด <b>{summary.total}</b> รายการ (ลูกค้าใหม่: <b>{summary.newCount}</b>, กำลังผลิต: <b>{summary.inProdCount}</b>, สำเร็จ: <b>{summary.completedCount}</b>)</span>
          </div>
          <div className="text-gray-500 text-[10px]">
            * เอกสารนี้สร้างจากระบบบริหารจัดการโรงงานฝาทรงไทยเมืองเพชร
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs">
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้จัดทำรายงาน</p>
            <p className="text-[10px] text-gray-500 mt-0.5">(........................................................)</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อผู้บริหาร / เจ้าของโรงงาน</p>
            <p className="text-[10px] text-gray-500 mt-0.5">( คุณเอส )</p>
            <p className="text-[10px] text-gray-500">วันที่ ...... / ...... / ..........</p>
          </div>
        </div>
      </div>
    </>
  );
}
