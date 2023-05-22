import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { format } from 'date-fns';
import ReactAudioPlayer from 'react-audio-player';

const AudioFileList = () => {
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('audioFiles')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const audioFiles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAudioFiles(audioFiles);
        console.log('audioFiles', audioFiles);
      });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl text-blue-200 p-1 font-mono font-bold mb-1">Yaps:</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {audioFiles.map((file) => (
          <div key={file.id} className="mb-4 space-y-4  space-x-3 p-1">
            <div className="flex border-t-2 justify-between items-center">
              <div
                className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-10 h-10 rounded-full"
                style={{
                  backgroundImage: `url(${file.photo})`,
                }}
              ></div>
              <p className="text-gray-600 text-xs bg-slate-50 font-mono shadow-md rounded-full max-w-fit p-2">
                {file.username}
              </p>
            </div>
            <ReactAudioPlayer
              src={file.url}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioFileList;
