'use client';

import { 
  Project, 
  InstallationPin, 
  ScheduleItem, 
  InventoryItem, 
  Lead,
  SystemLog,
  CategoryItem,
  BotConfig,
  ChatbotFAQ,
  FactoryPost,
  EstimatorConfig,
  WorkTypeConfig,
  WoodGradeConfig,
  CarvingLevelConfig,
  TelegramSettings
} from '@/types';
import { 
  DEFAULT_TELEGRAM_SETTINGS,
  formatLeadTelegramMessage,
  formatLowStockTelegramMessage,
  formatDailyStockSummaryMessage,
  formatLowStockReminderMessage,
  formatScheduleTelegramMessage,
  sendTelegramNotification
} from './telegram';
import { 
  INITIAL_PROJECTS, 
  INITIAL_PINS, 
  INITIAL_SCHEDULES, 
  INITIAL_INVENTORY, 
  INITIAL_LEADS, 
  INITIAL_SYSTEM_LOGS, 
  INITIAL_CATEGORIES, 
  INITIAL_BOT_CONFIG, 
  INITIAL_BOT_FAQS, 
  INITIAL_POSTS 
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PROJECTS: 'woodwork_projects',
  PINS: 'woodwork_pins',
  SCHEDULES: 'woodwork_schedules',
  INVENTORY: 'woodwork_inventory',
  LEADS: 'woodwork_leads',
  SYSTEM_LOGS: 'woodwork_system_logs',
  CATEGORIES: 'woodwork_categories',
  BOT_CONFIG: 'woodwork_bot_config',
  BOT_FAQS: 'woodwork_bot_faqs',
  POSTS: 'woodwork_posts',
  ESTIMATOR: 'woodwork_estimator_config',
  TELEGRAM: 'woodwork_telegram_settings',
};

// Helper: Generate valid UUID v4
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function ensureUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return generateUUID();
}

// Safe local storage getter (Synchronous / 0ms)
function getLocalStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultVal;
  }
}

// Safe local storage setter with controlled event broadcast
function setLocalStorage<T>(key: string, value: T, shouldBroadcast = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (shouldBroadcast) {
      window.dispatchEvent(new Event('woodwork_store_updated'));
    }
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Helper: Wrap any promise with a maximum timeout (e.g. 8000ms) to prevent slow network hanging
async function withTimeout(promise: Promise<any>, timeoutMs = 8000): Promise<any> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(null), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch {
    clearTimeout(timeoutHandle);
    return null;
  }
}

// Supabase Realtime Sync Listener across all browser tabs and client devices
if (typeof window !== 'undefined' && isSupabaseConfigured && supabase) {
  try {
    supabase
      .channel('woodwork_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        window.dispatchEvent(new Event('woodwork_store_updated'));
      })
      .subscribe();
  } catch (e) {
    console.warn('Supabase Realtime subscription error:', e);
  }
}

// ==========================================
// System Activity Logs
// ==========================================
export async function getSystemLogs(): Promise<SystemLog[]> {
  const localLogs = getLocalStorage<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(20) as any,
        5000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        setLocalStorage(STORAGE_KEYS.SYSTEM_LOGS, res.data, false);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch logs error, using local fallback', e);
    }
  }
  return localLogs;
}

function fireAndForget(promiseLike: any) {
  if (promiseLike) {
    Promise.resolve(promiseLike).catch((err) => {
      console.warn('Background sync error:', err);
    });
  }
}

export async function logActivity(action: string, details: string, targetId?: string): Promise<SystemLog> {
  const newLog: SystemLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    target_id: targetId,
    created_at: new Date().toISOString(),
  };

  const current = getLocalStorage<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS);
  setLocalStorage(STORAGE_KEYS.SYSTEM_LOGS, [newLog, ...current.slice(0, 49)], false);

  if (isSupabaseConfigured && supabase) {
    fireAndForget(supabase.from('system_logs').insert(newLog));
  }

  return newLog;
}

// ==========================================
// 1. Projects (Catalog)
// ==========================================
export async function getProjects(): Promise<Project[]> {
  const localData = getLocalStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('projects').select('*').order('created_at', { ascending: false }) as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const isDifferent = JSON.stringify(localData) !== JSON.stringify(res.data);
        setLocalStorage(STORAGE_KEYS.PROJECTS, res.data, isDifferent);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch projects error, using local fallback', e);
    }
  }
  return localData;
}

export async function saveProject(project: Project, isNew = false): Promise<Project> {
  const safeProject: Project = {
    ...project,
    id: ensureUUID(project.id),
  };

  // 1. Update local storage immediately and notify listeners
  const current = getLocalStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const index = current.findIndex(p => p.id === safeProject.id || p.id === project.id);
  let updated: Project[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = safeProject;
  } else {
    updated = [safeProject, ...current];
  }
  setLocalStorage(STORAGE_KEYS.PROJECTS, updated, true); // Broadcast on mutation

  // 2. Sync to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('projects').upsert(safeProject);
      if (error) {
        console.error('Supabase saveProject error:', error);
      }
    } catch (err) {
      console.error('Supabase saveProject exception:', err);
    }
  }

  logActivity(
    isNew || index < 0 ? 'เพิ่มผลงานใหม่' : 'แก้ไขผลงาน',
    `บันทึกผลงาน "${safeProject.title}" (${safeProject.gallery_urls?.length || 1} รูปภาพ${safeProject.lat ? `, พิกัด Lat: ${safeProject.lat}` : ''})`,
    safeProject.id
  );

  return safeProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  const current = getLocalStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const target = current.find(p => p.id === id);

  const filtered = current.filter(p => p.id !== id);
  setLocalStorage(STORAGE_KEYS.PROJECTS, filtered, true); // Broadcast on mutation

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteProject error:', error);
      }
    } catch (err) {
      console.error('Supabase deleteProject exception:', err);
    }
  }

  logActivity(
    'ลบผลงาน',
    `ลบผลงาน "${target?.title || id}" ออกจากระบบ`,
    id
  );

  return true;
}

