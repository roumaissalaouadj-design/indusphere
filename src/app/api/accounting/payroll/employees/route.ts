// src/app/api/accounting/payroll/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import PayrollEmployee from '@/models/PayrollEmployee';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { employeeCode: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
      ];
    }

    // ✅ استخدام populate لجلب بيانات الموظف الكاملة
    const employees = await PayrollEmployee.find(query)
      .populate('employeeId', 'fullName employeeCode position department')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching payroll employees:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الموظفين' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // التحقق من البيانات المطلوبة
    const requiredFields = ['employeeId', 'employeeCode', 'employeeName', 'department', 'position', 'hireDate', 'baseSalary', 'bankAccount', 'socialSecurityNumber', 'taxRegistrationNumber'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} مطلوب` }, { status: 400 });
      }
    }

    // التحقق من عدم وجود الموظف مسبقاً
    const existingEmployee = await PayrollEmployee.findOne({ employeeId: body.employeeId });
    if (existingEmployee) {
      return NextResponse.json({ success: false, message: 'الموظف موجود مسبقاً في نظام الرواتب' }, { status: 400 });
    }

    const employee = await PayrollEmployee.create(body);

    // ✅ جلب البيانات بعد الإضافة مع populate
    const populatedEmployee = await PayrollEmployee.findById(employee._id)
      .populate('employeeId', 'fullName employeeCode position department');

    return NextResponse.json({ success: true, data: populatedEmployee }, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll employee:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء بيانات الموظف' }, { status: 500 });
  }
}

// ✅ دالة DELETE المصححة - تجعل params اختيارية وتتحقق من وجود id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    
    // التحقق من وجود الـ id
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف الموظف مطلوب' },
        { status: 400 }
      );
    }

    const employee = await PayrollEmployee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف الموظف بنجاح' });
  } catch (error) {
    console.error('Error deleting payroll employee:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف الموظف' }, { status: 500 });
  }
}