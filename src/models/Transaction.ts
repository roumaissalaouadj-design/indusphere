// src/models/Transaction.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  tenantId: Types.ObjectId;
  transactionCode: string;  // ✅ أضف هذا الحقل
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';  // ✅ أضف هذا الحقل
  reference?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  transactionCode: { type: String, required: true, unique: true },  // ✅ أضف هذا
  type:        { type: String, enum: ['income', 'expense'], required: true },
  category:    { type: String, required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  status:      { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },  // ✅ أضف هذا
  reference:   { type: String },
}, { timestamps: true });

// ✅ إضافة فهرس فريد لـ transactionCode
TransactionSchema.index({ tenantId: 1, transactionCode: 1 }, { unique: true });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);