// src/models/EmployeeEvaluation.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmployeeEvaluation extends Document {
  tenantId: Types.ObjectId;
  employeeId: Types.ObjectId;
  evaluatorId: Types.ObjectId;
  department: string;
  evaluationDate: Date;
  period: string;
  
  objectivesScore: number;
  objectivesComment: string;
  
  clientOrientationScore: number;
  clientOrientationComment: string;
  
  collaborationScore: number;
  collaborationComment: string;
  
  leadershipScore: number;
  leadershipComment: string;
  
  totalScore: number;
  averageScore: number;
  rating: string;
  
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  
  status: string;
}

const EmployeeEvaluationSchema = new Schema<IEmployeeEvaluation>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  evaluatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  evaluationDate: { type: Date, default: Date.now },
  period: { type: String, required: true },
  
  objectivesScore: { type: Number, default: 0, min: 0, max: 100 },
  objectivesComment: { type: String, default: '' },
  
  clientOrientationScore: { type: Number, default: 0, min: 0, max: 100 },
  clientOrientationComment: { type: String, default: '' },
  
  collaborationScore: { type: Number, default: 0, min: 0, max: 100 },
  collaborationComment: { type: String, default: '' },
  
  leadershipScore: { type: Number, default: 0, min: 0, max: 100 },
  leadershipComment: { type: String, default: '' },
  
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  rating: { type: String, default: 'satisfactory' },
  
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  recommendations: [{ type: String }],
  
  status: { type: String, default: 'submitted' },
}, { timestamps: true });

// دالة لحساب المجموع والمتوسط قبل الحفظ (بدون next)
EmployeeEvaluationSchema.pre('save', function() {
  this.totalScore = (this.objectivesScore + this.clientOrientationScore + 
                     this.collaborationScore + this.leadershipScore);
  this.averageScore = this.totalScore / 4;
  
  const avg = this.averageScore;
  if (avg >= 90) this.rating = 'excellent';
  else if (avg >= 75) this.rating = 'very_good';
  else if (avg >= 60) this.rating = 'good';
  else if (avg >= 50) this.rating = 'satisfactory';
  else this.rating = 'needs_improvement';
});

export default mongoose.models.EmployeeEvaluation ||
  mongoose.model<IEmployeeEvaluation>('EmployeeEvaluation', EmployeeEvaluationSchema);