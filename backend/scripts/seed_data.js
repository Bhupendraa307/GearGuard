const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Team, User, Equipment, MaintenanceRequest } = require('../models');

async function seedData() {
  try {
    await connectDB();
    console.log('MongoDB Connected...');

    // Clear existing data
    await Team.deleteMany({});
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    console.log('Data cleared.');

    // 1. Create Teams
    const teams = await Team.create([
      { name: 'Electrical Team' },
      { name: 'Mechanical Team' },
      { name: 'IT Support' }
    ]);
    console.log('Teams created.');

    // 2. Create Users
    const users = await User.create([
      { name: 'John Doe', email: 'john@gearguard.com', role: 'Technician' },
      { name: 'Jane Smith', email: 'jane@gearguard.com', role: 'Manager' },
      { name: 'Mike Ross', email: 'mike@gearguard.com', role: 'Employee' }
    ]);
    console.log('Users created.');

    // 3. Create Equipment
    const equipment = await Equipment.create([
      {
        name: 'Industrial Generator X500',
        serialNumber: 'GEN-2023-001',
        category: 'Heavy Machinery',
        location: 'Warehouse A',
        status: 'Operational',
        maintenanceTeamId: teams[0]._id,
        technicianId: users[0]._id
      },
      {
        name: 'CNC Milling Machine',
        serialNumber: 'CNC-99-X',
        category: 'Manufacturing',
        location: 'Production Floor',
        status: 'Operational',
        maintenanceTeamId: teams[1]._id,
        technicianId: users[0]._id
      },
      {
        name: 'Office Server Rack',
        serialNumber: 'SRV-DELL-88',
        category: 'Electronics',
        location: 'Server Room',
        status: 'Maintenance',
        maintenanceTeamId: teams[2]._id,
        technicianId: users[0]._id
      },
      {
        name: 'Forklift Toyota 8FGU25',
        serialNumber: 'FL-TOY-25',
        category: 'Logistics',
        location: 'Loading Dock',
        status: 'Operational',
        maintenanceTeamId: teams[1]._id
      },
      {
        name: '3D Printer Prusa i3',
        serialNumber: '3DP-PRU-01',
        category: 'R&D',
        location: 'Lab 2',
        status: 'Down',
        maintenanceTeamId: teams[1]._id
      }
    ]);
    console.log('Equipment created.');

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
