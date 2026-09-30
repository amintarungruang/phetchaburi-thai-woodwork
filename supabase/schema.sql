-- ============================================================
-- SQL Schema for โรงงานฝาทรงไทยเมืองเพชร (Supabase PostgreSQL)
-- ============================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. LEADS Table (ข้อมูลลูกค้าที่ติดต่อเข้ามา)
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  phone_number text not null,
  line_id text,
  interest_type text not null,
  budget_range text,
  dimensions text,
  notes text,
  reference_image_url text,
  status text not null default 'new', -- 'new', 'contacted', 'quoted', 'in_production', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. PROJECTS Table (แคตตาล็อกผลงาน พร้อมหลายรูปภาพและพิกัดแผนที่)
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null, -- 'gable', 'door', 'window_frame', 'pavilion', 'wall'
  category_name_th text not null,
  description text,
  wood_type text not null,
  dimensions_info text,
  price_range text,
  image_url text not null, -- รูปหน้าปกหลัก (Cover Image)
  gallery_urls text[] default '{}', -- รูปภาพทั้งหมดในอัลบั้มผลงาน
  location_name text,
  lat numeric(10, 6), -- พิกัด Latitude
  lng numeric(10, 6), -- พิกัด Longitude
  installation_year integer default extract(year from now()),
  is_featured boolean default false,
  crafting_technique text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration if table already existed without lat/lng:
alter table projects add column if not exists lat numeric(10, 6);
alter table projects add column if not exists lng numeric(10, 6);

