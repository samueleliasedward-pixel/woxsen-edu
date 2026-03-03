import jwt from 'jsonwebtoken'; 
import crypto from 'crypto'; 
import config from '../config/env.js'; 
 
export const generateToken = (userId, role) => { 
  return jwt.sign( 
    {  
      id: userId, 
      role  
    }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expire } 
  ); 
}; 
 
export const generateRefreshToken = () => { 
  return crypto.randomBytes(40).toString('hex'); 
}; 
 
export const verifyToken = (token) => { 
  try { 
    return jwt.verify(token, config.jwt.secret); 
  } catch (error) { 
    return null; 
  } 
}; 
 
export const verifyRefreshToken = (token) => { 
  try { 
    return jwt.verify(token, config.jwt.refreshSecret); 
  } catch (error) { 
    return null; 
  } 
};