// src/app/api/accounting/reports/taxes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import TaxDeclaration from '@/models/TaxDeclaration';
import TaxTransaction from '@/models/TaxTransaction';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const taxType = searchParams.get('taxType');
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (taxType && taxType !== 'all') {
      query.taxType = taxType;
    }

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) {
        (query.transactionDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.transactionDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    if (reportType === 'summary') {
      const summary = await TaxDeclaration.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$taxType',
            totalDeclarations: { $sum: 1 },
            totalTaxableBase: { $sum: '$taxableBase' },
            totalTaxAmount: { $sum: '$taxAmount' },
            totalPaid: { $sum: '$paidAmount' },
            totalRemaining: { $sum: '$remainingAmount' },
          },
        },
      ]);

      const monthlyData = await TaxDeclaration.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $substr: ['$period', 0, 7] },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return NextResponse.json({
        success: true,
        data: {
          summary,
          monthlyData,
        },
      });
    }

    if (reportType === 'transactions') {
      const transactions = await TaxTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              taxType: '$taxType',
              sourceType: '$sourceType',
            },
            totalTaxableBase: { $sum: '$taxableBase' },
            totalTaxAmount: { $sum: '$taxAmount' },
            count: { $sum: 1 },
          },
        },
      ]);

      return NextResponse.json({ success: true, data: transactions });
    }

    return NextResponse.json({ success: false, message: 'نوع التقرير غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Error generating tax report:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء التقرير' }, { status: 500 });
  }
}