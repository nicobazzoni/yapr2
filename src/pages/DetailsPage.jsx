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
    <div>
      <h1>Upload Details</h1>
      <img src={upload.imageUrl} alt={upload.tag} className="w-full object-cover rounded" />
      <p>{upload.username}</p>
      <p>{upload.message}</p>

      <div>
        <h2>Replies</h2>
        <ReplyForm itemId={itemId} />
        
    </div>
    </div>

  );
};

export default DetailsPage;
