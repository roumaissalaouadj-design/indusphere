// src/app/api/assets/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Asset from '@/models/Asset';
import mongoose from 'mongoose';

// GET: جلب أصل واحد
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

    const asset = await Asset.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!asset) {
      return NextResponse.json({ success: false, message: 'الأصل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('GET /api/assets/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT: تحديث أصل
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

    const asset = await Asset.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!asset) {
      return NextResponse.json({ success: false, message: 'الأصل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('PUT /api/assets/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE: حذف أصل
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

    const asset = await Asset.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!asset) {
      return NextResponse.json({ success: false, message: 'الأصل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف الأصل بنجاح' });
  } catch (error) {
    console.error('DELETE /api/assets/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}