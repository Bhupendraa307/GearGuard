const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Corrective', 'Preventive'],
    default: 'Corrective'
  },
  description: {
    type: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  stage: {
    type: String,
    enum: ['New', 'In Progress', 'Repaired', 'Scrap'],
    default: 'New'
  },
  scheduledDate: {
    type: Date // For preventive
  },
  duration: {
    type: Number, // Hours
    default: 0
  },
  completionDate: {
    type: Date
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Virtuals for population
maintenanceRequestSchema.virtual('Equipment', {
  ref: 'Equipment',
  localField: 'equipmentId',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.virtual('Team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.virtual('technician', {
  ref: 'User',
  localField: 'technicianId',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.virtual('createdBy', {
  ref: 'User',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.set('toJSON', { virtuals: true });
maintenanceRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
