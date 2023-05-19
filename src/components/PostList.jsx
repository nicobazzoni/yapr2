import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path
import {BsDot} from 'react-icons/bs';



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
        <div key={id} className="flex flex-col p-4 m-2 bg-white shadow-md rounded">
          <div className='flex justify-between'>
            <img src={upload.photoUrl}  alt={upload.tag}  className="h-5 w-5  border rounded-full " />
            <h1 className="text-xs font-bold font-mono text-blue-200">{upload.username}</h1>
          </div> 
          
          <p className="mt-2 mb-4 font-mono tracking-wide">{upload.message}</p>
          <img src={upload.imageUrl} alt={upload.tag} className="w-full object-cover rounded " />
          
          <div className='flex justify-between mt-auto'>
            <p className="text-xs text-blue-300  "style={{ fontSize: '8px' }}>{format(upload.timestamp.toDate(), 'MM·dd·yy - h:mm')}</p>
    
            <h2 className="text-xs font-mono">{upload.tag} </h2>
          </div>
        </div>
      ))}
    </div>
  );

};

export default Feed;
