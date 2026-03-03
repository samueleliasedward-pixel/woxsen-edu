// K:\woxsen-edu\backend\src\controllers\auth.controller.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/env.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Get user profile based on role
 */
const getUserProfile = (user) => {
  if (user.role === 'STUDENT' && user.studentProfile) {
    return user.studentProfile;
  } else if (user.role === 'FACULTY' && user.facultyProfile) {
    return user.facultyProfile;
  } else if (user.role === 'ADMIN' && user.adminProfile) {
    return user.adminProfile;
  }
  return null;
};

/**
 * Format user response
 */
const formatUserResponse = (user, token = null) => {
  const profile = getUserProfile(user);
  
  const response = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      profile: profile
    }
  };

  if (token) {
    response.token = token;
  }

  return response;
};

/**
 * Log with emoji for better readability
 */
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

// ============================================================================
// AUTHENTICATION CONTROLLERS
// ============================================================================

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      studentId, 
      employeeId, 
      phone,
      program,
      year,
      semester,
      department,
      designation
    } = req.body;

    log.section('📝 REGISTRATION ATTEMPT');
    log.info('Email:', email);
    log.info('Name:', name);
    log.info('Role:', role);

    // ===== VALIDATION =====
    // Check required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and role are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate role
    const validRoles = ['student', 'faculty', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, faculty, or admin'
      });
    }

    // Validate role-specific fields
    if (role === 'student' && !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required for student registration'
      });
    }

    if ((role === 'faculty' || role === 'admin') && !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required for faculty/admin registration'
      });
    }

    // ===== CHECK EXISTING USER =====
    log.info('Checking if user exists with email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      log.error('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    log.success('Email is available');

    // Check student ID uniqueness
    if (role === 'student' && studentId) {
      log.info('Checking student ID:', studentId);
      const existingStudent = await prisma.studentProfile.findUnique({
        where: { studentId }
      });
      
      if (existingStudent) {
        log.error('Student ID already in use:', studentId);
        return res.status(400).json({
          success: false,
          message: 'Student ID already in use'
        });
      }
      log.success('Student ID is available');
    }

    // Check employee ID uniqueness
    if ((role === 'faculty' || role === 'admin') && employeeId) {
      log.info('Checking employee ID:', employeeId);
      
      const [existingFaculty, existingAdmin] = await Promise.all([
        prisma.facultyProfile.findUnique({ where: { employeeId } }),
        prisma.adminProfile.findUnique({ where: { employeeId } })
      ]);
      
      if (existingFaculty || existingAdmin) {
        log.error('Employee ID already in use:', employeeId);
        return res.status(400).json({
          success: false,
          message: 'Employee ID already in use'
        });
      }
      log.success('Employee ID is available');
    }

    // ===== CREATE USER =====
    log.info('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    log.success('Password hashed');

    let user;
    const roleUpper = role.toUpperCase();

    // Create user based on role
    if (role === 'student') {
      log.info('Creating student account...');
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: roleUpper,
          studentProfile: {
            create: {
              studentId,
              phone: phone || null,
              program: program || 'B.Tech Computer Science',
              department: department || 'Computer Science',
              year: year ? parseInt(year) : 1,
              semester: semester ? parseInt(semester) : 1,
              batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`
            }
          }
        },
        include: {
          studentProfile: true
        }
      });
    } 
    else if (role === 'faculty') {
      log.info('Creating faculty account...');
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: roleUpper,
          facultyProfile: {
            create: {
              employeeId,
              phone: phone || null,
              department: department || 'Computer Science',
              designation: designation || 'Assistant Professor',
              qualification: 'PhD',
              specialization: ['Computer Science'],
              joinDate: new Date()
            }
          }
        },
        include: {
          facultyProfile: true
        }
      });
    } 
    else if (role === 'admin') {
      log.info('Creating admin account...');
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: roleUpper,
          adminProfile: {
            create: {
              employeeId,
              phone: phone || null,
              department: department || 'Administration',
              role: designation || 'Administrator'
            }
          }
        },
        include: {
          adminProfile: true
        }
      });
    }

    log.success(`Account created with ID: ${user.id}`);

    // ===== GENERATE TOKEN =====
    log.info('Generating JWT token...');
    const token = generateToken(user);
    log.success('Token generated');

    log.success('Registration successful!');

    // ===== RETURN RESPONSE =====
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: formatUserResponse(user, token)
    });

  } catch (error) {
    log.error('Registration error:', error);
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(400).json({
        success: false,
        message: field ? `${field} already exists` : 'Duplicate field value'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    log.section('🔐 LOGIN ATTEMPT');
    log.info('Email:', email);
    log.info('Requested role:', role || 'any');

    // ===== VALIDATION =====
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // ===== FIND USER =====
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        facultyProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      log.error('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== CHECK ACCOUNT STATUS =====
    if (!user.isActive) {
      log.error('Account deactivated:', email);
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // ===== VERIFY PASSWORD =====
    log.info('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      log.error('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    log.success('Password verified');

    // ===== VERIFY ROLE =====
    if (role) {
      const requestedRole = role.toUpperCase();
      const userRole = user.role.toUpperCase();
      
      if (userRole !== requestedRole) {
        log.error(`Role mismatch: expected ${requestedRole}, got ${userRole}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. This account is registered as ${user.role.toLowerCase()}, not as ${role}.`
        });
      }
    }

    // ===== GENERATE TOKEN =====
    log.info('Generating JWT token...');
    const token = generateToken(user);
    log.success('Token generated');

    // ===== UPDATE LAST LOGIN =====
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    log.success('Login successful!');

    // ===== RETURN RESPONSE =====
    res.json({
      success: true,
      message: 'Login successful',
      data: formatUserResponse(user, token)
    });

  } catch (error) {
    log.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc    Get current user profile (SIMPLIFIED VERSION)
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    log.section('👤 GET CURRENT USER');
    log.info('User ID:', req.user.id);

    // SIMPLE VERSION - just get user with basic profiles
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        facultyProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      log.error('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    log.success(`User found: ${user.email}, Role: ${user.role}`);

    // Get appropriate profile
    let profile = null;
    let additionalData = {};

    if (user.role === 'STUDENT' && user.studentProfile) {
      profile = user.studentProfile;
      
      // Get basic enrollments count
      const enrollmentsCount = await prisma.enrollment.count({
        where: { studentId: user.studentProfile.id }
      });
      
      additionalData = {
        enrolledCourses: enrollmentsCount
      };
    } 
    else if (user.role === 'FACULTY' && user.facultyProfile) {
      profile = user.facultyProfile;
      
      // Get basic course count
      const coursesCount = await prisma.course.count({
        where: { facultyId: user.facultyProfile.id }
      });
      
      additionalData = {
        taughtCourses: coursesCount
      };
    } 
    else if (user.role === 'ADMIN' && user.adminProfile) {
      profile = user.adminProfile;
    }

    // Format response
    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        profile: profile,
        ...additionalData
      }
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    log.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    log.section('🚪 LOGOUT');
    log.info('User ID:', req.user.id);
    
    // Since JWT is stateless, we just return success
    // Client should remove the token
    
    log.success('Logout successful');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    log.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// ============================================================================
// VALIDATION CONTROLLERS
// ============================================================================

/**
 * @desc    Check email availability
 * @route   POST /api/auth/check-email
 * @access  Public
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    res.json({
      success: true,
      data: {
        available: !user,
        message: user ? 'Email is already taken' : 'Email is available'
      }
    });

  } catch (error) {
    log.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email availability'
    });
  }
};

/**
 * @desc    Check student ID availability
 * @route   POST /api/auth/check-student-id
 * @access  Public
 */
export const checkStudentId = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      select: { id: true }
    });

    res.json({
      success: true,
      data: {
        available: !student,
        message: student ? 'Student ID is already taken' : 'Student ID is available'
      }
    });

  } catch (error) {
    log.error('Check student ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check student ID availability'
    });
  }
};

/**
 * @desc    Check employee ID availability
 * @route   POST /api/auth/check-employee-id
 * @access  Public
 */
export const checkEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const [faculty, admin] = await Promise.all([
      prisma.facultyProfile.findUnique({ where: { employeeId }, select: { id: true } }),
      prisma.adminProfile.findUnique({ where: { employeeId }, select: { id: true } })
    ]);

    const exists = !!(faculty || admin);

    res.json({
      success: true,
      data: {
        available: !exists,
        message: exists ? 'Employee ID is already taken' : 'Employee ID is available'
      }
    });

  } catch (error) {
    log.error('Check employee ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check employee ID availability'
    });
  }
};

// ============================================================================
// PROFILE MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * @desc    Update user profile (SIMPLIFIED VERSION)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    log.section('✏️ UPDATE PROFILE');
    log.info('User ID:', userId);

    // ===== FETCH CURRENT USER =====
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        adminProfile: true
      }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ===== UPDATE USER BASIC INFO =====
    const userUpdateData = {};
    
    if (updateData.name) {
      userUpdateData.name = updateData.name;
    }
    
    if (updateData.phone && updateData.phone !== currentUser.phone) {
      // Check if phone is already taken
      const phoneExists = await prisma.user.findFirst({
        where: { 
          phone: updateData.phone,
          NOT: { id: userId }
        }
      });
      
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
      userUpdateData.phone = updateData.phone;
    }

    // Update user if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
      log.success('User basic info updated');
    }

    // ===== UPDATE ROLE-SPECIFIC PROFILE =====
    if (currentUser.role === 'STUDENT' && currentUser.studentProfile) {
      const studentUpdateData = {};
      
      const studentFields = ['program', 'year', 'semester', 'address', 'emergencyContact', 'phone'];
      studentFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'year' || field === 'semester') {
            studentUpdateData[field] = parseInt(updateData[field]);
          } else {
            studentUpdateData[field] = updateData[field];
          }
        }
      });

      if (Object.keys(studentUpdateData).length > 0) {
        await prisma.studentProfile.update({
          where: { userId },
          data: studentUpdateData
        });
        log.success('Student profile updated');
      }
    } 
    else if (currentUser.role === 'FACULTY' && currentUser.facultyProfile) {
      const facultyUpdateData = {};
      
      const facultyFields = ['designation', 'qualification', 'specialization', 'officeHours', 'cabin', 'department', 'phone'];
      facultyFields.forEach(field => {
        if (updateData[field] !== undefined) {
          facultyUpdateData[field] = updateData[field];
        }
      });

      if (Object.keys(facultyUpdateData).length > 0) {
        await prisma.facultyProfile.update({
          where: { userId },
          data: facultyUpdateData
        });
        log.success('Faculty profile updated');
      }
    } 
    else if (currentUser.role === 'ADMIN' && currentUser.adminProfile) {
      const adminUpdateData = {};
      
      const adminFields = ['role', 'department', 'phone'];
      adminFields.forEach(field => {
        if (updateData[field] !== undefined) {
          adminUpdateData[field] = updateData[field];
        }
      });

      if (Object.keys(adminUpdateData).length > 0) {
        await prisma.adminProfile.update({
          where: { userId },
          data: adminUpdateData
        });
        log.success('Admin profile updated');
      }
    }

    // ===== FETCH UPDATED USER =====
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        adminProfile: true
      }
    });

    log.success('Profile update completed');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUserResponse(updatedUser)
    });

  } catch (error) {
    log.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    log.section('🔑 CHANGE PASSWORD');
    log.info('User ID:', userId);

    // ===== VALIDATION =====
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // ===== VERIFY CURRENT PASSWORD =====
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      log.error('Invalid current password');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // ===== HASH NEW PASSWORD =====
    log.info('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ===== UPDATE PASSWORD =====
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    log.success('Password changed successfully');

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    log.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ============================================================================
// ADDITIONAL UTILITY CONTROLLERS
// ============================================================================

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
export const refreshToken = async (req, res) => {
  try {
    log.section('🔄 REFRESH TOKEN');
    log.info('User ID:', req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        facultyProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        user: formatUserResponse(user)
      }
    });

  } catch (error) {
    log.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

/**
 * @desc    Get user statistics (for admin dashboard)
 * @route   GET /api/auth/stats
 * @access  Private (Admin only)
 */
export const getUserStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    log.section('📊 USER STATISTICS');

    const [
      totalUsers,
      activeUsers,
      studentsCount,
      facultyCount,
      adminsCount,
      recentRegistrations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.adminProfile.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: {
          users: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        byRole: {
          students: studentsCount,
          faculty: facultyCount,
          admins: adminsCount
        },
        recentRegistrations,
        registrationRate: ((recentRegistrations / totalUsers) * 100).toFixed(2) + '%'
      }
    });

  } catch (error) {
    log.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};