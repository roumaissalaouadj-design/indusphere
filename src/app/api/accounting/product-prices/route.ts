// src/app/api/accounting/product-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import ProductPrice from '@/models/ProductPrice';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');
    const isActive = searchParams.get('isActive');

    const query: Record<string, unknown> = {};

    if (productType && productType !== 'all') {
      query.productType = productType;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const prices = await ProductPrice.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error fetching product prices:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الأسعار' }, { status: 500 });
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

    const price = await ProductPrice.create(body);

    return NextResponse.json({ success: true, data: price }, { status: 201 });
  } catch (error) {
    console.error('Error creating product price:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء السعر' }, { status: 500 });
  }
}