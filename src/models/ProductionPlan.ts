import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProductionPlan extends Document {
  tenantId: Types.ObjectId
  product: string
  targetQuantity: number
  actualQuantity: number
  unit: string
  startDate: Date
  endDate: Date
  status: 'planned' | 'in-progress' | 'done' | 'cancelled'
  notes?: string
}

const ProductionPlanSchema = new Schema<IProductionPlan>({
  tenantId:        { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  product:         { type: String, required: true },
  targetQuantity:  { type: Number, required: true },
  actualQuantity:  { type: Number, default: 0 },
  unit:            { type: String, default: 'طن' },
  startDate:       { type: Date, required: true },
  endDate:         { type: Date, required: true },
  status:          { type: String, enum: ['planned', 'in-progress', 'done', 'cancelled'], default: 'planned' },
  notes:           { type: String },
}, { timestamps: true })

export default mongoose.models.ProductionPlan ||
  mongoose.model<IProductionPlan>('ProductionPlan', ProductionPlanSchema)