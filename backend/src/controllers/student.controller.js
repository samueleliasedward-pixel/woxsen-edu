import prisma from '../config/db.js';
import logger from '../utils/logger.js';

export const getDashboard = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📊 STUDENT DASHBOARD');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;
    console.log('StudentProfile ID:', studentId);
    console.log('User ID:', req.user.id);

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            faculty: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Get upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId }
          }
        },
        dueDate: {
          gte: new Date()
        }
      },
      include: {
        course: {
          select: { name: true, code: true }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    // Get upcoming exams
    let upcomingExams = [];
    try {
      upcomingExams = await prisma.exam.findMany({
        where: {
          course: {
            enrollments: {
              some: { studentId }
            }
          },
          date: {
            gte: new Date()
          }
        },
        include: {
          course: {
            select: { name: true, code: true }
          }
        },
        orderBy: { date: 'asc' },
        take: 5
      });
    } catch (examError) {
      console.log('Exam table might not exist:', examError.message);
    }

    // Get assignment counts
    const totalAssignments = await prisma.assignment.count({
      where: {
        course: {
          enrollments: {
            some: { studentId }
          }
        }
      }
    });

    // Get completed submissions
    const completedAssignments = await prisma.submission.count({
      where: {
        studentId,
        status: 'GRADED'
      }
    });

    // Get attendance
    let attendanceRecords = [];
    try {
      attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId }
      });
    } catch (attendanceError) {
      console.log('AttendanceRecord table might not exist:', attendanceError.message);
    }

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    // Get grades
    let grades = [];
    try {
      grades = await prisma.grade.findMany({
        where: { studentId }
      });
    } catch (gradeError) {
      console.log('Grade table might not exist:', gradeError.message);
    }

    const avgGrade = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2)
      : '0.0';

    res.json({
      success: true,
      data: {
        stats: {
          totalCourses: enrollments.length,
          completedAssignments,
          pendingAssignments: totalAssignments - completedAssignments,
          attendance: `${attendancePercent}%`,
          cgpa: avgGrade
        },
        upcomingClasses: enrollments.map(e => ({
          id: e.course.id,
          name: e.course.name,
          code: e.course.code,
          faculty: e.course.faculty?.name || 'TBD',
          time: e.course.schedule || 'TBD',
          room: e.course.room || 'TBD'
        })),
        upcomingAssignments: upcomingAssignments.map(a => ({
          id: a.id,
          title: a.title,
          course: a.course.name,
          dueDate: a.dueDate,
          totalPoints: a.totalPoints
        })),
        upcomingExams: upcomingExams.map(e => ({
          id: e.id,
          title: e.title,
          course: e.course.name,
          date: e.date,
          totalMarks: e.totalMarks
        })),
        recentActivities: [],
        announcements: []
      }
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
      error: error.message
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📚 STUDENT COURSES');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            faculty: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: enrollments.map(e => ({
        id: e.course.id,
        code: e.course.code,
        name: e.course.name,
        description: e.course.description,
        credits: e.course.credits,
        faculty: e.course.faculty?.name,
        room: e.course.room,
        schedule: e.course.schedule,
        status: e.course.status,
        enrolledAt: e.enrolledAt
      }))
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load courses',
      error: error.message
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📝 STUDENT ASSIGNMENTS');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId }
          }
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        submissions: {
          where: { studentId }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      success: true,
      data: assignments.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        course: a.course.name,
        dueDate: a.dueDate,
        totalPoints: a.totalPoints,
        status: a.submissions[0]?.status || 'PENDING',
        submittedAt: a.submissions[0]?.submittedAt
      }))
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load assignments',
      error: error.message
    });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { files, comments } = req.body;
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: studentId
        }
      },
      update: {
        files: files || [],
        comments,
        submittedAt: new Date(),
        status: 'SUBMITTED',
        isLate
      },
      create: {
        assignmentId: id,
        studentId: studentId,
        files: files || [],
        comments,
        status: 'SUBMITTED',
        isLate
      }
    });

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

export const getExams = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📝 STUDENT EXAMS');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const exams = await prisma.exam.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId }
          }
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: exams.map(e => ({
        id: e.id,
        title: e.title,
        course: e.course.name,
        date: e.date,
        totalMarks: e.totalMarks
      }))
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load exams',
      error: error.message
    });
  }
};

export const getTimetable = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📅 STUDENT TIMETABLE');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            faculty: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const timetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    enrollments.forEach(e => {
      timetable.Monday.push({
        course: e.course.name,
        code: e.course.code,
        time: '10:00 AM',
        room: e.course.room || 'TBD',
        faculty: e.course.faculty?.name || 'TBA'
      });
    });

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load timetable',
      error: error.message
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📊 STUDENT ATTENDANCE');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
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

    res.json({
      success: true,
      data: attendanceRecords.map(a => ({
        id: a.id,
        course: a.course.name,
        date: a.date,
        status: a.status
      }))
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load attendance',
      error: error.message
    });
  }
};

export const getGrades = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📊 STUDENT GRADES');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile not found.'
      });
    }

    const grades = await prisma.grade.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: grades.map(g => ({
        id: g.id,
        assignment: g.assignment.title,
        course: g.assignment.course.name,
        score: g.score,
        totalPoints: g.assignment.totalPoints,
        percentage: Math.round((g.score / g.assignment.totalPoints) * 100),
        gradedAt: g.createdAt
      }))
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load grades',
      error: error.message
    });
  }
};

export const getFiles = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📁 FETCHING STUDENT FILES');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;
    console.log('Student ID:', studentId);

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    // Get courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    });

    const enrolledCourseIds = enrollments.map(e => e.courseId);
    console.log('Enrolled courses:', enrolledCourseIds);

    // Get files from enrolled courses (public files)
    const files = await prisma.file.findMany({
      where: {
        courseId: {
          in: enrolledCourseIds
        },
        isPublic: true
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        },
        course: {
          select: { name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${files.length} files`);

    const formattedFiles = files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.extension,
      size: formatFileSize(f.size),
      modified: formatRelativeTime(f.updatedAt),
      uploadedBy: f.uploadedBy.name,
      course: f.course?.name,
      courseCode: f.course?.code
    }));

    // Get folders (you can implement folder structure later)
    const folders = [];

    res.json({
      success: true,
      data: {
        files: formattedFiles,
        folders: folders
      }
    });

  } catch (error) {
    console.error('❌ Get student files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load files',
      error: error.message
    });
  }
};

// Helper functions
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

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