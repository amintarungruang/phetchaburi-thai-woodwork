'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MapPin,
  CalendarDays,
  Package,
  Bot,
  Rss,
  Calculator,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Shield,
  UserCheck,
  Crown,
  Download,
  Smartphone
} from 'lucide-react';
import { getLeads, getInventory } from '@/lib/store';
import { getAdminSession, logoutAdmin, AdminUser } from '@/lib/auth';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function FactoryGatewayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/factory-gateway/login';

  const [sessionUser, setSessionUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Switch PWA manifest to back-office manifest while inside /factory-gateway
  useEffect(() => {
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    const prevManifest = manifestLink.href;
    manifestLink.href = '/manifest-admin.json';

    let appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    const prevTitle = appleTitle?.content;
    if (appleTitle) {
      appleTitle.content = 'ระบบหลังบ้าน ฝาทรงไทย';
    }

    let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const prevAppleIcon = appleIcon?.href;
    if (appleIcon) {
      appleIcon.href = '/images/admin-apple-touch-icon.png';
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      if (manifestLink && prevManifest) manifestLink.href = prevManifest;
      if (appleTitle && prevTitle) appleTitle.content = prevTitle;
      if (appleIcon && prevAppleIcon) appleIcon.href = prevAppleIcon;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Authentication Guard Check
  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    const checkAuth = () => {
      const session = getAdminSession();
      if (!session.isAuthenticated || !session.user) {
        router.replace('/factory-gateway/login');
      } else {
        setSessionUser(session.user);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    window.addEventListener('woodwork_auth_changed', checkAuth);
    return () => window.removeEventListener('woodwork_auth_changed', checkAuth);
  }, [pathname, isLoginPage, router]);

  // Check badges for CRM & Inventory
  useEffect(() => {
    if (isLoginPage) return;

    const checkBadges = async () => {
      try {
        const [leads, inv] = await Promise.all([getLeads(), getInventory()]);
        const newLeads = leads.filter((l) => l.status === 'new');
        const lowStock = inv.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');
        setNewLeadCount(newLeads.length);
        setLowStockCount(lowStock.length);
      } catch (e) {
        console.warn(e);
      }
    };

    checkBadges();
    window.addEventListener('woodwork_store_updated', checkBadges);
    return () => window.removeEventListener('woodwork_store_updated', checkBadges);
  }, [isLoginPage]);

  // If on login page, render children directly without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If checking authentication, show a clean loading screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-wood-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gold-400 font-semibold tracking-wider uppercase">
          กำลังตรวจสอบสิทธิ์ความปลอดภัย...
        </span>
      </div>
    );
  }

  const { confirm } = useConfirmDialog();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'ยืนยันออกจากระบบ',
      message: 'คุณต้องการออกจากระบบการจัดการหลังบ้านใช่หรือไม่?',
      confirmText: 'ออกจากระบบ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      await logoutAdmin();
      router.replace('/factory-gateway/login');
    }
  };

  const navItems = [
    {
      name: 'ภาพรวมระบบ (Dashboard)',
      href: '/factory-gateway',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'จัดการลูกค้า (Leads CRM)',
      href: '/factory-gateway/leads',
      icon: Users,
      badge: newLeadCount > 0 ? `${newLeadCount}` : null,
      badgeColor: 'bg-red-600',
    },
    {
      name: 'จัดการผลงาน (Portfolio CMS)',
      href: '/factory-gateway/projects',
      icon: FolderKanban,
      badge: null,
    },
    {
      name: 'จัดการหมุดแผนที่ (Map CMS)',
      href: '/factory-gateway/map',
      icon: MapPin,
      badge: null,
    },
    {
      name: 'ข่าวสาร & โพสต์อัปเดต (Feed CMS)',
      href: '/factory-gateway/posts',
      icon: Rss,
      badge: null,
    },
    {
      name: 'ตารางคิวงาน (Production Schedule)',
      href: '/factory-gateway/schedule',
      icon: CalendarDays,
      badge: null,
    },
    {
      name: 'จัดการสต็อกไม้และวัสดุ (Inventory)',
      href: '/factory-gateway/inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-amber-600',
    },
    {
      name: 'จัดการคำนวณราคา (Price Estimator)',
      href: '/factory-gateway/estimator',
      icon: Calculator,
      badge: null,
    },
    {
      name: 'ตั้งค่าแชทบอท (Bot Settings)',
      href: '/factory-gateway/bot',
      icon: Bot,
      badge: null,
    },
  ];

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (e) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-wood-950">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-wood-950 border-b border-gold-500/20 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-wood-900 border border-gold-500/50 p-1 flex items-center justify-center">
            <Image src="/images/wood-logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-bold text-sm text-gold-400 font-serif">หลังบ้านโรงงานเมืองเพชร</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-cream-200 hover:text-gold-400"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 lg:w-72 bg-wood-950 text-cream-100 flex flex-col justify-between shrink-0 border-r border-gold-500/20 z-30`}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-wood-900 hidden md:block">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-wood-900 border border-gold-500/60 p-1 flex items-center justify-center shadow-md shrink-0">
                <Image src="/images/wood-logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-cream-50 font-serif leading-tight">
                  ระบบบริหารจัดการ
                </h2>
                <p className="text-[11px] text-gold-400">โรงงานฝาทรงไทยเมืองเพชร</p>
              </div>
            </Link>
          </div>

          {/* Admin User Profile Pill */}
          {sessionUser && (
            <div className="mx-4 mt-4 p-3 rounded-2xl bg-wood-900/90 border border-gold-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center shrink-0">
                  {sessionUser.role === 'owner' ? (
                    <Crown className="w-4 h-4 text-gold-400" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-gold-400" />
                  )}
                </div>
                <div className="truncate">
                  <div className="font-bold text-white text-[11px] truncate">{sessionUser.name}</div>
                  <div className="text-[10px] text-wood-400 truncate">{sessionUser.email}</div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shrink-0">
                {sessionUser.role_label_th || 'ผู้ดูแล'}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-wood-400">
              เมนูบริหารงาน
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gold-500 text-wood-950 font-bold shadow-sm'
                      : 'text-cream-200 hover:text-white hover:bg-wood-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-wood-950' : 'text-gold-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold text-white ${
                        item.badgeColor || 'bg-red-600'
                      } flex items-center justify-center shrink-0 whitespace-nowrap shadow-xs ml-2`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-wood-900 space-y-2">
          {/* Install Back-office Web App */}
          <button
            type="button"
            onClick={handleInstallApp}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gold-300 hover:text-white bg-gradient-to-r from-gold-950/70 to-wood-900/80 hover:from-gold-900/80 hover:to-wood-800 border border-gold-500/40 hover:border-gold-400 transition-all w-full shadow-sm"
          >
            <Download className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="truncate">ติดตั้งแอประบบหลังบ้าน</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-cream-300 hover:text-white bg-wood-900/60 hover:bg-wood-900 transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4 text-gold-400" />
            <span>กลับสู่หน้าเว็บไซต์หลัก</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>ออกจากระบบ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-wood-50/70 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Back-office PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-wood-950 border-2 border-gold-500/50 rounded-3xl p-6 text-cream-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-wood-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-serif">ติดตั้งแอประบบหลังบ้าน</h3>
                  <p className="text-[11px] text-gold-400">สร้างไอคอนทางลัดเปิดเข้าหน้านี้โดยตรง</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1.5 rounded-xl text-cream-300 hover:text-white hover:bg-wood-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-cream-200 leading-relaxed">
              <div className="p-3 rounded-2xl bg-wood-900/90 border border-gold-500/30 space-y-2">
                <div className="font-bold text-gold-300 flex items-center gap-1.5 text-xs">
                  <span>🤖</span> วิธีติดตั้งบนมือถือ Android (Chrome)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-cream-300 pl-1">
                  <li>แตะปุ่มเมนู <b className="text-white">จุดสามจุด (⋮)</b> มุมขวาบนของเบราว์เซอร์</li>
                  <li>เลือก <b className="text-gold-300">"ติดตั้งแอป (Install app)"</b> หรือ <b className="text-gold-300">"เพิ่มลงในหน้าจอหลัก"</b></li>
                  <li>กดยืนยัน จะได้ไอคอน <b className="text-white">"ระบบหลังบ้าน"</b> เปิดเข้าหน้านี้ทันที</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-wood-900/90 border border-gold-500/30 space-y-2">
                <div className="font-bold text-gold-300 flex items-center gap-1.5 text-xs">
                  <span>🍎</span> วิธีติดตั้งบน iPhone / iPad (Safari)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-cream-300 pl-1">
                  <li>แตะปุ่มแชร์ <b className="text-white">(สี่เหลี่ยมลูกศรชี้ขึ้น ⬆️)</b> ด้านล่างหน้าจอ</li>
                  <li>เลื่อนลงแล้วเลือก <b className="text-gold-300">"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"</b></li>
                  <li>กด <b className="text-white">"เพิ่ม (Add)"</b> จะได้แอป <b className="text-white">ระบบหลังบ้าน ฝาทรงไทย</b></li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-wood-950 font-bold text-xs shadow-md transition-colors"
            >
              เข้าใจแล้ว ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
