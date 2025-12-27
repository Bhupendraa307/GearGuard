const { Team } = require('../models');

exports.getAllTeams = async (req, res) => {
  try {
    // In Mongoose, to get users for a team, we'd typically use virtual populate if setup,
    // or manual query. Since User has teamId, we can aggregate or just return teams.
    // For simplicity, let's just return teams. If frontend needs members, we can add logic.
    // To replicate Sequelize 'include: [User]', we can use virtuals or separate query.
    // Let's stick to simple teams for now as the frontend mainly uses it for dropdowns.
    const teams = await Team.find(); 
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.create({ name });
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
