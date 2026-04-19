// src/app/api/spare-parts/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SparePart from '@/models/SparePart';
import mongoose from 'mongoose';

// GET: جلب قطعة غيار واحدة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const part = await SparePart.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!part) {
      return NextResponse.json({ success: false, message: 'قطعة الغيار غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    console.error('GET /api/spare-parts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT: تحديث قطعة غيار
export async function PUT(
  request: Request,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const part = await SparePart.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!part) {
      return NextResponse.json({ success: false, message: 'قطعة الغيار غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    console.error('PUT /api/spare-parts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE: حذف قطعة غيار
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const part = await SparePart.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!part) {
      return NextResponse.json({ success: false, message: 'قطعة الغيار غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف قطعة الغيار بنجاح' });
  } catch (error) {
    console.error('DELETE /api/spare-parts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}