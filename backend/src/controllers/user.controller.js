import prisma from '../config/db.js';

export const getFacultyUsers = async (req, res) => {
  try {
    console.log('\n==================================================');
    console.log(' 👥 FETCHING FACULTY USERS');
    console.log('==================================================');
    
    const faculty = await prisma.user.findMany({
      where: {
        role: 'FACULTY',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        facultyProfile: {
          select: {
            department: true,
            designation: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${faculty.length} faculty members`);

    const formattedFaculty = faculty.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      department: f.facultyProfile?.department || 'Not specified',
      designation: f.facultyProfile?.designation || 'Faculty'
    }));

    res.json({
      success: true,
      data: formattedFaculty
    });

  } catch (error) {
    console.error('❌ Get faculty users error:', error);
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
    
    const faculty = await prisma.user.findUnique({
      where: {
        id,
        role: 'FACULTY'
      },
      select: {
        id: true,
        name: true,
        email: true,
        facultyProfile: {
          select: {
            department: true,
            designation: true,
            qualification: true,
            specialization: true,
            officeHours: true,
            cabin: true
          }
        }
      }
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.facultyProfile?.department,
        designation: faculty.facultyProfile?.designation,
        qualification: faculty.facultyProfile?.qualification,
        specialization: faculty.facultyProfile?.specialization,
        officeHours: faculty.facultyProfile?.officeHours,
        cabin: faculty.facultyProfile?.cabin
      }
    });

  } catch (error) {
    console.error('❌ Get faculty by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load faculty details',
      error: error.message
    });
  }
};