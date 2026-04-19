// src/models/PurchaseInvoice.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseInvoice extends Document {
  invoiceNumber: string;
  supplierId: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  invoiceType: 'raw_material' | 'service' | 'equipment';
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  attachments: string[];
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseInvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'رقم الفاتورة مطلوب'],
    unique: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'المورد مطلوب'],
  },
  invoiceDate: {
    type: Date,
    required: [true, 'تاريخ الفاتورة مطلوب'],
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, 'تاريخ الاستحقاق مطلوب'],
  },
  invoiceType: {
    type: String,
    enum: ['raw_material', 'service', 'equipment'],
    required: [true, 'نوع الفاتورة مطلوب'],
  },
  subTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    default: 19,
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending',
  },
  attachments: [{
    type: String,
  }],
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// دالة لحساب المبلغ المتبقي وتحديث الحالة (بدون next)
PurchaseInvoiceSchema.pre('save', function() {
  // حساب المبلغ المتبقي
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  // تحديث الحالة بناءً على المدفوعات
  if (this.remainingAmount <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0 && this.remainingAmount > 0) {
    this.status = 'partial';
  } else if (this.dueDate < new Date() && this.remainingAmount > 0) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
});

// فهارس للبحث
PurchaseInvoiceSchema.index({ invoiceNumber: 1, supplierId: 1, invoiceDate: 1 });

export default mongoose.models.PurchaseInvoice || mongoose.model<IPurchaseInvoice>('PurchaseInvoice', PurchaseInvoiceSchema);