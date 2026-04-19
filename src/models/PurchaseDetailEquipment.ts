// src/models/PurchaseDetailEquipment.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IPurchaseDetailEquipment extends Document {
  invoiceId: Types.ObjectId;
  equipmentType: 'spare_part' | 'equipment' | 'machine';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  warrantyEnd?: Date;
  assetId?: Types.ObjectId;
}

export const equipmentTypeLabels = {
  spare_part: 'قطع غيار',
  equipment: 'معدات',
  machine: 'آلات جديدة'
};

const PurchaseDetailEquipmentSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseInvoice',
    required: [true, 'رقم الفاتورة مطلوب'],
  },
  equipmentType: {
    type: String,
    enum: ['spare_part', 'equipment', 'machine'],
    required: [true, 'نوع التجهيز مطلوب'],
  },
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: [true, 'سعر الوحدة مطلوب'],
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  warrantyEnd: {
    type: Date,
    required: function(this: { equipmentType: string }) {
      return this.equipmentType !== 'spare_part';
    },
  },
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: function(this: { equipmentType: string }) {
      return this.equipmentType !== 'spare_part';
    },
  },
}, {
  timestamps: true,
});

// حساب المجموع تلقائياً
PurchaseDetailEquipmentSchema.pre('save', function() {
  this.total = (this.quantity || 0) * (this.unitPrice || 0);
});

// إضافة فهارس
PurchaseDetailEquipmentSchema.index({ invoiceId: 1, equipmentType: 1 });
PurchaseDetailEquipmentSchema.index({ assetId: 1 });

export default models.PurchaseDetailEquipment || 
  model<IPurchaseDetailEquipment>('PurchaseDetailEquipment', PurchaseDetailEquipmentSchema);