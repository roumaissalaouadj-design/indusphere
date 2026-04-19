// src/models/Employee.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmployee extends Document {
  tenantId: Types.ObjectId;
  employeeCode: string;
  fullName: string;
  email?: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive';
  phone?: string;
  // ✅ حقول جديدة للرواتب
  bankAccount?: string;        // الحساب البنكي
  socialSecurityNumber?: string; // رقم الضمان الاجتماعي
  taxNumber?: string;          // الرقم الضريبي
}

const EmployeeSchema = new Schema<IEmployee>({
  tenantId:     { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeCode: { type: String, required: true },
  fullName:     { type: String, required: true },
  email:        { type: String },
  position:     { type: String, required: true },
  department:   { type: String, required: true },
  salary:       { type: Number, default: 0 },
  hireDate:     { type: Date, required: true },
  status:       { type: String, enum: ['active', 'inactive'], default: 'active' },
  phone:        { type: String },
  // ✅ الحقول الجديدة
  bankAccount:        { type: String, default: '' },
  socialSecurityNumber: { type: String, default: '' },
  taxNumber:          { type: String, default: '' },
}, { timestamps: true });

EmployeeSchema.index({ tenantId: 1, employeeCode: 1 }, { unique: true });

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>('Employee', EmployeeSchema);