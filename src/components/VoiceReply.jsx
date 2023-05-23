// VoiceReply.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { firestore, storageRef, timestamp, auth } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';


const VoiceReply = ({ file, username }) => {
  const [isReplyRecording, setIsReplyRecording] = useState(false);
  const [replyAudioRecording, setReplyAudioRecording] = useState(null);
  const [replyRecordingUrl, setReplyRecordingUrl] = useState('');
  const audioRecorderRef = useRef(null);
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(AuthContext);


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
  

  const handleStartReplyRecording = () => {
    setIsReplyRecording(true);
    setReplyAudioRecording(null);

    const chunks = [];
    const audioRecorder = new MediaRecorder(stream);

    audioRecorder.addEventListener('dataavailable', (event) => {
      chunks.push(event.data);
    });

    audioRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      setReplyAudioRecording(blob);
      setReplyRecordingUrl(URL.createObjectURL(blob));
    });

    audioRecorder.start();
  };

  const handleStopReplyRecording = () => {
    setIsReplyRecording(false);

    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      audioRecorder.stop();
    }
  };

  const handleSaveReply = async () => {
    if (currentUser && currentUser.username && replyAudioRecording) {
      const { username, photoURL } = currentUser;
      const replyToId = file.id; // Get the ID of the original audio file
  
      try {
        const audioFileRef = storageRef.child(`audio/${replyAudioRecording.name}`);
        await audioFileRef.put(replyAudioRecording);
        const audioFileUrl = await audioFileRef.getDownloadURL();
  
        // Save the reply audio file using the username, user photo, and replyTo ID
        await firestore.collection('audioFiles').add({
          url: audioFileUrl,
          username: username,
          photo: photoURL,
          createdAt: timestamp(),
          replyTo: replyToId, // Set the replyTo field with the original audio file ID
        });
  
        console.log('Reply audio file saved successfully!');
      } catch (error) {
        console.error('Error saving reply audio file:', error);
      }
    } else {
      console.log('User information or reply audio recording is missing.');
    }
  };
  

  return (
    <div>
      {/* Render audio file details */}
      <p>Username: {file.username}</p>
      <audio src={file.url} controls />

      {/* Render reply recording UI */}
      {isReplyRecording ? (
        <div>
          <p>Recording...</p>
          <button onClick={handleStopReplyRecording}>Stop</button>
          <button onClick={handleSaveReply}>Save</button>
        </div>
      ) : (
        <button onClick={handleStartReplyRecording}>Reply</button>
      )}

      {/* Render the reply playback */}
      {replyRecordingUrl && (
        <div>
          <p>Reply Playback:</p>
          <audio src={replyRecordingUrl} controls />
        </div>
      )}
    </div>
  );
};

export default VoiceReply;
