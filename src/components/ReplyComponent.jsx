import React, { useState, useRef, useEffect } from 'react';
import { storageRef, db, timestamp, auth, firestore } from '../../firebase';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';

const ReplyComponent = ({ recordingId,  }) => {
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [tag, setTag] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const replyId = uuid()

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser(user.uid);
        console.log('user', user.uid);
        console.log(currentUser.username);
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
        console.log('User Data:', userData);
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks = [];
        mediaRecorder.addEventListener('dataavailable', (event) => {
          chunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioRecording({ id: replyId, blob });
          audioPlayerRef.current.src = URL.createObjectURL(blob);
          audioPlayerRef.current.play();
        });

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  };

  const handleStopRecording = () => {
    setIsRecording(false);

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const handleSave = async () => {
    console.log('user:', user);
  
    if (user && user.username && audioRecording && tag) {
      const filename = `${replyId}.wav`;
      const username = user.username;
      const photo = user.photoURL || '';
      const uid = currentUser.uid;
  
      console.log('username:', username);
      console.log('photo:', photo);
      try {
        const audioFileRef = storageRef.child(`audio/${username}/${filename}`);
        await audioFileRef.put(audioRecording.blob);
  
        const audioFileUrl = await audioFileRef.getDownloadURL();
  
        const replyDoc = db.collection('audioReplies').doc(replyId);
        await replyDoc.set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          username: username,
          uid: uid,
          tag: tag,
          url: audioFileUrl,
          parentPostId: recordingId,
          isReply: true,
          photo: photo,
        });
  
        console.log('Audio reply saved:', replyId);
        setTag('');
  
        // Show a success toast message
        toast.success('Reply submitted successfully!');
  
        // Call the handleReplySubmit function in the parent component to refresh the replies
        handleReplySubmit();
      } catch (error) {
        console.error('Error saving audio file:', error);
        // Show an error toast message
        toast.error('Error saving reply. Please try again.');
      }
    } else {
      console.log('Missing user, audio recording, or tag');
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Reply</h2>
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handleStartRecording}
        >
          Talk
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handleStopRecording}
        >
          Stop
        </button>
      </div>
      <audio ref={audioPlayerRef} autoPlay controls />
      <div className="flex items-center">
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Enter a tag (max 10 characters)"
          className="px-2 py-1 border rounded focus:outline-none"
          maxLength={10}
        />
        <button
          className="bg-yellow-300 hover:bg-rose-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ReplyComponent;
