import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ActivationCode from '@/models/ActivationCode'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفعيل مطلوب'
      }, { status: 400 })
    }

    const activation = await ActivationCode.findOne({ code, isUsed: false })

    if (!activation) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفعيل غير صالح أو مستخدم مسبقاً'
      }, { status: 400 })
    }

    if (new Date() > activation.expiresAt) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفعيل منتهي الصلاحية'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      factoryName: activation.factoryName || '',
      modules: activation.modules || [],
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}