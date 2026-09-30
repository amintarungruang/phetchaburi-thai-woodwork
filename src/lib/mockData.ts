import { Project, InstallationPin, ScheduleItem, InventoryItem, Lead, SystemLog, CategoryItem, BotConfig, ChatbotFAQ, FactoryPost } from '@/types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'cf50eace-0f11-4504-94bc-d402dae5f4d2',
    title: 'หน้าต่างไม้สัก',
    category: 'window_frame',
    category_name_th: 'วงกบและช่องแสง',
    description: 'ขนาด 60*110\nไม้สักเก่า',
    wood_type: 'ไม้สักเก่า',
    dimensions_info: '60*110',
    price_range: '2500',
    image_url: '/uploads/projects/proj-window-teak-cf50.jpg',
    gallery_urls: [
      '/uploads/projects/proj-window-teak-cf50.jpg'
    ],
    location_name: '-',
    installation_year: 2026,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-14T18:21:04.735+00:00'
  },
  {
    id: 'a58dd3dc-adcb-46b0-895b-b4ebbf5602c1',
    title: 'หน้าต่างอกราวฝาลูกฟัก',
    category: 'wall',
    category_name_th: 'ฝาเรือนไทย / ฝาลูกฟัก',
    description: 'ขนาด 60*110\nไม้สักเก่า',
    wood_type: 'ไม้สักเก่า',
    dimensions_info: '60*110',
    price_range: '2500',
    image_url: '/uploads/projects/proj-window-okraow-a58d.jpg',
    gallery_urls: [
      '/uploads/projects/proj-window-okraow-a58d.jpg'
    ],
    location_name: '-',
    installation_year: 2026,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-14T18:13:24.096+00:00'
  },
  {
    id: '3b79d541-df0e-4ab5-a3a9-47f4557e0edb',
    title: 'โต๊ะไม้สัก',
    category: 'custom',
    category_name_th: 'งานไม้สั่งทำตามแบบ',
    description: 'โต๊ะไม้สัก',
    wood_type: 'ไม้สักท่อนใหญ่คัดเกรด A',
    dimensions_info: '-',
    price_range: 'ตามตกลง',
    image_url: '/uploads/projects/proj-table-teak-3b79.jpg',
    gallery_urls: [
      '/uploads/projects/proj-table-teak-3b79.jpg'
    ],
    location_name: '-',
    installation_year: 2026,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-14T18:01:25.641+00:00'
  },
  {
    id: '12542de4-c462-41fc-890e-87bad1f2ac27',
    title: 'หน้าจั่วไม้สักเก่า',
    category: 'gable',
    category_name_th: 'โครงจั่วเพชรบุรี',
    description: 'ขนาด 3.50 * 1.50 เมตร',
    wood_type: 'ไม้สักเก่า',
    dimensions_info: '3.50 * 1.50 เมตร',
    price_range: '25,000',
    image_url: '/uploads/projects/proj-gable-teak-1254.jpg',
    gallery_urls: [
      '/uploads/projects/proj-gable-teak-1254.jpg'
    ],
    location_name: '-',
    installation_year: 2026,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-14T17:46:51.324+00:00'
  },
  {
    id: 'fe9984e4-89ec-4239-9c74-cb84940c8087',
    title: 'บัวประดับฝาไม้ตะเเบกเเกะสลัก',
    category: 'wall',
    category_name_th: 'ฝาเรือนไทย / ฝาลูกฟัก',
    description: 'สถาปัตยกรรมไม้สักทองแท้ แกะสลักลวดลายกนกเปลวเพลิงเอกลักษณ์ช่างเมืองเพชรบุรี เข้าเดือยไม้โบราณไม่ใช้ตะปู',
    wood_type: 'ไม้สักทองคัดพิเศษ อบแห้ง 12-14%',
    dimensions_info: 'กว้าง 3.50 ม. x สูง 2.20 ม.',
    price_range: '45,000 - 65,000 บาท',
    image_url: '/uploads/projects/proj-carved-tabaek-fe99.jpg',
    gallery_urls: [
      '/uploads/projects/proj-carved-tabaek-fe99.jpg'
    ],
    location_name: 'อ.เมือง จ.เพชรบุรี',
    installation_year: 2026,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-14T17:36:44.802+00:00'
  },
  {
    id: 'f9bff6a2-eee7-46da-be20-966f4d0fa8bf',
    title: 'ประตูไม้สักบานเลื่อน',
    category: 'door',
    category_name_th: 'ประตูและบานไม้จริง',
    description: 'ประตูไม้สักบานเลื่อน หนาพิเศษ 2 นิ้ว ลายแกะสลักลึกมีมิติ ให้ความรู้สึกโอ่อ่า ปราณีต สง่างาม เหมาะสำหรับคฤหาสน์ บ้านเรือนไทย หรือโบสถ์วิหาร',
    wood_type: 'ไม้สัก ลายแก่นไม้สวยงาม',
    dimensions_info: 'กว้าง 1.80 ม. x สูง 2.60 ม. (หนา 2 นิ้ว)',
    price_range: '15,000 - 25,000 บาท',
    image_url: '/uploads/projects/proj-1788463654433-mjrqaz.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463654433-mjrqaz.jpg'
    ],
    location_name: '-',
    installation_year: 2024,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-02T18:17:52.71633+00:00'
  },
  {
    id: 'f8d46791-38d2-49d6-9a89-94f8db0ff12f',
    title: 'ฝาปะกนไม้สัก',
    category: 'wall',
    category_name_th: 'ฝาเรือนไทย / ฝาลูกฟัก',
    description: 'งานฝาปะกนไม้สัก ประกอบเป็นแผงสำเร็จรูปพร้อมยกติดตั้ง ความหนาได้มาตรฐาน โครงสร้างแข็งแรง ลวดลายประณีตแบบเมืองเพชรแท้',
    wood_type: 'ไม้สัก',
    dimensions_info: 'งานสั่งทำตามขนาดตัวเรือนจริง',
    price_range: 'ตร.ม. ละ 4,500 - 6,800 บาท',
    image_url: '/uploads/projects/proj-1788463598602-is9mt5.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463598602-is9mt5.jpg',
      '/uploads/projects/proj-1788463598607-dm7gja.jpg'
    ],
    location_name: '-',
    installation_year: 2024,
    is_featured: false,
    crafting_technique: 'ฝาปะกนเมืองเพชร',
    created_at: '2026-09-02T18:17:52.71633+00:00'
  },
  {
    id: '1c1a9fb6-82d5-431f-8ab5-1329455b1596',
    title: 'โต๊ะเครื่องเเป้ง',
    category: 'custom',
    category_name_th: 'งานไม้สั่งทำตามแบบ',
    description: 'งานโต๊ะเครื่องเเป้งสั่งทำตามเเบบที่ลูกค้าต้องการ',
    wood_type: 'ไม้สัก',
    dimensions_info: '50 ซม. x 70 ซม.',
    price_range: 'ขึ้นอยู่กับชนิดไม้เเละขนาด',
    image_url: '/uploads/projects/proj-1788463204914-ynpab5.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463204914-ynpab5.jpg'
    ],
    location_name: 'ลูกค้าสั่งทำพร้อมติดตั้งที่บ้าน',
    installation_year: 2023,
    is_featured: false,
    crafting_technique: '-',
    created_at: '2026-09-02T18:17:52.71633+00:00'
  },
  {
    id: 'ca47268f-89f2-49e0-9734-ab4866bd2614',
    title: 'ศาลาทรงไทย',
    category: 'wall',
    category_name_th: 'ฝาเรือนไทย / ฝาลูกฟัก',
    description: 'ศาลาไม้สัก ฝาทรงไทยทั้งหลัง',
    wood_type: 'ไม้สักท่อนใหญ่คัดเกรด A',
    dimensions_info: 'ขนาด 4.00 x 4.00 เมตร ยกพื้นสูง',
    price_range: '100,000 - 200,000 บาท',
    image_url: '/uploads/projects/proj-1788463637082-73v2re.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463637082-73v2re.jpg'
    ],
    location_name: '-',
    installation_year: 2023,
    is_featured: false,
    crafting_technique: 'งานโครงสร้าง',
    created_at: '2026-09-02T18:17:52.71633+00:00'
  },
  {
    id: 'bff3cfdf-861d-4e70-b94f-f2d85017b2de',
    title: 'หน้าจั่วทรงไทยเมืองเพชร',
    category: 'gable',
    category_name_th: 'โครงจั่วเพชรบุรี',
    description: 'หน้าจั่วไม้สัก เข้าเดือยไม้โบราณไม่ใช้ตะปู ทนแดดทนฝน ผ่านการอบไล่ความชื้นมาตรฐาน',
    wood_type: 'ไม้สัก',
    dimensions_info: 'กว้าง 3.50 ม. x สูง 2.20 ม.',
    price_range: '45,000 - 65,000 บาท',
    image_url: '/uploads/projects/proj-1788463571424-1np4u3.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463571424-1np4u3.jpg'
    ],
    location_name: 'วัดมหาธาตุวรวิหาร จ.เพชรบุรี',
    installation_year: 2024,
    is_featured: false,
    crafting_technique: 'การเข้าเดือยไม้ลิ้นร่องโบราณ',
    created_at: '2026-09-02T18:17:52.71633+00:00'
  }
];

