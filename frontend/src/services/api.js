import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  checkStudentId: (studentId) => api.post('/auth/check-student-id', { studentId }),
  checkEmployeeId: (employeeId) => api.post('/auth/check-employee-id', { employeeId }),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
  getUserStats: () => api.get('/auth/stats'),
};

export const studentApi = {
  // Dashboard
  getDashboard: () => api.get('/student/dashboard'),
  
  // Courses
  getCourses: () => api.get('/student/courses'),
  getCourseDetails: (courseId) => api.get(`/student/courses/${courseId}`),
  getAvailableCourses: () => api.get('/courses/available'),
  
  // Assignments
  getAssignments: () => api.get('/student/assignments'),
  getAssignmentDetails: (assignmentId) => api.get(`/student/assignments/${assignmentId}`),
  submitAssignment: (assignmentId, data) => {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    return api.post(`/student/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Exams
  getExams: () => api.get('/student/exams'),
  getExamDetails: (examId) => api.get(`/student/exams/${examId}`),
  
  // Timetable
  getTimetable: () => api.get('/student/timetable'),
  
  // Files
  getFiles: () => api.get('/student/files'),
  getCourseFiles: (courseId) => api.get(`/student/files/course/${courseId}`),
  downloadFile: (fileId) => api.get(`/student/files/${fileId}/download`, { responseType: 'blob' }),
  
  // Attendance
  getAttendance: () => api.get('/student/attendance'),
  getCourseAttendance: (courseId) => api.get(`/student/attendance/course/${courseId}`),
  
  // Grades
  getGrades: () => api.get('/student/grades'),
  getCourseGrades: (courseId) => api.get(`/student/grades/course/${courseId}`),
  
  // Queries
  getQueries: () => api.get('/student/queries'),
  createQuery: (data) => api.post('/student/queries', data),
  getQueryDetails: (queryId) => api.get(`/student/queries/${queryId}`),
  updateQuery: (queryId, data) => api.put(`/student/queries/${queryId}`, data),
  deleteQuery: (queryId) => api.delete(`/student/queries/${queryId}`),
};

export const facultyApi = {
  getDashboard: () => api.get('/faculty/dashboard'),
  
  getCourses: async () => {
    console.log('📡 FacultyApi: Fetching courses...');
    const response = await api.get('/faculty/courses');
    console.log('📦 FacultyApi: Raw response:', response);
    return response.data;
  },
  
  getCourseDetails: (courseId) => api.get(`/faculty/courses/${courseId}`),
  
  getAssignments: () => api.get('/faculty/assignments'),
  
  getAssignmentDetails: (assignmentId) => api.get(`/faculty/assignments/${assignmentId}`),
  
  createAssignment: (data) => api.post('/faculty/assignments', data),
  
  updateAssignment: (assignmentId, data) => api.put(`/faculty/assignments/${assignmentId}`, data),
  
  deleteAssignment: (assignmentId) => api.delete(`/faculty/assignments/${assignmentId}`),
  
  getSubmissions: (assignmentId) => api.get(`/faculty/assignments/${assignmentId}/submissions`),
  
  gradeSubmission: (submissionId, data) => api.post(`/faculty/submissions/${submissionId}/grade`, data),
  
  getGradebook: (courseId) => api.get(`/faculty/gradebook/${courseId}`),
  
  bulkUpdateGrades: (courseId, data) => api.post(`/faculty/gradebook/${courseId}/bulk-update`, data),
  
  getStudents: () => api.get('/faculty/students'),
  
  getStudentDetails: (studentId) => api.get(`/faculty/students/${studentId}`),
  
  markAttendance: (data) => api.post('/faculty/attendance', data),
  
  getAttendance: (courseId) => api.get(`/faculty/attendance/course/${courseId}`),
  
  getSchedule: () => api.get('/faculty/schedule'),
  
  getQueries: () => api.get('/faculty/queries'),
  
  getQueryDetails: (queryId) => api.get(`/faculty/queries/${queryId}`),
  
  respondToQuery: (queryId, data) => api.post(`/faculty/queries/${queryId}/respond`, data),
  
  getAnnouncements: () => api.get('/faculty/announcements'),
  
  createAnnouncement: (data) => api.post('/faculty/announcements', data),
  
  updateAnnouncement: (id, data) => api.put(`/faculty/announcements/${id}`, data),
  
  deleteAnnouncement: (id) => api.delete(`/faculty/announcements/${id}`),
  
  uploadCourseFile: (courseId, file, data) => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    return api.post(`/faculty/courses/${courseId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getCourseFiles: (courseId) => api.get(`/faculty/courses/${courseId}/files`),
  
  deleteFile: (fileId) => api.delete(`/faculty/files/${fileId}`),
  
  updateProfile: (data) => api.put('/faculty/profile', data),
  
  getProfile: () => api.get('/faculty/profile'),
  
  createCourse: async (data) => {
    console.log('📝 FacultyApi: Creating course...', data);
    const response = await api.post('/courses', data);
    console.log('✅ FacultyApi: Create course response:', response);
    return response.data;
  },
  
  deleteCourse: async (courseId) => {
    console.log('🗑️ FacultyApi: Deleting course:', courseId);
    const response = await api.delete(`/courses/${courseId}`);
    console.log('✅ FacultyApi: Delete course response:', response);
    return response.data;
  },
  
  updateCourse: async (courseId, data) => {
    console.log('✏️ FacultyApi: Updating course:', courseId, data);
    const response = await api.put(`/courses/${courseId}`, data);
    console.log('✅ FacultyApi: Update course response:', response);
    return response.data;
  }
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentDetails: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  toggleStudentStatus: (id) => api.patch(`/admin/students/${id}/toggle-status`),
  importStudents: (data) => api.post('/admin/students/import', data),
  exportStudents: (params) => api.get('/admin/students/export', { params, responseType: 'blob' }),
  getFaculty: (params) => api.get('/admin/faculty', { params }),
  getFacultyDetails: (id) => api.get(`/admin/faculty/${id}`),
  createFaculty: (data) => api.post('/admin/faculty', data),
  updateFaculty: (id, data) => api.put(`/admin/faculty/${id}`, data),
  deleteFaculty: (id) => api.delete(`/admin/faculty/${id}`),
  toggleFacultyStatus: (id) => api.patch(`/admin/faculty/${id}/toggle-status`),
  importFaculty: (data) => api.post('/admin/faculty/import', data),
  exportFaculty: (params) => api.get('/admin/faculty/export', { params, responseType: 'blob' }),
  getCourses: (params) => api.get('/admin/courses', { params }),
  getCourseDetails: (id) => api.get(`/admin/courses/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getTimetable: (params) => api.get('/admin/timetable', { params }),
  createTimetableEntry: (data) => api.post('/admin/timetable', data),
  updateTimetableEntry: (id, data) => api.put(`/admin/timetable/${id}`, data),
  deleteTimetableEntry: (id) => api.delete(`/admin/timetable/${id}`),
  generateTimetable: (data) => api.post('/admin/timetable/generate', data),
  getDeadlines: (params) => api.get('/admin/deadlines', { params }),
  createDeadline: (data) => api.post('/admin/deadlines', data),
  updateDeadline: (id, data) => api.put(`/admin/deadlines/${id}`, data),
  deleteDeadline: (id) => api.delete(`/admin/deadlines/${id}`),
  getFiles: (params) => api.get('/admin/files', { params }),
  uploadFile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'file') {
        formData.append('file', data.file);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/admin/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  createFolder: (data) => api.post('/admin/files/folder', data),
  downloadFile: (id) => api.get(`/admin/files/download/${id}`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/admin/files/${id}`),
  updateFile: (id, data) => api.put(`/admin/files/${id}`, data),
  getFolderContents: (id) => api.get(`/admin/files/folder/${id}`),
  deleteFolder: (id) => api.delete(`/admin/files/folder/${id}`),
  updateFolder: (id, data) => api.put(`/admin/files/folder/${id}`, data),
  getStorageStats: () => api.get('/admin/files/stats'),
  getFileDetails: (id) => api.get(`/admin/files/${id}`),
  getAIMonitoring: (params) => api.get('/admin/ai-monitoring', { params }),
  getAIAnalytics: (params) => api.get('/admin/ai-monitoring/analytics', { params }),
  getAIStats: () => api.get('/admin/ai-monitoring/stats'),
  getAISessions: () => api.get('/admin/ai-monitoring/sessions'),
  getAIModels: () => api.get('/admin/ai-monitoring/models'),
  getSystemLogs: (params) => api.get('/admin/system-logs', { params }),
  getLogDetails: (id) => api.get(`/admin/system-logs/${id}`),
  exportLogs: (params) => api.get('/admin/system-logs/export', { params, responseType: 'blob' }),
  clearLogs: () => api.delete('/admin/system-logs'),
  getSecuritySettings: () => api.get('/admin/security'),
  updateSecuritySettings: (data) => api.put('/admin/security', data),
  getAuditLogs: (params) => api.get('/admin/security/audit-logs', { params }),
  getSecurityAnalytics: () => api.get('/admin/security/analytics'),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (data) => api.put('/admin/settings', data),
  getSystemHealth: () => api.get('/admin/health'),
};

export const aiApi = {
  sendMessage: (data) => api.post('/ai/chat', data),
  getSessions: () => api.get('/ai/sessions'),
  getSession: (id) => api.get(`/ai/sessions/${id}`),
  deleteSession: (id) => api.delete(`/ai/sessions/${id}`),
  getStatus: () => api.get('/ai/status'),
  pullModel: (model) => api.post(`/ai/pull/${model}`),
  getAvailableModels: () => api.get('/ai/models'),
  getModelInfo: (model) => api.get(`/ai/models/${model}`),
  deleteModel: (model) => api.delete(`/ai/models/${model}`),
};

export const queryApi = {
  getQueries: (params) => api.get('/queries', { params }),
  getQuery: (id) => api.get(`/queries/${id}`),
  createQuery: (data) => api.post('/queries', data),
  updateQuery: (id, data) => api.put(`/queries/${id}`, data),
  respondToQuery: (id, data) => api.post(`/queries/${id}/respond`, data),
  deleteQuery: (id) => api.delete(`/queries/${id}`),
  getQueryStats: () => api.get('/queries/stats'),
  getMyQueries: () => api.get('/queries/my'),
  getAssignedQueries: () => api.get('/queries/assigned'),
};

export const announcementApi = {
  getAnnouncements: (params) => api.get('/announcements', { params }),
  getAnnouncement: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  getAnnouncementStats: () => api.get('/announcements/stats'),
  getRecentAnnouncements: (limit) => api.get('/announcements/recent', { params: { limit } }),
};

export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotification: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const fileApi = {
  uploadFile: (file, data) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleFiles: (files, data) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post('/files/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFiles: (params) => api.get('/files', { params }),
  getFile: (id) => api.get(`/files/${id}`),
  getCourseFiles: (courseId) => api.get(`/files/course/${courseId}`),
  getUserFiles: () => api.get('/files/user'),
  deleteFile: (id) => api.delete(`/files/${id}`),
  downloadFile: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  updateFile: (id, data) => api.put(`/files/${id}`, data),
};

export const dashboardApi = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getFacultyDashboard: () => api.get('/dashboard/faculty'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getUpcomingEvents: () => api.get('/dashboard/upcoming'),
  getNotifications: () => api.get('/dashboard/notifications'),
};

export const healthApi = {
  check: () => api.get('/health'),
  getStatus: () => api.get('/status'),
  getServerInfo: () => api.get('/info'),
  getDatabaseStatus: () => api.get('/health/db'),
  getAIServiceStatus: () => api.get('/health/ai'),
};

export const searchApi = {
  searchAll: (query, type) => api.get('/search', { params: { q: query, type } }),
  searchStudents: (query) => api.get('/search/students', { params: { q: query } }),
  searchFaculty: (query) => api.get('/search/faculty', { params: { q: query } }),
  searchCourses: (query) => api.get('/search/courses', { params: { q: query } }),
  searchFiles: (query) => api.get('/search/files', { params: { q: query } }),
  searchAssignments: (query) => api.get('/search/assignments', { params: { q: query } }),
};

export const analyticsApi = {
  getStudentAnalytics: () => api.get('/analytics/student'),
  getFacultyAnalytics: () => api.get('/analytics/faculty'),
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getSystemAnalytics: () => api.get('/analytics/system'),
  getPerformanceMetrics: () => api.get('/analytics/performance'),
  getUserActivity: (params) => api.get('/analytics/user-activity', { params }),
  getUsageStats: () => api.get('/analytics/usage'),
};

export default api;