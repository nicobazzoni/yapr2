import React, { useEffect, useState, createContext } from 'react';
import { auth } from '../../firebase';  // make sure to import auth from your Firebase setup

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // or replace with a loading spinner
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};