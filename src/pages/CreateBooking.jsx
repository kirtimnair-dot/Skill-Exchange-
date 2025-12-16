import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, User, 
  ArrowLeft, CheckCircle, AlertCircle, BookOpen,
  CreditCard, Shield, HelpCircle, IndianRupee,
  Sparkles, DollarSign
} from 'lucide-react';
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function CreateBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        number: date.getDate()
      });
    }
    return days;
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    if (id) {
      fetchSkill();
    } else {
      setError('No skill selected');
      setLoading(false);
    }
  }, [id]);

  const fetchSkill = async () => {
    try {
      const docRef = doc(db, 'skills', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const skillData = { id: docSnap.id, ...docSnap.data() };
        setSkill(skillData);
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
        setSelectedTime('14:00');
      } else {
        setError('Skill not found');
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      setError('Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please log in to book a session');
      navigate('/login');
      return;
    }

    if (currentUser.uid === skill.userId) {
      setError('You cannot book your own skill');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (selectedDateTime < new Date()) {
      setError('Cannot book sessions in the past');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const booking = {
        // Skill Information
        skillId: id,
        skillTitle: skill.title,
        skillCategory: skill.category || 'general',
        skillDescription: skill.description || '',
        
        // Teacher Information
        teacherId: skill.userId,
        teacherName: skill.userName,
        teacherEmail: skill.userEmail || '',
        
        // Student Information
        studentId: currentUser.uid,
        studentName: currentUser.displayName || 'User',
        studentEmail: currentUser.email,
        
        // Session Details
        date: selectedDate,
        time: selectedTime,
        duration: skill.duration,
        location: skill.location,
        
        // Financial Information
        price: Number(skill.price) || 0,
        currency: 'INR',
        
        // Payment Information (Cash-based)
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentNotes: 'Pay in cash at the beginning of the session',
        
        // Booking Status
        status: 'pending',
        notes: notes.trim(),
        
        // Read Status for notifications
        readStatus: {
          teacher: false, // Teacher hasn't seen it yet
          student: true   // Student just created it
        },
        
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // Initial review data
        review: {
          rating: 0,
          comment: '',
          createdAt: null
        },
        
        // System fields
        userRole: 'student',
        
        // Tracking fields
        bookingNumber: `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        sessionType: 'one-on-one'
      };

      // Add booking to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), booking);
      console.log('✅ Booking created with ID:', docRef.id);
      
      // Update skill's booking count
      try {
        const skillRef = doc(db, 'skills', id);
        await updateDoc(skillRef, {
          totalBookings: (skill.totalBookings || 0) + 1,
          lastBooked: selectedDate,
          updatedAt: Timestamp.now()
        });
        console.log('✅ Skill booking count updated');
      } catch (updateError) {
        console.warn('⚠️ Could not update skill count:', updateError);
      }

      // Show success message
      setShowSuccess(true);
      
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      
      if (error.code === 'failed-precondition') {
        setError('Please create Firestore indexes. Go to Firebase Console → Firestore → Indexes');
      } else if (error.message.includes('index')) {
        setError('Database index not ready. Please wait a few minutes or create indexes manually.');
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const completeBooking = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/skills')}
            className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-2 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Skill
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Book "{skill.title}"</h1>
                <p className="text-cyan-100">Schedule your learning session with {skill.userName}</p>
              </div>
              <BookOpen className="w-12 h-12 text-white/80" />
            </div>
          </div>

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
                  <p className="text-gray-600 mb-4">
                    Your session with <span className="font-semibold">{skill.userName}</span> has been requested for {selectedDate} at {selectedTime}
                  </p>
                  <div className="bg-cyan-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-bold text-green-700">₹{skill.price}</span>
                    </div>
                    <p className="text-sm text-cyan-700">
                      💵 <span className="font-semibold">Cash Payment:</span> Pay ₹{skill.price} directly to {skill.userName} at the beginning of your session
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-amber-700">Teacher Notified!</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      The teacher has been notified about your booking request. You'll receive a confirmation once they accept.
                    </p>
                  </div>
                  <button
                    onClick={completeBooking}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg"
                  >
                    Go to My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                    <label className="block text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      Select Date
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {getNext7Days().map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedDate(day.date)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedDate === day.date
                              ? 'border-cyan-500 bg-white shadow-md'
                              : 'border-gray-200 bg-white hover:border-cyan-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="text-sm text-gray-600">{day.day}</div>
                          <div className="text-2xl font-bold text-gray-900">{day.number}</div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                    <label className="block text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-cyan-600" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedTime === time
                              ? 'border-cyan-500 bg-white text-cyan-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-cyan-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      placeholder="Any specific topics you want to focus on, learning goals, or questions for the teacher..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-lg transition-all"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Request Booking - ₹{skill.price}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column - Summary & Info */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="font-bold text-cyan-800 text-xl mb-4">Session Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{skill.title}</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900">₹{skill.price}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-cyan-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <div className="flex items-center gap-1 text-cyan-700">
                          <IndianRupee className="w-5 h-5" />
                          <span>₹{skill.price}</span>
                        </div>
                      </div>
                      <p className="text-sm text-cyan-600 mt-2">
                        💵 Pay in cash directly to {skill.userName} at the session
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    Payment Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <IndianRupee className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Cash Payment</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          Pay ₹{skill.price} directly to the teacher at the beginning of your session. 
                          This ensures security and builds trust within our community.
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>No online payment fees</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Pay only after session starts</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Builds local community trust</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-2">How it works:</h4>
                      <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                          <span>Book your session for free</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                          <span>Teacher confirms the booking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                          <span>Attend the session at scheduled time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                          <span>Pay ₹{skill.price} to teacher in cash at session start</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                          <span>Leave a review after completion</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-xl mb-4">Session Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-cyan-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Teacher</p>
                        <p className="font-medium">{skill.userName}</p>
                        {skill.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span 
                                key={i} 
                                className={`text-sm ${i < Math.floor(skill.rating) ? 'text-amber-500' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{skill.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-cyan-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{skill.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{skill.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Experience Level</p>
                        <p className="font-medium capitalize">{skill.experienceLevel || 'All Levels'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-600" />
                    Need Help?
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="border-b border-cyan-100 pb-3">
                      <p className="font-medium text-gray-900">Can I reschedule?</p>
                      <p className="text-sm text-gray-600 mt-1">Yes, you can reschedule up to 12 hours before your session.</p>
                    </div>
                    
                    <div className="border-b border-cyan-100 pb-3">
                      <p className="font-medium text-gray-900">What if I need to cancel?</p>
                      <p className="text-sm text-gray-600 mt-1">Contact the teacher directly to discuss cancellation.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Technical requirements?</p>
                      <p className="text-sm text-gray-600 mt-1">For online sessions: stable internet and webcam.</p>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Secure Community</p>
                      <p className="text-sm text-gray-600">Your booking is protected by our community guidelines</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}