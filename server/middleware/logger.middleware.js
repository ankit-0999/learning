const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for access and error logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for request body
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Don't log sensitive information like passwords
    const body = { ...req.body };
    if (body.password) body.password = '[REDACTED]';
    if (body.confirmPassword) body.confirmPassword = '[REDACTED]';
    return JSON.stringify(body);
  }
  return '';
});

// Custom format for detailed logging
const detailedFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body';

// Development logger - Console output
const developmentLogger = morgan('dev');

// Production loggers - File output
const accessLogger = morgan(detailedFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
});

const errorLogger = morgan(detailedFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

module.exports = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    developmentLogger(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  } else {
    // First log all requests
    accessLogger(req, res, (err) => {
      if (err) return next(err);
      
      // Then log errors separately
      errorLogger(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    });
  }
}; 