import React, { useEffect, useState, createContext } from 'react';
import { auth } from '../../firebase';  // make sure to import auth from your Firebase setup

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is logged in
        const { displayName, photoURL, uid } = user;
        setCurrentUser({ uid, username: displayName, userPhoto: photoURL });
      } else {
        // User is logged out
        setCurrentUser(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
