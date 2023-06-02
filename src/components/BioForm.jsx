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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label htmlFor="mood">Mood:</label>
        <input
          type="text"
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default FormComponent;