// ==========================================
// 2. Map Pins (Installations)
// ==========================================
export async function getPins(): Promise<InstallationPin[]> {
  const localPins = getLocalStorage<InstallationPin[]>(STORAGE_KEYS.PINS, INITIAL_PINS);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('installations').select('*') as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const isDifferent = JSON.stringify(localPins) !== JSON.stringify(res.data);
        setLocalStorage(STORAGE_KEYS.PINS, res.data, isDifferent);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch pins error, using local fallback', e);
    }
  }
  return localPins;
}

export async function savePin(pin: InstallationPin): Promise<InstallationPin> {
  const current = getLocalStorage<InstallationPin[]>(STORAGE_KEYS.PINS, INITIAL_PINS);
  const index = current.findIndex(p => p.id === pin.id);
  let updated: InstallationPin[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = pin;
  } else {
    updated = [pin, ...current];
  }
  setLocalStorage(STORAGE_KEYS.PINS, updated, true); // Broadcast on mutation

  // Sync to Supabase
  if (isSupabaseConfigured && supabase) {
    const dbPayload = {
      id: pin.id.includes('-') && pin.id.length > 20 ? pin.id : undefined,
      title: pin.title,
      category: pin.category,
      category_name_th: pin.category_name_th,
      province: pin.province,
      location_name: pin.location_name,
      lat: pin.lat,
      lng: pin.lng,
      image_url: pin.image_url,
      description: pin.description,
      wood_details: pin.wood_details,
      completed_year: pin.completed_year,
    };
    try {
      if (dbPayload.id) {
        const { error } = await supabase.from('installations').upsert(dbPayload);
        if (error) console.error('Supabase upsert pin error:', error);
      } else {
        const { error } = await supabase.from('installations').insert(dbPayload);
        if (error) console.error('Supabase insert pin error:', error);
      }
    } catch (err) {
      console.error('Supabase savePin exception:', err);
    }
  }

  logActivity(
    index >= 0 ? 'แก้ไขหมุดแผนที่' : 'เพิ่มหมุดแผนที่ใหม่',
    `บันทึกผลงานบนแผนที่ "${pin.title}" (${pin.location_name})`,
    pin.id
  );

  return pin;
}

export async function deletePin(id: string): Promise<boolean> {
  const current = getLocalStorage<InstallationPin[]>(STORAGE_KEYS.PINS, INITIAL_PINS);
  const target = current.find(p => p.id === id);
  setLocalStorage(STORAGE_KEYS.PINS, current.filter(p => p.id !== id), true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('installations').delete().eq('id', id);
      if (error) console.error('Supabase delete pin error:', error);
    } catch (err) {
      console.error('Supabase deletePin exception:', err);
    }
  }

  logActivity(
    'ลบหมุดแผนที่',
    `ลบหมุดผลงาน "${target?.title || id}" ออกจากแผนที่`,
    id
  );

  return true;
}

// ==========================================
// 3. Dynamic Categories Manager
// ==========================================
export async function getCategories(type?: 'project' | 'map' | 'inventory'): Promise<CategoryItem[]> {
  const allCategories = getLocalStorage<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  if (type) {
    return allCategories.filter(c => c.type === type);
  }
  return allCategories;
}

export async function saveCategory(cat: CategoryItem): Promise<CategoryItem> {
  const current = getLocalStorage<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const index = current.findIndex(c => c.id === cat.id && c.type === cat.type);
  let updated: CategoryItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = cat;
  } else {
    updated = [cat, ...current];
  }
  setLocalStorage(STORAGE_KEYS.CATEGORIES, updated, true);

  logActivity(
    index >= 0 ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่',
    `บันทึกหมวดหมู่ "${cat.name_th}" (ประเภท: ${cat.type})`,
    cat.id
  );

  return cat;
}

export async function deleteCategory(id: string, type: 'project' | 'map' | 'inventory'): Promise<boolean> {
  const current = getLocalStorage<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const target = current.find(c => c.id === id && c.type === type);
  const filtered = current.filter(c => !(c.id === id && c.type === type));
  setLocalStorage(STORAGE_KEYS.CATEGORIES, filtered, true);

  logActivity(
    'ลบหมวดหมู่',
    `ลบหมวดหมู่ "${target?.name_th || id}" ออกจากระบบ`,
    id
  );

  return true;
}

// ==========================================
// 4. Chatbot Config & FAQs
// ==========================================
export async function getBotConfig(): Promise<BotConfig> {
  return getLocalStorage<BotConfig>(STORAGE_KEYS.BOT_CONFIG, INITIAL_BOT_CONFIG);
}

export async function saveBotConfig(config: BotConfig): Promise<BotConfig> {
  setLocalStorage(STORAGE_KEYS.BOT_CONFIG, config, true);
  logActivity(
    'ตั้งค่าแชทบอท',
    `อัปเดตการตั้งค่าแชทบอท "${config.bot_name}" และข้อความต้อนรับ`,
    'bot-config'
  );
  return config;
}

