import React, { useState, useRef, useEffect } from 'react';
import { storageRef, db, timestamp, auth, firestore } from '../../firebase';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ReplyComponent = ({ recordingId, handleReplyButtonClick, fetchReplies }) => {
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [tag, setTag] = useState('');
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
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
          setAudioRecording({ id: recordingId, blob });
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
    if (user && user.username && audioRecording && tag) {
      const filename = `${uuid()}.m4a`;
      const username = user.username;
      const photo = user.photoURL || '';
      const uid = currentUser.uid;
  
      try {
        const audioFileRef = storageRef.child(`audio/${username}/${filename}`);
        await audioFileRef.put(audioRecording.blob, { contentType: 'audio/mp4' });
        const audioFileUrl = await audioFileRef.getDownloadURL();
  
        const replyDoc = db.collection('audioReplies').doc();
        const replyId = replyDoc.id;
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
  
        toast.success('Reply saved successfully!');
        setTag('');
        handleReplyButtonClick('');
  
        // Fetch the updated replies for the parent post using fetchReplies and recordingId
        const updatedReplies = await fetchReplies(recordingId);
        // Handle the updated replies as needed
  
        // Additional actions or logic after saving the reply
      } catch (error) {
        console.error('Error saving audio file:', error);
        toast.error('Error saving audio file');
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
        className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none ${
          isRecording ? 'animate-pulse' : ''
        }`}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        {isRecording ? 'Stop' : 'Talk'}
      </button>
    </div>
    <audio ref={audioPlayerRef} autoPlay />
    <div className="flex items-center">
      <input
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Name your reply"
        className="px-2 py-1 border rounded focus:outline-none"
        maxLength={50}
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
