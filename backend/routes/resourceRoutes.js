const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Get resources for a specific skill
router.get('/learning/skill/:skillName', resourceController.getResourcesForSkill);

// Get resources for a specific role
router.get('/learning/role/:targetRole', resourceController.getResourcesForRole);

// Search for resources
router.get('/learning/search', resourceController.searchResources);

module.exports = router; 