import prisma from '../config/db.js';
import logger from '../utils/logger.js';

// @desc    Mark attendance
// @route   POST /api/attendance/mark
export const markAttendance = async (req, res) => {
  try {
    const { courseId, studentId, status, date, remarks } = req.body;

    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        courseId_studentId_date: {
          courseId,
          studentId,
          date: new Date(date)
        }
      },
      update: {
        status,
        remarks,
        markedBy: req.user.id
      },
      create: {
        courseId,
        studentId,
        date: new Date(date),
        status,
        remarks,
        markedBy: req.user.id
      }
    });

    // Get updated attendance for the student
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId }
    });

    const percentage = calculateAttendancePercentage(attendanceRecords);

    // Update student profile with new attendance
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { attendance: percentage }
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: (await prisma.studentProfile.findUnique({ where: { id: studentId } })).userId,
        type: 'ATTENDANCE',
        title: 'Attendance Marked',
        message: `Your attendance for ${new Date(date).toLocaleDateString()} has been marked as ${status}`,
        data: { courseId, date, status }
      }
    });

    // Emit socket event for real-time update
    req.io.to(`course:${courseId}`).emit('attendance-marked', {
      courseId,
      studentId,
      date,
      status
    });

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    logger.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
};

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
export const markBulkAttendance = async (req, res) => {
  try {
    const { courseId, date, attendanceList } = req.body;

    const operations = attendanceList.map(a => 
      prisma.attendanceRecord.upsert({
        where: {
          courseId_studentId_date: {
            courseId,
            studentId: a.studentId,
            date: new Date(date)
          }
        },
        update: {
          status: a.status,
          remarks: a.remarks,
          markedBy: req.user.id
        },
        create: {
          courseId,
          studentId: a.studentId,
          date: new Date(date),
          status: a.status,
          remarks: a.remarks,
          markedBy: req.user.id
        }
      })
    );

    const results = await prisma.$transaction(operations);

    // Update all affected students' attendance percentages
    for (const a of attendanceList) {
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId: a.studentId }
      });
      const percentage = calculateAttendancePercentage(records);
      await prisma.studentProfile.update({
        where: { id: a.studentId },
        data: { attendance: percentage }
      });
    }

    // Emit socket event for real-time update
    req.io.to(`course:${courseId}`).emit('bulk-attendance-marked', {
      courseId,
      date,
      count: attendanceList.length
    });

    res.json({
      success: true,
      message: `Marked attendance for ${results.length} students`,
      data: results
    });
  } catch (error) {
    logger.error('Bulk attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bulk attendance'
    });
  }
};

// @desc    Get attendance for a course on a date
// @route   GET /api/attendance/course/:courseId
export const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    const where = { courseId };
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: attendance.map(a => ({
        id: a.id,
        studentId: a.studentId,
        studentName: a.student.user.name,
        date: a.date,
        status: a.status,
        remarks: a.remarks,
        markedBy: a.markedBy
      }))
    });
  } catch (error) {
    logger.error('Get course attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance'
    });
  }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { studentId };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      excused: records.filter(r => r.status === 'EXCUSED').length,
      percentage: calculateAttendancePercentage(records)
    };

    res.json({
      success: true,
      data: {
        records,
        summary
      }
    });
  } catch (error) {
    logger.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student attendance'
    });
  }
};

// @desc    Get attendance analytics
// @route   GET /api/attendance/analytics
export const getAttendanceAnalytics = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        course: {
          select: { name: true }
        }
      }
    });

    // Group by date
    const byDate = records.reduce((acc, r) => {
      const date = r.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      acc[date][r.status.toLowerCase()]++;
      acc[date].total++;
      return acc;
    }, {});

    // Group by student
    const byStudent = records.reduce((acc, r) => {
      const studentId = r.studentId;
      if (!acc[studentId]) {
        acc[studentId] = {
          name: r.student.user.name,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      acc[studentId][r.status.toLowerCase()]++;
      acc[studentId].total++;
      return acc;
    }, {});

    // Calculate percentages
    Object.values(byStudent).forEach(s => {
      s.percentage = ((s.present / s.total) * 100).toFixed(1);
    });

    res.json({
      success: true,
      data: {
        byDate,
        byStudent: Object.values(byStudent),
        overall: {
          total: records.length,
          present: records.filter(r => r.status === 'PRESENT').length,
          absent: records.filter(r => r.status === 'ABSENT').length,
          late: records.filter(r => r.status === 'LATE').length,
          excused: records.filter(r => r.status === 'EXCUSED').length
        }
      }
    });
  } catch (error) {
    logger.error('Attendance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance analytics'
    });
  }
};

// Helper function
const calculateAttendancePercentage = (records) => {
  if (records.length === 0) return 0;
  const present = records.filter(r => r.status === 'PRESENT').length;
  return Math.round((present / records.length) * 100);
};