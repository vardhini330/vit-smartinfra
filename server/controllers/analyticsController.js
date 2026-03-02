import InfrastructureAsset from '../models/InfrastructureAsset.js';
import Complaint from '../models/Complaint.js';

export async function dashboard(req, res, next) {
  try {
    const [assets, complaints] = await Promise.all([
      InfrastructureAsset.find().lean(),
      Complaint.find().lean(),
    ]);
    const totalAssets = assets.length;
    const byCondition = { Good: 0, Moderate: 0, Poor: 0 };
    let highPriority = 0;
    assets.forEach((a) => {
      byCondition[a.condition] = (byCondition[a.condition] || 0) + 1;
      if (a.priorityLevel === 'High') highPriority++;
    });
    const goodCount = byCondition.Good || 0;
    const cityHealthIndex = totalAssets > 0 ? Math.round((goodCount / totalAssets) * 100) : 0;
    const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
    res.json({
      totalAssets,
      assetsByCondition: byCondition,
      totalComplaints: complaints.length,
      highPriorityAssetCount: highPriority,
      cityHealthIndex,
      pendingComplaints,
    });
  } catch (err) {
    next(err);
  }
}
