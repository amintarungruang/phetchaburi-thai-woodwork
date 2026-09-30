'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { Lead, ScheduleItem, InventoryItem } from '@/types';

interface DashboardChartsProps {
  leads: Lead[];
  schedules: ScheduleItem[];
  inventory: InventoryItem[];
}

const THAI_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const PRODUCT_COLORS = [
  '#C59139', // Gold
  '#8C6239', // Wood Brown
  '#3B82F6', // Sky/Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#64748B', // Slate
];

export default function DashboardCharts({ leads, schedules, inventory }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'6m' | 'all'>('6m');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // -------------------------------------------------------------
  // 1. Data Processing: Monthly Inquiries & Conversion Trend
  // -------------------------------------------------------------
  const trendData = useMemo(() => {
    const now = new Date();
    const monthsCount = timeRange === '6m' ? 6 : 12;
    const result: { monthKey: string; label: string; total: number; converted: number }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${THAI_MONTH_NAMES[month]} ${String(year + 543).slice(-2)}`;

      result.push({
        monthKey,
        label,
        total: 0,
        converted: 0,
      });
    }

    leads.forEach((lead) => {
      const created = new Date(lead.created_at || Date.now());
      if (isNaN(created.getTime())) return;
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      const entry = result.find((r) => r.monthKey === key);
      if (entry) {
        entry.total += 1;
        if (lead.status === 'in_production' || lead.status === 'completed') {
          entry.converted += 1;
        }
      }
    });

    return result;
  }, [leads, timeRange]);

  // -------------------------------------------------------------
  // 2. Data Processing: Popular Products Breakdown
  // -------------------------------------------------------------
  const productData = useMemo(() => {
    const counts: Record<string, number> = {};

    leads.forEach((l) => {
      const type = (l.interest_type || 'งานไม้สั่งทำพิเศษ').trim();
      counts[type] = (counts[type] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    if (entries.length === 0) {
      return [
        { name: 'ฝาปะกน / ฝาเรือนไทย', value: 5 },
        { name: 'โครงจั่วเพชรบุรี / ปั้นหยา', value: 3 },
        { name: 'บานประตูแกะสลัก', value: 2 },
        { name: 'ศาลาทรงไทย', value: 1 },
      ];
    }

    entries.sort((a, b) => b.value - a.value);

    if (entries.length > 5) {
      const top4 = entries.slice(0, 4);
      const othersVal = entries.slice(4).reduce((sum, e) => sum + e.value, 0);
      top4.push({ name: 'งานสั่งทำอื่นๆ', value: othersVal });
      return top4;
    }

    return entries;
  }, [leads]);

  const totalProductInquiries = useMemo(
    () => productData.reduce((acc, curr) => acc + curr.value, 0),
    [productData]
  );

  // -------------------------------------------------------------
  // 3. Data Processing: Workshop Capacity & Queue Utilization
  // -------------------------------------------------------------
  const capacityData = useMemo(() => {
    const busyCount = schedules.filter((s) => s.status === 'busy').length;
    const installingCount = schedules.filter((s) => s.status === 'installing').length;
    const curingCount = schedules.filter((s) => s.status === 'curing').length;
    const availableCount = schedules.filter((s) => s.status === 'available').length;

    const totalActiveJobs = busyCount + installingCount + curingCount;
    const totalSlots = schedules.length || 1;
    const utilizationRate = Math.min(100, Math.round((totalActiveJobs / totalSlots) * 100));

    return {
      busyCount,
      installingCount,
      curingCount,
      availableCount,
      totalActiveJobs,
      totalSlots,
      utilizationRate,
      segments: [
        {
          name: 'กำลังผลิต & แกะสลัก',
          count: busyCount,
          color: '#F59E0B',
          barColor: 'bg-amber-500',
          percent: Math.round((busyCount / totalSlots) * 100) || 0,
        },
        {
          name: 'นัดหมายติดตั้งหน้างาน',
          count: installingCount,
          color: '#0284C7',
          barColor: 'bg-sky-600',
          percent: Math.round((installingCount / totalSlots) * 100) || 0,
        },
        {
          name: 'รอบอบแห้ง & เตรียมไม้',
          count: curingCount,
          color: '#8B5CF6',
          barColor: 'bg-purple-500',
          percent: Math.round((curingCount / totalSlots) * 100) || 0,
        },
        {
          name: 'คิวว่างพร้อมรับงาน',
          count: availableCount,
          color: '#10B981',
          barColor: 'bg-emerald-500',
          percent: Math.round((availableCount / totalSlots) * 100) || 0,
        },
      ],
    };
  }, [schedules]);

  // -------------------------------------------------------------
  // 4. Data Processing: Stock Health & Low Threshold Comparison
  // -------------------------------------------------------------
  const stockHealthData = useMemo(() => {
    const items = [...inventory];
    items.sort((a, b) => {
      const diffA = a.quantity - a.min_threshold;
      const diffB = b.quantity - b.min_threshold;
      return diffA - diffB;
    });

    return items.slice(0, 6).map((item) => {
      const shortName =
        item.item_name.length > 18
          ? item.item_name.slice(0, 16) + '...'
          : item.item_name;

      return {
        fullName: item.item_name,
        name: shortName,
        quantity: item.quantity,
        threshold: item.min_threshold,
        unit: item.unit,
        isCritical: item.quantity <= item.min_threshold,
      };
    });
  }, [inventory]);

  const criticalStockCount = useMemo(
    () => inventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock').length,
    [inventory]
  );

  if (!isMounted) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-wood-200 text-center text-wood-500 animate-pulse">
        กำลังโหลดข้อมูลกราฟวิเคราะห์...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-wood-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-wood-950 font-serif flex items-center gap-2">
            <Activity className="w-6 h-6 text-gold-600" />
            <span>ศูนย์รวมการวิเคราะห์ข้อมูลโรงงาน (Factory Analytics Hub)</span>
          </h2>
          <p className="text-xs text-wood-600 mt-0.5">
            สถิติเรียลไทม์จากคำขอประเมินราคา คิวงานผลิตจริง และความพร้อมของคลังไม้
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-wood-100 rounded-xl border border-wood-200 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '6m'
                ? 'bg-white text-wood-950 shadow-2xs font-bold'
                : 'text-wood-600 hover:text-wood-950'
            }`}
          >
            6 เดือนล่าสุด
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'all'
                ? 'bg-white text-wood-950 shadow-2xs font-bold'
                : 'text-wood-600 hover:text-wood-950'
            }`}
          >
            1 ปีที่ผ่านมา
          </button>
        </div>
      </div>

      {/* 2x2 Grid for the 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* CHART 1: Inquiries & Pipeline Trend (Area Chart) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-wood-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wood-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gold-100 text-gold-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-wood-950">
                  แนวโน้มลูกค้าติดต่อ & เปลี่ยนเป็นงานผลิต
                </h3>
                <p className="text-[11px] text-wood-500">
                  จำนวนผู้ขอใบเสนอราคา เทียบกับงานที่เริ่มขึ้นรูปผลิตจริง
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-wood-50 text-wood-700 border border-wood-200">
              รวม {leads.length} รายการ
            </span>
          </div>

          {/* Chart Container */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C59139" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C59139" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6B5745' }}
                  axisLine={{ stroke: '#E8DFD5' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#8C735A' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-wood-950 text-white p-3 rounded-xl shadow-lg border border-gold-500/40 text-xs space-y-1">
                          <div className="font-bold text-gold-300 pb-1 border-b border-wood-800">
                            ประจำเดือน: {label}
                          </div>
                          <div className="flex items-center justify-between gap-4 text-wood-200">
                            <span>ลูกค้าติดต่อทั้งหมด:</span>
                            <span className="font-bold text-white">{payload[0]?.value} ราย</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald-300">
                            <span>ส่งต่อเข้าคิวผลิต:</span>
                            <span className="font-bold">{payload[1]?.value} ราย</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="ลูกค้าติดต่อใหม่"
                  stroke="#C59139"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="converted"
                  name="ผลิตจริง/สำเร็จ"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConverted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-wood-100 text-xs text-wood-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C59139]" />
              <span>ลูกค้าติดต่อเข้ามา</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span>เข้าสู่กระบวนการผลิต</span>
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CHART 2: Popular Products Breakdown (Donut Chart) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-wood-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wood-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-wood-950">
                  สัดส่วนประเภทงานไม้ที่ลูกค้าสนใจ
                </h3>
                <p className="text-[11px] text-wood-500">
                  งานฝาทรงไทย โครงจั่ว ประตูแกะสลัก และงานสั่งทำ
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gold-50 text-gold-800 border border-gold-200">
              {productData.length} กลุ่มงาน
            </span>
          </div>

          {/* Donut Chart & Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut graphic */}
            <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        const percent = totalProductInquiries
                          ? Math.round(((item.value as number) / totalProductInquiries) * 100)
                          : 0;
                        return (
                          <div className="bg-wood-950 text-white p-2.5 rounded-xl shadow-lg border border-gold-500/40 text-xs space-y-1">
                            <div className="font-bold text-gold-300">{item.name}</div>
                            <div className="text-wood-200">
                              {item.value} รายการ ({percent}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                        stroke="#FAF7F2"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total Count Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-wood-950 font-serif">
                  {totalProductInquiries}
                </span>
                <span className="text-[10px] text-wood-500 font-semibold uppercase">
                  รายการ
                </span>
              </div>
            </div>

            {/* Breakdown List on the Right */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              {productData.map((item, idx) => {
                const color = PRODUCT_COLORS[idx % PRODUCT_COLORS.length];
                const pct = totalProductInquiries
                  ? Math.round((item.value / totalProductInquiries) * 100)
                  : 0;
                return (
                  <div
                    key={item.name}
                    className="p-2 rounded-xl bg-wood-50/60 border border-wood-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-wood-900 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-bold text-wood-950">{item.value}</span>
                      <span className="text-[10px] text-wood-500 font-medium">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-wood-100 text-[11px] text-wood-500 flex items-center justify-between">
            <span>คำนวณจากประเภทงานที่ลูกค้าขอประเมินราคา</span>
            <Link
              href="/factory-gateway/leads"
              className="text-gold-700 hover:text-gold-900 font-semibold flex items-center gap-1"
            >
              <span>ดูลูกค้าทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CHART 3: Workshop Capacity & Queue Utilization */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-wood-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wood-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-wood-950">
                  อัตราการใช้กำลังการผลิตของโรงงาน
                </h3>
                <p className="text-[11px] text-wood-500">
                  สถานะคิวงานช่างไม้ คิวขึ้นรูป คิวติดตั้ง และคิวว่าง
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-wood-950 font-serif">
                {capacityData.utilizationRate}%
              </div>
              <div className="text-[10px] text-wood-500 font-medium">กำลังผลิตใช้งาน</div>
            </div>
          </div>

          {/* Large Capacity Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-wood-900">
              <span>ภาพรวมการกระจายคิวงาน ({capacityData.totalSlots} คิวในระบบ)</span>
              <span className="text-emerald-700 font-semibold">
                มีคิวว่าง {capacityData.availableCount} ช่วง
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="h-4 w-full rounded-full bg-wood-100 overflow-hidden flex shadow-inner">
              {capacityData.segments.map((seg) => (
                <div
                  key={seg.name}
                  className={`h-full ${seg.barColor} transition-all duration-500`}
                  style={{ width: `${seg.percent}%` }}
                  title={`${seg.name}: ${seg.count} คิว (${seg.percent}%)`}
                />
              ))}
            </div>
          </div>

          {/* Segment Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {capacityData.segments.map((seg) => (
              <div
                key={seg.name}
                className="p-3 rounded-2xl bg-wood-50/70 border border-wood-100 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-wood-700 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="truncate">{seg.name}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-wood-950 font-serif">
                    {seg.count}
                  </span>
                  <span className="text-[11px] text-wood-500 font-medium">{seg.percent}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-wood-100 text-[11px] text-wood-500 flex items-center justify-between">
            <span>
              {capacityData.availableCount > 0
                ? `⚡ พร้อมรับงานใหม่ทันที ${capacityData.availableCount} คิว`
                : '⚠️ คิวการผลิตเต็มทุกช่วงเวลารอบนี้'}
            </span>
            <Link
              href="/factory-gateway/schedule"
              className="text-gold-700 hover:text-gold-900 font-semibold flex items-center gap-1"
            >
              <span>เปิดปฏิทินคิวงาน</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CHART 4: Timber Inventory Health & Stock Levels */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-wood-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wood-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-100 text-red-700">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-wood-950">
                  ตรวจวัดระดับสต็อกไม้สัก & เกณฑ์เตือน
                </h3>
                <p className="text-[11px] text-wood-500">
                  เทียบจำนวนคงเหลือจริงกับเกณฑ์ขั้นต่ำที่ต้องสั่งเพิ่ม
                </p>
              </div>
            </div>

            {criticalStockCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>เตือน {criticalStockCount} รายการ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>สต็อกปกติ</span>
              </span>
            )}
          </div>

          {/* Bar Chart comparing Quantity vs Threshold */}
          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockHealthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#6B5745' }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  axisLine={{ stroke: '#E8DFD5' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#8C735A' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-wood-950 text-white p-3 rounded-xl shadow-lg border border-gold-500/40 text-xs space-y-1">
                          <div className="font-bold text-gold-300 pb-1 border-b border-wood-800">
                            {data.fullName}
                          </div>
                          <div className="flex items-center justify-between gap-4 text-white">
                            <span>คงเหลือจริง:</span>
                            <span className="font-bold text-emerald-400">
                              {data.quantity} {data.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-wood-300">
                            <span>เกณฑ์เตือนขั้นต่ำ:</span>
                            <span className="font-semibold">
                              {data.threshold} {data.unit}
                            </span>
                          </div>
                          {data.isCritical && (
                            <div className="text-[10px] text-amber-400 font-bold pt-1 border-t border-wood-800">
                              ⚠️ ต่ำกว่าเกณฑ์เตือน ต้องออกใบสั่งซื้อ
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="quantity"
                  name="คงเหลือจริง"
                  radius={[6, 6, 0, 0]}
                  fill="#C59139"
                >
                  {stockHealthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCritical ? '#EF4444' : '#C59139'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="threshold"
                  name="เกณฑ์เตือนขั้นต่ำ"
                  fill="#CBD5E1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-wood-100 text-xs">
            <div className="flex items-center gap-4 text-wood-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#C59139]" />
                <span>คงเหลือปกติ</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#EF4444]" />
                <span>ใกล้หมด</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#CBD5E1]" />
                <span>เกณฑ์เตือน</span>
              </span>
            </div>

            <Link
              href="/factory-gateway/inventory"
              className="text-gold-700 hover:text-gold-900 font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>คลังวัสดุ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
