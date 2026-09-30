'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  Printer
} from 'lucide-react';
import {
  getSchedules,
  saveSchedule,
  deleteSchedule
} from '@/lib/store';
import { ScheduleItem } from '@/types';
import { formatThaiDate } from '@/lib/utils';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import SchedulePrintModal from '@/components/admin/SchedulePrintModal';

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Schedule Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [schTitle, setSchTitle] = useState('');
  const [schCustomer, setSchCustomer] = useState('');
  const [schStart, setSchStart] = useState('2026-09-01');
  const [schEnd, setSchEnd] = useState('2026-09-15');
  const [schStatus, setSchStatus] = useState<ScheduleItem['status']>('busy');
  const [schLabel, setSchLabel] = useState('กำลังขึ้นรูป & แกะสลัก');
  const [schPublic, setSchPublic] = useState(true);
  const [schNotes, setSchNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    const data = await getSchedules();
    setSchedules(data);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  const openAddModal = (defaultDate?: string) => {
    setEditingSchedule(null);
    setSchTitle('');
    setSchCustomer('');
    const start = defaultDate || new Date().toISOString().split('T')[0];
    setSchStart(start);
    const d = new Date(start);
    d.setDate(d.getDate() + 14);
    setSchEnd(d.toISOString().split('T')[0]);
    setSchStatus('busy');
    setSchLabel('กำลังขึ้นรูป & แกะสลัก');
    setSchPublic(true);
    setSchNotes('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setSchTitle(item.project_title);
    setSchCustomer(item.customer_name);
    setSchStart(item.start_date);
    setSchEnd(item.end_date);
    setSchStatus(item.status);
    setSchLabel(item.status_label_th);
    setSchPublic(item.is_public);
    setSchNotes(item.notes || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!schTitle.trim()) {
      setFormError('กรุณากรอกชื่องานหรือโปรเจกต์');
      return;
    }

    setIsSaving(true);

    try {
      await saveSchedule({
        id: editingSchedule ? editingSchedule.id : `sch-${Date.now()}`,
        project_title: schTitle.trim(),
        customer_name: schCustomer.trim() || 'ลูกค้าสั่งทำ',
        start_date: schStart,
        end_date: schEnd,
        status: schStatus,
        status_label_th: schLabel.trim() || (schStatus === 'available' ? 'คิวว่าง' : 'กำลังผลิต'),
        is_public: schPublic,
        notes: schNotes.trim(),
      });

      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setFormError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const item = schedules.find(s => s.id === id);
    if (!item) return;

    const ok = await confirm({
      title: 'ยืนยันการลบคิวงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบคิวงาน "${item.project_title}" ออกจากตารางงานโรงงาน?`,
      confirmText: 'ลบคิวงาน',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      await deleteSchedule(id);
      loadData();
    }
  };

  const filtered = schedules.filter((s) => {
    const matchSearch =
      s.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'คิวว่าง (พร้อมรับงานทันที)',
        };
      case 'busy':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'กำลังผลิตและแกะสลัก',
        };
      case 'installing':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          label: 'กำลังติดตั้งหน้างาน',
        };
      case 'curing':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'อบแห้งและพักไม้',
        };
      default:
        return {
          bg: 'bg-wood-100 text-wood-900 border-wood-200',
          dot: 'bg-wood-600',
          label: 'รอดำเนินการ',
        };
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const gotoToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const trailingDaysCount = (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  interface CalendarCell {
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const calendarCells: CalendarCell[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevD = new Date(year, month - 1, day);
    const dateStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  for (let d = 1; d <= trailingDaysCount; d++) {
    const nextD = new Date(year, month + 1, d);
    const dateStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  const getDayEvents = (dateStr: string) => {
    return filtered.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            จัดการตารางคิวงานผลิต (Production Schedule CMS)
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            วางแผนไทม์ไลน์การผลิต อัปเดตคิวว่าง/คิวเต็ม และเปิดเผยสถานะคิวงานสู่หน้าเว็บไซต์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-wood-50 text-wood-950 border border-wood-300 font-bold text-xs shadow-2xs transition-all active:scale-95"
            title="พิมพ์ตารางสรุปคิวงานประจำเดือน (PDF / Print)"
          >
            <Printer className="w-4 h-4 text-gold-600" />
            <span>พิมพ์ตารางคิวงานประจำเดือน (PDF)</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ลงบันทึกคิวงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-wood-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-wood-500 font-medium">คิวงานทั้งหมด</span>
            <div className="text-2xl font-bold text-wood-950 mt-1 font-serif">{schedules.length} คิว</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-wood-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-wood-500 font-medium">กำลังผลิตและติดตั้ง</span>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-serif">
              {schedules.filter(s => s.status === 'busy' || s.status === 'installing').length} คิว
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-wood-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-wood-500 font-medium">รอบคิวว่างพร้อมรับงาน</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">
              {schedules.filter(s => s.status === 'available').length} ช่วง
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters, Search & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'busy', label: 'กำลังผลิต' },
            { id: 'installing', label: 'กำลังติดตั้ง' },
            { id: 'available', label: 'คิวว่าง' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-wood-900 text-gold-300 shadow-xs'
                  : 'bg-wood-50 text-wood-700 border border-wood-200 hover:bg-wood-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Search + View Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-wood-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่องาน หรือชื่อลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-wood-300 bg-wood-50/50 focus:bg-white text-xs text-wood-950 placeholder-wood-400 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* View Switcher: Calendar vs Table */}
          <div className="inline-flex items-center p-1 bg-wood-100 rounded-xl border border-wood-200 shrink-0">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-gold-600" />
              <span>ปฏิทินรายเดือน</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <List className="w-3.5 h-3.5 text-gold-600" />
              <span>ตารางรายการ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'calendar' ? (
        /* Monthly Interactive Calendar View */
        <div className="bg-white rounded-3xl border border-wood-200 p-4 sm:p-6 shadow-xs space-y-4">
          {/* Calendar Navigation & Month Indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-wood-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-wood-950 font-serif">
                {thaiMonths[month]} {year + 543}
              </h2>
              <span className="text-xs text-wood-500 font-medium">({year})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={gotoToday}
                className="px-3 py-1.5 rounded-xl border border-wood-200 hover:bg-wood-50 text-xs font-semibold text-wood-700 transition-colors shadow-2xs"
              >
                เดือนปัจจุบัน (Today)
              </button>

              <div className="inline-flex items-center gap-1 border border-wood-200 rounded-xl p-1 bg-wood-50">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-wood-100 text-wood-700 shadow-2xs transition-colors"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-wood-100 text-wood-700 shadow-2xs transition-colors"
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Color Status Legend */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px] text-wood-700 bg-wood-50/70 p-3 rounded-2xl border border-wood-100">
            <span className="font-semibold text-wood-900">คำอธิบายสถานะ:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span>คิวว่างพร้อมรับงาน</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
              <span>กำลังผลิต & แกะสลัก</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
              <span>กำลังติดตั้งหน้างาน</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200" />
              <span>เตรียมไม้ & อบแห้ง</span>
            </span>
          </div>

          {/* 7-Days Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
                {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`py-2 text-xs font-bold rounded-xl ${
                      idx === 0 || idx === 6
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-wood-100/70 text-wood-800'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, idx) => {
                  const events = getDayEvents(cell.dateStr);
                  const isSunOrSat = idx % 7 === 0 || idx % 7 === 6;

                  return (
                    <div
                      key={cell.dateStr + '-' + idx}
                      onClick={() => openAddModal(cell.dateStr)}
                      className={`group relative min-h-[110px] sm:min-h-[125px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        !cell.isCurrentMonth
                          ? 'bg-wood-50/40 border-wood-100 opacity-40 hover:opacity-90'
                          : cell.isToday
                          ? 'bg-gold-50/60 border-gold-400 ring-2 ring-gold-400/40'
                          : isSunOrSat
                          ? 'bg-amber-50/20 border-wood-200/80 hover:border-gold-300 hover:bg-white'
                          : 'bg-white border-wood-200 hover:border-gold-300 hover:bg-wood-50/40 shadow-2xs'
                      }`}
                    >
                      {/* Cell Header: Date Number & Quick Add '+' Button */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${
                            cell.isToday
                              ? 'bg-gold-600 text-white shadow-2xs'
                              : cell.isCurrentMonth
                              ? 'text-wood-900'
                              : 'text-wood-400'
                          }`}
                        >
                          {cell.day}
                        </span>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddModal(cell.dateStr);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-gold-100 hover:bg-gold-200 text-gold-800"
                          title={`เพิ่มคิวงานวันที่ ${cell.dateStr}`}
                        >
                          <Plus className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {events.slice(0, 3).map((ev) => {
                          const isBusy = ev.status === 'busy';
                          const isInstalling = ev.status === 'installing';
                          const isAvailable = ev.status === 'available';
                          const isCuring = ev.status === 'curing';

                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(ev);
                              }}
                              className={`p-1 px-1.5 rounded-lg text-[10px] font-semibold border truncate flex items-center gap-1 transition-all active:scale-95 shadow-2xs ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                  : isInstalling
                                  ? 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100'
                                  : isCuring
                                  ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={`${ev.project_title} (${ev.customer_name}) - ${ev.status_label_th || ev.status}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isAvailable
                                    ? 'bg-emerald-500'
                                    : isInstalling
                                    ? 'bg-sky-500'
                                    : isCuring
                                    ? 'bg-purple-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              <span className="truncate">{ev.project_title}</span>
                            </div>
                          );
                        })}

                        {events.length > 3 && (
                          <div className="text-[9px] text-wood-500 font-bold text-center bg-wood-100/70 rounded py-0.5">
                            + อีก {events.length - 3} รายการ
                          </div>
                        )}
                      </div>

                      {/* Cell Footer note */}
                      <div className="text-[9px] text-wood-400 text-right">
                        {events.length > 0 ? `${events.length} คิว` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Schedules Table View */
        <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-wood-100 text-wood-400 uppercase font-semibold">
                <th className="pb-3">ชื่องาน / โปรเจกต์</th>
                <th className="pb-3">ลูกค้า / สถานที่</th>
                <th className="pb-3">ช่วงวันที่ผลิต-ติดตั้ง</th>
                <th className="pb-3">สถานะคิวงาน</th>
                <th className="pb-3">หมายเหตุ</th>
                <th className="pb-3 text-center">การแสดงผล</th>
                <th className="pb-3 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100">
              {filtered.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-wood-50/60 transition-colors">
                    <td className="py-3.5 font-semibold text-wood-950 max-w-xs">
                      <div>{item.project_title}</div>
                    </td>
                    <td className="py-3.5 text-wood-700">{item.customer_name}</td>
                    <td className="py-3.5 font-medium text-gold-800">
                      <span className="font-mono">{item.start_date}</span> ถึง <span className="font-mono">{item.end_date}</span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{item.status_label_th || badge.label}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-wood-500 text-[11px] max-w-xs line-clamp-1">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3.5 text-center">
                      {item.is_public ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Eye className="w-3 h-3" />
                          <span>Public (หน้าเว็บ)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-wood-400 text-[10px] bg-wood-50 px-2 py-0.5 rounded border border-wood-200">
                          <EyeOff className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-wood-100 hover:bg-wood-200 text-wood-700 transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gold-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wood-100">
              <h3 className="text-lg font-bold text-wood-950 font-serif">
                {editingSchedule ? 'แก้ไขคิวงานผลิต' : 'ลงบันทึกคิวงานใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-wood-400 hover:text-wood-900 hover:bg-wood-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-wood-900 block mb-1">ชื่องาน / โปรเจกต์ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผลิตหน้าจั่ว วัดเขาบันไดอิฐ"
                  value={schTitle}
                  onChange={(e) => setSchTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 focus:ring-1 focus:ring-gold-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-wood-900 block mb-1">ชื่อลูกค้า / สถานที่</label>
                <input
                  type="text"
                  placeholder="คุณสมชาย หรือ วัด..."
                  value={schCustomer}
                  onChange={(e) => setSchCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-wood-900 block mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    required
                    value={schStart}
                    onChange={(e) => setSchStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-wood-900 block mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    required
                    value={schEnd}
                    onChange={(e) => setSchEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-wood-900 block mb-1">ประเภทสถานะ</label>
                  <CustomSelect
                    value={schStatus}
                    onChange={(newVal) => {
                      const val = newVal as ScheduleItem['status'];
                      setSchStatus(val);
                      if (val === 'busy') setSchLabel('กำลังขึ้นรูป & แกะสลัก');
                      else if (val === 'installing') setSchLabel('กำลังขนส่งและติดตั้งหน้างาน');
                      else if (val === 'available') setSchLabel('คิวว่าง (พร้อมรับงานสั่งทำทันที)');
                      else if (val === 'curing') setSchLabel('รอบเตรียมไม้และอบแห้ง');
                    }}
                    options={[
                      { value: 'busy', label: 'กำลังผลิต & แกะสลัก (Busy)' },
                      { value: 'installing', label: 'กำลังติดตั้งหน้างาน (Installing)' },
                      { value: 'available', label: 'คิวว่างพร้อมรับงาน (Available)' },
                      { value: 'curing', label: 'เตรียมไม้ & อบแห้ง (Curing)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="font-semibold text-wood-900 block mb-1">ข้อความสถานะที่แสดง</label>
                  <input
                    type="text"
                    value={schLabel}
                    onChange={(e) => setSchLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-wood-900 block mb-1">หมายเหตุภายใน</label>
                <textarea
                  rows={2}
                  placeholder="เช่น รอนัดหมายส่งมอบ หรือเตรียมไม้สักทองคัดเกรด..."
                  value={schNotes}
                  onChange={(e) => setSchNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sch_public"
                  checked={schPublic}
                  onChange={(e) => setSchPublic(e.target.checked)}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <label htmlFor="sch_public" className="font-semibold text-wood-900 cursor-pointer">
                  แสดงคิวนี้บนหน้าเว็บสาธารณะ (Public Calendar)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-wood-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-wood-200 text-wood-600 hover:bg-wood-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกคิวงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Schedule Print & Export Modal */}
      <SchedulePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        schedules={schedules}
        defaultDate={currentDate}
      />
    </div>
  );
}
