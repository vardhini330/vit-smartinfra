import mongoose from 'mongoose';

const CONDITION_WEIGHTS = { Good: 1, Moderate: 2, Poor: 3 };

function computePriorityScore(condition, complaintCount) {
  const w = CONDITION_WEIGHTS[condition] ?? 2;
  return w + complaintCount * 2;
}

function scoreToLevel(score) {
  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['Road', 'Bridge', 'Streetlight', 'Water Supply', 'Hospital'] },
  location: { type: String, required: true },
  zone: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  condition: { type: String, required: true, enum: ['Good', 'Moderate', 'Poor'] },
  lastMaintenanceDate: { type: Date },
  status: { type: String, required: true, enum: ['Active', 'Under Maintenance', 'Closed'] },
  complaintCount: { type: Number, default: 0 },
  priorityLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  priorityScore: { type: Number, default: 0 },
}, { timestamps: true });

assetSchema.pre('save', function (next) {
  this.priorityScore = computePriorityScore(this.condition, this.complaintCount);
  this.priorityLevel = scoreToLevel(this.priorityScore);
  next();
});

assetSchema.statics.computePriority = function (condition, complaintCount) {
  const score = computePriorityScore(condition, complaintCount);
  return { priorityScore: score, priorityLevel: scoreToLevel(score) };
};

export default mongoose.model('InfrastructureAsset', assetSchema);
