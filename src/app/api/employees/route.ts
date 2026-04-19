import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Employee from '@/models/Employee'
import mongoose from 'mongoose'

// تعريف نوع الاستعلام
interface QueryType {
  tenantId: mongoose.Types.ObjectId
  position?: { $regex: string; $options: string }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    
    const query: QueryType = { 
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId) 
    }
    
    if (position && position.trim() !== '') {
      query.position = { $regex: position, $options: 'i' }
    }
    
    const employees = await Employee.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: employees })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('GET /api/employees error:', error)
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
    
    // التحقق من البيانات المطلوبة
    if (!body.employeeCode || !body.fullName) {
      return NextResponse.json({ 
        success: false, 
        message: 'رمز الموظف والاسم مطلوبان' 
      }, { status: 400 })
    }
    
    const employee = await Employee.create({ 
      ...body, 
      tenantId: new mongoose.Types.ObjectId(session.user.tenantId) 
    })
    
    console.log('✅ تم إضافة موظف جديد:', employee.fullName)
    return NextResponse.json({ success: true, data: employee })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    console.error('POST /api/employees error:', error)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}