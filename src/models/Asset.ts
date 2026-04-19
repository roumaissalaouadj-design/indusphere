import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAsset extends Omit<Document, 'model'> {
  tenantId: Types.ObjectId
  assetCode: string
  name: string
  category: string
  type: string
  location: string
  status: 'operational' | 'maintenance' | 'inactive' | 'retired'
  manufacturer?: string
  model?: string
  purchaseDate?: Date
  purchasePrice?: number
  lastMaintenance?: Date
  notes?: string
}

const AssetSchema = new Schema<IAsset>({
  tenantId:        { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetCode:       { type: String, required: true },
  name:            { type: String, required: true },
  category:        { type: String, required: true },
  type:            { type: String, required: true },
  location:        { type: String, required: true },
  status:          { type: String, enum: ['operational', 'maintenance', 'inactive', 'retired'], default: 'operational' },
  manufacturer:    { type: String },
  model:           { type: String },
  purchaseDate:    { type: Date },
  purchasePrice:   { type: Number },
  lastMaintenance: { type: Date },
  notes:           { type: String },
}, { timestamps: true })

AssetSchema.index({ tenantId: 1, assetCode: 1 }, { unique: true })

export default mongoose.models.Asset ||
  mongoose.model<IAsset>('Asset', AssetSchema)