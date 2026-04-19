import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'

// PUT/PATCH: تحديث إشعار (تحديد كمقروء)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()

    // التحقق من صحة الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرّف غير صالح' }, { status: 400 })
    }

    // البحث عن الإشعار والتأكد من ملكيته للمستخدم
    const notification = await Notification.findOne({
      _id: id,
      tenantId: session.user.tenantId,
      userId: session.user.id
    })

    if (!notification) {
      return NextResponse.json({ success: false, message: 'الإشعار غير موجود' }, { status: 404 })
    }

    // تحديث حالة القراءة
    if (body.isRead !== undefined) {
      notification.isRead = body.isRead
      if (body.isRead === true && !notification.readAt) {
        notification.readAt = new Date()
      }
    }

    await notification.save()

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('PATCH /api/notifications/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// DELETE: حذف إشعار
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    // التحقق من صحة الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرّف غير صالح' }, { status: 400 })
    }

    // حذف الإشعار
    const result = await Notification.deleteOne({
      _id: id,
      tenantId: session.user.tenantId,
      userId: session.user.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'الإشعار غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('DELETE /api/notifications/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}