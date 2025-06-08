const axios = require('axios');

const YOUTUBE_API_KEY = 'AIzaSyAFl-pSj0jNBmowYw3KEwO3oboSV9avx-o';

const testYouTubeAPI = async () => {
  try {
    console.log('\n===== TESTING YOUTUBE API =====');
    
    console.log('Making test request to YouTube API...');
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: 'javascript tutorial',
        key: YOUTUBE_API_KEY
      }
    });
    
    if (response.status === 200) {
      console.log('YouTube API test successful!');
      console.log(`Response has ${response.data.items ? response.data.items.length : 0} items`);
      if (response.data.items && response.data.items.length > 0) {
        console.log('First result title:', response.data.items[0].snippet.title);
      }
    } else {
      console.error('Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('YouTube API test error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
};

testYouTubeAPI(); 