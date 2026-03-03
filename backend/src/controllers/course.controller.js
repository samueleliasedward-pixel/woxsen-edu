import prisma from '../config/db.js';

export const createCourse = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📝 CREATING NEW COURSE');
    console.log('==================================================');
    
    const { 
      name, 
      code, 
      description, 
      credits, 
      department
    } = req.body;
    
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('Course Data:', { name, code, department, credits });

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Course name and code are required'
      });
    }

    const existing = await prisma.course.findUnique({
      where: { code }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        description: description || null,
        credits: credits ? parseInt(credits) : 3,
        department: department || 'Computer Science',
        faculty: {
          connect: { id: userId }
        }
      }
    });

    console.log('✅ Course created:', course.code, course.name);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('❌ Create course error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📚 FETCHING FACULTY COURSES');
    console.log('==================================================');
    
    const userId = req.user.id;

    const courses = await prisma.course.findMany({
      where: { 
        facultyId: userId
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${courses.length} courses`);

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findFirst({
      where: {
        id,
        facultyId: userId
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
      data: course
    });

  } catch (error) {
    console.error('❌ Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, credits, department } = req.body;
    const userId = req.user.id;

    const course = await prisma.course.findFirst({
      where: {
        id,
        facultyId: userId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        credits: credits !== undefined ? parseInt(credits) : undefined,
        department: department !== undefined ? department : undefined
      }
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('❌ Update course error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findFirst({
      where: {
        id,
        facultyId: userId
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }

    await prisma.course.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete course error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findFirst({
      where: {
        id,
        facultyId: userId
      }
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
        status: 'ARCHIVED'
      }
    });

    res.json({
      success: true,
      message: 'Course archived successfully',
      data: updated
    });

  } catch (error) {
    console.error('❌ Archive course error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourseStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await prisma.course.findMany({
      where: {
        facultyId: userId
      }
    });

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.status !== 'ARCHIVED').length,
        archivedCourses: courses.filter(c => c.status === 'ARCHIVED').length
      }
    });

  } catch (error) {
    console.error('❌ Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAvailableCourses = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 📚 FETCHING AVAILABLE COURSES FOR STUDENT');
    console.log('==================================================');
    
    const studentId = req.user.studentProfile?.id;
    console.log('Student ID:', studentId);

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    // Get courses the student is already enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    });

    const enrolledCourseIds = enrollments.map(e => e.courseId);
    console.log('Enrolled course IDs:', enrolledCourseIds);

    // Get all courses not enrolled in (removed status filter)
    const availableCourses = await prisma.course.findMany({
      where: {
        id: {
          notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : [] // If no enrollments, get all courses
        }
      },
      include: {
        faculty: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${availableCourses.length} available courses`);

    const formattedCourses = availableCourses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      department: c.department,
      credits: c.credits,
      faculty: c.faculty?.name || 'Not Assigned',
      schedule: c.schedule || 'TBD',
      room: c.room || 'TBD'
    }));

    res.json({
      success: true,
      data: formattedCourses
    });

  } catch (error) {
    console.error('❌ Get available courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load available courses',
      error: error.message
    });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId: id
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId: id
      }
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });

  } catch (error) {
    console.error('❌ Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};