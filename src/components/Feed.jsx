import React, { useState, useEffect } from 'react';
import { storageRef } from '../../firebase';

const Feed = () => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    // Retrieve the list of recorded files from Firebase Storage
    const fetchRecordings = async () => {
      try {
        const listResult = await storageRef.child('recordings').listAll();
        const items = await Promise.all(listResult.items.map(item => item.getMetadata()));
        setRecordings(items);
      } catch (error) {
        console.error('Error retrieving recordings:', error);
      }
    };

    fetchRecordings();
  }, []);

  const handleFileClick = (fileUrl) => {
    // Play the audio file with the provided URL
    // You can implement your audio player logic here
    console.log('Playing file:', fileUrl);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Recordings Feed</h1>
      {recordings.length === 0 ? (
        <p>No recordings available.</p>
      ) : (
        <ul>
          {recordings.map((recording, index) => (
            <li key={index}>
              <button onClick={() => handleFileClick(recording.downloadURLs[0])}>
                {recording.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feed;
