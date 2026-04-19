// src/models/CostAllocation.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ICostAllocation extends Document {
  productionCostId: Types.ObjectId;
  costType: 'raw_materials' | 'energy' | 'labor' | 'maintenance' | 'other';
  category: string;
  amount: number;
  percentage: number;
  notes: string;
  createdAt: Date;
}

const CostAllocationSchema = new Schema({
  productionCostId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductionCost',
    required: true,
  },
  costType: {
    type: String,
    enum: ['raw_materials', 'energy', 'labor', 'maintenance', 'other'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

CostAllocationSchema.index({ productionCostId: 1, costType: 1 });

export default models.CostAllocation || model<ICostAllocation>('CostAllocation', CostAllocationSchema);