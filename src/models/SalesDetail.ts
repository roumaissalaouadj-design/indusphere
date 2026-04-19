// src/models/SalesDetail.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ISalesDetail extends Document {
  invoiceId: Types.ObjectId;
  productType: 'cement' | 'clinker';
  cementType?: 'CEM_I' | 'CEM_II' | 'CEM_III' | 'CEM_IV' | 'CEM_V';
  strengthClass?: '32.5' | '42.5' | '52.5';
  quantity: number;
  unitPrice: number;
  total: number;
}

// دالة مساعدة للتحقق من نوع المنتج
const isCement = (productType: string): boolean => {
  return productType === 'cement';
};

const SalesDetailSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: [true, 'رقم الفاتورة مطلوب'],
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
  total: {
    type: Number,
    required: true,
    default: 0,
  },
});

SalesDetailSchema.pre('save', function() {
  this.total = this.quantity * this.unitPrice;
});

SalesDetailSchema.index({ invoiceId: 1 });

export default models.SalesDetail || model<ISalesDetail>('SalesDetail', SalesDetailSchema);