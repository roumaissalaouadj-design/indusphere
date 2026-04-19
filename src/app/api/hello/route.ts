import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Tenant from '@/models/Tenant'

export async function GET() {
  try {
    await connectDB()

    const tenant = await Tenant.create({
      name: 'مصنع الأسمنت الشمالي',
      slug: 'cement-north-1',
      location: 'الجزائر',
    })

    return NextResponse.json({
      success: true,
      message: 'الاتصال بقاعدة البيانات نجح!',
      data: tenant
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({
      success: false,
      message
    }, { status: 500 })
  }
}
