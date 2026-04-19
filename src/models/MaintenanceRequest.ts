import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMaintenanceRequest extends Document {
  tenantId: Types.ObjectId
  assetId: Types.ObjectId
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed' | 'converted'
  requestedBy: Types.ObjectId
  approvedBy?: Types.ObjectId
  assignedTo?: Types.ObjectId
  workOrderId?: Types.ObjectId
  date?: Date
  notes?: string
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>({
  tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId:     { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'converted'], default: 'pending' },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo:  { type: Schema.Types.ObjectId, ref: 'User' },
  workOrderId: { type: Schema.Types.ObjectId, ref: 'WorkOrder' },
  date:        { type: Date, default: Date.now },
  notes:       { type: String },
}, { timestamps: true })

export default mongoose.models.MaintenanceRequest ||
  mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema)