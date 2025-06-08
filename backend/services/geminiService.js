const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with a check for the API key
let genAI;
let model;

try {
  // Check for both possible environment variable names
  const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (geminiApiKey) {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    // Update the model name to one that's available in the current API version
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Gemini API initialized successfully with model: gemini-1.5-flash');
    console.log('🔑 Using API key:', geminiApiKey.substring(0, 8) + '...' + geminiApiKey.substring(geminiApiKey.length - 4));
  } else {
    console.warn('⚠️  GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY not set. Using mock model.');
    console.warn('⚠️  Skills will be hardcoded instead of AI-generated.');
    // Create a mock model for development
    model = {
      generateContent: async (prompt) => {
        console.log('🤖 Mock Gemini model called with prompt:', prompt.substring(0, 100) + '...');
        return {
          response: {
            text: () => '[]' // Return empty array as text
          }
        };
      }
    };
  }
} catch (error) {
  console.error('❌ Error initializing Gemini:', error);
  // Fallback to mock model
  model = {
    generateContent: async (prompt) => {
      console.log('🤖 Mock Gemini model called with prompt:', prompt.substring(0, 100) + '...');
      return {
        response: {
          text: () => '[]' // Return empty array as text
        }
      };
    }
  };
}

// Enhance skill description
const enhanceSkillDescription = async (keywords, skillName, category) => {
  try {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return keywords; // Return original keywords if no API key
    }
    
    const prompt = `
    I need to create a professional description for a tech skill based on these keywords: "${keywords}"
    
    The skill name is: ${skillName}
    Category: ${category}
    
    Please create a concise, informative description (2-3 sentences) that explains what this skill is and why it's valuable in the industry.
    
    The description should be factual, clear, and helpful for someone learning about this skill.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for skill description:', error);
    return keywords; // Fallback to original keywords if enhancement fails
  }
};

// Enhance tool description
const enhanceToolDescription = async (keywords, toolName, category) => {
  try {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return keywords; // Return original keywords if no API key
    }
    
    const prompt = `
    I need to create a professional description for a tech tool based on these keywords: "${keywords}"
    
    The tool name is: ${toolName}
    Category: ${category}
    
    Please create a concise, informative description (2-3 sentences) that explains what this tool does and its primary use cases.
    
    The description should be factual, clear, and helpful for someone learning about this tool.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for tool description:', error);
    return keywords; // Fallback to original keywords if enhancement fails
  }
};

/**
 * Generate required skills for a target role using Gemini AI
 * Enhanced with better prompts and comprehensive fallback handling
 * @param {string} targetRole - The target role 
 * @returns {Array} - Array of required skills with details
 */
