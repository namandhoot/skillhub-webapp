const axios = require('axios');
require('dotenv').config();
const courseraService = require('./courseraService');

/**
 * YouTube Resources Service
 * Fetches learning resources from YouTube based on skills and target roles
 */

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Mock data for development (in a real app, these would come from a database or API)
const roleBasedCourses = {
  'Frontend Developer': [
    {
      title: 'Complete Front-End Web Development Course',
      url: 'https://www.youtube.com/playlist?list=PL0Zuz27SZ-6Pk-QJIdGd1tGZEzy9RTgtj',
      thumbnail: 'https://i.ytimg.com/vi/QA0XpGhiz5w/hqdefault.jpg',
      author: 'Dave Gray',
      description: 'Learn HTML, CSS, JavaScript, React, and more to become a frontend developer.'
    },
    {
      title: 'React JS Course for Beginners',
      url: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
      thumbnail: 'https://i.ytimg.com/vi/RVFAyFWO4go/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn React from scratch in this comprehensive guide for beginners.'
    },
    {
      title: 'CSS Complete Course',
      url: 'https://www.youtube.com/watch?v=n4R2E7O-Ngo',
      thumbnail: 'https://i.ytimg.com/vi/n4R2E7O-Ngo/hqdefault.jpg',
      author: 'Dave Gray',
      description: 'Master CSS with this complete course - from basics to advanced.'
    }
  ],
  'Backend Developer': [
    {
      title: 'Node.js and Express.js - Full Course',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Node.js and Express from scratch.'
    },
    {
      title: 'MongoDB Complete Course',
      url: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
      thumbnail: 'https://i.ytimg.com/vi/c2M-rlkkT5o/hqdefault.jpg',
      author: 'Bogdan Stashchuk',
      description: 'Learn MongoDB database from scratch.'
    },
    {
      title: 'API Development with Node.js',
      url: 'https://www.youtube.com/watch?v=rltfdjcXjmk',
      thumbnail: 'https://i.ytimg.com/vi/rltfdjcXjmk/hqdefault.jpg',
      author: 'Academind',
      description: 'Build RESTful APIs with Node.js, Express and MongoDB.'
    }
  ],
  'Full Stack Developer': [
    {
      title: 'MERN Stack Course',
      url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
      thumbnail: 'https://i.ytimg.com/vi/7CqJlxBYj-M/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn to build a complete app with the MERN stack.'
    },
    {
      title: 'Full Stack Development Tutorial',
      url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
      thumbnail: 'https://i.ytimg.com/vi/nu_pCVPKzTk/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Full Stack React & Django Application Tutorial.'
    },
    {
      title: 'JavaScript Full Course',
      url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
      thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn JavaScript from basics to advanced concepts.'
    }
  ],
  'Data Scientist': [
    {
      title: 'Python for Data Science Full Course',
      url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
      thumbnail: 'https://i.ytimg.com/vi/LHBE6Q9XlzI/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Python for Data Science from scratch.'
    },
    {
      title: 'Data Science Full Course',
      url: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
      thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/hqdefault.jpg',
      author: 'Edureka',
      description: 'Complete data science training from basic to advanced concepts.'
    },
    {
      title: 'Machine Learning Course for Beginners',
      url: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      thumbnail: 'https://i.ytimg.com/vi/NWONeJKn6kc/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn machine learning fundamentals with Python.'
    }
  ],
  'DevOps Engineer': [
    {
      title: 'DevOps Engineering Course',
      url: 'https://www.youtube.com/watch?v=j5Zsa_eOXeY',
      thumbnail: 'https://i.ytimg.com/vi/j5Zsa_eOXeY/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn DevOps engineering concepts and tools.'
    },
    {
      title: 'Docker and Kubernetes Tutorial',
      url: 'https://www.youtube.com/watch?v=bhBSlnQcq2k',
      thumbnail: 'https://i.ytimg.com/vi/bhBSlnQcq2k/hqdefault.jpg',
      author: 'Amigoscode',
      description: 'Learn Docker and Kubernetes from scratch.'
    },
    {
      title: 'Jenkins CI/CD Pipeline Tutorial',
      url: 'https://www.youtube.com/watch?v=7KCS70sCoK0',
      thumbnail: 'https://i.ytimg.com/vi/7KCS70sCoK0/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Learn how to set up CI/CD pipelines with Jenkins.'
    }
  ]
};

