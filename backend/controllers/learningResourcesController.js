const youtubeService = require('../services/youtubeService');
const courseraService = require('../services/courseraService');

/**
 * Get learning resources for a specific role
 * @param {Object} req - Express request object with targetRole parameter
 * @param {Object} res - Express response object
 */
const getResourcesForRole = async (req, res) => {
  try {
    const { targetRole } = req.params;
    
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }
    
    console.log(`Fetching resources for role: ${targetRole}`);
    
    // Fetch role-specific resources from multiple sources
    const [youtubeResults, courseraResults] = await Promise.allSettled([
      youtubeService.searchYouTubeForRole(targetRole),
      courseraService.searchCourseraForRole(targetRole)
    ]);
    
    // Process YouTube results
    let youtubeResources = [];
    if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
      youtubeResources = youtubeResults.value;
      console.log(`Found ${youtubeResources.length} YouTube resources for ${targetRole} role`);
    }
    
    // Process Coursera results
    let courseraResources = [];
    if (courseraResults.status === 'fulfilled' && courseraResults.value) {
      courseraResources = courseraResults.value;
      console.log(`Found ${courseraResources.length} Coursera resources for ${targetRole} role`);
    }
    
    // Combine all resources
    const allResources = [...youtubeResources, ...courseraResources];
    
    // Add role-specific metadata
    const enhancedResources = allResources.map(resource => ({
      ...resource,
      fetchedAt: new Date().toISOString(),
      roleContext: targetRole,
      resourceType: 'career-guidance'
    }));
    
    // Group resources by type
    const groupedData = {
      youtube: youtubeResources,
      coursera: courseraResources,
      careerGuidance: enhancedResources.filter(r => r.resourceType === 'career-guidance'),
      total: allResources.length
    };
    
    if (allResources.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No career resources found for "${targetRole}". Try a different role or check back later.`,
        data: [],
        groupedData: {
          youtube: [],
          coursera: [],
          careerGuidance: [],
          total: 0
        }
      });
    }
    
    // Sort by relevance to the role
    enhancedResources.sort((a, b) => {
      const scoreA = a.qualityScore || a.relevanceScore || 0;
      const scoreB = b.qualityScore || b.relevanceScore || 0;
      return scoreB - scoreA;
    });
    
    res.json({
      success: true,
      data: enhancedResources,
      groupedData,
      message: `Found ${allResources.length} career resources for "${targetRole}"`,
      metadata: {
        targetRole,
        totalResults: allResources.length,
        youtubeCount: youtubeResources.length,
        courseraCount: courseraResources.length,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching role resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role resources',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: []
    });
  }
};

/**
 * Get learning resources for a specific skill
 * @param {Object} req - Express request object with skillName parameter
 * @param {Object} res - Express response object
 */
const getResourcesForSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }
    
      console.log(`Fetching resources for skill: ${skillName}`);
      
    // Fetch resources from multiple sources concurrently
    const [youtubeResults, courseraResults] = await Promise.allSettled([
      youtubeService.searchYouTube(skillName),
      courseraService.getCoursesForSkill(skillName)
    ]);
    
    // Process YouTube results
    let youtubeResources = [];
    if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
      youtubeResources = youtubeResults.value;
      console.log(`Found ${youtubeResources.length} YouTube resources for ${skillName}`);
    } else {
      console.warn(`YouTube search failed for ${skillName}:`, youtubeResults.reason?.message);
    }
    
    // Process Coursera results
    let courseraResources = [];
    if (courseraResults.status === 'fulfilled' && courseraResults.value) {
      courseraResources = courseraResults.value;
      console.log(`Found ${courseraResources.length} Coursera resources for ${skillName}`);
    } else {
      console.warn(`Coursera search failed for ${skillName}:`, courseraResults.reason?.message);
    }
    
    // Combine all resources
    const allResources = [...youtubeResources, ...courseraResources];
    
    // Group resources by type
    const groupedData = {
      youtube: youtubeResources,
      coursera: courseraResources,
      total: allResources.length
    };
    
    // Add platform-specific metadata
    const enhancedResources = allResources.map(resource => ({
      ...resource,
      fetchedAt: new Date().toISOString(),
      skillContext: skillName
    }));
    
    if (allResources.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No learning resources found for "${skillName}". Try a different skill name or check back later.`,
        data: [],
        groupedData: {
          youtube: [],
          coursera: [],
          total: 0
        }
      });
    }
    
    // Sort combined resources by quality score (if available)
    enhancedResources.sort((a, b) => {
      const scoreA = a.qualityScore || a.relevanceScore || 0;
      const scoreB = b.qualityScore || b.relevanceScore || 0;
      return scoreB - scoreA;
    });
    
    res.json({
      success: true,
      data: enhancedResources,
      groupedData,
      message: `Found ${allResources.length} learning resources for "${skillName}"`,
      metadata: {
        skill: skillName,
        totalResults: allResources.length,
        youtubeCount: youtubeResources.length,
        courseraCount: courseraResources.length,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: []
    });
  }
};