export async function getBotFaqs(): Promise<ChatbotFAQ[]> {
  const localFaqs = getLocalStorage<ChatbotFAQ[]>(STORAGE_KEYS.BOT_FAQS, INITIAL_BOT_FAQS);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('chatbot_faqs').select('*') as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        // Merge Supabase data with local metadata (title, related_options, is_active) if available
        const merged: ChatbotFAQ[] = res.data.map((item: any) => {
          const matchedLocal = localFaqs.find(l => l.id === item.id || l.answer === item.answer);
          return {
            id: item.id,
            title: item.title || matchedLocal?.title || (item.question_pattern?.[0] ? `คำถาม: ${item.question_pattern[0]}` : 'คำตอบอัตโนมัติ'),
            category: item.category || matchedLocal?.category || 'general',
            question_pattern: Array.isArray(item.question_pattern) ? item.question_pattern : [],
            answer: item.answer || '',
            related_options: Array.isArray(item.related_options) ? item.related_options : matchedLocal?.related_options,
            is_active: item.is_active !== undefined ? item.is_active : (matchedLocal?.is_active ?? true),
          };
        });
        const isDifferent = JSON.stringify(localFaqs) !== JSON.stringify(merged);
        setLocalStorage(STORAGE_KEYS.BOT_FAQS, merged, isDifferent);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch chatbot faqs error', e);
    }
  }
  return localFaqs;
}

export async function saveBotFaq(faq: ChatbotFAQ): Promise<ChatbotFAQ> {
  const safeId = ensureUUID(faq.id);
  const safeFaq: ChatbotFAQ = {
    ...faq,
    id: safeId,
    title: faq.title?.trim() || faq.question_pattern[0] || 'คำตอบอัตโนมัติ',
    is_active: faq.is_active !== false,
  };

  const current = getLocalStorage<ChatbotFAQ[]>(STORAGE_KEYS.BOT_FAQS, INITIAL_BOT_FAQS);
  const index = current.findIndex(f => f.id === safeFaq.id || f.id === faq.id);
  let updated: ChatbotFAQ[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = safeFaq;
  } else {
    updated = [safeFaq, ...current];
  }
  setLocalStorage(STORAGE_KEYS.BOT_FAQS, updated, true);

  if (isSupabaseConfigured && supabase) {
    const dbPayload: any = {
      id: safeId,
      category: safeFaq.category || 'general',
      question_pattern: safeFaq.question_pattern,
      answer: safeFaq.answer,
    };
    try {
      const { error } = await supabase.from('chatbot_faqs').upsert(dbPayload);
      if (error) console.error('Supabase saveBotFaq error:', error);
    } catch (err) {
      console.error('Supabase saveBotFaq exception:', err);
    }
  }

  logActivity(
    index >= 0 ? 'แก้ไขคำตอบบอท' : 'เพิ่มคำตอบบอท',
    `บันทึกคำตอบอัตโนมัติ "${safeFaq.title}" (คำค้น: ${safeFaq.question_pattern.slice(0, 3).join(', ')})`,
    safeFaq.id
  );

  return safeFaq;
}

export async function deleteBotFaq(id: string): Promise<boolean> {
  const current = getLocalStorage<ChatbotFAQ[]>(STORAGE_KEYS.BOT_FAQS, INITIAL_BOT_FAQS);
  const target = current.find(f => f.id === id);
  const filtered = current.filter(f => f.id !== id);
  setLocalStorage(STORAGE_KEYS.BOT_FAQS, filtered, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('chatbot_faqs').delete().eq('id', id);
      if (error) console.error('Supabase deleteBotFaq error:', error);
    } catch (err) {
      console.error('Supabase deleteBotFaq exception:', err);
    }
  }

  logActivity(
    'ลบคำตอบบอท',
    `ลบคำตอบอัตโนมัติ "${target?.title || target?.question_pattern?.join(', ') || id}"`,
    id
  );

  return true;
}

export async function resetBotFaqsToDefault(): Promise<ChatbotFAQ[]> {
  setLocalStorage(STORAGE_KEYS.BOT_FAQS, INITIAL_BOT_FAQS, true);
  if (isSupabaseConfigured && supabase) {
    for (const faq of INITIAL_BOT_FAQS) {
      const dbPayload = {
        id: ensureUUID(faq.id),
        category: faq.category || 'general',
        question_pattern: faq.question_pattern,
        answer: faq.answer,
      };
      fireAndForget(supabase.from('chatbot_faqs').upsert(dbPayload));
    }
  }
  logActivity('คืนค่าคลังคำตอบบอท', 'คืนค่าคำถาม-คำตอบทั้งหมดเป็นค่าเริ่มต้นมาตรฐาน', 'bot-reset');
  return INITIAL_BOT_FAQS;
}

// ==========================================
// 5. Leads CRM
// ==========================================
export async function getLeads(): Promise<Lead[]> {
  const localLeads = getLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('leads').select('*').order('created_at', { ascending: false }) as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const isDifferent = JSON.stringify(localLeads) !== JSON.stringify(res.data);
        setLocalStorage(STORAGE_KEYS.LEADS, res.data, isDifferent);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch leads error', e);
    }
  }
  return localLeads;
}

