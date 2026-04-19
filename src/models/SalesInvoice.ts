// src/models/SalesInvoice.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ISalesInvoice extends Document {
  invoiceNumber: string;
  customerId: Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  productType: 'cement' | 'clinker';
  cementType?: 'CEM_I' | 'CEM_II' | 'CEM_III' | 'CEM_IV' | 'CEM_V';
  strengthClass?: '32.5' | '42.5' | '52.5';
  quantity: number;
  unitPrice: number;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// دالة مساعدة للتحقق من نوع المنتج
const isCement = (productType: string): boolean => {
  return productType === 'cement';
};

const SalesInvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'رقم الفاتورة مطلوب'],
    unique: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'العميل مطلوب'],
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
  productType: {
    type: String,
    enum: ['cement', 'clinker'],
    required: [true, 'نوع المنتج مطلوب'],
  },
  cementType: {
    type: String,
    enum: ['CEM_I', 'CEM_II', 'CEM_III', 'CEM_IV', 'CEM_V'],
    required: function(this: { productType: string }) {
      return isCement(this.productType);
    },
  },
  strengthClass: {
    type: String,
    enum: ['32.5', '42.5', '52.5'],
    required: function(this: { productType: string }) {
      return isCement(this.productType);
    },
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: [true, 'سعر الوحدة مطلوب'],
    min: 0,
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

// حساب المبالغ تلقائياً
SalesInvoiceSchema.pre('save', function() {
  this.subTotal = this.quantity * this.unitPrice;
  this.taxAmount = (this.subTotal * this.taxRate) / 100;
  this.totalAmount = this.subTotal + this.taxAmount;
  this.remainingAmount = this.totalAmount - this.paidAmount;

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

SalesInvoiceSchema.index({ invoiceNumber: 1, customerId: 1, invoiceDate: 1 });

export default models.SalesInvoice || model<ISalesInvoice>('SalesInvoice', SalesInvoiceSchema);