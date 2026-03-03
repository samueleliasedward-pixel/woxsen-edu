import prisma from '../config/db.js';
import logger from '../utils/logger.js';

export const getDashboard = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📊 FACULTY DASHBOARD');
    console.log('==================================================');
    
    const facultyId = req.user.id;
    console.log('ℹ️ User ID:', facultyId);

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    const courses = await prisma.course.findMany({
      where: { facultyId }
    });

    const totalStudents = await prisma.enrollment.count({
      where: {
        course: {
          facultyId
        }
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCourses: courses.length,
          pendingGrading: 0,
          activeCourses: courses.length
        },
        todaysClasses: [],
        recentSubmissions: [],
        pendingTasks: []
      }
    });

  } catch (error) {
    console.error('❌ Faculty dashboard error:', error);
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
    console.log(' 📚 FACULTY COURSES');
    console.log('==================================================');
    
    const facultyId = req.user.id;
    console.log('🔍 User ID from token:', facultyId);

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const courses = await prisma.course.findMany({
      where: { facultyId },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${courses.length} courses`);

    const formattedCourses = courses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      department: c.department,
      credits: c.credits,
      createdAt: c.createdAt
    }));

    res.json({
      success: true,
      data: formattedCourses
    });

  } catch (error) {
    console.error('❌ Get faculty courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load courses',
      error: error.message
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
        department: course.department,
        credits: course.credits,
        createdAt: course.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load course',
      error: error.message
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📝 FACULTY ASSIGNMENTS');
    console.log('==================================================');
    
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const courses = await prisma.course.findMany({
      where: { facultyId },
      select: { id: true }
    });

    const courseIds = courses.map(c => c.id);

    const assignments = await prisma.assignment.findMany({
      where: { 
        courseId: { in: courseIds }
      },
      include: {
        course: {
          select: { 
            name: true, 
            code: true 
          }
        }
      },
      orderBy: { dueDate: 'desc' }
    });

    console.log(`✅ Found ${assignments.length} assignments`);

    res.json({
      success: true,
      data: assignments.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        courseName: a.course.name,
        courseCode: a.course.code,
        dueDate: a.dueDate,
        totalPoints: a.totalPoints
      }))
    });

  } catch (error) {
    console.error('❌ Get faculty assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load assignments',
      error: error.message
    });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, totalPoints } = req.body;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        totalPoints: parseInt(totalPoints),
        courseId,
        facultyId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });

  } catch (error) {
    console.error('❌ Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

export const getGradebook = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    const assignments = await prisma.assignment.findMany({
      where: { courseId }
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          code: course.code
        },
        students: enrollments.map(e => ({
          id: e.student.id,
          name: e.student.user.name,
          email: e.student.user.email,
          studentId: e.student.studentId,
          grades: {}
        })),
        assignments: assignments.map(a => ({
          id: a.id,
          title: a.title,
          maxScore: a.totalPoints,
          dueDate: a.dueDate
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get gradebook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load gradebook',
      error: error.message
    });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const facultyId = req.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const grade = await prisma.grade.create({
      data: {
        submissionId,
        score,
        feedback,
        gradedBy: facultyId,
        studentId: submission.studentId
      }
    });

    res.json({
      success: true,
      message: 'Grade saved successfully',
      data: grade
    });

  } catch (error) {
    console.error('❌ Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save grade',
      error: error.message
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 👥 FACULTY STUDENTS');
    console.log('==================================================');
    
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          facultyId
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    const uniqueStudents = Array.from(
      new Map(enrollments.map(e => [e.student.id, e])).values()
    );

    console.log(`✅ Found ${uniqueStudents.length} unique students`);

    res.json({
      success: true,
      data: uniqueStudents.map(e => ({
        id: e.student.id,
        name: e.student.user.name,
        email: e.student.user.email,
        studentId: e.student.studentId,
        course: e.course.name,
        courseCode: e.course.code
      }))
    });

  } catch (error) {
    console.error('❌ Get faculty students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load students',
      error: error.message
    });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const courses = await prisma.course.findMany({
      where: { facultyId },
      select: {
        id: true,
        name: true,
        code: true,
        department: true,
        credits: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('❌ Get faculty schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load schedule',
      error: error.message
    });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: {
          facultyId
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          title: assignment.title,
          totalPoints: assignment.totalPoints
        },
        submissions: submissions.map(s => ({
          id: s.id,
          student: {
            id: s.student.id,
            name: s.student.user.name,
            email: s.student.user.email,
            studentId: s.student.studentId
          },
          submittedAt: s.submittedAt,
          status: s.status
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load submissions',
      error: error.message
    });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        courseId,
        date: date || new Date(),
        total: records?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          code: course.code
        },
        students: []
      }
    });

  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load attendance',
      error: error.message
    });
  }
};