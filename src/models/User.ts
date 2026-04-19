import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IUser extends Document {
  tenantId: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  roleId: Types.ObjectId
  isActive: boolean
  position: string
  specialization: string
  phoneNumber?: string
  rating: number
  tasksCompleted: number
  totalRating: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  tenantId:     { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  roleId:       { type: Schema.Types.ObjectId, ref: 'Role' },
  isActive:     { type: Boolean, default: false },  // ← تم التغيير: false بدلاً من true
  position:     { type: String, default: 'موظف' },
  specialization: { type: String, default: '' },
  phoneNumber:  { type: String },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  tasksCompleted: { type: Number, default: 0 },
  totalRating:  { type: Number, default: 0 },
}, { timestamps: true })

// Indexes
UserSchema.index({ position: 1, specialization: 1 })
UserSchema.index({ rating: -1 })

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema)