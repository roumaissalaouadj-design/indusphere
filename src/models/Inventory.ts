// src/models/Inventory.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInventory extends Document {
  tenantId: Types.ObjectId;
  itemCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;      // ✅ هذا هو الحقل الصحيح
  unitPrice: number;
  unit: string;
  location?: string;
  description?: string;  // ✅ أضف هذا الحقل
}

const InventorySchema = new Schema<IInventory>({
  tenantId:  { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  itemCode:  { type: String, required: true },
  name:      { type: String, required: true },
  category:  { type: String },
  quantity:  { type: Number, default: 0 },
  minStock:  { type: Number, default: 10 },
  unitPrice: { type: Number, default: 0 },
  unit:      { type: String, default: 'وحدة' },
  location:  { type: String },
  description: { type: String, default: '' },  // ✅ أضيف
}, { timestamps: true });

InventorySchema.index({ tenantId: 1, itemCode: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model<IInventory>('Inventory', InventorySchema);