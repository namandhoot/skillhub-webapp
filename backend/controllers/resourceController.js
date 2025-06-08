const youtubeService = require('../services/youtubeService');
const courseraService = require('../services/courseraService');

/**
 * Get learning resources for a specific skill
 */
const getResourcesForSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    console.log(`Fetching resources for skill: ${skillName}`);
    
    // Fetch resources from both platforms in parallel
    const [youtubeResources, courseraResources] = await Promise.all([
      youtubeService.searchYouTube(skillName),
      courseraService.searchCoursera(skillName)
    ]);

    // Combine all resources
    const allResources = [
      ...youtubeResources,
      ...courseraResources
    ];

    // Sort by quality score
    const sortedResources = allResources.sort((a, b) => b.qualityScore - a.qualityScore);

    // Group resources by type for better organization
    const groupedResources = {
      recommended: sortedResources.filter(r => r.qualityScore > 15).slice(0, 3),
      courses: sortedResources.filter(r => r.type === 'course').slice(0, 4),
      videos: sortedResources.filter(r => r.type === 'video').slice(0, 4)
    };

    res.json({
      success: true,
      data: {
        skill: skillName,
        resources: groupedResources,
        totalFound: allResources.length,
        stats: {
          youtubeCount: youtubeResources.length,
          courseraCount: courseraResources.length,
          highQualityCount: groupedResources.recommended.length
        }
      },
      message: `Found ${allResources.length} resources for ${skillName}`
    });

  } catch (error) {
    console.error('Resource fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

/**
 * Get learning resources for a target role
 */
const getResourcesForRole = async (req, res) => {
  try {
    const { targetRole } = req.params;
    console.log(`Fetching resources for role: ${targetRole}`);

    // For roles, we prioritize comprehensive courses and learning paths
    const [youtubeResources, courseraResources] = await Promise.all([
      youtubeService.searchYouTube(`${targetRole} complete course career path`),
      courseraService.searchCoursera(`${targetRole} complete course`)
    ]);

    // Combine and sort resources
    const allResources = [
      ...youtubeResources,
      ...courseraResources
    ].sort((a, b) => b.qualityScore - a.qualityScore);

    // Group resources by content type
    const groupedResources = {
      careerPaths: allResources.filter(r => 
        r.title.toLowerCase().includes('career') || 
        r.title.toLowerCase().includes('path') ||
        r.title.toLowerCase().includes('roadmap')
      ).slice(0, 2),
      comprehensiveCourses: allResources.filter(r => 
        r.isComprehensive || 
        r.title.toLowerCase().includes('complete') ||
        r.title.toLowerCase().includes('comprehensive')
      ).slice(0, 3),
      quickStart: allResources.filter(r => 
        r.title.toLowerCase().includes('beginner') ||
        r.title.toLowerCase().includes('introduction')
      ).slice(0, 3)
    };

    res.json({
      success: true,
      data: {
        role: targetRole,
        resources: groupedResources,
        totalFound: allResources.length,
        stats: {
          youtubeCount: youtubeResources.length,
          courseraCount: courseraResources.length
        }
      },
      message: `Found ${allResources.length} resources for ${targetRole} role`
    });

  } catch (error) {
    console.error('Role resources fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role-based resources',
      error: error.message
    });
  }
};

/**
 * Search for learning resources
 */
const searchResources = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`Searching resources for: ${query}`);

    // Fetch resources based on type
    let youtubeResources = [], courseraResources = [];
    
    if (!type || type === 'all' || type === 'video') {
      youtubeResources = await youtubeService.searchYouTube(query);
    }
    
    if (!type || type === 'all' || type === 'course') {
      courseraResources = await courseraService.searchCoursera(query);
    }

    // Combine and sort all resources
    const allResources = [
      ...youtubeResources,
      ...courseraResources
    ].sort((a, b) => b.qualityScore - a.qualityScore);

    res.json({
      success: true,
      data: {
        query,
        resources: allResources.slice(0, 10),
        totalFound: allResources.length,
        stats: {
          youtubeCount: youtubeResources.length,
          courseraCount: courseraResources.length
        }
      },
      message: `Found ${allResources.length} resources matching "${query}"`
    });

  } catch (error) {
    console.error('Resource search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search resources',
      error: error.message
    });
  }
};

module.exports = {
  getResourcesForSkill,
  getResourcesForRole,
  searchResources
}; 