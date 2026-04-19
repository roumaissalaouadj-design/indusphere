// src/models/TaxDeclaration.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ITaxDeclaration extends Document {
  declarationNumber: string;
  taxType: 'TVA' | 'IRG' | 'IBS' | 'other';
  period: string;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  taxableBase: number;
  taxRate: number;
  taxAmount: number;
  penalties: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'draft' | 'submitted' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  paymentReference?: string;
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaxDeclarationSchema = new Schema({
  declarationNumber: {
    type: String,
    required: [true, 'رقم الإقرار مطلوب'],
    unique: true,
  },
  taxType: {
    type: String,
    enum: ['TVA', 'IRG', 'IBS', 'other'],
    required: [true, 'نوع الضريبة مطلوب'],
  },
  period: {
    type: String,
    required: [true, 'الفترة مطلوبة'],
  },
  startDate: {
    type: Date,
    required: [true, 'تاريخ البداية مطلوب'],
  },
  endDate: {
    type: Date,
    required: [true, 'تاريخ النهاية مطلوب'],
  },
  dueDate: {
    type: Date,
    required: [true, 'تاريخ الاستحقاق مطلوب'],
  },
  taxableBase: {
    type: Number,
    required: true,
    default: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  penalties: {
    type: Number,
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
    enum: ['draft', 'submitted', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  paymentReference: {
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

// حساب المبالغ تلقائياً
TaxDeclarationSchema.pre('save', function() {
  this.totalAmount = (this.taxAmount || 0) + (this.penalties || 0);
  this.remainingAmount = (this.totalAmount || 0) - (this.paidAmount || 0);
  
  if (this.remainingAmount <= 0) {
    this.status = 'paid';
  } else if (this.dueDate < new Date() && this.remainingAmount > 0 && this.status !== 'paid') {
    this.status = 'overdue';
  }
});

TaxDeclarationSchema.index({ declarationNumber: 1, taxType: 1, period: 1 });

export default models.TaxDeclaration || model<ITaxDeclaration>('TaxDeclaration', TaxDeclarationSchema);