export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'in_production' | 'completed';

export interface Lead {
  id: string;
  customer_name: string;
  phone_number: string;
  line_id?: string;
  interest_type: string;
  budget_range?: string;
  dimensions?: string;
  notes?: string;
  reference_image_url?: string;
  status: LeadStatus;
  created_at: string;
  updated_at?: string;
}

export type ProjectCategory = string;

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  category_name_th: string;
  description: string;
  wood_type: string;
  dimensions_info: string;
  price_range: string;
  image_url: string; // รูปหน้าปก (Cover Image)
  gallery_urls: string[]; // รูปภาพทั้งหมดในอัลบั้มผลงาน (จัดเรียงแล้ว)
  location_name: string;
  lat?: number;
  lng?: number;
  installation_year: number;
  is_featured: boolean;
  crafting_technique?: string;
  created_at: string;
}

export interface InstallationPin {
  id: string;
  title: string;
  category: string;
  category_name_th: string;
  province: string;
  location_name: string;
  lat: number;
  lng: number;
  image_url: string; // รูปหน้าปกหลัก
  gallery_urls?: string[]; // รูปภาพหลายรูปหน้างานจริง
  description: string;
  wood_details: string;
  completed_year: number;
}

export interface ScheduleItem {
  id: string;
  project_title: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: 'busy' | 'available' | 'installing' | 'curing';
  status_label_th: string;
  is_public: boolean;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  category_name_th: string;
  specification: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_restocked: string;
}

export interface CategoryItem {
  id: string;
  name_th: string;
  type: 'project' | 'map' | 'inventory';
  description?: string;
  order_index?: number;
}

export interface SystemLog {
  id: string;
  action: string;
  details: string;
  target_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; action: string; value?: string }[];
  isLeadForm?: boolean;
  imageUrl?: string;
  timestamp: string;
}

export interface ChatbotFAQ {
  id: string;
  title?: string;
  category?: string;
  question_pattern: string[];
  answer: string;
  related_options?: { label: string; action: string; value?: string }[];
  is_active?: boolean;
}

export interface BotQuickChoice {
  id: string;
  label: string;
  action: string;
  value?: string;
}

export interface BotConfig {
  bot_name: string;
  status_text: string;
  welcome_message: string;
  fallback_message: string;
  avatar_url?: string;
  initial_choices: BotQuickChoice[];
  is_lead_capture_enabled: boolean;
}

export type PostVisibility = 'public' | 'private' | 'scheduled' | 'draft';
export type PostType = 'photo' | 'video' | 'facebook' | 'announcement';

export interface FactoryPost {
  id: string;
  title: string;
  caption: string; // รองรับ Rich Text Formatting
  post_type: PostType;
  media_urls: string[]; // รูปภาพ หรือ วิดีโอ
  video_url?: string; // YouTube, Facebook Video, หรือ MP4 URL
  facebook_post_url?: string; // ลิงก์โพสต์ Facebook เฉพาะโพสต์ที่เลือก
  facebook_embed_html?: string;
  visibility: PostVisibility;
  scheduled_at?: string; // วันเวลาที่ตั้งล่วงหน้า
  published_at: string; // วันเวลาที่เผยแพร่
  created_at: string;
  updated_at?: string;
  author_name?: string;
  tags?: string[];
  likes_count?: number;
  pin_to_top?: boolean;
}

// ==========================================
// Price Estimator Configuration Types
// ==========================================
export interface WorkTypeConfig {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  defaultW: number;
  defaultH: number;
  wLabel: string;
  hLabel: string;
  desc: string;
}

export interface WoodGradeConfig {
  id: string;
  name: string;
  multiplier: number;
  desc: string;
}

export interface CarvingLevelConfig {
  id: string;
  name: string;
  multiplier: number;
  desc: string;
}

export interface EstimatorConfig {
  id?: string;
  workTypes: WorkTypeConfig[];
  woodGrades: WoodGradeConfig[];
  carvingLevels: CarvingLevelConfig[];
  minPriceMultiplier: number; // e.g. 0.95
  maxPriceMultiplier: number; // e.g. 1.15
  updated_at?: string;
}

// ==========================================
// Telegram Notification Configuration Types
// ==========================================
export interface TelegramSettings {
  bot_token: string;
  chat_id: string;
  is_enabled: boolean;
  notify_on_lead: boolean;
  notify_on_low_stock: boolean;
  notify_on_schedule: boolean;
  daily_summary_enabled: boolean;
  daily_summary_time: string; // e.g. "08:00"
  low_stock_reminder_enabled: boolean;
  reminder_times: string[]; // e.g. ["09:00", "13:00", "17:00"]
  last_summary_sent?: string; // YYYY-MM-DD
  last_reminder_sent?: string; // YYYY-MM-DD-HH:mm
}
