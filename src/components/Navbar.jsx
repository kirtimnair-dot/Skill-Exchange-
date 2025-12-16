import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, MessageCircle, User, LogOut, Menu, X, Calendar, Bell, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Set up real-time listener for teacher notifications
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('teacherId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Count unread bookings
        const unreadCount = snapshot.docs.filter(doc => {
          const data = doc.data();
          return !data.readStatus?.teacher;
        }).length;
        
        setNotificationCount(unreadCount);
      });
      
      return unsubscribe;
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SE
              </div>
              <span className="ml-3 text-xl font-bold text-cyan-800">SkillExchange</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center text-cyan-700 hover:text-cyan-600 transition">
              <Home className="w-5 h-5 mr-1" />
              Home
            </Link>
            <Link to="/skills" className="flex items-center text-cyan-700 hover:text-cyan-600 transition">
              <Search className="w-5 h-5 mr-1" />
              Browse Skills
            </Link>
            
            {currentUser ? (
              <>
                <Link to="/add-skill" className="flex items-center text-cyan-700 hover:text-cyan-600 transition">
                  <BookOpen className="w-5 h-5 mr-1" />
                  Teach a Skill
                </Link>
                <Link to="/bookings" className="flex items-center text-cyan-700 hover:text-cyan-600 transition relative">
                  <Calendar className="w-5 h-5 mr-1" />
                  My Bookings
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <Link to="/chat" className="flex items-center text-cyan-700 hover:text-cyan-600 transition">
                  <MessageCircle className="w-5 h-5 mr-1" />
                  Messages
                </Link>
                <Link to="/profile" className="flex items-center text-cyan-700 hover:text-cyan-600 transition">
                  <User className="w-5 h-5 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-cyan-700 hover:text-cyan-600 transition">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-cyan-700 hover:text-cyan-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-cyan-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>
            <Link to="/skills" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
              <Search className="w-4 h-4 inline mr-2" />
              Browse Skills
            </Link>
            
            {currentUser ? (
              <>
                <Link to="/add-skill" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Teach a Skill
                </Link>
                <Link to="/bookings" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50 relative" onClick={() => setIsMenuOpen(false)}>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  My Bookings
                  {notificationCount > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <Link to="/chat" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Messages
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-cyan-700 hover:bg-cyan-50" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 text-center" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}