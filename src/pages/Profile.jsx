import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Edit2, Save, X, Camera, 
  BookOpen, Calendar, MessageSquare, Star, Upload 
} from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState(
    currentUser?.photoURL || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}&background=0ea5e9&color=fff&size=200`
  );
  
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    phone: '',
    location: '',
    bio: '',
    skills: ['Guitar', 'Cooking', 'Spanish'],
    requestedSkills: ['Web Development', 'Photography']
  });

  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      // In real app, fetch from Firestore
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        phone: '+1 (555) 123-4567', // Example data
        location: 'San Francisco, CA',
        bio: 'Passionate about sharing knowledge and learning new skills!'
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updates = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      };
      
      const result = await updateUserProfile(updates);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setSuccessMessage('Error updating profile: ' + result.error);
      }
    } catch (error) {
      setSuccessMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSuccessMessage('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setSuccessMessage('Profile picture updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const addSkill = () => {
    const newSkill = prompt('Enter a new skill you can teach:');
    if (newSkill && newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addRequestedSkill = () => {
    const newSkill = prompt('Enter a skill you want to learn:');
    if (newSkill && newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requestedSkills: [...prev.requestedSkills, newSkill.trim()]
      }));
    }
  };

  const removeRequestedSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requestedSkills: prev.requestedSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4">Please sign in to view your profile</h2>
          <a href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-2">
            Sign In →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Message */}
        {successMessage && (
          <div className={`mb-6 p-4 rounded-xl ${successMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white/80 shadow-xl"
                />
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-cyan-700 hover:bg-cyan-800 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
                <p className="text-cyan-100">{formData.bio}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    <span>4.8 Rating</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>15 Sessions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditing(!editing)}
                className="bg-white text-cyan-600 font-semibold px-6 py-3 rounded-xl hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                {editing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-8">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={currentUser.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Skills I Can Teach */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          <BookOpen className="w-4 h-4 inline mr-2" />
                          Skills I Can Teach
                        </label>
                        <button
                          type="button"
                          onClick={addSkill}
                          className="text-sm bg-cyan-100 text-cyan-700 hover:bg-cyan-200 px-3 py-1 rounded-lg"
                        >
                          + Add Skill
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-3 py-2 rounded-lg">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-cyan-500 hover:text-cyan-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills I Want to Learn */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Skills I Want to Learn
                        </label>
                        <button
                          type="button"
                          onClick={addRequestedSkill}
                          className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg"
                        >
                          + Add Skill
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.requestedSkills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeRequestedSkill(skill)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-5 h-5 text-cyan-600" />
                          <h3 className="font-bold text-cyan-800">Full Name</h3>
                        </div>
                        <p className="text-lg font-semibold">{formData.name}</p>
                      </div>

                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-5 h-5 text-cyan-600" />
                          <h3 className="font-bold text-cyan-800">Email</h3>
                        </div>
                        <p className="text-lg font-semibold">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Phone className="w-5 h-5 text-cyan-600" />
                          <h3 className="font-bold text-cyan-800">Phone</h3>
                        </div>
                        <p className="text-lg font-semibold">{formData.phone}</p>
                      </div>

                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-cyan-600" />
                          <h3 className="font-bold text-cyan-800">Location</h3>
                        </div>
                        <p className="text-lg font-semibold">{formData.location}</p>
                      </div>
                    </div>

                    <div className="bg-cyan-50 p-6 rounded-xl">
                      <h3 className="font-bold text-cyan-800 mb-3">Bio</h3>
                      <p className="text-gray-700">{formData.bio}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-cyan-800">Skills I Can Teach</h3>
                          <BookOpen className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="bg-white text-cyan-700 px-3 py-1 rounded-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-blue-800">Skills I Want to Learn</h3>
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.requestedSkills.map((skill, index) => (
                            <span key={index} className="bg-white text-blue-700 px-3 py-1 rounded-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Profile Picture Upload & Stats */}
              <div className="space-y-6">
                {/* Profile Picture Upload Card */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-6">
                  <h3 className="font-bold text-cyan-800 mb-4 text-lg">Update Profile Picture</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
                        />
                        <button
                          onClick={triggerFileInput}
                          className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-full shadow-md transition-all hover:scale-110"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Click the camera icon to upload a new photo
                      </p>
                    </div>
                    
                    <button 
                      onClick={triggerFileInput}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl p-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Profile Picture
                    </button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Max file size: 5MB. Supported formats: JPG, PNG, GIF
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white border border-cyan-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-cyan-800 mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Sessions</span>
                      <span className="font-bold text-cyan-700">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg. Rating</span>
                      <span className="font-bold text-amber-500">4.8 ★</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Skills Taught</span>
                      <span className="font-bold text-cyan-700">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-bold text-cyan-700">2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                Profile last updated: {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}