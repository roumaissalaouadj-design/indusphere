// src/app/api/employee-evaluations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import EmployeeEvaluation from '@/models/EmployeeEvaluation';
import mongoose from 'mongoose';

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const evaluation = await EmployeeEvaluation.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    }).populate('employeeId', 'fullName employeeCode department position')
      .populate('evaluatorId', 'name email');

    if (!evaluation) {
      return NextResponse.json({ success: false, message: 'التقييم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب التقييم' }, { status: 500 });
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

    const evaluation = await EmployeeEvaluation.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!evaluation) {
      return NextResponse.json({ success: false, message: 'التقييم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث التقييم' }, { status: 500 });
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

    const evaluation = await EmployeeEvaluation.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!evaluation) {
      return NextResponse.json({ success: false, message: 'التقييم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف التقييم بنجاح' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف التقييم' }, { status: 500 });
  }
}