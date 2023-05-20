import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, firestore } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [user, setUser] = useState(null);

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 justify-items-center px-4 py-8">
      {user && (
        <div>
          <img className="h-48 w-48 rounded-full mb-4" src={user.photoURL} alt={user.username} />
          <p className="text-lg font-bold">{user.username}</p>
          <p className="text-lg">
            <span className="font-bold">Email:</span> {currentUser.email}
          </p>
        </div>
      )}
      {!user && (
        <p className="text-lg">No user data available. Please sign in to view your profile.</p>
      )}
      <Link
        to="/edit-profile"
        className="text-blue-500 underline mt-4 hover:text-blue-700 transition-colors duration-300"
      >
        Edit Profile
      </Link>
    </div>
  );
};

export default ProfilePage;
