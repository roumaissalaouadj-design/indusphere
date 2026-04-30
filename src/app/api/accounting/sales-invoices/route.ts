// src/app/api/accounting/sales-invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (customerId) {
      query.customerId = new mongoose.Types.ObjectId(customerId);
    }

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) {
        (query.invoiceDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.invoiceDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    const invoices = await SalesInvoice.find(query)
      .populate('customerId', 'name code')
      .sort({ invoiceDate: -1 });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching sales invoices:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب فواتير المبيعات' }, { status: 500 });
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
    const userId = token.sub;

    const invoice = await SalesInvoice.create({
      ...body,
      createdBy: userId,
    });

    await Customer.findByIdAndUpdate(body.customerId, {
      $inc: { balance: invoice.totalAmount }
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating sales invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء فاتورة المبيعات' }, { status: 500 });
  }
}