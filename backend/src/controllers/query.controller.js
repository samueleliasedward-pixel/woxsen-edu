import prisma from '../config/db.js';

export const getMyQueries = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let where = {};
    
    if (userRole === 'STUDENT') {
      where.studentId = req.user.studentProfile?.id;
    } else if (userRole === 'FACULTY') {
      where.facultyId = userId;
    } else if (userRole === 'ADMIN') {
      // Admin sees all queries
    }

    const queries = await prisma.query.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        faculty: {
          select: { name: true, email: true }
        },
        course: {
          select: { name: true, code: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedQueries = queries.map(q => ({
      id: q.id,
      title: q.title,
      status: q.status,
      priority: q.priority,
      faculty: q.faculty?.name,
      course: q.course?.name,
      lastMessage: q.messages[0]?.content || q.description,
      timestamp: formatRelativeTime(q.updatedAt),
      unreadCount: 0
    }));

    res.json({
      success: true,
      data: formattedQueries
    });

  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQueryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = await prisma.query.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        faculty: {
          select: { name: true, email: true }
        },
        course: {
          select: { name: true, code: true }
        },
        messages: {
          include: {
            sender: {
              select: { name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    // Mark messages as read
    await prisma.queryMessage.updateMany({
      where: {
        queryId: id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    const formattedMessages = query.messages.map(m => ({
      id: m.id,
      content: m.content,
      sender: m.sender.name,
      timestamp: formatRelativeTime(m.createdAt),
      isOwn: m.senderId === userId
    }));

    res.json({
      success: true,
      data: {
        ...query,
        messages: formattedMessages
      }
    });

  } catch (error) {
    console.error('Get query by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuery = async (req, res) => {
  try {
    const { title, facultyId, courseId, question } = req.body;
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found' });
    }

    const query = await prisma.query.create({
      data: {
        title,
        description: question,
        studentId,
        facultyId,
        courseId: courseId || null,
        status: 'pending'
      }
    });

    // Create initial message
    await prisma.queryMessage.create({
      data: {
        content: question,
        queryId: query.id,
        senderId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: query
    });

  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const query = await prisma.query.findUnique({
      where: { id }
    });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const newMessage = await prisma.queryMessage.create({
      data: {
        content: message,
        queryId: id,
        senderId: req.user.id
      }
    });

    // Update query status and timestamp
    await prisma.query.update({
      where: { id },
      data: {
        status: 'answered',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: newMessage
    });

  } catch (error) {
    console.error('Respond to query error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQueryStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let where = {};
    if (userRole === 'STUDENT') {
      where.studentId = req.user.studentProfile?.id;
    } else if (userRole === 'FACULTY') {
      where.facultyId = userId;
    }

    const total = await prisma.query.count({ where });
    const pending = await prisma.query.count({ 
      where: { ...where, status: 'pending' }
    });
    const answered = await prisma.query.count({ 
      where: { ...where, status: 'answered' }
    });
    const urgent = await prisma.query.count({ 
      where: { ...where, priority: 'urgent' }
    });

    res.json({
      success: true,
      data: { total, pending, answered, urgent }
    });

  } catch (error) {
    console.error('Get query stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignedQueries = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const queries = await prisma.query.findMany({
      where: { facultyId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        course: {
          select: { name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: queries
    });

  } catch (error) {
    console.error('Get assigned queries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function
const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};