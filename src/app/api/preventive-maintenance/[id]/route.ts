// src/app/api/preventive-maintenance/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import PreventiveMaintenance from '@/models/PreventiveMaintenance';
import mongoose from 'mongoose';

function calculateNextDue(frequency: string, from: Date): Date {
  const next = new Date(from);
  switch (frequency) {
    case 'daily':     next.setDate(next.getDate() + 1); break;
    case 'weekly':    next.setDate(next.getDate() + 7); break;
    case 'monthly':   next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly':    next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

// GET: جلب مهمة وقائية واحدة
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

    const plan = await PreventiveMaintenance.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    }).populate('assetId', 'name assetCode');

    if (!plan) {
      return NextResponse.json({ success: false, message: 'المهمة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('GET /api/preventive-maintenance/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT: تحديث مهمة وقائية
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

    const plan = await PreventiveMaintenance.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return NextResponse.json({ success: false, message: 'المهمة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('PUT /api/preventive-maintenance/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE: حذف مهمة وقائية
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

    const plan = await PreventiveMaintenance.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!plan) {
      return NextResponse.json({ success: false, message: 'المهمة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المهمة بنجاح' });
  } catch (error) {
    console.error('DELETE /api/preventive-maintenance/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PATCH: تحديث جزئي (إكمال المهمة، تغيير الحالة)
export async function PATCH(
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
    const { action } = body;

    const plan = await PreventiveMaintenance.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!plan) {
      return NextResponse.json({ success: false, message: 'المهمة غير موجودة' }, { status: 404 });
    }

    if (action === 'complete') {
      const now = new Date();
      plan.lastDone = now;
      plan.nextDue = calculateNextDue(plan.frequency, now);
      await plan.save();
    }

    if (action === 'toggle') {
      plan.status = plan.status === 'active' ? 'inactive' : 'active';
      await plan.save();
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('PATCH /api/preventive-maintenance/[id] error:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}