const generateRequiredSkillsForRole = async (targetRole) => {
  try {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.warn(`⚠️  No Gemini API key found. Using fallback skills for ${targetRole}`);
      return fallbackSkillsForRole(targetRole);
    }

    // Enhanced prompt for better skill generation
    const prompt = `Generate a detailed list of 8-12 key technical skills specifically required for a "${targetRole}" role in the tech industry.

The skills should be directly relevant to this specific role and not generic skills that apply to all tech roles.

For each skill, provide:
1. Skill name (specific technology, language, framework, or technical concept)
2. Importance level (Essential, Important, Helpful)
3. Short description that explains why this skill matters for a ${targetRole} (max 100 characters)
4. Estimated learning time in months

For example, if the role is "Frontend Developer", include skills like React, JavaScript, CSS, etc.
If the role is "Data Scientist", include skills like Python, SQL, Machine Learning, etc.
If the role is "DevOps Engineer", include skills like Docker, Kubernetes, CI/CD, etc.

Ensure all skills are specifically relevant to a ${targetRole} role based on current industry standards.

Format the response as a JSON array of objects with the following structure:
[{
  "skillName": "Name of skill",
  "importance": "Essential/Important/Helpful", 
  "description": "Brief description focused on this role",
  "learningTimeMonths": number
}]

Make sure the JSON is valid and properly formatted.`;

    console.log(`🤖 Generating skills for role: ${targetRole} using Gemini AI`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('📄 Gemini AI response received, parsing JSON...');
    console.log('📄 Response preview:', responseText.substring(0, 200) + '...');
    
    // Extract JSON from response using regex
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️  No valid JSON array found in Gemini response, using fallback');
      console.warn('📄 Full response:', responseText);
      return fallbackSkillsForRole(targetRole);
    }
    
    try {
      const skills = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!Array.isArray(skills) || skills.length === 0) {
        console.warn('⚠️  Invalid skills array from Gemini, using fallback');
        console.warn('📄 Parsed skills:', skills);
        return fallbackSkillsForRole(targetRole);
      }
      
      // Validate each skill object
      const validSkills = skills.filter(skill => 
        skill.skillName && 
        skill.importance && 
        skill.description && 
        typeof skill.learningTimeMonths === 'number'
      );
      
      if (validSkills.length === 0) {
        console.warn('⚠️  No valid skills found in Gemini response, using fallback');
        console.warn('📄 Skills before validation:', skills);
        return fallbackSkillsForRole(targetRole);
      }
      
      console.log(`✅ Successfully generated ${validSkills.length} skills for ${targetRole} using Gemini AI`);
      console.log('📋 Generated skills:', validSkills.map(s => s.skillName).join(', '));
      return validSkills;
      
    } catch (parseError) {
      console.error('❌ Error parsing Gemini JSON response:', parseError);
      console.error('📄 Raw response that failed to parse:', responseText);
      return fallbackSkillsForRole(targetRole);
    }
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    console.error('📄 Error details:', error.message);
    return fallbackSkillsForRole(targetRole);
  }
};

/**
 * Enhanced fallback skills for common roles when Gemini is not available
 * @param {string} targetRole - The target role
 * @returns {Array} - Array of required skills with details
 */
