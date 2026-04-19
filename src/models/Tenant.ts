import mongoose, { Schema, Document } from 'mongoose'

export interface ITenant extends Document {
  name: string
  slug: string
  location: string
  status: 'active' | 'suspended'
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
}

const TenantSchema = new Schema<ITenant>({
  name:     { type: String, required: true },
  slug:     { type: String, required: true, unique: true, lowercase: true },
  location: { type: String },
  status:   { type: String, enum: ['active', 'suspended'], default: 'active' },
  plan:     { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
}, { timestamps: true })

export default mongoose.models.Tenant ||
  mongoose.model<ITenant>('Tenant', TenantSchema)