import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Role from '@/models/Role'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { sendWelcomeEmail } from '@/lib/notificationService'

// دالة لتوليد كلمة مرور عشوائية
function generateRandomPassword(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }
    await connectDB()
    
    const users = await User.find({ tenantId: session.user.tenantId })
      .populate('roleId', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      
    return NextResponse.json({ success: true, data: users })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/users error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }
    await connectDB()
    
    const { email, password, roleId, name, position, specialization, phoneNumber } = await request.json()
    
    // التحقق من صحة الإيميل
    if (!email) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'البريد الإلكتروني غير صحيح. مثال: user@example.com' 
      }, { status: 400 })
    }
    
    // التحقق من عدم وجود الإيميل مسبقاً
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }
    
    // إذا لم يتم إرسال كلمة مرور، ننشئ كلمة مرور عشوائية
    let finalPassword = password
    let isRandomPassword = false
    
    if (!finalPassword || finalPassword === '') {
      finalPassword = generateRandomPassword()
      isRandomPassword = true
    }
    
    const passwordHash = await bcrypt.hash(finalPassword, 12)
    
    // التحقق من صحة roleId إذا تم إرساله
    let validRoleId = null
    let roleName = ''
    if (roleId && mongoose.Types.ObjectId.isValid(roleId)) {
      const roleExists = await Role.findById(roleId)
      if (roleExists) {
        validRoleId = roleId
        roleName = roleExists.name
      }
    }
    
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      roleId: validRoleId,
      tenantId: session.user.tenantId,
      name: name || email.split('@')[0],
      position: position || 'موظف',
      specialization: specialization || '',
      phoneNumber: phoneNumber || '',
      rating: 0,
      tasksCompleted: 0,
      isActive: true,
    })
    
    // إرسال إيميل ترحيب للمستخدم الجديد
    if (user.email) {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
        password: finalPassword,
        role: roleName || 'مستخدم',
        isRandomPassword: isRandomPassword
      })
    }
    
    // إزالة passwordHash من الاستجابة
    const userResponse = user.toObject()
    delete userResponse.passwordHash
    
    // إضافة كلمة المرور في الاستجابة للمشرف إذا كانت عشوائية
    const responseData = {
      ...userResponse,
      generatedPassword: isRandomPassword ? finalPassword : undefined
    }
    
    return NextResponse.json({ 
      success: true, 
      data: responseData,
      message: isRandomPassword 
        ? `✅ تم إنشاء المستخدم وإرسال كلمة المرور إلى ${user.email}`
        : `✅ تم إنشاء المستخدم بنجاح`
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('POST /api/users error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}