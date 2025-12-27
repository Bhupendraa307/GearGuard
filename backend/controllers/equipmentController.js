const { Equipment, MaintenanceRequest } = require('../models');

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate('maintenanceTeam')
      .populate('assignedTechnician')
      .populate('owner');
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id)
      .populate('maintenanceTeam')
      .populate('assignedTechnician')
      .populate('owner');

    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

    // Count open maintenance requests
    const openRequestsCount = await MaintenanceRequest.countDocuments({
      equipmentId: id,
      stage: { $nin: ['Repaired', 'Scrap'] }
    });

    const equipmentObj = equipment.toObject({ virtuals: true });
    res.json({ ...equipmentObj, openRequestsCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const data = req.body;
    const equipment = await Equipment.create(data);
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
