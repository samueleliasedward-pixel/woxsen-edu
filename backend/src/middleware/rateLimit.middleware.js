import rateLimit from 'express-rate-limit'; 
import config from '../config/env.js'; 
 
export const apiLimiter = rateLimit({ 
  windowMs: config.rateLimit.window, 
  max: config.rateLimit.max, 
  message: { 
    success: false, 
    message: 'Too many requests, please try again later.' 
  }, 
  standardHeaders: true, 
  legacyHeaders: false, 
}); 
 
export const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 5, // 5 attempts 
  message: { 
    success: false, 
    message: 'Too many login attempts, please try again later.' 
  }, 
  skipSuccessfulRequests: true, 
}); 
 
export const aiLimiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 minute 
  max: 30, // 30 requests per minute 
  message: { 
    success: false, 
    message: 'AI rate limit exceeded. Please slow down.' 
  } 
});