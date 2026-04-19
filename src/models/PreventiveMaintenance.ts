import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPreventiveMaintenance extends Document {
  tenantId: Types.ObjectId
  assetId: Types.ObjectId
  taskCode: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  lastCompleted?: Date
  nextDueDate: Date  // تأكد من أن الاسم مطابق
  assignedTo?: Types.ObjectId
  status: 'active' | 'inactive' | 'overdue'
}

const PreventiveMaintenanceSchema = new Schema<IPreventiveMaintenance>({
  tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId:     { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  taskCode:    { type: String, required: true },
  title:       { type: String, required: true },
  description: { type: String },
  frequency:   { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true },
  lastCompleted:{ type: Date },
  nextDueDate: { type: Date, required: true },  // استخدام nextDueDate بدلاً من nextDue
  assignedTo:  { type: Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['active', 'inactive', 'overdue'], default: 'active' },
}, { timestamps: true })

// إضافة index لتحسين الأداء
PreventiveMaintenanceSchema.index({ tenantId: 1, nextDueDate: 1 })
PreventiveMaintenanceSchema.index({ assetId: 1, status: 1 })

export default mongoose.models.PreventiveMaintenance ||
  mongoose.model<IPreventiveMaintenance>('PreventiveMaintenance', PreventiveMaintenanceSchema)