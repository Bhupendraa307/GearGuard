const { MaintenanceRequest, Equipment } = require('../models');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('Equipment') // Virtual
      .populate('Team') // Virtual
      .populate('technician') // Virtual
      .populate('createdBy'); // Virtual
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { equipmentId, ...otherData } = req.body;
    
    // Auto-fill Logic: Fetch Equipment to get Team
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

    if (otherData.technicianId === '') {
        otherData.technicianId = null;
    }

    const requestData = {
      ...otherData,
      equipmentId,
      teamId: equipment.maintenanceTeamId, // Auto-assign Team from Equipment
      stage: 'New'
    };

    const request = await MaintenanceRequest.create(requestData);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRequestStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, duration, technicianId } = req.body;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (stage) request.stage = stage;
    if (duration) request.duration = duration;
    if (technicianId) request.technicianId = technicianId;
    
    if (stage === 'Repaired') {
        request.completionDate = new Date();
    }

    // Scrap Logic: If stage is Scrap, mark equipment as Scrap
    if (stage === 'Scrap') {
        const equipment = await Equipment.findById(request.equipmentId);
        if (equipment) {
            equipment.status = 'Scrap';
            await equipment.save();
        }
    }

    await request.save();
    
    // Re-populate for response
    await request.populate('Equipment');
    await request.populate('technician');

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reporting Endpoint
exports.getStats = async (req, res) => {
    try {
        // Requests per Team
        const teamStats = await MaintenanceRequest.aggregate([
            {
                $lookup: {
                    from: 'teams',
                    localField: 'teamId',
                    foreignField: '_id',
                    as: 'team'
                }
            },
            { $unwind: '$team' },
            {
                $group: {
                    _id: '$team.name',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Requests per Equipment Category
        // Since category is on Equipment, we need to lookup Equipment
        const categoryStats = await MaintenanceRequest.aggregate([
            {
                $lookup: {
                    from: 'equipments',
                    localField: 'equipmentId',
                    foreignField: '_id',
                    as: 'equipment'
                }
            },
            { $unwind: '$equipment' },
            {
                $group: {
                    _id: '$equipment.category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            teamStats: teamStats.map(s => ({ name: s._id, value: s.count })),
            categoryStats: categoryStats.map(s => ({ name: s._id || 'Uncategorized', value: s.count }))
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
