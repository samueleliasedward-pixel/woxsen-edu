import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const log = {
  info: (message, data = '') => console.log(`ℹ️ ${message}`, data),
  success: (message, data = '') => console.log(`✅ ${message}`, data),
  error: (message, data = '') => console.error(`❌ ${message}`, data),
  warn: (message, data = '') => console.warn(`⚠️ ${message}`, data),
  section: (title) => {
    console.log('\n' + '='.repeat(50));
    console.log(` ${title}`);
    console.log('='.repeat(50));
  }
};

const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const formatStudent = (student) => {
  if (!student) return null;
  
  return {
    id: student.id,
    studentId: student.studentId,
    name: student.user?.name || 'Unknown',
    email: student.user?.email || 'No email',
    phone: student.user?.phone || 'N/A',
    program: student.program || 'Not specified',
    department: student.department || 'Not specified',
    year: student.year || 1,
    semester: student.semester || 1,
    batch: student.batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
    cgpa: student.cgpa || 0,
    attendance: student.attendance || 0,
    isActive: student.user?.isActive ?? true,
    joinedAt: student.user?.createdAt || new Date(),
    lastLogin: student.user?.lastLogin || null,
    address: student.address || null,
    emergencyContact: student.emergencyContact || null,
    dateOfBirth: student.dateOfBirth || null
  };
};

const formatFaculty = (faculty) => {
  if (!faculty) return null;
  
  return {
    id: faculty.id,
    employeeId: faculty.employeeId,
    name: faculty.user?.name || 'Unknown',
    email: faculty.user?.email || 'No email',
    phone: faculty.user?.phone || 'N/A',
    designation: faculty.designation || 'Professor',
    department: faculty.department || 'Not specified',
    qualification: faculty.qualification || 'PhD',
    specialization: faculty.specialization || [],
    officeHours: faculty.officeHours || '9 AM - 5 PM',
    cabin: faculty.cabin || 'Not assigned',
    joinDate: faculty.joinDate || new Date(),
    isActive: faculty.user?.isActive ?? true,
    courseCount: 0,
    assignmentCount: 0,
    research: faculty.research || null,
    publications: faculty.publications || 0
  };
};

