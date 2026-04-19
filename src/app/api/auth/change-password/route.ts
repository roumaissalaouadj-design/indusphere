// src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    await connectDB();

    // جلب المستخدم من قاعدة البيانات
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التحقق من كلمة المرور الحالية
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    }

    // تشفير كلمة المرور الجديدة
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // تحديث كلمة المرور فقط (بدون التحقق من name)
    await User.updateOne(
      { _id: session.user.id },
      { $set: { passwordHash: newPasswordHash } }
    );

    return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تغيير كلمة المرور' }, { status: 500 });
  }
}