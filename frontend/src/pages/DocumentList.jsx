import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/api';
import './DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const doc = await documentService.create(newDocTitle || 'Untitled Document');
      setShowNewDocModal(false);
      setNewDocTitle('');
      navigate(`/documents/${doc._id}`);
    } catch {
      setError('Failed to create document');
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.delete(id);
        loadDocuments();
      } catch {
        setError('Failed to delete document');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionBadge = (permission) => {
    const colors = {
      owner: '#4caf50',
      editor: '#2196f3',
      viewer: '#ff9800'
    };
    return (
      <span className="permission-badge" style={{ backgroundColor: colors[permission] }}>
        {permission.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading documents...</div>;
  }

  return (
    <div className="document-list-container">
      <header className="document-header">
        <h1>My Documents</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user?.name}</span>
          <button onClick={() => setShowNewDocModal(true)} className="btn-new">
            + New Document
          </button>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="empty-state">
            <h2>No documents yet</h2>
            <p>Create your first document to get started</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="document-card"
              onClick={() => navigate(`/documents/${doc._id}`)}
            >
              <div className="document-card-header">
                <h3>{doc.title}</h3>
                {getPermissionBadge(doc.permission)}
              </div>
              <div className="document-card-meta">
                <span>Updated: {formatDate(doc.updatedAt)}</span>
                {doc.owner && <span>Owner: {doc.owner.name}</span>}
              </div>
              {doc.permission === 'owner' && (
                <button
                  className="btn-delete"
                  onClick={(e) => handleDeleteDocument(doc._id, e)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showNewDocModal && (
        <div className="modal-overlay" onClick={() => setShowNewDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Document</h2>
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document title"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowNewDocModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleCreateDocument} className="btn-create">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