export const INITIAL_PINS: InstallationPin[] = [
  {
    id: 'pin-1',
    title: 'หน้าจั่วและฝาปะกน วัดมหาธาตุวรวิหาร',
    category: 'temple',
    category_name_th: 'วัดและโบราณสถาน',
    province: 'เพชรบุรี',
    location_name: 'อ.เมือง จ.เพชรบุรี',
    lat: 13.1118,
    lng: 99.9486,
    image_url: '/uploads/projects/proj-1788463571424-1np4u3.jpg',
    gallery_urls: [
      '/uploads/projects/proj-1788463571424-1np4u3.jpg',
    ],
    description: 'งานบูรณะหน้าจั่วไม้สักแกะสลักลายกนกเปลวเพลิงและฝาปะกนกุฏิสงฆ์',
    wood_details: 'ไม้สักทองแท้คัดพิเศษ อบแห้ง 100%',
    completed_year: 2024,
  },
  {
    id: 'pin-2',
    title: 'ชุดประตูและวงกบไม้สัก คฤหาสน์สวนหลวง ร.9',
    category: 'residence',
    category_name_th: 'บ้านพักและคฤหาสน์',
    province: 'กรุงเทพมหานคร',
    location_name: 'เขตประเวศ กรุงเทพฯ',
    lat: 13.6886,
    lng: 100.6653,
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'ประตูบานคู่แกะสลักลายทวารบาล สูง 2.6 เมตร พร้อมวงกบไม้สักหนา 2 นิ้ว',
    wood_details: 'ไม้สักทองลายแก่นเกรดพรีเมียม',
    completed_year: 2024,
  },
  {
    id: 'pin-3',
    title: 'ศาลาท่าน้ำและวงกบช่องแสง รีสอร์ตเรือนไม้ริมน้ำ',
    category: 'resort',
    category_name_th: 'รีสอร์ตและโรงแรม',
    province: 'สมุทรสงคราม',
    location_name: 'อัมพวา จ.สมุทรสงคราม',
    lat: 13.4258,
    lng: 99.9554,
    image_url: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'ชุดศาลาท่าน้ำและวงกบช่องแสงสไตล์ไทยประยุกต์ ริมคลองอัมพวา',
    wood_details: 'ไม้สักทองอบแห้ง เคลือบน้ำมันกันเชื้อรา',
    completed_year: 2023,
  },
  {
    id: 'pin-4',
    title: 'ฝาปะกนและงานไม้สัก บ้านทรงไทยประยุกต์ ชะอำ',
    category: 'residence',
    category_name_th: 'บ้านพักและคฤหาสน์',
    province: 'เพชรบุรี',
    location_name: 'ชะอำ จ.เพชรบุรี',
    lat: 12.7984,
    lng: 99.9678,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'ฝาปะกนไม้สักเรือนไทยหมู่ พร้อมชานระเบียงไม้สักทอง',
    wood_details: 'ไม้สักทองสวนป่าและไม้สักเรือนเก่าอบแห้ง',
    completed_year: 2024,
  },
  {
    id: 'pin-5',
    title: 'ศาลาจตุรมุข วัดใหญ่สุวรรณาราม',
    category: 'temple',
    category_name_th: 'วัดและโบราณสถาน',
    province: 'เพชรบุรี',
    location_name: 'อ.เมือง จ.เพชรบุรี',
    lat: 13.1147,
    lng: 99.9525,
    image_url: 'https://images.unsplash.com/photo-1548625361-1959779df3f5?auto=format&fit=crop&w=800&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1548625361-1959779df3f5?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'ศาลาการเปรียญจตุรมุขไม้สักทอง แกะสลักลายโบราณตามแบบประเพณีเมืองเพชร',
    wood_details: 'ไม้สักทองท่อนใหญ่คัดเกรดพิเศษ',
    completed_year: 2023,
  },
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    project_title: 'งานผลิตหน้าจั่วทรงไทย วัดเขาบันไดอิฐ',
    customer_name: 'วัดเขาบันไดอิฐ',
    start_date: '2026-09-01',
    end_date: '2026-09-15',
    status: 'busy',
    status_label_th: 'กำลังขึ้นรูป & แกะสลัก',
    is_public: true,
    notes: 'ไม้สักทองคัดพิเศษ อบแห้งเรียบร้อย',
  },
  {
    id: 'sch-2',
    project_title: 'งานผลิตชุดประตูแกะสลักบานคู่ คฤหาสน์หัวหิน',
    customer_name: 'คุณวิชัย',
    start_date: '2026-09-10',
    end_date: '2026-09-25',
    status: 'busy',
    status_label_th: 'กำลังแกะสลักลวดลาย',
    is_public: true,
    notes: 'ลายพุ่มข้าวบิณฑ์ หนา 2 นิ้ว',
  },
  {
    id: 'sch-3',
    project_title: 'ช่วงคิวว่าง พร้อมรับสั่งทำชิ้นงานใหม่',
    customer_name: 'เปิดรับออเดอร์',
    start_date: '2026-09-28',
    end_date: '2026-10-12',
    status: 'available',
    status_label_th: 'คิวว่าง (พร้อมรับงานสั่งทำทันที)',
    is_public: true,
    notes: 'มีรอบจัดส่งและทีมช่างพร้อมติดตั้ง',
  },
  {
    id: 'sch-4',
    project_title: 'ติดตั้งฝาปะกนเรือนไทย จ.อยุธยา',
    customer_name: 'คุณกิตติศักดิ์',
    start_date: '2026-10-15',
    end_date: '2026-10-30',
    status: 'installing',
    status_label_th: 'เตรียมขนส่งและติดตั้งหน้างาน',
    is_public: true,
    notes: 'ทีมช่าง 6 คน พร้อมอุปกรณ์ยกติดตั้ง',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    item_name: 'ไม้สักทองแปรรูป หนา 2 นิ้ว x กว้าง 8 นิ้ว x ยาว 3.0 ม.',
    category: 'timber',
    category_name_th: 'ไม้สักแปรรูป',
    specification: 'ไม้สักทองคัดเกรด A ความชื้น 12-14% ไร้กระพี้ เหมาะสำหรับทำหน้าจั่วและบานประตู',
    quantity: 45,
    unit: 'แผ่น',
    min_threshold: 15,
    status: 'in_stock',
    last_restocked: '2026-08-20',
  },
  {
    id: 'inv-2',
    item_name: 'ไม้สักทองเสาเรือนไทย (เส้นผ่านศูนย์กลาง 8-10 นิ้ว ยาว 4.5 ม.)',
    category: 'timber',
    category_name_th: 'ไม้สักแปรรูป',
    specification: 'เสาไม้สักกลมแก่นล้วน ทรงตรง สำหรับศาลาและเสาเรือนไทย',
    quantity: 8,
    unit: 'ท่อน',
    min_threshold: 10,
    status: 'low_stock',
    last_restocked: '2026-07-15',
  },
  {
    id: 'inv-3',
    item_name: 'ชุดฟิตติ้งบานพับและกลอนทองเหลืองแท้ลายไทยโบราณ',
    category: 'hardware',
    category_name_th: 'อุปกรณ์ฟิตติ้ง',
    specification: 'ทองเหลืองหล่อตัน ขัดเงา ทนสนิม สำหรับประตูและหน้าต่างเรือนไทย',
    quantity: 60,
    unit: 'ชุด',
    min_threshold: 20,
    status: 'in_stock',
    last_restocked: '2026-08-10',
  },
  {
    id: 'inv-4',
    item_name: 'น้ำมันรักษาเนื้อไม้และเคลือบเงา Teak Oil สูตรโบราณ',
    category: 'finish',
    category_name_th: 'สีและน้ำมันเคลือบ',
    specification: 'ซึมลึกเข้าสู่แก่นไม้ ป้องกันรังสี UV และน้ำซึม ไม่ขึ้นฟิล์มหนา คงลายไม้ธรรมชาติ',
    quantity: 4,
    unit: 'ถัง (5 แกลลอน)',
    min_threshold: 6,
    status: 'low_stock',
    last_restocked: '2026-06-30',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    customer_name: 'คุณธนพล เจริญสุข',
    phone_number: '089-123-4567',
    interest_type: 'หน้าจั่วทรงไทยเมืองเพชร',
    budget_range: '50,000 - 65,000 บาท',
    dimensions: 'กว้าง 3.50 x สูง 2.20 เมตร',
    notes: 'ต้องการติดตั้งที่บ้านพักตากอากาศ ชะอำ จ.เพชรบุรี',
    status: 'new',
    created_at: '2026-09-02T14:30:00.000Z',
  },
  {
    id: 'lead-2',
    customer_name: 'พระครูสุวรรณพัฒนคุณ',
    phone_number: '081-987-6543',
    interest_type: 'ประตูไม้สักแกะสลักบานคู่',
    budget_range: '75,000 - 100,000 บาท',
    dimensions: 'กว้าง 2.00 x สูง 2.80 เมตร',
    notes: 'สำหรับศาลาการเปรียญหลังใหม่',
    status: 'contacted',
    created_at: '2026-09-01T09:15:00.000Z',
  },
  {
    id: 'lead-3',
    customer_name: 'คุณพิมพรรณ สุขสมบูรณ์',
    phone_number: '086-555-7890',
    interest_type: 'ฝาปะกนเรือนไทยสำเร็จรูป',
    budget_range: '120,000 - 180,000 บาท',
    dimensions: 'พื้นที่ฝารวมประมาณ 35 ตร.ม.',
    notes: 'ส่งใบเสนอราคาเบื้องต้นเรียบร้อย รอนัดดูหน้างาน',
    status: 'quoted',
    created_at: '2026-08-28T16:45:00.000Z',
  },
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    action: 'เพิ่มผลงานใหม่',
    details: 'เพิ่มผลงาน "หน้าจั่วทรงไทยเมืองเพชร ลายกนกเปลวเพลิงแกะสลัก" ลงในแคตตาล็อก',
    target_id: 'proj-1',
    created_at: '2026-09-02T15:00:00.000Z',
  },
  {
    id: 'log-2',
    action: 'อัปเดตสต็อก',
    details: 'ตรวจนับไม้สักทองแปรรูป 45 แผ่น สถานะพร้อมใช้งาน',
    target_id: 'inv-1',
    created_at: '2026-09-02T12:00:00.000Z',
  },
  {
    id: 'log-3',
    action: 'บันทึกคิวงาน',
    details: 'เปิดรับคิวงานใหม่ประจำเดือนตุลาคม 2569 บนหน้าเว็บไซต์',
    target_id: 'sch-3',
    created_at: '2026-09-01T10:00:00.000Z',
  },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  // Project categories
  { id: 'wall', name_th: 'ฝาเรือนไทย / ฝาลูกฟัก', type: 'project', description: 'ฝาปะกน ลูกฟัก ลายรัดเอว ประกอบสำเร็จยกแผง', order_index: 1 },
  { id: 'gable', name_th: 'โครงจั่วเพชรบุรี', type: 'project', description: 'โครงจั่วเพชรบุรี จั่วทรงปั้นหยา เข้าเดือยไม้โบราณ', order_index: 2 },
  { id: 'door', name_th: 'ประตูและบานไม้จริง', type: 'project', description: 'ประตูบานคู่ หน้าต่าง บานเฟี้ยม ลูกฟักประณีต', order_index: 3 },
  { id: 'window_frame', name_th: 'วงกบและช่องแสง', type: 'project', description: 'วงกบไม้จริง ช่องแสงลูกฟักโบราณ', order_index: 4 },
  { id: 'custom', name_th: 'งานไม้สั่งทำตามแบบ', type: 'project', description: 'โต๊ะ ระเบียง ราวบันได ศาลา สั่งทำตามแบบ', order_index: 5 },

  // Map categories
  { id: 'temple', name_th: 'วัดและโบราณสถาน', type: 'map', description: 'งานพระอารามหลวง อุโบสถ ศาลาการเปรียญ', order_index: 1 },
  { id: 'residence', name_th: 'บ้านพักและคฤหาสน์', type: 'map', description: 'คฤหาสน์หรูและบ้านทรงไทยประยุกต์', order_index: 2 },
  { id: 'resort', name_th: 'รีสอร์ตและโรงแรม', type: 'map', description: 'รีสอร์ตเรือนไม้ริมน้ำ โรงแรมสไตล์ไทย', order_index: 3 },
  { id: 'heritage', name_th: 'งานอนุรักษ์สถาปัตยกรรม', type: 'map', description: 'งานบูรณะโบราณสถานและเรือนไทยเก่า', order_index: 4 },

  // Inventory categories
  { id: 'timber', name_th: 'ไม้แปรรูป', type: 'inventory', description: 'ไม้สัก ไม้สะเดา ไม้ตะแบก อบแห้งมาตรฐาน', order_index: 1 },
  { id: 'hardware', name_th: 'อุปกรณ์ฟิตติ้ง', type: 'inventory', description: 'ทองเหลืองหล่อตัน กลอน บานพับโบราณ', order_index: 2 },
  { id: 'finish', name_th: 'สีและน้ำมันเคลือบ', type: 'inventory', description: 'น้ำมัน Teak Oil สีย้อมไม้คุณภาพสูง', order_index: 3 },
  { id: 'tool', name_th: 'เครื่องมือและอุปกรณ์ช่าง', type: 'inventory', description: 'สิ่ว กบไสไม้ เครื่องมืองานช่างเพชร', order_index: 4 },
];

