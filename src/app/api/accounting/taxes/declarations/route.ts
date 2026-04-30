// src/app/api/accounting/taxes/declarations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import TaxDeclaration from '@/models/TaxDeclaration';
import TaxTransaction from '@/models/TaxTransaction';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const taxType = searchParams.get('taxType');
    const status = searchParams.get('status');
    const period = searchParams.get('period');

    const query: Record<string, unknown> = {};

    if (taxType && taxType !== 'all') {
      query.taxType = taxType;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (period) {
      query.period = period;
    }

    const declarations = await TaxDeclaration.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: declarations });
  } catch (error) {
    console.error('Error fetching tax declarations:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الإقرارات الضريبية' }, { status: 500 });
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
    const userId = session.user.id;

    const transactions = await TaxTransaction.aggregate([
      {
        $match: {
          taxType: body.taxType,
          transactionDate: {
            $gte: new Date(body.startDate),
            $lte: new Date(body.endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTaxableBase: { $sum: '$taxableBase' },
          totalTaxAmount: { $sum: '$taxAmount' },
        },
      },
    ]);

    const taxableBase = transactions[0]?.totalTaxableBase || 0;
    const taxAmount = transactions[0]?.totalTaxAmount || 0;

    const declaration = await TaxDeclaration.create({
      ...body,
      taxableBase,
      taxAmount,
      totalAmount: taxAmount,
      remainingAmount: taxAmount,
      createdBy: userId,
    });

    return NextResponse.json({ success: true, data: declaration }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax declaration:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء الإقرار الضريبي' }, { status: 500 });
  }
}