export async function createLead(leadData: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: generateUUID(),
    created_at: new Date().toISOString(),
  };

  // 1. Update local storage immediately
  const current = getLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  setLocalStorage(STORAGE_KEYS.LEADS, [newLead, ...current], true);

  // 2. Trigger Telegram notification for new lead immediately (NEVER bypassed)
  try {
    const tg = getTelegramSettingsSync();
    sendTelegramNotification(formatLeadTelegramMessage(newLead), tg, 'lead');
  } catch (e) {
    console.warn('Telegram lead trigger error', e);
  }

  // 3. Insert into Supabase with guaranteed UUID
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads').insert(newLead).select().single();
      if (!error && data) {
        logActivity(
          'ลูกค้าติดต่อใหม่',
          `ลูกค้า "${newLead.customer_name}" (${newLead.phone_number}) สนใจ: ${newLead.interest_type || 'งานไม้สัก'}`,
          newLead.id
        );
        return data;
      }
    } catch (e) {
      console.warn('Supabase insert lead error', e);
    }
  }

  logActivity(
    'ลูกค้าติดต่อใหม่',
    `ลูกค้า "${newLead.customer_name}" (${newLead.phone_number}) สนใจ: ${newLead.interest_type || 'งานไม้สัก'}`,
    newLead.id
  );

  return newLead;
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<boolean> {
  const current = getLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  const updated = current.map(l => l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l);
  setLocalStorage(STORAGE_KEYS.LEADS, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) console.error('Supabase updateLeadStatus error:', error);
    } catch (err) {
      console.error('Supabase updateLeadStatus exception:', err);
    }
  }

  return true;
}

// ==========================================
// 6. Schedules (Production Queue)
// ==========================================
export async function getSchedules(): Promise<ScheduleItem[]> {
  const localSchedules = getLocalStorage<ScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('schedules').select('*').order('start_date', { ascending: true }) as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const isDifferent = JSON.stringify(localSchedules) !== JSON.stringify(res.data);
        setLocalStorage(STORAGE_KEYS.SCHEDULES, res.data, isDifferent);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch schedules error', e);
    }
  }
  return localSchedules;
}

export async function saveSchedule(item: ScheduleItem): Promise<ScheduleItem> {
  const safeItem: ScheduleItem = {
    ...item,
    id: ensureUUID(item.id),
  };
  const current = getLocalStorage<ScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  const index = current.findIndex(s => s.id === safeItem.id || s.id === item.id);
  let updated: ScheduleItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = safeItem;
  } else {
    updated = [...current, safeItem];
  }
  setLocalStorage(STORAGE_KEYS.SCHEDULES, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('schedules').upsert(safeItem);
      if (error) console.error('Supabase saveSchedule error:', error);
    } catch (err) {
      console.error('Supabase saveSchedule exception:', err);
    }
  }

  logActivity(
    'บันทึกคิวงาน',
    `บันทึกคิวงาน "${safeItem.project_title}" (${safeItem.start_date} ถึง ${safeItem.end_date})`,
    safeItem.id
  );

  return safeItem;
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const current = getLocalStorage<ScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  const target = current.find(s => s.id === id);
  const filtered = current.filter(s => s.id !== id);
  setLocalStorage(STORAGE_KEYS.SCHEDULES, filtered, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) console.error('Supabase deleteSchedule error:', error);
    } catch (err) {
      console.error('Supabase deleteSchedule exception:', err);
    }
  }

  logActivity(
    'ลบคิวงาน',
    `ลบคิวงาน "${target?.project_title || id}" ออกจากระบบ`,
    id
  );

  return true;
}

// ==========================================
// 7. Inventory (Wood & Materials)
// ==========================================
export async function getInventory(): Promise<InventoryItem[]> {
  const localInventory = getLocalStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('inventory').select('*').order('item_name', { ascending: true }) as any,
        8000
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const isDifferent = JSON.stringify(localInventory) !== JSON.stringify(res.data);
        setLocalStorage(STORAGE_KEYS.INVENTORY, res.data, isDifferent);
        return res.data;
      }
    } catch (e) {
      console.warn('Supabase fetch inventory error', e);
    }
  }
  return localInventory;
}

export async function saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
  const safeItem: InventoryItem = {
    ...item,
    id: ensureUUID(item.id),
  };
  const current = getLocalStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  const index = current.findIndex(i => i.id === safeItem.id || i.id === item.id);
  let updated: InventoryItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = safeItem;
  } else {
    updated = [safeItem, ...current];
  }
  setLocalStorage(STORAGE_KEYS.INVENTORY, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('inventory').upsert(safeItem);
      if (error) console.error('Supabase saveInventoryItem error:', error);
    } catch (err) {
      console.error('Supabase saveInventoryItem exception:', err);
    }
  }

  logActivity(
    'บันทึกรายการสต็อก',
    `บันทึกวัสดุ/ไม้สัก "${safeItem.item_name}" (${safeItem.quantity} ${safeItem.unit})`,
    safeItem.id
  );

  return safeItem;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const current = getLocalStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  const target = current.find(i => i.id === id);
  const filtered = current.filter(i => i.id !== id);
  setLocalStorage(STORAGE_KEYS.INVENTORY, filtered, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) console.error('Supabase deleteInventoryItem error:', error);
    } catch (err) {
      console.error('Supabase deleteInventoryItem exception:', err);
    }
  }

  logActivity(
    'ลบรายการสต็อก',
    `ลบวัสดุ/ไม้สัก "${target?.item_name || id}" ออกจากระบบสต็อก`,
    id
  );

  return true;
}

