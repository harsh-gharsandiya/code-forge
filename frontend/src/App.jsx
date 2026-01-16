import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DocumentList from './pages/DocumentList';
import DocumentEditor from './pages/DocumentEditor';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <DocumentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <DocumentEditor />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/documents" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
