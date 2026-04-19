// src/app/api/employee-evaluations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import EmployeeEvaluation from '@/models/EmployeeEvaluation';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.employeeId) {
      return NextResponse.json({ success: false, message: 'الموظف مطلوب' }, { status: 400 });
    }
    if (!body.period) {
      return NextResponse.json({ success: false, message: 'الفترة مطلوبة' }, { status: 400 });
    }

    const evaluation = await EmployeeEvaluation.create({
      ...body,
      tenantId: session.user.tenantId,
      evaluatorId: session.user.id,
    });

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const department = searchParams.get('department');
    const period = searchParams.get('period');

    const query: Record<string, unknown> = { tenantId: session.user.tenantId };
    if (employeeId) query.employeeId = employeeId;
    if (department) query.department = department;
    if (period) query.period = period;

    const evaluations = await EmployeeEvaluation.find(query)
      .populate('employeeId', 'fullName employeeCode department position')
      .populate('evaluatorId', 'name email')
      .sort({ evaluationDate: -1 });

    return NextResponse.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب التقييمات' }, { status: 500 });
  }
}