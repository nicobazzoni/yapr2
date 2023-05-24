import React, { useState, useEffect, useContext } from 'react';
import { firestore } from '../../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FaHeart } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const LikeButton = ({ uploadId, initialLikes }) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const checkUserLikeStatus = async () => {
      try {
        const userId = currentUser?.uid;
        const likesRef = firestore
          .collection('uploads')
          .doc(uploadId)
          .collection('likes');
        const userLikeDoc = await likesRef.doc(userId).get();
        const userLiked = userLikeDoc.exists;

        setIsLiked(userLiked);
      } catch (error) {
        console.error('Error checking user like status:', error);
      }
    };

    checkUserLikeStatus();
  }, [currentUser, uploadId]);

  const handleLike = async () => {
    try {
      const userId = currentUser?.uid;
      const likesRef = firestore
        .collection('uploads')
        .doc(uploadId)
        .collection('likes');

      if (isLiked) {
        // If already liked, remove the like
        await likesRef.doc(userId).delete();
        setLikes((prevLikes) => prevLikes - 1);
        setIsLiked(false);
      } else {
        // If not liked, add the like
        await likesRef.doc(userId).set({});
        setLikes((prevLikes) => prevLikes + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };

  return (
    <div className="flex items-center">
      <FaHeart
        size={15}
        className={`cursor-pointer transition-colors duration-300 ${
          isLiked ? 'text-rose-200' : 'text-gray-400'
        }`}
        onClick={handleLike}
      />
      <span style={{ fontSize: 10}} className="ml-2 text-sm">{likes}</span>
    </div>
  );
};

export default LikeButton;
