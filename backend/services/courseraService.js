const axios = require('axios');
require('dotenv').config();

/**
 * Coursera API Service
 * Fetches course information from Coursera API
 */

// Coursera API configuration
const COURSERA_API_KEY = process.env.COURSERA_API_KEY;
const COURSERA_API_URL = 'https://api.coursera.org/api/courses.v1';
const COURSERA_PARTNERS_URL = 'https://api.coursera.org/api/partners.v1';

// Skill expansion mapping for better search results
const skillToExpandedTermsMap = {
  'javascript': 'javascript programming web development ES6 frontend',
  'python': 'python programming data science machine learning',
  'react': 'react javascript frontend web development library',
  'node.js': 'node.js backend javascript server programming',
  'machine learning': 'machine learning artificial intelligence data science AI',
  'rest api': 'rest api web services http backend development',
  'docker': 'docker containerization devops deployment infrastructure',
  'kubernetes': 'kubernetes container orchestration devops cloud',
  'git': 'git version control github collaboration development',
  'sql': 'sql database mysql postgresql data management',
  'css': 'css styling web design responsive frontend',
  'html': 'html web development markup structure',
  'mongodb': 'mongodb nosql database development data storage',
  'express': 'express.js node.js backend framework development',
  'angular': 'angular typescript frontend framework development',
  'vue': 'vue.js javascript frontend framework development',
  'aws': 'aws amazon web services cloud computing infrastructure',
  'azure': 'azure microsoft cloud computing services',
  'devops': 'devops ci cd automation infrastructure deployment',
  'testing': 'software testing unit testing automation quality',
  'full stack': 'full stack development web development programming',
  'data analysis': 'data analysis statistics python excel analytics',
  'cybersecurity': 'cybersecurity information security network security',
  'blockchain': 'blockchain cryptocurrency bitcoin ethereum development',
  'mobile development': 'mobile development ios android app development'
};

// Keep a small set of mock data for when API is unavailable
const skillBasedCourses = {
  'JavaScript': [
    {
      title: 'JavaScript: Getting Started',
      url: 'https://www.coursera.org/learn/javascript',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png',
      author: 'Johns Hopkins University',
      description: 'Learn the fundamentals of JavaScript, the programming language of the Web.',
      duration: '4 weeks',
      source: 'coursera'
    },
    {
      title: 'Interactivity with JavaScript',
      url: 'https://www.coursera.org/learn/javascript-interactivity',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/59/2c65f0532611e580ee493561a63326/jhep-coursera-course3.png',
      author: 'University of Michigan',
      description: 'Learn to use JavaScript to make your web pages interactive.',
      duration: '4 weeks',
      source: 'coursera'
    }
  ],
  'Python': [
    {
      title: 'Programming for Everybody (Getting Started with Python)',
      url: 'https://www.coursera.org/learn/python',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/08/33f720502a11e59e72391aa537f5c9/pythonlearn_thumbnail_1x1.png',
      author: 'University of Michigan',
      description: 'This course aims to teach everyone the basics of programming computers using Python.',
      duration: '7 weeks',
      source: 'coursera'
    },
    {
      title: 'Crash Course on Python',
      url: 'https://www.coursera.org/learn/python-crash-course',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/16/d602b00a6b11e88d594f951694ab88/Python-thumbnail.png',
      author: 'Google',
      description: 'A hands-on introduction to Python for beginners in IT.',
      duration: '6 weeks',
      source: 'coursera'
    }
  ]
};

/**
 * Calculate relevance score for a course based on query match
 */
