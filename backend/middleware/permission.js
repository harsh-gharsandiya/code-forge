const Document = require('../models/Document');

const checkDocumentPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const documentId = req.params.id;
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const isOwner = document.owner.toString() === req.userId.toString();
      
      if (isOwner) {
        req.document = document;
        req.userPermission = 'owner';
        return next();
      }

      const collaborator = document.collaborators.find(
        c => c.user === req.user.email
      );

      if (!collaborator) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.document = document;
      req.userPermission = collaborator.permission;

      if (requiredPermission === 'owner' && !isOwner) {
        return res.status(403).json({ error: 'Only owner can perform this action' });
      }

      if (requiredPermission === 'editor' && collaborator.permission === 'viewer') {
        return res.status(403).json({ error: 'Editor permission required' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = checkDocumentPermission;
