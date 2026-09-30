import { Lead, InventoryItem, ScheduleItem, TelegramSettings } from '@/types';

export const DEFAULT_TELEGRAM_SETTINGS: TelegramSettings = {
  bot_token: '',
  chat_id: '',
  is_enabled: false,
  notify_on_lead: true,
  notify_on_low_stock: true,
  notify_on_schedule: true,
  daily_summary_enabled: true,
  daily_summary_time: '08:00',
  low_stock_reminder_enabled: true,
  reminder_times: ['09:00', '13:00', '17:00'],
};

export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://phet-woodwork.vercel.app').replace(/\/$/, '');

/**
 * Format message for a new customer lead or price estimator inquiry
 */
export function formatLeadTelegramMessage(lead: Lead): string {
  const now = new Date();
  const timeStr = now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `⭐ <b>มีลูกค้าสนใจสั่งทำผลงานใหม่ (New Quotation)!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>ชื่อลูกค้า:</b> ${lead.customer_name}
📞 <b>เบอร์โทรติดต่อ:</b> <code>${lead.phone_number}</code>
💬 <b>LINE ID:</b> ${lead.line_id || '-'}
🪵 <b>ประเภทงาน:</b> <b>${lead.interest_type || 'งานไม้สักสั่งทำ'}</b>
📐 <b>สเปก/ขนาด:</b> ${lead.dimensions || '-'}
💰 <b>ช่วงราคาประเมิน:</b> <b>${lead.budget_range || '-'}</b>
📝 <b>รายละเอียด:</b> <i>${lead.notes || '-'}</i>
━━━━━━━━━━━━━━━━━━━━
⏰ <i>บันทึกเวลา: ${timeStr} น.</i>
🔗 <b>ดูข้อมูลในระบบ:</b> <a href="${BASE_URL}/factory-gateway/leads">${BASE_URL}/factory-gateway/leads</a>`;
}

/**
 * Format message for immediate low stock alert
 */
export function formatLowStockTelegramMessage(item: InventoryItem): string {
  const isOut = item.quantity === 0 || item.status === 'out_of_stock';

  return `⚠️ <b>แจ้งเตือน: สต็อกไม้/วัสดุใกล้หมด!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>รายการ:</b> <b>${item.item_name}</b>
🏷️ <b>หมวดหมู่:</b> ${item.category_name_th || item.category}
📊 <b>คงเหลือในคลัง:</b> <b>${item.quantity} ${item.unit}</b>
🚨 <b>เกณฑ์แจ้งเตือนขั้นต่ำ:</b> &le; ${item.min_threshold} ${item.unit}
🔴 <b>สถานะ:</b> ${isOut ? '❌ หมดสต็อก (Out of Stock)' : '⚠️ ใกล้หมด (Low Stock)'}
📝 <b>สเปก:</b> ${item.specification || '-'}
━━━━━━━━━━━━━━━━━━━━
💡 <i>กรุณาประสานงานสั่งซื้อไม้สักหรืออุปกรณ์เพิ่ม</i>
🔗 <b>จัดการสต็อก:</b> <a href="${BASE_URL}/factory-gateway/inventory">${BASE_URL}/factory-gateway/inventory</a>`;
}

/**
 * Format message for daily full inventory summary
 */