export async function updateInventoryQty(id: string, delta: number): Promise<boolean> {
  const current = getLocalStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  const updated = current.map(item => {
    if (item.id === id) {
      const newQty = Math.max(0, item.quantity + delta);
      const status: InventoryItem['status'] = 
        newQty === 0 ? 'out_of_stock' : newQty <= item.min_threshold ? 'low_stock' : 'in_stock';
      return { ...item, quantity: newQty, status };
    }
    return item;
  });
  setLocalStorage(STORAGE_KEYS.INVENTORY, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: currentItem } = await supabase.from('inventory').select('quantity, min_threshold').eq('id', id).single();
      if (currentItem) {
        const newQty = Math.max(0, currentItem.quantity + delta);
        const status: InventoryItem['status'] = 
          newQty === 0 ? 'out_of_stock' : newQty <= currentItem.min_threshold ? 'low_stock' : 'in_stock';
        const { error } = await supabase.from('inventory').update({ quantity: newQty, status, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) console.error('Supabase update inventory error:', error);
      }
    } catch (e) {
      console.warn('Supabase update inventory error', e);
    }
  }

  // Trigger Telegram low stock alert if reduced and under threshold
  if (delta < 0) {
    const targetItem = updated.find(i => i.id === id);
    if (targetItem && (targetItem.status === 'low_stock' || targetItem.status === 'out_of_stock')) {
      try {
        const tg = getTelegramSettingsSync();
        if (tg.is_enabled && tg.notify_on_low_stock) {
          sendTelegramNotification(formatLowStockTelegramMessage(targetItem), tg);
        }
      } catch (e) {
        console.warn('Telegram low stock alert error', e);
      }
    }
  }

  return true;
}

// ==========================================
// 8. Factory Posts & Social Updates (Feed CMS)
// ==========================================
export async function getPosts(includePrivate = false): Promise<FactoryPost[]> {
  let localPosts = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, []);

  // Sort helper: Pinned first, then newest published_at
  const sortPosts = (posts: FactoryPost[]) => {
    return [...posts].sort((a, b) => {
      if (a.pin_to_top && !b.pin_to_top) return -1;
      if (!a.pin_to_top && b.pin_to_top) return 1;
      const timeB = new Date(b.published_at || b.created_at).getTime();
      const timeA = new Date(a.published_at || a.created_at).getTime();
      return timeB - timeA;
    });
  };

  const filterVisible = (posts: FactoryPost[]) => {
    const now = new Date();
    return posts.filter((post) => {
      if (!post.visibility || post.visibility === 'public') return true;
      if (post.visibility === 'scheduled') {
        const publishTime = new Date(post.scheduled_at || post.published_at || post.created_at);
        return publishTime <= now;
      }
      return false; // Hide 'private' and 'draft'
    });
  };

  // Sync from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      let res = await withTimeout(
        supabase.from('factory_posts').select('*') as any,
        8000
      );

      // Fallback to table 'posts' if 'factory_posts' was empty or not found
      if ((!res || !res.data || res.data.length === 0) && (!res || res.error)) {
        res = await withTimeout(
          supabase.from('posts').select('*') as any,
          5000
        );
      }

      if (res && !res.error && res.data && res.data.length > 0) {
        const parsed: FactoryPost[] = res.data.map((p: any) => ({
          id: p.id,
          title: p.title || '',
          caption: p.caption || '',
          post_type: (p.post_type as any) || (p.facebook_post_url ? 'facebook' : p.video_url ? 'video' : 'photo'),
          media_urls: Array.isArray(p.media_urls) ? p.media_urls : [],
          video_url: p.video_url || undefined,
          facebook_post_url: p.facebook_post_url || undefined,
          visibility: p.visibility || 'public',
          scheduled_at: p.scheduled_at || undefined,
          published_at: p.published_at || p.created_at || new Date().toISOString(),
          created_at: p.created_at || new Date().toISOString(),
          author_name: p.author_name || 'ช่างเอส (เจ้าของโรงงาน)',
          tags: Array.isArray(p.tags) ? p.tags : [],
          likes_count: p.likes_count || 0,
          pin_to_top: !!p.pin_to_top,
        }));

        const isDifferent = JSON.stringify(localPosts) !== JSON.stringify(parsed);
        setLocalStorage(STORAGE_KEYS.POSTS, parsed, isDifferent);
        return includePrivate ? sortPosts(parsed) : sortPosts(filterVisible(parsed));
      } else if (res && !res.error && res.data && res.data.length === 0) {
        // If Supabase table is genuinely empty
        setLocalStorage(STORAGE_KEYS.POSTS, [], false);
        return [];
      }
    } catch (e) {
      console.warn('Supabase fetch posts error, using local fallback', e);
    }
  }

  const allPosts = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, localPosts);
  return includePrivate ? sortPosts(allPosts) : sortPosts(filterVisible(allPosts));
}

export async function savePost(post: FactoryPost): Promise<FactoryPost> {
  const safePost: FactoryPost = {
    ...post,
    id: ensureUUID(post.id),
    published_at: post.published_at || new Date().toISOString(),
    created_at: post.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media_urls: post.media_urls || [],
    tags: post.tags || [],
    likes_count: post.likes_count ?? 0,
    pin_to_top: !!post.pin_to_top,
  };

  const current = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const index = current.findIndex(p => p.id === safePost.id || p.id === post.id);
  let updated: FactoryPost[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = safePost;
  } else {
    updated = [safePost, ...current];
  }
  setLocalStorage(STORAGE_KEYS.POSTS, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('factory_posts').upsert(safePost);
      if (error) console.error('Supabase savePost error:', error);
    } catch (err) {
      console.error('Supabase savePost exception:', err);
    }
  }

  logActivity(
    index >= 0 ? 'แก้ไขโพสต์ข่าวสาร' : 'สร้างโพสต์ข่าวสารใหม่',
    `บันทึกโพสต์ "${safePost.title}" (${safePost.post_type}, สถานะ: ${safePost.visibility})`,
    safePost.id
  );

  return safePost;
}

