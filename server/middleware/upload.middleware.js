const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

// File size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};

// File filter function to check allowed types
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on file field
  const allowedTypes = {
    'profile': /jpeg|jpg|png/,
    'document': /pdf|doc|docx|txt/,
    'video': /mp4|avi|mov|wmv/,
    'lecture': /pdf|ppt|pptx|doc|docx/,
    'assignment': /pdf|doc|docx|zip|rar|txt/
  };
  
  // Determine file type category based on fieldname
  let fileCategory = 'document'; // default category
  
  if (file.fieldname.includes('profile')) {
    fileCategory = 'profile';
  } else if (file.fieldname.includes('video')) {
    fileCategory = 'video';
  } else if (file.fieldname.includes('lecture')) {
    fileCategory = 'lecture';
  } else if (file.fieldname.includes('assignment')) {
    fileCategory = 'assignment';
  }
  
  // Get file mimetype without the initial "image/", "application/", etc.
  const mimetype = file.mimetype.split('/')[1];
  
  // Check if file type is allowed
  if (allowedTypes[fileCategory].test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes[fileCategory].toString()} files are allowed for ${fileCategory}.`), false);
  }
};

// Initialize multer with configuration
const upload = multer({
  storage,
  limits,
  fileFilter,
});

module.exports = {
  upload,
  // Helper function for single file upload
  uploadSingle: (fieldName) => upload.single(fieldName),
  // Helper function for multiple file upload
  uploadMultiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  // Helper function for uploading multiple fields with different file types
  uploadFields: (fields) => upload.fields(fields),
}; 