export function formatDailyStockSummaryMessage(inventory: InventoryItem[], timeStr = '08:00'): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const total = inventory.length;
  const lowCount = inventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const inStockCount = total - lowCount;

  // Group by category
  const categoriesMap: { [cat: string]: InventoryItem[] } = {};
  inventory.forEach((item) => {
    const catName = item.category_name_th || item.category;
    if (!categoriesMap[catName]) categoriesMap[catName] = [];
    categoriesMap[catName].push(item);
  });

  let itemsBreakdown = '';
  for (const [catName, items] of Object.entries(categoriesMap)) {
    itemsBreakdown += `\n📁 <b>หมวด ${catName}:</b>\n`;
    items.forEach((it) => {
      const statusIcon = it.status === 'out_of_stock' ? '🔴 หมด' : it.status === 'low_stock' ? '🟡 ใกล้หมด' : '🟢 ปกติ';
      itemsBreakdown += `  • ${it.item_name}: <b>${it.quantity} ${it.unit}</b> [${statusIcon}]\n`;
    });
  }

  return `📋 <b>[รายงานสรุปสต็อกประจำวัน] - ${dateStr} (${timeStr} น.)</b>
🏭 <b>โรงงานช่างไม้ฝาทรงไทยเมืองเพชร</b>
━━━━━━━━━━━━━━━━━━━━
📊 <b>ภาพรวมสต็อก:</b>
• ทั้งหมด: <b>${total}</b> รายการ
• พร้อมใช้งาน: <b>${inStockCount}</b> รายการ
• ใกล้หมด/ต้องสั่งเพิ่ม: <b>${lowCount}</b> รายการ
━━━━━━━━━━━━━━━━━━━━
${itemsBreakdown}
━━━━━━━━━━━━━━━━━━━━
🔗 <b>จัดการสต็อก:</b> <a href="${BASE_URL}/factory-gateway/inventory">${BASE_URL}/factory-gateway/inventory</a>`;
}

/**
 * Format message for repeated low stock reminder (3 times a day)
 */
export function formatLowStockReminderMessage(lowItems: InventoryItem[], timeSlot: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let listStr = '';
  lowItems.forEach((it, idx) => {
    const isOut = it.quantity === 0 || it.status === 'out_of_stock';
    const tag = isOut ? '❌ หมดสต็อก' : '⚠️ ใกล้หมด';
    listStr += `${idx + 1}. <b>${it.item_name}</b> (คงเหลือ <b>${it.quantity} ${it.unit}</b> / เตือนเมื่อ &le; ${it.min_threshold} ${it.unit}) - ${tag}\n`;
  });

  return `🚨 <b>[แจ้งเตือนรอบ ${timeSlot} น.] ยังมีวัสดุไม่ได้รับการเติมสต็อก!</b>
📅 วันที่: ${dateStr}
━━━━━━━━━━━━━━━━━━━━
พบ <b>${lowItems.length} รายการ</b> ที่ต่ำกว่าเกณฑ์ขั้นต่ำ:

${listStr}
━━━━━━━━━━━━━━━━━━━━
💡 <i>ระบบจะแจ้งเตือน 3 รอบต่อวัน จนกว่าจะมีการกดเติมสต็อกในระบบ</i>
🔗 <b>ไปเติมสต็อก:</b> <a href="${BASE_URL}/factory-gateway/inventory">${BASE_URL}/factory-gateway/inventory</a>`;
}

/**
 * Format message for a new production schedule booking
 */
export function formatScheduleTelegramMessage(schedule: ScheduleItem): string {
  return `📅 <b>บันทึกคิวงานผลิตใหม่ (New Schedule)!</b>
━━━━━━━━━━━━━━━━━━━━
🏛️ <b>ชื่องาน/โปรเจกต์:</b> <b>${schedule.project_title}</b>
👤 <b>ลูกค้า/สถานที่:</b> ${schedule.customer_name}
🗓️ <b>กำหนดการ:</b> <code>${schedule.start_date}</code> ถึง <code>${schedule.end_date}</code>
🏷️ <b>สถานะ:</b> <b>${schedule.status_label_th}</b>
📝 <b>หมายเหตุ:</b> <i>${schedule.notes || '-'}</i>
━━━━━━━━━━━━━━━━━━━━
🔗 <b>ดูตารางคิวงาน:</b> <a href="${BASE_URL}/factory-gateway/schedule">${BASE_URL}/factory-gateway/schedule</a>`;
}

/**
 * Send Telegram message via Next.js internal API route
 */
export async function sendTelegramNotification(
  text: string,
  customSettings?: Partial<TelegramSettings>,
  type?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = { text, parse_mode: 'HTML' };
    if (type) payload.type = type;
    if (customSettings?.bot_token) payload.bot_token = customSettings.bot_token;
    if (customSettings?.chat_id) payload.chat_id = customSettings.chat_id;

    const res = await fetch('/api/notify/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Failed to send Telegram notification:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
