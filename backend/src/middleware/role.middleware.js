export const authorize = (...roles) => { 
  return (req, res, next) => { 
    if (!req.user) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      }); 
    } 
 
    if (!roles.includes(req.user.role)) { 
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      }); 
    } 
 
    next(); 
  }; 
}; 
 
export const isStudent = (req, res, next) => { 
  if (!req.user || req.user.role !== 'STUDENT') { 
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Student only.' 
    }); 
  } 
  next(); 
}; 
 
export const isFaculty = (req, res, next) => { 
  if (!req.user || req.user.role !== 'FACULTY') { 
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Faculty only.' 
    }); 
  } 
  next(); 
}; 
 
export const isAdmin = (req, res, next) => { 
  if (!req.user || req.user.role !== 'ADMIN') { 
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    }); 
  } 
  next(); 
};