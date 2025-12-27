const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Technician', 'Manager', 'Employee'],
    default: 'Employee'
  },
  avatar: {
    type: String
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
