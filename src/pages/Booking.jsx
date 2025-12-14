import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, DollarSign, 
  CheckCircle, XCircle, Clock as ClockIcon,
  MessageSquare, Star, User, AlertCircle,
  Filter, Search, Eye
} from 'lucide-react';
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, orderBy, Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { format } from 'date-fns';

export default function Booking() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch bookings where user is teacher
      const teacherQuery = query(
        collection(db, 'bookings'),
        where('teacherId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      // Fetch bookings where user is student
      const studentQuery = query(
        collection(db, 'bookings'),
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const [teacherSnapshot, studentSnapshot] = await Promise.all([
        getDocs(teacherQuery),
        getDocs(studentQuery)
      ]);

      const allBookings = [
        ...teacherSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'teacher' })),
        ...studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'student' }))
      ];

      // Sort by date and convert timestamps
      const bookingsData = allBookings.map(booking => {
        const data = booking;
        return {
          id: data.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          role: data.role
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'all') return true;
    return booking.status === selectedTab;
  }).filter(booking => 
    booking.skillTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.role === 'teacher' ? booking.studentId : booking.teacherId)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookingAction = async (bookingId, action) => {
    setActionLoading(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const updates = {
        updatedAt: Timestamp.now()
      };

      switch (action) {
        case 'confirm':
          updates.status = 'confirmed';
          updates.paymentStatus = 'confirmed';
          break;
        case 'complete':
          updates.status = 'completed';
          updates.paymentStatus = 'paid';
          break;
        case 'cancel':
          updates.status = 'cancelled';
          updates.paymentStatus = 'refunded';
          break;
        default:
          break;
      }

      await updateDoc(bookingRef, updates);
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates, updatedAt: new Date() }
          : booking
      ));
      
      alert(`Booking ${action}ed successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking: ${error.message}`);
    } finally {
      setActionLoading(false);
      setSelectedBooking(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      refunded: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-800 mb-2">My Bookings</h1>
          <p className="text-cyan-600">Manage your teaching sessions and appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'cyan' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: ClockIcon, color: 'yellow' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'blue' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'green' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All Bookings', icon: Eye },
                { key: 'pending', label: 'Pending', icon: ClockIcon },
                { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'cancelled', label: 'Cancelled', icon: XCircle }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    selectedTab === tab.key 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {selectedTab === 'all' 
                  ? 'You don\'t have any bookings yet.' 
                  : `You don\'t have any ${selectedTab} bookings.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill & User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{booking.skillTitle}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <User className="w-4 h-4 inline mr-1" />
                            {booking.role === 'teacher' 
                              ? `Student: ${booking.studentId}` 
                              : `Teacher: ${booking.teacherId}`}
                          </div>
                          <div className="text-xs text-cyan-600 mt-1">
                            You are: {booking.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{booking.time} ({booking.duration})</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>${booking.price}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                            {booking.status === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
                            {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {booking.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {booking.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentBadge(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          {booking.role === 'teacher' && booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                disabled={actionLoading}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Confirm
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                                disabled={actionLoading}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Decline
                              </button>
                            </>
                          )}
                          
                          {booking.role === 'teacher' && booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'complete')}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Complete
                            </button>
                          )}
                          
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Skill Information</h4>
                  <p className="text-lg font-semibold">{selectedBooking.skillTitle}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Date & Time</h4>
                    <p>{formatDate(selectedBooking.date)} at {selectedBooking.time}</p>
                    <p className="text-sm text-gray-500">Duration: {selectedBooking.duration}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Location</h4>
                    <p>{selectedBooking.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Price</h4>
                    <p className="text-xl font-bold text-green-600">${selectedBooking.price}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Your Role</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                      {selectedBooking.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadge(selectedBooking.paymentStatus)}`}>
                      Payment: {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Timestamps</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Created: {formatDateTime(selectedBooking.createdAt)}</p>
                    <p>Updated: {formatDateTime(selectedBooking.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}