import api from './api';

export const attendanceApi = {
  // Mark attendance (faculty/admin only)
  markAttendance: (data) => api.post('/attendance/mark', data),
  
  // Mark bulk attendance (faculty/admin only)
  markBulkAttendance: (data) => api.post('/attendance/bulk', data),
  
  // Get course attendance (faculty/admin only)
  getCourseAttendance: (courseId, date) => 
    api.get(`/attendance/course/${courseId}`, { params: { date } }),
  
  // Get student attendance
  getStudentAttendance: (studentId, startDate, endDate) => 
    api.get(`/attendance/student/${studentId}`, { params: { startDate, endDate } }),
  
  // Get attendance analytics (faculty/admin only)
  getAttendanceAnalytics: (params) => 
    api.get('/attendance/analytics', { params })
};