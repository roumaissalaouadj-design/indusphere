// src/models/TaxTransaction.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ITaxTransaction extends Document {
  transactionNumber: string;
  taxType: 'TVA' | 'IRG' | 'IBS' | 'other';
  sourceType: 'purchase_invoice' | 'sales_invoice' | 'salary_payment' | 'other';
  sourceId: Types.ObjectId;
  taxableBase: number;
  taxRate: number;
  taxAmount: number;
  transactionDate: Date;
  notes: string;
  createdAt: Date;
}

const TaxTransactionSchema = new Schema({
  transactionNumber: {
    type: String,
    required: [true, 'رقم المعاملة مطلوب'],
    unique: true,
  },
  taxType: {
    type: String,
    enum: ['TVA', 'IRG', 'IBS', 'other'],
    required: [true, 'نوع الضريبة مطلوب'],
  },
  sourceType: {
    type: String,
    enum: ['purchase_invoice', 'sales_invoice', 'salary_payment', 'other'],
    required: [true, 'نوع المصدر مطلوب'],
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceType',
  },
  taxableBase: {
    type: Number,
    required: true,
    min: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    min: 0,
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// حساب مبلغ الضريبة تلقائياً
TaxTransactionSchema.pre('save', function() {
  this.taxAmount = (this.taxableBase * this.taxRate) / 100;
});

TaxTransactionSchema.index({ transactionNumber: 1, taxType: 1, sourceId: 1 });

export default models.TaxTransaction || model<ITaxTransaction>('TaxTransaction', TaxTransactionSchema);