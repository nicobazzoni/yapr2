import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path



const Feed = ({}) => {
  const [uploads, setUploads] = useState([]);
  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    db.collection('uploads')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const newUploads = snapshot.docs.map(doc => ({
          id: doc.id,
          upload: doc.data()
        })).filter(upload => !!upload.upload.timestamp);
        console.log(newUploads); // Log uploads to console
        setUploads(newUploads);
       
      });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {uploads.map(({ id, upload }) => (
        <div key={id} className="p-4 m-2 bg-white shadow-md rounded">
          <div className='flex justify-between'>
          <h1 className="text-xs font-bold font-mono text-blue-200">{upload.username}</h1>
          <img src={upload.photoUrl}  alt={upload.tag}  className="h-5 w-5 ml-40 border rounded-full " />
          </div> 
          
          <h2 className="text-xl font-mono">{upload.tag} </h2>
          <p className="mt-2 mb-4">{upload.message}</p>
          <img src={upload.imageUrl} alt={upload.tag} className="w-full object-cover rounded" />
          <p className="text-xs text-gray-500 mt-2">{format(upload.timestamp.toDate(), 'MM/dd/yyyy')}</p>


        </div>
      ))}
    </div>
  );
};

export default Feed;
