// src/models/TaxSetting.ts
import { Schema, model, models } from 'mongoose';
import type { Document } from 'mongoose';

export interface ITaxSetting extends Document {
  taxType: 'TVA' | 'IRG' | 'IBS' | 'other';
  code: string;
  name: string;
  rate: number;
  description: string;
  appliesTo: ('purchase' | 'sale' | 'salary' | 'service')[];
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaxSettingSchema = new Schema({
  taxType: {
    type: String,
    enum: ['TVA', 'IRG', 'IBS', 'other'],
    required: [true, 'نوع الضريبة مطلوب'],
  },
  code: {
    type: String,
    required: [true, 'رمز الضريبة مطلوب'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'اسم الضريبة مطلوب'],
  },
  rate: {
    type: Number,
    required: [true, 'نسبة الضريبة مطلوبة'],
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    default: '',
  },
  appliesTo: [{
    type: String,
    enum: ['purchase', 'sale', 'salary', 'service'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveFrom: {
    type: Date,
    required: [true, 'تاريخ البدء مطلوب'],
    default: Date.now,
  },
  effectiveTo: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

TaxSettingSchema.index({ taxType: 1, code: 1, isActive: 1 });

export default models.TaxSetting || model<ITaxSetting>('TaxSetting', TaxSettingSchema);