// Skill based courses
const skillBasedCourses = {
  'Java Core (JDK)': [
    {
      title: 'Java Programming Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
      thumbnail: 'https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn Java programming from scratch in this comprehensive guide.',
      type: 'video',
      source: 'YouTube',
      qualityScore: 18,
      qualityIndicator: 'Highly Recommended',
      formattedViews: '5.2M',
      formattedLikes: '120K',
      formattedDuration: '2:30:45'
    },
    {
      title: 'Java Full Course 2024',
      url: 'https://www.youtube.com/watch?v=CFD9EFcNZTQ',
      thumbnail: 'https://i.ytimg.com/vi/CFD9EFcNZTQ/hqdefault.jpg',
      author: 'freeCodeCamp.org',
      description: 'Complete Java course covering core concepts, OOP, and advanced features.',
      type: 'video',
      source: 'YouTube',
      qualityScore: 17,
      qualityIndicator: 'Highly Recommended',
      formattedViews: '1.8M',
      formattedLikes: '45K',
      formattedDuration: '12:00:00'
    },
    {
      title: 'Java Documentation',
      url: 'https://docs.oracle.com/en/java/',
      thumbnail: 'https://www.oracle.com/a/ocom/img/rc24/java-logo-vert-blk.png',
      author: 'Oracle',
      description: 'Official Java documentation with tutorials, API references, and best practices.',
      type: 'documentation',
      source: 'documentation',
      qualityScore: 19,
      qualityIndicator: 'Highly Recommended'
    }
  ],
  'JavaScript': [
    {
      title: 'JavaScript Full Course for Beginners',
      url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
      thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn JavaScript from scratch in this 3-hour comprehensive course.',
      type: 'video',
      source: 'youtube',
      qualityScore: 18,
      qualityIndicator: 'Highly Recommended',
      formattedViews: '2.1M',
      formattedLikes: '45K',
      formattedDuration: '3:12:36'
    },
    {
      title: 'JavaScript Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'JavaScript basics for beginners: learn JavaScript fundamentals in 1 hour.',
      type: 'video',
      source: 'youtube',
      qualityScore: 16,
      qualityIndicator: 'Recommended',
      formattedViews: '1.8M',
      formattedLikes: '38K',
      formattedDuration: '1:48:22'
    },
    {
      title: 'JavaScript Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Official JavaScript documentation with guides, references, and examples.',
      type: 'documentation',
      source: 'documentation',
      qualityScore: 20,
      qualityIndicator: 'Highly Recommended'
    }
  ],
  'React': [
    {
      title: 'React JS Course for Beginners',
      url: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
      thumbnail: 'https://i.ytimg.com/vi/RVFAyFWO4go/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn React from scratch in this comprehensive guide for beginners.',
      type: 'video',
      source: 'youtube',
      qualityScore: 17,
      qualityIndicator: 'Highly Recommended',
      formattedViews: '1.5M',
      formattedLikes: '35K',
      formattedDuration: '2:45:18'
    },
    {
      title: 'React Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn React fundamentals in this beginner-friendly tutorial.',
      type: 'video',
      source: 'youtube',
      qualityScore: 15,
      qualityIndicator: 'Recommended',
      formattedViews: '980K',
      formattedLikes: '28K',
      formattedDuration: '2:15:45'
    },
    {
      title: 'React Documentation',
      url: 'https://react.dev/',
      thumbnail: 'https://react.dev/images/og-home.png',
      author: 'React Team',
      description: 'Official React documentation with guides, API references, and examples.',
      type: 'documentation',
      source: 'documentation',
      qualityScore: 19,
      qualityIndicator: 'Highly Recommended'
    }
  ],
  'Python': [
    {
      title: 'Python for Beginners - Full Course',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Python - Full Course for Beginners',
      type: 'video',
      source: 'youtube',
      qualityScore: 18,
      qualityIndicator: 'Highly Recommended',
      formattedViews: '2.5M',
      formattedLikes: '52K',
      formattedDuration: '4:26:51'
    },
    {
      title: 'Python Tutorial - Python Full Course for Beginners',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Python tutorial for beginners - Learn Python for machine learning and web development.',
      type: 'video',
      source: 'youtube',
      qualityScore: 16,
      qualityIndicator: 'Recommended',
      formattedViews: '1.9M',
      formattedLikes: '42K',
      formattedDuration: '3:36:49'
    },
    {
      title: 'Python Documentation',
      url: 'https://docs.python.org/3/',
      thumbnail: 'https://www.python.org/static/opengraph-icon-200x200.png',
      author: 'Python Team',
      description: 'Official Python documentation with tutorials, references, and guides.',
      type: 'documentation',
      source: 'documentation',
      qualityScore: 19,
      qualityIndicator: 'Highly Recommended'
    }
  ],
  'Node.js': [
    {
      title: 'Node.js and Express.js - Full Course',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Node.js and Express from scratch in this 8-hour course.'
    },
    {
      title: 'Node.js Tutorial for Beginners: Learn Node in 1 Hour',
      url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
      thumbnail: 'https://i.ytimg.com/vi/TlB_eWDSMt4/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Node.js tutorial for beginners: Learn Node.js in 1 hour and start building your own web applications.'
    },
    {
      title: 'Node.js Documentation',
      url: 'https://nodejs.org/en/docs/',
      thumbnail: 'https://nodejs.org/static/images/logo-hexagon-card.png',
      author: 'Node.js',
      description: 'Official Node.js documentation with API references, guides, and tutorials.',
      type: 'documentation'
    }
  ],
  'AWS': [
    {
      title: 'AWS Certified Cloud Practitioner Training',
      url: 'https://www.youtube.com/watch?v=3hLmDS179YE',
      thumbnail: 'https://i.ytimg.com/vi/3hLmDS179YE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Complete AWS Cloud Practitioner certification training course.'
    },
    {
      title: 'AWS Basics for Beginners',
      url: 'https://www.youtube.com/watch?v=ulprqHHWlng',
      thumbnail: 'https://i.ytimg.com/vi/ulprqHHWlng/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Learn AWS basics and core services for beginners in this comprehensive guide.'
    },
    {
      title: 'AWS Documentation',
      url: 'https://docs.aws.amazon.com/',
      thumbnail: 'https://a0.awsstatic.com/libra-css/images/site/touch-icon-ipad-144-smile.png',
      author: 'Amazon Web Services',
      description: 'Official AWS documentation with service guides, API references, and best practices.',
      type: 'documentation'
    }
  ],
  'Docker': [
    {
      title: 'Docker Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI',
      thumbnail: 'https://i.ytimg.com/vi/pTFZFxd4hOI/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn Docker in 2 hours - Docker tutorial for beginners and intermediate users.'
    },
    {
      title: 'Docker Crash Course for Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=pg19Z8LL06w',
      thumbnail: 'https://i.ytimg.com/vi/pg19Z8LL06w/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Docker crash course for beginners - learn everything you need to know about Docker.'
    },
    {
      title: 'Docker Documentation',
      url: 'https://docs.docker.com/',
      thumbnail: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
      author: 'Docker',
      description: 'Official Docker documentation with guides, references, and examples.',
      type: 'documentation'
    }
  ],
  'Machine Learning': [
    {
      title: 'Machine Learning for Everybody',
      url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
      thumbnail: 'https://i.ytimg.com/vi/i_LwzRVP7bg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn machine learning concepts in a beginner-friendly way.'
    },
    {
      title: 'Machine Learning with Python',
      url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
      thumbnail: 'https://i.ytimg.com/vi/7eh4d6sabA0/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn machine learning using Python and scikit-learn library.'
    },
    {
      title: 'Machine Learning Documentation',
      url: 'https://scikit-learn.org/stable/user_guide.html',
      thumbnail: 'https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png',
      author: 'Scikit-learn',
      description: 'Scikit-learn machine learning library documentation with guides and tutorials.',
      type: 'documentation'
    }
  ],
  'CSS': [
    {
      title: 'CSS Crash Course For Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
      thumbnail: 'https://i.ytimg.com/vi/yfoY53QXEnI/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn CSS in this complete crash course for beginners.'
    },
    {
      title: 'CSS Tutorial - Zero to Hero (Complete Course)',
      url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      thumbnail: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Complete CSS course covering basics to advanced concepts like Flexbox and Grid.'
    },
    {
      title: 'CSS Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Comprehensive CSS documentation with tutorials, references, and examples.',
      type: 'documentation'
    }
  ],
  'HTML': [
    {
      title: 'HTML Crash Course For Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      thumbnail: 'https://i.ytimg.com/vi/UB1O30fR-EE/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn HTML in this complete crash course for beginners.'
    },
    {
      title: 'HTML Full Course - Build a Website Tutorial',
      url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
      thumbnail: 'https://i.ytimg.com/vi/pQN-pnXPaVg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn HTML5 and build a complete website in this comprehensive course.'
    },
    {
      title: 'HTML Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Complete HTML documentation with elements reference, guides, and tutorials.',
      type: 'documentation'
    }
  ],
  'SQL': [
    {
      title: 'SQL Tutorial - Full Database Course for Beginners',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
      thumbnail: 'https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn SQL in this complete database course for beginners.'
    },
    {
      title: 'SQL Crash Course - Beginner to Intermediate',
      url: 'https://www.youtube.com/watch?v=nWeW3sCmD2k',
      thumbnail: 'https://i.ytimg.com/vi/nWeW3sCmD2k/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'SQL crash course covering basic to intermediate concepts for database management.'
    },
    {
      title: 'SQL Documentation',
      url: 'https://www.w3schools.com/sql/',
      thumbnail: 'https://www.w3schools.com/favicon.ico',
      author: 'W3Schools',
      description: 'Comprehensive SQL tutorial and reference with examples and exercises.',
      type: 'documentation'
    }
  ],
  'MongoDB': [
    {
      title: 'MongoDB Crash Course',
      url: 'https://www.youtube.com/watch?v=-56x56UppqQ',
      thumbnail: 'https://i.ytimg.com/vi/-56x56UppqQ/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn MongoDB basics in this comprehensive crash course.'
    },
    {
      title: 'MongoDB Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=ExcRbA7fy_A',
      thumbnail: 'https://i.ytimg.com/vi/ExcRbA7fy_A/hqdefault.jpg',
      author: 'Academind',
      description: 'Complete MongoDB tutorial covering all the fundamentals you need to know.'
    },
    {
      title: 'MongoDB Documentation',
      url: 'https://docs.mongodb.com/',
      thumbnail: 'https://webimages.mongodb.com/_com_assets/cms/kuyj3d95v5vbmm2fs-horizontal_white.svg?auto=format%252Ccompress',
      author: 'MongoDB',
      description: 'Official MongoDB documentation with guides, tutorials, and reference materials.',
      type: 'documentation'
    }
  ],
  'Git': [
    {
      title: 'Git and GitHub Crash Course For Beginners',
      url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc',
      thumbnail: 'https://i.ytimg.com/vi/SWYqp7iY_Tc/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn Git and GitHub in this essential crash course for beginners.'
    },
    {
      title: 'Git Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=8JJ101D3knE',
      thumbnail: 'https://i.ytimg.com/vi/8JJ101D3knE/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn Git fundamentals in this comprehensive tutorial for beginners.'
    },
    {
      title: 'Git Documentation',
      url: 'https://git-scm.com/doc',
      thumbnail: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
      author: 'Git',
      description: 'Official Git documentation including the reference manual and Pro Git book.',
      type: 'documentation'
    }
  ]
};

