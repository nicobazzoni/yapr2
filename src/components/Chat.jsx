import React, { useContext, useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { format } from 'date-fns';
import ReactAudioPlayer from 'react-audio-player';
import { v4 as uuid } from 'uuid';

const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [tag, setTag] = useState(''); // State for the tag input field

  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);

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
        console.log('User Data:', userData);
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioRecorder = new MediaRecorder(stream);
        audioRecorderRef.current = audioRecorder;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

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
        const recordingId = uuid(); // Generate a random ID for the recording
        setAudioRecording({ id: recordingId, blob });
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

  const handleSave = async (audioRecording, tag, user) => {
    if (user && user.username && user.photoURL) {
      console.log('Saving audio file...');
      const recordingId = audioRecording.id;
      const filename = `${recordingId}.wav`; // Use the recording ID in the filename
      const username = user.username;
      const photo = user.photoURL;
      const uid = currentUser.uid;

      try {
        console.log('Uploading audio file...');
        const audioFileRef = storageRef.child(`audio/${user.username}/${filename}`);
        await audioFileRef.put(audioRecording.blob);
        console.log('Audio file uploaded successfully.');

        console.log('Getting audio file URL...');
        const audioFileUrl = await audioFileRef.getDownloadURL();
        console.log('Audio file URL:', audioFileUrl);

        console.log('Saving audio file document...');
        const audioFileDoc = db.collection('audioFiles').doc(); // Generate a new document ID
        const docId = audioFileDoc.id; // Get the generated ID
        await audioFileDoc.set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          photoURL: photo,
          username: username,
          uid: uid,
          tag: tag, // Save the tag with the audio file
          url: audioFileUrl,
        });
        console.log('Audio file document saved!');

        console.log('Resetting tag input field...');
        setTag('');
      } catch (error) {
        console.error('Error saving audio file:', error);
      }
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
            Talk
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handleStopRecording}
          >
            Stop
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handlePlayback}
          >
            Listen
          </button>
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
              onClick={() => handleSave(audioRecording, tag, user)}
            >
              Save
            </button>
          </div>
        </div>
        {audioRecording && (
          <audio ref={audioPlayerRef} src={URL.createObjectURL(audioRecording.blob)} />
        )}
      </div>
      <div className="container mx-auto mt-8">
        <h2 className="text-2xl text-blue-200 p-1 font-mono font-bold mb-1">Yaps:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {audioFiles.map((file) => (
            <div key={file.id} className="mb-4 space-y-4 space-x-3 p-1">
              <div className="flex border-t-2 justify-between items-center">
                <div
                  className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-10 h-10 rounded-full"
                  style={{
                    backgroundImage: `url(${file.photoURL})`,
                  }}
                ></div>
                <p className="text-gray-600 text-xs bg-slate-50 font-mono shadow-md rounded-full max-w-fit p-2">
                  {file.username}
                </p>
              </div>
              <ReactAudioPlayer
                src={file.url}
                key={file.id}
                className="mb-2"
                controls
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                }}
              />
              {file.createdAt && (
                <p className="text-gray-600 bg-whitesmoke font-mono text-xs p-1">
                  {format(file.createdAt.toDate(), 'MM·dd·yy - h:mm')}
                </p>
              )}
              {file.tag && (
                <p className="text-gray-600 bg-whitesmoke font-mono text-xs p-1">
                  Tag: {file.tag}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
