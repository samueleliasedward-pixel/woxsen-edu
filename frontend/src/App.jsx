// K:\woxsen-edu\frontend\src\App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import './App.css';

const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));

const Features = React.lazy(() => import('./pages/Features'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const Demo = React.lazy(() => import('./pages/Demo'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Team = React.lazy(() => import('./pages/Team'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Security = React.lazy(() => import('./pages/Security'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const StudentCourses = React.lazy(() => import('./pages/student/StudentCourses'));
const StudentAssignments = React.lazy(() => import('./pages/student/StudentAssignments'));
const StudentExams = React.lazy(() => import('./pages/student/StudentExams'));
const StudentTimetable = React.lazy(() => import('./pages/student/StudentTimetable'));
const StudentFiles = React.lazy(() => import('./pages/student/StudentFiles'));

const FacultyDashboard = React.lazy(() => import('./pages/faculty/FacultyDashboard'));
const FacultyCourses = React.lazy(() => import('./pages/faculty/MyCourses'));
const FacultyAssignments = React.lazy(() => import('./pages/faculty/FacultyAssignments'));
const FacultyGradebook = React.lazy(() => import('./pages/faculty/FacultyGradebook'));
const FacultyStudents = React.lazy(() => import('./pages/faculty/FacultyStudents'));
const FacultySchedule = React.lazy(() => import('./pages/faculty/FacultySchedule'));
const FacultyAnnouncements = React.lazy(() => import('./pages/faculty/FacultyAnnouncements'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const StudentManagement = React.lazy(() => import('./pages/admin/StudentManagement'));
const FacultyManagement = React.lazy(() => import('./pages/admin/FacultyManagement'));
const CourseManagement = React.lazy(() => import('./pages/admin/CourseManagement'));
const TimetableManager = React.lazy(() => import('./pages/admin/TimetableManager'));
const DeadlineManager = React.lazy(() => import('./pages/admin/DeadlineManager'));
const FileRepository = React.lazy(() => import('./pages/admin/FileRepository'));
const AIMonitoring = React.lazy(() => import('./pages/admin/AIMonitoring'));
const Announcements = React.lazy(() => import('./pages/admin/Announcements'));
const SystemLogs = React.lazy(() => import('./pages/admin/SystemLogs'));
const SecuritySettings = React.lazy(() => import('./pages/admin/SecuritySettings'));

const AIAssistant = React.lazy(() => import('./pages/ai/AIAssistant'));
const AIHistory = React.lazy(() => import('./pages/ai/AIHistory'));

const ProfileSettings = React.lazy(() => import('./pages/settings/ProfileSettings'));
const NotificationSettings = React.lazy(() => import('./pages/settings/NotificationSettings'));

const QueryPortal = React.lazy(() => import('./pages/query/QueryPortal'));
const NewQuery = React.lazy(() => import('./pages/query/NewQuery'));
const QueryDetail = React.lazy(() => import('./pages/query/QueryDetail'));

const Notifications = React.lazy(() => import('./pages/notifications/Notifications'));

const NotFound = React.lazy(() => import('./pages/error/NotFound'));
const ServerError = React.lazy(() => import('./pages/error/ServerError'));

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loader"></div>
    <p>Loading Woxsen EDU AI...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SocketProvider>
              <React.Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/features" element={<Features />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/security" element={<Security />} />

                  <Route element={<PrivateRoute />}>
                    <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                      <Route element={<Layout />}>
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                        <Route path="/student/courses" element={<StudentCourses />} />
                        <Route path="/student/assignments" element={<StudentAssignments />} />
                        <Route path="/student/exams" element={<StudentExams />} />
                        <Route path="/student/timetable" element={<StudentTimetable />} />
                        <Route path="/student/files" element={<StudentFiles />} />
                        <Route path="/student/queries" element={<QueryPortal />} />
                        <Route path="/student/queries/new" element={<NewQuery />} />
                        <Route path="/student/queries/:id" element={<QueryDetail />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route element={<RoleRoute allowedRoles={['FACULTY']} />}>
                      <Route element={<Layout />}>
                        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                        <Route path="/faculty/courses" element={<FacultyCourses />} />
                        <Route path="/faculty/assignments" element={<FacultyAssignments />} />
                        <Route path="/faculty/gradebook" element={<FacultyGradebook />} />
                        <Route path="/faculty/students" element={<FacultyStudents />} />
                        <Route path="/faculty/schedule" element={<FacultySchedule />} />
                        <Route path="/faculty/queries" element={<QueryPortal />} />
                        <Route path="/faculty/queries/:id" element={<QueryDetail />} />
                        <Route path="/faculty/announcements" element={<FacultyAnnouncements />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                      <Route element={<Layout />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/students" element={<StudentManagement />} />
                        <Route path="/admin/faculty" element={<FacultyManagement />} />
                        <Route path="/admin/courses" element={<CourseManagement />} />
                        <Route path="/admin/timetable" element={<TimetableManager />} />
                        <Route path="/admin/deadlines" element={<DeadlineManager />} />
                        <Route path="/admin/files" element={<FileRepository />} />
                        <Route path="/admin/ai-monitoring" element={<AIMonitoring />} />
                        <Route path="/admin/announcements" element={<Announcements />} />
                        <Route path="/admin/logs" element={<SystemLogs />} />
                        <Route path="/admin/security" element={<SecuritySettings />} />
                        <Route path="/admin/queries" element={<QueryPortal />} />
                        <Route path="/admin/queries/:id" element={<QueryDetail />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/ai-history" element={<AIHistory />} />
                      <Route path="/settings/profile" element={<ProfileSettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                      <Route path="/queries" element={<QueryPortal />} />
                      <Route path="/queries/new" element={<NewQuery />} />
                      <Route path="/queries/:id" element={<QueryDetail />} />
                      <Route path="/notifications" element={<Notifications />} />
                    </Route>
                  </Route>

                  <Route path="/404" element={<NotFound />} />
                  <Route path="/500" element={<ServerError />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </React.Suspense>
            </SocketProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;