/**
 * Search for learning resources
 * @param {Object} req - Express request object with q query parameter
 * @param {Object} res - Express response object
 */
const searchResources = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    console.log(`Searching resources for query: ${q}`);
    
    // Determine if this is a skill or role-based search
    const isRoleSearch = q.toLowerCase().includes('become') || 
                        q.toLowerCase().includes('career') ||
                        q.toLowerCase().includes('job') ||
                        q.toLowerCase().includes('role');
    
    let results = [];
    
    if (isRoleSearch) {
      // Treat as role search
      const [youtubeResults, courseraResults] = await Promise.allSettled([
        youtubeService.searchYouTubeForRole(q),
        courseraService.searchCourseraForRole(q)
      ]);
      
      if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
        results.push(...youtubeResults.value);
      }
      
      if (courseraResults.status === 'fulfilled' && courseraResults.value) {
        results.push(...courseraResults.value);
      }
    } else {
      // Treat as skill search
      const [youtubeResults, courseraResults] = await Promise.allSettled([
        youtubeService.searchYouTube(q),
        courseraService.searchCoursera(q)
      ]);
      
      if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
        results.push(...youtubeResults.value);
      }
      
      if (courseraResults.status === 'fulfilled' && courseraResults.value) {
        results.push(...courseraResults.value);
      }
    }
    
    // Add search metadata
    const enhancedResults = results.map(resource => ({
      ...resource,
      fetchedAt: new Date().toISOString(),
      searchContext: q,
      searchType: isRoleSearch ? 'role' : 'skill'
    }));
    
    // Group by platform
    const groupedData = {
      youtube: enhancedResults.filter(r => r.source === 'YouTube'),
      coursera: enhancedResults.filter(r => r.source === 'Coursera'),
      total: enhancedResults.length
    };
    
    if (enhancedResults.length === 0) {
        return res.status(404).json({
          success: false,
        message: `No resources found for "${q}". Try different keywords or check spelling.`,
        data: [],
        groupedData: {
          youtube: [],
          coursera: [],
          total: 0
        }
      });
    }
    
    // Sort by quality/relevance
    enhancedResults.sort((a, b) => {
      const scoreA = a.qualityScore || a.relevanceScore || 0;
      const scoreB = b.qualityScore || b.relevanceScore || 0;
      return scoreB - scoreA;
    });
    
    res.json({
      success: true,
      data: enhancedResults,
      groupedData,
      message: `Found ${enhancedResults.length} resources for "${q}"`,
      metadata: {
        query: q,
        searchType: isRoleSearch ? 'role' : 'skill',
        totalResults: enhancedResults.length,
        youtubeCount: groupedData.youtube.length,
        courseraCount: groupedData.coursera.length,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error searching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search resources',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: []
    });
  }
};

