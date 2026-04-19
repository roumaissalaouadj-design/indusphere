// src/app/api/accounting/taxes/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import TaxSetting from '@/models/TaxSetting';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const taxType = searchParams.get('taxType');
    const isActive = searchParams.get('isActive');

    const query: Record<string, unknown> = {};

    if (taxType && taxType !== 'all') {
      query.taxType = taxType;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const settings = await TaxSetting.find(query).sort({ taxType: 1, code: 1 });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب إعدادات الضرائب' }, { status: 500 });
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

    const requiredFields = ['taxType', 'code', 'name', 'rate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} مطلوب` }, { status: 400 });
      }
    }

    const setting = await TaxSetting.create(body);

    return NextResponse.json({ success: true, data: setting }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax setting:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء إعداد الضريبة' }, { status: 500 });
  }
}