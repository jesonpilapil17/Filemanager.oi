const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Share = require('../models/Share');
const File = require('../models/File');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

// Create a new share
router.post('/', auth, async (req, res) => {
  try {
    const { fileId, folderId, type, password, expiresAt, maxUses } = req.body;
    const userId = req.user.id;
    
    // Validate that either fileId or folderId is provided
    if (!fileId && !folderId) {
      return res.status(400).json({ message: 'Either fileId or folderId must be provided' });
    }
    
    // Verify ownership
    if (fileId) {
      const file = await File.findOne({ _id: fileId, userId });
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
    }
    
    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }
    
    // Generate unique share key
    const shareKey = uuidv4().replace(/-/g, '').substring(0, 16);
    
    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }
    
    const share = new Share({
      userId,
      fileId: fileId || undefined,
      folderId: folderId || undefined,
      shareKey,
      type: type || 'public',
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUses: maxUses || null
    });
    
    await share.save();
    
    res.json({
      shareKey,
      shareUrl: `${req.protocol}://${req.get('host')}/s/${shareKey}`,
      type: share.type,
      expiresAt: share.expiresAt,
      maxUses: share.maxUses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all shares for the current user
router.get('/', auth, async (req, res) => {
  try {
    const shares = await Share.find({ userId: req.user.id })
      .populate('fileId', 'filename size mimeType')
      .populate('folderId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Access a shared file/folder
router.get('/:shareKey', async (req, res) => {
  try {
    const { shareKey } = req.params;
    const { password } = req.query;
    
    const share = await Share.findOne({ shareKey })
      .populate('fileId')
      .populate('folderId');
    
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ message: 'Share has expired' });
    }
    
    // Check if share has reached max uses
    if (share.maxUses && share.usedCount >= share.maxUses) {
      return res.status(410).json({ message: 'Share has reached maximum uses' });
    }
    
    // Check password if required
    if (share.passwordHash) {
      if (!password) {
        return res.status(401).json({ message: 'Password required' });
      }
      
      const isMatch = await bcrypt.compare(password, share.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }
    
    // Increment used count
    share.usedCount += 1;
    await share.save();
    
    // Return share information
    const response = {
      shareKey,
      type: share.type,
      usedCount: share.usedCount,
      maxUses: share.maxUses,
      expiresAt: share.expiresAt
    };
    
    if (share.fileId) {
      response.file = {
        id: share.fileId._id,
        filename: share.fileId.filename,
        size: share.fileId.size,
        mimeType: share.fileId.mimeType
      };
    }
    
    if (share.folderId) {
      response.folder = {
        id: share.folderId._id,
        name: share.folderId.name
      };
    }
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a share
router.delete('/:shareKey', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ 
      shareKey: req.params.shareKey, 
      userId: req.user.id 
    });
    
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    await share.remove();
    res.json({ message: 'Share deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;