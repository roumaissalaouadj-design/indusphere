import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import { notifyMaintenanceRequestCreated } from '@/lib/notificationService'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    const requests = await MaintenanceRequest.find({ tenantId: session.user.tenantId })
      .populate('assetId', 'name assetCode')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: requests })
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
    
    if (!body.assetId || !body.title) {
      return NextResponse.json({ success: false, message: 'جميع الحقول المطلوبة غير موجودة' }, { status: 400 })
    }
    
    const req = await MaintenanceRequest.create({
      ...body,
      tenantId: session.user.tenantId,
      requestedBy: session.user.id,
    })

    // 🔔 إرسال إشعار عند إنشاء طلب صيانة
    await notifyMaintenanceRequestCreated(req, session.user.id)

    return NextResponse.json({ success: true, data: req })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}