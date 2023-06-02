// FormComponent.js
import { firestore } from '../../firebase';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const FormComponent = ({ onSubmit }) => {
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState('');


  const { currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Update the user object fields in Firestore
      const userRef = firestore.collection('users').doc(currentUser.uid);
      await userRef.update({
        bio: bio,
        mood: mood
      });
  
      // Pass the bio and mood values to the onSubmit prop function
      onSubmit({ bio, mood });
  
      // Reset the form fields
      setBio('');
      setMood('');
    } catch (error) {
      console.error('Error updating user data:', error);
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
      <button type="submit">Save</button>
    </form>
  );
};

export default FormComponent;
