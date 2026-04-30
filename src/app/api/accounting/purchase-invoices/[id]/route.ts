// src/app/api/accounting/purchase-invoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectDB } from '@/lib/mongodb';
import PurchaseInvoice from '@/models/PurchaseInvoice';

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

    const invoice = await PurchaseInvoice.findById(id)
      .populate('supplierId', 'name code phone email address')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    let details = null;
    if (invoice.invoiceType === 'raw_material') {
      const RawMaterialDetail = (await import('@/models/PurchaseDetailRawMaterial')).default;
      details = await RawMaterialDetail.find({ invoiceId: id });
    } else if (invoice.invoiceType === 'service') {
      const ServiceDetail = (await import('@/models/PurchaseDetailService')).default;
      details = await ServiceDetail.find({ invoiceId: id });
    } else if (invoice.invoiceType === 'equipment') {
      const EquipmentDetail = (await import('@/models/PurchaseDetailEquipment')).default;
      details = await EquipmentDetail.find({ invoiceId: id });
    }

    return NextResponse.json({ success: true, data: { invoice, details } });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في جلب الفاتورة' }, { status: 500 });
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

    const invoice = await PurchaseInvoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ success: false, message: 'لا يمكن حذف فاتورة مدفوعة' }, { status: 400 });
    }

    if (invoice.invoiceType === 'raw_material') {
      const RawMaterialDetail = (await import('@/models/PurchaseDetailRawMaterial')).default;
      await RawMaterialDetail.deleteMany({ invoiceId: id });
    } else if (invoice.invoiceType === 'service') {
      const ServiceDetail = (await import('@/models/PurchaseDetailService')).default;
      await ServiceDetail.deleteMany({ invoiceId: id });
    } else if (invoice.invoiceType === 'equipment') {
      const EquipmentDetail = (await import('@/models/PurchaseDetailEquipment')).default;
      await EquipmentDetail.deleteMany({ invoiceId: id });
    }

    const Supplier = (await import('@/models/Supplier')).default;
    await Supplier.findByIdAndUpdate(invoice.supplierId, {
      $inc: { balance: -invoice.totalAmount }
    });

    await PurchaseInvoice.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الفاتورة بنجاح' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في حذف الفاتورة' }, { status: 500 });
  }
}