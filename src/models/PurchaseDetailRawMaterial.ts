// src/models/PurchaseDetailRawMaterial.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IPurchaseDetailRawMaterial extends Document {
  invoiceId: Types.ObjectId;
  materialType: 'limestone' | 'clay' | 'gypsum' | 'iron_ore' | 'fly_ash';
  quantity: number;
  unitPrice: number;
  total: number;
}

export const materialTypeLabels = {
  limestone: 'حجر جيري',
  clay: 'طين',
  gypsum: 'جبس',
  iron_ore: 'خام حديد',
  fly_ash: 'رماد متطاير'
};

const PurchaseDetailRawMaterialSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseInvoice',
    required: [true, 'رقم الفاتورة مطلوب'],
  },
  materialType: {
    type: String,
    enum: ['limestone', 'clay', 'gypsum', 'iron_ore', 'fly_ash'],
    required: [true, 'نوع المادة مطلوب'],
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
  total: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

// حساب المجموع تلقائياً
PurchaseDetailRawMaterialSchema.pre('save', function() {
  this.total = (this.quantity || 0) * (this.unitPrice || 0);
});

// إضافة فهارس
PurchaseDetailRawMaterialSchema.index({ invoiceId: 1, materialType: 1 });

export default models.PurchaseDetailRawMaterial || 
  model<IPurchaseDetailRawMaterial>('PurchaseDetailRawMaterial', PurchaseDetailRawMaterialSchema);