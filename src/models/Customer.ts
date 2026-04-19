// src/models/Customer.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ICustomer extends Document {
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: number;
  creditLimit: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema({
  code: {
    type: String,
    required: [true, 'رمز العميل مطلوب'],
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
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
  contactPerson: {
    type: String,
    default: '',
  },
  paymentTerms: {
    type: Number,
    default: 30,
    comment: 'مدة السداد بالأيام',
  },
  creditLimit: {
    type: Number,
    default: 0,
    comment: 'الحد الائتماني',
  },
  balance: {
    type: Number,
    default: 0,
    comment: 'الرصيد المستحق على العميل',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

CustomerSchema.index({ code: 1, name: 1, taxNumber: 1 });

export default models.Customer || model<ICustomer>('Customer', CustomerSchema);