const formatCourse = (course) => {
  if (!course) return null;
  
  return {
    id: course.id,
    code: course.code || 'N/A',
    name: course.name || 'Unnamed Course',
    description: course.description || '',
    department: course.department || 'Not specified',
    credits: course.credits || 3,
    faculty: course.faculty?.name || 'Not Assigned',
    facultyId: course.facultyId || null,
    status: course.status || 'ACTIVE',
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    log.section('📊 FETCHING REAL ADMIN DASHBOARD DATA');
    
    console.log('🔍 Counting students...');
    const totalStudents = await prisma.studentProfile.count();
    console.log(`✅ Students: ${totalStudents}`);

    console.log('🔍 Counting faculty...');
    const totalFaculty = await prisma.facultyProfile.count();
    console.log(`✅ Faculty: ${totalFaculty}`);

    console.log('🔍 Counting courses...');
    const totalCourses = await prisma.course.count();
    console.log(`✅ Courses: ${totalCourses}`);

    console.log('🔍 Counting active students...');
    const activeStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        isActive: true
      }
    });

    console.log('🔍 Counting active faculty...');
    const activeFaculty = await prisma.user.count({
      where: {
        role: 'FACULTY',
        isActive: true
      }
    });

    console.log('🔍 Fetching recent activities...');
    let recentActivities = [];
    try {
      recentActivities = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
      console.log(`✅ Found ${recentActivities.length} activities`);
    } catch (e) {
      console.log('ActivityLog table might not exist yet');
    }

    console.log('🔍 Fetching AI usage stats...');
    let aiToday = 0, aiWeek = 0, aiMonth = 0;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [todayCount, weekCount, monthCount] = await Promise.all([
        prisma.chatMessage.count({
          where: { createdAt: { gte: today } }
        }),
        prisma.chatMessage.count({
          where: { createdAt: { gte: weekAgo } }
        }),
        prisma.chatMessage.count({
          where: { createdAt: { gte: monthAgo } }
        })
      ]);

      aiToday = todayCount;
      aiWeek = weekCount;
      aiMonth = monthCount;
      
      console.log(`✅ AI usage - Today: ${aiToday}, Week: ${aiWeek}, Month: ${aiMonth}`);
    } catch (e) {
      console.log('ChatMessage table might not exist yet');
    }

    let upcomingExams = 0;
    try {
      upcomingExams = await prisma.exam.count({
        where: {
          date: { gte: new Date() }
        }
      });
      console.log(`✅ Upcoming exams: ${upcomingExams}`);
    } catch (e) {
      console.log('Exam table might not exist yet');
    }

    let pendingAssignments = 0;
    try {
      pendingAssignments = await prisma.assignment.count({
        where: {
          dueDate: { gte: new Date() }
        }
      });
      console.log(`✅ Pending assignments: ${pendingAssignments}`);
    } catch (e) {
      console.log('Assignment table might not exist yet');
    }

    let newStudents = 0;
    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      newStudents = await prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: { gte: monthAgo }
        }
      });
      console.log(`✅ New students this month: ${newStudents}`);
    } catch (e) {
      console.log('Error calculating new students');
    }

    let newFaculty = 0;
    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      newFaculty = await prisma.user.count({
        where: {
          role: 'FACULTY',
          createdAt: { gte: monthAgo }
        }
      });
      console.log(`✅ New faculty this month: ${newFaculty}`);
    } catch (e) {
      console.log('Error calculating new faculty');
    }

    const formattedActivities = recentActivities.map(a => ({
      id: a.id,
      user: a.user?.name || 'System',
      action: a.action || 'Unknown action',
      type: a.action?.includes('CREATE') ? 'success' : 
             a.action?.includes('UPDATE') ? 'info' : 
             a.action?.includes('DELETE') ? 'error' : 'info',
      time: formatRelativeTime(a.createdAt),
      description: `${a.user?.name || 'System'} ${a.action || 'performed action'} ${a.entity || ''}`.trim(),
      target: a.entity || ''
    }));

    log.success(`Dashboard data prepared - Students: ${totalStudents}, Faculty: ${totalFaculty}, Courses: ${totalCourses}`);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: totalStudents || 0,
          totalFaculty: totalFaculty || 0,
          totalCourses: totalCourses || 0,
          activeCourses: totalCourses || 0,
          upcomingExams: upcomingExams || 0,
          pendingAssignments: pendingAssignments || 0,
          totalRevenue: '₹0',
          avgAttendance: '0%',
          newStudents: newStudents || 0,
          newFaculty: newFaculty || 0
        },
        recentActivities: formattedActivities,
        aiUsage: {
          today: aiToday || 0,
          week: aiWeek || 0,
          month: aiMonth || 0,
          topQueries: []
        },
        upcomingEvents: [],
        performanceMetrics: {
          avgGrade: '0%',
          passRate: '0%',
          satisfaction: '0%'
        }
      }
    });

  } catch (error) {
    log.error('Dashboard error:', error);
    logger.error('Admin dashboard error:', error);
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents: 0,
          totalFaculty: 0,
          totalCourses: 0,
          activeCourses: 0,
          upcomingExams: 0,
          pendingAssignments: 0,
          totalRevenue: '₹0',
          avgAttendance: '0%',
          newStudents: 0,
          newFaculty: 0
        },
        recentActivities: [],
        aiUsage: {
          today: 0,
          week: 0,
          month: 0,
          topQueries: []
        },
        upcomingEvents: [],
        performanceMetrics: {
          avgGrade: '0%',
          passRate: '0%',
          satisfaction: '0%'
        }
      }
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    log.section('📋 FETCHING STUDENTS');
    
    const { search, status, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (status && status !== 'all') {
      where.user = {
        isActive: status === 'active'
      };
    }
    
    const total = await prisma.studentProfile.count({ where });
    
    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            lastLogin: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    log.success(`Found ${students.length} students (total: ${total})`);

    const formattedStudents = students.map(student => ({
      id: student.id,
      studentId: student.studentId,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone || 'N/A',
      program: student.program,
      department: student.department,
      year: student.year,
      semester: student.semester,
      batch: student.batch,
      cgpa: student.cgpa || 0,
      attendance: student.attendance || 0,
      isActive: student.user.isActive,
      joinedAt: student.user.createdAt,
      lastLogin: student.user.lastLogin,
      enrollmentCount: 0,
      examCount: 0,
      attendanceCount: 0
    }));

    res.json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    log.error('Get students error:', error);
    logger.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    log.info(`Fetching student with ID: ${id}`);
    
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            lastLogin: true,
            createdAt: true
          }
        }
      }
    });

    if (!student) {
      log.warn(`Student not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    log.success(`Student found: ${student.user.name}`);

    res.json({
      success: true,
      data: {
        ...formatStudent(student)
      }
    });

  } catch (error) {
    log.error('Get student by ID error:', error);
    logger.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load student',
      error: error.message
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    log.section('➕ CREATING NEW STUDENT');
    
    const {
      name,
      email,
      password,
      phone,
      studentId,
      program,
      department,
      year,
      semester,
      batch,
      dateOfBirth,
      address,
      emergencyContact
    } = req.body;

    log.info(`Email: ${email}, Student ID: ${studentId}`);

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and student ID are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      log.warn(`User already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingStudent = await prisma.studentProfile.findUnique({
      where: { studentId }
    });

    if (existingStudent) {
      log.warn(`Student ID already exists: ${studentId}`);
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'STUDENT'
        }
      });

      const student = await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentId,
          program: program || 'B.Tech Computer Science',
          department: department || 'Computer Science',
          year: year ? parseInt(year) : 1,
          semester: semester ? parseInt(semester) : 1,
          batch: batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          emergencyContact,
          cgpa: 0,
          attendance: 0
        },
        include: {
          user: true
        }
      });

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_STUDENT',
          entity: 'STUDENT',
          entityId: student.id,
          details: { email, studentId }
        }
      });

      return student;
    });

    log.success(`Student created successfully: ${result.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: formatStudent(result)
    });

  } catch (error) {
    log.error('Create student error:', error);
    logger.error('Create student error:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    log.info(`Updating student: ${id}`);

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          name: updateData.name,
          phone: updateData.phone,
          isActive: updateData.isActive !== undefined ? updateData.isActive : student.user.isActive
        }
      });

      await tx.studentProfile.update({
        where: { id },
        data: {
          program: updateData.program,
          department: updateData.department,
          year: updateData.year ? parseInt(updateData.year) : undefined,
          semester: updateData.semester ? parseInt(updateData.semester) : undefined,
          batch: updateData.batch,
          cgpa: updateData.cgpa ? parseFloat(updateData.cgpa) : undefined,
          attendance: updateData.attendance ? parseFloat(updateData.attendance) : undefined,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
          address: updateData.address,
          emergencyContact: updateData.emergencyContact
        }
      });

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_STUDENT',
          entity: 'STUDENT',
          entityId: id,
          details: { updated: Object.keys(updateData) }
        }
      });
    });

    log.success(`Student updated successfully: ${id}`);

    res.json({
      success: true,
      message: 'Student updated successfully'
    });

  } catch (error) {
    log.error('Update student error:', error);
    logger.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    log.info(`Deleting student: ${id}`);

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await prisma.user.delete({
      where: { id: student.userId }
    });

    log.success(`Student deleted successfully: ${id}`);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    log.error('Delete student error:', error);
    logger.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};

export const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    log.info(`Toggling student status: ${id}`);

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const updated = await prisma.user.update({
      where: { id: student.userId },
      data: {
        isActive: !student.user.isActive
      }
    });

    log.success(`Student status toggled: ${updated.isActive ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      message: `Student ${updated.isActive ? 'activated' : 'suspended'} successfully`,
      data: { isActive: updated.isActive }
    });

  } catch (error) {
    log.error('Toggle student status error:', error);
    logger.error('Toggle student status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student status',
      error: error.message
    });
  }
};

