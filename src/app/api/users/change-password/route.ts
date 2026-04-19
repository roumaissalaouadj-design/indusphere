import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'كلمة المرور الحالية والجديدة مطلوبتان' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' 
      }, { status: 400 })
    }

    // جلب المستخدم
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    // التحقق من كلمة المرور الحالية
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'كلمة المرور الحالية غير صحيحة' 
      }, { status: 400 })
    }

    // تحديث كلمة المرور
    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    user.passwordHash = newPasswordHash
    await user.save()

    console.log(`✅ تم تغيير كلمة المرور للمستخدم: ${user.email}`)

    return NextResponse.json({ 
      success: true, 
      message: 'تم تغيير كلمة المرور بنجاح' 
    })
  } catch (error) {
    console.error('Error changing password:', error)
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}