// src/app/api/accounting/payroll/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import PayrollEmployee from '@/models/PayrollEmployee';
import SalaryStructure from '@/models/SalaryStructure';
import SalaryPayment from '@/models/SalaryPayment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const employee = await PayrollEmployee.findById(id);

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 });
    }

    const salaryStructure = await SalaryStructure.findOne({ employeeId: id, isActive: true });
    const recentPayments = await SalaryPayment.find({ employeeId: id }).sort({ paymentDate: -1 }).limit(6);

    return NextResponse.json({ success: true, data: { employee, salaryStructure, recentPayments } });
  } catch (error) {
    console.error('Error fetching payroll employee:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب بيانات الموظف' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const employee = await PayrollEmployee.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating payroll employee:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث بيانات الموظف' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const hasPayments = await SalaryPayment.findOne({ employeeId: id });
    if (hasPayments) {
      return NextResponse.json({ success: false, message: 'لا يمكن حذف الموظف لوجود دفعات مرتبطة به' }, { status: 400 });
    }

    await SalaryStructure.deleteMany({ employeeId: id });
    await PayrollEmployee.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الموظف بنجاح' });
  } catch (error) {
    console.error('Error deleting payroll employee:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف الموظف' }, { status: 500 });
  }
}