export async function deletePost(id: string): Promise<boolean> {
  const current = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const target = current.find(p => p.id === id);
  const filtered = current.filter(p => p.id !== id);
  setLocalStorage(STORAGE_KEYS.POSTS, filtered, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('factory_posts').delete().eq('id', id);
      if (error) console.error('Supabase deletePost error:', error);
    } catch (err) {
      console.error('Supabase deletePost exception:', err);
    }
  }

  logActivity(
    'ลบโพสต์ข่าวสาร',
    `ลบโพสต์ "${target?.title || id}" ออกจากระบบ`,
    id
  );

  return true;
}

export async function togglePinPost(id: string): Promise<boolean> {
  const current = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  let newPinState = false;
  const updated = current.map(p => {
    if (p.id === id) {
      newPinState = !p.pin_to_top;
      return { ...p, pin_to_top: newPinState, updated_at: new Date().toISOString() };
    }
    return p;
  });
  setLocalStorage(STORAGE_KEYS.POSTS, updated, true);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('factory_posts').update({ pin_to_top: newPinState }).eq('id', id);
      if (error) console.error('Supabase togglePinPost error:', error);
    } catch (err) {
      console.error('Supabase togglePinPost exception:', err);
    }
  }

  logActivity(
    newPinState ? 'ปักหมุดโพสต์' : 'ยกเลิกปักหมุดโพสต์',
    `${newPinState ? 'ปักหมุดโพสต์ให้อยู่บนสุด' : 'ยกเลิกปักหมุด'} ID: ${id}`,
    id
  );

  return newPinState;
}

export async function likePost(id: string): Promise<number> {
  const current = getLocalStorage<FactoryPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  let newCount = 0;
  const updated = current.map(p => {
    if (p.id === id) {
      newCount = (p.likes_count || 0) + 1;
      return { ...p, likes_count: newCount };
    }
    return p;
  });
  setLocalStorage(STORAGE_KEYS.POSTS, updated, false);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('factory_posts').update({ likes_count: newCount }).eq('id', id);
      if (error) console.error('Supabase likePost error:', error);
    } catch (err) {
      console.error('Supabase likePost exception:', err);
    }
  }

  return newCount;
}

// ==========================================
// 9. Price Estimator CMS Configuration
// ==========================================

export const DEFAULT_ESTIMATOR_CONFIG: EstimatorConfig = {
  id: 'default_config',
  workTypes: [
    {
      id: 'wall',
      name: 'ฝาเรือนไทย / ฝาปะกนลูกฟักลายรัดเอว',
      basePrice: 4800,
      unit: 'ตร.ม.',
      defaultW: 4.0,
      defaultH: 2.8,
      wLabel: 'ความยาวแนวฝา (เมตร)',
      hLabel: 'ความสูงเพดาน (เมตร)',
      desc: 'เข้าลิ้นลูกฟัก งานรัดเอวแบบโบราณ แข็งแรง ทนทาน ประกอบสำเร็จยกแผงพร้อมติดตั้ง',
    },
    {
      id: 'gable',
      name: 'โครงจั่วเพชรบุรี / จั่วทรงปั้นหยา',
      basePrice: 32000,
      unit: 'ชุด',
      defaultW: 3.5,
      defaultH: 2.2,
      wLabel: 'ความกว้างฐาน (เมตร)',
      hLabel: 'ความสูงยอดจั่ว (เมตร)',
      desc: 'เอกลักษณ์ช่างเมืองเพชร ลวดลายคมชัด ลายบราเกล็ด เข้าเดือยไม้โบราณ',
    },
    {
      id: 'door',
      name: 'บานประตูเรือนไทย / ประตูไม้จริง',
      basePrice: 26000,
      unit: 'คู่',
      defaultW: 1.8,
      defaultH: 2.4,
      wLabel: 'ความกว้างรวม (เมตร)',
      hLabel: 'ความสูง (เมตร)',
      desc: 'ไม้แท้หนา 1.5 - 2 นิ้ว เข้าลูกฟักประณีต บานไม่โก่งตัว',
    },
    {
      id: 'window_frame',
      name: 'ชุดวงกบและช่องแสงลูกฟัก',
      basePrice: 15000,
      unit: 'ชุด',
      defaultW: 2.0,
      defaultH: 1.4,
      wLabel: 'ความกว้าง (เมตร)',
      hLabel: 'ความสูง (เมตร)',
      desc: 'วงกบไม้จริง เข้าลิ้นเดือยแน่นหนา ล็อคเข้าร่องเป๊ะ กันน้ำซึม',
    },
    {
      id: 'custom',
      name: 'งานไม้สั่งทำตามแบบ (โต๊ะ, ระเบียง, ศาลา ฯลฯ)',
      basePrice: 18000,
      unit: 'งาน/ชุด',
      defaultW: 2.0,
      defaultH: 1.0,
      wLabel: 'ความกว้าง (เมตร)',
      hLabel: 'ความยาว/ความสูง (เมตร)',
      desc: 'ทำตามขนาดและแบบที่ลูกค้าต้องการ พูดคุยแบบกับช่างและประเมินหน้างานจริง',
    },
  ],
  woodGrades: [
    { id: 'grade_teak_std', name: 'ไม้สัก (อบแห้งคัดเกรด มาตรฐานโรงงาน)', multiplier: 1.0, desc: 'ผ่านเตาอบแห้ง ความชื้นต่ำ ลายไม้สวยงาม ปลวกมอดไม่กวน ทนทาน' },
    { id: 'grade_teak_old', name: 'ไม้สักเก่า / ไม้สักคัดแก่นพิเศษ', multiplier: 1.25, desc: 'เนื้อไม้แกร่งแห้งสนิท ลายไม้เข้มจัด เหมาะกับงานพรีเมียมหรืองานอนุรักษ์' },
    { id: 'grade_sadao', name: 'ไม้สะเดา (เหนียวทน มอดปลวกไม่กิน ราคาประหยัด)', multiplier: 0.75, desc: 'เนื้อเหนียวแข็งแรง ทนทานมอดปลวก คุ้มค่างบประมาณ นิยมใช้ทำฝาและโครงสร้าง' },
    { id: 'grade_tabaek', name: 'ไม้ตะแบก / ไม้เนื้อแข็ง', multiplier: 0.70, desc: 'เนื้อไม้แน่นละเอียด ลายสวย ทนทาน ใช้งานได้อเนกประสงค์' },
    { id: 'grade_own_wood', name: 'ลูกค้านำไม้มาเอง (คิดเฉพาะค่าแรงและติดตั้ง)', multiplier: 0.45, desc: 'นำไม้ของท่านมาให้โรงงานแปรรูป ไส เข้าลิ้น ประกอบ และติดตั้ง คิดเฉพาะค่าแรงช่าง' },
  ],
  carvingLevels: [
    { id: 'smooth', name: 'ลูกฟักเรียบ / ลายรัดเอวมาตรฐานช่างไทย', multiplier: 1.0, desc: 'งานเข้าลิ้นเรียบเนียน โชว์เสี้ยนและลายไม้แท้ตามธรรมชาติ' },
    { id: 'medium', name: 'ลวดลายเพชรบุรีประยุกต์ (บราเกล็ด / กระจังจั่ว)', multiplier: 1.15, desc: 'แกะและฉลุลวดลายเอกลักษณ์ช่างเมืองเพชร สัดส่วนงดงามลงตัว' },
    { id: 'high', name: 'งานแกะลายสั่งทำพิเศษตามแบบลูกค้า', multiplier: 1.35, desc: 'แกะสลักลวดลายตามแบบหรือรูปถ่ายที่ลูกค้ากำหนด โดยช่างฝีมือเฉพาะทาง' },
  ],
  minPriceMultiplier: 0.95,
  maxPriceMultiplier: 1.15,
};