// Skill expansion mapping for better search results
const skillToExpandedTermsMap = {
  'java core (jdk)': 'java programming tutorial core jdk fundamentals',
  'javascript': 'javascript programming web development ES6',
  'python': 'python programming data science tutorial',
  'react': 'react javascript frontend web development',
  'node.js': 'node.js backend javascript server',
  'machine learning': 'machine learning artificial intelligence data science',
  'rest api': 'rest api web services http backend',
  'docker': 'docker containerization devops tutorial',
  'kubernetes': 'kubernetes container orchestration devops',
  'git': 'git version control github tutorial',
  'sql': 'sql database mysql postgresql tutorial',
  'css': 'css styling web design responsive',
  'html': 'html web development markup tutorial',
  'mongodb': 'mongodb nosql database tutorial',
  'express': 'express.js node.js backend framework',
  'angular': 'angular typescript frontend framework',
  'vue': 'vue.js javascript frontend framework',
  'aws': 'aws amazon web services cloud computing',
  'azure': 'azure microsoft cloud computing',
  'devops': 'devops ci cd automation infrastructure',
  'testing': 'software testing unit testing automation'
};

/**
 * Generate search queries based on skill type
 */
const generateSearchQueries = (skill) => {
  const normalizedSkill = skill.toLowerCase().trim();
  
  // Special queries for Java Core
  if (normalizedSkill === 'java core (jdk)') {
    return [
      'java core concepts tutorial',
      'java programming fundamentals',
      'java jdk tutorial for beginners',
      'learn java programming complete course',
      'java core concepts and oops'
    ];
  }
  
  // Base queries for all skills
  const baseQueries = [
    `${skill} programming web development tutorial`,
    `learn ${skill} programming`,
    `${skill} for beginners complete course`,
    `${skill} crash course`,
    `${skill} tutorial 2024`
  ];

  // Special queries for specific skills
  const specialQueries = {
    'rest api': [
      'RESTful API tutorial',
      'REST API design principles',
      'REST API best practices'
    ],
    'machine learning': [
      'machine learning python tutorial',
      'machine learning fundamentals',
      'ML model training tutorial'
    ],
    'react': [
      'react.js tutorial for beginners',
      'react hooks and components',
      'modern react development'
    ]
  };

  return specialQueries[normalizedSkill] || baseQueries;
};

