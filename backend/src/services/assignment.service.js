import prisma from '../config/db.js'; 
import { sendAssignmentReminder } from './email.service.js'; 
 
export const createAssignment = async (data) => { 
  return prisma.assignment.create({ 
    data 
  }); 
}; 
 
export const getAssignmentById = async (id) => { 
  return prisma.assignment.findUnique({ 
    where: { id }, 
    include: { 
      course: true, 
      submissions: { 
        include: { 
          student: { 
            select: { name: true, email: true } 
          }, 
          grade: true 
        } 
      } 
    } 
  }); 
}; 
 
export const updateAssignment = async (id, data) => { 
  return prisma.assignment.update({ 
    where: { id }, 
    data 
  }); 
}; 
 
export const deleteAssignment = async (id) => { 
  return prisma.assignment.update({ 
    where: { id }, 
    data: { status: 'COMPLETED' } 
  }); 
}; 
 
export const submitAssignment = async (submissionData) => { 
  const existing = await prisma.submission.findUnique({ 
    where: { 
      assignmentId_studentId: { 
        assignmentId: submissionData.assignmentId, 
        studentId: submissionData.studentId 
      } 
    } 
  }); 
 
  if (existing) { 
    return prisma.submission.update({ 
      where: { id: existing.id }, 
      data: { 
        files: submissionData.files, 
        comments: submissionData.comments, 
        submittedAt: new Date(), 
        status: 'SUBMITTED' 
      } 
    }); 
  } 
 
  return prisma.submission.create({ 
    data: submissionData 
  }); 
}; 
 
export const gradeSubmission = async (submissionId, gradeData) => { 
  const percentage = (gradeData.score / gradeData.maxScore) * 100; 
  let letterGrade = 'F'; 
 
  if (percentage >= 90) letterGrade = 'A'; 
  else if (percentage >= 80) letterGrade = 'B'; 
  else if (percentage >= 70) letterGrade = 'C'; 
  else if (percentage >= 60) letterGrade = 'D'; 
 
  return prisma.$transaction(async (tx) => { 
    const submission = await tx.submission.update({ 
      where: { id: submissionId }, 
      data: { status: 'GRADED' } 
    }); 
 
    const grade = await tx.grade.create({ 
      data: { 
        ...gradeData, 
        submissionId, 
        percentage, 
        letterGrade 
      }, 
      include: { 
        submission: { 
          include: { 
            assignment: { 
              include: { 
                course: true 
              } 
            }, 
            student: true 
          } 
        } 
      } 
    }); 
 
    return grade; 
  }); 
}; 
 
export const getUpcomingDeadlines = async (days = 7) => { 
  const now = new Date(); 
  const future = new Date(now); 
  future.setDate(future.getDate() + days); 
 
  return prisma.assignment.findMany({ 
    where: { 
      dueDate: { gte: now, lte: future }, 
      status: 'ACTIVE' 
    }, 
    include: { 
      course: true 
    } 
  }); 
};