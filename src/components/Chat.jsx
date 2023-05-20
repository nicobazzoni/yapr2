import React, { useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp, storage } from '../../firebase';

const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);

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
