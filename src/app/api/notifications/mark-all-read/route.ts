import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'

// PUT: تحديد جميع الإشعارات كمقروءة
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    // تحديث جميع الإشعارات غير المقروءة للمستخدم
    const result = await Notification.updateMany(
      {
        tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
        userId: new mongoose.Types.ObjectId(session.user.id),
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${result.modifiedCount} إشعار كمقروء`,
      updatedCount: result.modifiedCount
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('PUT /api/notifications/mark-all-read error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}