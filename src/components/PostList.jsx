import React, { useState, useEffect, useContext } from 'react';
import { db, auth, firestore } from '../../firebase';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { BsDot } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import {RiReplyLine} from 'react-icons/ri';
import LikeButton from './LikeButton';
import { is } from 'date-fns/locale';






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
        setUser({ id: userSnapshot.id, uid: userId, ...userData }); // Include the UID in the user object
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    db.collection('uploads')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const newUploads = snapshot.docs.map((doc) => ({
          id: doc.id,
          upload: doc.data(),
          uid: doc.data().uid,
        }));

        // Fetch user data for all uploads
        Promise.all(
          newUploads.map((upload) =>
            firestore
              .collection('users')
              .doc(upload.uid)
              .get()
              .then((userSnapshot) => {
                if (userSnapshot.exists) {
                  const userData = userSnapshot.data();
                  upload.upload.username = userData.username; // Update the upload object with the username field
                }
              })
              .catch((error) => {
                console.error('Error fetching user data:', error);
              })
          )
        ).then(() => {
          setUploads(newUploads); // Set the updated uploads state
        });
      });
  }, []);

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
        {uploads.map(({ id, upload, uid }) => {
          const isCurrentUser = currentUser && uid === currentUser.uid; // Makes username hidden for the user who made the item

          return (
            <div key={id} className="flex flex-col p-4 m-2 bg-white border-t shadow-md rounded relative">
              <div className="flex  justify-between">

              {!isCurrentUser && upload.username !== currentUser.username && (
                <Link className="font-mono text-sm text-blue-400" to={`/details/${id}`}>
                  <RiReplyLine className="text-blue-400 animate-pulse duration-300" />
                </Link>

              )}
                {!isCurrentUser && upload.username !== currentUser.username && (
                  <Link to={`/profile/${upload.username}`}>
                    <h1 className="text-xs font-bold font-mono p-0.5  bg-blue-950 text-stone-200">{upload.username}</h1>
                  </Link>
                )}
              </div>
              <span className=" rounded p-1">
                <h2  className="rounded-md  font-mono p-0.5 bg-slate-100 inline-block"  style={{ fontSize: '11px' }}>
                  {upload.tag}
                </h2>
              </span>


              <p className="mt-2 mb-4 font-mono tracking-wide">{upload.message}</p>
              
              <img src={upload.imageUrl} alt={upload.tag} className="w-full mb-2 object-cover rounded max-w-full max-h-96" />

              <div className="flex justify-between items-center absolute bottom-0 p-1 left-0 right-0 mr-1 ml-1">
                
                {upload.timestamp && (
                  <p className="text-xs text-blue-300 font-mono" style={{ fontSize: '7px' }}>
                    {format(upload.timestamp.toDate(), 'MM·dd·yy - h:mm')}
                  </p>
                )} 
                {!isCurrentUser && upload.username !== currentUser.username && (

                <LikeButton  initialLikes={upload.likes}  uploadId={id} user={user} />

                )}

                {isCurrentUser && (

              

                <button
                  className="font-mono text-blue-300 text-xs"
                  onClick={() => handleDelete(id, upload.uid, upload.username)}
                >
                  x
                </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;