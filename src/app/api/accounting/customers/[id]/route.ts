// src/app/api/accounting/customers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
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

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب العميل' }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();

    const customer = await Customer.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث العميل' }, { status: 500 });
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

    const SalesInvoice = (await import('@/models/SalesInvoice')).default;
    const hasInvoices = await SalesInvoice.findOne({ customerId: id });

    if (hasInvoices) {
      return NextResponse.json({ 
        success: false, 
        message: 'لا يمكن حذف العميل لوجود فواتير مرتبطة به' 
      }, { status: 400 });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف العميل بنجاح' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف العميل' }, { status: 500 });
  }
}