// src/models/PurchaseOrder.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseOrder extends Document {
  tenantId: Types.ObjectId;
  poNumber: string;
  supplier: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'delivered' | 'cancelled';  // ✅ أضف 'sent' و 'delivered'
  orderDate: Date;
  expectedDate?: Date;
  notes?: string;  // ✅ أضف notes
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  tenantId:     { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  poNumber:     { type: String, required: true },
  supplier:     { type: String, required: true },
  items:        [{ name: String, quantity: Number, unitPrice: Number }],
  totalAmount:  { type: Number, default: 0 },
  status:       { type: String, enum: ['draft', 'sent', 'approved', 'delivered', 'cancelled'], default: 'draft' },  // ✅ أضف القيم الجديدة
  orderDate:    { type: Date, required: true },
  expectedDate: { type: Date },
  notes:        { type: String, default: '' },  // ✅ أضف notes
}, { timestamps: true });

export default mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);