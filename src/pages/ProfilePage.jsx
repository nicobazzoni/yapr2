import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { firestore, storage } from '../../firebase';
import LikeButton from '../components/LikeButton';
import { AuthContext } from '../contexts/AuthContext';
import FollowerList from '../components/FollowerList';
import axios from 'axios';
import * as Tone from 'tone';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(null);
  const [synth] = useState(() => new Tone.Synth().toDestination());

  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    const part = new Tone.Part((time, note) => {
      synth.triggerAttackRelease(note, '8n', time);
    }, []);

    const playRandomNote = () => {
      const frequency = Tone.Frequency(Math.random() * 500 + 200).toNote();
      part.add('+1', frequency);
    };

    const intervalId = setInterval(playRandomNote, 1000);

    return () => {
      clearInterval(intervalId);
      part.dispose();
      synth.dispose();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').where('username', '==', username);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUser(userData);
          console.log(userData);
          const uid = userSnapshot.docs[0].id;
          await Promise.all([fetchUploads(uid), fetchAudioFiles(uid)]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

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
    fetchUser(currentUser.uid, username);
  }, [username, currentUser]);

  useEffect(() => {
    // Create a new Tone.js synth
    const synth = new Tone.Synth().toDestination();

    // Function to play a note
    const playNote = (frequency) => {
      synth.triggerAttackRelease(frequency, '8n');
    };

    // Play a random note every 1 second
    const playRandomNote = () => {
      const frequency = Tone.Frequency(Math.random() * 880 + 220, 'midi').toFrequency();
      playNote(frequency);
    };

    const intervalId = setInterval(playRandomNote, 1000);

    return () => {
      // Clean up the interval when the component unmounts
      clearInterval(intervalId);
    };
  }, []);

  
  
  
  
  
  

  return (
    <div className="justify-items-center items-start mt-10">
      {user && (
        <div className="bg-white shadow-md rounded-md border w-full border-slate-100 p-6">
          <img src={user.photoURL} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <p className="text-lg text-mono font-bold border rounded-full p-1 justify-center bg-stone-50 mb-1 tracking-widest text-blue-950">
            {user.username}
          </p>
          <p className="text-sm bg-slate-500 border rounded-full text-white">
            <span className="font-bold font-mono mt-2 text-sm"></span> {user.email}
          </p>
          { currentUser.uid === user.uid ? (
            
            <>
              <input type="file" onChange={handleProfilePhotoChange} />
              <button onClick={uploadProfilePhoto}>Upload Profile Photo</button>
              {/* Add form for bio update */}
            </>
        ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 justify-items-center items-start mt-4">
        {uploads.map((upload) => (
          <div key={upload.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
            <div className="h-36 w-full">
              <img src={upload.imageUrl} alt={upload.username} className="w-full h-full object-cover rounded" />
            </div>
            <p className="text-gray-600 bg-white text-center">{upload.message}</p>
            <p className="text-xs mt-1 bg-black text-white text-center">{upload.tag}</p>
            
            
            <LikeButton initialLikes={upload.likes} uploadId={upload.id} user={user} />
            
            
            {upload.likes && Array.isArray(upload.likes) && upload.likes.length > 0 && (
            <div className="flex justify-center mt-1">
              <span className="text-gray-600 font-mono text-sm">Liked by: </span>
              {upload.likes.map((like, index) => (
                <span key={index} className="text-blue-500 font-mono text-sm">
                  {like}
                  {index < upload.likes.length - 1 && <span className="text-gray-600">, </span>}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Audio Files</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          
        {audioFiles.map((audioFile) => (
  <div key={audioFile.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
    <audio src={audioFile.url} controls className="w-full"></audio>
    <p className="text-gray-600 bg-white text-center">{audioFile.tag}</p>
    <button onClick={() => processAudio(audioFile.url)}>Process Audio</button>

  </div>
))}

        </div>
      </div>
  </div>
  );
};

export default ProfilePage;
