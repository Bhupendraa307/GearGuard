const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', maintenanceController.getAllRequests);
router.get('/stats', maintenanceController.getStats);
router.post('/', maintenanceController.createRequest);
router.patch('/:id/stage', maintenanceController.updateRequestStage);

module.exports = router;
