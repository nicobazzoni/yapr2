import React, { useState } from 'react';
import { useRef } from 'react';
import yicon from '../assets/yicon.jpg';
import { auth, firestore } from '../../firebase';
import { useNavigate} from 'react-router-dom';

const SignUp = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState(null); // New state for photo URL
  const [error, setError] = useState(null);

const navigation = useNavigate()

const handleSignUp = async () => {
  try {
    if (!email || !password || !username || !photoURL) {
      setError('Please fill in all required fields');
      return;
    }

    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    if (user) {
      await firestore.collection('users').doc(user.uid).set({
        email,
        username,
        photoURL,
        likes: [],
        followers: [],
        following: [],
        bio: null,
        mood: null,
      });
      navigation('/');
    }
  } catch (error) {
    setError('Error signing up. Please try again later.');
    console.error('Error signing up:', error);
  }
};



const handlePhotoUpload = (event) => {
  const file = event.target.files[0];

  // Check if file size exceeds the limit (e.g., 2MB)
  const fileSizeLimit = 5 * 1024 * 1024; // 5MB in bytes

  if (file.size > fileSizeLimit) {
    // Display an error message or take appropriate action
    console.log('File size exceeds the limit');
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    setPhotoURL(event.target.result); // Set the photo URL in state
  };

  reader.readAsDataURL(file);
};


  return (
    <div className="container mx-auto text-center">
      <img src={yicon} className="mb-4" alt="Logo" />
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoCapitalize="none"
      />
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoCapitalize="none"
      />
      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      {photoURL && <img src={photoURL} alt="Profile" className=" rounded-full mt-4" />}
      <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSignUp}>
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default SignUp;
