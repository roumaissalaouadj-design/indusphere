// src/models/SalaryStructure.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface ISalaryStructure extends Document {
  employeeId: Types.ObjectId;
  effectiveFrom: Date;
  effectiveTo?: Date;
  baseSalary: number;
  allowances: {
    housing: number;
    transport: number;
    food: number;
    seniority: number;
    responsibility: number;
    other: number;
  };
  bonuses: {
    performance: number;
    attendance: number;
    production: number;
    other: number;
  };
  deductions: {
    socialSecurity: number;
    tax: number;
    loan: number;
    insurance: number;
    other: number;
  };
  totalAllowances: number;
  totalBonuses: number;
  totalDeductions: number;
  netSalary: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AllowancesType {
  housing: number;
  transport: number;
  food: number;
  seniority: number;
  responsibility: number;
  other: number;
}

interface BonusesType {
  performance: number;
  attendance: number;
  production: number;
  other: number;
}

interface DeductionsType {
  socialSecurity: number;
  tax: number;
  loan: number;
  insurance: number;
  other: number;
}

const defaultAllowances: AllowancesType = {
  housing: 0,
  transport: 0,
  food: 0,
  seniority: 0,
  responsibility: 0,
  other: 0,
};

const defaultBonuses: BonusesType = {
  performance: 0,
  attendance: 0,
  production: 0,
  other: 0,
};

const defaultDeductions: DeductionsType = {
  socialSecurity: 0,
  tax: 0,
  loan: 0,
  insurance: 0,
  other: 0,
};

const SalaryStructureSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',  // ✅ تم التصحيح: استخدام Employee بدلاً من PayrollEmployee
    required: [true, 'الموظف مطلوب'],
  },
  effectiveFrom: {
    type: Date,
    required: [true, 'تاريخ البدء مطلوب'],
    default: Date.now,
  },
  effectiveTo: {
    type: Date,
    default: null,
  },
  baseSalary: {
    type: Number,
    required: [true, 'الراتب الأساسي مطلوب'],
    min: 0,
  },
  allowances: {
    housing: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    seniority: { type: Number, default: 0 },
    responsibility: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  bonuses: {
    performance: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    production: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  deductions: {
    socialSecurity: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  totalAllowances: { type: Number, default: 0 },
  totalBonuses: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// دالة مساعدة للحصول على القيم مع التعامل مع null/undefined
const safeValue = (value: number | undefined | null): number => {
  return value ?? 0;
};

// دالة مساعدة للحصول على البدلات مع التعامل مع null/undefined
const getAllowances = (doc: {
  allowances?: AllowancesType | null;
}): AllowancesType => {
  const allowances = doc.allowances || defaultAllowances;
  return {
    housing: safeValue(allowances.housing),
    transport: safeValue(allowances.transport),
    food: safeValue(allowances.food),
    seniority: safeValue(allowances.seniority),
    responsibility: safeValue(allowances.responsibility),
    other: safeValue(allowances.other),
  };
};

// دالة مساعدة للحصول على المكافآت مع التعامل مع null/undefined
const getBonuses = (doc: {
  bonuses?: BonusesType | null;
}): BonusesType => {
  const bonuses = doc.bonuses || defaultBonuses;
  return {
    performance: safeValue(bonuses.performance),
    attendance: safeValue(bonuses.attendance),
    production: safeValue(bonuses.production),
    other: safeValue(bonuses.other),
  };
};

// دالة مساعدة للحصول على الاستقطاعات مع التعامل مع null/undefined
const getDeductions = (doc: {
  deductions?: DeductionsType | null;
}): DeductionsType => {
  const deductions = doc.deductions || defaultDeductions;
  return {
    socialSecurity: safeValue(deductions.socialSecurity),
    tax: safeValue(deductions.tax),
    loan: safeValue(deductions.loan),
    insurance: safeValue(deductions.insurance),
    other: safeValue(deductions.other),
  };
};

// حساب الإجماليات تلقائياً
SalaryStructureSchema.pre('save', function() {
  const allowances = getAllowances(this);
  const bonuses = getBonuses(this);
  const deductions = getDeductions(this);
  
  this.totalAllowances = allowances.housing + allowances.transport + allowances.food + 
                         allowances.seniority + allowances.responsibility + allowances.other;
  
  this.totalBonuses = bonuses.performance + bonuses.attendance + bonuses.production + bonuses.other;
  
  this.totalDeductions = deductions.socialSecurity + deductions.tax + deductions.loan + 
                         deductions.insurance + deductions.other;
  
  const grossSalary = (this.baseSalary || 0) + this.totalAllowances + this.totalBonuses;
  this.netSalary = grossSalary - this.totalDeductions;
});

SalaryStructureSchema.index({ employeeId: 1, effectiveFrom: 1 });

export default models.SalaryStructure || model<ISalaryStructure>('SalaryStructure', SalaryStructureSchema);