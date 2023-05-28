import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Chat from './Chat';

import { firestore, auth} from '../../firebase';

const Room = () => {
  const { currentUser } = useContext(AuthContext);
  const [audioFiles, setAudioFiles] = useState([]);
  const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

  // Update with your path

   // Add this state

  // In fetchUserData()
  const fetchUserData = async (uid) => {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userSnapshot = await userRef.get();
  
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        setUser({ id: userSnapshot.id, ...userData });
        setLoading(false); // Set loading to false here
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  // In the useEffect()
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
        setLoading(false); // Set loading to false here too
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Fetch audio files and update the audioFiles state
  useEffect(() => {
    const unsubscribe = firestore
      .collection('audioFiles')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const files = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAudioFiles(files);
      });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Chat audioFiles={audioFiles} currentUser={currentUser} />
     
    </div>
  );
};

export default Room;
