
create extension if not exists "uuid-ossp";


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


create table if not exists chatbot_faqs (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  question_pattern text[] not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


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


create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_th text not null,
  description text,
  icon text default 'Layers',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


create table if not exists system_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  details text not null,
  target_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists estimator_config (
  id text primary key default 'default_config',
  work_types jsonb not null,
  wood_grades jsonb not null,
  carving_levels jsonb not null,
  min_price_multiplier numeric(4,2) default 0.95,
  max_price_multiplier numeric(4,2) default 1.15,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

