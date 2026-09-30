'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { loginAdmin, getAdminSession } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect to /factory-gateway
  useEffect(() => {
    const session = getAdminSession();
    if (session.isAuthenticated) {
      router.replace('/factory-gateway');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrUser.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAdmin(emailOrUser, password);

      if (res.success) {
        setSuccessMessage(`ยินดีต้อนรับ ${res.user?.name} กำลังเข้าสู่ระบบ...`);
        setTimeout(() => {
          router.replace('/factory-gateway');
        }, 500);
      } else {
        setErrorMessage(res.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-modern-grid flex flex-col justify-center items-center p-4 sm:p-6 text-wood-950 font-sans relative">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wood-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Back to Home Link */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-wood-700 hover:text-wood-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gold-600" />
            <span>กลับหน้าหลักเว็บไซต์</span>
          </Link>

          <span className="text-[11px] text-wood-500 flex items-center gap-1 font-mono">
            <Shield className="w-3.5 h-3.5 text-gold-600" />
            <span>Secure Admin Portal</span>
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-wood-200 shadow-2xl p-6 sm:p-8 space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-2.5">
            <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-wood-950 to-wood-900 border-2 border-gold-500 p-2 flex items-center justify-center shadow-lg shadow-wood-950/20">
              <Image
                src="/images/wood-logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-wood-950 font-serif">
                เข้าสู่ระบบหลังบ้าน
              </h1>
              <p className="text-xs text-wood-600 mt-0.5">
                โรงงานฝาทรงไทยเมืองเพชร • ระบบบริหารจัดการ
              </p>
            </div>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-wood-900 font-bold mb-1.5">
                ชื่อผู้ใช้งาน หรือ อีเมล (Username / Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin หรือ owner"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-wood-300 text-xs text-wood-950 bg-wood-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-2xs"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-wood-900 font-bold">รหัสผ่าน (Password)</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-wood-300 text-xs text-wood-950 bg-wood-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-2xs font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-wood-400 hover:text-wood-700 absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                />
                <span className="text-wood-700 text-xs">จดจำการเข้าสู่ระบบ 7 วัน</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl btn-gold text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบหลังบ้าน'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="pt-4 border-t border-wood-100 flex items-center justify-center gap-2 text-[11px] text-wood-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ระบบความปลอดภัย 256-bit SSL & Brute-Force Shield</span>
          </div>
        </div>
      </div>
    </div>
  );
}
