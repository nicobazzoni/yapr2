// VoiceReply.jsx
import React, { useState, useRef } from 'react';

const VoiceReply = ({ file, username }) => {
  const [isReplyRecording, setIsReplyRecording] = useState(false);
  const [replyAudioRecording, setReplyAudioRecording] = useState(null);
  const [replyRecordingUrl, setReplyRecordingUrl] = useState('');
  const audioRecorderRef = useRef(null);

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
    if (username && replyAudioRecording) {
      try {
        const audioFileRef = storageRef.child(`audio/${replyAudioRecording.name}`);
        await audioFileRef.put(replyAudioRecording);
        const audioFileUrl = await audioFileRef.getDownloadURL();

        // Save the reply audio file using the username
        await db.collection('audioFiles').add({
          url: audioFileUrl,
          username: username,
          createdAt: timestamp(),
          replyTo: file.id,
        });

        console.log('Reply audio file saved successfully!');
      } catch (error) {
        console.error('Error saving reply audio file:', error);
      }
    } else {
      console.log('Username or reply audio recording is missing.');
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