export const INITIAL_BOT_CONFIG: BotConfig = {
  bot_name: 'น้องไทยบอท',
  status_text: 'ผู้ช่วยออนไลน์ โรงงานฝาทรงไทยเมืองเพชร',
  welcome_message: `สวัสดีครับ 👋\nผมน้องไทยบอท ผู้ช่วยของโรงงานฝาทรงไทยเมืองเพชร\nยินดีให้บริการครับ 😊`,
  fallback_message: `ขอบคุณสำหรับคำถามครับ ทางโรงงานรับสั่งทำฝาเรือนไทย โครงจั่ว ประตู และงานไม้ทุกชนิดตามแบบและขนาดของคุณ (มีทั้งไม้สัก ไม้สะเดา ไม้ตะแบก หรือนำไม้มาเอง) สามารถฝากชื่อและเบอร์โทรไว้ เพื่อให้ช่างติดต่อกลับประเมินราคาได้เลยครับ 😊`,
  avatar_url: '/images/Robot_Mascot.png',
  is_lead_capture_enabled: true,
  initial_choices: [
    { id: 'c1', label: 'ดูสินค้า', action: 'portfolio_link' },
    { id: 'c2', label: 'สอบถามราคา', action: 'price_info' },
    { id: 'c3', label: 'มีไม้มาเอง', action: 'own_wood' },
    { id: 'c4', label: 'ใช้ไม้โรงงาน', action: 'factory_wood' },
    { id: 'c5', label: 'ติดต่อโรงงาน', action: 'request_call' },
    { id: 'c6', label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
  ]
};

export const INITIAL_BOT_FAQS: ChatbotFAQ[] = [
  {
    id: 'faq-1',
    title: 'มีไม้มาเอง (คิดเฉพาะค่าแรงช่าง)',
    category: 'wood_quality',
    question_pattern: [
      'มีไม้มาเอง', 'ไม้ตัวเอง', 'เอาไม้มาเอง', 'ค่าแรง', 'คิดแต่ค่าแรง',
      'มีไม้แล้ว', 'จ้างแต่ค่าแรง', 'รับแปรรูป', 'คิดค่าแรงยังไง'
    ],
    answer: '🪵 ยินดีรับงานครับ! ทางโรงงานรับแปรรูป ขึ้นรูปหน้าจั่ว ประตู วงกบ และแกะสลักลวดลายจากไม้ที่คุณลูกค้านำมาเอง โดยคิดเฉพาะค่าแรงช่างฝีมือเมืองเพชรบุรีและค่าประกอบเข้าเดือยโบราณครับ\n\nสามารถส่งขนาดและรูปถ่ายไม้มาประเมินค่าแรงได้เลยครับ',
    related_options: [
      { label: 'ติดต่อประเมินค่าแรง', action: 'request_call' },
      { label: 'ดูผลงานที่เคยทำ', action: 'portfolio_link' },
    ],
    is_active: true,
  },
  {
    id: 'faq-2',
    title: 'ใช้ไม้ของโรงงาน (มีไม้สัก ไม้สะเดา ไม้ตะแบก)',
    category: 'wood_quality',
    question_pattern: [
      'ใช้ไม้โรงงาน', 'ไม้ของโรงงาน', 'ซื้อไม้ด้วย', 'ชนิดไม้', 'มีไม้อะไรบ้าง',
      'ไม้แท้ไหม', 'คุณภาพไม้', 'ไม้สัก', 'ไม้สะเดา', 'ไม้ตะแบก', 'ไม้เกรดไหน'
    ],
    answer: '✨ ทางโรงงานมีไม้ให้เลือกตามงบประมาณครับ ทั้ง ไม้สัก (อบแห้งคัดเกรด), ไม้สะเดา (เนื้อเหนียว ปลวกไม่กิน ราคาประหยัด) และ ไม้ตะแบก/ไม้เนื้อแข็ง ทุกชนิดผ่านการอบแห้งได้มาตรฐาน พร้อมให้บริการครบวงจรทั้งงานประกอบและติดตั้งหน้างานจริงครับ',
    related_options: [
      { label: 'สอบถามราคา', action: 'price_info' },
      { label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
      { label: 'ติดต่อโรงงาน', action: 'request_call' }
    ],
    is_active: true,
  },
  {
    id: 'faq-3',
    title: 'การป้องกันปลวก มอด และความคงทน',
    category: 'quality',
    question_pattern: [
      'ปลวก', 'มอด', 'แมลง', 'ปลวกกินไหม', 'ผุ', 'ทนแดด', 'ทนฝน',
      'บวม', 'ความชื้น', 'กันน้ำ', 'ทนทานไหม'
    ],
    answer: '🛡️ ไม้ของโรงงานผ่านการอบไล่ความชื้นตามเกณฑ์มาตรฐาน ทำให้ไม้ไม่บิด ไม่งอตัว สำหรับไม้สักและไม้สะเดามีคุณสมบัติตามธรรมชาติต้านทานมอดปลวกได้ดีเยี่ยม แข็งแรงทนแดดทนฝน ใช้งานได้ยาวนานนับสิบๆ ปีครับ',
    related_options: [
      { label: 'สอบถามราคา', action: 'price_info' },
      { label: 'ติดต่อโรงงาน', action: 'request_call' }
    ],
    is_active: true,
  },
  {
    id: 'faq-4',
    title: 'ราคาและการประเมินราคาชิ้นงาน',
    category: 'pricing',
    question_pattern: [
      'ราคา', 'เท่าไหร่', 'กี่บาท', 'แพงไหม', 'คิดราคา', 'ราคาเท่าไหร่',
      'ตีราคา', 'ประเมินราคา', 'ขอราคา', 'ค่าทำ'
    ],
    answer: '💰 ราคาขึ้นอยู่กับขนาด ชนิดไม้สัก และระดับลายแกะสลักครับ:\n• หน้าจั่วทรงไทย: เริ่มต้น 35,000 - 65,000 บาท\n• ประตูไม้สักแกะสลักบานคู่: เริ่มต้น 45,000 - 85,000 บาท\n• วงกบและช่องแสง: เริ่มต้น 18,000 - 38,000 บาท\n• ฝาปะกนเรือนไทย: ตร.ม. ละ 4,500 - 6,800 บาท\n\nสามารถกดคำนวณราคาเบื้องต้นบนหน้าเว็บ หรือส่งแบบให้ช่างประเมินได้ฟรีครับ',
    related_options: [
      { label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
      { label: 'ติดต่อขอใบเสนอราคา', action: 'request_call' },
      { label: 'ดูผลงานทั้งหมด', action: 'portfolio_link' }
    ],
    is_active: true,
  },
  {
    id: 'faq-5',
    title: 'ระยะเวลาผลิต คิวงาน และการจัดส่ง',
    category: 'schedule',
    question_pattern: [
      'คิว', 'กี่วัน', 'เสร็จเมื่อไหร่', 'ระยะเวลา', 'ส่งของ', 'ส่งต่างจังหวัด',
      'ค่าส่ง', 'ขนส่ง', 'ติดตั้ง', 'ส่งถึงที่ไหม'
    ],
    answer: '🚚 ระยะเวลาผลิตโดยประมาณ:\n• หน้าจั่ว / ประตูแกะสลัก: 10 - 18 วัน\n• ฝาปะกนทั้งหลัง / ศาลา: 30 - 45 วัน\n\nโรงงานมีรอบจัดส่งและทีมช่างผู้ชำนาญการติดตั้งหน้างานจริงทั่วประเทศครับ',
    related_options: [
      { label: 'เช็กคิวงานโรงงาน', action: 'schedule_link' },
      { label: 'ติดต่อโรงงาน', action: 'request_call' }
    ],
    is_active: true,
  },
  {
    id: 'faq-6',
    title: 'ที่ตั้งโรงงาน แผนที่ และการเดินทาง',
    category: 'location',
    question_pattern: [
      'โรงงานอยู่ที่ไหน', 'โรงงานอยู่ไหน', 'อยู่ที่ไหน', 'อยู่แถวไหน', 'พิกัด',
      'ที่อยู่', 'แผนที่', 'เพชรบุรี', 'หน้าร้าน', 'เดินทาง', 'ไปโรงงาน',
      'ตั้งอยู่ที่ไหน', 'ร้านอยู่ไหน', 'ชมสินค้าจริง', 'สถานที่'
    ],
    answer: '📍 โรงงานฝาทรงไทยเมืองเพชร ตั้งอยู่ที่ อ.เมือง จ.เพชรบุรี (ใกล้ถนนเพชรเกษม เดินทางสะดวก)\n\nสามารถเดินทางมาชมชิ้นงานจริง ไม้ตัวอย่าง หรือพูดคุยแบบงานกับช่างเอสได้ทุกวันจันทร์ - เสาร์ เวลา 08:00 - 17:00 น. ครับ',
    related_options: [
      { label: 'เปิด Google Maps', action: 'maps_link' },
      { label: 'โทรหาช่างเอส', action: 'request_call' }
    ],
    is_active: true,
  },
  {
    id: 'faq-7',
    title: 'ขั้นตอนการสั่งทำและวางมัดจำ',
    category: 'ordering',
    question_pattern: [
      'สั่งทำ', 'ขั้นตอน', 'มัดจำ', 'สั่งยังไง', 'เริ่มงานยังไง',
      'จ่ายเงิน', 'ชำระเงิน', 'โอนเงิน', 'แบ่งจ่าย'
    ],
    answer: '📋 ขั้นตอนการสั่งผลิต:\n1. แจ้งแบบและขนาดที่ต้องการ (หรือส่งรูปที่สนใจมาให้ช่าง)\n2. ช่างสรุปแบบและยืนยันราคาอย่างชัดเจน\n3. วางมัดจำ 40% เพื่อเริ่มคัดไม้ อบแห้ง และขึ้นรูปชิ้นงาน\n4. รายงานภาพความคืบหน้าระหว่างผลิตให้ลูกค้าชมอย่างต่อเนื่อง\n5. ขนส่งและติดตั้งหน้างานจริง พร้อมตรวจรับงานเรียบร้อยครับ',
    related_options: [
      { label: 'ติดต่อสั่งทำ', action: 'request_call' },
      { label: 'ดูตัวอย่างผลงาน', action: 'portfolio_link' }
    ],
    is_active: true,
  },
  {
    id: 'faq-8',
    title: 'ช่องทางการติดต่อและเบอร์โทรศัพท์',
    category: 'contact',
    question_pattern: [
      'ติดต่อ', 'เบอร์', 'เบอร์โทร', 'โทร', 'line', 'ไลน์', 'facebook',
      'เฟสบุ๊ค', 'เพจ', 'เบอร์ช่าง', 'ติดต่อช่าง', 'เวลาเปิด'
    ],
    answer: '📞 ช่องทางติดต่อโรงงานฝาทรงไทยเมืองเพชร:\n• โทร: 084-042-6571 (ช่างเอส เจ้าของโรงงาน)\n• LINE ID: 8238sdy\n• Facebook: เสี่ยธนท์ ฝาทรงไทย\n• เวลาทำการ: จันทร์ - เสาร์ 08:00 - 17:00 น.\n• ที่ตั้ง: อ.เมือง จ.เพชรบุรี',
    related_options: [
      { label: 'โทรหาช่างเอส', action: 'request_call' },
      { label: 'เปิด Google Maps', action: 'maps_link' }
    ],
    is_active: true,
  },
  {
    id: 'faq-9',
    title: 'งานสั่งทำตามแบบและขนาดพิเศษ',
    category: 'ordering',
    question_pattern: [
      'ตามแบบ', 'มีแบบ', 'แบบตัวเอง', 'สั่งทำพิเศษ', 'ขนาดพิเศษ',
      'แก้แบบ', 'ออกแบบให้ไหม', 'สั่งทำตามแบบ'
    ],
    answer: '📐 รับสั่งทำตามแบบและขนาดของลูกค้า 100% ครับ! ไม่ว่าจะเป็นงานประยุกต์ งานแกะสลักลวดลายเฉพาะ หรือขนาดพิเศษตามหน้างาน สามารถส่งรูปวาดหรือแบบแปลนมาให้ช่างตีราคาได้ทันทีครับ',
    related_options: [
      { label: 'ส่งแบบให้ช่างประเมิน', action: 'request_call' },
      { label: 'ดูแคตตาล็อกผลงาน', action: 'portfolio_link' }
    ],
    is_active: true,
  },
  {
    id: 'faq-10',
    title: 'การทำสี เคลือบเงา และสีย้อมไม้',
    category: 'quality',
    question_pattern: [
      'ทาสี', 'ทำสี', 'เคลือบ', 'สีไม้', 'ลงสี', 'ขัดเงา', 'สีสัก', 'งานดิบ'
    ],
    answer: '🎨 ทางโรงงานมีทั้งงานไม้ดิบ (สำหรับลูกค้านำไปทำสีเอง) และงานทำสีสำเร็จรูป โดยใช้น้ำมันเคลือบและสีย้อมไม้เกรดพรีเมียม (Teak Oil / โพลียูรีเทนภายนอก) ป้องกันแดด ความชื้น และขับลายไม้สักทองให้เงางามเด่นชัดครับ',
    related_options: [
      { label: 'ปรึกษาเรื่องสี', action: 'request_call' },
      { label: 'ดูตัวอย่างผลงาน', action: 'portfolio_link' }
    ],
    is_active: true,
  }
];

export const INITIAL_POSTS: FactoryPost[] = [];



