import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting signup with:', { 
        email: formData.email,
        name: formData.name 
      });
      
      // Call the signup function from AuthContext
      const userCredential = await signup(
        formData.email, 
        formData.password, 
        {
          displayName: formData.name,
          email: formData.email,
          phoneNumber: formData.phone
        }
      );

      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        console.log('Verification email sent!');
      }

      setSuccess(true);
      
      // Short delay before navigation
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Signup error details:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password signup is not enabled';
      } else {
        errorMessage = error.message || 'Failed to create account';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              SE
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">SkillExchange</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-8">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join our community today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              ✅ Account created successfully! Check your email for verification. Redirecting...
            </div>
          )}

          {error && !success && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  placeholder="John Doe"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  placeholder="you@example.com"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  placeholder="+1 (555) 123-4567"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  placeholder="••••••••"
                  required
                  disabled={loading || success}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  placeholder="••••••••"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-gray-600">
              <p>By signing up, you agree to our <Link to="/terms" className="text-cyan-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</Link>.</p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </span>
              ) : success ? (
                'Account Created!'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-600 font-semibold hover:text-cyan-700">
                Sign in here
              </Link>
            </p>
            <Link to="/" className="inline-block mt-4 text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
