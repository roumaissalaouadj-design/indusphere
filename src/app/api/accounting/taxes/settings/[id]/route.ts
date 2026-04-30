// src/app/api/accounting/taxes/settings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import TaxSetting from '@/models/TaxSetting';

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

    const setting = await TaxSetting.findById(id);

    if (!setting) {
      return NextResponse.json({ success: false, message: 'إعداد الضريبة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Error fetching tax setting:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب إعداد الضريبة' }, { status: 500 });
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

    const setting = await TaxSetting.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!setting) {
      return NextResponse.json({ success: false, message: 'إعداد الضريبة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Error updating tax setting:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث إعداد الضريبة' }, { status: 500 });
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

    const setting = await TaxSetting.findByIdAndDelete(id);

    if (!setting) {
      return NextResponse.json({ success: false, message: 'إعداد الضريبة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف إعداد الضريبة بنجاح' });
  } catch (error) {
    console.error('Error deleting tax setting:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف إعداد الضريبة' }, { status: 500 });
  }
}