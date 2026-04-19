import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import SparePart from '@/models/SparePart'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const parts = await SparePart.find({ tenantId: session.user.tenantId })
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: parts })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    const part = await SparePart.create({
      ...body,
      tenantId: session.user.tenantId,
    })

    return NextResponse.json({ success: true, data: part })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}