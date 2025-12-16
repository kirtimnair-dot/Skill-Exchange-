// src/components/StudentBookings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, 
  CheckCircle, XCircle, MessageSquare,
  Star, User, Search, Eye,
  ChevronDown, ChevronUp,
  IndianRupee, CreditCard, BookOpen
} from 'lucide-react';
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { startChat } from '../services/chatService';

export default function StudentBookings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      fetchBookings();
      setupRealtimeListener();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let sessionDate;
        try {
          sessionDate = parseISO(`${data.date}T${data.time}`);
        } catch {
          sessionDate = new Date();
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          sessionDate: sessionDate,
          isPast: isPast(sessionDate),
          isFuture: isFuture(sessionDate),
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || 'pending'
        };
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching student bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!currentUser) return;
    
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('studentId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let sessionDate;
        try {
          sessionDate = parseISO(`${data.date}T${data.time}`);
        } catch {
          sessionDate = new Date();
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          sessionDate: sessionDate,
          isPast: isPast(sessionDate),
          isFuture: isFuture(sessionDate),
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || 'pending'
        };
      });

      setBookings(bookingsData);
    });
    
    return unsubscribe;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        paymentStatus: 'cancelled',
        cancellationReason: 'Cancelled by student',
        updatedAt: new Date()
      });
      
      alert('Booking cancelled successfully!');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async (teacherId, teacherName, skillTitle = '') => {
    try {
      const result = await startChat(
        currentUser.uid,
        currentUser.displayName || 'Student',
        teacherId,
        teacherName
      );
      
      if (result.success) {
        navigate(`/chat?conversation=${result.conversationId}&skill=${encodeURIComponent(skillTitle)}`);
      } else {
        alert('Failed to start chat: ' + result.error);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  const submitReview = async () => {
    if (!selectedReviewBooking || !reviewRating) return;
    
    try {
      const bookingRef = doc(db, 'bookings', selectedReviewBooking.id);
      
      await updateDoc(bookingRef, {
        review: {
          rating: reviewRating,
          comment: reviewComment.trim(),
          createdAt: new Date()
        },
        updatedAt: new Date()
      });
      
      // Update teacher's rating
      const skillsQuery = query(
        collection(db, 'skills'),
        where('userId', '==', selectedReviewBooking.teacherId)
      );
      const skillsSnapshot = await getDocs(skillsQuery);
      
      const updatePromises = skillsSnapshot.docs.map(skillDoc => {
        const skillRef = doc(db, 'skills', skillDoc.id);
        return updateDoc(skillRef, {
          rating: reviewRating,
          updatedAt: new Date()
        });
      });
      
      await Promise.all(updatePromises);
      
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedReviewBooking(null);
      setReviewRating(0);
      setReviewComment('');
      fetchBookings();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'upcoming') return booking.status === 'confirmed' && booking.isFuture;
    if (selectedTab === 'pending') return booking.status === 'pending';
    if (selectedTab === 'completed') return booking.status === 'completed';
    if (selectedTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  }).filter(booking => 
    booking.skillTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingCount = bookings.filter(b => b.status === 'confirmed' && b.isFuture).length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    return styles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-800 mb-2">My Learning Sessions</h1>
              <p className="text-cyan-600">Manage your booked sessions and track your progress</p>
            </div>
            <a
              href="/skills"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-shadow"
            >
              <BookOpen className="w-5 h-5" />
              Book New Session
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'upcoming', label: 'Upcoming', icon: Calendar, count: upcomingCount },
                { key: 'pending', label: 'Pending', icon: Clock, count: pendingCount },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'cancelled', label: 'Cancelled', icon: XCircle },
                { key: 'all', label: 'All Bookings', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    selectedTab === tab.key 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill, teacher, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTab === 'upcoming' 
                  ? 'No upcoming sessions' 
                  : selectedTab === 'pending'
                  ? 'No pending requests'
                  : `No ${selectedTab} bookings`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedTab === 'upcoming' 
                  ? 'When you book sessions, they will appear here.' 
                  : `You don't have any ${selectedTab} bookings.`}
              </p>
              <a
                href="/skills"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
                Browse Skills to Book
              </a>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const statusStyle = getStatusBadge(booking.status);
              
              return (
                <div 
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Side */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${statusStyle.bg}`}>
                            {booking.status === 'pending' ? (
                              <Clock className={`w-6 h-6 ${statusStyle.text}`} />
                            ) : booking.status === 'confirmed' ? (
                              <CheckCircle className={`w-6 h-6 ${statusStyle.text}`} />
                            ) : booking.status === 'completed' ? (
                              <CheckCircle className={`w-6 h-6 ${statusStyle.text}`} />
                            ) : (
                              <XCircle className={`w-6 h-6 ${statusStyle.text}`} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{booking.skillTitle}</h3>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </div>
                              
                              <div className="flex items-center gap-1 text-gray-600">
                                <User className="w-4 h-4" />
                                <span>Teacher: {booking.teacherName || 'Teacher'}</span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(booking.date)} at {booking.time}</span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{booking.duration}</span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                            
                            {/* Payment Status */}
                            <div className="flex items-center gap-2 mt-3">
                              <div className={`px-2 py-1 rounded text-xs ${
                                booking.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                                booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Payment: {booking.paymentStatus}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-green-700">₹{booking.price}</span>
                              </div>
                            </div>
                            
                            {/* Your Notes */}
                            {booking.notes && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Your notes:</span> {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={actionLoading}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Request
                          </button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <div className="space-y-2">
                            <div className="bg-cyan-50 p-3 rounded-lg">
                              <p className="text-sm text-cyan-700 text-center">
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                Pay ₹{booking.price} in cash
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={actionLoading}
                              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel Session
                            </button>
                          </div>
                        )}
                        
                        {booking.status === 'completed' && !booking.review?.rating && (
                          <button
                            onClick={() => {
                              setSelectedReviewBooking(booking);
                              setShowReviewModal(true);
                            }}
                            className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Leave Review
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleStartChat(booking.teacherId, booking.teacherName, booking.skillTitle)}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message Teacher
                        </button>
                        
                        <button
                          onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                          className="w-full flex items-center justify-center gap-2 text-cyan-600 hover:text-cyan-700"
                        >
                          {expandedBooking === booking.id ? 'Show Less' : 'Show More'}
                          {expandedBooking === booking.id ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedBooking === booking.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">Session Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-medium">{booking.bookingNumber || booking.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">{format(booking.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium">{format(booking.updatedAt, 'MMM dd, yyyy HH:mm')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Session Type:</span>
                                <span className="font-medium">{booking.sessionType || 'One-on-One'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">Teacher Information</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium">{booking.teacherName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{booking.teacherEmail}</span>
                              </div>
                            </div>
                            
                            {/* Your Review */}
                            {booking.review?.rating > 0 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">Your Review</h5>
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i}
                                      className={`w-4 h-4 ${i < booking.review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                {booking.review.comment && (
                                  <p className="text-sm text-gray-700">"{booking.review.comment}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Payment Instructions */}
                        <div className="mt-6 bg-cyan-50 p-4 rounded-lg">
                          <h5 className="font-bold text-cyan-800 mb-2">Payment Instructions</h5>
                          <p className="text-sm text-cyan-700">
                            💵 <span className="font-medium">Cash Payment:</span> Please pay ₹{booking.price} directly to {booking.teacherName} at the beginning of your session.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReviewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How was your session with {selectedReviewBooking.teacherName}?
                </label>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= reviewRating 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows="4"
                  placeholder="Share your experience with this teacher..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitReview}
                  disabled={!reviewRating}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg disabled:opacity-50 hover:shadow-md"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedReviewBooking(null);
                    setReviewRating(0);
                    setReviewComment('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
