import React, { useContext, useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { format } from 'date-fns';
import ReactAudioPlayer from 'react-audio-player';
import { v4 as uuid } from 'uuid';
import ReplyComponent from './ReplyComponent';

const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [tag, setTag] = useState('');
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [showReply, setShowReply] = useState(false);
  const [replyRecordingId, setReplyRecordingId] = useState('');
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlaying , setAudioPlaying] = useState(false);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser(user.uid);
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
    setIsPlaying(true);
    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      const chunks = [];
      audioRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });
      audioRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const recordingId = uuid(); // Generate unique ID using uuid()
        setAudioRecording({ id: recordingId, blob });
      });
      audioRecorder.start();
    }
  };
  

  const handleStopRecording = () => {
    
    setIsRecording(false);
    setIsPlaying(false);
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

  const handleReplyButtonClick = (recordingId) => {
    setShowReply(true);
    setReplyRecordingId(recordingId);
  };

  const handleSave = async (recording, tag, user) => {
    if (user && user.username && user.photoURL && recording && tag) {
      const filename = `${replyRecordingId}.wav`;
      const username = user.username;
      const photo = user.photoURL;
      const uid = currentUser.uid;
  
      try {
        const audioFileRef = storageRef.child(`audio/${username}/${filename}`);
        await audioFileRef.put(recording.blob);
  
        const audioFileUrl = await audioFileRef.getDownloadURL();
  
        const audioFileDoc = db.collection('audioFiles').doc();
        const docId = audioFileDoc.id;
        await audioFileDoc.set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          photoURL: photo,
          username: username,
          uid: uid,
          tag: tag,
          url: audioFileUrl,
          replyTo: replyRecordingId,
        });
  
        setTag('');
        handleReplyButtonClick(''); // Call the handleReplyButtonClick function with an empty string
      } catch (error) {
        console.error('Error saving audio file:', error);
      }
    } else {
      console.log('Missing user, audio recording, or tag');
    }
  };
  
  
  

  const fetchReplies = async (audioFileId) => {
    try {
      const repliesSnapshot = await firestore
        .collection('audioReplies')
        .where('parentPostId', '==', audioFileId)
        .orderBy('createdAt', 'asc')
        .get();

      const repliesData = repliesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return repliesData;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAudioFilesAndReplies = async () => {
      try {
        const audioFilesSnapshot = await firestore
          .collection('audioFiles')
          .orderBy('createdAt', 'desc')
          .get();

        const audioFilesData = audioFilesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const audioFilesWithReplies = await Promise.all(
          audioFilesData.map(async (audioFile) => {
            const repliesData = await fetchReplies(audioFile.id);
            return { ...audioFile, replies: repliesData };
          })
        );

        setAudioFiles(audioFilesWithReplies);
        console.log('audioFilesWithReplies', audioFilesWithReplies);
      } catch (error) {
        console.error('Error fetching audio files and replies:', error);
      }
    };

    fetchAudioFilesAndReplies();
  }, []);

  const handlePlayAudio = (url) => {
    setAudioPlaying(true);
   
    const audioPlayer = new Audio(url);
    audioPlayer.play();
  };



  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      {currentUser && user && user.username && user.photo && (
        <h3 className="text-lg font-semibold mb-2">Logged in as: {user.username}</h3>
      )}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-2">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-2">
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none ${isPlaying ? 'animate-pulse' : ''}`}
            onClick={handleStartRecording}
          >
            Talk
          </button>
          <button
            className="bg-rose-500 hover:bg-rose-600 text-black py-2 px-4 rounded focus:outline-none"
            onClick={handleStopRecording}
          >
            Stop
          </button>
          <button
            className="bg-black hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handlePlayback}
          >
            Listen
          </button>
        </div>
        <div className="flex flex-col md:flex-row lg:flex-row md:space-x-3 lg:space-x-4 items-center">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="tag (max 10 characters)"
            className="px-2 py-1 border rounded focus:outline-none"
            maxLength={10}
          />
          <button
            className="bg-slate-200 mt-2 hover:bg-rose-600 text-black py-2 px-4 rounded focus:outline-none"
            onClick={() => handleSave(audioRecording, tag, user)}
          >
            Save
          </button>
        </div>
      </div>
  
      {audioRecording && (
        <audio ref={audioPlayerRef} src={URL.createObjectURL(audioRecording.blob)} />
      )}
  
      <div className="container mx-auto mt-8">
        <h2 className="text-2xl text-blue-200 p-1 font-mono font-bold mb-1">Yaps:</h2>
        
        <div className="space-y-4">
          {audioFiles.map((file) => (
            <div key={file.id} className="bg-whitesmoke space-y-2 border-t border-black space-x-3 p-1">
              <div className="flex border-t-3 border-y-slate-950 justify-between items-center bg-white">
                <div
                  className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-20 h-10 rounded-sm"
                  style={{
                    backgroundImage: `url(${file.photoURL})`,
                  }}
                ></div>
                <p className="text-gray-600 text-xs bg-slate-50 font-mono shadow-md rounded-full max-w-fit p-2">
                  {file.username}
                </p>
              </div>
              <div
                className={`w-full bg-white p-4  rounded-md shadow-sm outline-none cursor-pointer ${audioPlaying ? 'animation-pulse' : ''}`}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '4px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                }}
                onClick={() => handlePlayAudio(file.url)}
              >
                <div className="flex items-center justify-between">
                  <div>{file.username}</div>
                  <div>{file.tag}</div>
                </div>
              </div>
              {file.createdAt && (
                <p style={{ fontSize: '10px' }} className="text-gray-600 bg-whitesmoke font-mono text-xs p-1">
                  {format(file.createdAt.toDate(), 'MM·dd·yy - h:mm a')}
                </p>
              )}
              <div className='border lg:w-1/2 border-spacing-14' />
              <button
                className="bg-blue-200 hover:bg-blue-400 text-white py-1 px-2 rounded focus:outline-none mt-2"
                onClick={() => handleReplyButtonClick(file.id)}
              >
                Reply
              </button>
              {showReply && file.id === replyRecordingId && (
                <ReplyComponent
                  recordingId={replyRecordingId}
                  handleReplyButtonClick={handleReplyButtonClick}
                  fetchReplies={fetchReplies}
                />
              )}
           
  
              <h1 className='font-mono text-xs text-indigo-200 text-bold'>replies</h1>
              <div>
              {file.replies &&
    file.replies.map((reply) => (
      <div
        key={reply.id}
        className="mt-4 relative bg-slate-50 p-4 rounded-md shadow-md cursor-pointer"
        onClick={() => handlePlayAudio(reply.url)}
      >
        <div className="relative">
          <div className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-10 h-10 rounded-full" style={{ backgroundImage: `url(${reply.photo})` }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {reply.tag && <div className="bg-gray-200 text-gray-800 py-1 px-2 rounded">{reply.tag}</div>}
          </div>
        </div>
        <p className="text-gray-600 text-xs font-mono mt-1">{format(reply.createdAt.toDate(), 'MM·dd·yy - h:mm a')}</p>
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <a href={`/profile/${reply.username}`} className="bg-blue-500 text-white px-2 py-1 rounded font-medium">{reply.username}</a>
        </div>
      </div>
    ))}
            </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default Chat;
