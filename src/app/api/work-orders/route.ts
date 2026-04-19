import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import WorkOrder from '@/models/WorkOrder'
import { notifyWorkOrderCreated, notifyWorkOrderAssigned } from '@/lib/notificationService'
import User from '@/models/User'
import Employee from '@/models/Employee'
import mongoose from 'mongoose'

// GET: جلب جميع أوامر العمل
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const workOrders = await WorkOrder.find({ tenantId: session.user.tenantId })
      .populate('assetId', 'name assetCode')
      .populate('assignedTo', 'fullName email phone')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: workOrders })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/work-orders error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST: إنشاء أمر عمل جديد
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { autoAssign, specialization, assignedTo } = body

    // تحضير بيانات أمر العمل
    const workOrderData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      assetId: body.assetId,
      type: body.type,
      priority: body.priority,
      tenantId: session.user.tenantId,
      status: 'open'
    }

    // إزالة assignedTo إذا كانت سلسلة فارغة
    if (body.assignedTo === '' || body.assignedTo === null || body.assignedTo === undefined) {
      delete workOrderData.assignedTo
    }
    // إذا كان هناك assignedTo، أضفه إلى البيانات
if (body.assignedTo && body.assignedTo !== '') {
  workOrderData.assignedTo = body.assignedTo
}

    // إنشاء أمر العمل
    const workOrder = await WorkOrder.create(workOrderData)

    console.log('📝 تم إنشاء أمر عمل:', workOrder._id)

    // 🔔 إشعار للمنشئ
    await notifyWorkOrderCreated(workOrder, session.user.id)

    // التوزيع التلقائي إذا كان مطلوباً
    if (autoAssign && specialization) {
      // جلب الموظف المناسب حسب المنصب
      const availableEmployee = await Employee.findOne({
        tenantId: session.user.tenantId,
        position: { $regex: specialization, $options: 'i' },
        status: 'active'
      }).sort({ salary: -1 })

      if (availableEmployee) {
        workOrder.assignedTo = availableEmployee._id
        workOrder.assignedBy = session.user.id
        workOrder.assignedAt = new Date()
        workOrder.status = 'assigned'
        await workOrder.save()

        // 🔔 إشعار للموظف المكلف
        await notifyWorkOrderAssigned(workOrder, availableEmployee._id.toString())
        console.log('👤 تم التكليف التلقائي لـ:', availableEmployee.fullName, `(المنصب: ${specialization})`)
      } else {
        console.log('⚠️ لا يوجد موظفين بهذا المنصب:', specialization)
      }
    } else if (assignedTo && assignedTo !== '') {
      // توزيع يدوي
      const employee = await Employee.findById(assignedTo)
      
      workOrder.assignedTo = assignedTo
      workOrder.assignedBy = session.user.id
      workOrder.assignedAt = new Date()
      workOrder.status = 'assigned'
      await workOrder.save()

      // 🔔 إشعار للموظف المكلف
      await notifyWorkOrderAssigned(workOrder, assignedTo)
      
      console.log('👤 تم التكليف يدوياً لـ:', employee?.fullName || assignedTo)
    }

    return NextResponse.json({ success: true, data: workOrder })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('❌ خطأ في POST /api/work-orders:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}