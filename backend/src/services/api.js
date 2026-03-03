// AI API
export const aiApi = {
  sendMessage: (data) => api.post('/ai/chat', data),
  getHistory: () => api.get('/ai/history'),
  getSession: (sessionId) => api.get(`/ai/session/${sessionId}`),
  getStatus: () => api.get('/ai/status'),
};