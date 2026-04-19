import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Role from '@/models/Role'
import { DEFAULT_ROLES } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    let roles = await Role.find({ tenantId: session.user.tenantId })
    // إنشاء الأدوار الافتراضية إن لم تكن موجودة
    if (roles.length === 0) {
      roles = await Role.insertMany(
        DEFAULT_ROLES.map(r => ({ ...r, tenantId: session.user.tenantId }))
      )
    }
    return NextResponse.json({ success: true, data: roles })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    const body = await request.json()
    const role = await Role.create({ ...body, tenantId: session.user.tenantId })
    return NextResponse.json({ success: true, data: role })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}