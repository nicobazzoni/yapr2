import React, { useState, useEffect, useContext } from 'react';
import { firestore } from '../../firebase';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ReplyForm from '../components/ReplyForm';

const DetailsPage = () => {
  const [upload, setUpload] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { itemId } = useParams();


  useEffect(() => {
    const fetchUploadDetails = async () => {
      try {
        const uploadRef = firestore.collection('uploads').doc(itemId);
        const uploadSnapshot = await uploadRef.get();

        if (uploadSnapshot.exists) {
          const uploadData = uploadSnapshot.data();
          console.log('Upload Data:', uploadData);
          setUpload({ id: uploadSnapshot.id, ...uploadData });
          
        } else {
          console.log('Upload does not exist');
        }
      } catch (error) {
        console.error('Error fetching upload details:', error);
      }
    };

    fetchUploadDetails();
  }, [itemId]);

  console.log('Upload:', upload);


  // Continue with the rest of your code here...

  if (!upload) {
    return <div>Loading...</div>; // Show a loading state while fetching upload details
  }

  return (
    <div className="py-8">
      <h1 className="text-sm font-mono text-indigo-300  font-semibold">{upload.tag}</h1>
      <div className="p-2 border border-slate-100 lg:max-w-96 rounded">
        <img src={upload.imageUrl} alt={upload.tag} className="w-full  object-cover rounded" />
        </div>
      <p className="mt-4 text-lg bg-slate-100  font-semibold">{upload.username}</p>
      <p className="text-gray-600 font-mono">{upload.message}</p>
      <p className='text-gray-600  text-sm font-mono'>{upload.likes} likes</p>
      
      
  
      <div className="mt-8">
      
        <ReplyForm itemId={itemId} />
      </div>
    </div>
  );
};

export default DetailsPage;
