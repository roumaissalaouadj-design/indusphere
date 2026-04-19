import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import mongoose from 'mongoose'

interface QueryType {
  tenantId: mongoose.Types.ObjectId
  isActive: boolean
  specialization?: { $regex: string; $options: string }
  position?: string
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const position = searchParams.get('position')

    // بناء الاستعلام
    const query: QueryType = {
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId),
      isActive: true,
    }

    if (specialization && specialization.trim() !== '') {
      query.specialization = { $regex: specialization, $options: 'i' }
    }

    if (position && position.trim() !== '') {
      query.position = position
    }

    // جلب الموظفين مع ترتيب حسب التقييم
    const users = await User.find(query)
      .select('name email position specialization phoneNumber rating tasksCompleted')
      .sort({ rating: -1, tasksCompleted: 1 })

    console.log(`✅ تم جلب ${users.length} موظف${users.length !== 1 ? 'ين' : ''}`)
    if (users.length > 0) {
      console.log('الموظفين:', users.map(u => ({ name: u.name, specialization: u.specialization })))
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/users/by-specialization error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}