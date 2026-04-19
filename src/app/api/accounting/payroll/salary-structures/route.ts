// src/app/api/accounting/payroll/salary-structures/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SalaryStructure from '@/models/SalaryStructure';

// GET: جلب جميع هياكل الرواتب
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const isActive = searchParams.get('isActive');

    const query: Record<string, unknown> = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    // ✅ استخدام populate مع Employee
    const salaryStructures = await SalaryStructure.find(query)
      .populate('employeeId', 'fullName employeeCode position department')
      .sort({ effectiveFrom: -1 });

    return NextResponse.json({ success: true, data: salaryStructures });
  } catch (error) {
    console.error('Error fetching salary structures:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب هياكل الرواتب' }, { status: 500 });
  }
}

// POST: إضافة هيكل راتب جديد
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

    if (!body.baseSalary || body.baseSalary <= 0) {
      return NextResponse.json({ success: false, message: 'الراتب الأساسي مطلوب' }, { status: 400 });
    }

    // تعطيل أي هيكل راتب نشط سابق لنفس الموظف
    await SalaryStructure.updateMany(
      { employeeId: body.employeeId, isActive: true },
      { $set: { isActive: false, effectiveTo: new Date() } }
    );

    // إنشاء هيكل الراتب الجديد
    const salaryStructure = await SalaryStructure.create({
      ...body,
      effectiveFrom: body.effectiveFrom || new Date(),
      isActive: true,
    });

    // ✅ جلب البيانات مع populate
    const populatedStructure = await SalaryStructure.findById(salaryStructure._id)
      .populate('employeeId', 'fullName employeeCode position department');

    return NextResponse.json({ success: true, data: populatedStructure }, { status: 201 });
  } catch (error) {
    console.error('Error creating salary structure:', error);
    const message = error instanceof Error ? error.message : 'حدث خطأ في إنشاء هيكل الراتب';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}