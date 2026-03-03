import axios from 'axios'; 
import config from '../config/env.js'; 
import ollamaConfig from '../config/ollama.config.js'; 
import logger from '../utils/logger.js'; 
import FormData from 'form-data'; 
import fs from 'fs'; 
 
const aiClient = axios.create({ 
  baseURL: config.aiServiceUrl, 
  timeout: 30000, // 30 seconds 
}); 
 
// Request interceptor for logging 
aiClient.interceptors.request.use(request => { 
  logger.debug('AI Service Request:', { 
    url: request.url, 
    method: request.method 
  }); 
  return request; 
}); 
 
// Response interceptor 
aiClient.interceptors.response.use( 
  response => { 
    logger.debug('AI Service Response:', { 
      status: response.status, 
      size: JSON.stringify(response.data).length 
    }); 
    return response; 
  }, 
  error => { 
    logger.error('AI Service Error:', { 
      message: error.message, 
      status: error.response?.status, 
      data: error.response?.data 
    }); 
    return Promise.reject(error); 
  } 
); 
 
export const callAIService = async (endpoint, data, isFileUpload = false) => { 
  try { 
    let response; 
 
    if (isFileUpload) { 
      const formData = new FormData(); 
      formData.append('file', fs.createReadStream(data.filePath)); 
      response = await aiClient.post(endpoint, formData, { 
        headers: formData.getHeaders() 
      }); 
    } else { 
      response = await aiClient.post(endpoint, data); 
    } 
 
    return response.data; 
  } catch (error) { 
    if (error.code === 'ECONNREFUSED') { 
      logger.error('AI service is not available'); 
      throw new Error('AI service is currently unavailable'); 
    } 
    throw error; 
  } 
}; 
 
export const generateStudyPlan = async (userId, courseId) => { 
  try { 
    const response = await aiClient.post('/generate-study-plan', { 
      userId, 
      courseId 
    }); 
    return response.data; 
  } catch (error) { 
    logger.error('Failed to generate study plan:', error); 
    return null; 
  } 
}; 
 
export const summarizeNotes = async (text) => { 
  try { 
    const response = await aiClient.post('/summarize', { text }); 
    return response.data; 
  } catch (error) { 
    logger.error('Failed to summarize:', error); 
    return null; 
  } 
}; 
 
export const generateQuestions = async (topic, count = 5) => { 
  try { 
    const response = await aiClient.post('/generate-questions', { 
      topic, 
      count 
    }); 
    return response.data; 
  } catch (error) { 
    logger.error('Failed to generate questions:', error); 
    return []; 
  } 
};