# Resource Recommendation & Skill Extraction System Implementation Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Skill Extraction Using Gemini AI](#skill-extraction-using-gemini-ai)
3. [YouTube API Integration](#youtube-api-integration)
4. [Coursera API Integration](#coursera-api-integration)
5. [Resource Recommendation Logic](#resource-recommendation-logic)
6. [Implementation Steps](#implementation-steps)
7. [Code Examples](#code-examples)

---

## System Overview

This document outlines how to build a comprehensive learning resource recommendation system that:
- Extracts skills based on target roles using Gemini AI
- Fetches relevant learning resources from YouTube and Coursera
- Provides intelligent filtering and ranking of resources
- Delivers personalized learning recommendations

### Core Components
1. **Gemini AI Service** - Skill extraction and analysis
2. **YouTube Service** - Video resource fetching
3. **Coursera Service** - Course resource fetching
4. **Resource Controller** - API endpoints and business logic
5. **Frontend Components** - User interface for displaying resources

---

## Skill Extraction Using Gemini AI

### 1. Target Role to Skills Mapping

The system uses Gemini AI to generate required skills for any target role dynamically.

#### Gemini Prompt Structure:
```javascript
const prompt = `Generate a detailed list of 8-12 key technical skills specifically required for a "${targetRole}" role in the tech industry.

The skills should be directly relevant to this specific role and not generic skills that apply to all tech roles.

For each skill, provide:
1. Skill name (specific technology, language, framework, or technical concept)
2. Importance level (Essential, Important, Helpful)
3. Short description that explains why this skill matters for a ${targetRole} (max 100 characters)
4. Estimated learning time in months

For example, if the role is "Frontend Developer", include skills like React, JavaScript, CSS, etc.
If the role is "Data Scientist", include skills like Python, SQL, Machine Learning, etc.

Ensure all skills are specifically relevant to a ${targetRole} role based on current industry standards.

Format the response as a JSON array of objects with the following structure:
[{
  "skillName": "Name of skill",
  "importance": "Essential/Important/Helpful",
  "description": "Brief description focused on this role",
  "learningTimeMonths": number
}]`;
```

#### Implementation Logic:
1. **API Call**: Send prompt to Gemini API
2. **Response Parsing**: Extract JSON from response using regex
3. **Validation**: Ensure response contains valid skill objects
4. **Fallback**: Use predefined skill sets if Gemini fails

#### Sample Response Format:
```json
[
  {
    "skillName": "React",
    "importance": "Essential",
    "description": "JavaScript library for building user interfaces",
    "learningTimeMonths": 2
  },
  {
    "skillName": "Node.js",
    "importance": "Important", 
    "description": "JavaScript runtime for server-side development",
    "learningTimeMonths": 3
  }
]
```

### 2. Resume Skill Extraction

#### Gemini Prompt for Resume Analysis:
```javascript
const prompt = `
I have a resume text that I need to analyze for technical skills and provide an ATS score.

Resume text:
${resumeText}

${targetRole ? `The person is targeting a ${targetRole} role.` : ''}

Please perform the following tasks:
1. Extract all technical skills mentioned in the resume
2. For each skill, assign a confidence score between 0 and 1
3. Provide an ATS score from 0-100
4. Provide analysis with improvement suggestions

Format your response as a JSON object with the following structure:
{
  "skills": [
    {"skillName": "Skill1", "confidenceScore": 0.9},
    {"skillName": "Skill2", "confidenceScore": 0.8}
  ],
  "atsScore": 85,
  "analysis": "Analysis text here..."
}`;
```

### 3. Skill Gap Analysis

#### Process:
1. **Extract** skills from resume
2. **Generate** required skills for target role
3. **Compare** user skills vs required skills
4. **Identify** missing and improvable skills
5. **Generate** learning recommendations

---

## YouTube API Integration

### 1. API Configuration

```javascript
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
```

### 2. Search Query Generation

#### Query Types Based on Skill:

**For Simple Skills:**
```javascript
const searchQueries = [
  `${skill} tutorial`,
  `learn ${skill} programming`,
  `${skill} for beginners`
];
```

**For Complex Skills (REST API):**
```javascript
const searchQueries = [
  'RESTful API tutorial',
  'REST API design principles', 
  'REST API best practices'
];
```

**For Target Roles:**
```javascript
const query = `become a ${targetRole} career path`;
```

### 3. API Call Implementation

```javascript
const fetchFromYouTubeAPI = async (query, isPrimaryQuery = true) => {
  try {
    // Search for videos
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 15,
        q: query,
        type: 'video',
        videoCategoryId: '27', // Education category
        relevanceLanguage: 'en',
        key: YOUTUBE_API_KEY,
        order: isPrimaryQuery ? 'relevance' : 'viewCount'
      }
    });

    // Get video details with statistics
    const videoIds = response.data.items.map(item => item.id.videoId);
    const videoDetailsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics,snippet',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });

    // Process and enhance results
    return processVideoResults(videoDetailsResponse.data.items);
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
};
```

### 4. Quality Scoring Algorithm

```javascript
// Calculate quality score for each video
video.qualityScore = (
  (Math.log10(video.viewCount + 1) * 0.35) +     // View count
  (engagementRate * 100 * 0.35) +                // Engagement rate
  (Math.log10(video.commentCount + 1) * 0.15) +  // Comment count
  (recencyScore * 0.15)                          // Recency factor
);

// Apply multipliers
if (video.isTutorial) video.qualityScore *= 1.2;
if (video.isComprehensive) video.qualityScore *= 1.25;
if (ageInDays < 365) video.qualityScore *= 1.1;
```

### 5. Content Filtering

```javascript
const isTutorialVideo = (title, description) => {
  const tutorialKeywords = ['tutorial', 'course', 'learn', 'guide', 'how to'];
  const content = `${title} ${description}`.toLowerCase();
  return tutorialKeywords.some(keyword => content.includes(keyword));
};

const isComprehensiveVideo = (title, description) => {
  const comprehensiveKeywords = ['complete', 'full', 'comprehensive', 'crash course'];
  const content = `${title} ${description}`.toLowerCase();
  return comprehensiveKeywords.some(keyword => content.includes(keyword));
};
```

---

## Coursera API Integration

### 1. API Configuration

```javascript
const COURSERA_API_KEY = process.env.COURSERA_API_KEY;
const COURSERA_API_URL = 'https://api.coursera.org/api/courses.v1';
```

### 2. Skill Expansion Mapping

```javascript
const skillToExpandedTermsMap = {
  'javascript': 'javascript programming web development',
  'python': 'python programming data science',
  'react': 'react javascript frontend web development',
  'machine learning': 'machine learning artificial intelligence data science',
  'rest api': 'rest api web services http'
};
```

### 3. Search Implementation

```javascript
const searchCoursera = async (query) => {
  try {
    // Use expanded search terms if available
    let queryToUse = skillToExpandedTermsMap[query.toLowerCase()] || query;
    
    const response = await axios.get(COURSERA_API_URL, {
      params: {
        q: 'search',
        query: queryToUse,
        limit: 50,
        fields: 'name,slug,photoUrl,description,workload,primaryLanguages'
      },
      headers: {
        'Authorization': `Bearer ${COURSERA_API_KEY}`
      }
    });

    return filterAndRankCourses(response.data.elements, query);
  } catch (error) {
    console.error('Coursera API error:', error);
    return [];
  }
};
```

### 4. Course Relevance Scoring

```javascript
const calculateRelevanceScore = (course, query) => {
  const title = course.name.toLowerCase();
  const description = (course.description || '').toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  let score = 0;
  
  // Exact title match
  if (title === normalizedQuery) score += 50;
  
  // Word boundary matches
  if (new RegExp('\\b' + normalizedQuery + '\\b', 'i').test(title)) score += 30;
  if (new RegExp('\\b' + normalizedQuery + '\\b', 'i').test(description)) score += 15;
  
  // Partial matches
  if (title.includes(normalizedQuery)) score += 20;
  if (description.includes(normalizedQuery)) score += 10;
  
  // Individual keyword matches
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  queryWords.forEach(word => {
    if (title.includes(word)) score += 5;
    if (description.includes(word)) score += 2;
  });
  
  return score;
};
```

---

## Resource Recommendation Logic

### 1. Skill-Based Recommendations

#### Flow:
1. **Normalize** skill name (lowercase, trim)
2. **Generate** search queries based on skill type
3. **Call** YouTube API with multiple query attempts
4. **Call** Coursera API with expanded terms
5. **Filter** results for relevance
6. **Rank** by quality scores
7. **Return** top 5-10 results

### 2. Role-Based Recommendations

#### Flow:
1. **Generate** role-specific query: `"become a ${role} career path"`
2. **Fetch** from YouTube API
3. **Fetch** from Coursera API with role keywords
4. **Combine** and rank results
5. **Return** comprehensive learning path

### 3. Combined Resource Logic

```javascript
const getResourcesForSkill = async (skillName) => {
  let recommendations = [];
  
  // Try YouTube first
  const youtubeResults = await fetchFromYouTubeAPI(skillName);
  if (youtubeResults?.length) {
    recommendations.push(...youtubeResults);
  }
  
  // Try Coursera
  const courseraResults = await searchCoursera(skillName);
  if (courseraResults?.length) {
    recommendations.push(...courseraResults);
  }
  
  // Filter for relevance
  recommendations = filterByRelevance(recommendations, skillName);
  
  // Label by source and return
  return labelResourcesBySource(recommendations);
};
```

---

## Implementation Steps

### Step 1: Environment Setup
```bash
# Install dependencies
npm install axios @google/generative-ai

# Set environment variables
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key  
COURSERA_API_KEY=your_coursera_api_key
```

### Step 2: Create Service Files

1. **geminiService.js** - AI skill extraction
2. **youtubeService.js** - YouTube API integration
3. **courseraService.js** - Coursera API integration
4. **learningResourcesController.js** - Main controller

### Step 3: API Routes
```javascript
// Learning resources routes
router.get('/skill/:skillName', getResourcesForSkill);
router.get('/role/:targetRole', getResourcesForRole);
router.get('/search', searchResources);
```

### Step 4: Frontend Integration
```javascript
// React component for skill resources
const SkillResources = ({ skillName }) => {
  const [resources, setResources] = useState([]);
  
  useEffect(() => {
    fetchResources();
  }, [skillName]);
  
  const fetchResources = async () => {
    const response = await api.get(`/learning/skill/${skillName}`);
    setResources(response.data.data);
  };
  
  return (
    <div className="resources-grid">
      {resources.map(resource => (
        <ResourceCard key={resource.url} resource={resource} />
      ))}
    </div>
  );
};
```

---

## Code Examples

### Complete Gemini Service Example

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateRequiredSkillsForRole = async (targetRole) => {
  try {
    const prompt = `Generate 8-12 technical skills for "${targetRole}" role...`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON found');
    
    const skills = JSON.parse(jsonMatch[0]);
    return skills;
  } catch (error) {
    console.error('Gemini error:', error);
    return getFallbackSkills(targetRole);
  }
};
```

### Complete YouTube Service Example

```javascript
const searchYouTube = async (skill) => {
  const normalizedSkill = skill.toLowerCase().trim();
  const searchQueries = [
    `${normalizedSkill} tutorial`,
    `learn ${normalizedSkill} programming`,
    `${normalizedSkill} for beginners`
  ];
  
  for (const query of searchQueries) {
    const results = await fetchFromYouTubeAPI(query);
    if (results?.length) {
      return enhanceResourcesWithStats(results);
    }
  }
  
  return [];
};
```

### Complete API Controller Example

```javascript
const getResourcesForSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const resources = await youtubeService.searchYouTube(skillName);
    
    if (!resources?.length) {
      return res.status(404).json({
        success: false,
        message: `No resources found for ${skillName}`
      });
    }
    
    res.json({
      success: true,
      data: resources,
      message: `Found ${resources.length} resources for ${skillName}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};
```

---

## Best Practices

1. **Error Handling**: Always provide fallbacks for API failures
2. **Rate Limiting**: Implement proper rate limiting for external APIs
3. **Caching**: Cache results to reduce API calls
4. **Relevance Filtering**: Filter results based on skill/role relevance
5. **Quality Scoring**: Rank resources by engagement and quality metrics
6. **User Experience**: Show loading states and error messages
7. **Content Filtering**: Prioritize educational content over entertainment

---

## Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent API abuse
4. **Error Exposure**: Don't expose internal errors to users
5. **CORS**: Configure properly for frontend access

---

This implementation guide provides a complete framework for building an intelligent learning resource recommendation system that can be adapted for any educational platform or skill development application.