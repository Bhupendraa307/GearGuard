const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    unique: true
  },
  purchaseDate: {
    type: Date
  },
  warrantyExpiration: {
    type: Date
  },
  location: {
    type: String
  },
  department: {
    type: String
  },
  category: {
    type: String // e.g. 'Electronics', 'Heavy Machinery'
  },
  status: {
    type: String,
    enum: ['Operational', 'Down', 'Maintenance', 'Scrap'],
    default: 'Operational'
  },
  maintenanceTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Virtuals to match previous API response structure if needed, or just populate
equipmentSchema.virtual('maintenanceTeam', {
  ref: 'Team',
  localField: 'maintenanceTeamId',
  foreignField: '_id',
  justOne: true
});

equipmentSchema.virtual('assignedTechnician', {
  ref: 'User',
  localField: 'technicianId',
  foreignField: '_id',
  justOne: true
});

equipmentSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
