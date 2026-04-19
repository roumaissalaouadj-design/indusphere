import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISparePart extends Document {
  tenantId: Types.ObjectId;
  partCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;        // ✅ هذا هو الحقل الصحيح
  unitPrice: number;
  supplier?: string;
  location?: string;
  unit?: string;           // ✅ أضف هذا الحقل
  description?: string;    // ✅ أضف هذا الحقل
}

const SparePartSchema = new Schema<ISparePart>({
  tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  partCode:   { type: String, required: true },
  name:       { type: String, required: true },
  category:   { type: String },
  quantity:   { type: Number, required: true, default: 0 },
  minStock:   { type: Number, default: 5 },
  unitPrice:  { type: Number, default: 0 },
  supplier:   { type: String },
  location:   { type: String },
  unit:       { type: String, default: 'قطعة' },        // ✅ أضيف
  description:{ type: String, default: '' },            // ✅ أضيف
}, { timestamps: true });

SparePartSchema.index({ tenantId: 1, partCode: 1 }, { unique: true });

export default mongoose.models.SparePart ||
  mongoose.model<ISparePart>('SparePart', SparePartSchema);