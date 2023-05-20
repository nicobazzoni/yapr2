import React, { useState } from 'react';
import { firestore } from '../../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { SlLike } from 'react-icons/sl'

const LikeButton = ({ itemId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    try {
      const itemRef = firestore.collection('items').doc(itemId);
      await itemRef.update({
        likes: firebase.firestore.FieldValue.increment(1)
      });
      setLikes((prevLikes) => prevLikes + 1);
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };

  return (
    <div>
      <SlLike size={12}  onClick={handleLike}>Like</SlLike>
      <span>{likes}</span>
    </div>
  );
};

export default LikeButton;
