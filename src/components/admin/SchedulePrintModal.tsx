'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  X,
  CalendarDays,
  Clock,
  CheckCircle,
  Building
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ScheduleItem } from '@/types';
import { formatThaiDate } from '@/lib/utils';

interface SchedulePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleItem[];
  defaultDate?: Date;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function SchedulePrintModal({
  isOpen,
  onClose,
  schedules,
  defaultDate = new Date(),
}: SchedulePrintModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultDate.getMonth());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter schedules by month and status
  const filteredSchedules = useMemo(() => {
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const targetMonthPrefix = `${selectedYear}-${monthStr}`;

    return schedules.filter((item) => {
      // Check if schedule overlaps with selected month
      const startPrefix = item.start_date.substring(0, 7);
      const endPrefix = item.end_date.substring(0, 7);

      const inMonth =
        startPrefix === targetMonthPrefix ||
        endPrefix === targetMonthPrefix ||
        (item.start_date <= `${targetMonthPrefix}-01` && item.end_date >= `${targetMonthPrefix}-28`);

      if (!inMonth) return false;

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'busy' && item.status !== 'busy') return false;
        if (selectedStatus === 'installing' && item.status !== 'installing') return false;
        if (selectedStatus === 'curing' && item.status !== 'curing') return false;
        if (selectedStatus === 'available' && item.status !== 'available') return false;
      }

      return true;
    });
  }, [schedules, selectedYear, selectedMonth, selectedStatus]);

  const monthNameTh = THAI_MONTHS[selectedMonth];
  const yearTh = selectedYear + 543;
  const periodLabel = `ประจำเดือน${monthNameTh} พ.ศ. ${yearTh}`;

  // Summary counts
  const summary = useMemo(() => {
    const total = filteredSchedules.length;
    const inProduction = filteredSchedules.filter((s) => s.status === 'busy').length;
    const installing = filteredSchedules.filter((s) => s.status === 'installing').length;
    const curing = filteredSchedules.filter((s) => s.status === 'curing').length;
    const available = filteredSchedules.filter((s) => s.status === 'available').length;
    return { total, inProduction, installing, curing, available };
  }, [filteredSchedules]);

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredSchedules.length === 0) {
      alert('ไม่มีข้อมูลคิวงานในเดือนที่เลือก');
      return;
    }

    const rows = filteredSchedules.map((s, index) => ({
      'ลำดับ': index + 1,
      'วันที่เริ่ม': formatThaiDate(s.start_date),
      'วันที่สิ้นสุด': formatThaiDate(s.end_date),
      'ชื่องาน / โปรเจกต์': s.project_title,
      'ลูกค้า / สถานที่ติดตั้ง': s.customer_name,
      'สถานะการผลิต': s.status_label_th,
      'หมายเหตุ': s.notes || '-',
      'แสดงบนเว็บไซต์': s.is_public ? 'เปิดเผย' : 'ซ่อน',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 16 }, // วันที่เริ่ม
      { wch: 16 }, // วันที่สิ้นสุด
      { wch: 30 }, // ชื่องาน
      { wch: 25 }, // ลูกค้า
      { wch: 22 }, // สถานะ
      { wch: 30 }, // หมายเหตุ
      { wch: 15 }, // แสดง
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `คิวงาน_${monthNameTh}`);

    const filename = `ตารางคิวงานผลิต_โรงงานฝาทรงไทย_${monthNameTh}_${yearTh}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Screen Modal Preview */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm print:hidden animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-gold-500/40 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-cream-50 leading-tight">
                  พิมพ์ตารางคิวงานผลิตประจำเดือน (Monthly Schedule Report)
                </h2>
                <p className="text-[11px] text-gold-400">
                  เลือกเดือนและสถานะงานก่อนสั่งพิมพ์เอกสาร A4 หรือส่งออกเป็นไฟล์ Excel
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
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-wood-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-gold-600" />
                  <span>เลือกเดือน *</span>
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                >
                  {THAI_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-600" />
                  <span>เลือกปี พ.ศ. *</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                >
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                    <option key={y} value={y}>
                      พ.ศ. {y + 543} ({y})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-wood-900 mb-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-gold-600" />
                  <span>สถานะคิวงาน</span>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 bg-white font-medium text-wood-950 focus:ring-2 focus:ring-gold-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">ทุกสถานะคิวงาน</option>
                  <option value="busy">กำลังผลิต / แกะสลัก / ประกอบ</option>
                  <option value="installing">กำลังขนส่ง & ติดตั้งหน้างาน</option>
                  <option value="curing">ขั้นตอนทำสี / ลงรักปิดทอง / บ่มไม้</option>
                  <option value="available">คิวว่าง (พร้อมรับงาน)</option>
                </select>
              </div>
            </div>

            {/* Summary Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-wood-50 border border-wood-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-wood-950 text-xs">ตารางคิวงาน:</span>
                <span className="text-gold-900 font-bold">{periodLabel}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-wood-900 text-gold-400 font-bold text-xs">
                  {summary.total} คิว
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">
                  กำลังผลิต: {summary.inProduction}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-semibold">
                  ทำสี/บ่มไม้: {summary.curing}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-semibold">
                  ติดตั้งหน้างาน: {summary.installing}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold">
                  คิวว่าง: {summary.available}
                </span>
              </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-2xl border border-wood-200 overflow-hidden shadow-2xs">
              <div className="p-2.5 bg-wood-100/70 border-b border-wood-200 font-bold text-wood-800 text-xs flex items-center justify-between">
                <span>ตารางพรีวิวรายการคิวงาน ({filteredSchedules.length} รายการ)</span>
                <span className="text-[10px] text-wood-500 font-normal">แสดงผลก่อนพิมพ์</span>
              </div>
              <div className="max-h-[240px] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-wood-50 border-b border-wood-200 text-wood-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">ช่วงวันที่</th>
                      <th className="py-2 px-3">ชื่องาน / โปรเจกต์</th>
                      <th className="py-2 px-3">ลูกค้า / สถานที่</th>
                      <th className="py-2 px-3">สถานะ</th>
                      <th className="py-2 px-3">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100">
                    {filteredSchedules.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-wood-50/50">
                        <td className="py-2 px-3 text-wood-500">{idx + 1}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-wood-700">
                          <div>{formatThaiDate(s.start_date)}</div>
                          <div className="text-[10px] text-wood-400">ถึง {formatThaiDate(s.end_date)}</div>
                        </td>
                        <td className="py-2 px-3 font-bold text-wood-950">
                          {s.project_title}
                        </td>
                        <td className="py-2 px-3 text-wood-700 whitespace-nowrap">
                          {s.customer_name}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'installing'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.status_label_th}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-wood-500 truncate max-w-xs">
                          {s.notes || '-'}
                        </td>
                      </tr>
                    ))}
                    {filteredSchedules.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-wood-400 italic">
                          ไม่มีคิวงานผลิตในเดือน {monthNameTh} พ.ศ. {yearTh}
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
                disabled={filteredSchedules.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-wood-300 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ส่งออก Excel (.xlsx)</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={filteredSchedules.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-wood-300 text-wood-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ตารางคิวงาน (PDF / Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRINTABLE A4 SCHEDULE REPORT (Visible ONLY when printing) */}
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
                ตารางคิวงานผลิตและติดตั้งสถาปัตยกรรมไม้สักทองแท้
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                ที่ตั้ง: อ.บ้านลาด จ.เพชรบุรี | สายตรง: 084-042-6571 (คุณเอส)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded border border-gray-300">
              ตารางคิวงานประจำเดือน
            </div>
            <div className="text-xs font-bold text-gray-900 mt-1">
              {periodLabel}
            </div>
            <div className="text-[10px] text-gray-500">
              พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')} น.
            </div>
          </div>
        </div>

        {/* Status Breakdown Bar */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2.5 rounded text-[11px] mb-4">
          <div>
            <span className="font-bold">สรุปภาพรวมเดือนนี้: </span>
            <span>ทั้งหมด <b>{summary.total}</b> รายการ (กำลังผลิต: <b>{summary.inProduction}</b>, ติดตั้งหน้างาน: <b>{summary.installing}</b>, คิวว่าง: <b>{summary.available}</b>)</span>
          </div>
          <div className="font-semibold text-gray-700">
            สถานะที่เลือก: {selectedStatus === 'all' ? 'ทุกสถานะ' : selectedStatus}
          </div>
        </div>

        {/* Schedule Table */}
        <table className="w-full text-left text-[11px] border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold">
              <th className="p-2 border-r border-gray-300 w-8 text-center">#</th>
              <th className="p-2 border-r border-gray-300 w-28">กำหนดการ</th>
              <th className="p-2 border-r border-gray-300">ชื่องาน / โปรเจกต์</th>
              <th className="p-2 border-r border-gray-300 w-44">ลูกค้า & สถานที่ติดตั้ง</th>
              <th className="p-2 border-r border-gray-300 w-32 text-center">สถานะงาน</th>
              <th className="p-2 w-40">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((s, idx) => (
              <tr key={s.id} className="border-b border-gray-200">
                <td className="p-2 border-r border-gray-200 text-center font-semibold">{idx + 1}</td>
                <td className="p-2 border-r border-gray-200 whitespace-nowrap">
                  <div>{formatThaiDate(s.start_date)}</div>
                  <div className="text-[10px] text-gray-500">ถึง {formatThaiDate(s.end_date)}</div>
                </td>
                <td className="p-2 border-r border-gray-200 font-bold">
                  {s.project_title}
                </td>
                <td className="p-2 border-r border-gray-200">
                  {s.customer_name}
                </td>
                <td className="p-2 border-r border-gray-200 text-center whitespace-nowrap font-medium">
                  {s.status_label_th}
                </td>
                <td className="p-2 text-gray-600 text-[10px]">
                  {s.notes || '-'}
                </td>
              </tr>
            ))}
            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 italic">
                  ไม่มีรายการคิวงานผลิตในเดือนนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs">
          <div>
            <div className="border-b border-black w-48 mx-auto mb-2"></div>
            <p className="font-semibold">ลงชื่อหัวหน้าช่างผู้ดูแลคิวงาน</p>
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
