import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IWorkOrder extends Document {
  tenantId: Types.ObjectId
  assetId: Types.ObjectId
  title: string
  description: string
  type: 'corrective' | 'preventive'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'acknowledged' | 'in-progress' | 'done' | 'cancelled'
  assignedTo?: Types.ObjectId  // المكلف بالتنفيذ (من نموذج Employee)
  assignedBy?: Types.ObjectId  // الذي قام بالتكليف (من نموذج User)
  assignedAt?: Date
  acknowledgedAt?: Date
  startDate?: Date
  endDate?: Date
  completedAt?: Date
  qualityRating?: number
  qualityNotes?: string
  notes?: string
}

const WorkOrderSchema = new Schema<IWorkOrder>({
  tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId:     { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  type:        { type: String, enum: ['corrective', 'preventive'], required: true },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status:      { 
    type: String, 
    enum: ['open', 'assigned', 'acknowledged', 'in-progress', 'done', 'cancelled'], 
    default: 'open' 
  },
  assignedTo:  { type: Schema.Types.ObjectId, ref: 'Employee' },  // ✅ تغيير من User إلى Employee
  assignedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt:  { type: Date },
  acknowledgedAt: { type: Date },
  startDate:   { type: Date },
  endDate:     { type: Date },
  completedAt: { type: Date },
  qualityRating: { type: Number, min: 1, max: 5 },
  qualityNotes: { type: String },
  notes:       { type: String },
}, { timestamps: true })

WorkOrderSchema.index({ assignedTo: 1, status: 1 })
WorkOrderSchema.index({ priority: 1, status: 1 })

export default mongoose.models.WorkOrder ||
  mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema)