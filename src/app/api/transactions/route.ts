// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

// ✅ دالة إنشاء رمز المعاملة التلقائي
const generateTransactionCode = () => {
  const prefix = 'TRX';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ tenantId: session.user.tenantId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // ✅ إنشاء المعاملة مع رمز تلقائي
    const transaction = await Transaction.create({
      ...body,
      transactionCode: generateTransactionCode(),  // ✅ أضف هذا السطر
      tenantId: session.user.tenantId,
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    console.error('Error creating transaction:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}