-- 4. INSTALLATIONS Table (พิกัดผลงานจริงบนแผนที่)
create table if not exists installations (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null, -- 'temple', 'residence', 'resort', 'heritage'
  category_name_th text not null,
  province text not null,
  location_name text not null,
  lat numeric(10, 6) not null,
  lng numeric(10, 6) not null,
  image_url text not null,
  description text,
  wood_details text,
  completed_year integer default extract(year from now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SCHEDULES Table (ปฏิทินคิวงานโรงงาน)
create table if not exists schedules (
  id uuid primary key default uuid_generate_v4(),
  project_title text not null,
  customer_name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'busy', -- 'busy', 'available', 'installing', 'curing'
  status_label_th text not null,
  is_public boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. INVENTORY Table (สต็อกไม้สักและอุปกรณ์)
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null,
  category text not null, -- 'timber', 'hardware', 'finish', 'tool'
  category_name_th text not null,
  specification text,
  quantity integer not null default 0,
  unit text not null,
  min_threshold integer not null default 5,
  status text not null default 'in_stock', -- 'in_stock', 'low_stock', 'out_of_stock'
  last_restocked date default current_date,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. CHATBOT_FAQS Table (คำถาม-คำตอบแชทบอท)
create table if not exists chatbot_faqs (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  question_pattern text[] not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. POSTS Table (ข่าวสาร & โพสต์ผลงานโรงงาน)
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  caption text not null,
  post_type text not null default 'photo', -- 'photo', 'video', 'facebook', 'announcement'
  media_urls text[] default '{}',
  video_url text,
  facebook_post_url text,
  visibility text not null default 'public', -- 'public', 'private', 'scheduled', 'draft'
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_name text default 'ช่างเอส (เจ้าของโรงงาน)',
  tags text[] default '{}',
  likes_count integer default 0,
  pin_to_top boolean default false
);

-- 9. CATEGORIES Table (หมวดหมู่สินค้า)
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_th text not null,
  description text,
  icon text default 'Layers',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SYSTEM_LOGS Table (บันทึกกิจกรรมในระบบหลังบ้าน)
create table if not exists system_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  details text not null,
  target_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table leads enable row level security;
alter table projects enable row level security;
alter table installations enable row level security;
alter table schedules enable row level security;
alter table inventory enable row level security;
alter table chatbot_faqs enable row level security;
alter table posts enable row level security;
alter table categories enable row level security;
alter table system_logs enable row level security;

-- Policies for public operations
create policy "Allow public read for projects" on projects for select using (true);
create policy "Allow public insert/update/delete for projects" on projects for all using (true);

create policy "Allow public read for installations" on installations for select using (true);
create policy "Allow public insert/update/delete for installations" on installations for all using (true);

create policy "Allow public read for schedules" on schedules for select using (true);
create policy "Allow public insert/update/delete for schedules" on schedules for all using (true);

create policy "Allow public read for inventory" on inventory for select using (true);
create policy "Allow public insert/update/delete for inventory" on inventory for all using (true);

create policy "Allow public read for chatbot_faqs" on chatbot_faqs for select using (true);
create policy "Allow public insert/update/delete for chatbot_faqs" on chatbot_faqs for all using (true);

create policy "Allow public read for posts" on posts for select using (true);
create policy "Allow public insert/update/delete for posts" on posts for all using (true);

create policy "Allow public read for categories" on categories for select using (true);
create policy "Allow public insert/update/delete for categories" on categories for all using (true);

create policy "Allow public select for leads" on leads for select using (true);
create policy "Allow public insert for leads" on leads for insert with check (true);
create policy "Allow public update/delete for leads" on leads for all using (true);

create policy "Allow public read for system_logs" on system_logs for select using (true);
create policy "Allow public insert for system_logs" on system_logs for insert with check (true);

-- ============================================================
-- INITIAL SEED DATA (ข้อมูลเริ่มต้นสำหรับเริ่มใช้งานได้ทันที)
-- ============================================================

-- Seed Projects with lat/lng
insert into projects (title, category, category_name_th, description, wood_type, dimensions_info, price_range, image_url, gallery_urls, location_name, lat, lng, installation_year, is_featured, crafting_technique)
values 
(
  'หน้าจั่วทรงไทยเมืองเพชร ลายกนกเปลวเพลิงแกะสลัก',
  'gable',
  'หน้าจั่วทรงไทย',
  'หน้าจั่วไม้สักทองแท้ แกะสลักลวดลายกนกเปลวเพลิงเอกลักษณ์ช่างเมืองเพชรบุรี เข้าเดือยไม้โบราณไม่ใช้ตะปู ทนแดดทนฝน ผ่านการอบไล่ความชื้นมาตรฐาน',
  'ไม้สักทองคัดเกรดพิเศษ อบแห้ง 12-14%',
  'กว้าง 3.50 ม. x สูง 2.20 ม.',
  '45,000 - 65,000 บาท',
  '/uploads/projects/proj-gable-teak-1254.jpg',
  array[
    '/uploads/projects/proj-gable-teak-1254.jpg',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  ],
  'วัดมหาธาตุวรวิหาร จ.เพชรบุรี',
  13.1118,
  99.9486,
  2024,
  true,
  'การเข้าเดือยไม้ลิ้นร่องโบราณ'
),
(
  'ประตูไม้สักทองบานคู่ แกะสลักลายทวารบาลและพุ่มข้าวบิณฑ์',
  'door',
  'ประตูไม้สักแกะสลัก',
  'ประตูไม้สักบานคู่ หนาพิเศษ 2 นิ้ว ลายแกะสลักลึกมีมิติ ให้ความรู้สึกโอ่อ่า ปราณีต สง่างาม เหมาะสำหรับคฤหาสน์ บ้านเรือนไทย หรือโบสถ์วิหาร',
  'ไม้สักทองแท้ ลายแก่นไม้สวยงาม',
  'กว้าง 1.80 ม. x สูง 2.60 ม. (หนา 2 นิ้ว)',
  '58,000 - 85,000 บาท',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80'
  ],
  'คฤหาสน์สวนหลวง ร.9 กรุงเทพมหานคร',
  13.6886,
  100.6653,
  2024,
  true,
  'แกะสลักมือโดยช่างชั้นครูเพชรบุรี'
),
(
  'ชุดวงกบไม้สักและช่องแสงลูกฟักกระจกโบราณ',
  'window_frame',
  'วงกบและช่องแสง',
  'ชุดวงกบไม้สักทองพร้อมช่องแสงประดับลูกฟักลายโบราณ เข้ามุม 45 องศา แนบสนิท กันน้ำซึม 100% พร้อมติดตั้งลงหน้างานจริง',
  'ไม้สักทองคัดพิเศษ ไร้กระพี้',
  'กว้าง 2.40 ม. x สูง 1.50 ม.',
  '28,000 - 42,000 บาท',
  'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80',
  array['https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80'],
  'รีสอร์ตเรือนไม้ริมน้ำ อัมพวา จ.สมุทรสงคราม',
  13.4258,
  99.9554,
  2023,
  false,
  'เข้าลิ้นลูกฟักยืดหยุ่นตามสภาพอากาศ'
),
(
  'ฝาปะกนไม้สักเรือนไทยหมู่ และคานรับฝาทรงโบราณ',
  'wall',
  'ฝาปะกนเรือนไทย',
  'งานฝาปะกนไม้สักแท้ทั้งหลัง ประกอบเป็นแผงสำเร็จรูปพร้อมยกติดตั้ง ความหนาได้มาตรฐาน โครงสร้างแข็งแรง ลวดลายประณีตแบบเมืองเพชรแท้',
  'ไม้สักทองเรือนเก่าและไม้สักทองสวนป่าอบแห้ง',
  'งานสั่งทำตามขนาดตัวเรือนจริง',
  'ตร.ม. ละ 4,500 - 6,800 บาท',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
  'บ้านทรงไทยประยุกต์ ชะอำ จ.เพชรบุรี',
  12.7984,
  99.9678,
  2024,
  true,
  'ระบบโมดูลาร์ฝาปะกนเมืองเพชร'
),
(
  'ศาลาทรงไทยจตุรมุขไม้สักทองและช่อฟ้าใบระกา',
  'pavilion',
  'ศาลาและเรือนไทย',
  'ศาลาไม้สักทองหลังใหญ่ จตุรมุข 4 ทิศ แกะสลักคันทวย ช่อฟ้า ใบระกา และหางหงส์ อย่างวิจิตรงดงาม เสาไม้สักกลมใหญ่แข็งแกร่งทนทานนับร้อยปี',
  'ไม้สักทองท่อนใหญ่คัดเกรด A',
  'ขนาด 4.00 x 4.00 เมตร ยกพื้นสูง',
  '380,000 - 550,000 บาท',
  'https://images.unsplash.com/photo-1548625361-1959779df3f5?auto=format&fit=crop&w=1200&q=80',
  array['https://images.unsplash.com/photo-1548625361-1959779df3f5?auto=format&fit=crop&w=1200&q=80'],
  'วัดใหญ่สุวรรณาราม จ.เพชรบุรี',
  13.1147,
  99.9525,
  2023,
  true,
  'งานโครงสร้างสถาปัตยกรรมไทยประเพณีชั้นสูง'
);

-- ============================================================
-- 10. ESTIMATOR_CONFIG Table (การตั้งค่าระบบคำนวณราคาหน้าเว็บ)
-- ============================================================
create table if not exists estimator_config (
  id text primary key default 'default_config',
  work_types jsonb not null,
  wood_grades jsonb not null,
  carving_levels jsonb not null,
  min_price_multiplier numeric(4,2) default 0.95,
  max_price_multiplier numeric(4,2) default 1.15,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies for estimator_config
alter table estimator_config enable row level security;
create policy "Public read estimator_config" on estimator_config for select using (true);
create policy "Allow all on estimator_config" on estimator_config for all using (true);
