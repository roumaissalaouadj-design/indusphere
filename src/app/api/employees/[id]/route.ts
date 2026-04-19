import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Employee from '@/models/Employee'
import mongoose from 'mongoose'

// GET: جلب موظف محدد
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    const employee = await Employee.findOne({
      _id: id,
      tenantId: session.user.tenantId
    })

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: employee })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/employees/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PATCH: تحديث موظف
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 })
    }

    console.log('✅ تم تحديث الموظف:', employee.fullName, 'البريد:', employee.email)
    return NextResponse.json({ success: true, data: employee })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('PATCH /api/employees/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// ✅ PUT: تحديث موظف (مضاف للتوافق مع طريقة PUT من الواجهة)
export async function PUT(
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 })
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 })
    }

    console.log('✅ تم تحديث الموظف (PUT):', employee.fullName)
    return NextResponse.json({ success: true, data: employee })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('PUT /api/employees/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// DELETE: حذف موظف
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

    const employee = await Employee.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId
    })

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 })
    }

    console.log('✅ تم حذف الموظف:', employee.fullName)
    return NextResponse.json({ success: true, message: 'تم حذف الموظف بنجاح' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('DELETE /api/employees/[id] error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}