/**
 * Check if video is tutorial content
 */
const isTutorialVideo = (title, description) => {
  const tutorialKeywords = ['tutorial', 'course', 'learn', 'guide', 'how to'];
  const content = `${title} ${description}`.toLowerCase();
  return tutorialKeywords.some(keyword => content.includes(keyword));
};

/**
 * Check if video is comprehensive content
 */
const isComprehensiveVideo = (title, description) => {
  const comprehensiveKeywords = ['complete', 'full', 'comprehensive', 'crash course'];
  const content = `${title} ${description}`.toLowerCase();
  return comprehensiveKeywords.some(keyword => content.includes(keyword));
};

/**
 * Calculate quality score for video
 */
const calculateQualityScore = (video) => {
  try {
    const viewCount = parseInt(video.statistics.viewCount) || 0;
    const likeCount = parseInt(video.statistics.likeCount) || 0;
    const commentCount = parseInt(video.statistics.commentCount) || 0;
    
    // Calculate engagement rate (likes + comments) / views
    const engagementRate = (likeCount + commentCount) / (viewCount || 1);
    
    // Calculate recency score (newer videos get higher scores)
    const publishedAt = new Date(video.snippet.publishedAt);
    const now = new Date();
    const ageInDays = (now - publishedAt) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (ageInDays / 365)); // 1 year benchmark
    
    // Base quality score calculation
    let qualityScore = (
      (Math.log10(viewCount + 1) * 0.35) +     // View count weight
      (engagementRate * 100 * 0.35) +          // Engagement rate weight
      (Math.log10(commentCount + 1) * 0.15) +  // Comment count weight
      (recencyScore * 0.15)                    // Recency weight
    );
    
    // Apply multipliers for special characteristics
    if (isTutorialVideo(video.snippet.title, video.snippet.description)) {
      qualityScore *= 1.2;  // 20% boost for tutorials
    }
    
    if (isComprehensiveVideo(video.snippet.title, video.snippet.description)) {
      qualityScore *= 1.25; // 25% boost for comprehensive content
    }
    
    if (ageInDays < 365) {
      qualityScore *= 1.1;  // 10% boost for content less than a year old
    }
    
    return qualityScore;
  } catch (error) {
    console.error('Error calculating quality score:', error);
    return 0;
  }
};

