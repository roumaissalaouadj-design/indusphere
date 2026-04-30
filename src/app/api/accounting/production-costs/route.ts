// src/app/api/accounting/production-costs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import ProductionCost from '@/models/ProductionCost';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period');

    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        (query.startDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.startDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    if (period) {
      query.period = { $regex: period, $options: 'i' };
    }

    const costs = await ProductionCost.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    return NextResponse.json({ success: true, data: costs });
  } catch (error) {
    console.error('Error fetching production costs:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب تكاليف الإنتاج' }, { status: 500 });
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

    const cost = await ProductionCost.create({
      ...body,
      createdBy: userId,
    });

    return NextResponse.json({ success: true, data: cost }, { status: 201 });
  } catch (error) {
    console.error('Error creating production cost:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء تكاليف الإنتاج' }, { status: 500 });
  }
}