const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkDocumentPermission = require('../middleware/permission');

// Create document
router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body;

    const document = new Document({
      title: title || 'Untitled Document',
      owner: req.userId,
      content: ''
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all documents (owned + shared with user)
router.get('/', auth, async (req, res) => {
  try {
    const ownedDocuments = await Document.find({ owner: req.userId })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');

    const sharedDocuments = await Document.find({
      'collaborators.user': req.user.email
    })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');

    const documentsWithPermissions = [
      ...ownedDocuments.map(doc => ({
        ...doc.toObject(),
        permission: 'owner'
      })),
      ...sharedDocuments.map(doc => {
        const collaborator = doc.collaborators.find(c => c.user === req.user.email);
        return {
          ...doc.toObject(),
          permission: collaborator.permission
        };
      })
    ];

    res.json(documentsWithPermissions);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single document
router.get('/:id', auth, checkDocumentPermission('viewer'), async (req, res) => {
  try {
    res.json({
      ...req.document.toObject(),
      permission: req.userPermission
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document content
router.put('/:id/content', auth, checkDocumentPermission('editor'), async (req, res) => {
  try {
    const { content } = req.body;
    
    req.document.content = content;
    await req.document.save();

    res.json(req.document);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document title (owner only)
router.put('/:id/title', auth, checkDocumentPermission('owner'), async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    req.document.title = title;
    await req.document.save();

    res.json(req.document);
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share document
router.post('/:id/share', auth, checkDocumentPermission('owner'), async (req, res) => {
  try {
    const { email, permission } = req.body;

    if (!email || !permission) {
      return res.status(400).json({ error: 'Email and permission are required' });
    }

    if (!['viewer', 'editor'].includes(permission)) {
      return res.status(400).json({ error: 'Invalid permission type' });
    }

    if (email === req.user.email) {
      return res.status(400).json({ error: 'Cannot share with yourself' });
    }

    const existingCollaborator = req.document.collaborators.find(c => c.user === email);
    if (existingCollaborator) {
      existingCollaborator.permission = permission;
    } else {
      req.document.collaborators.push({ user: email, permission });
    }

    await req.document.save();
    res.json(req.document);
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove collaborator
router.delete('/:id/share/:email', auth, checkDocumentPermission('owner'), async (req, res) => {
  try {
    const { email } = req.params;
    
    req.document.collaborators = req.document.collaborators.filter(
      c => c.user !== email
    );

    await req.document.save();
    res.json(req.document);
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete document (owner only)
router.delete('/:id', auth, checkDocumentPermission('owner'), async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
