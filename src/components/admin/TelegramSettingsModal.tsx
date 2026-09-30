'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Boxes,
  UserCheck,
  Calendar,
  HelpCircle,
  Eye,
  EyeOff,
  Bell,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  getTelegramSettings,
  saveTelegramSettings,
  sendManualDailyStockSummary,
  sendManualLowStockAlert,
  sendManualTestLeadAlert
} from '@/lib/store';
import { TelegramSettings } from '@/types';
import { DEFAULT_TELEGRAM_SETTINGS, sendTelegramNotification, BASE_URL } from '@/lib/telegram';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramSettingsModal({ isOpen, onClose }: TelegramSettingsModalProps) {
  const [settings, setSettings] = useState<TelegramSettings>(DEFAULT_TELEGRAM_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingAction, setTestingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTelegramSettings().then((s) => {
        if (s && s.bot_token) setSettings(s);
      });
      fetch('/api/notify/telegram')
        .then((res) => res.json())
        .then((data) => {
          if (data?.settings?.bot_token) {
            setSettings(data.settings);
            saveTelegramSettings(data.settings);
          }
        })
        .catch(() => {});
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await saveTelegramSettings(settings);
      setFeedback({ type: 'success', message: 'บันทึกการตั้งค่า Telegram เรียบร้อยแล้ว' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.bot_token || !settings.chat_id) {
      setFeedback({ type: 'error', message: 'กรุณากรอก Bot Token และ Chat ID ก่อนทดสอบส่งข้อความ' });
      return;
    }

    setTestingAction('conn');
    setFeedback(null);

    const testMsg = `🔔 <b>ทดสอบการเชื่อมต่อระบบแจ้งเตือน Telegram สำเร็จ!</b>
━━━━━━━━━━━━━━━━━━━━
🏭 <b>โรงงานฝาทรงไทยเมืองเพชร</b>
✅ บอทเชื่อมต่อกับระบบหลังบ้านเรียบร้อยแล้ว
⏰ เวลาทดสอบ: ${new Date().toLocaleTimeString('th-TH')} น.
🔗 <b>เข้าสู่ระบบ:</b> <a href="${BASE_URL}/factory-gateway">${BASE_URL}/factory-gateway</a>`;

    const res = await sendTelegramNotification(testMsg, settings);
    if (res.success) {
      setFeedback({ type: 'success', message: 'ส่งข้อความทดสอบเข้า Telegram สำเร็จ! กรุณาตรวจดูในห้องแชท' });
    } else {
      setFeedback({ type: 'error', message: 'ส่งข้อความไม่สำเร็จ: ' + (res.error || 'โปรดตรวจ Bot Token และ Chat ID') });
    }
    setTestingAction(null);
  };

  const handleTestLead = async () => {
    if (!settings.bot_token || !settings.chat_id) {
      setFeedback({ type: 'error', message: 'กรุณากรอก Bot Token และ Chat ID ก่อนทดสอบ' });
      return;
    }

    setTestingAction('lead');
    setFeedback(null);
    const res = await sendManualTestLeadAlert();
    if (res.success) {
      setFeedback({ type: 'success', message: 'ส่งการแจ้งเตือนใบประเมินราคาตัวอย่างเข้า Telegram สำเร็จ!' });
    } else {
      setFeedback({ type: 'error', message: 'ส่งข้อความไม่สำเร็จ: ' + (res.error || 'ตรวจสอบการตั้งค่า') });
    }
    setTestingAction(null);
  };

  const handleTestStockSummary = async () => {
    if (!settings.bot_token || !settings.chat_id) {
      setFeedback({ type: 'error', message: 'กรุณากรอก Bot Token และ Chat ID ก่อนทดสอบ' });
      return;
    }

    setTestingAction('summary');
    setFeedback(null);
    const res = await sendManualDailyStockSummary();
    if (res.success) {
      setFeedback({ type: 'success', message: 'ส่งรายงานสรุปสต็อกทั้งหมดประจำวันเข้า Telegram สำเร็จ!' });
    } else {
      setFeedback({ type: 'error', message: 'ส่งไม่สำเร็จ: ' + (res.error || 'ตรวจสอบการตั้งค่า') });
    }
    setTestingAction(null);
  };

  const handleTestLowStock = async () => {
    if (!settings.bot_token || !settings.chat_id) {
      setFeedback({ type: 'error', message: 'กรุณากรอก Bot Token และ Chat ID ก่อนทดสอบ' });
      return;
    }

    setTestingAction('low');
    setFeedback(null);
    const res = await sendManualLowStockAlert();
    if (res.success) {
      setFeedback({ type: 'success', message: 'ส่งแจ้งเตือนของใกล้หมดเข้า Telegram สำเร็จ!' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'ส่งไม่สำเร็จ ตรวจสอบว่ามีของใกล้หมดหรือไม่' });
    }
    setTestingAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-wood-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-wood-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 shadow-2xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-wood-950 font-serif flex items-center gap-2">
                <span>ตั้งค่าการแจ้งเตือน Telegram (Telegram Bot Alerts)</span>
              </h2>
              <p className="text-xs text-wood-600">
                รับแจ้งเตือนลูกค้าสั่งทำ, สรุปสต็อกประจำวัน และเตือนของใกล้หมด 3 เวลา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-wood-400 hover:text-wood-900 hover:bg-wood-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Main Master Switch */}
          <div className="p-4 rounded-2xl bg-wood-50 border border-wood-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  settings.is_enabled ? 'bg-emerald-500 text-white' : 'bg-wood-200 text-wood-600'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-wood-900 text-sm">เปิดใช้งานระบบแจ้งเตือน Telegram</span>
                <p className="text-[11px] text-wood-500 mt-0.5">
                  เปิดเพื่อให้ระบบส่งการแจ้งเตือนอัตโนมัติเข้ากลุ่มหรือแชทส่วนตัวของคุณ
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_enabled}
                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-wood-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-wood-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Credentials Section */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-wood-900">1. การเชื่อมต่อ Telegram Bot API</span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-gold-700 hover:text-gold-800 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'ซ่อนวิธีสร้างบอท' : 'ดูวิธีสร้างบอทและหา Chat ID'}</span>
              </button>
            </div>

            {/* Quick Setup Guide Accordion */}
            {showGuide && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-wood-800 space-y-2 text-[11px] leading-relaxed">
                <p className="font-bold text-amber-900">📌 วิธีสร้างบอท Telegram ใน 2 นาที:</p>
                <ol className="list-decimal list-inside space-y-1 text-wood-700">
                  <li>
                    เปิด Telegram แล้วค้นหา <b>@BotFather</b> แล้วส่งคำสั่ง <code>/newbot</code>
                  </li>
                  <li>
                    ตั้งชื่อบอทและ Username จะได้รับ <b>HTTP API Token</b> (เช่น <code>123456:ABC-DEF...</code>)
                  </li>
                  <li>
                    ดึงบอทเข้ากลุ่มแชทโรงงาน หรือทักแชทส่วนตัวกับบอทแล้วกด <b>Start</b>
                  </li>
                  <li>
                    หา <b>Chat ID</b> ได้โดยค้นหา <b>@userinfobot</b> หรือส่งข้อความเข้ากลุ่มแล้วดูผ่านเว็บเบราว์เซอร์
                  </li>
                </ol>
              </div>
            )}

            <div>
              <label className="font-semibold text-wood-800 block mb-1">
                Telegram Bot Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="เช่น 7123456789:AAHq..."
                  value={settings.bot_token}
                  onChange={(e) => setSettings({ ...settings, bot_token: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-wood-300 text-xs font-mono text-wood-950 focus:ring-1 focus:ring-gold-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-700"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-wood-800 block mb-1">
                Telegram Chat ID (กลุ่มหรือส่วนตัว) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น 123456789 หรือ -1001234567890 (ถ้าเป็นกลุ่มจะมีเครื่องหมายติดลบ)"
                value={settings.chat_id}
                onChange={(e) => setSettings({ ...settings, chat_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs font-mono text-wood-950 focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                disabled={testingAction === 'conn'}
                onClick={handleTestConnection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {testingAction === 'conn' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>ทดสอบเชื่อมต่อ (Ping Bot)</span>
              </button>
            </div>
          </div>

          {/* Trigger Triggers Config */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
            <span className="font-bold text-wood-900 block">2. การแจ้งเตือนเหตุการณ์สำคัญ</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lead alert */}
              <label className="p-3 rounded-xl border border-wood-200 hover:border-gold-300 flex items-start gap-2.5 cursor-pointer bg-wood-50/50">
                <input
                  type="checkbox"
                  checked={settings.notify_on_lead}
                  onChange={(e) => setSettings({ ...settings, notify_on_lead: e.target.checked })}
                  className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
                />
                <div>
                  <span className="font-bold text-wood-900 block">⭐ ลูกค้าขอประเมินราคา / สั่งทำ</span>
                  <span className="text-[11px] text-wood-500">
                    แจ้งเตือนทันทีพร้อมชื่อ เบอร์โทร สเปก ขนาด และราคาประเมิน
                  </span>
                </div>
              </label>

              {/* Low stock immediate */}
              <label className="p-3 rounded-xl border border-wood-200 hover:border-gold-300 flex items-start gap-2.5 cursor-pointer bg-wood-50/50">
                <input
                  type="checkbox"
                  checked={settings.notify_on_low_stock}
                  onChange={(e) => setSettings({ ...settings, notify_on_low_stock: e.target.checked })}
                  className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
                />
                <div>
                  <span className="font-bold text-wood-900 block">⚠️ สต็อกลดต่ำกว่าเกณฑ์ทันที</span>
                  <span className="text-[11px] text-wood-500">
                    แจ้งเตือนเมื่อมีการตัดสต็อกไม้สักหรืออุปกรณ์จนถึงเกณฑ์เตือน
                  </span>
                </div>
              </label>

              {/* Schedule alert */}
              <label className="p-3 rounded-xl border border-wood-200 hover:border-gold-300 flex items-start gap-2.5 cursor-pointer bg-wood-50/50 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={settings.notify_on_schedule}
                  onChange={(e) => setSettings({ ...settings, notify_on_schedule: e.target.checked })}
                  className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
                />
                <div>
                  <span className="font-bold text-wood-900 block">📅 ลงบันทึกคิวงานผลิตใหม่</span>
                  <span className="text-[11px] text-wood-500">
                    แจ้งเตือนทีมงานเมื่อมีการเปิดจองคิวงานสร้างหรือติดตั้งใหม่ในระบบ
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Scheduled Stock Summary (8:00 AM) & 3x Daily Low-Stock Reminder */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
            <span className="font-bold text-wood-900 block">3. การตั้งเวลาสรุปสต็อกและเตือนซ้ำ</span>

            {/* Daily Full Stock Summary */}
            <div className="p-3.5 rounded-2xl border border-wood-200 bg-wood-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-gold-700" />
                  <span className="font-bold text-wood-900">สรุปสต็อกของทั้งหมดประจำวัน (Daily Stock Brief)</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.daily_summary_enabled}
                  onChange={(e) => setSettings({ ...settings, daily_summary_enabled: e.target.checked })}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
              </div>
              <p className="text-[11px] text-wood-600">
                ส่งรายงานสรุปยอดไม้สักและวัสดุทั้งหมดในคลัง พร้อมสถานะคงเหลือแยกตามหมวดหมู่
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-wood-700 font-semibold">เวลาที่แจ้งเตือนทุกวัน:</span>
                <input
                  type="time"
                  value={settings.daily_summary_time || '08:00'}
                  onChange={(e) => setSettings({ ...settings, daily_summary_time: e.target.value })}
                  className="px-2.5 py-1 rounded-lg border border-wood-300 font-mono text-xs bg-white"
                />
                <span className="text-wood-500 text-[11px]">(ค่าเริ่มต้น 08:00 น.)</span>
              </div>
            </div>

            {/* 3x Daily Low-Stock Reminder */}
            <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-wood-900">แจ้งเตือนของใกล้หมดซ้ำ วันละ 3 เวลา</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.low_stock_reminder_enabled}
                  onChange={(e) => setSettings({ ...settings, low_stock_reminder_enabled: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-wood-600">
                หากยังมีรายการไม้หรือวัสดุที่ใกล้หมด/หมดสต็อก และยังไม่ได้รับการกดเติมสต็อก จะส่งแจ้งเตือนซ้ำวันละ 3 เวลา
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-wood-700 font-semibold">3 รอบเวลา:</span>
                {(settings.reminder_times || ['09:00', '13:00', '17:00']).map((time, idx) => (
                  <input
                    key={idx}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const updated = [...(settings.reminder_times || ['09:00', '13:00', '17:00'])];
                      updated[idx] = e.target.value;
                      setSettings({ ...settings, reminder_times: updated });
                    }}
                    className="px-2 py-1 rounded-lg border border-wood-300 font-mono text-xs bg-white"
                  />
                ))}
                <span className="text-wood-500 text-[11px]">(เช้า / บ่าย / เย็น)</span>
              </div>
            </div>
          </div>

          {/* Quick Instant Test Buttons */}
          <div className="p-4 rounded-2xl bg-wood-100/70 border border-wood-200 space-y-2">
            <span className="font-bold text-wood-900 block">4. ทดสอบส่งข้อความจริงเข้า Telegram (Instant Actions)</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={testingAction === 'lead'}
                onClick={handleTestLead}
                className="px-3 py-1.5 rounded-xl border border-gold-300 bg-white hover:bg-gold-50 text-gold-900 font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {testingAction === 'lead' ? 'กำลังส่ง...' : '⭐ ทดสอบแจ้งเตือนประเมินราคา'}
              </button>

              <button
                type="button"
                disabled={testingAction === 'summary'}
                onClick={handleTestStockSummary}
                className="px-3 py-1.5 rounded-xl border border-wood-300 bg-white hover:bg-wood-50 text-wood-800 font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {testingAction === 'summary' ? 'กำลังส่ง...' : '📋 ส่งสรุปสต็อกเดี๋ยวนี้'}
              </button>

              <button
                type="button"
                disabled={testingAction === 'low'}
                onClick={handleTestLowStock}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {testingAction === 'low' ? 'กำลังส่ง...' : '⚠️ ส่งเตือนของใกล้หมดเดี๋ยวนี้'}
              </button>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-wood-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-wood-300 hover:bg-wood-50 text-wood-700 font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl btn-gold text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