export async function getEstimatorConfig(): Promise<EstimatorConfig> {
  const localConfig = getLocalStorage<EstimatorConfig>(STORAGE_KEYS.ESTIMATOR, DEFAULT_ESTIMATOR_CONFIG);

  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from('estimator_config').select('*').limit(1).maybeSingle() as any,
        8000
      );

      if (res && !res.error && res.data) {
        const d = res.data;
        const config: EstimatorConfig = {
          id: d.id || 'default_config',
          workTypes: Array.isArray(d.work_types) ? d.work_types : localConfig.workTypes,
          woodGrades: Array.isArray(d.wood_grades) ? d.wood_grades : localConfig.woodGrades,
          carvingLevels: Array.isArray(d.carving_levels) ? d.carving_levels : localConfig.carvingLevels,
          minPriceMultiplier: typeof d.min_price_multiplier === 'number' ? d.min_price_multiplier : (localConfig.minPriceMultiplier ?? 0.95),
          maxPriceMultiplier: typeof d.max_price_multiplier === 'number' ? d.max_price_multiplier : (localConfig.maxPriceMultiplier ?? 1.15),
          updated_at: d.updated_at,
        };
        const isDifferent = JSON.stringify(localConfig) !== JSON.stringify(config);
        setLocalStorage(STORAGE_KEYS.ESTIMATOR, config, isDifferent);
        return config;
      }
    } catch (e) {
      console.warn('Supabase fetch estimator config error, using local fallback', e);
    }
  }

  return localConfig;
}

export async function saveEstimatorConfig(config: EstimatorConfig): Promise<EstimatorConfig> {
  const safeConfig: EstimatorConfig = {
    ...config,
    id: config.id || 'default_config',
    minPriceMultiplier: Number(config.minPriceMultiplier) || 0.95,
    maxPriceMultiplier: Number(config.maxPriceMultiplier) || 1.15,
    updated_at: new Date().toISOString(),
  };

  setLocalStorage(STORAGE_KEYS.ESTIMATOR, safeConfig, true);

  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: safeConfig.id,
      work_types: safeConfig.workTypes,
      wood_grades: safeConfig.woodGrades,
      carving_levels: safeConfig.carvingLevels,
      min_price_multiplier: safeConfig.minPriceMultiplier,
      max_price_multiplier: safeConfig.maxPriceMultiplier,
      updated_at: safeConfig.updated_at,
    };
    try {
      const { error } = await supabase.from('estimator_config').upsert(payload);
      if (error) console.error('Supabase saveEstimatorConfig error:', error);
    } catch (err) {
      console.error('Supabase saveEstimatorConfig exception:', err);
    }
  }

  logActivity(
    'บันทึกการตั้งค่าคำนวณราคา',
    `อัปเดตประเภทงาน (${safeConfig.workTypes.length} รายการ), เกรดไม้ (${safeConfig.woodGrades.length} เกรด), ลายแกะสลัก (${safeConfig.carvingLevels.length} ระดับ)`,
    safeConfig.id
  );

  return safeConfig;
}

export async function resetEstimatorConfig(): Promise<EstimatorConfig> {
  return await saveEstimatorConfig(DEFAULT_ESTIMATOR_CONFIG);
}

// ==========================================
// 10. Telegram Notification Settings & Automation
// ==========================================

