import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Skills from './pages/Skills';
import SkillDetails from './pages/SkillDetails';
import CreateBooking from './pages/CreateBooking';
import AddSkill from './pages/AddSkill';
import Profile from './pages/Profile';
import Chat from './components/Chat';
import Signup from './pages/Signup';
import Login from './pages/Login';
import EditSkill from './pages/EditSkill';

import Guidelines from './pages/Guidelines';
import Terms from './pages/Terms';
import Safety from './pages/Safety';
import Privacy from './pages/Privacy';
import HowItWorks from './pages/HowItWorks';

import MyBookings from './pages/MyBookings';

/* -----------------------------
   Protected Route
-------------------------------- */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;

  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-white">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/skill/:id" element={<SkillDetails />} />

            {/* Info */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/guidelines" element={<Guidelines />} />

            {/* Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-skill"
              element={
                <ProtectedRoute>
                  <AddSkill />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <CreateBooking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-skill/:id"
              element={
                <ProtectedRoute>
                  <EditSkill />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-red-600">
                    404 – Page Not Found
                  </h1>
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
