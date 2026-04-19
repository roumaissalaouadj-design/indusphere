import mongoose, { Schema, Document, Types } from 'mongoose'

export interface INotification extends Document {
  tenantId: Types.ObjectId
  userId: Types.ObjectId
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'critical' | 'high'
  category: 'maintenance' | 'work_order' | 'inventory' | 'system' | 'alert' | 'failure_prediction'
  isRead: boolean
  readAt?: Date
  link?: string
  assetId?: Types.ObjectId
  assetName?: string
  riskPercentage?: number
  metadata?: {
    workOrderId?: string
    assetId?: string
    requestId?: string
    [key: string]: unknown
  }
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'critical', 'high'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['maintenance', 'work_order', 'inventory', 'system', 'alert', 'failure_prediction'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: { type: Date },
    link: { type: String },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
    assetName: { type: String },
    riskPercentage: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ tenantId: 1, createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)