import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/api';
import ShareModal from '../components/ShareModal';
import './DocumentEditor.css';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [permission, setPermission] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const socketRef = useRef(null);
  const editorRef = useRef(null);

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getById(id);
      setDocument(data);
      setContent(data.content);
      setPermission(data.permission);
      setTitle(data.title);
    } catch {
      setError('Failed to load document');
      setTimeout(() => navigate('/documents'), 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const setupSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      socket.emit('join-document', id);
    });

    socket.on('document-joined', ({ content: docContent, activeUsers: users }) => {
      setContent(docContent);
      setActiveUsers(users);
    });

    socket.on('user-joined', ({ activeUsers: users }) => {
      setActiveUsers(users);
    });

    socket.on('user-left', ({ activeUsers: users }) => {
      setActiveUsers(users);
    });

    socket.on('content-updated', ({ content: newContent }) => {
      setContent(newContent);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    socketRef.current = socket;
  }, [id]);

  useEffect(() => {
    loadDocument();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-document', id);
        socketRef.current.disconnect();
      }
    };
  }, [id, loadDocument, setupSocket]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (socketRef.current && (permission === 'owner' || permission === 'editor')) {
      socketRef.current.emit('content-change', {
        documentId: id,
        content: newContent,
        cursorPosition: e.target.selectionStart
      });
    }
  };

  const handleTitleChange = async () => {
    if (permission !== 'owner') return;

    try {
      await documentService.updateTitle(id, title);
      setIsEditingTitle(false);
      setDocument({ ...document, title });
    } catch {
      setError('Failed to update title');
    }
  };

  const canEdit = permission === 'owner' || permission === 'editor';
  const isOwner = permission === 'owner';

  if (loading) {
    return <div className="loading">Loading document...</div>;
  }

  if (!document) {
    return <div className="error-container">{error || 'Document not found'}</div>;
  }

  return (
    <div className="document-editor-container">
      <header className="editor-header">
        <div className="editor-header-left">
          <button onClick={() => navigate('/documents')} className="btn-back">
            ← Back
          </button>
          {isEditingTitle && isOwner ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleChange()}
              className="title-input"
              autoFocus
            />
          ) : (
            <h1 onClick={() => isOwner && setIsEditingTitle(true)} className="document-title">
              {document.title}
              {isOwner && <span className="edit-hint">✏️</span>}
            </h1>
          )}
          <span className="permission-indicator">{permission.toUpperCase()}</span>
        </div>
        <div className="editor-header-right">
          <div className="active-users">
            <span className="users-icon">👥 {activeUsers.length}</span>
          </div>
          {isOwner && (
            <button onClick={() => setShowShareModal(true)} className="btn-share">
              Share
            </button>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="editor-content">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          disabled={!canEdit}
          placeholder={canEdit ? "Start typing..." : "You have view-only access"}
          className="editor-textarea"
        />
      </div>

      {showShareModal && (
        <ShareModal
          document={document}
          onClose={() => setShowShareModal(false)}
          onUpdate={loadDocument}
        />
      )}
    </div>
  );
};

export default DocumentEditor;
