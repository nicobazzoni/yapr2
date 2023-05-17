import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebase';
import Recorder from './Recorder';
import Feed from './Feed';


const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('User Data:', userData); // Log user data to the console
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate('/signin');
    });
  };

  return (
    <div>
      {user ? (
        <div>
          <p className="font-mono font-bold">{user.username}</p>
          {user.photoURL && <img className="h-20 w-20" src={user.photoURL} alt={user.username} />}
          
             <div>
            <Recorder />
            <Feed />
           </div>
         
        </div>
        
      ) : (
        <div>
            <h1>hello</h1>
          </div>
      )}
    </div>
  );
};

export default Home;
