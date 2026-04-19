import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    const { id } = await params
    const body = await request.json()
    delete body.passwordHash
    const user = await User.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true }
    ).select('-passwordHash')
    if (!user) return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
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
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    const { id } = await params
    if (id === session.user.id) {
      return NextResponse.json({ success: false, message: 'لا يمكنك حذف حسابك' }, { status: 400 })
    }
    await User.findOneAndDelete({ _id: id, tenantId: session.user.tenantId })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}