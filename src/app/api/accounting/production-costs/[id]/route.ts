// src/app/api/accounting/production-costs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import ProductionCost from '@/models/ProductionCost';
import CostAllocation from '@/models/CostAllocation';

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

    const cost = await ProductionCost.findById(id)
      .populate('createdBy', 'name email');

    if (!cost) {
      return NextResponse.json({ success: false, message: 'بيانات التكلفة غير موجودة' }, { status: 404 });
    }

    const allocations = await CostAllocation.find({ productionCostId: id });

    return NextResponse.json({ success: true, data: { cost, allocations } });
  } catch (error) {
    console.error('Error fetching production cost:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب بيانات التكلفة' }, { status: 500 });
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

    const cost = await ProductionCost.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!cost) {
      return NextResponse.json({ success: false, message: 'بيانات التكلفة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cost });
  } catch (error) {
    console.error('Error updating production cost:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في تحديث بيانات التكلفة' }, { status: 500 });
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

    await CostAllocation.deleteMany({ productionCostId: id });
    await ProductionCost.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف بيانات التكلفة بنجاح' });
  } catch (error) {
    console.error('Error deleting production cost:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف بيانات التكلفة' }, { status: 500 });
  }
}