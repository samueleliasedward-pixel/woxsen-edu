import api from './api';

export const facultyApi = {
  // Dashboard
  getDashboard: () => api.get('/faculty/dashboard'),
  
  // Courses
  getCourses: () => api.get('/faculty/courses'),
  getCourseDetails: (courseId) => api.get(`/faculty/courses/${courseId}`),
  
  // Assignments
  getAssignments: () => api.get('/faculty/assignments'),
  createAssignment: (data) => api.post('/faculty/assignments', data),
  updateAssignment: (id, data) => api.put(`/faculty/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/faculty/assignments/${id}`),
  
  // Gradebook
  getGradebook: (courseId) => api.get(`/faculty/gradebook/${courseId}`),
  updateGrade: (submissionId, data) => api.put(`/faculty/grade/${submissionId}`, data),
  
  // Students
  getStudents: () => api.get('/faculty/students'),
  getStudentDetails: (studentId) => api.get(`/faculty/students/${studentId}`),
  
  // Schedule
  getSchedule: () => api.get('/faculty/schedule'),
  
  // Announcements
  createAnnouncement: (data) => api.post('/faculty/announcements', data),
  getAnnouncements: () => api.get('/faculty/announcements')
};