const fallbackSkillsForRole = (targetRole) => {
  const normalizedRole = targetRole.toLowerCase();
  
  // Frontend Developer Skills
  if (normalizedRole.includes('front') || normalizedRole.includes('ui') || normalizedRole.includes('ux')) {
    return [
      {
        skillName: "HTML5",
        importance: "Essential",
        description: "Core markup language for structuring web content",
        learningTimeMonths: 1
      },
      {
        skillName: "CSS3",
        importance: "Essential", 
        description: "Styling and layout for web pages and responsive design",
        learningTimeMonths: 2
      },
      {
        skillName: "JavaScript",
        importance: "Essential",
        description: "Core programming language for interactive web applications",
        learningTimeMonths: 3
      },
      {
        skillName: "React",
        importance: "Essential",
        description: "Popular JavaScript library for building user interfaces",
        learningTimeMonths: 2
      },
      {
        skillName: "Responsive Design",
        importance: "Important",
        description: "Creating layouts that work across different screen sizes",
        learningTimeMonths: 1
      },
      {
        skillName: "Git Version Control",
        importance: "Essential",
        description: "Track changes and collaborate on code projects",
        learningTimeMonths: 1
      },
      {
        skillName: "Web Accessibility",
        importance: "Important",
        description: "Making websites usable for people with disabilities",
        learningTimeMonths: 1
      },
      {
        skillName: "API Integration",
        importance: "Important",
        description: "Connecting frontend applications with backend services",
        learningTimeMonths: 2
      }
    ];
  }
  
  // Backend Developer Skills
  if (normalizedRole.includes('back') || normalizedRole.includes('server') || normalizedRole.includes('api')) {
    return [
      {
        skillName: "Node.js",
        importance: "Essential",
        description: "JavaScript runtime for building server-side applications",
        learningTimeMonths: 3
      },
      {
        skillName: "Express.js",
        importance: "Essential",
        description: "Web framework for Node.js backend development",
        learningTimeMonths: 2
      },
      {
        skillName: "Database Design",
        importance: "Essential",
        description: "Structuring and optimizing data storage solutions",
        learningTimeMonths: 3
      },
      {
        skillName: "REST API Development",
        importance: "Essential",
        description: "Building scalable web service APIs",
        learningTimeMonths: 2
      },
      {
        skillName: "SQL",
        importance: "Essential",
        description: "Query language for relational database management",
        learningTimeMonths: 2
      },
      {
        skillName: "Authentication & Security",
        importance: "Important",
        description: "Implementing secure user authentication systems",
        learningTimeMonths: 2
      },
      {
        skillName: "Cloud Services",
        importance: "Important",
        description: "Deploying and managing applications in cloud platforms",
        learningTimeMonths: 3
      },
      {
        skillName: "Testing",
        importance: "Important",
        description: "Writing and maintaining automated tests for backend code",
        learningTimeMonths: 2
      }
    ];
  }
  
  // DevOps Engineer Skills
  if (normalizedRole.includes('devops') || normalizedRole.includes('infrastructure') || normalizedRole.includes('sre')) {
    return [
      {
        skillName: "Docker",
        importance: "Essential",
        description: "Containerization platform for consistent deployments",
        learningTimeMonths: 2
      },
      {
        skillName: "Kubernetes",
        importance: "Essential",
        description: "Container orchestration for scalable applications",
        learningTimeMonths: 4
      },
      {
        skillName: "CI/CD Pipelines",
        importance: "Essential",
        description: "Automated testing and deployment workflows",
        learningTimeMonths: 3
      },
      {
        skillName: "Infrastructure as Code",
        importance: "Essential",
        description: "Managing infrastructure through code and automation",
        learningTimeMonths: 3
      },
      {
        skillName: "Cloud Platforms",
        importance: "Essential",
        description: "AWS, Azure, or GCP for cloud infrastructure management",
        learningTimeMonths: 4
      },
      {
        skillName: "Linux Administration",
        importance: "Important",
        description: "Managing Linux servers and command-line operations",
        learningTimeMonths: 3
      },
      {
        skillName: "Monitoring & Logging",
        importance: "Important",
        description: "Setting up observability for production systems",
        learningTimeMonths: 2
      },
      {
        skillName: "Networking",
        importance: "Important",
        description: "Understanding network protocols and security",
        learningTimeMonths: 3
      }
    ];
  }
  
  // Data Scientist Skills
  if (normalizedRole.includes('data') && (normalizedRole.includes('scientist') || normalizedRole.includes('analyst'))) {
    return [
      {
        skillName: "Python",
        importance: "Essential",
        description: "Primary programming language for data science",
        learningTimeMonths: 3
      },
      {
        skillName: "SQL",
        importance: "Essential",
        description: "Querying and manipulating databases for analysis",
        learningTimeMonths: 2
      },
      {
        skillName: "Machine Learning",
        importance: "Essential",
        description: "Building predictive models and algorithms",
        learningTimeMonths: 6
      },
      {
        skillName: "Statistics",
        importance: "Essential",
        description: "Statistical methods for data analysis and inference",
        learningTimeMonths: 4
      },
      {
        skillName: "Data Visualization",
        importance: "Important",
        description: "Creating charts and dashboards to communicate insights",
        learningTimeMonths: 2
      },
      {
        skillName: "Pandas & NumPy",
        importance: "Essential",
        description: "Python libraries for data manipulation and analysis",
        learningTimeMonths: 2
      },
      {
        skillName: "Deep Learning",
        importance: "Important",
        description: "Neural networks for complex pattern recognition",
        learningTimeMonths: 4
      },
      {
        skillName: "R Programming",
        importance: "Helpful",
        description: "Statistical computing language for advanced analytics",
        learningTimeMonths: 3
      }
    ];
  }
  
  // Cloud Engineer Skills
  if (normalizedRole.includes('cloud')) {
    return [
      {
        skillName: "AWS Services",
        importance: "Essential",
        description: "Amazon Web Services for cloud infrastructure",
        learningTimeMonths: 4
      },
      {
        skillName: "Azure Platform",
        importance: "Important",
        description: "Microsoft cloud computing services",
        learningTimeMonths: 4
      },
      {
        skillName: "Terraform",
        importance: "Essential",
        description: "Infrastructure as Code for cloud resource management",
        learningTimeMonths: 3
      },
      {
        skillName: "Cloud Security",
        importance: "Essential",
        description: "Securing cloud environments and data",
        learningTimeMonths: 3
      },
      {
        skillName: "Serverless Computing",
        importance: "Important",
        description: "Building applications without managing servers",
        learningTimeMonths: 2
      },
      {
        skillName: "Container Services",
        importance: "Important",
        description: "Managing containerized applications in cloud",
        learningTimeMonths: 3
      },
      {
        skillName: "Cloud Networking",
        importance: "Important",
        description: "Virtual networks and connectivity in cloud platforms",
        learningTimeMonths: 3
      },
      {
        skillName: "Cost Optimization",
        importance: "Important",
        description: "Managing and optimizing cloud spending",
        learningTimeMonths: 2
      }
    ];
  }
  
  // Mobile Developer Skills
  if (normalizedRole.includes('mobile') || normalizedRole.includes('ios') || normalizedRole.includes('android')) {
    return [
      {
        skillName: "React Native",
        importance: "Essential",
        description: "Cross-platform mobile app development framework",
        learningTimeMonths: 3
      },
      {
        skillName: "Swift",
        importance: "Important",
        description: "Native iOS app development language",
        learningTimeMonths: 4
      },
      {
        skillName: "Kotlin",
        importance: "Important",
        description: "Modern language for Android app development",
        learningTimeMonths: 3
      },
      {
        skillName: "Mobile UI/UX Design",
        importance: "Essential",
        description: "Designing intuitive mobile user interfaces",
        learningTimeMonths: 2
      },
      {
        skillName: "API Integration",
        importance: "Essential",
        description: "Connecting mobile apps with backend services",
        learningTimeMonths: 2
      },
      {
        skillName: "App Store Deployment",
        importance: "Important",
        description: "Publishing apps to iOS App Store and Google Play",
        learningTimeMonths: 1
      },
      {
        skillName: "Mobile Testing",
        importance: "Important",
        description: "Testing mobile applications across devices",
        learningTimeMonths: 2
      },
      {
        skillName: "Performance Optimization",
        importance: "Important",
        description: "Optimizing mobile app performance and battery usage",
        learningTimeMonths: 2
      }
    ];
  }
  
  // Generic/Unknown Role - Return more specific skills instead of generic ones
  return [
    {
      skillName: "JavaScript",
      importance: "Essential",
      description: "Versatile programming language for web development",
      learningTimeMonths: 3
    },
    {
      skillName: "Git Version Control",
      importance: "Essential",
      description: "Track changes and collaborate on code projects",
      learningTimeMonths: 1
    },
    {
      skillName: "Problem Solving",
      importance: "Essential",
      description: "Analytical thinking and debugging skills",
      learningTimeMonths: 2
    },
    {
      skillName: "SQL",
      importance: "Important",
      description: "Database query language for data management",
      learningTimeMonths: 2
    },
    {
      skillName: "API Development",
      importance: "Important",
      description: "Building and consuming web service APIs",
      learningTimeMonths: 2
    },
    {
      skillName: "Testing",
      importance: "Important",
      description: "Writing and maintaining automated tests",
      learningTimeMonths: 2
    },
    {
      skillName: "Cloud Computing",
      importance: "Important",
      description: "Working with cloud platforms and services",
      learningTimeMonths: 3
    },
    {
      skillName: "Agile Methodology",
      importance: "Helpful",
      description: "Collaborative software development approach",
      learningTimeMonths: 1
    }
  ];
};

module.exports = {
  model,
  enhanceSkillDescription,
  enhanceToolDescription,
  generateRequiredSkillsForRole
}; 