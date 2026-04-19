// src/app/api/accounting/product-prices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import ProductPrice from '@/models/ProductPrice';

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

    const price = await ProductPrice.findById(id);

    if (!price) {
      return NextResponse.json({ success: false, message: 'السعر غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: price });
  } catch (error) {
    console.error('Error fetching product price:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب السعر' }, { status: 500 });
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

    const price = await ProductPrice.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!price) {
      return NextResponse.json({ success: false, message: 'السعر غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: price });
  } catch (error) {
    console.error('Error updating product price:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث السعر' }, { status: 500 });
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

    const price = await ProductPrice.findByIdAndDelete(id);

    if (!price) {
      return NextResponse.json({ success: false, message: 'السعر غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف السعر بنجاح' });
  } catch (error) {
    console.error('Error deleting product price:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف السعر' }, { status: 500 });
  }
}