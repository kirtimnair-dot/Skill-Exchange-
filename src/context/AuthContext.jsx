import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { userService } from '../firebase/firestoreService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email/password
  const signup = async (email, password, userData) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      // Prepare Firestore data with timestamp
      const firestoreData = {
        ...userData,
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      const saveResult = await userService.createOrUpdateUser(user.uid, firestoreData);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save user data');
      }

      return { success: true, user, userId: user.uid };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store token in localStorage
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      
      // Load user data from Firestore
      const userResult = await userService.getUser(user.uid);
      if (userResult.success) {
        setCurrentUser({ ...user, ...userResult.user });
      } else {
        setCurrentUser(user);
      }
      
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      // Check if currentUser exists
      if (!currentUser) {
        throw new Error("No user logged in");
      }
      
      const userId = currentUser.uid;
      const authUser = auth.currentUser;
      
      if (!authUser) {
        throw new Error("No authenticated user found");
      }
      
      // Update in Firebase Auth (if name is being updated)
      if (updates.name && updates.name !== authUser.displayName) {
        await updateProfile(authUser, { 
          displayName: updates.name 
        });
      }

      // Update in Firestore with timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      };

      const result = await userService.updateUser(userId, updatesWithTimestamp);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...updates,
        displayName: updates.name || (prev ? prev.displayName : '')
      }));

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error("Update profile error:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile'
      };
    }
  };

  // Load user data from Firestore
  const loadUserData = async (user) => {
    try {
      const userResult = await userService.getUser(user.uid);
      if (userResult.success && userResult.user) {
        return { ...user, ...userResult.user };
      }
      return user;
    } catch (error) {
      console.error("Error loading user data:", error);
      return user;
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userWithData = await loadUserData(user);
          setCurrentUser(userWithData);
        } catch (error) {
          console.error("Error setting user data:", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};