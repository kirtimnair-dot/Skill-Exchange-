// src/context/AuthContext.jsx
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
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- SIGN UP ----------------
  const signup = async (email, password, userData) => {
    try {
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (userData?.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      await userService.createOrUpdateUser(user.uid, {
        ...userData,
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ---------------- LOGIN ----------------
  const login = async (email, password) => {
    try {
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return { success: true, user: userCredential.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ---------------- UPDATE PROFILE ----------------
  const updateUserProfile = async (updates) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      if (updates.name) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }

      await userService.updateUser(auth.currentUser.uid, {
        ...updates,
        updatedAt: new Date()
      });

      setCurrentUser(prev => ({
        ...prev,
        ...updates,
        displayName: updates.name || prev.displayName
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ---------------- AUTH STATE LISTENER ----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await userService.getUser(user.uid);
        setCurrentUser(result.success ? { ...user, ...result.user } : user);
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
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
