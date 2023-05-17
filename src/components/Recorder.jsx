import React, { useState, useEffect } from 'react';
import { storageRef, auth,firestore, } from '../../firebase';

const Recorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaStream(stream);
        setMediaRecorder(recorder);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
      initializeRecorder();
    } else {
      console.log('getUserMedia or MediaRecorder API is not supported in this browser');
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.start();
      console.log('Recorder started');
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.removeEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.stop();
      console.log('Recorder stopped');
      setRecording(false);
    }
  };

  const handleDataAvailable = (event) => {
    const chunks = [];
    chunks.push(event.data);

    const blob = new Blob(chunks, { type: 'audio/webm' });
    setRecordedBlob(blob);
  };
  const handleSave = async () => {
    if (recordedBlob && user) {
      try {
        const userStorageRef = storageRef.child(`users/${user.uid}/audio.webm`);
        await userStorageRef.put(recordedBlob);
        const downloadURL = await userStorageRef.getDownloadURL();
  
        // Perform any additional actions with the downloadURL here
  
        console.log('Recording saved:', downloadURL);
  
        // Save the downloadURL to Firestore
        const userDocRef = firestore.collection('users').doc(user.uid);
        await userDocRef.update({ audioURL: downloadURL });
  
        setAudioURL(downloadURL);
      } catch (error) {
        console.error('Error saving recording to Firestore:', error);
      }
    }
  };
  
  
  
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Voice Recorder</h1>
      <div className="mb-4">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${recording ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={startRecording}
          disabled={recording}
        >
          Start Recording
        </button>
        <button
          className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 ${!recording ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={stopRecording}
          disabled={!recording}
        >
          Stop Recording
        </button>
        {recordedBlob && !audioURL && (
          <div>
            <audio className="mt-4" src={URL.createObjectURL(recordedBlob)} controls />
          </div>
        )}
        {audioURL && (
          <div>
            <audio className="mt-4" src={audioURL} controls />
          </div>
        )}
        {recordedBlob && !audioURL && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={handleSave}
          >
            Save Recording
          </button>
        )}
      </div>
    </div>
  );
        }  

export default Recorder;
         

       

