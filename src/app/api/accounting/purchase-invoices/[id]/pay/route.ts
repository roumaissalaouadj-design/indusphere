// src/app/api/accounting/purchase-invoices/[id]/pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import PurchaseInvoice from '@/models/PurchaseInvoice';
import Supplier from '@/models/Supplier';

export async function POST(
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
    const { amount, paymentDate, paymentMethod, reference } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'المبلغ المدفوع غير صحيح' }, { status: 400 });
    }

    const invoice = await PurchaseInvoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ success: false, message: 'الفاتورة مدفوعة بالكامل بالفعل' }, { status: 400 });
    }

    if (amount > invoice.remainingAmount) {
      return NextResponse.json({ 
        success: false, 
        message: `المبلغ المدفوع أكبر من المتبقي (${invoice.remainingAmount})` 
      }, { status: 400 });
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const newRemainingAmount = invoice.totalAmount - newPaidAmount;

    await PurchaseInvoice.findByIdAndUpdate(id, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newRemainingAmount <= 0 ? 'paid' : 'partial',
    });

    await Supplier.findByIdAndUpdate(invoice.supplierId, {
      $inc: { balance: -amount }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'تم تسجيل الدفع بنجاح',
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : 'partial'
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في معالجة الدفع' }, { status: 500 });
  }
}