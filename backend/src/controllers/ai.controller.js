import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import axios from 'axios';
import config from '../config/env.js';

// @desc    Send message to AI assistant
// @route   POST /api/ai/chat
export const chat = async (req, res) => {
  try {
    const { message, sessionId, files } = req.body;
    const userId = req.user.id;

    // Create or get session
    let session = await prisma.aISession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      session = await prisma.aISession.create({
        data: {
          userId,
          title: message.substring(0, 50),
          context: {}
        }
      });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        sessionId: session.id,
        role: 'user',
        content: message,
        metadata: files ? { files } : {}
      }
    });

    // Get context (previous messages)
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Get user context for AI
    const userContext = await getUserContext(userId);

    // Prepare conversation for AI
    const conversation = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call AI service (Ollama/OpenAI)
    let aiResponse;
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/chat`, {
        messages: conversation,
        context: userContext,
        query: message
      });
      aiResponse = response.data;
    } catch (aiError) {
      logger.error('AI service error:', aiError);
      // Fallback response
      aiResponse = {
        message: "I'm here to help! Based on your academic records, I can assist with courses, assignments, deadlines, and study materials. What would you like to know?",
        sources: []
      };
    }

    // Save AI response
    const aiMessage = await prisma.chatMessage.create({
      data: {
        userId,
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse.message,
        metadata: {
          sources: aiResponse.sources,
          tokens: aiResponse.tokens
        }
      }
    });

    // Update session
    await prisma.aISession.update({
      where: { id: session.id },
      data: {
        updatedAt: new Date(),
        context: {
          lastTopic: message,
          messageCount: previousMessages.length + 2
        }
      }
    });

    res.json({
      success: true,
      data: {
        message: aiMessage,
        sessionId: session.id,
        sources: aiResponse.sources
      }
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/history
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.aISession.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: sessions.map(s => ({
        id: s.id,
        title: s.title,
        lastMessage: s.messages[0]?.content,
        messageCount: s._count.messages,
        updatedAt: s.updatedAt,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load chat history'
    });
  }
};

// @desc    Get session messages
// @route   GET /api/ai/session/:sessionId
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.aISession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load session'
    });
  }
};

// @desc    Get AI analytics (admin)
// @route   GET /api/ai/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;

    const dateFilter = {
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    const messages = await prisma.chatMessage.findMany({
      where: {
        createdAt: {
          gte: dateFilter[timeframe]
        }
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by day
    const dailyStats = messages.reduce((acc, msg) => {
      const date = msg.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, user: 0, assistant: 0 };
      }
      acc[date][msg.role]++;
      acc[date].total++;
      return acc;
    }, {});

    // Top users
    const topUsers = Object.entries(
      messages
        .filter(m => m.role === 'user')
        .reduce((acc, msg) => {
          acc[msg.userId] = (acc[msg.userId] || 0) + 1;
          return acc;
        }, {})
    )
      .map(([userId, count]) => ({
        userId,
        name: messages.find(m => m.userId === userId)?.user?.name,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        total: messages.length,
        daily: dailyStats,
        topUsers,
        byRole: {
          student: messages.filter(m => m.user?.role === 'STUDENT').length,
          faculty: messages.filter(m => m.user?.role === 'FACULTY').length,
          admin: messages.filter(m => m.user?.role === 'ADMIN').length
        }
      }
    });
  } catch (error) {
    logger.error('AI analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load AI analytics'
    });
  }
};

// Helper function to get user context
async function getUserContext(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          enrolledCourses: {
            include: {
              course: true
            }
          }
        }
      },
      facultyProfile: {
        include: {
          courses: true
        }
      }
    }
  });

  if (user.role === 'STUDENT') {
    const upcomingDeadlines = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: user.studentProfile.id
            }
          }
        },
        dueDate: {
          gte: new Date()
        }
      },
      take: 5
    });

    return {
      role: 'STUDENT',
      name: user.name,
      program: user.studentProfile?.program,
      year: user.studentProfile?.year,
      courses: user.studentProfile?.enrolledCourses.map(e => e.course.name),
      upcomingDeadlines: upcomingDeadlines.map(a => ({
        title: a.title,
        dueDate: a.dueDate
      }))
    };
  }

  if (user.role === 'FACULTY') {
    return {
      role: 'FACULTY',
      name: user.name,
      department: user.facultyProfile?.department,
      courses: user.facultyProfile?.courses.map(c => c.name)
    };
  }

  return {
    role: user.role,
    name: user.name
  };
}