import { firestore } from '../../firebase';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormComponent = ({ onSubmit }) => {
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update the user object fields in Firestore
      const userRef = firestore.collection('users').doc(currentUser.uid);
      await userRef.set({
        bio: bio,
        mood: mood
      }, { merge: true });

      // Pass the bio and mood values to the onSubmit prop function
      onSubmit({ bio, mood });

      // Reset the form fields
      setBio('');
      setMood('');

      // Show success toast message
      toast.success('User data updated successfully!', {
        position: toast.POSITION.TOP_RIGHT
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      // Show error toast message
      toast.error('Error updating user data. Please try again.', {
        position: toast.POSITION.TOP_RIGHT
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='items-center'>
      <div className='font-mono flex-items'>
        <label className='mb-5 flex justify-center' htmlFor="bio">Bio:</label>
        <textarea
          className='border-2 border-black outline-none p-2'
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>
      <div className='font-mono flex-items'>
        <label className='mb-5 flex justify-center' htmlFor="mood">Mood:</label>
        <input
          type="text"
          id="mood"
          className='border-2 border-black outline-none p-2'
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
      </div>
      <button className='border rounded-full p-2 mt-3 font-mono' type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
  

export default FormComponent;