export const importStudents = async (req, res) => {
  try {
    log.section('📥 IMPORTING STUDENTS');
    
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students data provided'
      });
    }

    const results = {
      total: students.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const studentData of students) {
      try {
        const {
          name,
          email,
          password = 'default123',
          phone,
          studentId,
          program,
          department,
          year,
          semester,
          batch
        } = studentData;

        if (!name || !email || !studentId) {
          results.failed++;
          results.errors.push({ 
            email: email || 'unknown', 
            error: 'Missing required fields' 
          });
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          results.failed++;
          results.errors.push({ email, error: 'Email already exists' });
          continue;
        }

        const existingStudent = await prisma.studentProfile.findUnique({
          where: { studentId }
        });

        if (existingStudent) {
          results.failed++;
          results.errors.push({ email, error: 'Student ID already exists' });
          continue;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              password: hashedPassword,
              name,
              phone,
              role: 'STUDENT'
            }
          });

          await tx.studentProfile.create({
            data: {
              userId: user.id,
              studentId,
              program: program || 'B.Tech Computer Science',
              department: department || 'Computer Science',
              year: year ? parseInt(year) : 1,
              semester: semester ? parseInt(semester) : 1,
              batch: batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
              cgpa: 0,
              attendance: 0
            }
          });
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ 
          email: studentData.email || 'unknown', 
          error: err.message 
        });
      }
    }

    log.success(`Import completed: ${results.success} succeeded, ${results.failed} failed`);

    res.json({
      success: true,
      message: `Imported ${results.success} students, ${results.failed} failed`,
      data: results
    });

  } catch (error) {
    log.error('Import students error:', error);
    logger.error('Import students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import students',
      error: error.message
    });
  }
};

