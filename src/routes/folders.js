const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const File = require('../models/File');
const auth = require('../middleware/auth');

// Create a new folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;
    const userId = req.user.id;
    
    // Check if folder with same name exists in the same parent
    const existingFolder = await Folder.findOne({
      userId,
      name,
      parentFolderId: parentFolderId || null
    });
    
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }
    
    const folder = new Folder({
      userId,
      name,
      parentFolderId: parentFolderId || null
    });
    
    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all folders for the current user
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolderId } = req.query;
    const query = { 
      userId: req.user.id
    };
    
    if (parentFolderId) {
      query.parentFolderId = parentFolderId;
    } else {
      query.parentFolderId = null; // Root folders
    }
    
    const folders = await Folder.find(query).sort({ updatedAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get folder contents (both folders and files)
router.get('/:id/contents', auth, async (req, res) => {
  try {
    const folderId = req.params.id === 'root' ? null : req.params.id;
    
    // Get subfolders
    const folders = await Folder.find({
      userId: req.user.id,
      parentFolderId: folderId
    }).sort({ name: 1 });
    
    // Get files
    const files = await File.find({
      userId: req.user.id,
      folderId: folderId,
      status: 'ready'
    }).sort({ updatedAt: -1 });
    
    res.json({
      folders: folders.map(folder => ({
        id: folder._id,
        name: folder.name,
        type: 'folder',
        updatedAt: folder.updatedAt
      })),
      files: files.map(file => ({
        id: file._id,
        name: file.filename,
        type: 'file',
        size: file.size,
        mimeType: file.mimeType,
        updatedAt: file.updatedAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rename a folder
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Check if folder with same name exists in the same parent
    const existingFolder = await Folder.findOne({
      userId: req.user.id,
      name,
      parentFolderId: folder.parentFolderId,
      _id: { $ne: folder._id }
    });
    
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }
    
    folder.name = name;
    await folder.save();
    
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Check if folder has contents
    const subfolders = await Folder.find({ parentFolderId: folder._id });
    const files = await File.find({ folderId: folder._id });
    
    if (subfolders.length > 0 || files.length > 0) {
      return res.status(400).json({ message: 'Cannot delete folder with contents' });
    }
    
    await folder.remove();
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;