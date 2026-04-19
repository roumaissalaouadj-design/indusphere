// src/app/api/accounting/payroll/salary-structures/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SalaryStructure from '@/models/SalaryStructure';
import mongoose from 'mongoose';

// GET: جلب هيكل راتب واحد
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

    const salaryStructure = await SalaryStructure.findById(id)
      .populate('employeeId', 'employeeCode employeeName department position');

    if (!salaryStructure) {
      return NextResponse.json({ success: false, message: 'هيكل الراتب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: salaryStructure });
  } catch (error) {
    console.error('Error fetching salary structure:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب هيكل الراتب' }, { status: 500 });
  }
}

// PUT: تحديث هيكل راتب
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const salaryStructure = await SalaryStructure.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!salaryStructure) {
      return NextResponse.json({ success: false, message: 'هيكل الراتب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: salaryStructure });
  } catch (error) {
    console.error('Error updating salary structure:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث هيكل الراتب' }, { status: 500 });
  }
}

// DELETE: حذف هيكل راتب
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const salaryStructure = await SalaryStructure.findByIdAndDelete(id);

    if (!salaryStructure) {
      return NextResponse.json({ success: false, message: 'هيكل الراتب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف هيكل الراتب بنجاح' });
  } catch (error) {
    console.error('Error deleting salary structure:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف هيكل الراتب' }, { status: 500 });
  }
}