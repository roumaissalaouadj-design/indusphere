// src/models/ProductPrice.ts
import { Schema, model, models } from 'mongoose';
import type { Document } from 'mongoose';

export interface IProductPrice extends Document {
  productType: 'cement' | 'clinker';
  cementType?: 'CEM_I' | 'CEM_II' | 'CEM_III' | 'CEM_IV' | 'CEM_V';
  strengthClass?: '32.5' | '42.5' | '52.5';
  minQuantity: number;
  maxQuantity: number;
  price: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// دالة مساعدة للتحقق من نوع المنتج
const isCement = (productType: string): boolean => {
  return productType === 'cement';
};

const ProductPriceSchema = new Schema({
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
  minQuantity: {
    type: Number,
    required: [true, 'الحد الأدنى للكمية مطلوب'],
    min: 0,
  },
  maxQuantity: {
    type: Number,
    required: [true, 'الحد الأقصى للكمية مطلوب'],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now,
  },
  effectiveTo: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

ProductPriceSchema.index({ productType: 1, cementType: 1, strengthClass: 1, minQuantity: 1 });

export default models.ProductPrice || model<IProductPrice>('ProductPrice', ProductPriceSchema);