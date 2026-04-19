// src/app/api/accounting/suppliers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'المورد غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب المورد' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'المورد غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث المورد' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const PurchaseInvoice = (await import('@/models/PurchaseInvoice')).default;
    const hasInvoices = await PurchaseInvoice.findOne({ supplierId: id });

    if (hasInvoices) {
      return NextResponse.json({ 
        success: false, 
        message: 'لا يمكن حذف المورد لوجود فواتير مرتبطة به' 
      }, { status: 400 });
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'المورد غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المورد بنجاح' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف المورد' }, { status: 500 });
  }
}