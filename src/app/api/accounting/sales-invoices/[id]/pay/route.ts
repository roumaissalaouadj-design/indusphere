// src/app/api/accounting/sales-invoices/[id]/pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import Customer from '@/models/Customer';
import PaymentReceipt from '@/models/PaymentReceipt';

export async function POST(
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
    const { amount, paymentDate, paymentMethod, reference, notes } = body;
    const userId = token.sub;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'المبلغ المدفوع غير صحيح' }, { status: 400 });
    }

    const invoice = await SalesInvoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ success: false, message: 'الفاتورة مدفوعة بالكامل بالفعل' }, { status: 400 });
    }

    if (amount > invoice.remainingAmount) {
      return NextResponse.json({ 
        success: false, 
        message: `المبلغ المدفوع أكبر من المتبقي (${invoice.remainingAmount.toLocaleString()} دج)` 
      }, { status: 400 });
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const newRemainingAmount = invoice.totalAmount - newPaidAmount;

    await SalesInvoice.findByIdAndUpdate(id, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newRemainingAmount <= 0 ? 'paid' : 'partial',
    });

    await Customer.findByIdAndUpdate(invoice.customerId, {
      $inc: { balance: -amount }
    });

    const receiptNumber = `REC-${Date.now()}`;
    await PaymentReceipt.create({
      receiptNumber,
      invoiceId: id,
      customerId: invoice.customerId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference: reference || '',
      notes: notes || '',
      createdBy: userId,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'تم تسجيل الدفع بنجاح',
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : 'partial',
        receiptNumber
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في معالجة الدفع' }, { status: 500 });
  }
}