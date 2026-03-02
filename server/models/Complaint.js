import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfrastructureAsset', required: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  photos: [{ type: String }],
  voiceNoteUrl: { type: String },
  feedback: {
    rating: { type: Number },
    comment: { type: String },
    submittedAt: { type: Date },
  },
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
