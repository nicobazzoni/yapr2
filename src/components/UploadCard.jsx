import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../../firebase';

const UploadCard = ({ id, upload }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').doc(upload.uid);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          setUser({ id: userSnapshot.id, ...userData });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [upload.uid]);

  return (
    <div key={id} className="flex flex-col p-4 m-2 bg-white shadow-md rounded relative">
      <div className="flex justify-between">
        <Link className="fonto-mono text-sm text-blue-400" to={`/details/${id}`}>
          <RiReplyLine className="text-blue-400 animate-pulse duration-300" />
        </Link>
        {user && (
          <Link to={`/profile/${upload.uid}`}>
            <h1 className="text-xs font-bold font-mono p-1 bg-blue-950 text-stone-200">
              {user.username}
            </h1>
          </Link>
        )}
      </div>

      <p className="mt-2 mb-4 font-mono tracking-wide">{upload.message}</p>
      <img src={upload.imageUrl} alt={upload.tag} className="w-full mb-2 object-cover rounded" />

      <div className="flex justify-between items-center absolute bottom-0 left-0 right-0 mr-1 ml-1">
        <p className="text-xs text-blue-300 font-mono" style={{ fontSize: '7px' }}>
          {format(upload.timestamp.toDate(), 'MM·dd·yy - h:mm')}
        </p>

        <h2 className="font-mono mr-16" style={{ fontSize: '9px' }}>
          {upload.tag}
        </h2>

        <button
          className="font-mono text-blue-300 text-xs"
          onClick={() => handleDelete(id, upload.uid, upload.username)}
        >
          x
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
