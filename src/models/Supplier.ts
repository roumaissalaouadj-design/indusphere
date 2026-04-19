// src/models/Supplier.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  bankAccount: string;
  paymentTerms: number;
  balance: number;
  category: 'raw_material' | 'service' | 'equipment';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema({
  code: {
    type: String,
    required: [true, 'رمز المورد مطلوب'],
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'اسم المورد مطلوب'],
    trim: true,
  },
  taxNumber: {
    type: String,
    required: [true, 'الرقم الضريبي مطلوب'],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    lowercase: true,
  },
  address: {
    type: String,
    required: [true, 'العنوان مطلوب'],
  },
  bankAccount: {
    type: String,
    required: [true, 'الحساب البنكي مطلوب'],
  },
  paymentTerms: {
    type: Number,
    default: 30,
    comment: 'مدة السداد بالأيام',
  },
  balance: {
    type: Number,
    default: 0,
    comment: 'الرصيد المستحق للمورد',
  },
  category: {
    type: String,
    enum: ['raw_material', 'service', 'equipment'],
    required: [true, 'نوع المورد مطلوب'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// إنشاء فهرس للبحث
SupplierSchema.index({ code: 1, name: 1, taxNumber: 1 });

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);