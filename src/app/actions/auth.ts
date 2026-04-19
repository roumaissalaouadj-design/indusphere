// src/app/actions/auth.ts
'use server';

import { signOut } from '@/auth';

export async function logout() {
  await signOut({ redirectTo: '/' });  // ✅ يذهب إلى الصفحة الرئيسية (الترحيب)
}