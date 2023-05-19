import React, { useState, useEffect, useContext } from 'react';
import { db, auth, firestore } from '../../firebase';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { BsDot } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Feed = ({}) => {
  const [uploads, setUploads] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.uid);
      console.log(currentUser.uid);
    } else {
      setUser(null);
    }
  }, [currentUser]);

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('User Data:', userData);
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    db.collection('uploads')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const newUploads = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            upload: doc.data(),
            uid: doc.data().uid,
          }))
          .filter((upload) => !!upload.upload.timestamp);
          
        console.log(newUploads);
          console.log('brodkis',newUploads[0].upload.uid);
        setUploads(newUploads);
      });
  }, [user]);
  const handleDelete = (id, uid, username) => {
    if (user && user.username === username) {
      db.collection('uploads')
        .doc(id)
        .delete()
        .then(() => {
          console.log('Document successfully deleted!');
          // show a success message
        })
        .catch((error) => {
          console.error('Error removing document: ', error);
          // handle the error
        });
    } else {
      console.log('You are not authorized to delete this document.');
      // handle the error
    }
  };
  
  
  

  return (
    <div>
      <h1 className="text-xs font-bold text-start font-mono text-blue-200">yaps</h1>
  
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {uploads.map(({ id, upload }) => (
          <div key={id} className="flex flex-col p-4 m-2 bg-white shadow-md rounded relative">
            <div className='flex justify-between'>
            <Link to={`/details/${id}`}>reply</Link>

              <img src={upload.photoUrl} alt={upload.tag} className="h-5 w-5 border rounded-full" />
              <h1 className="text-xs font-bold font-mono text-blue-200">{upload.username}</h1>
            </div>
  
            <p className="mt-2 mb-4 font-mono tracking-wide">{upload.message}</p>
            <img src={upload.imageUrl} alt={upload.tag} className="w-full mb-2 object-cover rounded" />
  
            <div className='flex justify-between items-center absolute bottom-0 left-0 right-0 mr-1 ml-1'>
              <p className="text-xs text-blue-300 font-mono" style={{ fontSize: '7px' }}>{format(upload.timestamp.toDate(), 'MM·dd·yy - h:mm')}</p>
  
              <h2 className="font-mono mr-16" style={{ fontSize: '9px' }}>{upload.tag}</h2>
  
              <button className='font-mono text-xs' onClick={() => handleDelete(id, upload.uid, upload.username)}>x</button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default Feed;