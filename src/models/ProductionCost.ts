// src/models/ProductionCost.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IProductionCost extends Document {
  period: string;
  startDate: Date;
  endDate: Date;
  totalProduction: number;
  
  // تكاليف المواد الخام
  rawMaterialsCost: number;
  limestoneCost: number;
  clayCost: number;
  gypsumCost: number;
  ironOreCost: number;
  flyAshCost: number;
  
  // تكاليف الطاقة
  energyCost: number;
  electricityCost: number;
  fuelCost: number;
  gasCost: number;
  
  // تكاليف العمالة
  laborCost: number;
  directLabor: number;
  indirectLabor: number;
  
  // تكاليف الصيانة
  maintenanceCost: number;
  preventiveMaintenance: number;
  correctiveMaintenance: number;
  
  // تكاليف أخرى
  otherCosts: number;
  transportCost: number;
  adminCost: number;
  
  // إجمالي التكاليف
  totalCost: number;
  costPerTon: number;
  
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionCostSchema = new Schema({
  period: {
    type: String,
    required: [true, 'الفترة مطلوبة'],
    unique: true,
  },
  startDate: {
    type: Date,
    required: [true, 'تاريخ البداية مطلوب'],
  },
  endDate: {
    type: Date,
    required: [true, 'تاريخ النهاية مطلوب'],
  },
  totalProduction: {
    type: Number,
    required: [true, 'إجمالي الإنتاج مطلوب'],
    min: 0,
  },
  
  // تكاليف المواد الخام
  rawMaterialsCost: { type: Number, default: 0 },
  limestoneCost: { type: Number, default: 0 },
  clayCost: { type: Number, default: 0 },
  gypsumCost: { type: Number, default: 0 },
  ironOreCost: { type: Number, default: 0 },
  flyAshCost: { type: Number, default: 0 },
  
  // تكاليف الطاقة
  energyCost: { type: Number, default: 0 },
  electricityCost: { type: Number, default: 0 },
  fuelCost: { type: Number, default: 0 },
  gasCost: { type: Number, default: 0 },
  
  // تكاليف العمالة
  laborCost: { type: Number, default: 0 },
  directLabor: { type: Number, default: 0 },
  indirectLabor: { type: Number, default: 0 },
  
  // تكاليف الصيانة
  maintenanceCost: { type: Number, default: 0 },
  preventiveMaintenance: { type: Number, default: 0 },
  correctiveMaintenance: { type: Number, default: 0 },
  
  // تكاليف أخرى
  otherCosts: { type: Number, default: 0 },
  transportCost: { type: Number, default: 0 },
  adminCost: { type: Number, default: 0 },
  
  totalCost: { type: Number, default: 0 },
  costPerTon: { type: Number, default: 0 },
  
  notes: { type: String, default: '' },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// حساب إجمالي التكاليف وتكلفة الطن تلقائياً
ProductionCostSchema.pre('save', function() {
  // حساب إجمالي المواد الخام
  this.rawMaterialsCost = (this.limestoneCost || 0) + (this.clayCost || 0) + 
                           (this.gypsumCost || 0) + (this.ironOreCost || 0) + 
                           (this.flyAshCost || 0);
  
  // حساب إجمالي الطاقة
  this.energyCost = (this.electricityCost || 0) + (this.fuelCost || 0) + (this.gasCost || 0);
  
  // حساب إجمالي العمالة
  this.laborCost = (this.directLabor || 0) + (this.indirectLabor || 0);
  
  // حساب إجمالي الصيانة
  this.maintenanceCost = (this.preventiveMaintenance || 0) + (this.correctiveMaintenance || 0);
  
  // حساب إجمالي التكاليف
  this.totalCost = (this.rawMaterialsCost || 0) + (this.energyCost || 0) + 
                   (this.laborCost || 0) + (this.maintenanceCost || 0) + 
                   (this.otherCosts || 0);
  
  // حساب تكلفة الطن
  if (this.totalProduction > 0) {
    this.costPerTon = this.totalCost / this.totalProduction;
  } else {
    this.costPerTon = 0;
  }
});

ProductionCostSchema.index({ period: 1, startDate: 1, endDate: 1 });

export default models.ProductionCost || model<IProductionCost>('ProductionCost', ProductionCostSchema);