// src/app/api/accounting/purchase-invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import PurchaseInvoice from '@/models/PurchaseInvoice';
import Supplier from '@/models/Supplier';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const invoiceType = searchParams.get('invoiceType');
    const supplierId = searchParams.get('supplierId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (invoiceType && invoiceType !== 'all') {
      query.invoiceType = invoiceType;
    }

    if (supplierId) {
      query.supplierId = new mongoose.Types.ObjectId(supplierId);
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

    const invoices = await PurchaseInvoice.find(query)
      .populate('supplierId', 'name code')
      .sort({ invoiceDate: -1 });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الفواتير' }, { status: 500 });
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

    const subTotal = body.subTotal || 0;
    const taxRate = body.taxRate || 19;
    const taxAmount = (subTotal * taxRate) / 100;
    const totalAmount = subTotal + taxAmount;

    const invoice = await PurchaseInvoice.create({
      ...body,
      taxAmount,
      totalAmount,
      remainingAmount: totalAmount,
      createdBy: userId,
    });

    await Supplier.findByIdAndUpdate(body.supplierId, {
      $inc: { balance: totalAmount }
    });

    if (body.details && body.details.length > 0) {
      if (body.invoiceType === 'raw_material') {
        const RawMaterialDetail = (await import('@/models/PurchaseDetailRawMaterial')).default;
        for (const detail of body.details) {
          await RawMaterialDetail.create({ ...detail, invoiceId: invoice._id });
        }
      } else if (body.invoiceType === 'service') {
        const ServiceDetail = (await import('@/models/PurchaseDetailService')).default;
        for (const detail of body.details) {
          await ServiceDetail.create({ ...detail, invoiceId: invoice._id });
        }
      } else if (body.invoiceType === 'equipment') {
        const EquipmentDetail = (await import('@/models/PurchaseDetailEquipment')).default;
        for (const detail of body.details) {
          await EquipmentDetail.create({ ...detail, invoiceId: invoice._id });
        }
      }
    }

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء الفاتورة' }, { status: 500 });
  }
}