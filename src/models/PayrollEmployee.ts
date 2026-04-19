// src/models/PayrollEmployee.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IPayrollEmployee extends Document {
  employeeId: Types.ObjectId;  // ✅ مرجع إلى جدول الموظفين
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  hireDate: Date;
  baseSalary: number;
  bankAccount: string;
  socialSecurityNumber: string;
  taxRegistrationNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollEmployeeSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  employeeCode: {
    type: String,
    required: [true, 'رمز الموظف مطلوب'],
    unique: true,
  },
  employeeName: {
    type: String,
    required: [true, 'اسم الموظف مطلوب'],
  },
  department: {
    type: String,
    required: [true, 'القسم مطلوب'],
  },
  position: {
    type: String,
    required: [true, 'المنصب مطلوب'],
  },
  hireDate: {
    type: Date,
    required: [true, 'تاريخ التوظيف مطلوب'],
  },
  baseSalary: {
    type: Number,
    required: [true, 'الراتب الأساسي مطلوب'],
    min: 0,
  },
  bankAccount: {
    type: String,
    required: [true, 'الحساب البنكي مطلوب'],
  },
  socialSecurityNumber: {
    type: String,
    required: [true, 'رقم الضمان الاجتماعي مطلوب'],
  },
  taxRegistrationNumber: {
    type: String,
    required: [true, 'الرقم الضريبي مطلوب'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

PayrollEmployeeSchema.index({ employeeCode: 1, department: 1, position: 1 });

export default models.PayrollEmployee || model<IPayrollEmployee>('PayrollEmployee', PayrollEmployeeSchema);