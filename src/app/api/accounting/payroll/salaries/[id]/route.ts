// src/app/api/accounting/payroll/salaries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
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

    const payment = await SalaryPayment.findById(id)
      .populate('employeeId', 'employeeName employeeCode department position bankAccount')
      .populate('createdBy', 'name email');

    if (!payment) {
      return NextResponse.json({ success: false, message: 'دفعة الراتب غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error fetching salary payment:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب دفعة الراتب' }, { status: 500 });
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

    const payment = await SalaryPayment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json({ success: false, message: 'دفعة الراتب غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف دفعة الراتب بنجاح' });
  } catch (error) {
    console.error('Error deleting salary payment:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف دفعة الراتب' }, { status: 500 });
  }
}