import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/env.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          studentProfile: true,
          facultyProfile: true,
          adminProfile: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 User connected: ${user.name} (${user.role})`);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // If faculty, join their course rooms
    if (user.role === 'FACULTY' && user.facultyProfile) {
      joinFacultyCourses(socket, user.id);
    }

    // If student, join their enrolled course rooms
    if (user.role === 'STUDENT' && user.studentProfile) {
      joinStudentCourses(socket, user.id);
    }

    // Broadcast online users
    broadcastOnlineUsers();

    // Handle joining a specific course room
    socket.on('join-course', (courseId) => {
      socket.join(`course:${courseId}`);
      console.log(`${user.name} joined course: ${courseId}`);
    });

    socket.on('leave-course', (courseId) => {
      socket.leave(`course:${courseId}`);
    });

    // Handle attendance updates
    socket.on('attendance-update', (data) => {
      io.to(`course:${data.courseId}`).emit('attendance-changed', data);
    });

    // Handle grade updates
    socket.on('grade-update', (data) => {
      io.to(`user:${data.studentId}`).emit('grade-received', data);
    });

    // Handle assignment submissions
    socket.on('assignment-submitted', (data) => {
      io.to(`user:${data.facultyId}`).emit('new-submission', data);
    });

    // Handle announcements
    socket.on('new-announcement', (data) => {
      if (data.targetRole === 'ALL') {
        io.emit('announcement', data);
      } else if (data.targetRole === 'STUDENTS') {
        io.to('role:STUDENT').emit('announcement', data);
      } else if (data.targetRole === 'FACULTY') {
        io.to('role:FACULTY').emit('announcement', data);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ room, isTyping }) => {
      socket.to(room).emit('user-typing', {
        userId: user.id,
        name: user.name,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${user.name}`);
      broadcastOnlineUsers();
    });
  });

  return io;
};

const joinFacultyCourses = async (socket, facultyId) => {
  try {
    const courses = await prisma.course.findMany({
      where: { facultyId }
    });
    
    courses.forEach(course => {
      socket.join(`course:${course.id}`);
    });
  } catch (error) {
    console.error('Error joining faculty courses:', error);
  }
};

const joinStudentCourses = async (socket, userId) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student: {
          userId
        }
      },
      include: { course: true }
    });
    
    enrollments.forEach(enrollment => {
      socket.join(`course:${enrollment.course.id}`);
    });
  } catch (error) {
    console.error('Error joining student courses:', error);
  }
};

const broadcastOnlineUsers = async () => {
  if (!io) return;
  
  const sockets = await io.fetchSockets();
  const onlineUserIds = sockets.map(s => s.user?.id).filter(Boolean);
  io.emit('online-users', onlineUserIds);
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};