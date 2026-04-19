// src/models/PurchaseDetailService.ts
import { Schema, model, models, Types } from 'mongoose';
import type { Document } from 'mongoose';

export interface IPurchaseDetailService extends Document {
  invoiceId: Types.ObjectId;
  serviceType: 'electricity' | 'water' | 'gas' | 'transport' | 'maintenance';
  oldReading?: number;
  newReading?: number;
  consumption?: number;
  unitPrice: number;
  quantity: number;
  total: number;
  referenceId?: Types.ObjectId;
}

export const serviceTypeLabels = {
  electricity: 'كهرباء',
  water: 'ماء',
  gas: 'غاز',
  transport: 'نقل',
  maintenance: 'صيانة'
};

// دالة مساعدة للتحقق من نوع الخدمة التي تحتاج قراءات
const isMeteredService = (serviceType: string): boolean => {
  return ['electricity', 'water', 'gas'].includes(serviceType);
};

const PurchaseDetailServiceSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseInvoice',
    required: [true, 'رقم الفاتورة مطلوب'],
  },
  serviceType: {
    type: String,
    enum: ['electricity', 'water', 'gas', 'transport', 'maintenance'],
    required: [true, 'نوع الخدمة مطلوب'],
  },
  oldReading: {
    type: Number,
    required: function(this: { serviceType: string }) {
      return isMeteredService(this.serviceType);
    },
    min: 0,
  },
  newReading: {
    type: Number,
    required: function(this: { serviceType: string }) {
      return isMeteredService(this.serviceType);
    },
    min: 0,
  },
  consumption: {
    type: Number,
    default: 0,
  },
  unitPrice: {
    type: Number,
    required: [true, 'سعر الوحدة مطلوب'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: function(this: { serviceType: string }) {
      return this.serviceType === 'maintenance';
    },
  },
}, {
  timestamps: true,
});

// حساب الاستهلاك والمجموع تلقائياً
PurchaseDetailServiceSchema.pre('save', function() {
  // التحقق من وجود القراءات قبل الحساب
  if (this.oldReading !== undefined && 
      this.oldReading !== null && 
      this.newReading !== undefined && 
      this.newReading !== null) {
    
    // حساب الاستهلاك
    this.consumption = this.newReading - this.oldReading;
    
    // التأكد من أن الاستهلاك موجب
    if (this.consumption < 0) {
      throw new Error('القراءة الجديدة يجب أن تكون أكبر من القديمة');
    }
    
    // تعيين الكمية كاستهلاك
    this.quantity = this.consumption;
  }
  
  // حساب المجموع الكلي
  this.total = (this.quantity || 0) * (this.unitPrice || 0);
});

// إضافة فهارس للبحث السريع
PurchaseDetailServiceSchema.index({ invoiceId: 1, serviceType: 1 });
PurchaseDetailServiceSchema.index({ referenceId: 1 });

export default models.PurchaseDetailService || 
  model<IPurchaseDetailService>('PurchaseDetailService', PurchaseDetailServiceSchema);