'use client';

import { supabase, isSupabaseConfigured } from './supabase';

const AUTH_STORAGE_KEY = 'woodwork_admin_session';
const ADMIN_ACCOUNTS_KEY = 'woodwork_admin_accounts_list';
const FAILED_ATTEMPTS_KEY = 'woodwork_login_failed_attempts';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'owner' | 'manager';
  role_label_th: string;
  avatar_url?: string;
  lastLogin?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token?: string;
}

// 2 Production Accounts with High-Security Passwords
export const INITIAL_ACCOUNTS = [
  {
    id: 'acc-superadmin',
    username: 'admin',
    email: 'superadmin@woodwork.com',
    password: 'PhetAdmin@2026#ThaiTeak',
    name: 'ผู้ดูแลระบบ (Super Admin)',
    role: 'superadmin' as const,
    role_label_th: 'ผู้ดูแลระบบสูงสุด',
  },
  {
    id: 'acc-owner',
    username: 'owner',
    email: 'owner@woodwork.com',
    password: 'WoodWork@Phet789#Master',
    name: 'คุณเอส (เจ้าของโรงงาน)',
    role: 'owner' as const,
    role_label_th: 'ผู้บริหาร / เจ้าของโรงงาน',
  },
];

export function getAdminAccounts() {
  if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const accounts = JSON.parse(raw);
    let hasUpdate = false;
    for (const acc of accounts) {
      if (acc.id === 'acc-owner' && (acc.name.includes('สมศักดิ์') || !acc.name.includes('เอส'))) {
        acc.name = 'คุณเอส (เจ้าของโรงงาน)';
        hasUpdate = true;
      }
    }
    if (hasUpdate) {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    return accounts;
  } catch (err) {
    return INITIAL_ACCOUNTS;
  }
}

export function getAdminSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, user: null };

    const parsed = JSON.parse(raw);
    if (parsed && parsed.isAuthenticated && parsed.user) {
      // Auto-update owner name if previously cached as สมศักดิ์
      if (parsed.user.name && parsed.user.name.includes('สมศักดิ์')) {
        parsed.user.name = parsed.user.name.replace('สมศักดิ์', 'เอส');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading admin session', err);
  }

  return { isAuthenticated: false, user: null };
}

export async function loginAdmin(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const normalizedInput = emailOrUsername.trim().toLowerCase();

  // 1. Check Rate Limiting (Brute Force Protection)
  const failedData = getFailedAttempts();
  if (failedData.count >= 5 && Date.now() - failedData.lastAttempt < 5 * 60 * 1000) {
    const remainingMin = Math.ceil((5 * 60 * 1000 - (Date.now() - failedData.lastAttempt)) / 60000);
    return {
      success: false,
      error: `ระงับการเข้าสู่ระบบชั่วคราวเนื่องจากใส่รหัสผิดเกิน 5 ครั้ง กรุณารออีก ${remainingMin} นาที`,
    };
  }

  // 2. If Supabase Auth is configured, check Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedInput.includes('@') ? normalizedInput : `${normalizedInput}@woodwork.com`,
        password: password,
      });

      if (!error && data?.user) {
        clearFailedAttempts();
        const adminUser: AdminUser = {
          id: data.user.id,
          username: normalizedInput,
          email: data.user.email || normalizedInput,
          name: data.user.user_metadata?.name || 'ผู้ดูแลระบบ',
          role: (data.user.user_metadata?.role as any) || 'superadmin',
          role_label_th: 'ผู้ดูแลระบบ',
          lastLogin: new Date().toISOString(),
        };

        saveSession(adminUser, data.session?.access_token);
        return { success: true, user: adminUser };
      }
    } catch (err) {
      console.warn('Supabase Auth error, fallback to local authentication', err);
    }
  }

  // 3. Local Production Accounts Verification
  const accounts = getAdminAccounts();
  const matched = accounts.find(
    (acc: any) =>
      acc.username.toLowerCase() === normalizedInput ||
      acc.email.toLowerCase() === normalizedInput
  );

  if (matched && matched.password === password) {
    clearFailedAttempts();

    const adminUser: AdminUser = {
      id: matched.id,
      username: matched.username,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      role_label_th: matched.role_label_th,
      lastLogin: new Date().toISOString(),
    };

    saveSession(adminUser, `auth-token-${Date.now()}`);
    return { success: true, user: adminUser };
  }

  // Record failed attempt
  recordFailedAttempt();

  return {
    success: false,
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบใหม่อีกครั้ง',
  };
}

function saveSession(user: AdminUser, token?: string) {
  if (typeof window === 'undefined') return;

  const session: AuthSession = {
    isAuthenticated: true,
    user,
    token,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  // Set cookie for browser session protection
  document.cookie = `woodwork_admin_auth=true; path=/; max-age=604800; SameSite=Lax`;

  window.dispatchEvent(new Event('woodwork_auth_changed'));
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error', e);
    }
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = 'woodwork_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  window.dispatchEvent(new Event('woodwork_auth_changed'));
}

export function updateAccountPassword(userId: string, newPass: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const accounts = getAdminAccounts();
    const updated = accounts.map((acc: any) =>
      acc.id === userId ? { ...acc, password: newPass } : acc
    );
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// Rate Limiting Helpers
function getFailedAttempts(): { count: number; lastAttempt: number } {
  if (typeof window === 'undefined') return { count: 0, lastAttempt: 0 };
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastAttempt: 0 };
  } catch {
    return { count: 0, lastAttempt: 0 };
  }
}

function recordFailedAttempt() {
  if (typeof window === 'undefined') return;
  const current = getFailedAttempts();
  localStorage.setItem(
    FAILED_ATTEMPTS_KEY,
    JSON.stringify({
      count: current.count + 1,
      lastAttempt: Date.now(),
    })
  );
}

function clearFailedAttempts() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
}
