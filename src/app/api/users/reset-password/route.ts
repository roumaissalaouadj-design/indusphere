import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, newPassword } = await request.json()
    
    if (!email || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      }, { status: 400 })
    }
    
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      }, { status: 404 })
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12)
    user.passwordHash = passwordHash
    await user.save()
    
    console.log(`✅ تم إعادة تعيين كلمة المرور للمستخدم: ${email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      email: user.email
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}