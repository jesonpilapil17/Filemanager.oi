const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  },
  shareKey: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  passwordHash: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxUses: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate that either fileId or folderId is provided
ShareSchema.pre('validate', function(next) {
  if (!this.fileId && !this.folderId) {
    return next(new Error('Either fileId or folderId must be provided'));
  }
  if (this.fileId && this.folderId) {
    return next(new Error('Only one of fileId or folderId should be provided'));
  }
  next();
});

module.exports = mongoose.model('Share', ShareSchema);