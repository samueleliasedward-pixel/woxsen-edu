import { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import websocket from '../services/websocket';
import { useAuth } from './useAuth';

export const useStudent = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchDashboard();
      fetchCourses();
      fetchAssignments();
      fetchExams();
      fetchTimetable();
      fetchAttendance();

      // Set up WebSocket listeners
      setupWebSocketListeners();
    }

    return () => {
      // Clean up WebSocket listeners
      websocket.off('attendance-marked', handleAttendanceUpdate);
      websocket.off('grade-received', handleGradeUpdate);
      websocket.off('announcement', handleAnnouncement);
    };
  }, [user]);

  const setupWebSocketListeners = () => {
    websocket.on('attendance-marked', handleAttendanceUpdate);
    websocket.on('grade-received', handleGradeUpdate);
    websocket.on('announcement', handleAnnouncement);
  };

  const handleAttendanceUpdate = (data) => {
    // Refresh attendance data
    fetchAttendance();
  };

  const handleGradeUpdate = (data) => {
    // Refresh assignments to show new grades
    fetchAssignments();
  };

  const handleAnnouncement = (data) => {
    // Show notification
    console.log('New announcement:', data);
  };

  const fetchDashboard = async () => {
    try {
      const response = await studentApi.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await studentApi.getCourses();
      setCourses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await studentApi.getAssignments();
      setAssignments(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await studentApi.getExams();
      setExams(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await studentApi.getTimetable();
      setTimetable(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAttendance = async () => {
    try {
      if (user?.studentProfile?.id) {
        const response = await attendanceApi.getStudentAttendance(user.studentProfile.id);
        setAttendance(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const submitAssignment = async (assignmentId, data) => {
    try {
      const response = await studentApi.submitAssignment(assignmentId, data);
      // Refresh assignments after submission
      await fetchAssignments();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    dashboard,
    courses,
    assignments,
    exams,
    timetable,
    attendance,
    loading,
    error,
    submitAssignment,
    refresh: {
      dashboard: fetchDashboard,
      courses: fetchCourses,
      assignments: fetchAssignments,
      exams: fetchExams,
      timetable: fetchTimetable,
      attendance: fetchAttendance
    }
  };
};