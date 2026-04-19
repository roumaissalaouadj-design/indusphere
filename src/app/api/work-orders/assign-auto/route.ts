import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import WorkOrder from '@/models/WorkOrder'
import User from '@/models/User'
import { notifyWorkOrderAssigned } from '@/lib/notificationService'
import mongoose from 'mongoose'

// تعريف نوع جسم الطلب
interface RequestBody {
  workOrderId: string
  specialization?: string
}

// POST: توزيع المهام تلقائياً
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body: RequestBody = await request.json()
    const { workOrderId, specialization } = body

    if (!workOrderId) {
      return NextResponse.json({ success: false, message: 'معرف أمر العمل مطلوب' }, { status: 400 })
    }

    // جلب أمر العمل
    const workOrder = await WorkOrder.findById(workOrderId)
    if (!workOrder) {
      return NextResponse.json({ success: false, message: 'أمر العمل غير موجود' }, { status: 404 })
    }

    // جلب الموظفين المناسبين حسب الاختصاص
    const query: {
      tenantId: mongoose.Types.ObjectId
      isActive: boolean
      specialization?: { $regex: string; $options: string }
    } = {
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
      isActive: true,
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' }
    }

    // جلب الموظفين مع ترتيب حسب التقييم وعدد المهام
    const availableUsers = await User.find(query)
      .select('name email position specialization phoneNumber rating tasksCompleted')
      .sort({ rating: -1, tasksCompleted: 1 })
      .limit(5)

    if (availableUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد موظفين متاحين بهذا الاختصاص'
      }, { status: 404 })
    }

    // اختيار أفضل موظف (أعلى تقييم + أقل مهام)
    const assignedUser = availableUsers[0]

    // تحديث أمر العمل
    workOrder.assignedTo = assignedUser._id
    workOrder.assignedBy = new mongoose.Types.ObjectId(session.user.id)
    workOrder.assignedAt = new Date()
    workOrder.status = 'assigned'
    await workOrder.save()

    // 🔔 إرسال إشعار للموظف المكلف
    await notifyWorkOrderAssigned(workOrder, assignedUser._id.toString())

    return NextResponse.json({
      success: true,
      data: {
        workOrder,
        assignedUser: {
          id: assignedUser._id,
          name: assignedUser.name,
          email: assignedUser.email,
          position: assignedUser.position,
          specialization: assignedUser.specialization,
          phoneNumber: assignedUser.phoneNumber,
          rating: assignedUser.rating
        }
      }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('POST /api/work-orders/assign-auto error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}