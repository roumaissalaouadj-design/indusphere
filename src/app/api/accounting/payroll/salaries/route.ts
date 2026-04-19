// src/app/api/accounting/payroll/salaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import SalaryPayment from '@/models/SalaryPayment';
import PayrollEmployee from '@/models/PayrollEmployee';
import SalaryStructure from '@/models/SalaryStructure';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (period) {
      query.period = period;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        (query.paymentDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.paymentDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    const payments = await SalaryPayment.find(query)
      .populate('employeeId', 'employeeName employeeCode department position')
      .populate('createdBy', 'name email')
      .sort({ paymentDate: -1 });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching salary payments:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب دفعات الرواتب' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const userId = token.sub;

    const employee = await PayrollEmployee.findById(body.employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود' }, { status: 404 });
    }

    const salaryStructure = await SalaryStructure.findOne({ 
      employeeId: body.employeeId, 
      isActive: true,
      effectiveFrom: { $lte: new Date() }
    });

    const payment = await SalaryPayment.create({
      ...body,
      baseSalary: salaryStructure?.baseSalary || employee.baseSalary,
      allowances: salaryStructure?.allowances || {},
      bonuses: salaryStructure?.bonuses || {},
      deductions: salaryStructure?.deductions || {},
      createdBy: userId,
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating salary payment:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء دفعة الراتب' }, { status: 500 });
  }
}