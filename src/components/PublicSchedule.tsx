'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  List,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { ScheduleItem } from '@/types';
import { getSchedules } from '@/lib/store';
import { formatShortThaiDate, formatThaiDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicSchedule() {
  const { t, isEn } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    getSchedules().then((data) => {
      const publicOnly = data.filter((s) => s.is_public);
      setSchedules(publicOnly);

      // If current month has no events but there are active schedules, jump to first schedule month
      if (publicOnly.length > 0) {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        const firstOfMonth = new Date(curYear, curMonth, 1);
        const lastOfMonth = new Date(curYear, curMonth + 1, 0);

        const hasEventsThisMonth = publicOnly.some((s) => {
          const start = new Date(s.start_date);
          const end = new Date(s.end_date);
          return start <= lastOfMonth && end >= firstOfMonth;
        });

        if (!hasEventsThisMonth) {
          const firstSchDate = new Date(publicOnly[0].start_date);
          if (!isNaN(firstSchDate.getTime())) {
            setCurrentDate(new Date(firstSchDate.getFullYear(), firstSchDate.getMonth(), 1));
          }
        }
      }
    });

    const handleUpdate = () => {
      getSchedules().then((data) => {
        setSchedules(data.filter((s) => s.is_public));
      });
    };
    window.addEventListener('woodwork_store_updated', handleUpdate);
    return () => window.removeEventListener('woodwork_store_updated', handleUpdate);
  }, []);

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'available':
        return {
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse',
          chipClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100',
          label: t.schedule.queueAvailable,
        };
      case 'busy':
        return {
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
          chipClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
          label: t.schedule.queueInProduction,
        };
      case 'installing':
        return {
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
          dotClass: 'bg-sky-500',
          chipClass: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100',
          label: t.schedule.queueInstallation,
        };
      case 'curing':
        return {
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
          dotClass: 'bg-purple-500',
          chipClass: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100',
          label: isEn ? 'Timber Preparation & Seasoning' : 'รอบเตรียมไม้และอบแห้ง',
        };
      default:
        return {
          badgeClass: 'bg-[#FAF7F2] text-[#6B5745] border-[#E8DFD5]',
          dotClass: 'bg-[#C59139]',
          chipClass: 'bg-[#FAF7F2] text-[#6B5745] border-[#E8DFD5] hover:bg-white',
          label: isEn ? 'Pending Queue' : 'รอบรอดำเนินการ',
        };
    }
  };

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const gotoToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const trailingDaysCount = (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  interface CalendarCell {
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const calendarCells: CalendarCell[] = useMemo(() => {
    const cells: CalendarCell[] = [];

    // Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevD = new Date(year, month - 1, day);
      const dateStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      cells.push({
        day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month leading days
    for (let d = 1; d <= trailingDaysCount; d++) {
      const nextD = new Date(year, month + 1, d);
      const dateStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [year, month, firstDayOfWeek, daysInMonth, daysInPrevMonth, trailingDaysCount, todayStr]);

  const getDayEvents = (dateStr: string) => {
    return schedules.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
  };

  const selectedDateEvents = selectedDate ? getDayEvents(selectedDate) : [];

  const displayMonthName = t.schedule.monthNames[month] || '';
  const displayYear = isEn ? year : year + 543;

  return (
    <section id="schedule" className="py-16 sm:py-24 bg-modern-grid border-b border-[#EAE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
            {t.schedule.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mt-1 font-sans">
            {t.schedule.title}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6450] mt-2 font-light">
            {t.schedule.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Schedule Main Card (Timeline or Calendar) */}
          <div className="lg:col-span-8 modern-card rounded-3xl p-5 sm:p-7 lg:p-8 space-y-5">
            {/* Card Header with View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE4]">
              <div className="flex items-center gap-2">
                {viewMode === 'timeline' ? (
                  <Clock className="w-5 h-5 text-[#C59139]" />
                ) : (
                  <CalendarIcon className="w-5 h-5 text-[#C59139]" />
                )}
                <h3 className="font-bold text-base sm:text-lg text-[#2D1B0E] font-sans">
                  {viewMode === 'timeline'
                    ? isEn
                      ? 'Monthly Production Timeline'
                      : 'ไทม์ไลน์คิวงานประจำเดือน'
                    : isEn
                    ? 'Interactive Production Calendar'
                    : 'ตารางปฏิทินคิวผลิตประจำเดือน'}
                </h3>
              </div>

              {/* Segmented View Switcher */}
              <div className="inline-flex items-center p-1 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] shadow-2xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-target ${
                    viewMode === 'timeline'
                      ? 'bg-[#2D1B0E] text-[#D4AF37] shadow-xs'
                      : 'text-[#6B5745] hover:text-[#2D1B0E]'
                  }`}
                  aria-label="แบบปัจจุบัน (ไทม์ไลน์)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Timeline' : 'แบบไทม์ไลน์'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-target ${
                    viewMode === 'calendar'
                      ? 'bg-[#2D1B0E] text-[#D4AF37] shadow-xs'
                      : 'text-[#6B5745] hover:text-[#2D1B0E]'
                  }`}
                  aria-label="แบบตารางปฏิทิน"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Calendar Grid' : 'แบบตารางปฏิทิน'}</span>
                </button>
              </div>
            </div>

            {/* View 1: Timeline List View (แบบปัจจุบัน) */}
            {viewMode === 'timeline' ? (
              <div className="space-y-3 pt-1">
                {schedules.length === 0 ? (
                  <div className="text-center py-10 text-xs sm:text-sm text-[#8C735A] bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5]">
                    {isEn ? 'No scheduled items currently available.' : 'ยังไม่มีข้อมูลคิวงานที่เผยแพร่'}
                  </div>
                ) : (
                  schedules.map((item) => {
                    const config = getStatusBadge(item.status);
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-[#E8DFD5] hover:border-[#C59139]/60 bg-[#FAF7F2]/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-[#2D1B0E]">{item.project_title}</div>
                          <div className="text-xs text-[#6B5745] flex items-center gap-2 font-light flex-wrap">
                            <span className="font-semibold text-[#A87424]">
                              {formatShortThaiDate(item.start_date)} - {formatShortThaiDate(item.end_date)}
                            </span>
                            {item.notes && <span className="text-[#8C735A]">• {item.notes}</span>}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                            <span>{isEn ? config.label : item.status_label_th || config.label}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* View 2: Interactive Monthly Calendar Grid (แบบตารางปฏิทิน) */
              <div className="space-y-4 pt-1">
                {/* Month Navigation Header */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-bold text-[#2D1B0E] font-serif">
                      {displayMonthName} {displayYear}
                    </h4>
                    <span className="text-xs text-[#8C735A] font-medium hidden sm:inline">
                      ({year})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={gotoToday}
                      className="px-2.5 py-1.5 rounded-xl border border-[#E8DFD5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#6B5745] hover:text-[#2D1B0E] transition-colors shadow-2xs touch-target"
                    >
                      {t.schedule.currentMonth || (isEn ? 'Current Month' : 'เดือนปัจจุบัน')}
                    </button>

                    <div className="inline-flex items-center gap-1 border border-[#E8DFD5] rounded-xl p-0.5 bg-[#FAF7F2]">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F2ECE4] text-[#2D1B0E] shadow-2xs transition-colors touch-target"
                        title={isEn ? 'Previous Month' : 'เดือนก่อนหน้า'}
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F2ECE4] text-[#2D1B0E] shadow-2xs transition-colors touch-target"
                        title={isEn ? 'Next Month' : 'เดือนถัดไป'}
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Color Legend */}
                <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap text-[11px] text-[#6B5745] bg-[#FAF7F2] p-2.5 sm:p-3 rounded-2xl border border-[#E8DFD5]">
                  <span className="font-semibold text-[#2D1B0E]">
                    {isEn ? 'Status Legend:' : 'คำอธิบายสถานะ:'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                    <span>{t.schedule.queueAvailable}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                    <span>{t.schedule.queueInProduction}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
                    <span>{t.schedule.queueInstallation}</span>
                  </span>
                </div>

                {/* Responsive 7-Column Calendar Grid */}
                <div className="overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
                  <div className="min-w-[560px] sm:min-w-full">
                    {/* Day Name Headers */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
                      {(t.schedule.daysOfWeek || ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']).map(
                        (dayName, idx) => (
                          <div
                            key={dayName}
                            className={`py-1.5 text-[11px] font-bold rounded-xl ${
                              idx === 0 || idx === 6
                                ? 'bg-[#FAF0E6] text-[#A87424]'
                                : 'bg-[#FAF7F2] text-[#6B5745]'
                            }`}
                          >
                            {dayName}
                          </div>
                        )
                      )}
                    </div>

                    {/* Day Cells Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarCells.map((cell, idx) => {
                        const events = getDayEvents(cell.dateStr);
                        const isSunOrSat = idx % 7 === 0 || idx % 7 === 6;
                        const isSelected = selectedDate === cell.dateStr;

                        return (
                          <div
                            key={`${cell.dateStr}-${idx}`}
                            onClick={() => setSelectedDate(isSelected ? null : cell.dateStr)}
                            className={`min-h-[88px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              !cell.isCurrentMonth
                                ? 'bg-[#FAF7F2]/30 border-[#E8DFD5]/50 opacity-40 hover:opacity-80'
                                : isSelected
                                ? 'bg-white border-[#2D1B0E] ring-2 ring-[#2D1B0E] shadow-sm'
                                : cell.isToday
                                ? 'bg-[#FAF0E6]/50 border-[#C59139] ring-2 ring-[#C59139]/30'
                                : isSunOrSat
                                ? 'bg-[#FAF7F2]/60 border-[#E8DFD5] hover:border-[#C59139]/60 hover:bg-white'
                                : 'bg-white border-[#E8DFD5] hover:border-[#C59139]/60 hover:bg-[#FAF7F2]/40 shadow-2xs'
                            }`}
                          >
                            {/* Day Number Header */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-lg ${
                                  cell.isToday
                                    ? 'bg-[#C59139] text-white shadow-2xs'
                                    : isSelected
                                    ? 'bg-[#2D1B0E] text-[#D4AF37]'
                                    : cell.isCurrentMonth
                                    ? 'text-[#2D1B0E]'
                                    : 'text-[#A08875]'
                                }`}
                              >
                                {cell.day}
                              </span>

                              {events.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-[#C59139] shrink-0 sm:hidden" />
                              )}
                            </div>

                            {/* Event Chips (Desktop & Tablet) */}
                            <div className="space-y-1 my-1 overflow-hidden">
                              {events.slice(0, 2).map((ev) => {
                                const badgeCfg = getStatusBadge(ev.status);
                                return (
                                  <div
                                    key={ev.id}
                                    className={`p-1 px-1.5 rounded-lg text-[10px] font-semibold border truncate flex items-center gap-1 transition-all shadow-2xs ${badgeCfg.chipClass}`}
                                    title={`${ev.project_title} - ${ev.status_label_th || badgeCfg.label}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeCfg.dotClass}`} />
                                    <span className="truncate">{ev.project_title}</span>
                                  </div>
                                );
                              })}

                              {events.length > 2 && (
                                <div className="text-[9px] text-[#8C735A] font-bold text-center bg-[#FAF7F2] rounded py-0.5 border border-[#E8DFD5]">
                                  + อีก {events.length - 2} รายการ
                                </div>
                              )}
                            </div>

                            {/* Bottom subtle indicator */}
                            <div className="text-[9px] text-[#A08875] text-right font-light">
                              {events.length > 0 ? (
                                <span className="text-[#A87424] font-medium hidden sm:inline">
                                  {events.length} คิว
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Day Event Details Panel */}
                {selectedDate && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#C59139]/40 space-y-3 animate-fade-in shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#C59139]" />
                        <span className="text-xs sm:text-sm font-bold text-[#2D1B0E]">
                          {t.schedule.selectedDateInfo || (isEn ? 'Schedule for' : 'ข้อมูลคิวงานประจำวันที่')} {formatThaiDate(selectedDate)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="p-1 rounded-lg hover:bg-white text-[#8C735A] hover:text-[#2D1B0E] transition-colors"
                        title={isEn ? 'Close Details' : 'ปิด'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {selectedDateEvents.length === 0 ? (
                      <div className="py-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-[#6B5745]">
                          {isEn
                            ? 'No scheduled workshop jobs on this date. You can reserve this timeframe for your project.'
                            : 'ยังไม่มีคิวงานผลิตในวันนี้ — สามารถติดต่อช่างเอสเพื่อจองคิวผลิตช่วงเวลานี้ได้ทันที'}
                        </p>
                        <a
                          href="tel:0840426571"
                          className="btn-gold inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-2xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Call to Book Date' : 'จองคิวช่วงนี้'}</span>
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedDateEvents.map((ev) => {
                          const badgeCfg = getStatusBadge(ev.status);
                          return (
                            <div
                              key={ev.id}
                              className="p-3 bg-white rounded-xl border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs sm:text-sm font-bold text-[#2D1B0E]">
                                  {ev.project_title}
                                </div>
                                <div className="text-[11px] text-[#6B5745] flex items-center gap-2">
                                  <span className="font-semibold text-[#A87424]">
                                    {formatShortThaiDate(ev.start_date)} - {formatShortThaiDate(ev.end_date)}
                                  </span>
                                  {ev.notes && <span className="text-[#8C735A]">• {ev.notes}</span>}
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeCfg.badgeClass}`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${badgeCfg.dotClass}`} />
                                  <span>{isEn ? badgeCfg.label : ev.status_label_th || badgeCfg.label}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Booking Guidance Card */}
          <div className="lg:col-span-4 modern-card rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A87424]">
                Advance Booking
              </span>
              <h3 className="text-lg font-bold text-[#2D1B0E] font-sans">
                {isEn ? 'Advance Queue Reservation' : 'จองคิวงานล่วงหน้า'}
              </h3>
              <p className="text-xs text-[#6B5745] leading-relaxed font-light">
                {isEn
                  ? 'Traditional wall panels, gables, and custom woodwork require precise wood selection, kiln-drying, and hand joinery. We recommend reserving 15-30 days ahead of your required installation.'
                  : 'งานฝาเรือนไทย โครงจั่ว และงานไม้สั่งทำ ต้องใช้เวลาในการคัดไม้ อบแห้ง และประกอบเข้าลิ้น แนะนำให้จองคิวก่อนเริ่มงานติดตั้งจริง 15-30 วันครับ'}
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-[#5C4A3A]">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                <span className="font-semibold text-[#2D1B0E]">{isEn ? 'Gables & Doors:' : 'หน้าจั่ว & ประตู:'}</span>
                <span className="text-[#A87424] font-medium">{isEn ? '10 - 18 Days' : '10 - 18 วัน'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                <span className="font-semibold text-[#2D1B0E]">{isEn ? 'Wall Panels & Gazebos:' : 'ฝาปะกน / ศาลา:'}</span>
                <span className="text-[#A87424] font-medium">{isEn ? '30 - 45 Days' : '30 - 45 วัน'}</span>
              </div>
            </div>

            <a
              href="tel:0840426571"
              className="w-full btn-gold flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all touch-target"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t.schedule.callToBook}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

