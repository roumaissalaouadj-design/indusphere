import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import WorkOrder from '@/models/WorkOrder'
import mongoose from 'mongoose'

// GET: جلب أمر عمل محدد بالمعرف
export async function GET(
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

    // التحقق من صحة المعرف
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    // جلب أمر العمل مع البيانات المرتبطة
    const workOrder = await WorkOrder.findById(id)
      .populate('assetId', 'name assetCode')
      .populate('assignedTo', 'name email position')
      .populate('assignedBy', 'name')

    if (!workOrder) {
      return NextResponse.json({ success: false, message: 'أمر العمل غير موجود' }, { status: 404 })
    }

    // التأكد من أن المستخدم له صلاحية الوصول
    if (workOrder.tenantId.toString() !== session.user.tenantId) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: workOrder })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/work-orders/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PATCH: تحديث أمر العمل (الحالة، تأكيد الاستلام، إلخ)
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

    // التحقق من صحة المعرف
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    // جلب أمر العمل
    const workOrder = await WorkOrder.findById(id)

    if (!workOrder) {
      return NextResponse.json({ success: false, message: 'أمر العمل غير موجود' }, { status: 404 })
    }

    // التأكد من الصلاحية
    if (workOrder.tenantId.toString() !== session.user.tenantId) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 403 })
    }

    // تحديث الحالة
    if (body.status) {
      workOrder.status = body.status
      
      // تحديث التواريخ حسب الحالة
      if (body.status === 'acknowledged' && !workOrder.acknowledgedAt) {
        workOrder.acknowledgedAt = new Date()
      }
      if (body.status === 'in-progress' && !workOrder.startDate) {
        workOrder.startDate = new Date()
      }
      if (body.status === 'done' && !workOrder.completedAt) {
        workOrder.completedAt = new Date()
        workOrder.endDate = new Date()
      }
    }

    // تحديث التقييم
    if (body.qualityRating !== undefined) {
      workOrder.qualityRating = body.qualityRating
    }
    if (body.qualityNotes !== undefined) {
      workOrder.qualityNotes = body.qualityNotes
    }

    await workOrder.save()

    // جلب البيانات الكاملة بعد التحديث
    const updatedWorkOrder = await WorkOrder.findById(id)
      .populate('assetId', 'name assetCode')
      .populate('assignedTo', 'name email position')
      .populate('assignedBy', 'name')

    return NextResponse.json({ success: true, data: updatedWorkOrder })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('PATCH /api/work-orders/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
// DELETE: حذف أمر عمل
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    const workOrder = await WorkOrder.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId
    })

    if (!workOrder) {
      return NextResponse.json({ success: false, message: 'أمر العمل غير موجود' }, { status: 404 })
    }

    console.log(`✅ تم حذف أمر العمل: ${workOrder.title}`)
    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('DELETE /api/work-orders/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}