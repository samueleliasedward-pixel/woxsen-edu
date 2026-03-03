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

// @desc    Get all system logs
// @route   GET /api/admin/system-logs
export const getSystemLogs = async (req, res) => {
  try {
    log.section('📋 FETCHING SYSTEM LOGS');
    
    const { level, page = 1, limit = 50 } = req.query;
    
    // Build where clause
    const where = {};
    if (level && level !== 'all') {
      where.level = level;
    }
    
    // Check if table exists
    let tableExists = false;
    try {
      await prisma.systemLog.count();
      tableExists = true;
      console.log('✅ SystemLogs table exists');
    } catch (e) {
      console.log('⚠️ SystemLogs table does not exist yet');
      return res.status(200).json({
        success: true,
        data: {
          logs: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 1
          }
        }
      });
    }
    
    // Get total count for pagination
    const total = await prisma.systemLog.count({ where });
    
    // Get paginated logs
    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    log.success(`Found ${logs.length} logs (total: ${total})`);

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
    // Return empty array on error to prevent frontend crash
    res.status(200).json({
      success: true,
      data: {
        logs: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 1
        }
      }
    });
  }
};

// @desc    Get log by ID
// @route   GET /api/admin/system-logs/:id
export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    log.info(`Fetching log with ID: ${id}`);
    
    const logEntry = await prisma.systemLog.findUnique({
      where: { id }
    });

    if (!logEntry) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: logEntry
    });

  } catch (error) {
    log.error('Get log by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new system log (internal use)
// @route   POST /api/admin/system-logs
export const createSystemLog = async (req, res) => {
  try {
    const { level, message, source, user, details } = req.body;
    
    const logEntry = await prisma.systemLog.create({
      data: {
        level,
        message,
        source: source || 'System',
        user: user || 'system',
        details: details || {}
      }
    });

    res.status(201).json({
      success: true,
      data: logEntry
    });

  } catch (error) {
    log.error('Create system log error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete old logs (cleanup)
// @route   DELETE /api/admin/system-logs/cleanup
export const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await prisma.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    log.success(`Deleted ${result.count} old logs`);

    res.json({
      success: true,
      message: `Deleted ${result.count} logs older than ${days} days`
    });

  } catch (error) {
    log.error('Cleanup logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export logs
// @route   GET /api/admin/system-logs/export
export const exportLogs = async (req, res) => {
  try {
    const { level, startDate, endDate, format = 'json' } = req.query;
    
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

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        ['Level', 'Timestamp', 'Source', 'Message', 'User', 'Details'].join(','),
        ...logs.map(log => [
          log.level,
          log.timestamp.toISOString(),
          log.source || '',
          log.message,
          log.user || 'system',
          JSON.stringify(log.details || {})
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=system-logs.csv');
      return res.send(csv);
    }
    
    // Default JSON format
    res.json({
      success: true,
      data: logs.map(log => ({
        id: log.id,
        level: log.level,
        timestamp: log.timestamp,
        source: log.source,
        message: log.message,
        user: log.user,
        details: log.details
      }))
    });

  } catch (error) {
    log.error('Export logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear all logs
// @route   DELETE /api/admin/system-logs
export const clearAllLogs = async (req, res) => {
  try {
    await prisma.systemLog.deleteMany({});
    
    log.success('All logs cleared');

    res.json({
      success: true,
      message: 'All logs cleared successfully'
    });

  } catch (error) {
    log.error('Clear logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Alias for getLogById to match route imports
export const getLogDetails = getLogById;