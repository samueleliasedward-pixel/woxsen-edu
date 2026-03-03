import winston from 'winston'; 
import config from '../config/env.js'; 
 
const { combine, timestamp, printf, colorize, json } = winston.format; 
 
const customFormat = printf(({ level, message, timestamp, ...meta }) => { 
  return `${timestamp} [${level}]: ${message} ${ 
    Object.keys(meta).length ? JSON.stringify(meta) : '' 
  }`; 
}); 
 
const logger = winston.createLogger({ 
  level: config.logLevel, 
  format: combine( 
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    config.env === 'production' ? json() : customFormat 
  ), 
  transports: [ 
    new winston.transports.Console({ 
      format: combine(colorize(), timestamp(), customFormat) 
    }), 
    new winston.transports.File({  
      filename: 'logs/error.log',  
      level: 'error', 
      maxsize: 5242880, // 5MB 
      maxFiles: 5 
    }), 
    new winston.transports.File({  
      filename: 'logs/combined.log', 
      maxsize: 5242880, 
      maxFiles: 5 
    }) 
  ], 
  exceptionHandlers: [ 
    new winston.transports.File({ filename: 'logs/exceptions.log' }) 
  ] 
}); 
 
export default logger;