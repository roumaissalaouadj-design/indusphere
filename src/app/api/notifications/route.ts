import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'

// GET: جلب الإشعارات للمستخدم الحالي
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const query: Record<string, unknown> = {
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    }

    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const unreadCount = await Notification.countDocuments({
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      isRead: false,
    })

    const total = await Notification.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      total,
      limit,
      skip,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST: إنشاء إشعار جديد أو تحديد الكل كمقروء
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // تحديد الكل كمقروء
    if (body.action === 'markAllRead') {
      await Notification.updateMany(
        {
          tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
          userId: new mongoose.Types.ObjectId(session.user.id),
          isRead: false,
        },
        { isRead: true, readAt: new Date() }
      )
      return NextResponse.json({ success: true })
    }

    // تحديد إشعار واحد كمقروء
    if (body.action === 'markRead' && body.id) {
      await Notification.findOneAndUpdate(
        {
          _id: body.id,
          tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
        },
        { isRead: true, readAt: new Date() }
      )
      return NextResponse.json({ success: true })
    }

    // إنشاء إشعار جديد
    if (!body.userId || !body.title || !body.message || !body.category) {
      return NextResponse.json({
        success: false,
        message: 'جميع الحقول المطلوبة: userId, title, message, category',
      }, { status: 400 })
    }

    const notification = await Notification.create({
      ...body,
      tenantId: session.user.tenantId,
      isRead: false,
    })

    return NextResponse.json({ success: true, data: notification })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('POST /api/notifications error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}