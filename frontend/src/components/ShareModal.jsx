import { useState } from 'react';
import { documentService } from '../services/api';
import './ShareModal.css';

const ShareModal = ({ document, onClose, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await documentService.share(document._id, email, permission);
      setEmail('');
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail) => {
    try {
      await documentService.removeCollaborator(document._id, collaboratorEmail);
      onUpdate();
    } catch {
      setError('Failed to remove collaborator');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Share "{document.title}"</h2>

        <form onSubmit={handleShare}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Permission</label>
            <select value={permission} onChange={(e) => setPermission(e.target.value)}>
              <option value="viewer">Viewer (can view only)</option>
              <option value="editor">Editor (can edit)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-share-submit">
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </form>

        <div className="collaborators-list">
          <h3>Collaborators</h3>
          {document.collaborators && document.collaborators.length > 0 ? (
            <ul>
              {document.collaborators.map((collab, index) => (
                <li key={index} className="collaborator-item">
                  <div className="collaborator-info">
                    <span className="collaborator-email">{collab.user}</span>
                    <span className={`collaborator-permission ${collab.permission}`}>
                      {collab.permission}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCollaborator(collab.user)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-collaborators">No collaborators yet</p>
          )}
        </div>

        <button onClick={onClose} className="btn-close">
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
