import React, { useContext, useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp, storage } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';

const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  
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
    const username = currentUser.username;
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
            createdAt: timestamp(),
        });
        console.log('Audio file document saved!');
    } catch (error) {
        console.error('Error saving audio file:', error);
    }
};



  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handleStartRecording}
        >
          Start Recording
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handleStopRecording}
        >
          Stop Recording
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
          onClick={handlePlayback}
        >
          Playback
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
          className="mt-4"
          controls
        />
      )}
    </div>
  );
};

export default Chat;
