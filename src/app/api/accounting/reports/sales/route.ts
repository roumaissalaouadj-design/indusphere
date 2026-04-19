// src/app/api/accounting/reports/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter.invoiceDate = {};
      if (startDate) {
        (dateFilter.invoiceDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (dateFilter.invoiceDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    const customerFilter: Record<string, unknown> = {};
    if (customerId) {
      customerFilter.customerId = new mongoose.Types.ObjectId(customerId);
    }

    const matchQuery = { ...dateFilter, ...customerFilter };

    if (reportType === 'summary') {
      const summary = await SalesInvoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            totalRemaining: { $sum: '$remainingAmount' },
          }
        }
      ]);

      const byProduct = await SalesInvoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$productType',
            totalQuantity: { $sum: '$quantity' },
            totalAmount: { $sum: '$totalAmount' },
          }
        }
      ]);

      const byStatus = await SalesInvoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          summary: summary[0] || { totalInvoices: 0, totalQuantity: 0, totalAmount: 0, totalPaid: 0, totalRemaining: 0 },
          byProduct,
          byStatus,
        }
      });
    }

    if (reportType === 'by-customer') {
      const byCustomer = await SalesInvoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$customerId',
            totalInvoices: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            totalRemaining: { $sum: '$remainingAmount' },
          }
        },
        {
          $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
      ]);

      return NextResponse.json({ success: true, data: byCustomer });
    }

    if (reportType === 'daily') {
      const daily = await SalesInvoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$invoiceDate' } },
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return NextResponse.json({ success: true, data: daily });
    }

    return NextResponse.json({ success: false, message: 'نوع التقرير غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء التقرير' }, { status: 500 });
  }
}