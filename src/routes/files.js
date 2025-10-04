const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Initialize upload for a new file
router.post('/init', auth, async (req, res) => {
  try {
    const { filename, size, mimeType, folderId } = req.body;
    const userId = req.user.id;
    
    // Create a new file record with status 'uploading'
    const file = new File({
      userId,
      folderId: folderId || null,
      filename,
      size,
      mimeType,
      storageKey: `uploads/${userId}/${uuidv4()}-${filename}`,
      status: 'uploading'
    });
    
    await file.save();
    
    // For simplicity, we're not implementing actual S3 integration here
    // In a real app, you would generate S3 presigned URLs for each chunk
    
    // Return upload ID and chunk size
    res.json({
      uploadId: file._id,
      chunkSize: 10 * 1024 * 1024, // 10MB chunks
      file: {
        id: file._id,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimeType,
        status: file.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a file chunk
router.post('/upload/:uploadId', auth, upload.single('chunk'), async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { chunkIndex, totalChunks } = req.body;
    
    // Find the file record
    const file = await File.findOne({ _id: uploadId, userId: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // In a real app, you would upload the chunk to S3 here
    // For now, we'll just simulate the upload
    
    // If this is the last chunk, mark the file as ready
    if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
      file.status = 'ready';
      await file.save();
    }
    
    res.json({
      success: true,
      chunkIndex,
      file: {
        id: file._id,
        filename: file.filename,
        status: file.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all files for the current user
router.get('/', auth, async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = { 
      userId: req.user.id,
      status: 'ready'
    };
    
    if (folderId) {
      query.folderId = folderId;
    } else {
      query.folderId = null; // Root folder
    }
    
    const files = await File.find(query).sort({ updatedAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single file by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // In a real app, you would delete the file from S3 here
    
    await file.remove();
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;