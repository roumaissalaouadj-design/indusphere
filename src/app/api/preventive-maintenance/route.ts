import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import PreventiveMaintenance from '@/models/PreventiveMaintenance'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    await connectDB()
    const plans = await PreventiveMaintenance.find({ tenantId: session.user.tenantId })
      .populate('assetId', 'name assetCode')
      .sort({ nextDueDate: 1 })  // تم التصحيح: nextDueDate بدلاً من nextDue
    return NextResponse.json({ success: true, data: plans })
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
    
    // حساب nextDueDate إذا لم يتم إرساله
    if (!body.nextDueDate && body.frequency) {
      const nextDate = new Date()
      switch (body.frequency) {
        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break
        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break
        case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break
        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break
      }
      body.nextDueDate = nextDate
    }
    
    // إنشاء taskCode إذا لم يتم إرساله
    if (!body.taskCode) {
      body.taskCode = `PM-${Date.now()}`
    }
    
    const plan = await PreventiveMaintenance.create({
      ...body,
      tenantId: session.user.tenantId,
    })
    return NextResponse.json({ success: true, data: plan })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}