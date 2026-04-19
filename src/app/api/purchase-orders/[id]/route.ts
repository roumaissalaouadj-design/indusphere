import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import PurchaseOrder from '@/models/PurchaseOrder'
import mongoose from 'mongoose'

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

    const order = await PurchaseOrder.findOne({
      _id: id,
      tenantId: session.user.tenantId
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'أمر الشراء غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

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

    const order = await PurchaseOrder.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!order) {
      return NextResponse.json({ success: false, message: 'أمر الشراء غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

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

    const order = await PurchaseOrder.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'أمر الشراء غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}