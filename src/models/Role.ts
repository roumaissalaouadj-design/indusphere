import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRole extends Document {
  tenantId: Types.ObjectId
  name: string
  permissions: string[]
  isDefault: boolean
}

const RoleSchema = new Schema<IRole>({
  tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name:        { type: String, required: true },
  permissions: [{ type: String }],
  isDefault:   { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Role ||
  mongoose.model<IRole>('Role', RoleSchema)