import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  CalendarDays, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle, 
  Clock4,
  XCircle,
  DollarSign,
  MapPin,
  MessageSquare,
  Star,
  CreditCard,
  Calendar,
  MapPinOff,
  Eye,
  Settings,
  Check,
  X
} from 'lucide-react';

export default function MyBookings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [studentBookings, setStudentBookings] = useState([]);
  const [teacherBookings, setTeacherBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('student');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching bookings for user:', currentUser.uid);
        
        // Student bookings
        const studentQuery = query(
          collection(db, 'bookings'),
          where('studentId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        // Teacher bookings
        const teacherQuery = query(
          collection(db, 'bookings'),
          where('teacherId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const [studentSnap, teacherSnap] = await Promise.all([
          getDocs(studentQuery),
          getDocs(teacherQuery)
        ]);

        console.log('Student bookings found:', studentSnap.docs.length);
        console.log('Teacher bookings found:', teacherSnap.docs.length);

        // Process student bookings
        const studentBookingsData = studentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process teacher bookings
        const teacherBookingsData = teacherSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStudentBookings(studentBookingsData);
        setTeacherBookings(teacherBookingsData);
        
      } catch (err) {
        console.error('Failed to load bookings:', err);
        console.error('Error details:', err.code, err.message);
        
        // Fallback: Try without orderBy if index is missing
        if (err.code === 'failed-precondition') {
          console.log('Trying without orderBy...');
          try {
            const studentQuery = query(
              collection(db, 'bookings'),
              where('studentId', '==', currentUser.uid)
            );
            
            const teacherQuery = query(
              collection(db, 'bookings'),
              where('teacherId', '==', currentUser.uid)
            );
            
            const [studentSnap, teacherSnap] = await Promise.all([
              getDocs(studentQuery),
              getDocs(teacherQuery)
            ]);
            
            setStudentBookings(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setTeacherBookings(teacherSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Message functionality
  const handleMessage = async (booking, isTeacher) => {
    if (!currentUser) {
      alert('Please login to send messages');
      navigate('/login');
      return;
    }

    try {
      // Determine other user
      const otherUserId = isTeacher ? booking.studentId : booking.teacherId;
      const otherUserName = isTeacher ? booking.studentName : booking.teacherName;
      
      // Navigate to chat with this user
      navigate(`/chat?userId=${otherUserId}&name=${encodeURIComponent(otherUserName)}&bookingId=${booking.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  // Manage booking functionality (for teachers)
  const handleManageBooking = async (bookingId, action) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingToUpdate = teacherBookings.find(b => b.id === bookingId);
      
      if (!bookingToUpdate) {
        throw new Error('Booking not found');
      }
      
      const updates = {
        updatedAt: Timestamp.now()
      };

      switch (action) {
        case 'confirm':
          updates.status = 'confirmed';
          updates.paymentStatus = 'pending';
          break;
          
        case 'complete':
          updates.status = 'completed';
          updates.paymentStatus = 'paid';
          break;
          
        case 'cancel':
          updates.status = 'cancelled';
          updates.paymentStatus = 'cancelled';
          updates.cancellationReason = 'Cancelled by teacher';
          break;
          
        case 'mark-paid':
          updates.paymentStatus = 'paid';
          updates.paymentNotes = 'Payment received in cash';
          break;
          
        default:
          break;
      }

      await updateDoc(bookingRef, updates);
      
      // Update local state
      setTeacherBookings(prev => 
        prev.map(b => 
          b.id === bookingId 
            ? { ...b, ...updates, updatedAt: new Date() } 
            : b
        )
      );
      
      // Show success message
      const actionMessages = {
        confirm: '✅ Booking confirmed!',
        complete: '✅ Session marked as completed!',
        cancel: '❌ Booking cancelled.',
        'mark-paid': '💰 Payment marked as received!'
      };
      
      alert(actionMessages[action] || 'Action completed');
      
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // View details functionality
  const handleViewDetails = (booking) => {
    navigate(`/booking/${booking.id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: <Clock4 className="w-4 h-4" /> },
      confirmed: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-4 h-4" /> },
      completed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Payment Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Payment Failed' }
    };

    const config = statusConfig[paymentStatus?.toLowerCase()] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <CreditCard className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not set';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatSessionDate = (dateString, timeString) => {
    if (!dateString || !timeString) return 'Date not set';
    try {
      const [year, month, day] = dateString.split('-');
      const [hours, minutes] = timeString.split(':');
      const date = new Date(year, month - 1, day, hours, minutes);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return `${dateString} at ${timeString}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full mb-6" />
          <h3 className="text-xl font-semibold text-cyan-800 mb-2">Loading your bookings</h3>
          <p className="text-cyan-600">Fetching all your learning sessions...</p>
        </div>
      </div>
    );
  }

  const totalBookings = studentBookings.length + teacherBookings.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-cyan-100 text-lg">Manage all your learning sessions in one place</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{totalBookings}</div>
              <div className="text-cyan-100">Total Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan-700">{studentBookings.length}</div>
                <div className="text-gray-600">As Student</div>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <BookOpen className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan-700">{teacherBookings.length}</div>
                <div className="text-gray-600">As Teacher</div>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <User className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan-700">
                  {[...studentBookings, ...teacherBookings].filter(b => b.status === 'confirmed').length}
                </div>
                <div className="text-gray-600">Confirmed</div>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-cyan-200">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === 'student'
                  ? 'bg-white border-t border-x border-cyan-200 text-cyan-700'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Student Bookings ({studentBookings.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === 'teacher'
                  ? 'bg-white border-t border-x border-cyan-200 text-cyan-700'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Teacher Bookings ({teacherBookings.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden">
          {activeTab === 'student' ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-cyan-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Your Learning Sessions
              </h2>
              
              {studentBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-cyan-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-6">Start your learning journey by booking a skill session!</p>
                  <button
                    onClick={() => navigate('/skills')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <BookOpen className="w-5 h-5" />
                    Browse Skills
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {studentBookings.map((booking) => (
                    <div key={booking.id} className="group border border-cyan-100 rounded-xl p-6 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-cyan-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-cyan-700 transition-colors">
                            {booking.skillTitle || 'Skill Session'}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentBadge(booking.paymentStatus)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Booking #</div>
                          <div className="font-medium text-cyan-700 text-sm">{booking.bookingNumber}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <User className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Teacher</div>
                            <div className="font-medium">{booking.teacherName || 'Unknown Teacher'}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Session Date & Time</div>
                            <div className="font-medium">{formatSessionDate(booking.date, booking.time)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Clock className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Duration • Price</div>
                            <div className="font-medium">{booking.duration || 60} minutes • ₹{booking.price || 0}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            {booking.location ? (
                              <MapPin className="w-5 h-5 text-cyan-600" />
                            ) : (
                              <MapPinOff className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Location</div>
                            <div className="font-medium">{booking.location || 'Online Session'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMessage(booking, false)}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message Teacher
                        </button>
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 border border-cyan-300 text-cyan-600 py-2 rounded-lg font-medium hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-cyan-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Your Teaching Sessions
              </h2>
              
              {teacherBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No teaching sessions yet</h3>
                  <p className="text-gray-500 mb-6">Students will see your bookings here once they book your skills</p>
                  <button
                    onClick={() => navigate('/add-skill')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Star className="w-5 h-5" />
                    Add More Skills
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teacherBookings.map((booking) => {
                    const isLoading = actionLoading[booking.id];
                    
                    return (
                      <div key={booking.id} className="group border border-cyan-100 rounded-xl p-6 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {booking.skillTitle || 'Teaching Session'}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(booking.status)}
                              {getPaymentBadge(booking.paymentStatus)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Booking #</div>
                            <div className="font-medium text-blue-700 text-sm">{booking.bookingNumber}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Student</div>
                              <div className="font-medium">{booking.studentName || 'Unknown Student'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Session Date & Time</div>
                              <div className="font-medium">{formatSessionDate(booking.date, booking.time)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Duration • Earnings</div>
                              <div className="font-medium">{booking.duration || 60} minutes • ₹{booking.price || 0}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {booking.location ? (
                                <MapPin className="w-5 h-5 text-blue-600" />
                              ) : (
                                <MapPinOff className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Location</div>
                              <div className="font-medium">{booking.location || 'Online Session'}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons for Teachers */}
                        <div className="space-y-3">
                          {/* Status-based actions */}
                          {booking.status === 'pending' && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleManageBooking(booking.id, 'confirm')}
                                disabled={isLoading}
                                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Accept Booking
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleManageBooking(booking.id, 'cancel')}
                                disabled={isLoading}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Decline
                              </button>
                            </div>
                          )}
                          
                          {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                            <button
                              onClick={() => handleManageBooking(booking.id, 'mark-paid')}
                              disabled={isLoading}
                              className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4" />
                                  Mark as Paid (₹{booking.price || 0})
                                </>
                              )}
                            </button>
                          )}
                          
                          {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleManageBooking(booking.id, 'complete')}
                              disabled={isLoading}
                              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Completed
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Always show chat and details buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleMessage(booking, true)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message Student
                            </button>
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="flex-1 border border-blue-300 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Settings className="w-4 h-4" />
                              Manage Booking
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-cyan-100">
            <div className="text-sm text-gray-500">Pending Payment</div>
            <div className="text-2xl font-bold text-amber-600">
              {[...studentBookings, ...teacherBookings].filter(b => b.paymentStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-cyan-100">
            <div className="text-sm text-gray-500">Confirmed</div>
            <div className="text-2xl font-bold text-emerald-600">
              {[...studentBookings, ...teacherBookings].filter(b => b.status === 'confirmed').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-cyan-100">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {[...studentBookings, ...teacherBookings].filter(b => b.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-cyan-100">
            <div className="text-sm text-gray-500">Total Earning</div>
            <div className="text-2xl font-bold text-cyan-700">
              ₹{teacherBookings
                .filter(b => b.paymentStatus === 'paid' && b.price)
                .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0)
                .toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}