/**
 * Format numbers for display
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format duration from ISO 8601 to readable format
 */
const formatDuration = (isoDuration) => {
  try {
    const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return '0:00';
    
    const hours = parseInt(matches[1] || 0);
    const minutes = parseInt(matches[2] || 0);
    const seconds = parseInt(matches[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '0:00';
  }
};

/**
 * Fetch videos from YouTube API with detailed statistics
 */
const fetchFromYouTubeAPI = async (query, isPrimaryQuery = true) => {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    console.log(`Searching YouTube for: "${query}"`);
    
    // Search for videos
    const searchResponse = await axios.get(`${YOUTUBE_API_URL}/search`, {
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
    
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      console.log('No YouTube videos found for query:', query);
      return [];
    }
    
    // Get video IDs
    const videoIds = searchResponse.data.items.map(item => item.id.videoId);
    
    // Get detailed video information including statistics
    const videoDetailsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics,snippet',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });
    
    return processVideoResults(videoDetailsResponse.data.items, query);
  } catch (error) {
    console.error('YouTube API error:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Process and enhance video results
 */
const processVideoResults = (videos, originalQuery) => {
  const processedVideos = videos.map(video => {
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;
    
    // Calculate quality metrics
    const qualityScore = calculateQualityScore(video);
    
    // Format statistics
    const viewCount = parseInt(statistics.viewCount) || 0;
    const likeCount = parseInt(statistics.likeCount) || 0;
    const duration = formatDuration(contentDetails.duration);
    
    return {
      title: snippet.title,
      description: snippet.description ? snippet.description.substring(0, 200) + '...' : '',
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      author: snippet.channelTitle,
      source: 'YouTube',
      type: 'video',
      platform: 'YouTube',
      
      // Statistics
      viewCount,
      likeCount,
      formattedViews: formatNumber(viewCount),
      formattedLikes: formatNumber(likeCount),
      formattedDuration: duration,
      
      // Quality metrics
      qualityScore: Math.round(qualityScore * 100) / 100,
      qualityIndicator: qualityScore > 15 ? 'Highly Recommended' :
                       qualityScore > 5 ? 'Good Resource' : '',
      
      // Content flags
      isTutorial: isTutorialVideo(snippet.title, snippet.description || ''),
      isComprehensive: isComprehensiveVideo(snippet.title, snippet.description || ''),
      
      // Metadata
      publishedAt: snippet.publishedAt,
      channelId: snippet.channelId,
      videoId: video.id
    };
  });
  
  // Sort by quality score (descending)
  return processedVideos
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10); // Return top 10 videos
};

/**
 * Search YouTube for skill-specific content
 */
const searchYouTube = async (skill) => {
  console.log(`Searching YouTube for skill: ${skill}`);
  
  // Use fallback data if available
  if (skillBasedCourses[skill]) {
    console.log(`Using fallback data for skill: ${skill}`);
    return skillBasedCourses[skill];
  }
  
  const searchQueries = generateSearchQueries(skill);
  let allResults = [];
  let primaryResults = [];
  
  // Try primary query first
  for (const query of searchQueries) {
    console.log(`Searching YouTube for: "${query}"`);
    const results = await fetchFromYouTubeAPI(query, true);
    
    if (results.length > 0) {
      primaryResults = results;
      if (results.some(video => video.qualityScore > 10)) {
        console.log(`Good primary results found for ${skill}, limiting additional queries`);
        break;
      }
    }
    
    allResults = [...allResults, ...results];
  }
  
  // Use the best results
  const finalResults = primaryResults.length > 0 ? primaryResults : allResults;
  
  // Sort by quality score and limit results
  return finalResults
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 8);
};

/**
 * Search YouTube for role-specific career guidance
 */
const searchYouTubeForRole = async (targetRole) => {
  const roleQueries = [
    `become a ${targetRole} career path`,
    `${targetRole} roadmap 2024`,
    `how to become ${targetRole}`,
    `${targetRole} skills required`,
    `${targetRole} interview preparation`
  ];
  
  let allResults = [];
  
  for (const query of roleQueries) {
    const results = await fetchFromYouTubeAPI(query, true);
    if (results && results.length > 0) {
      allResults.push(...results);
    }
  }
  
  // Remove duplicates and return top results
  const uniqueResults = [];
  const seenVideoIds = new Set();
  
  for (const result of allResults) {
    if (!seenVideoIds.has(result.videoId)) {
      seenVideoIds.add(result.videoId);
      uniqueResults.push(result);
    }
  }
  
  return uniqueResults
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 5);
};

module.exports = {
  searchYouTube,
  searchYouTubeForRole,
  fetchFromYouTubeAPI,
  generateSearchQueries,
  calculateQualityScore,
  formatNumber,
  formatDuration
}; 