import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    // ✅ استخراج tenantId من التوكن
    const tenantId = token.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: false, message: 'لا يوجد مصنع مرتبط بالحساب' }, { status: 400 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // ✅ إضافة tenantId إلى الاستعلام
    const query: Record<string, unknown> = { tenantId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { taxNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الموردين' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    // ✅ استخراج tenantId من التوكن
    const tenantId = token.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: false, message: 'لا يوجد مصنع مرتبط بالحساب' }, { status: 400 });
    }

    await connectDB();

    const body = await request.json();

    const requiredFields = ['code', 'name', 'taxNumber', 'phone', 'email', 'address', 'bankAccount', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} مطلوب` }, { status: 400 });
      }
    }

    // ✅ التحقق من وجود الكود أو الرقم الضريبي في نفس tenantId فقط
    const existingSupplier = await Supplier.findOne({
      tenantId,
      $or: [{ code: body.code }, { taxNumber: body.taxNumber }]
    });

    if (existingSupplier) {
      return NextResponse.json({ success: false, message: 'الكود أو الرقم الضريبي موجود مسبقاً' }, { status: 400 });
    }

    // ✅ إضافة tenantId إلى البيانات الجديدة
    const supplier = await Supplier.create({
      ...body,
      tenantId,
      balance: 0,
      isActive: true,
    });

    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء المورد' }, { status: 500 });
  }
}