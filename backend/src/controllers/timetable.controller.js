import prisma from '../config/db.js';

const log = {
  info: (message, data = '') => console.log(`ℹ️ ${message}`, data),
  success: (message, data = '') => console.log(`✅ ${message}`, data),
  error: (message, data = '') => console.error(`❌ ${message}`, data),
  section: (title) => {
    console.log('\n' + '='.repeat(50));
    console.log(` ${title}`);
    console.log('='.repeat(50));
  }
};

export const getTimetable = async (req, res) => {
  try {
    log.section('📅 FETCHING TIMETABLE');
    
    const { batch, year } = req.query;
    
    const where = {};
    if (batch && batch !== 'all') where.batch = batch;
    if (year && year !== 'all') where.year = parseInt(year);
    
    let tableExists = false;
    try {
      const count = await prisma.timetableEntry.count();
      tableExists = true;
      console.log(`✅ Timetable table exists with ${count} entries`);
    } catch (e) {
      console.log('⚠️ Timetable table does not exist yet');
      return res.json({
        success: true,
        data: []
      });
    }
    
    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { time: 'asc' }
      ]
    });

    const formatted = entries.map(e => ({
      id: e.id,
      day: e.day,
      time: e.time,
      course: e.course.name,
      code: e.course.code,
      faculty: e.faculty.name,
      room: e.room,
      batch: e.batch,
      year: e.year,
      semester: e.semester,
      type: e.type || 'Lecture'
    }));

    log.success(`Found ${formatted.length} timetable entries`);
    
    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    log.error('Get timetable error:', error);
    res.status(200).json({
      success: true,
      data: []
    });
  }
};

export const createTimetableEntry = async (req, res) => {
  try {
    log.section('➕ CREATING TIMETABLE ENTRY');
    
    const { day, time, courseId, facultyId, room, batch, year, semester, type } = req.body;
    
    const entry = await prisma.timetableEntry.create({
      data: {
        day, time, room, batch,
        year: parseInt(year),
        semester: parseInt(semester),
        type: type || 'Lecture',
        course: { connect: { id: courseId } },
        faculty: { connect: { id: facultyId } }
      },
      include: {
        course: { select: { name: true, code: true } },
        faculty: { select: { name: true } }
      }
    });

    log.success(`Created entry for ${day} at ${time}`);
    
    res.status(201).json({
      success: true,
      message: 'Timetable entry created',
      data: entry
    });

  } catch (error) {
    log.error('Create timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entry',
      error: error.message
    });
  }
};

export const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, time, courseId, facultyId, room, batch, year, semester, type } = req.body;
    
    const entry = await prisma.timetableEntry.update({
      where: { id },
      data: {
        day, time, room, batch,
        year: parseInt(year),
        semester: parseInt(semester),
        type,
        course: { connect: { id: courseId } },
        faculty: { connect: { id: facultyId } }
      },
      include: {
        course: { select: { name: true, code: true } },
        faculty: { select: { name: true } }
      }
    });

    log.success(`Updated entry ${id}`);
    
    res.json({
      success: true,
      message: 'Timetable entry updated',
      data: entry
    });

  } catch (error) {
    log.error('Update timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entry',
      error: error.message
    });
  }
};

export const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.timetableEntry.delete({
      where: { id }
    });

    log.success(`Deleted entry ${id}`);
    
    res.json({
      success: true,
      message: 'Timetable entry deleted'
    });

  } catch (error) {
    log.error('Delete timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry',
      error: error.message
    });
  }
};

export const generateTimetable = async (req, res) => {
  try {
    log.section('⚡ GENERATING TIMETABLE');
    
    const { entries } = req.body;
    
    const created = await prisma.$transaction(
      entries.map(entry => 
        prisma.timetableEntry.create({
          data: {
            day: entry.day,
            time: entry.time,
            room: entry.room,
            batch: entry.batch,
            year: parseInt(entry.year),
            semester: parseInt(entry.semester),
            type: entry.type || 'Lecture',
            course: { connect: { id: entry.courseId } },
            faculty: { connect: { id: entry.facultyId } }
          }
        })
      )
    );

    log.success(`Generated ${created.length} entries`);
    
    res.json({
      success: true,
      message: `Generated ${created.length} timetable entries`,
      data: created
    });

  } catch (error) {
    log.error('Generate timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
};