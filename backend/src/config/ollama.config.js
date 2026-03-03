import config from './env.js'; 
 
export const ollamaConfig = { 
  baseUrl: config.aiServiceUrl, 
  model: 'mistral', // or 'llama2', 'codellama', etc. 
   
  endpoints: { 
    chat: '/api/chat', 
    generate: '/api/generate', 
    embeddings: '/api/embeddings' 
  }, 
   
  defaultParams: { 
    temperature: 0.7, 
    top_p: 0.9, 
    max_tokens: 500 
  } 
}; 
 
export default ollamaConfig;