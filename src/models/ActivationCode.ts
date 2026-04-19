import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IActivationCode extends Document {
  code: string
  modules: ('cmms' | 'erp')[]
  expiresAt: Date
  usedBy?: Types.ObjectId
  usedAt?: Date
  isUsed: boolean
  factoryName?: string
}

const ActivationCodeSchema = new Schema<IActivationCode>({
  code:        { type: String, required: true, unique: true },
  modules:     [{ type: String, enum: ['cmms', 'erp'] }],
  expiresAt:   { type: Date, required: true },
  usedBy:      { type: Schema.Types.ObjectId, ref: 'User' },
  usedAt:      { type: Date },
  isUsed:      { type: Boolean, default: false },
  factoryName: { type: String },
}, { timestamps: true })

export default mongoose.models.ActivationCode ||
  mongoose.model<IActivationCode>('ActivationCode', ActivationCodeSchema)