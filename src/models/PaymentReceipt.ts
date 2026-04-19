// src/models/PaymentReceipt.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IPaymentReceipt extends Document {
  receiptNumber: string;
  invoiceId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
  reference: string;
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const PaymentReceiptSchema = new Schema({
  receiptNumber: {
    type: String,
    required: [true, 'رقم الإيصال مطلوب'],
    unique: true,
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: [true, 'رقم الفاتورة مطلوب'],
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'العميل مطلوب'],
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: 0,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'card'],
    required: true,
  },
  reference: {
    type: String,
    default: '',
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

PaymentReceiptSchema.index({ receiptNumber: 1, invoiceId: 1, customerId: 1 });

export default models.PaymentReceipt || model<IPaymentReceipt>('PaymentReceipt', PaymentReceiptSchema);