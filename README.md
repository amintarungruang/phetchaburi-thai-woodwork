# Phet Woodwork Factory (โรงงานไม้เพชรบุรี)

![Phet Woodwork Factory](public/images/wood-logo.png)

**Live Demo (ทดสอบเยี่ยมชม):** [https://phet-woodwork-factory.vercel.app/](https://phet-woodwork-factory.vercel.app/)

A comprehensive web application designed for a woodwork factory in Phetchaburi, Thailand. This project serves as a storefront for customers and a robust management portal for factory operations.

## ✨ Features (จุดเด่นของระบบ)

### Customer Facing (สำหรับลูกค้า)
- **Interactive Wood Estimator:** ลูกค้าสามารถประเมินราคาเบื้องต้นได้ด้วยตนเอง
- **Smart Chatbot:** ระบบแชทบอทตอบคำถามอัตโนมัติ (AI-like FAQ Matching)
- **Portfolio Gallery:** แกลลอรี่แสดงผลงานบ้านทรงไทยและงานแกะสลักไม้
- **Interactive Map:** แผนที่นำทางมายังโรงงานพร้อมข้อมูลการติดต่อ
- **Public Schedule:** ปฏิทินแสดงคิวงานที่กำลังดำเนินการอยู่

### Admin / Factory Gateway (ระบบจัดการหลังบ้าน)
- **Dashboard & Analytics:** สรุปข้อมูลยอดขายและสถิติภาพรวม
- **Lead & CRM Management:** จัดการข้อมูลลูกค้าและการติดต่อ
- **Inventory System:** ระบบจัดการสต็อกไม้และวัสดุ
- **Schedule Management:** ระบบจัดการคิวงานและการผลิต
- **Post & Portfolio Management:** จัดการโพสต์และผลงานผ่านหน้าเว็บ
- **Telegram Notifications:** แจ้งเตือนผ่าน Telegram เมื่อมีลูกค้าใหม่หรือสต็อกใกล้หมด

## 🛠 Tech Stack (เทคโนโลยีที่ใช้)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand (with Local Storage persistence)
- **Deployment:** Vercel

## 🚀 Getting Started (การติดตั้งและใช้งาน)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/phet-woodwork-factory.git
   cd phet-woodwork-factory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Rename `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

5. **Admin Portal:**
   Access the admin dashboard at [http://localhost:3000/factory-gateway](http://localhost:3000/factory-gateway).

## 🔒 Security & Data Privacy

This project is a portfolio showcase. All sensitive API keys and tokens have been removed from the repository. To fully test features like Telegram notifications or Supabase real-time sync, please provide your own keys in the `.env.local` and `.telegram-settings.json` files.

## 👨‍💻 Author

Created and maintained to showcase full-stack development skills using modern web technologies.