export function getTelegramSettingsSync(): TelegramSettings {
  return getLocalStorage<TelegramSettings>(STORAGE_KEYS.TELEGRAM, DEFAULT_TELEGRAM_SETTINGS);
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
  const local = getTelegramSettingsSync();
  if (local && local.bot_token && local.chat_id) {
    return local;
  }

  // Attempt to hydrate from server config
  try {
    const res = await fetch('/api/notify/telegram');
    if (res.ok) {
      const data = await res.json();
      if (data?.settings && data.settings.bot_token) {
        setLocalStorage(STORAGE_KEYS.TELEGRAM, data.settings, true);
        return data.settings;
      }
    }
  } catch (e) {
    // Ignore fetch error
  }

  return local || DEFAULT_TELEGRAM_SETTINGS;
}

export async function saveTelegramSettings(settings: TelegramSettings): Promise<TelegramSettings> {
  setLocalStorage(STORAGE_KEYS.TELEGRAM, settings, true);

  // Sync to server API so server always has token for external customer submissions
  try {
    fetch('/api/notify/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_config', settings }),
    }).catch(() => {});
  } catch (e) {
    // Ignore fetch error
  }

  logActivity(
    'บันทึกการตั้งค่า Telegram',
    `สถานะการแจ้งเตือน: ${settings.is_enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} (Chat ID: ${settings.chat_id ? settings.chat_id.slice(0, 4) + '***' : 'ยังไม่ระบุ'})`
  );
  return settings;
}

/**
 * Check and trigger scheduled Telegram alerts (Daily full summary & 3x daily low stock reminder)
 */
export async function checkAndTriggerTelegramScheduledAlerts(): Promise<{
  summaryTriggered: boolean;
  reminderTriggered: boolean;
}> {
  const settings = getTelegramSettingsSync();
  if (!settings.is_enabled || !settings.bot_token || !settings.chat_id) {
    return { summaryTriggered: false, reminderTriggered: false };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentHHMM = `${currentHour}:${currentMinute}`;

  let summaryTriggered = false;
  let reminderTriggered = false;

  // 1. Daily Full Inventory Summary (e.g. at 08:00)
  if (settings.daily_summary_enabled && settings.daily_summary_time) {
    const targetHour = settings.daily_summary_time.split(':')[0] || '08';
    const isTargetHour = currentHour === targetHour;
    const alreadySentToday = settings.last_summary_sent === todayStr;

    if (isTargetHour && !alreadySentToday) {
      const inv = await getInventory();
      const res = await sendTelegramNotification(
        formatDailyStockSummaryMessage(inv, settings.daily_summary_time),
        settings
      );
      if (res.success) {
        settings.last_summary_sent = todayStr;
        saveTelegramSettings(settings);
        summaryTriggered = true;
      }
    }
  }

  // 2. Low-Stock Reminder (3 times a day if items are still low/out of stock)
  if (settings.low_stock_reminder_enabled && Array.isArray(settings.reminder_times) && settings.reminder_times.length > 0) {
    const inv = await getInventory();
    const lowItems = inv.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');

    if (lowItems.length > 0) {
      for (const slot of settings.reminder_times) {
        const slotHour = slot.split(':')[0];
        const isTargetSlotHour = currentHour === slotHour;
        const slotKey = `${todayStr}-${slotHour}`;

        if (isTargetSlotHour && settings.last_reminder_sent !== slotKey) {
          const res = await sendTelegramNotification(
            formatLowStockReminderMessage(lowItems, slot),
            settings
          );
          if (res.success) {
            settings.last_reminder_sent = slotKey;
            saveTelegramSettings(settings);
            reminderTriggered = true;
          }
          break;
        }
      }
    }
  }

  return { summaryTriggered, reminderTriggered };
}

/**
 * Manually send full stock summary
 */
export async function sendManualDailyStockSummary(): Promise<{ success: boolean; error?: string }> {
  const settings = getTelegramSettingsSync();
  const inv = await getInventory();
  const timeNow = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const msg = formatDailyStockSummaryMessage(inv, timeNow);
  return await sendTelegramNotification(msg, settings);
}

/**
 * Manually send low stock alert
 */
export async function sendManualLowStockAlert(): Promise<{ success: boolean; error?: string }> {
  const settings = getTelegramSettingsSync();
  const inv = await getInventory();
  const lowItems = inv.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');
  if (lowItems.length === 0) {
    return { success: false, error: 'ขณะนี้ไม่มีรายการสต็อกที่ใกล้หมดหรือหมดสต็อก' };
  }
  const timeNow = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const msg = formatLowStockReminderMessage(lowItems, timeNow);
  return await sendTelegramNotification(msg, settings);
}

/**
 * Manually send test quotation alert
 */
export async function sendManualTestLeadAlert(): Promise<{ success: boolean; error?: string }> {
  const settings = getTelegramSettingsSync();
  const sampleLead: Lead = {
    id: 'test-lead-' + Date.now(),
    customer_name: 'คุณสมชาย เพชรบุรี (ตัวอย่างทดสอบ)',
    phone_number: '081-234-5678',
    line_id: 'somchai_test',
    interest_type: 'หน้าจั่วไม้สักทอง ลายแกะสลักพุ่มข้าวบิณฑ์',
    budget_range: '45,000 - 60,000 บาท',
    dimensions: 'ขนาด 3.50 x 2.20 ม. (จำนวน 1 คู่)',
    notes: 'ประเมินจากระบบคำนวณราคาออนไลน์: ไม้สักทองคัดเกรด A / ลายไทยประยุกต์',
    status: 'new',
    created_at: new Date().toISOString(),
  };
  const msg = formatLeadTelegramMessage(sampleLead);
  return await sendTelegramNotification(msg, settings);
}

