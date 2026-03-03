import prisma from '../config/db.js'; 
import bcrypt from 'bcryptjs'; 
 
export const findUserByEmail = async (email) => { 
  return prisma.user.findUnique({ 
    where: { email } 
  }); 
}; 
 
export const findUserById = async (id, includeProfile = true) => { 
  const include = {}; 
   
  if (includeProfile) { 
    include.studentProfile = true; 
    include.facultyProfile = true; 
    include.adminProfile = true; 
  } 
 
  return prisma.user.findUnique({ 
    where: { id }, 
    include 
  }); 
}; 
 
export const createUser = async (userData) => { 
  const salt = await bcrypt.genSalt(10); 
  const hashedPassword = await bcrypt.hash(userData.password, salt); 
 
  return prisma.user.create({ 
    data: { 
      ...userData, 
      password: hashedPassword 
    } 
  }); 
}; 
 
export const updateUser = async (id, data) => { 
  return prisma.user.update({ 
    where: { id }, 
    data 
  }); 
}; 
 
export const deactivateUser = async (id) => { 
  return prisma.user.update({ 
    where: { id }, 
    data: { isActive: false } 
  }); 
}; 
 
export const getUserStats = async () => { 
  const [students, faculty, admins] = await Promise.all([ 
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }), 
    prisma.user.count({ where: { role: 'FACULTY', isActive: true } }), 
    prisma.user.count({ where: { role: 'ADMIN', isActive: true } }) 
  ]); 
 
  return { students, faculty, admins }; 
};