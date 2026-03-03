import prisma from '../config/db.js';

export const getDeadlines = async (req, res) => {
  try {
    const { type, status, month } = req.query;
    
    const where = {};
    if (type && type !== 'all') where.type = type;
    if (status && status !== 'all') where.status = status;
    
    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        course: {
          select: { name: true, code: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const formatted = deadlines.map(d => ({
      id: d.id,
      title: d.title,
      type: d.type,
      course: d.course.name,
      dueDate: d.dueDate.toISOString().split('T')[0],
      dueTime: d.dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      submissions: d.submissions,
      totalStudents: d.totalStudents,
      status: d.status,
      priority: d.priority,
      daysLeft: Math.ceil((d.dueDate - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeadline = async (req, res) => {
  try {
    const { title, type, courseId, description, dueDate, dueTime, submissions, totalStudents, status, priority } = req.body;
    
    const dueDateTime = new Date(`${dueDate}T${dueTime || '23:59'}`);
    
    const deadline = await prisma.deadline.create({
      data: {
        title,
        type,
        courseId,
        description,
        dueDate: dueDateTime,
        submissions: parseInt(submissions) || 0,
        totalStudents: parseInt(totalStudents) || 0,
        status,
        priority,
        createdById: req.user.id
      }
    });

    res.status(201).json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const deadline = await prisma.deadline.update({
      where: { id },
      data
    });

    res.json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.deadline.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};