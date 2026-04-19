import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ActivationCode from '@/models/ActivationCode'
import Tenant from '@/models/Tenant'
import User from '@/models/User'
import Role from '@/models/Role'
import bcrypt from 'bcryptjs'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50) + '-' + Date.now()
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, password, code, factoryName } = await request.json()

    // تحقق من الكود
    const activation = await ActivationCode.findOne({ code, isUsed: false })
    if (!activation) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or already used activation code'
      }, { status: 400 })
    }

    // تحقق من تاريخ الانتهاء
    if (new Date() > activation.expiresAt) {
      return NextResponse.json({
        success: false,
        message: 'Activation code has expired'
      }, { status: 400 })
    }

    // تحقق من البريد الإلكتروني
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      }, { status: 400 })
    }

    const tName = factoryName || activation.factoryName || 'مصنع جديد'

    // إنشاء Tenant
    const tenant = await Tenant.create({
      name: tName,
      slug: generateSlug(tName),
      isActive: true,
    })

    // إنشاء Role Admin للمصنع الجديد
    const adminRole = await Role.create({
      tenantId: tenant._id,
      name: 'Factory Admin',
      permissions: ['*'],
      isDefault: true,
    })

    // إنشاء المستخدم
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: name || tName,       // ← إضافة name
      email,
      passwordHash: hashedPassword,
      tenantId: tenant._id,
      roleId: adminRole._id,     // ← إضافة roleId
      isActive: true,
    })

    // تحديث كود التفعيل
    activation.isUsed = true
    activation.usedBy = user._id
    activation.usedAt = new Date()
    await activation.save()

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}