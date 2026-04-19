// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import User from '@/models/User'
import Role from '@/models/Role'
import ActivationCode from '@/models/ActivationCode' // تأكد من استيراد نموذج كود التفعيل

export async function POST(request: Request) {
  try {
    await connectDB()

    // --- 1. جلب البيانات بما فيها رمز التفعيل ---
    const { factoryName, location, email, password, name, activationCode } = await request.json()

    // --- 2. التحقق من صحة رمز التفعيل أولاً ---
    if (!activationCode) {
      return NextResponse.json(
        { success: false, message: 'رمز التفعيل مطلوب' },
        { status: 400 }
      )
    }

    const validCode = await ActivationCode.findOne({ 
      code: activationCode, 
      isUsed: false,
      expiresAt: { $gt: new Date() } // تحقق من عدم انتهاء الصلاحية
    })

    if (!validCode) {
      return NextResponse.json(
        { success: false, message: 'رمز التفعيل غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // --- 3. التحقق من البيانات الأخرى ---
    if (!factoryName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'هذا الإيميل مستخدم مسبقاً' },
        { status: 400 }
      )
    }

    // --- 4. إنشاء الحساب (لأن رمز التفعيل صحيح) ---
    const slug = factoryName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now()

    const tenant = await Tenant.create({
      name: factoryName,
      slug,
      location,
      status: 'active',
      plan: 'free',
    })

    const adminRole = await Role.create({
      tenantId: tenant._id,
      name: 'Factory Admin',
      permissions: ['*'],
      isDefault: true,
    })

    const passwordHash = await bcrypt.hash(password, 12)

    // ✅ الحساب يُنشأ كـ "نشط" فورًا لأن رمز التفعيل تم التحقق منه
    const user = await User.create({
      tenantId: tenant._id,
      name: name || factoryName,
      email,
      passwordHash,
      roleId: adminRole._id,
      isActive: true, // <- نشط مباشرة
    })

    // --- 5. تحديث رمز التفعيل بأنه تم استخدامه ---
    validCode.isUsed = true
    validCode.usedBy = user._id
    validCode.usedAt = new Date()
    await validCode.save()

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب المصنع وتفعيله بنجاح!',
      data: {
        tenantId: tenant._id,
        userId: user._id,
        email: user.email,
      }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}