/**
 * Get recommended resources based on skill gap analysis
 * Takes user skills and target role to provide personalized recommendations
 */
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userSkills, targetRole, skillsToImprove, skillsToAcquire } = req.body;
    
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }
    
    console.log(`Generating personalized recommendations for ${targetRole}`);
    
    let allRecommendations = [];
    
    // Get resources for skills to acquire (higher priority)
    if (skillsToAcquire && skillsToAcquire.length > 0) {
      console.log(`Fetching resources for skills to acquire: ${skillsToAcquire.join(', ')}`);
      
      for (const skill of skillsToAcquire.slice(0, 3)) { // Limit to top 3 skills
        try {
          const [youtubeResults, courseraResults] = await Promise.allSettled([
            youtubeService.searchYouTube(skill),
            courseraService.getCoursesForSkill(skill)
          ]);
          
          const skillResources = [];
          
          if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
            skillResources.push(...youtubeResults.value.slice(0, 2)); // Top 2 YouTube videos
          }
          
          if (courseraResults.status === 'fulfilled' && courseraResults.value) {
            skillResources.push(...courseraResults.value.slice(0, 2)); // Top 2 Coursera courses
          }
          
          // Tag resources with priority and skill context
          const taggedResources = skillResources.map(resource => ({
            ...resource,
            priority: 'high',
            skillCategory: 'acquire',
            targetSkill: skill,
            recommendationReason: `Essential skill for ${targetRole} role`
          }));
          
          allRecommendations.push(...taggedResources);
        } catch (error) {
          console.error(`Error fetching resources for skill to acquire: ${skill}`, error);
        }
      }
    }
    
    // Get resources for skills to improve (medium priority)
    if (skillsToImprove && skillsToImprove.length > 0) {
      console.log(`Fetching resources for skills to improve: ${skillsToImprove.join(', ')}`);
      
      for (const skill of skillsToImprove.slice(0, 2)) { // Limit to top 2 skills
        try {
          const [youtubeResults, courseraResults] = await Promise.allSettled([
            youtubeService.searchYouTube(skill + ' advanced'),
            courseraService.getCoursesForSkill(skill)
          ]);
          
          const skillResources = [];
          
          if (youtubeResults.status === 'fulfilled' && youtubeResults.value) {
            skillResources.push(...youtubeResults.value.slice(0, 1)); // Top 1 YouTube video
          }
          
          if (courseraResults.status === 'fulfilled' && courseraResults.value) {
            skillResources.push(...courseraResults.value.slice(0, 1)); // Top 1 Coursera course
          }
          
          // Tag resources with priority and skill context
          const taggedResources = skillResources.map(resource => ({
            ...resource,
            priority: 'medium',
            skillCategory: 'improve',
            targetSkill: skill,
            recommendationReason: `Strengthen existing ${skill} skills for ${targetRole}`
          }));
          
          allRecommendations.push(...taggedResources);
        } catch (error) {
          console.error(`Error fetching resources for skill to improve: ${skill}`, error);
        }
      }
    }
    
    // Group recommendations by priority and type
    const groupedRecommendations = {
      highPriority: allRecommendations.filter(r => r.priority === 'high'),
      mediumPriority: allRecommendations.filter(r => r.priority === 'medium'),
      byPlatform: {
        youtube: allRecommendations.filter(r => r.source === 'YouTube'),
        coursera: allRecommendations.filter(r => r.source === 'Coursera')
      },
      bySkillCategory: {
        acquire: allRecommendations.filter(r => r.skillCategory === 'acquire'),
        improve: allRecommendations.filter(r => r.skillCategory === 'improve')
      }
    };
    
    if (allRecommendations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No personalized recommendations could be generated. Please check your skill requirements.',
        data: [],
        groupedData: groupedRecommendations
      });
    }
    
    // Sort by priority and quality
    allRecommendations.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by quality score
      const scoreA = a.qualityScore || a.relevanceScore || 0;
      const scoreB = b.qualityScore || b.relevanceScore || 0;
      return scoreB - scoreA;
    });
    
    res.json({
      success: true,
      data: allRecommendations,
      groupedData: groupedRecommendations,
      message: `Generated ${allRecommendations.length} personalized recommendations for ${targetRole}`,
      metadata: {
        targetRole,
        totalRecommendations: allRecommendations.length,
        highPriorityCount: groupedRecommendations.highPriority.length,
        mediumPriorityCount: groupedRecommendations.mediumPriority.length,
        skillsToAcquire: skillsToAcquire || [],
        skillsToImprove: skillsToImprove || [],
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personalized recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: []
    });
  }
};

/**
 * Test endpoint to verify the learning resources API is working
 */
const testAPI = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Learning resources API is working',
      endpoints: {
        'GET /api/learning/skill/:skillName': 'Get resources for a specific skill',
        'GET /api/learning/role/:targetRole': 'Get resources for a specific role',
        'GET /api/learning/search?q=query': 'Search resources across platforms',
        'POST /api/learning/recommendations': 'Get personalized recommendations',
        'GET /api/learning/test': 'Test API connectivity'
      },
      services: {
        youtube: !!process.env.YOUTUBE_API_KEY,
        coursera: !!process.env.COURSERA_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message
    });
  }
};

module.exports = {
  getResourcesForRole,
  getResourcesForSkill,
  searchResources,
  getPersonalizedRecommendations,
  testAPI
}; 