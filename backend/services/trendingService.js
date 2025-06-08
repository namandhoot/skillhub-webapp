const sheetsService = require('./sheetsService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// Fallback data
const fallbackSkills = [
  {
    skillId: 'S001',
    skillName: 'React.js',
    category: 'Frontend Development',
    demandLevel: 'Very High',
    growthRate: 'Rapid',
    averageSalary: '$110,000'
  },
  {
    skillId: 'S002',
    skillName: 'Python',
    category: 'Programming Languages',
    demandLevel: 'Very High',
    growthRate: 'Rapid',
    averageSalary: '$120,000'
  },
  {
    skillId: 'S003',
    skillName: 'Data Science',
    category: 'Data',
    demandLevel: 'High',
    growthRate: 'Rapid',
    averageSalary: '$130,000'
  },
  {
    skillId: 'S004',
    skillName: 'Cloud Architecture',
    category: 'Cloud Computing',
    demandLevel: 'Very High',
    growthRate: 'Rapid',
    averageSalary: '$150,000'
  },
  {
    skillId: 'S005',
    skillName: 'DevOps',
    category: 'DevOps',
    demandLevel: 'High',
    growthRate: 'Rapid',
    averageSalary: '$125,000'
  },
  {
    skillId: 'S006',
    skillName: 'TypeScript',
    category: 'Programming Languages',
    demandLevel: 'High',
    growthRate: 'Rapid',
    averageSalary: '$115,000'
  },
  {
    skillId: 'S007',
    skillName: 'Node.js',
    category: 'Backend Development',
    demandLevel: 'High',
    growthRate: 'Steady',
    averageSalary: '$105,000'
  }
];

const fallbackTools = [
  {
    toolId: 'T001',
    toolName: 'Visual Studio Code',
    category: 'Development Tools',
    primaryUseCases: 'Code editing, debugging, and version control integration',
    skillLevelRequired: 'Beginner',
    growthTrend: 'Rapidly Growing'
  },
  {
    toolId: 'T002',
    toolName: 'Docker',
    category: 'DevOps',
    primaryUseCases: 'Containerization and deployment',
    skillLevelRequired: 'Intermediate',
    growthTrend: 'Rapidly Growing'
  },
  {
    toolId: 'T003',
    toolName: 'TensorFlow',
    category: 'AI/ML',
    primaryUseCases: 'Building and training machine learning models',
    skillLevelRequired: 'Advanced',
    growthTrend: 'Growing'
  },
  {
    toolId: 'T004',
    toolName: 'React DevTools',
    category: 'Development Tools',
    primaryUseCases: 'Debugging and profiling React applications',
    skillLevelRequired: 'Intermediate',
    growthTrend: 'Growing'
  },
  {
    toolId: 'T005',
    toolName: 'Kubernetes',
    category: 'DevOps',
    primaryUseCases: 'Container orchestration and scaling',
    skillLevelRequired: 'Advanced',
    growthTrend: 'Rapidly Growing'
  },
  {
    toolId: 'T006',
    toolName: 'GitHub Copilot',
    category: 'AI Tools',
    primaryUseCases: 'AI-assisted code generation',
    skillLevelRequired: 'Beginner',
    growthTrend: 'Rapidly Growing'
  }
];

// Get trending skills analysis
const getTrendingSkills = async () => {
  try {
    let skills = await sheetsService.getSkillsData();
    
    // If no skills data is found, use fallback data
    if (!skills || skills.length === 0) {
      console.log('No skills data found, using fallback data');
      skills = fallbackSkills;
    }
    
    // Get high demand skills
    const highDemandSkills = skills.filter(skill => 
      ['High', 'Very High'].includes(skill.demandLevel)
    );
    
    // Get rapid growth skills
    const rapidGrowthSkills = skills.filter(skill => 
      skill.growthRate === 'Rapid'
    );
    
    // Get skills with high salary
    const highSalarySkills = skills.sort((a, b) => {
      const salaryA = parseInt(a.averageSalary?.replace(/[^0-9]/g, '') || '0');
      const salaryB = parseInt(b.averageSalary?.replace(/[^0-9]/g, '') || '0');
      return salaryB - salaryA;
    }).slice(0, 10);
    
    // Get skills by category
    const categories = [...new Set(skills.map(skill => skill.category))];
    const skillsByCategory = {};
    
    categories.forEach(category => {
      skillsByCategory[category] = skills.filter(skill => 
        skill.category === category
      ).sort((a, b) => {
        const demandOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (demandOrder[b.demandLevel] || 0) - (demandOrder[a.demandLevel] || 0);
      }).slice(0, 5); // Top 5 skills per category
    });
    
    return {
      topDemandSkills: highDemandSkills.slice(0, 10),
      topGrowthSkills: rapidGrowthSkills.slice(0, 10),
      topSalarySkills: highSalarySkills,
      skillsByCategory
    };
  } catch (error) {
    console.error('Trending skills analysis error:', error);
    // Return fallback data in case of error
    const skills = fallbackSkills;
    return {
      topDemandSkills: skills.filter(s => ['High', 'Very High'].includes(s.demandLevel)).slice(0, 10),
      topGrowthSkills: skills.filter(s => s.growthRate === 'Rapid').slice(0, 10),
      topSalarySkills: skills.sort((a, b) => parseInt(b.averageSalary?.replace(/[^0-9]/g, '') || '0') - parseInt(a.averageSalary?.replace(/[^0-9]/g, '') || '0')).slice(0, 10),
      skillsByCategory: Object.fromEntries([...new Set(skills.map(s => s.category))].map(cat => [cat, skills.filter(s => s.category === cat).slice(0, 5)]))
    };
  }
};

// Get trending tools analysis
const getTrendingTools = async () => {
  try {
    let tools = await sheetsService.getToolsData();
    
    // If no tools data is found, use fallback data
    if (!tools || tools.length === 0) {
      console.log('No tools data found, using fallback data');
      tools = fallbackTools;
    }
    
    // Get growing tools
    const growingTools = tools.filter(tool => 
      ['Growing', 'Rapidly Growing'].includes(tool.growthTrend)
    );
    
    // Get tools by category
    const categories = [...new Set(tools.map(tool => tool.category))];
    const toolsByCategory = {};
    
    categories.forEach(category => {
      toolsByCategory[category] = tools.filter(tool => 
        tool.category === category
      ).sort((a, b) => {
        const growthOrder = { 'Rapidly Growing': 3, 'Growing': 2, 'Stable': 1, 'Declining': 0 };
        return (growthOrder[b.growthTrend] || 0) - (growthOrder[a.growthTrend] || 0);
      }).slice(0, 5); // Top 5 tools per category
    });
    
    return {
      topGrowthTools: growingTools.slice(0, 10),
      toolsByCategory
    };
  } catch (error) {
    console.error('Trending tools analysis error:', error);
    // Return fallback data in case of error
    const tools = fallbackTools;
    return {
      topGrowthTools: tools.filter(t => ['Growing', 'Rapidly Growing'].includes(t.growthTrend)).slice(0, 10),
      toolsByCategory: Object.fromEntries([...new Set(tools.map(t => t.category))].map(cat => [cat, tools.filter(t => t.category === cat).slice(0, 5)]))
    };
  }
};

// Get enhanced trends analysis using Gemini API
const getEnhancedTrendsAnalysis = async () => {
  try {
    const skills = await sheetsService.getSkillsData() || fallbackSkills;
    const tools = await sheetsService.getToolsData() || fallbackTools;
    
    // Prepare data for Gemini
    const highDemandSkills = skills
      .filter(skill => ['High', 'Very High'].includes(skill.demandLevel))
      .slice(0, 10)
      .map(skill => skill.skillName);
    
    const rapidGrowthSkills = skills
      .filter(skill => skill.growthRate === 'Rapid')
      .slice(0, 10)
      .map(skill => skill.skillName);
    
    const growingTools = tools
      .filter(tool => ['Growing', 'Rapidly Growing'].includes(tool.growthTrend))
      .slice(0, 10)
      .map(tool => tool.toolName);
    
    const prompt = `
    I'm analyzing tech industry trends based on the following data:
    
    Top in-demand skills: ${highDemandSkills.join(', ')}
    
    Fastest growing skills: ${rapidGrowthSkills.join(', ')}
    
    Trending tools and technologies: ${growingTools.join(', ')}
    
    Please provide:
    1. A brief analysis of current industry trends based on this data
    2. Insights into what these trends suggest about the future job market
    3. Recommendations for professionals looking to stay relevant
    
    Keep your response under 500 words and focus on practical insights.
    `;
    
    try {
      if (!model) {
        throw new Error('Gemini API not configured');
      }
      const result = await model.generateContent(prompt);
      const response = result.response;
      const enhancedAnalysis = response.text();
      return enhancedAnalysis;
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Fallback response when Gemini API is not available
      return `
## Industry Trends Analysis

Based on the current skills and tools data, we observe several key trends in the tech industry:

1. Current Market Dynamics
- High demand for ${highDemandSkills.slice(0, 3).join(', ')} indicates a strong focus on modern web development and cloud technologies
- The rapid growth of ${rapidGrowthSkills.slice(0, 3).join(', ')} suggests an industry shift towards automation and AI-driven solutions
- Tools like ${growingTools.slice(0, 3).join(', ')} are becoming essential for modern development workflows

2. Future Job Market Outlook
- The convergence of development and operations skills suggests a continued trend toward DevOps practices
- AI and machine learning capabilities are becoming increasingly important across all tech roles
- Cloud and distributed systems knowledge remains crucial for career growth

3. Professional Development Recommendations
- Focus on building a strong foundation in core technologies while staying adaptable to new tools
- Invest time in learning automation and AI-assisted development tools
- Develop cross-functional skills that combine technical expertise with business understanding
- Stay updated with cloud platforms and containerization technologies

The data suggests a tech landscape that increasingly values versatility and continuous learning, with particular emphasis on cloud-native development, AI integration, and automated workflows.
      `;
    }
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return `Error generating enhanced analysis. Please try again later.`;
  }
};

module.exports = {
  getTrendingSkills,
  getTrendingTools,
  getEnhancedTrendsAnalysis
}; 