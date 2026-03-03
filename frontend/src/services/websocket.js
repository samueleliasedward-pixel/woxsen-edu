import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    // Set up default event listeners
    this.setupDefaultListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupDefaultListeners() {
    // Attendance updates
    this.socket.on('attendance-marked', (data) => {
      this.emit('attendance-marked', data);
    });

    this.socket.on('bulk-attendance-marked', (data) => {
      this.emit('bulk-attendance-marked', data);
    });

    // Grade updates
    this.socket.on('grade-received', (data) => {
      this.emit('grade-received', data);
    });

    // Assignment submissions
    this.socket.on('new-submission', (data) => {
      this.emit('new-submission', data);
    });

    // Announcements
    this.socket.on('announcement', (data) => {
      this.emit('announcement', data);
    });

    // Typing indicators
    this.socket.on('user-typing', (data) => {
      this.emit('user-typing', data);
    });

    // Online users
    this.socket.on('online-users', (users) => {
      this.emit('online-users', users);
    });
  }

  // Join a course room
  joinCourse(courseId) {
    if (this.socket) {
      this.socket.emit('join-course', courseId);
    }
  }

  // Leave a course room
  leaveCourse(courseId) {
    if (this.socket) {
      this.socket.emit('leave-course', courseId);
    }
  }

  // Send typing indicator
  sendTyping(room, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { room, isTyping });
    }
  }

  // Emit attendance update
  emitAttendanceUpdate(data) {
    if (this.socket) {
      this.socket.emit('attendance-update', data);
    }
  }

  // Emit grade update
  emitGradeUpdate(data) {
    if (this.socket) {
      this.socket.emit('grade-update', data);
    }
  }

  // Emit assignment submission
  emitAssignmentSubmission(data) {
    if (this.socket) {
      this.socket.emit('assignment-submitted', data);
    }
  }

  // Emit announcement
  emitAnnouncement(data) {
    if (this.socket) {
      this.socket.emit('new-announcement', data);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export default new WebSocketService();