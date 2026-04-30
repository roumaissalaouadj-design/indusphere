// src/app/api/accounting/reports/payroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SalaryPayment from '@/models/SalaryPayment';
import PayrollEmployee from '@/models/PayrollEmployee';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) {
        (dateFilter.paymentDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (dateFilter.paymentDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    if (period) {
      dateFilter.period = period;
    }

    if (reportType === 'summary') {
      const summary = await SalaryPayment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            totalBaseSalary: { $sum: '$baseSalary' },
            totalAllowances: { $sum: '$totalAllowances' },
            totalBonuses: { $sum: '$totalBonuses' },
            totalDeductions: { $sum: '$totalDeductions' },
            totalNetSalary: { $sum: '$netSalary' },
          }
        }
      ]);

      const byDepartment = await SalaryPayment.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'payrollemployees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $group: {
            _id: '$employee.department',
            totalEmployees: { $sum: 1 },
            totalNetSalary: { $sum: '$netSalary' },
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          summary: summary[0] || {
            totalEmployees: 0,
            totalBaseSalary: 0,
            totalAllowances: 0,
            totalBonuses: 0,
            totalDeductions: 0,
            totalNetSalary: 0,
          },
          byDepartment,
        }
      });
    }

    if (reportType === 'employee') {
      const employeeFilter = { ...dateFilter };
      if (department) {
        const employees = await PayrollEmployee.find({ department });
        const employeeIds = employees.map(e => e._id);
        employeeFilter.employeeId = { $in: employeeIds };
      }

      const employeeReport = await SalaryPayment.aggregate([
        { $match: employeeFilter },
        {
          $group: {
            _id: '$employeeId',
            totalPayments: { $sum: 1 },
            totalNetSalary: { $sum: '$netSalary' },
            averageNetSalary: { $avg: '$netSalary' },
          }
        },
        {
          $lookup: {
            from: 'payrollemployees',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        { $sort: { totalNetSalary: -1 } }
      ]);

      return NextResponse.json({ success: true, data: employeeReport });
    }

    return NextResponse.json({ success: false, message: 'نوع التقرير غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Error generating payroll report:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء التقرير' }, { status: 500 });
  }
}