export const exportStudents = async (req, res) => {
  try {
    log.section('📤 EXPORTING STUDENTS');
    
    const { format = 'json' } = req.query;
    
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    const formattedData = students.map(s => ({
      'Student ID': s.studentId,
      'Name': s.user.name,
      'Email': s.user.email,
      'Phone': s.user.phone || 'N/A',
      'Program': s.program,
      'Department': s.department,
      'Year': s.year,
      'Semester': s.semester,
      'Batch': s.batch,
      'CGPA': s.cgpa || 0,
      'Attendance %': s.attendance || 0,
      'Status': s.user.isActive ? 'Active' : 'Inactive',
      'Joined': new Date(s.user.createdAt).toLocaleDateString()
    }));

    log.success(`Exported ${formattedData.length} students`);

    if (format === 'csv') {
      res.json({
        success: true,
        data: formattedData
      });
    } else {
      res.json({
        success: true,
        data: formattedData
      });
    }

  } catch (error) {
    log.error('Export students error:', error);
    logger.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export students',
      error: error.message
    });
  }
};

export const getFaculty = async (req, res) => {
  try {
    log.section('📋 FETCHING FACULTY');
    
    const { search, department, status, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (department && department !== 'all') {
      where.department = department;
    }
    
    if (status && status !== 'all') {
      where.user = {
        isActive: status === 'active'
      };
    }
    
    const total = await prisma.facultyProfile.count({ where });
    
    const faculty = await prisma.facultyProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            lastLogin: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    log.success(`Found ${faculty.length} faculty members (total: ${total})`);

    const formattedFaculty = faculty.map(f => ({
      id: f.id,
      employeeId: f.employeeId,
      name: f.user.name,
      email: f.user.email,
      phone: f.user.phone || 'N/A',
      designation: f.designation,
      department: f.department,
      qualification: f.qualification,
      specialization: f.specialization,
      officeHours: f.officeHours || '9 AM - 5 PM',
      cabin: f.cabin || 'Not assigned',
      joinDate: f.joinDate,
      isActive: f.user.isActive,
      courseCount: 0,
      joinedAt: f.user.createdAt,
      lastLogin: f.user.lastLogin
    }));

    res.json({
      success: true,
      data: {
        faculty: formattedFaculty,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    log.error('Get faculty error:', error);
    logger.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load faculty',
      error: error.message
    });
  }
};

export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    log.info(`Fetching faculty with ID: ${id}`);
    
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            lastLogin: true,
            createdAt: true
          }
        }
      }
    });

    if (!faculty) {
      log.warn(`Faculty not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    log.success(`Faculty found: ${faculty.user.name}`);

    res.json({
      success: true,
      data: {
        ...formatFaculty(faculty),
        courseCount: 0,
        assignmentCount: 0
      }
    });

  } catch (error) {
    log.error('Get faculty by ID error:', error);
    logger.error('Get faculty by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load faculty',
      error: error.message
    });
  }
};

export const createFaculty = async (req, res) => {
  try {
    log.section('➕ CREATING NEW FACULTY');
    
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      designation,
      department,
      qualification,
      specialization,
      officeHours,
      cabin,
      joinDate,
      research,
      publications
    } = req.body;

    log.info(`Email: ${email}, Employee ID: ${employeeId}`);

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and employee ID are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      log.warn(`User already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingFaculty = await prisma.facultyProfile.findUnique({
      where: { employeeId }
    });

    if (existingFaculty) {
      log.warn(`Employee ID already exists: ${employeeId}`);
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'FACULTY'
        }
      });

      const faculty = await tx.facultyProfile.create({
        data: {
          userId: user.id,
          employeeId,
          designation: designation || 'Assistant Professor',
          department: department || 'Computer Science',
          qualification: qualification || 'PhD',
          specialization: specialization || ['Computer Science'],
          officeHours: officeHours || '9 AM - 5 PM',
          cabin: cabin || '',
          joinDate: joinDate ? new Date(joinDate) : new Date(),
          research: research || '',
          publications: publications ? parseInt(publications) : 0
        },
        include: {
          user: true
        }
      });

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_FACULTY',
          entity: 'FACULTY',
          entityId: faculty.id,
          details: { email, employeeId }
        }
      });

      return faculty;
    });

    log.success(`Faculty created successfully: ${result.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: formatFaculty(result)
    });

  } catch (error) {
    log.error('Create faculty error:', error);
    logger.error('Create faculty error:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty',
      error: error.message
    });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    log.info(`Updating faculty: ${id}`);

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: faculty.userId },
        data: {
          name: updateData.name,
          phone: updateData.phone,
          isActive: updateData.isActive !== undefined ? updateData.isActive : faculty.user.isActive
        }
      });

      await tx.facultyProfile.update({
        where: { id },
        data: {
          designation: updateData.designation,
          department: updateData.department,
          qualification: updateData.qualification,
          specialization: updateData.specialization,
          officeHours: updateData.officeHours,
          cabin: updateData.cabin,
          research: updateData.research,
          publications: updateData.publications ? parseInt(updateData.publications) : undefined
        }
      });

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_FACULTY',
          entity: 'FACULTY',
          entityId: id,
          details: { updated: Object.keys(updateData) }
        }
      });
    });

    log.success(`Faculty updated successfully: ${id}`);

    res.json({
      success: true,
      message: 'Faculty updated successfully'
    });

  } catch (error) {
    log.error('Update faculty error:', error);
    logger.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty',
      error: error.message
    });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    log.info(`Deleting faculty: ${id}`);

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    await prisma.user.delete({
      where: { id: faculty.userId }
    });

    log.success(`Faculty deleted successfully: ${id}`);

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });

  } catch (error) {
    log.error('Delete faculty error:', error);
    logger.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty',
      error: error.message
    });
  }
};

export const toggleFacultyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    log.info(`Toggling faculty status: ${id}`);

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const updated = await prisma.user.update({
      where: { id: faculty.userId },
      data: {
        isActive: !faculty.user.isActive
      }
    });

    log.success(`Faculty status toggled: ${updated.isActive ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      message: `Faculty ${updated.isActive ? 'activated' : 'suspended'} successfully`,
      data: { isActive: updated.isActive }
    });

  } catch (error) {
    log.error('Toggle faculty status error:', error);
    logger.error('Toggle faculty status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty status',
      error: error.message
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    log.section('📋 FETCHING COURSES');
    
    const { search, department, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (department && department !== 'all') {
      where.department = department;
    }
    
    const total = await prisma.course.count({ where });
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        faculty: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    log.success(`Found ${courses.length} courses (total: ${total})`);

    const formattedCourses = courses.map(c => ({
      id: c.id,
      code: c.code || 'N/A',
      name: c.name || 'Unnamed Course',
      description: c.description || '',
      department: c.department || 'Not specified',
      credits: c.credits || 3,
      faculty: c.faculty?.name || 'Not Assigned',
      facultyId: c.facultyId || null,
      status: c.status || 'ACTIVE',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    log.error('Get courses error:', error);
    logger.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load courses',
      error: error.message
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    log.info(`Fetching course with ID: ${id}`);
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!course) {
      log.warn(`Course not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    log.success(`Course found: ${course.name}`);

    res.json({
      success: true,
      data: {
        ...formatCourse(course)
      }
    });

  } catch (error) {
    log.error('Get course by ID error:', error);
    logger.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load course',
      error: error.message
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    log.section('➕ CREATING NEW COURSE');
    
    const {
      code,
      name,
      description,
      department,
      credits,
      facultyId
    } = req.body;

    log.info(`Course: ${code} - ${name}`);

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Course code and name are required'
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      log.warn(`Course code already exists: ${code}`);
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: description || null,
        department: department || null,
        credits: credits ? parseInt(credits) : 3,
        facultyId: facultyId || null,
        status: 'ACTIVE'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_COURSE',
        entity: 'COURSE',
        entityId: course.id,
        details: { code, name }
      }
    });

    log.success(`Course created successfully: ${course.name}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: formatCourse(course)
    });

  } catch (error) {
    log.error('Create course error:', error);
    logger.error('Create course error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    log.info(`Updating course: ${id}`);

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        department: updateData.department,
        credits: updateData.credits ? parseInt(updateData.credits) : undefined,
        facultyId: updateData.facultyId,
        status: updateData.status
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_COURSE',
        entity: 'COURSE',
        entityId: id,
        details: { updated: Object.keys(updateData) }
      }
    });

    log.success(`Course updated successfully: ${id}`);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: formatCourse(updated)
    });

  } catch (error) {
    log.error('Update course error:', error);
    logger.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    log.info(`Deleting course: ${id}`);

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await prisma.course.delete({
      where: { id }
    });

    log.success(`Course deleted successfully: ${id}`);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    log.error('Delete course error:', error);
    logger.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

export const getAIMonitoring = async (req, res) => {
  try {
    log.section('🤖 FETCHING AI MONITORING');
    
    const totalQueries = await prisma.chatMessage.count();
    const uniqueUsers = await prisma.chatMessage.groupBy({
      by: ['userId'],
      _count: true
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayQueries = await prisma.chatMessage.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekQueries = await prisma.chatMessage.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthQueries = await prisma.chatMessage.count({
      where: {
        createdAt: {
          gte: monthAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalQueries,
        uniqueUsers: uniqueUsers.length,
        today: todayQueries,
        week: weekQueries,
        month: monthQueries,
        topQueries: [],
        averageResponseTime: 0,
        popularTopics: []
      }
    });

  } catch (error) {
    log.error('AI monitoring error:', error);
    logger.error('AI monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load AI monitoring data',
      error: error.message
    });
  }
};

export const getAIAnalytics = async (req, res) => {
  try {
    log.section('📊 FETCHING AI ANALYTICS');
    
    res.json({
      success: true,
      data: {
        totalQueries: 0,
        uniqueUsers: 0,
        averageResponseTime: 0,
        popularTopics: [],
        dailyAverage: 0,
        peakHour: 'N/A',
        mostActiveUser: 'N/A',
        totalTokens: 0
      }
    });

  } catch (error) {
    log.error('AI analytics error:', error);
    logger.error('AI analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI analytics',
      error: error.message
    });
  }
};

export const getAIStats = async (req, res) => {
  try {
    log.section('📈 FETCHING AI STATS');
    
    res.json({
      success: true,
      data: {
        dailyAverage: 0,
        peakHour: 'N/A',
        mostActiveUser: 'N/A',
        totalTokens: 0,
        averagePerUser: 0,
        successRate: '0%',
        popularCategories: {}
      }
    });

  } catch (error) {
    log.error('AI stats error:', error);
    logger.error('AI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI stats',
      error: error.message
    });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    log.section('📋 FETCHING SYSTEM LOGS');
    
    const { level, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (level && level !== 'all') {
      where.level = level;
    }
    
    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.systemLog.count({ where });

    log.success(`Found ${logs.length} logs`);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    log.error('Get system logs error:', error);
    logger.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load system logs',
      error: error.message
    });
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    log.info(`Fetching log: ${id}`);
    
    const log = await prisma.systemLog.findUnique({
      where: { id }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });

  } catch (error) {
    log.error('Get log by ID error:', error);
    logger.error('Get log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get log details',
      error: error.message
    });
  }
};

export const exportLogs = async (req, res) => {
  try {
    log.section('📤 EXPORTING SYSTEM LOGS');
    
    const { level, startDate, endDate } = req.query;
    
    const where = {};
    
    if (level && level !== 'all') {
      where.level = level;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }
    
    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    log.success(`Exporting ${logs.length} logs`);

    res.json({
      success: true,
      data: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        source: log.source,
        details: log.details
      }))
    });

  } catch (error) {
    log.error('Export logs error:', error);
    logger.error('Export logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export logs',
      error: error.message
    });
  }
};

export const getLogDetails = getLogById;

export const getCourseDetails = getCourseById;