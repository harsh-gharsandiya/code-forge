# Collaborative Document Editing Application

A Google Docs-like collaborative document editing application built with Node.js backend and React frontend. This application supports real-time collaboration, document sharing, and permission-based access control.

## Features

- **User Authentication**: Register and login functionality
- **Document Management**: Create, edit, delete documents
- **Real-time Collaboration**: Multiple users can edit documents simultaneously
- **Document Sharing**: Share documents with other users via email
- **Permission System**:
  - **Owner**: Full control - can edit, delete, rename document, and manage sharing
  - **Editor**: Can view and edit document content
  - **Viewer**: Can only view document content
- **Live Presence**: See who else is viewing/editing the document
- **Auto-save**: Changes are automatically saved in real-time

## Technology Stack

### Backend
- Node.js with Express
- MongoDB for data persistence
- Socket.IO for real-time communication
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React 18
- Vite for build tooling
- React Router for navigation
- Socket.IO client for real-time updates
- Axios for API calls

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd code-forge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative-docs
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

The default configuration should work:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux with systemd
sudo systemctl start mongod

# Or run directly
mongod
```

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### 1. Register/Login

- Navigate to `http://localhost:5173`
- Create a new account or login with existing credentials

### 2. Create a Document

- Click "New Document" button
- Enter a title for your document
- Start typing in the editor

### 3. Share a Document

- Open a document you own
- Click the "Share" button
- Enter the email address of the user you want to share with
- Select permission level (Viewer or Editor)
- Click "Share"

### 4. Real-time Collaboration

- When multiple users are viewing/editing the same document
- Changes are synchronized in real-time
- Active user count is shown in the header

### 5. Permission Levels

**Owner:**
- Edit document content
- Rename document
- Delete document
- Share with others
- Remove collaborators

**Editor:**
- View document
- Edit document content
- Cannot rename, delete, or share

**Viewer:**
- View document only
- Cannot edit, rename, delete, or share

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get all documents (owned + shared)
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id/content` - Update document content
- `PUT /api/documents/:id/title` - Update document title (owner only)
- `POST /api/documents/:id/share` - Share document (owner only)
- `DELETE /api/documents/:id/share/:email` - Remove collaborator (owner only)
- `DELETE /api/documents/:id` - Delete document (owner only)

## Socket.IO Events

### Client to Server
- `join-document` - Join a document room
- `leave-document` - Leave a document room
- `content-change` - Send content changes
- `cursor-position` - Send cursor position

### Server to Client
- `document-joined` - Confirmation of joining document
- `user-joined` - Another user joined
- `user-left` - Another user left
- `content-updated` - Document content changed
- `cursor-moved` - Another user's cursor moved
- `error` - Error message

## Project Structure

```
code-forge/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── permission.js
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── documents.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── ShareModal.jsx
│   │   │   └── ShareModal.css
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── DocumentEditor.jsx
│   │   │   └── *.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Permission checks on all document operations
- Input validation on all endpoints
- CORS configured for specific origin

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on the specified port

### Socket.IO Connection Error
- Verify backend server is running
- Check CORS configuration
- Ensure token is valid

### Frontend API Errors
- Check VITE_API_URL in frontend .env
- Verify backend server is running on correct port
- Check browser console for detailed errors

## Future Enhancements

- Rich text editing with formatting
- Document versioning/history
- Comments and suggestions
- Export to PDF/Word
- Folder organization
- Search functionality
- User profile management
- Email notifications for shares

## License

MIT

## Contributors

Built as a collaborative document editing platform demonstration.
