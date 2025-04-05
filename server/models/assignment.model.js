const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        submissionDate: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            filename: String,
            path: String,
            mimetype: String,
          },
        ],
        comment: String,
        grade: {
          marks: {
            type: Number,
            default: 0,
          },
          feedback: String,
          gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          gradedAt: Date,
        },
        status: {
          type: String,
          enum: ['pending', 'submitted', 'late', 'graded'],
          default: 'pending',
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 