const calculateRelevanceScore = (course, query) => {
  const title = (course.name || course.title || '').toLowerCase();
  const description = (course.description || '').toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  let score = 0;
  
  // Exact title match gets highest score
  if (title === normalizedQuery) {
    score += 50;
  }
  
  // Word boundary matches (exact word matches)
  const queryRegex = new RegExp('\\b' + normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  if (queryRegex.test(title)) {
    score += 30;
  }
  if (queryRegex.test(description)) {
    score += 15;
  }
  
  // Partial matches in title and description
  if (title.includes(normalizedQuery)) {
    score += 20;
  }
  if (description.includes(normalizedQuery)) {
    score += 10;
  }
  
  // Individual keyword matches
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  queryWords.forEach(word => {
    const wordRegex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (wordRegex.test(title)) {
      score += 5;
    }
    if (wordRegex.test(description)) {
      score += 2;
    }
  });
  
  // Boost for beginner-friendly courses
  if (title.includes('beginner') || title.includes('introduction') || title.includes('basics')) {
    score += 5;
  }
  
  // Boost for comprehensive courses
  if (title.includes('complete') || title.includes('comprehensive') || title.includes('masterclass')) {
    score += 8;
  }
  
  // Boost for English language courses
  if (course.primaryLanguages?.includes('en')) {
    score += 5;
  }
  
  // Boost for courses with workload information
  if (course.workload) {
    score += 3;
  }
  
  return score;
};

/**
 * Filter and rank courses by relevance
 */
const filterAndRankCourses = (courses, query) => {
  if (!courses || courses.length === 0) {
      return [];
    }
    
  // Calculate relevance score for each course
  const coursesWithScores = courses.map(course => ({
    ...course,
    relevanceScore: calculateRelevanceScore(course, query),
    qualityScore: calculateRelevanceScore(course, query) // Using relevance as quality for now
  }));
  
  // Filter courses with minimum relevance
  const relevantCourses = coursesWithScores.filter(course => course.relevanceScore > 5);
  
  // Sort by relevance score (descending)
  const rankedCourses = relevantCourses.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Return top 5 courses
  return rankedCourses.slice(0, 5);
};

/**
 * Process course data to standardize format
 */
const processCourseData = (course) => {
  try {
    // Handle different API response formats
    const title = course.name || course.title || 'Untitled Course';
    const description = course.description || course.summary || '';
    const photoUrl = course.photoUrl || course.thumbnail || course.image;
    
    // Generate Coursera URL
    const slug = course.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = course.url || `https://www.coursera.org/learn/${slug}`;
    
    return {
      title,
      description: description.length > 200 ? description.substring(0, 200) + '...' : description,
      url,
      thumbnail: photoUrl,
      source: 'Coursera',
      type: 'course',
      platform: 'Coursera',
      
      // Additional metadata
      workload: course.workload || '',
      primaryLanguages: course.primaryLanguages || ['English'],
      slug,
      
      // Scores will be added by filtering function
      relevanceScore: 0,
      qualityScore: 0
    };
  } catch (error) {
    console.error('Error processing course data:', error);
    return null;
  }
};

/**
 * Search Coursera for courses
 */
const searchCoursera = async (query) => {
  try {
    if (!COURSERA_API_KEY) {
      console.warn('Coursera API key not configured');
      return generateFallbackCourses(query);
    }
    
    // Use expanded search terms if available
    const expandedQuery = skillToExpandedTermsMap[query.toLowerCase()] || query;
    console.log(`Searching Coursera for: "${query}" (expanded: "${expandedQuery}")`);
    
    const response = await axios.get(COURSERA_API_URL, {
      params: {
        q: 'search',
        query: expandedQuery,
        limit: 50, // Fetch more to filter the best ones
        fields: 'name,slug,photoUrl,description,workload,primaryLanguages,partnerIds'
      },
      headers: {
        'Authorization': `Bearer ${COURSERA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (!response.data || !response.data.elements) {
      console.log('No courses found in Coursera response');
      return generateFallbackCourses(query);
    }
    
    console.log(`Found ${response.data.elements.length} courses from Coursera API`);
    
    // Process course data
    const processedCourses = response.data.elements
      .map(processCourseData)
      .filter(course => course !== null);
    
    // Filter and rank by relevance
    const rankedCourses = filterAndRankCourses(processedCourses, query);
    
    console.log(`Returning ${rankedCourses.length} relevant Coursera courses`);
    return rankedCourses;
    
  } catch (error) {
    console.error('Coursera API error:', error.response?.data || error.message);
    return generateFallbackCourses(query);
  }
};

/**
 * Get courses for a specific skill
 */
const getCoursesForSkill = async (skillName) => {
  return await searchCoursera(skillName);
};

/**
 * Search Coursera for role-specific courses
 */
const searchCourseraForRole = async (targetRole) => {
  const roleQueries = [
    `${targetRole} career`,
    `become ${targetRole}`,
    `${targetRole} skills`,
    `${targetRole} certification`
  ];
  
  let allCourses = [];
  
  for (const query of roleQueries) {
    const courses = await searchCoursera(query);
    if (courses && courses.length > 0) {
      allCourses.push(...courses);
    }
  }
  
  // Remove duplicates based on URL
  const uniqueCourses = [];
  const seenUrls = new Set();
  
  for (const course of allCourses) {
    if (!seenUrls.has(course.url)) {
      seenUrls.add(course.url);
      uniqueCourses.push(course);
    }
  }
  
  // Sort by relevance and return top courses
  return uniqueCourses
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
};

/**
 * Generate fallback courses when API is not available
 */
const generateFallbackCourses = (query) => {
  const normalizedQuery = query.toLowerCase();
  
  // Check if we have fallback data for this skill
  if (skillBasedCourses[normalizedQuery]) {
    console.log(`Using fallback courses for ${query}`);
    return skillBasedCourses[normalizedQuery];
  }
  
  // Try to find partial matches
  for (const [skill, courses] of Object.entries(skillBasedCourses)) {
    if (skill.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.includes(skill.toLowerCase())) {
      console.log(`Using partial match fallback courses for ${query}`);
      return courses;
    }
  }
  
  console.log(`No fallback courses found for ${query}`);
  return [];
};

/**
 * Check if Coursera API is configured
 */
const isCourseraApiConfigured = () => {
  return !!COURSERA_API_KEY;
};

module.exports = {
  searchCoursera,
  getCoursesForSkill,
  searchCourseraForRole,
  isCourseraApiConfigured,
  calculateRelevanceScore,
  filterAndRankCourses,
  generateFallbackCourses
};