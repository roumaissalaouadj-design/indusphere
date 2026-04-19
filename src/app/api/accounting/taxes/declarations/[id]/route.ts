// src/app/api/accounting/taxes/declarations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import TaxDeclaration from '@/models/TaxDeclaration';

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

    const declaration = await TaxDeclaration.findById(id)
      .populate('createdBy', 'name email');

    if (!declaration) {
      return NextResponse.json({ success: false, message: 'الإقرار الضريبي غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: declaration });
  } catch (error) {
    console.error('Error fetching tax declaration:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الإقرار الضريبي' }, { status: 500 });
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

    const declaration = await TaxDeclaration.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!declaration) {
      return NextResponse.json({ success: false, message: 'الإقرار الضريبي غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: declaration });
  } catch (error) {
    console.error('Error updating tax declaration:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث الإقرار الضريبي' }, { status: 500 });
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

    const declaration = await TaxDeclaration.findByIdAndDelete(id);

    if (!declaration) {
      return NextResponse.json({ success: false, message: 'الإقرار الضريبي غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف الإقرار الضريبي بنجاح' });
  } catch (error) {
    console.error('Error deleting tax declaration:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف الإقرار الضريبي' }, { status: 500 });
  }
}