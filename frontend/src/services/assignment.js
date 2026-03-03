import api from './api';

export const assignmentApi = {
  // Get all assignments (role-based)
  getAssignments: (params) => api.get('/assignments', { params }),
  
  // Get single assignment
  getAssignment: (id) => api.get(`/assignments/${id}`),
  
  // Create assignment (faculty/admin only)
  createAssignment: (data) => api.post('/assignments', data),
  
  // Update assignment (faculty/admin only)
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  
  // Delete assignment (faculty/admin only)
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  
  // Submit assignment (student only)
  submitAssignment: (id, data) => {
    const formData = new FormData();
    if (data.files) {
      data.files.forEach(file => formData.append('files', file));
    }
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    return api.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Get submissions for an assignment (faculty only)
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  
  // Grade submission (faculty only)
  gradeSubmission: (submissionId, data) => 
    api.post(`/assignments/submissions/${submissionId}/grade`, data)
};