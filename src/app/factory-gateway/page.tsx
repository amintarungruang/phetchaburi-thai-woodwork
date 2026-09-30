'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Phone,
  Clock,
  Sparkles,
  Plus,
  Activity,
  Package,
  CalendarDays,
  Send,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { 
  getLeads, 
  getProjects, 
  getSchedules, 
  getInventory, 
  getSystemLogs, 
  updateLeadStatus,
  getTelegramSettings,
  checkAndTriggerTelegramScheduledAlerts
} from '@/lib/store';
import { Lead, Project, ScheduleItem, InventoryItem, SystemLog, TelegramSettings } from '@/types';
import { formatThaiDate } from '@/lib/utils';
import TelegramSettingsModal from '@/components/admin/TelegramSettingsModal';
import DashboardCharts from '@/components/admin/DashboardCharts';

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [tgSettings, setTgSettings] = useState<TelegramSettings | null>(null);
  const [tgModalOpen, setTgModalOpen] = useState(false);

  const loadData = async () => {
    const [l, p, s, inv, lg, tg] = await Promise.all([
      getLeads(),
      getProjects(),
      getSchedules(),
      getInventory(),
      getSystemLogs(),
      getTelegramSettings(),
    ]);
    setLeads(l);
    setProjects(p);
    setSchedules(s);
    setInventory(inv);
    setLogs(lg);
    setTgSettings(tg);

    // Run scheduled alert check in background
    checkAndTriggerTelegramScheduledAlerts().catch(() => {});
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  const newLeads = leads.filter((l) => l.status === 'new');
  const lowStockItems = inventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');

  const handleQuickStatus = async (id: string, newStatus: Lead['status']) => {
    await updateLeadStatus(id, newStatus);
    loadData();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            ภาพรวมระบบบริหารโรงงาน
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            ยินดีต้อนรับเจ้าของโรงงานฝาทรงไทยเมืองเพชร • สรุปสถานะประจำวันนี้
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setTgModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-900 font-bold text-xs transition-all shadow-2xs active:scale-95"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>ตั้งค่า Telegram Alerts</span>
            {tgSettings?.is_enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            )}
          </button>

          <Link
            href="/factory-gateway/schedule"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-900 font-semibold text-xs transition-all border border-wood-200"
          >
            <CalendarDays className="w-4 h-4 text-gold-600" />
            <span>จัดการคิวงาน</span>
          </Link>

          <Link
            href="/factory-gateway/inventory"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-900 font-semibold text-xs transition-all border border-wood-200"
          >
            <Package className="w-4 h-4 text-gold-600" />
            <span>สต็อกไม้สัก</span>
          </Link>

          <Link
            href="/factory-gateway/projects"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผลงาน</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Leads */}
        <Link href="/factory-gateway/leads" className="bg-white rounded-2xl border border-wood-200 p-5 shadow-xs hover:border-gold-500 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-wood-500 group-hover:text-gold-700 transition-colors">ลูกค้าติดต่อเข้ามาใหม่</span>
            <div className="w-9 h-9 rounded-xl bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-wood-950 font-serif">{newLeads.length}</span>
            <span className="text-xs text-wood-500">จากทั้งหมด {leads.length} รายการ</span>
          </div>
          {newLeads.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>มี {newLeads.length} รายการที่รอช่างติดต่อกลับ</span>
            </div>
          )}
        </Link>

        {/* Card 2: Production Schedule */}
        <Link href="/factory-gateway/schedule" className="bg-white rounded-2xl border border-wood-200 p-5 shadow-xs hover:border-gold-500 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-wood-500 group-hover:text-gold-700 transition-colors">คิวงานผลิต & ติดตั้ง</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-wood-950 font-serif">{schedules.length}</span>
            <span className="text-xs text-wood-500">คิวงานในระบบ</span>
          </div>
          <div className="mt-2 text-[11px] text-wood-600">
            เปิดดูปฏิทินไทม์ไลน์การผลิต
          </div>
        </Link>

        {/* Card 3: Portfolio */}
        <Link href="/factory-gateway/projects" className="bg-white rounded-2xl border border-wood-200 p-5 shadow-xs hover:border-gold-500 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-wood-500 group-hover:text-gold-700 transition-colors">ผลงานในแคตตาล็อก</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-wood-950 font-serif">{projects.length}</span>
            <span className="text-xs text-wood-500">ชิ้นงาน (พร้อมภาพถ่าย)</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-700">
            พร้อมรูปภาพและรายละเอียดสเปก
          </div>
        </Link>

        {/* Card 4: Inventory Stock */}
        <Link href="/factory-gateway/inventory" className="bg-white rounded-2xl border border-wood-200 p-5 shadow-xs hover:border-gold-500 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-wood-500 group-hover:text-gold-700 transition-colors">สต็อกไม้สัก & วัสดุ</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-wood-950 font-serif">{inventory.length}</span>
            <span className="text-xs text-wood-500">รายการ ({lowStockItems.length} ใกล้หมด)</span>
          </div>
          <div className="mt-2 text-[11px] text-wood-600">
            {lowStockItems.length > 0 ? 'กดเพื่อตรวจนับสต็อกที่ต้องสั่งเพิ่ม' : 'สต็อกอยู่ในเกณฑ์ปกติ'}
          </div>
        </Link>
      </div>

      {/* Telegram Automation Alert Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-950 via-wood-950 to-wood-900 text-white shadow-md border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ระบบแจ้งเตือน Telegram อัตโนมัติ</span>
              {tgSettings?.is_enabled ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>กำลังทำงาน (Active)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span>ยังไม่ได้เปิดใช้งาน</span>
                </span>
              )}
            </div>
            <p className="text-xs text-wood-300 mt-1">
              ⭐ ลูกค้าขอประเมินราคาใหม่ • 📋 สรุปสต็อกประจำวัน ({tgSettings?.daily_summary_time || '08:00'} น.) • 🚨 เตือนของใกล้หมด 3 เวลา ({(tgSettings?.reminder_times || ['09:00', '13:00', '17:00']).join(', ')} น.)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setTgModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-wood-950 font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{tgSettings?.is_enabled ? 'จัดการการตั้งค่า' : 'เปิดตั้งค่าบอททันที'}</span>
          </button>
        </div>
      </div>

      {/* Analytics Hub: 4 Key Factory Charts */}
      <DashboardCharts leads={leads} schedules={schedules} inventory={inventory} />

      {/* Main Grid: Recent Leads, System Activity Logs, & Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Leads & Activity Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Leads Management Table */}
          <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wood-100">
              <div>
                <h2 className="text-base font-bold text-wood-950">รายการผู้ติดต่อล่าสุด (Recent Leads)</h2>
                <p className="text-xs text-wood-500">ลูกค้าที่ส่งข้อมูลจากระบบคำนวณราคาและแชทบอท</p>
              </div>
              <Link
                href="/factory-gateway/leads"
                className="text-xs font-semibold text-gold-700 hover:text-gold-800 flex items-center gap-1"
              >
                <span>ดูกระดาน Kanban ทั้งหมด</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-wood-100 text-wood-400 uppercase font-semibold">
                    <th className="pb-3">ชื่อลูกค้า</th>
                    <th className="pb-3">ความสนใจ</th>
                    <th className="pb-3">เบอร์ติดต่อ</th>
                    <th className="pb-3">สถานะ</th>
                    <th className="pb-3 text-right">ดำเนินการด่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-100">
                  {leads.slice(0, 4).map((lead) => (
                    <tr key={lead.id} className="hover:bg-wood-50/60 transition-colors">
                      <td className="py-3 font-semibold text-wood-950">
                        <div>{lead.customer_name}</div>
                        <div className="text-[10px] text-wood-400 font-normal">{formatThaiDate(lead.created_at)}</div>
                      </td>
                      <td className="py-3 text-wood-700">
                        <div className="font-medium text-gold-800">{lead.interest_type}</div>
                        {lead.budget_range && <div className="text-[10px] text-wood-500">{lead.budget_range}</div>}
                      </td>
                      <td className="py-3 font-medium text-wood-900">
                        <a href={`tel:${lead.phone_number}`} className="hover:text-gold-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gold-600" />
                          <span>{lead.phone_number}</span>
                        </a>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            lead.status === 'new'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : lead.status === 'contacted'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : lead.status === 'quoted'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {lead.status === 'new'
                            ? 'รอดำเนินการ'
                            : lead.status === 'contacted'
                            ? 'ติดต่อแล้ว'
                            : lead.status === 'quoted'
                            ? 'ส่งราคาแล้ว'
                            : 'กำลังผลิต'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${lead.phone_number}`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            title="โทรออก"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleQuickStatus(lead.id, lead.status === 'new' ? 'contacted' : 'quoted')}
                            className="px-2 py-1 rounded-lg bg-wood-900 text-gold-400 hover:bg-wood-800 text-[10px] font-medium"
                          >
                            {lead.status === 'new' ? 'เปลี่ยนเป็นติดต่อแล้ว' : 'อัปเดตสถานะ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Activity Logs Section */}
          <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-wood-100">
              <h2 className="text-base font-bold text-wood-950 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gold-600" />
                <span>บันทึกกิจกรรมในระบบ (System Activity Logs)</span>
              </h2>
              <span className="text-[11px] text-wood-500">บันทึกอัตโนมัติ</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-wood-100">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="pt-2 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-wood-950 px-2 py-0.5 rounded bg-wood-100 text-[10px] mr-2">
                      {log.action}
                    </span>
                    <span className="text-wood-700">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-wood-400 shrink-0 font-mono">
                    {formatThaiDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Stock & Production Highlights */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white rounded-2xl border border-wood-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-wood-100">
              <h3 className="font-bold text-xs text-wood-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>แจ้งเตือนวัสดุโรงงาน</span>
              </h3>
              <Link href="/factory-gateway/inventory" className="text-[11px] text-gold-700 font-semibold hover:underline">
                ไปหน้าจัดการสต็อก
              </Link>
            </div>

            <div className="space-y-2.5">
              {inventory.slice(0, 4).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-wood-50/70 border border-wood-200/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-wood-950 line-clamp-1">{item.item_name}</div>
                    <div className="text-[10px] text-wood-500">{item.category_name_th}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold ${item.quantity <= item.min_threshold ? 'text-red-600' : 'text-wood-900'}`}>
                      {item.quantity} {item.unit}
                    </span>
                    {item.quantity <= item.min_threshold && (
                      <div className="text-[9px] text-red-600 font-bold">ใกล้หมด</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule Preview */}
          <div className="bg-wood-900 rounded-2xl border border-gold-500/30 p-5 text-cream-50 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-wood-800">
              <h3 className="font-bold text-xs text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>คิวงานปัจจุบัน</span>
              </h3>
              <Link href="/factory-gateway/schedule" className="text-[11px] text-gold-300 font-semibold hover:underline">
                ไปหน้าตารางคิวงาน
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {schedules.slice(0, 3).map((s) => (
                <div key={s.id} className="p-2.5 rounded-xl bg-wood-950/60 border border-wood-800 space-y-1">
                  <div className="font-semibold text-cream-100">{s.project_title}</div>
                  <div className="text-[10px] text-gold-400">
                    {s.start_date} ถึง {s.end_date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Automation Settings Modal */}
      <TelegramSettingsModal
        isOpen={tgModalOpen}
        onClose={() => {
          setTgModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
