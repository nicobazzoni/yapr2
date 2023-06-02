// ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';
import LikeButton from '../components/LikeButton';
import BioForm from '../components/BioForm';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState('');

  const { currentUser } = useContext(AuthContext);

  const fetchUser = async (userId) => {
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
    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').where('username', '==', username);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUser(userData);
          const uid = userSnapshot.docs[0].id;
          await Promise.all([fetchUploads(uid), fetchAudioFiles(uid)]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUploads = async (uid) => {
      try {
        const uploadsRef = firestore.collection('uploads').where('uid', '==', uid);
        const uploadsSnapshot = await uploadsRef.get();

        const userUploads = uploadsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUploads(userUploads);
      } catch (error) {
        console.error('Error fetching user uploads:', error);
      }
    };

    const fetchAudioFiles = async (uid) => {
      try {
        const audioFilesRef = firestore.collection('audioFiles').where('uid', '==', uid);
        const audioFilesSnapshot = await audioFilesRef.get();

        const userAudioFiles = audioFilesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAudioFiles(userAudioFiles);
      } catch (error) {
        console.error('Error fetching user audio files:', error);
      }
    };

    fetchUserData();
  }, [username]);

  const handleBioUpdate = async (newBio, newMood) => {
    try {
      const userRef = firestore.collection('users').doc(user.id);
      await userRef.update({ bio: newBio, mood: newMood });
      setBio(newBio);
      setMood(newMood);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const isProfileOwner = user && user.username === username;

  return (
    <div className="justify-items-center items-start mt-10">
      {user && (
        <div className="bg-white shadow-md rounded-md border w-full border-slate-100 p-6">
          <img src={uploads[0]?.photoUrl} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <p className="text-lg text-mono font-bold border rounded-full p-1 justify-center bg-stone-50 mb-1 tracking-widest text-blue-950">
            {uploads[0]?.username}
          </p>
          <p className="text-sm bg-slate-500 border rounded-full text-white">
            <span className="font-bold font-mono mt-2 text-sm"></span> {user.email}
          </p>

          <BioForm
            username={username}
            currentUser={currentUser}
            initialBio={bio}
            initialMood={mood}
            onUpdate={handleBioUpdate}
            isProfileOwner={isProfileOwner} // Pass the isProfileOwner prop
          />
        </div>
      )}

      {/* Rest of the code */}
    </div>
  );
};

export default ProfilePage;
