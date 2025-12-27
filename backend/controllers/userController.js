const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('id name role avatar teamId');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({
            role: { $in: ['Technician', 'Manager'] }
        }).select('id name role avatar teamId');
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
