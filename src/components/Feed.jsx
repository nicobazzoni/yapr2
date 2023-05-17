import React, { useEffect } from 'react';
import { storageRef } from '../../firebase';

const Feed = () => {
  
  
    useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const usersFolderRef = storageRef.ref('users');
        const usersFolderSnapshot = await usersFolderRef.listAll();
        const audioFiles = [];

        for (const userRef of usersFolderSnapshot.items) {
          const userAudioFilesSnapshot = await userRef.listAll();

          for (const audioFileRef of userAudioFilesSnapshot.items) {
            const audioFileUrl = await audioFileRef.getDownloadURL();
            audioFiles.push({ url: audioFileUrl, fileName: audioFileRef.name });
          }
        }

        console.log('Audio files:', audioFiles);
        // Perform further operations with the fetched audio files
      } catch (error) {
        console.error('Error fetching audio files:', error);
      }
    };

    fetchAudioFiles();
  }, []);

  return (
    <div>
      <h1>Recordings Timeline</h1>
      <ul>
        {audioFiles.map((audioFile, index) => (
          <li key={index}>
            <audio src={audioFile.url} controls />
            <span>{audioFile.fileName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;

