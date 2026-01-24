import mongoose, { Schema, Document, Model } from 'mongoose';
import { IORSPlan, ORSStatus, IORSScores, ITextDocumentation } from '../types';

export interface IORSPlanDocument extends Omit<IORSPlan, '_id'>, Document {}

const ScoresSchema = new Schema<IORSScores>(
  {
    engine: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    brakes: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    tires: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    transmission: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    electrical: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    suspension: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    steering: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    bodyExterior: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    interior: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    safetyEquipment: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
  },
  { _id: false }
);

const TextDocumentationSchema = new Schema<ITextDocumentation>(
  {
    engineNotes: { type: String, trim: true, maxlength: 500 },
    brakesNotes: { type: String, trim: true, maxlength: 500 },
    tiresNotes: { type: String, trim: true, maxlength: 500 },
    transmissionNotes: { type: String, trim: true, maxlength: 500 },
    electricalNotes: { type: String, trim: true, maxlength: 500 },
    suspensionNotes: { type: String, trim: true, maxlength: 500 },
    steeringNotes: { type: String, trim: true, maxlength: 500 },
    bodyExteriorNotes: { type: String, trim: true, maxlength: 500 },
    interiorNotes: { type: String, trim: true, maxlength: 500 },
    safetyEquipmentNotes: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const ORSPlanSchema = new Schema<IORSPlanDocument>(
  {
    vehicleId: {
      type: String,
      required: [true, 'Vehicle ID is required'],
      trim: true,
      minlength: [2, 'Vehicle ID must be at least 2 characters'],
      maxlength: [50, 'Vehicle ID cannot exceed 50 characters'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
      enum: {
        values: ['Truck', 'Van', 'Bus', 'Car', 'Motorcycle', 'Trailer', 'Heavy Equipment', 'Other'],
        message: '{VALUE} is not a valid vehicle type',
      },
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
    },
    nextInspectionDate: {
      type: Date,
      required: [true, 'Next inspection date is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['draft', 'active', 'completed', 'archived'] as ORSStatus[],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
    },
    scores: {
      type: ScoresSchema,
      required: [true, 'Scores are required'],
    },
    overallScore: {
      type: Number,
      min: [0, 'Overall score cannot be less than 0'],
      max: [100, 'Overall score cannot exceed 100'],
    },
    textDocumentation: {
      type: TextDocumentationSchema,
      default: {},
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate overall score before saving
ORSPlanSchema.pre('save', function (next) {
  if (this.scores) {
    const scores = this.scores;
    const total =
      scores.engine +
      scores.brakes +
      scores.tires +
      scores.transmission +
      scores.electrical +
      scores.suspension +
      scores.steering +
      scores.bodyExterior +
      scores.interior +
      scores.safetyEquipment;
    this.overallScore = Math.round(total / 10);
  }
  next();
});

// Indexes for faster queries
ORSPlanSchema.index({ vehicleId: 'text', vehicleType: 'text' });
ORSPlanSchema.index({ overallScore: 1 });
ORSPlanSchema.index({ status: 1 });
ORSPlanSchema.index({ inspectionDate: 1 });
ORSPlanSchema.index({ createdAt: -1 });
ORSPlanSchema.index({ createdBy: 1 });
ORSPlanSchema.index({ assignedTo: 1 });

const ORSPlan: Model<IORSPlanDocument> = mongoose.model<IORSPlanDocument>('ORSPlan', ORSPlanSchema);

export default ORSPlan;
