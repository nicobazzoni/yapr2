import React, { useContext, useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';
import AudioFileList from './AudioFileList';
import firebase from 'firebase/compat/app';
const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser(user.uid);
        
        console.log('user', user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUser = async (userId) => {
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

  useEffect(() => {
    // Get access to the device microphone for audio recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const audioRecorder = new MediaRecorder(stream);
        audioRecorderRef.current = audioRecorder;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    // Clean up the audio recorder when the component unmounts
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      const chunks = [];
      audioRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });
      audioRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioRecording(blob);
      });
      audioRecorder.start();
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      audioRecorder.stop();
    }
  };

  const handlePlayback = () => {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      audioPlayer.play();
    }
  };

  const handleSave = async () => {
    if (user && user.username) {
      const username = user.username;
      const photo = user.photoURL;
      console.log('Saving audio file...', username);
  
      try {
        const audioFileRef = storageRef.child(`audio/${audioRecording.name}`);
        await audioFileRef.put(audioRecording);
        const audioFileUrl = await audioFileRef.getDownloadURL();
        console.log('Audio file URL:', audioFileUrl);
        const audioFileDoc = db.collection('audioFiles').doc();
        await audioFileDoc.set({
          url: audioFileUrl,
          username: username,
          photo: photo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Audio file document saved!');
      } catch (error) {
        console.error('Error saving audio file:', error);
      }
    } else {
      console.log('User not logged in or username not available.');
    }
  };
  

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      {currentUser && user && user.username && user.photo && (
        <h3 className="text-lg font-semibold mb-2">Logged in as: {user.username}</h3>
      )}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handleStartRecording}
          >
            talk
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handleStopRecording}
          >
            stop
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handlePlayback}
          >
            listen
          </button>
          <button
            className="bg-yellow-300 hover:bg-rose-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        {audioRecording && (
          <audio
            ref={audioPlayerRef}
            src={URL.createObjectURL(audioRecording)}
            controls
          />
        )}
      </div>
      <AudioFileList />
    </div>
  );
};

export default Chat;








