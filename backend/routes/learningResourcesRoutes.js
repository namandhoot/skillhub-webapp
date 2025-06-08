const express = require('express');
const router = express.Router();
const learningResourcesController = require('../controllers/learningResourcesController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Test route to check if the API is working
router.get('/test', learningResourcesController.testAPI);

// GET learning resources for a specific skill
router.get('/skill/:skillName', learningResourcesController.getResourcesForSkill);

// GET learning resources for a specific role
router.get('/role/:targetRole', learningResourcesController.getResourcesForRole);

// GET search learning resources across platforms
router.get('/search', learningResourcesController.searchResources);

// POST personalized recommendations based on skill gap analysis
router.post('/recommendations', learningResourcesController.getPersonalizedRecommendations);

module.exports = router; 