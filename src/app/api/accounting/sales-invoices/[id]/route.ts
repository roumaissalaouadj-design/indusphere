// src/app/api/accounting/sales-invoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import Customer from '@/models/Customer';

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

    const invoice = await SalesInvoice.findById(id)
      .populate('customerId', 'name code phone email address taxNumber')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching sales invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الفاتورة' }, { status: 500 });
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

    const invoice = await SalesInvoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ success: false, message: 'لا يمكن حذف فاتورة مدفوعة' }, { status: 400 });
    }

    await Customer.findByIdAndUpdate(invoice.customerId, {
      $inc: { balance: -invoice.totalAmount }
    });

    await SalesInvoice.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الفاتورة بنجاح' });
  } catch (error) {
    console.error('Error deleting sales invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف الفاتورة' }, { status: 500 });
  }
}