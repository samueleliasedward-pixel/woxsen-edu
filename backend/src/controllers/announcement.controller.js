import prisma from '../config/db.js';

export const getAnnouncements = async (req, res) => {
  try {
    const { target, status } = req.query;
    
    const where = {};
    if (target && target !== 'all') where.target = target;
    if (status === 'active') {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    } else if (status === 'expired') {
      where.expiresAt = { lt: new Date() };
    }
    
    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    res.json({
      success: true,
      data: announcements
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target, priority, pinned, expiresAt } = req.body;
    
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        target: target || 'all',
        priority: priority || 'medium',
        pinned: pinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById: req.user.id
      }
    });
    
    res.status(201).json({
      success: true,
      data: announcement
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        target: data.target,
        priority: data.priority,
        pinned: data.pinned,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    });
    
    res.json({
      success: true,
      data: announcement
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.announcement.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};