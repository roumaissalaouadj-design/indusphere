// src/app/api/maintenance-requests/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import MaintenanceRequest from '@/models/MaintenanceRequest';
import mongoose from 'mongoose';

// GET: جلب طلب صيانة واحد
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

    const requestData = await MaintenanceRequest.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    })
      .populate('assetId', 'name assetCode')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name')
      .populate('assignedTo', 'name');

    if (!requestData) {
      return NextResponse.json({ success: false, message: 'طلب الصيانة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: requestData });
  } catch (error) {
    console.error('GET /api/maintenance-requests/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT: تحديث طلب صيانة
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

    const requestData = await MaintenanceRequest.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!requestData) {
      return NextResponse.json({ success: false, message: 'طلب الصيانة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: requestData });
  } catch (error) {
    console.error('PUT /api/maintenance-requests/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE: حذف طلب صيانة
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

    const requestData = await MaintenanceRequest.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!requestData) {
      return NextResponse.json({ success: false, message: 'طلب الصيانة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف طلب الصيانة بنجاح' });
  } catch (error) {
    console.error('DELETE /api/maintenance-requests/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}